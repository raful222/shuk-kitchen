// Initial mock and default data for the workplace cooking & grocery management app

export const INITIAL_MEMBERS = [
  { id: 'm1', name: 'יוסי כהן', phone: '050-1234567', avatar: '👨‍🍳', color: 'from-amber-500 to-orange-600' },
  { id: 'm2', name: 'אבי לוי', phone: '052-2345678', avatar: '🍳', color: 'from-blue-500 to-indigo-600' },
  { id: 'm3', name: 'רועי ששון', phone: '054-3456789', avatar: '🧑‍🍳', color: 'from-emerald-500 to-teal-600' },
  { id: 'm4', name: 'מתן עזרא', phone: '053-4567890', avatar: '🥗', color: 'from-purple-500 to-pink-600' },
  { id: 'm5', name: 'דני גולן', phone: '058-5678901', avatar: '🍲', color: 'from-rose-500 to-red-600' },
  { id: 'm6', name: 'אלי מזרחי', phone: '050-6789012', avatar: '🍽️', color: 'from-cyan-500 to-blue-600' },
  { id: 'm7', name: 'שי אלון', phone: '052-7890123', avatar: '🔪', color: 'from-amber-600 to-yellow-600' },
  { id: 'm8', name: 'תומר ברק', phone: '054-8901234', avatar: '🍗', color: 'from-green-600 to-emerald-700' },
];

export const DAYS_OF_WEEK = [
  { key: 'sun', name: 'ראשון', mandatory: true, short: 'א' },
  { key: 'mon', name: 'שני', mandatory: false, short: 'ב' },
  { key: 'tue', name: 'שלישי', mandatory: true, short: 'ג' },
  { key: 'wed', name: 'רביעי', mandatory: false, short: 'ד' },
  { key: 'thu', name: 'חמישי', mandatory: false, short: 'ה' },
];

// Fixed cooking & dishwashing pairs
export const INITIAL_PAIRS = [
  { id: 'p1', name: 'צמד א׳ (יוסי ואבי)', memberIds: ['m1', 'm2'] },
  { id: 'p2', name: 'צמד ב׳ (רועי ומתן)', memberIds: ['m3', 'm4'] },
  { id: 'p3', name: 'צמד ג׳ (דני ואלי)', memberIds: ['m5', 'm6'] },
  { id: 'p4', name: 'צמד ד׳ (שי ותומר)', memberIds: ['m7', 'm8'] },
];

// Default schedule assignment: which pair cooks & washes dishes each day
export const INITIAL_SCHEDULE = {
  sun: { pairId: 'p1', actualMembers: ['m1', 'm2'], completed: false },
  mon: { pairId: 'p2', actualMembers: ['m3', 'm4'], completed: false },
  tue: { pairId: 'p3', actualMembers: ['m5', 'm6'], completed: false },
  wed: { pairId: 'p4', actualMembers: ['m7', 'm8'], completed: false },
  thu: { pairId: 'p1', actualMembers: ['m1', 'm2'], completed: false },
};

// Initial member attendance preferences:
// Rule: 3 days per member. Sun and Tue mandatory, plus 1 choice day (Mon/Wed/Thu).
export const INITIAL_ATTENDANCE = {
  m1: { sun: true, mon: true, tue: true, wed: false, thu: false },
  m2: { sun: true, mon: true, tue: true, wed: false, thu: false },
  m3: { sun: true, mon: false, tue: true, wed: true, thu: false },
  m4: { sun: true, mon: false, tue: true, wed: true, thu: false },
  m5: { sun: true, mon: false, tue: true, wed: false, thu: true },
  m6: { sun: true, mon: false, tue: true, wed: false, thu: true },
  m7: { sun: true, mon: true, tue: true, wed: false, thu: false },
  m8: { sun: true, mon: false, tue: true, wed: true, thu: false },
};

// Daily actual attendance overrides (e.g. sick / holiday)
// format: { "YYYY-MM-DD": { [memberId]: boolean } }
export const INITIAL_DAILY_OVERRIDE = {};

// Active swap requests
export const INITIAL_SWAP_REQUESTS = [
  {
    id: 'swap-1',
    dayKey: 'tue',
    requestingMemberId: 'm5', // דני גולן
    reason: 'יש לי בדיקה רפואית בבוקר ולא אספיק לבשל ולשטוף כלים',
    status: 'open', // 'open' | 'accepted' | 'declined'
    acceptedByMemberId: null,
    createdAt: new Date().toISOString(),
  }
];

