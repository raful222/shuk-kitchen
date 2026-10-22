// Helper utilities for date, attendance validation, and WhatsApp cart generation
import { SIDE_DISH_CONFIG } from '../data/initialData';

export const getCurrentDayKey = () => {
  const dayIndex = new Date().getDay();
  switch (dayIndex) {
    case 0: return 'sun';
    case 1: return 'mon';
    case 2: return 'tue';
    case 3: return 'wed';
    case 4: return 'thu';
    default: return 'sun';
  }
};

export const getHebrewDateString = (dateObj = new Date()) => {
  const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
  try {
    return new Intl.DateTimeFormat('he-IL', options).format(dateObj);
  } catch {
    return 'היום';
  }
};

/**
 * Returns formatted calendar dates (DD/MM) for the current workweek:
 * Sunday through Thursday.
 * On Friday/Saturday, if offset is 0, it automatically previews the upcoming week.
 */
export const getWorkWeekDates = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
  
  // On Friday or Saturday, if weekOffset is 0, default to upcoming week
  const autoOffset = (weekOffset === 0 && currentDay >= 5) ? 1 : weekOffset;

  // Calculate Sunday of target week
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - currentDay + (autoOffset * 7));

  const daysKeys = ['sun', 'mon', 'tue', 'wed', 'thu'];
  const weekMap = {};

  daysKeys.forEach((key, index) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + index);
    
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    
    weekMap[key] = {
      dateFormatted: `${dayNum}.${monthNum}`,
      fullDate: d.toISOString().split('T')[0],
      dayName: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'][index],
      isToday: d.toDateString() === now.toDateString(),
    };
  });

  return weekMap;
};

export const validateMemberAttendance = (daysObj = {}) => {
  const totalDays = Object.values(daysObj).filter(Boolean).length;
  const isSunAbsent = !daysObj.sun;
  const isTueAbsent = !daysObj.tue;

  let statusText = 'תקין (3 ימים)';
  let statusType = 'success';

  if (totalDays === 3) {
    if (isSunAbsent && isTueAbsent) {
      statusText = '3 ימים (נעדר מ-א׳ ו-ג׳)';
      statusType = 'warning';
    } else if (isSunAbsent) {
      statusText = '3 ימים (נעדר מ-א׳)';
      statusType = 'success';
    } else if (isTueAbsent) {
      statusText = '3 ימים (נעדר מ-ג׳)';
      statusType = 'success';
    } else {
      statusText = 'תקין (3 ימים ✓)';
      statusType = 'success';
    }
  } else if (totalDays > 3) {
    statusText = `${totalDays}/3 ימים (חריגה)`;
    statusType = 'warning';
  } else if (totalDays === 0) {
    statusText = 'טרם שובצו ימים';
    statusType = 'warning';
  } else {
    statusText = `${totalDays}/3 ימים (חסר יום)`;
    statusType = 'warning';
  }

  return {
    isValid: totalDays === 3,
    totalDays,
    isSunAbsent,
    isTueAbsent,
    statusText,
    statusType,
  };
};

export const generateWhatsAppShoppingList = (products = [], dailyMenu = {}, attendeeCount = 0) => {
  const itemsToBuy = products.filter(p => (p.requiredStock - p.currentStock) > 0);
  const totalEstimatedCost = itemsToBuy.reduce((sum, p) => {
    const qty = Math.max(0, p.requiredStock - p.currentStock);
    return sum + (qty * p.pricePerUnit);
  }, 0);

  const sideKey = dailyMenu.side || 'rice';
  const sideConfig = SIDE_DISH_CONFIG[sideKey] || SIDE_DISH_CONFIG.rice;
  const servingsPerPkg = dailyMenu.sideServingsPerPackage || sideConfig.servingsPerPackage || 4;
  const packagesNeeded = Math.ceil((attendeeCount / servingsPerPkg) * 2) / 2;

  let message = `🛒 *רשימת קניות שבועית - מחסני השוק*\n`;
  message += `📅 תאריך: ${new Intl.DateTimeFormat('he-IL').format(new Date())}\n`;
  if (attendeeCount > 0) {
    message += `👥 ממוצע סועדים להיום: ${attendeeCount} אנשים\n`;
  }
  message += `\n━━━━━━━━━━━━━━━━━\n`;

  const categories = {
    meat: '🍗 בשר ועופות (פלטות)',
    dry: '🌾 יבשים ותוספות (חבילות)',
    veg: '🥗 ירקות ופירות',
    drinks: '🥤 שתייה וחלב',
    cleaning: '🧼 ניקיון וכלים',
  };

  Object.entries(categories).forEach(([catKey, catTitle]) => {
    const catItems = itemsToBuy.filter(i => i.category === catKey);
    if (catItems.length > 0) {
      message += `\n*${catTitle}:*\n`;
      catItems.forEach(item => {
        const qtyNeeded = (item.requiredStock - item.currentStock);
        message += `▫️ ${item.name}: *${qtyNeeded} ${item.unit}* (יש במלאי: ${item.currentStock})\n`;
      });
    }
  });

  if (itemsToBuy.length === 0) {
    message += `\n✅ כל המצרכים במלאי! אין צורך להזמין כרגע.\n`;
  } else {
    message += `\n━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *עלות משוערת להזמנה:* ~${Math.round(totalEstimatedCost)} ₪\n`;
  }

  const meatTitle = dailyMenu.protein === 'chicken_breast' 
    ? 'חזה עוף (פלטות)' 
    : dailyMenu.protein === 'pargiyot' 
      ? 'פרגיות (פלטות)' 
      : 'משולב חזה עוף ופרגיות';

  message += `\n🍽️ *תפריט היום במטבח:*\n`;
  message += `• עיקרית: ${meatTitle}\n`;
  message += `• תוספת בצד: ${sideConfig.icon} ${sideConfig.label} (*${packagesNeeded} ${sideConfig.unit}*)\n`;
  if (dailyMenu.extraNotes) {
    message += `• הערות: ${dailyMenu.extraNotes}\n`;
  }
  message += `\nנשלח מאפליקציית מטבח העבודה 📱`;

  return message;
};

