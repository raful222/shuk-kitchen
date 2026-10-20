// Clean Initial Data for Workplace Kitchen

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDG_WrTGpvEOcj63x30zaoPt_Sxp0KIpI8",
  authDomain: "shuk-kitchen.firebaseapp.com",
  projectId: "shuk-kitchen",
  storageBucket: "shuk-kitchen.firebasestorage.app",
  messagingSenderId: "847487034525",
  appId: "1:847487034525:web:b1d0abe245f610c59ce074",
  measurementId: "G-GCMHWNX61X"
};

export const INITIAL_MEMBERS = [];

export const DAYS_OF_WEEK = [
  { key: 'sun', name: 'ראשון', mandatory: true, short: 'א' },
  { key: 'mon', name: 'שני', mandatory: false, short: 'ב' },
  { key: 'tue', name: 'שלישי', mandatory: true, short: 'ג' },
  { key: 'wed', name: 'רביעי', mandatory: false, short: 'ד' },
  { key: 'thu', name: 'חמישי', mandatory: false, short: 'ה' },
];

export const INITIAL_PAIRS = [];

export const INITIAL_SCHEDULE = {
  sun: { pairId: null, actualMembers: [], completed: false },
  mon: { pairId: null, actualMembers: [], completed: false },
  tue: { pairId: null, actualMembers: [], completed: false },
  wed: { pairId: null, actualMembers: [], completed: false },
  thu: { pairId: null, actualMembers: [], completed: false },
};

export const INITIAL_ATTENDANCE = {};

export const INITIAL_DAILY_OVERRIDE = {};

export const INITIAL_SWAP_REQUESTS = [];

// 4 Focused Side Dishes with package serving defaults:
export const SIDE_DISH_CONFIG = {
  chips: { id: 'chips', label: 'צ\'יפס', icon: '🍟', unit: 'שקיות', servingsPerPackage: 4, desc: 'שקית צ\'יפס קפוא לתנור / טיגון' },
  rice: { id: 'rice', label: 'אורז', icon: '🍚', unit: 'חבילות', servingsPerPackage: 5, desc: 'חבילת 1 ק"ג אורז' },
  couscous: { id: 'couscous', label: 'קוסקוס', icon: '🥣', unit: 'חבילות', servingsPerPackage: 4, desc: 'שקית קוסקוס להכנה מהירה' },
  bulgur: { id: 'bulgur', label: 'בורגול', icon: '🌾', unit: 'חבילות', servingsPerPackage: 5, desc: 'חבילת בורגול עבה / דק' },
};

// Recurring products from "מחסני השוק"
export const INITIAL_PRODUCTS = [
  // Meat
  {
    id: 'prod-1',
    category: 'meat',
    name: 'חזה עוף טרי (פלטה במחסני השוק)',
    unit: 'פלטות',
    pricePerUnit: 32.90,
    requiredStock: 4,
    currentStock: 0,
    shukNote: 'פלטה ממוצעת שוקלת ~900 גרם',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-2',
    category: 'meat',
    name: 'פרגיות טריות (פלטה מובחרת)',
    unit: 'פלטות',
    pricePerUnit: 58.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'פלטה נקייה משומן (~850-950 גרם)',
    link: 'https://www.mck.co.il',
  },
  // 4 Main Side Dishes
  {
    id: 'prod-chips',
    category: 'dry',
    name: 'צ\'יפס קפוא (שקית במחסני השוק)',
    unit: 'שקיות',
    pricePerUnit: 14.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'שקית לתנור / טיגון',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-rice',
    category: 'dry',
    name: 'אורז יסמין קלאסי (1 ק"ג)',
    unit: 'חבילות',
    pricePerUnit: 9.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'שקית 1 ק"ג',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-couscous',
    category: 'dry',
    name: 'קוסקוס מובחר מהיר הכנה',
    unit: 'חבילות',
    pricePerUnit: 8.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'שקית קוסקוס (דק / בינוני)',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-bulgur',
    category: 'dry',
    name: 'בורגול מובחר (שקית)',
    unit: 'חבילות',
    pricePerUnit: 7.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'שקית בורגול',
    link: 'https://www.mck.co.il',
  },
  // Basics & Cooking
  {
    id: 'prod-5',
    category: 'dry',
    name: 'שמן קנולה מזוכך 1 ליטר',
    unit: 'בקבוק',
    pricePerUnit: 11.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'שמן לבישול וטיגון',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-7',
    category: 'dry',
    name: 'פפריקה מתוקה בשמן + גריל עוף',
    unit: 'יחידה',
    pricePerUnit: 8.50,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'תבלינים בסיסיים לעוף',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-8',
    category: 'veg',
    name: 'בצל יבש',
    unit: 'ק"ג',
    pricePerUnit: 4.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'לבסיס של כל תבשיל ובורגול',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-10',
    category: 'veg',
    name: 'עגבניות ומלפפונים לסלט',
    unit: 'ק"ג',
    pricePerUnit: 6.90,
    requiredStock: 4,
    currentStock: 0,
    shukNote: 'סלט טרי יומי',
    link: 'https://www.mck.co.il',
  },
  // Cleaning & Dishes
  {
    id: 'prod-11',
    category: 'cleaning',
    name: 'נוזל כלים פיירי 650 מ"ל',
    unit: 'בקבוק',
    pricePerUnit: 12.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'לשטיפת סירים וכלים אחרי הארוחה',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-12',
    category: 'cleaning',
    name: 'סקוצ\'ים קשיחים לסירים (מארז 3)',
    unit: 'מארז',
    pricePerUnit: 9.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'חובה לשטיפת כלים קלה',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-13',
    category: 'cleaning',
    name: 'שקיות אשפה ענקיות (מארז)',
    unit: 'חבילה',
    pricePerUnit: 14.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'פינוי שוטף בסיום הארוחה',
    link: 'https://www.mck.co.il',
  },
];

export const INITIAL_EXPENSES = [];
export const INITIAL_FUND_DEPOSITS = [];

export const INITIAL_DAILY_MENU = {
  protein: 'chicken_breast',
  portionsPerPlate: 3,
  side: 'rice', // 'chips' | 'rice' | 'couscous' | 'bulgur'
  sideServingsPerPackage: 5,
  extraNotes: '',
};

export const INITIAL_PAYBOX_LINK = 'https://payboxapp.page.link/shuk-kitchen';