// Recurring products from "מחסני השוק"
export const INITIAL_PRODUCTS = [
  // בשר ועופות
  {
    id: 'prod-1',
    category: 'meat',
    name: 'חזה עוף טרי (מחסני השוק)',
    unit: 'ק"ג',
    pricePerUnit: 34.90,
    requiredStock: 4,
    currentStock: 1.5,
    shukNote: 'מבצע קבוע במחסני השוק - ארוז טרי או קפוא',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-2',
    category: 'meat',
    name: 'פרגיות טריות מובחרות',
    unit: 'ק"ג',
    pricePerUnit: 64.90,
    requiredStock: 3,
    currentStock: 0,
    shukNote: 'נקי משומן ומעולה להקפצה או מחבת פסים',
    link: 'https://www.mck.co.il',
  },
  // יבשים ותוספות
  {
    id: 'prod-3',
    category: 'dry',
    name: 'אורז יסמין קלאסי (1 ק"ג)',
    unit: 'חבילה',
    pricePerUnit: 9.90,
    requiredStock: 3,
    currentStock: 2,
    shukNote: 'שקית 1 ק"ג',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-4',
    category: 'dry',
    name: 'פתיתים אפויים צורות',
    unit: 'חבילה',
    pricePerUnit: 6.90,
    requiredStock: 2,
    currentStock: 1,
    shukNote: 'אוסם או מותג מחסני השוק',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-5',
    category: 'dry',
    name: 'שמן קנולה מזוכך 1 ליטר',
    unit: 'בקבוק',
    pricePerUnit: 11.90,
    requiredStock: 2,
    currentStock: 1,
    shukNote: 'שמן לבישול וטיגון',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-6',
    category: 'dry',
    name: 'שמן זית כתית מעולה 750 מ"ל',
    unit: 'בקבוק',
    pricePerUnit: 39.90,
    requiredStock: 1,
    currentStock: 1,
    shukNote: 'לתיבול סלטים',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-7',
    category: 'dry',
    name: 'פפריקה מתוקה בשמן + גריל עוף',
    unit: 'יחידה',
    pricePerUnit: 8.50,
    requiredStock: 2,
    currentStock: 2,
    shukNote: 'תבלינים בסיסיים לעוף',
    link: 'https://www.mck.co.il',
  },
  // ירקות טריים
  {
    id: 'prod-8',
    category: 'veg',
    name: 'בצל יבש',
    unit: 'ק"ג',
    pricePerUnit: 4.90,
    requiredStock: 3,
    currentStock: 1,
    shukNote: 'לבסיס של כל תבשיל',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-9',
    category: 'veg',
    name: 'תפוחי אדמה ארוזים',
    unit: 'שקית',
    pricePerUnit: 7.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'לאפייה בתנור לצד העוף',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-10',
    category: 'veg',
    name: 'עגבניות ומלפפונים לסלט',
    unit: 'ק"ג',
    pricePerUnit: 6.90,
    requiredStock: 4,
    currentStock: 1,
    shukNote: 'סלט טרי יומי',
    link: 'https://www.mck.co.il',
  },
  // ניקיון ושטיפת כלים (תורנות כלים)
  {
    id: 'prod-11',
    category: 'cleaning',
    name: 'נוזל כלים פיירי 650 מ"ל',
    unit: 'בקבוק',
    pricePerUnit: 12.90,
    requiredStock: 2,
    currentStock: 1,
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
    currentStock: 1,
    shukNote: 'פינוי שוטף בסיום הארוחה',
    link: 'https://www.mck.co.il',
  },
];

// Budget & Expenses
export const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    date: '2026-10-18',
    store: 'מחסני השוק - סניף ראשי',
    description: 'קניית בשר שבועית (חזה עוף + פרגיות) + שמן ואורז',
    amount: 384.50,
    paidBy: 'יוסי כהן',
  },
  {
    id: 'exp-2',
    date: '2026-10-12',
    store: 'מחסני השוק',
    description: 'ירקות טריים לסלט + נוזל כלים וסקוצ\'ים',
    amount: 142.00,
    paidBy: 'רועי ששון',
  },
];

export const INITIAL_FUND_DEPOSITS = [
  { id: 'dep-1', memberId: 'm1', amount: 150, date: '2026-10-01' },
  { id: 'dep-2', memberId: 'm2', amount: 150, date: '2026-10-01' },
  { id: 'dep-3', memberId: 'm3', amount: 150, date: '2026-10-01' },
  { id: 'dep-4', memberId: 'm4', amount: 150, date: '2026-10-01' },
  { id: 'dep-5', memberId: 'm5', amount: 150, date: '2026-10-01' },
  { id: 'dep-6', memberId: 'm6', amount: 150, date: '2026-10-01' },
  { id: 'dep-7', memberId: 'm7', amount: 150, date: '2026-10-01' },
  { id: 'dep-8', memberId: 'm8', amount: 150, date: '2026-10-01' },
];

export const INITIAL_DAILY_MENU = {
  protein: 'chicken_breast', // 'chicken_breast' | 'pargiyot' | 'both'
  gramsPerPerson: 300,
  side: 'אורז לבן + סלט ירקות עשיר',
  notes: 'רועי מעדיף חזה עוף לא חריף, להשאיר קופסה לתומר',
};
