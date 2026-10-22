import { inflate } from 'pako';
import { INITIAL_PRODUCTS } from '../data/initialData';

/**
 * Parses a supermarket receipt or invoice PDF in the browser.
 * Extracts the total payment amount, store name, customer/payer, items count,
 * and individual line items with quantities.
 * 
 * @param {ArrayBuffer|Uint8Array} buffer 
 * @param {Array} members List of team members to match by phone or name
 * @returns {Object} { amount, store, payer, itemsCount, description, parsedItems, rawText }
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

    // 6. Extract Individual Line Items & Quantities
    const itemRegex = /\.\d{2}(\d+\.\d{3})\s*(ח\"י|ג\"ק)\s*(.+?)(?=\d{4,15}|\n|$)/g;
    let itemMatch;
    const parsedItems = [];
    while ((itemMatch = itemRegex.exec(decodedText)) !== null) {
      const qty = parseFloat(itemMatch[1]);
      const unit = itemMatch[2];
      let name = itemMatch[3].trim().replace(/^[\s,.-]+|[\s,.-]+$/g, '');
      if (name && name !== 'משלוח אונליין' && !name.includes('פקדון')) {
        parsedItems.push({ qty, unit, name });
      }
    }

    const itemsCount = parsedItems.length || (decodedText.match(/\d+\.\d{3}/g) || []).length;
    const desc = `${store} (${itemsCount > 0 ? `${itemsCount} פריטים` : 'חשבונית מס קבלה'})`;

    return {
      success: detectedAmount > 0,
      amount: detectedAmount,
      store,
      payer: detectedPayer,
      itemsCount,
      description: desc,
      parsedItems,
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
      parsedItems: [],
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
    description: 'קבלה שצולמה',
    parsedItems: []
  };
}

/**
 * Maps parsed invoice line items to kitchen inventory products
 * and updates their currentStock accurately.
 */
