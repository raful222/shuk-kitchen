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

export const getHebrewDateString = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  try {
    return new Intl.DateTimeFormat('he-IL', options).format(new Date());
  } catch {
    return 'היום';
  }
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
