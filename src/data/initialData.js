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

// 4 Focused Side Dishes with recipes, microwave times, and exact cup/portion formulas:
export const SIDE_DISH_CONFIG = {
  rice: {
    id: 'rice',
    label: 'אורז',
    icon: '🍚',
    unit: 'חבילות',
    servingsPerPackage: 5,
    desc: 'חבילת 1 ק"ג אורז בסמטי / יסמין',
    // Rule: 2.5 cups for 7 people -> ~0.357 cups per person
    cupsPerPerson: 2.5 / 7,
    waterRatio: 2, // 1 to 2 ratio
    cookTimeMinutes: 15,
    cookMethod: '15 דקות במיקרוגל או בסיר',
    seasoning: 'קצת שמן, מלח, פלפל שחור (אבקת מרק עוף - לא חייב / אופציונלי)',
    instructions: [
      'מודדים את כמות כוסות האורז המחושבת ושוטפים קלות במידת הצורך.',
      'מוסיפים מים רותחים ביחס מדויק של 1 ל-2 (על כל כוס אורז – 2 כוסות מים רותחים).',
      'מוסיפים מעט שמן, מלח ופלפל שחור (אבקת מרק עוף לפי הטעם – לא חובה!).',
      'במיקרוגל: שמים בכלי מתאים למיקרוגל עם מכסה סגור חלקי, ומפעילים ל-15 דקות בעוצמה גבוהה.',
      'בסיר: מביאים לרתיחה, מנמיכים לאש הכי קטנה ומבשלים מכוסה 15 דקות.',
      'חשוב מאוד! משאירים את הכלי סגור 5 דקות לספיגת האדים, ואז פותחים ומערבבים בעדינות עם מזלג.'
    ]
  },
  bulgur: {
    id: 'bulgur',
    label: 'בורגול',
    icon: '🌾',
    unit: 'חבילות',
    servingsPerPackage: 5,
    desc: 'חבילת בורגול מובחר עבה / בינוני',
    cupsPerPerson: 2.5 / 7,
    waterRatio: 2,
    cookTimeMinutes: 20,
    cookMethod: '20 דקות במיקרוגל',
    seasoning: 'שמן ומלח',
    instructions: [
      'מניחים את הבורגול בכלי עמוק המתאים למיקרוגל.',
      'יוצקים מים רותחים ביחס של 1 ל-2 (כפול מים מכמות הבורגול).',
      'מוסיפים שמן ומלח ומערבבים היטב.',
      'מכניסים למיקרוגל ל-20 דקות בכיסוי חלקי עד שכל המים נספגים והבורגול רך ורך.',
      'מערבבים עם מזלג ומשהים 3 דקות מכוסה לפני ההגשה.'
    ]
  },
  couscous: {
    id: 'couscous',
    label: 'קוסקוס',
    icon: '🥣',
    unit: 'חבילות',
    servingsPerPackage: 4,
    desc: 'שקית 350 גרם קוסקוס מהיר הכנה (דק / רגיל)',
    cupsPerPerson: 0.35,
    waterRatio: 2,
    cookTimeMinutes: 6,
    cookMethod: 'ללא בישול! מים רותחים והשריה 6 דק\'',
    seasoning: '2-3 כפות שמן, 1 כפית מלח, חצי כפית כורכום או מרק עוף',
    instructions: [
      'מתכון פשוט ומנצח ללא בישול כלל:',
      'שופכים שקית קוסקוס (350 גרם) לקערה רחבה.',
      'מוסיפים 2-3 כפות שמן, כפית מלח וחצי כפית כורכום או מרק עוף.',
      'מערבבים היטב עם מזלג/בידיים כך שכל גרגירי הקוסקוס ייעטפו בשמן (מונע הידבקות!).',
      'יוצקים בדיוק 2 כוסות מים רותחים ומערבבים קלות.',
      'מכסים מיד במכסה או בצלחת גדולה למשך 6-8 דקות (לא לגעת!).',
      'פותחים את הכיסוי ומפוררים במזלג – יוצא חם, אוורירי ומושלם!'
    ]
  },
  chips: {
    id: 'chips',
    label: 'צ\'יפס',
    icon: '🍟',
    unit: 'שקיות',
    servingsPerPackage: 4,
    desc: 'שקית 1.5 ק"ג צ\'יפס סטייק עבה (מחסני השוק)',
    cookTimeMinutes: 22,
    cookMethod: 'תנור / נינג\'ה / טיגון',
    seasoning: 'ספריי שמן ומלח דק',
    instructions: [
      'מחממים תנור או נינג\'ה / איירפרייר ל-200 מעלות.',
      'מפזרים את הצ\'יפס הקפוא בשכבה אחידה על תבנית מרופדת בנייר אפייה.',
      'מרססים מעט שמן ומפזרים מלח לפי הטעם.',
      'אופים כ-20-25 דקות עד להזהבה מלאה וקריספיות. מגישים חם!'
    ]
  },
};