/**
 * Generates WhatsApp summary of balances and debts for PayBox
 */
export const generateWhatsAppDebtSummary = (arg1 = [], arg2 = {}, arg3 = '', arg4 = 0) => {
  let members = [];
  let memberBalances = {};
  let payboxLink = '';
  let fundBalance = 0;
  let unpaidMembers = [];
  let reimbursementsDue = [];

  if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
    members = arg1.members || [];
    memberBalances = arg1.memberBalances || {};
    payboxLink = arg1.payboxLink || '';
    fundBalance = arg1.fundBalance || 0;
    unpaidMembers = arg1.unpaidMembers || members.filter(m => !m.paidThisMonth);
    reimbursementsDue = arg1.reimbursementsDue || [];
  } else {
    members = arg1 || [];
    memberBalances = arg2 || {};
    payboxLink = arg3 || '';
    fundBalance = arg4 || 0;
    unpaidMembers = members.filter(m => !m.paidThisMonth);
  }

  let msg = `💰 *תמונת מצב קופת אוכל ו-PayBox*\n`;
  msg += `📅 תאריך: ${new Intl.DateTimeFormat('he-IL').format(new Date())}\n`;
  msg += `💵 יתרת קופה מחושבת: *${Math.round(fundBalance)} ₪*\n`;
  msg += `\n━━━━━━━━━━━━━━━━━\n`;

  // 1. Debtors (need to deposit to PayBox)
  if (unpaidMembers.length > 0) {
    msg += `\n🔴 *חברים שטרם הפקידו החודש לקופה:*\n`;
    unpaidMembers.forEach(m => {
      const debtAmount = Math.abs(memberBalances[m.id] || 0);
      msg += `▫️ ${m.name}${debtAmount > 0 ? ` (חוב: ${debtAmount} ₪)` : ''}\n`;
    });
  }

  // 2. Creditors (paid out of pocket and owed refund from PayBox)
  const creditors = reimbursementsDue.length > 0 
    ? reimbursementsDue 
    : members.filter(m => (memberBalances[m.id] || 0) > 0).map(m => ({
        name: m.name,
        amount: memberBalances[m.id] || 0,
        reason: 'הוצאות קניות'
      }));

  if (creditors.length > 0) {
    msg += `\n🟢 *חברים שמגיע להם החזר מפייבוקס (שילמו מכספם):*\n`;
    creditors.forEach(item => {
      msg += `▫️ ${item.name}: מגיע החזר של *${item.amount} ₪* (${item.reason || 'קניות'})\n`;
    });
  }

  if (unpaidMembers.length === 0 && creditors.length === 0) {
    msg += `\n✅ כל הכספים וההחזרים מאוזנים! אין חובות פעילים.\n`;
  }

  if (payboxLink) {
    msg += `\n💳 *לתשלום ישיר בקבוצת ה-PayBox:* \n${payboxLink}\n`;
  }

  msg += `\nנשלח מאפליקציית מטבח העבודה 📱`;
  return msg;
};

export const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error('Failed to load from localStorage', e);
    return fallback;
  }
};

export const setStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};