export function matchAndSyncStock(parsedItems = [], currentProducts = []) {
  if (!parsedItems || parsedItems.length === 0) {
    return { updatedProducts: currentProducts, syncReport: [] };
  }

  // Combine initial catalog with current products
  const productMap = new Map();
  INITIAL_PRODUCTS.forEach(p => productMap.set(p.id, { ...p }));
  currentProducts.forEach(p => {
    if (productMap.has(p.id)) {
      productMap.set(p.id, { ...productMap.get(p.id), ...p });
    } else {
      productMap.set(p.id, { ...p });
    }
  });

  const updatedProducts = Array.from(productMap.values());
  const syncReport = [];

  // Reset stock to 0 to apply clean new receipt values
  updatedProducts.forEach(p => p.currentStock = 0);

  parsedItems.forEach(item => {
    const rawName = item.name.toLowerCase();
    let matched = null;
    let computedQty = item.qty;

    // Meat & Poultry
    if (rawName.includes('שניצל') || (rawName.includes('חזה') && !rawName.includes('תיבול') && !rawName.includes('גריל'))) {
      matched = updatedProducts.find(p => p.name.includes('שניצל') || p.id === 'prod-1');
      if (matched) computedQty = Math.round(item.qty / 0.95) || 6;
    } else if (rawName.includes('פרגיות')) {
      matched = updatedProducts.find(p => p.name.includes('פרגיות') || p.id === 'prod-2');
      if (matched) computedQty = Math.round(item.qty / 0.95) || 5;
    }
    // Main Sides
    else if (rawName.includes('בסמטי') || (rawName.includes('אורז') && !rawName.includes('קוקוס'))) {
      matched = updatedProducts.find(p => p.name.includes('אורז') || p.id === 'prod-chips' || p.id === 'prod-3');
    } else if (rawName.includes('קוסקוס')) {
      matched = updatedProducts.find(p => p.name.includes('קוסקוס') || p.id === 'prod-couscous');
    } else if (rawName.includes('ציפס') || rawName.includes('צ\'יפס')) {
      matched = updatedProducts.find(p => p.name.includes('ציפס') || p.name.includes('צ\'יפס') || p.id === 'prod-chips');
    } else if (rawName.includes('בורגול')) {
      matched = updatedProducts.find(p => p.name.includes('בורגול') || p.id === 'prod-15');
    }
    // Dairy & Drinks
    else if ((rawName.includes('חלב') && rawName.includes('מהדרין')) || rawName.includes('קרטון 3')) {
      matched = updatedProducts.find(p => p.id === 'prod-milk' || p.name.includes('חלב'));
    } else if (rawName.includes('קולה') && rawName.includes('zero')) {
      matched = updatedProducts.find(p => p.id === 'prod-coca-cola-zero' || p.name.includes('קוקה קולה'));
    } else if (rawName.includes('פפסי') && rawName.includes('זירו')) {
      matched = updatedProducts.find(p => p.id === 'prod-pepsi-zero' || p.name.includes('פפסי'));
    }
    // Fresh Veggies
    else if (rawName.includes('בטטה')) {
      matched = updatedProducts.find(p => p.id === 'prod-sweet-potato' || p.name.includes('בטטה'));
      computedQty = Math.round(item.qty) || 3;
    } else if (rawName.includes('לבן אדמה') || rawName.includes('תפוח אדמה')) {
      matched = updatedProducts.find(p => p.id === 'prod-potato-bag' || p.id === 'prod-9' || p.name.includes('תפוח'));
      computedQty = 1; // 1 sack of 4kg
    } else if (rawName.includes('שרי')) {
      matched = updatedProducts.find(p => p.id === 'prod-cherry-tomatoes' || p.name.includes('שרי'));
    } else if (rawName.includes('שמפיניון') || rawName.includes('פטריות')) {
      matched = updatedProducts.find(p => p.id === 'prod-mushrooms' || p.name.includes('פטריות'));
    } else if (rawName.includes('פטרוזיליה') || rawName.includes('כוסברה')) {
      matched = updatedProducts.find(p => p.id === 'prod-greens' || p.name.includes('פטרוזיליה'));
    } else if (rawName.includes('חריף פלפל')) {
      matched = updatedProducts.find(p => p.id === 'prod-spicy-pepper' || p.name.includes('חריף'));
    }
    // Pantry & Spices
    else if (rawName.includes('זית')) {
      matched = updatedProducts.find(p => p.id === 'prod-6' || p.name.includes('זית'));
    } else if (rawName.includes('פפריקה')) {
      matched = updatedProducts.find(p => p.id === 'prod-spice-paprika' || p.name.includes('פפריקה'));
    } else if (rawName.includes('עוף גריל') || (rawName.includes('גריל') && rawName.includes('עוף'))) {
      matched = updatedProducts.find(p => p.id === 'prod-spice-chicken' || p.name.includes('גריל'));
    } else if (rawName.includes('כתוש שום') || rawName.includes('טחון שום') || rawName.includes('שום')) {
      matched = updatedProducts.find(p => p.id === 'prod-garlic-crushed' || p.name.includes('שום'));
    }
    // Disposables & Cleaning
    else if (rawName.includes('צלחות')) {
      matched = updatedProducts.find(p => p.id === 'prod-plates-thick' || p.name.includes('צלחות'));
    } else if (rawName.includes('מזלגות')) {
      matched = updatedProducts.find(p => p.id === 'prod-cutlery-forks' || p.name.includes('מזלגות'));
    } else if (rawName.includes('כפות')) {
      matched = updatedProducts.find(p => p.id === 'prod-cutlery-spoons' || p.name.includes('כפות'));
    } else if (rawName.includes('אפיה נייר') || rawName.includes('אפייה')) {
      matched = updatedProducts.find(p => p.id === 'prod-baking-paper' || p.name.includes('אפייה'));
    }

    if (matched) {
      matched.currentStock = (matched.currentStock || 0) + computedQty;
      syncReport.push({
        name: matched.name,
        qtyAdded: computedQty,
        unit: matched.unit,
        totalStock: matched.currentStock
      });
    }
  });

  return { updatedProducts, syncReport };
}