// Recurring products from "מחסני השוק" based on latest real invoice
export const INITIAL_PRODUCTS = [
  // 🍗 Meat & Poultry (פלטות / ק"ג)
  {
    id: 'prod-1',
    category: 'meat',
    name: 'שניצל עוף פרימיום דק טרי (חזה עוף)',
    unit: 'פלטות',
    pricePerUnit: 32.90,
    requiredStock: 4,
    currentStock: 0,
    shukNote: '59.90 ₪ לק"ג במחסני השוק (~900 גרם לפלטה)',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-2',
    category: 'meat',
    name: 'סטייק פרגיות מקוצב טרי (מובחר)',
    unit: 'פלטות',
    pricePerUnit: 58.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: '74.90 ₪ לק"ג במחסני השוק (~900 גרם לפלטה נקייה)',
    link: 'https://www.mck.co.il',
  },
  // 🌾 4 Main Side Dishes
  {
    id: 'prod-chips',
    category: 'dry',
    name: 'צ\'יפס סטייק עבה קפוא 1.5 ק"ג',
    unit: 'שקיות',
    pricePerUnit: 17.50,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'שקית 1.5 ק"ג לתנור / נינג\'ה',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-rice',
    category: 'dry',
    name: 'אורז בסמטי מובחר (1 ק"ג)',
    unit: 'חבילות',
    pricePerUnit: 7.90,
    requiredStock: 4,
    currentStock: 0,
    shukNote: 'שקית 1 ק"ג במחסני השוק (מבצע 7.90 ₪)',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-couscous-thin',
    category: 'dry',
    name: 'קוסקוס דק מהיר הכנה 350 גרם',
    unit: 'חבילות',
    pricePerUnit: 4.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'שקית 350 גרם (4.90 ₪)',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-couscous-regular',
    category: 'dry',
    name: 'קוסקוס רגיל מהיר הכנה 350 גרם',
    unit: 'חבילות',
    pricePerUnit: 4.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'שקית 350 גרם (4.90 ₪)',
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
    shukNote: 'שקית בורגול לבישול מהיר',
    link: 'https://www.mck.co.il',
  },
  // 🧂 Cooking, Oils & Spices
  {
    id: 'prod-oil-olive',
    category: 'dry',
    name: 'שמן זית כתית מעולה 750 מ"ל',
    unit: 'בקבוק',
    pricePerUnit: 19.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'מבצע 19.90 ₪ (במקום 37.90)',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-oil-canola',
    category: 'dry',
    name: 'שמן קנולה מזוכך 1 ליטר',
    unit: 'בקבוק',
    pricePerUnit: 11.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'לבישול וטיגון',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-spice-grill',
    category: 'dry',
    name: 'תבלין גריל עוף 250 גרם',
    unit: 'יחידה',
    pricePerUnit: 21.90,
    requiredStock: 1,
    currentStock: 0,
    shukNote: 'תיבול קלאסי לחזה עוף ופרגיות',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-spice-paprika',
    category: 'dry',
    name: 'פפריקה מתוקה בשמן מרוקאי 400 גרם',
    unit: 'יחידה',
    pricePerUnit: 21.90,
    requiredStock: 1,
    currentStock: 0,
    shukNote: 'צבע עמוק וטעם עשיר',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-spice-chicken',
    category: 'dry',
    name: 'תערובת תיבול לעוף 150 גרם',
    unit: 'יחידה',
    pricePerUnit: 14.90,
    requiredStock: 1,
    currentStock: 0,
    shukNote: 'תערובת תבלינים מוכנה',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-garlic-crushed',
    category: 'dry',
    name: 'מתבל שום כתוש / שום טחון',
    unit: 'יחידה',
    pricePerUnit: 15.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'שום כתוש/טחון מוכן לבישול',
    link: 'https://www.mck.co.il',
  },
  // 🥗 Fresh Veggies
  {
    id: 'prod-sweet-potato',
    category: 'veg',
    name: 'בטטה מובחרת',
    unit: 'ק"ג',
    pricePerUnit: 6.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: '6.90 ₪ לק"ג',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-potato-bag',
    category: 'veg',
    name: 'שק תפוח אדמה לבן',
    unit: 'שק (4 ק"ג)',
    pricePerUnit: 15.68,
    requiredStock: 1,
    currentStock: 0,
    shukNote: '3.90 ₪ לק"ג',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-cherry-tomatoes',
    category: 'veg',
    name: 'עגבניות שרי אשכולות',
    unit: 'מארז',
    pricePerUnit: 9.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: '9.90 ₪ למארז',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-mushrooms',
    category: 'veg',
    name: 'פטריות שמפיניון טריות',
    unit: 'מארז',
    pricePerUnit: 12.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: '12.90 ₪ למארז',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-spicy-pepper',
    category: 'veg',
    name: 'פלפל חריף ירוק',
    unit: 'ק"ג',
    pricePerUnit: 11.90,
    requiredStock: 1,
    currentStock: 0,
    shukNote: '11.90 ₪ לק"ג',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-greens',
    category: 'veg',
    name: 'פטרוזיליה / כוסברה טרייה',
    unit: 'צרור',
    pricePerUnit: 4.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'לסלטים ותיבול',
    link: 'https://www.mck.co.il',
  },
  // 🥤 Drinks & Dairy
  {
    id: 'prod-coca-cola-zero',
    category: 'drinks',
    name: 'קוקה קולה ZERO (מארז שישייה 1.5 ליטר)',
    unit: 'מארז שישייה',
    pricePerUnit: 45.20,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'שישיית 1.5 ליטר (+1.80 ₪ פיקדון)',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-pepsi-zero',
    category: 'drinks',
    name: 'שישיית פפסי זירו 1.5 ליטר',
    unit: 'מארז שישייה',
    pricePerUnit: 33.10,
    requiredStock: 1,
    currentStock: 0,
    shukNote: 'שישיית 1.5 ליטר (+1.80 ₪ פיקדון)',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-milk',
    category: 'drinks',
    name: 'חלב 3% קרטון מהדרין',
    unit: 'קרטון',
    pricePerUnit: 7.35,
    requiredStock: 4,
    currentStock: 0,
    shukNote: '7.35 ₪ ליחידה',
    link: 'https://www.mck.co.il',
  },
  // 🧼 Disposable Plates, Cutlery & Cleaning
  {
    id: 'prod-plates-thick',
    category: 'cleaning',
    name: 'צלחות עבות 1 ק"ג',
    unit: 'מארז',
    pricePerUnit: 10.00,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'צלחות קשיחות וחזקות',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-cutlery-forks',
    category: 'cleaning',
    name: 'מזלגות איכותי (מארז 40 יח\')',
    unit: 'מארז',
    pricePerUnit: 3.30,
    requiredStock: 3,
    currentStock: 0,
    shukNote: '3 מארזים ב-9.90 ₪ במחסני השוק',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-cutlery-spoons',
    category: 'cleaning',
    name: 'כפות איכותי (מארז 40 יח\')',
    unit: 'מארז',
    pricePerUnit: 3.30,
    requiredStock: 3,
    currentStock: 0,
    shukNote: '3 מארזים ב-9.90 ₪ במחסני השוק',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-baking-paper',
    category: 'cleaning',
    name: 'נייר אפייה איכותי',
    unit: 'גליל',
    pricePerUnit: 8.90,
    requiredStock: 1,
    currentStock: 0,
    shukNote: 'לתבניות בתנור ולנינג\'ה',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-fairy',
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
    id: 'prod-sponges',
    category: 'cleaning',
    name: 'סקוצ\'ים קשיחים לסירים (מארז 3)',
    unit: 'מארז',
    pricePerUnit: 9.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'לשטיפת כלים קלה ומהירה',
    link: 'https://www.mck.co.il',
  },
];

export const INITIAL_EXPENSES = [];
export const INITIAL_FUND_DEPOSITS = [];
export const INITIAL_WITHDRAWALS = [];

export const INITIAL_DAILY_MENU = {
  protein: 'chicken_breast',
  portionsPerPlate: 3,
  side: 'rice', // 'chips' | 'rice' | 'couscous' | 'bulgur'
  sideServingsPerPackage: 5,
  extraNotes: '',
};

export const INITIAL_PAYBOX_LINK = 'https://payboxapp.page.link/shuk-kitchen';
