// Initial mock and default data for the workplace cooking & grocery management app

export const INITIAL_MEMBERS = [
  { id: 'm1', name: 'יוסי כהן', phone: '050-1234567', avatar: '👨‍🍳', color: 'from-amber-500 to-orange-600', paidThisMonth: true },
  { id: 'm2', name: 'אבי לוי', phone: '052-2345678', avatar: '🍳', color: 'from-blue-500 to-indigo-600', paidThisMonth: true },
  { id: 'm3', name: 'רועי ששון', phone: '054-3456789', avatar: '🧑‍🍳', color: 'from-emerald-500 to-teal-600', paidThisMonth: false },
  { id: 'm4', name: 'מתן עזרא', phone: '053-4567890', avatar: '🥗', color: 'from-purple-500 to-pink-600', paidThisMonth: true },
  { id: 'm5', name: 'דני גולן', phone: '058-5678901', avatar: '🍲', color: 'from-rose-500 to-red-600', paidThisMonth: false },
  { id: 'm6', name: 'אלי מזרחי', phone: '050-6789012', avatar: '🍽️', color: 'from-cyan-500 to-blue-600', paidThisMonth: true },
  { id: 'm7', name: 'שי אלון', phone: '052-7890123', avatar: '🔪', color: 'from-amber-600 to-yellow-600', paidThisMonth: true },
  { id: 'm8', name: 'תומר ברק', phone: '054-8901234', avatar: '🍗', color: 'from-green-600 to-emerald-700', paidThisMonth: false },
];

export const DAYS_OF_WEEK = [
  { key: 'sun', name: 'ראשון', mandatory: true, short: 'א' },
  { key: 'mon', name: 'שני', mandatory: false, short: 'ב' },
  { key: 'tue', name: 'שלישי', mandatory: true, short: 'ג' },
  { key: 'wed', name: 'רביעי', mandatory: false, short: 'ד' },
  { key: 'thu', name: 'חמישי', mandatory: false, short: 'ה' },
];

export const INITIAL_PAIRS = [
  { id: 'p1', name: 'צמד א׳ (יוסי ואבי)', memberIds: ['m1', 'm2'] },
  { id: 'p2', name: 'צמד ב׳ (רועי ומתן)', memberIds: ['m3', 'm4'] },
  { id: 'p3', name: 'צמד ג׳ (דני ואלי)', memberIds: ['m5', 'm6'] },
  { id: 'p4', name: 'צמד ד׳ (שי ותומר)', memberIds: ['m7', 'm8'] },
];

export const INITIAL_SCHEDULE = {
  sun: { pairId: 'p1', actualMembers: ['m1', 'm2'], completed: false },
  mon: { pairId: 'p2', actualMembers: ['m3', 'm4'], completed: false },
  tue: { pairId: 'p3', actualMembers: ['m5', 'm6'], completed: false },
  wed: { pairId: 'p4', actualMembers: ['m7', 'm8'], completed: false },
  thu: { pairId: 'p1', actualMembers: ['m1', 'm2'], completed: false },
};

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

export const INITIAL_DAILY_OVERRIDE = {};

export const INITIAL_SWAP_REQUESTS = [
  {
    id: 'swap-1',
    dayKey: 'tue',
    requestingMemberId: 'm5',
    reason: 'יש לי בדיקה רפואית בבוקר ולא אספיק לבשל ולשטוף כלים',
    status: 'open',
    acceptedByMemberId: null,
    createdAt: new Date().toISOString(),
  }
];

// Recurring products from "מחסני השוק"
export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    category: 'meat',
    name: 'חזה עוף טרי (פלטה במחסני השוק)',
    unit: 'פלטות',
    pricePerUnit: 32.90,
    requiredStock: 4,
    currentStock: 1,
    shukNote: 'פלטה ממוצעת שוקלת ~900 גרם (מספיקה לכ-3 אנשים)',
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
  {
    id: 'prod-3',
    category: 'dry',
    name: 'אורז יסמין קלאסי (1 ק"ג)',
    unit: 'חבילה',
    pricePerUnit: 9.90,
    requiredStock: 3,
    currentStock: 2,
    shukNote: 'בסיס מעולה לאורז קוקוס או לבן',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-14',
    category: 'dry',
    name: 'קרם / נוזל קוקוס (לאורז קוקוס)',
    unit: 'פחית',
    pricePerUnit: 8.90,
    requiredStock: 2,
    currentStock: 1,
    shukNote: 'מחסני השוק - לבישול אורז קוקוס עשיר',
    link: 'https://www.mck.co.il',
  },
  {
    id: 'prod-15',
    category: 'dry',
    name: 'בורגול עבה / בינוני מובחר',
    unit: 'שקית',
    pricePerUnit: 7.90,
    requiredStock: 2,
    currentStock: 0,
    shukNote: 'תוספת משביעה ומעולה עם בצל מטוגן',
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
  {
    id: 'prod-8',
    category: 'veg',
    name: 'בצל יבש',
    unit: 'ק"ג',
    pricePerUnit: 4.90,
    requiredStock: 3,
    currentStock: 1,
    shukNote: 'לבסיס של כל תבשיל ובורגול',
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

export const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    date: '2026-10-18',
    store: 'מחסני השוק - סניף ראשי',
    description: 'קניית 4 פלטות חזה עוף + 2 פלטות פרגיות + אורז וקוקוס',
    amount: 384.50,
    paidBy: 'יוסי כהן',
    receiptImage: null,
  },
  {
    id: 'exp-2',
    date: '2026-10-12',
    store: 'מחסני השוק',
    description: 'בורגול + ירקות טריים לסלט + נוזל כלים וסקוצ\'ים',
    amount: 142.00,
    paidBy: 'רועי ששון',
    receiptImage: null,
  },
];

export const INITIAL_FUND_DEPOSITS = [
  { id: 'dep-1', memberId: 'm1', amount: 150, date: '2026-10-01' },
  { id: 'dep-2', memberId: 'm2', amount: 150, date: '2026-10-01' },
  { id: 'dep-3', memberId: 'm4', amount: 150, date: '2026-10-01' },
  { id: 'dep-4', memberId: 'm6', amount: 150, date: '2026-10-01' },
  { id: 'dep-5', memberId: 'm7', amount: 150, date: '2026-10-01' },
];

export const INITIAL_DAILY_MENU = {
  protein: 'chicken_breast',
  portionsPerPlate: 3, // ~3 servings per tray/plate
  side: 'אורז קוקוס עשיר',
  notes: 'רועי מעדיף חזה עוף לא חריף, להשאיר קופסה לתומר',
};

export const INITIAL_PAYBOX_LINK = 'https://payboxapp.page.link/shuk-kitchen';
