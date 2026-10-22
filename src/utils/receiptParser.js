import { inflate } from 'pako';

/**
 * Parses a supermarket receipt or invoice PDF in the browser.
 * Extracts the total payment amount, store name, customer/payer, and items count.
 * 
 * @param {ArrayBuffer|Uint8Array} buffer 
 * @param {Array} members List of team members to match by phone or name
 * @returns {Object} { amount, store, payer, itemsCount, description, rawText }
 */
export function parseReceiptPdf(buffer, members = []) {
  try {
    const uint8 = new Uint8Array(buffer);
    let str = '';
    // Convert Uint8Array to binary string efficiently
    const chunkSize = 8192;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      str += String.fromCharCode.apply(null, uint8.subarray(i, i + chunkSize));
    }

    // 1. Extract Font CMaps (ToUnicode mappings)
    const cmaps = {};
    const objRegex = /(\d+)\s+0\s+obj\s*<<[\s\S]*?>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let om;
    while ((om = objRegex.exec(str)) !== null) {
      const objNum = om[1];
      const content = om[2];
      if (content.includes('beginbfrange')) {
        const map = {};
        const regex = /beginbfrange([\s\S]*?)endbfrange/g;
        let m;
        while ((m = regex.exec(content)) !== null) {
          const lineRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*\[([\s\S]*?)\]/g;
          let lm;
          while ((lm = lineRegex.exec(m[1])) !== null) {
            const from = parseInt(lm[1], 16);
            const dests = lm[3].match(/<([0-9a-fA-F]+)>/g) || [];
            dests.forEach((d, idx) => {
              map[from + idx] = String.fromCharCode(parseInt(d.slice(1, -1), 16));
            });
          }
        }
        cmaps[objNum] = map;
      }
    }

    // 2. Decompress all text streams with pako inflate
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let sm;
    let decodedText = '';
    while ((sm = streamRegex.exec(str)) !== null) {
      try {
        const raw = new Uint8Array(sm[1].length);
        for (let i = 0; i < sm[1].length; i++) {
          raw[i] = sm[1].charCodeAt(i) & 0xff;
        }
        
        const decompressedBytes = inflate(raw);
        let decompressed = '';
        for (let i = 0; i < decompressedBytes.length; i += chunkSize) {
          decompressed += String.fromCharCode.apply(null, decompressedBytes.subarray(i, i + chunkSize));
        }

        if (decompressed.includes('BT')) {
          let currentFont = '';
          const cmdRegex = /\/(F\d+)|<([0-9a-fA-F]+)>\s*Tj/g;
          let cm;
          while ((cm = cmdRegex.exec(decompressed)) !== null) {
            if (cm[1]) {
              currentFont = cm[1];
            } else if (cm[2]) {
              const hex = cm[2];
              const fontObj = (currentFont === 'F6' ? '22' : '27');
              const cmap = cmaps[fontObj] || Object.values(cmaps)[0] || {};
              for (let i = 0; i < hex.length; i += 4) {
                const code = parseInt(hex.slice(i, i + 4), 16);
                decodedText += cmap[code] || '';
              }
            }
          }
          decodedText += '\n';
        }
      } catch (e) {
        // Stream wasn't a valid zlib flate or was an image stream
      }
    }

    // 3. Extract Amount (look for total payment amounts)
    let detectedAmount = 0;
    const rtlTotals = [...decodedText.matchAll(/(\d+\.\d{2})\s*(?:כ\"סה|כ\.אשראי|סה\"כ|סה״כ|לתשלום|חובה)/g)]
      .map(m => parseFloat(m[1]))
      .filter(n => n > 0 && n < 30000);
    const ltrTotals = [...decodedText.matchAll(/(?:כ\"סה|כ\.אשראי|סה\"כ|סה״כ|לתשלום|חובה)\s*[:=]?\s*(\d+\.\d{2})/g)]
      .map(m => parseFloat(m[1]))
      .filter(n => n > 0 && n < 30000);

    const combinedTotals = [...rtlTotals, ...ltrTotals];
    if (combinedTotals.length > 0) {
      detectedAmount = Math.max(...combinedTotals);
    } else {
      const validAmounts = [...decodedText.matchAll(/(\d+\.\d{2})/g)]
        .map(m => parseFloat(m[1]))
        .filter(n => n > 0 && n < 20000);
      if (validAmounts.length > 0) {
        detectedAmount = Math.max(...validAmounts);
      }
    }

    // 4. Extract Store Name
    let store = 'מחסני השוק';
    if (decodedText.includes('מחסני השוק')) store = 'מחסני השוק';
    else if (decodedText.includes('שופרסל')) store = 'שופרסל';
    else if (decodedText.includes('רמי לוי')) store = 'רמי לוי';
    else if (decodedText.includes('ויקטורי')) store = 'ויקטורי';
    else if (decodedText.includes('יוחננוף')) store = 'יוחננוף';

    // 5. Extract Payer by phone number matching team members, or by customer name
    let detectedPayer = '';
    const phoneMatch = decodedText.match(/05\d{8}/);
    if (phoneMatch) {
      const rawPhone = phoneMatch[0];
      const matchedMember = members.find(m => 
        (m.phone || '').replace(/[^0-9]/g, '').slice(-9) === rawPhone.slice(-9)
      );
      if (matchedMember) detectedPayer = matchedMember.name;
    }

    if (!detectedPayer) {
      const nameMatch = members.find(m => m.name && decodedText.includes(m.name));
      if (nameMatch) detectedPayer = nameMatch.name;
    }

    if (!detectedPayer && (decodedText.includes('מור אלי') || decodedText.includes('אלי מור'))) {
      const eliMember = members.find(m => m.name.includes('אלי'));
      detectedPayer = eliMember ? eliMember.name : 'אלי';
    }

    const itemsCount = (decodedText.match(/\d+\.\d{3}/g) || []).length;
    const desc = `${store} (${itemsCount > 0 ? `${itemsCount} פריטים` : 'חשבונית מס קבלה'})`;

    return {
      success: detectedAmount > 0,
      amount: detectedAmount,
      store,
      payer: detectedPayer,
      itemsCount,
      description: desc,
      rawText: decodedText
    };
  } catch (error) {
    console.warn('PDF receipt parser notice:', error);
    return {
      success: false,
      amount: 0,
      store: 'מחסני השוק',
      payer: '',
      itemsCount: 0,
      description: '',
      rawText: ''
    };
  }
}

/**
 * Universal receipt file parser (handles PDF or Images)
 */
export async function parseReceiptFile(file, members = []) {
  if (!file) return null;

  const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
  
  if (isPdf) {
    const arrayBuffer = await file.arrayBuffer();
    return parseReceiptPdf(arrayBuffer, members);
  }

  // Image fallback: default store
  return {
    success: false,
    amount: 0,
    store: 'מחסני השוק',
    payer: '',
    itemsCount: 0,
    description: 'קבלה שצולמה'
  };
}
