import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDG_WrTGpvEOcj63x30zaoPt_Sxp0KIpI8",
  authDomain: "shuk-kitchen.firebaseapp.com",
  projectId: "shuk-kitchen",
  storageBucket: "shuk-kitchen.firebasestorage.app",
  messagingSenderId: "847487034525",
  appId: "1:847487034525:web:b1d0abe245f610c59ce074",
  measurementId: "G-GCMHWNX61X"
};

console.log('Connecting to Firestore project shuk-kitchen...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnectionAndReset() {
  try {
    const kitchenDocRef = doc(db, 'kitchen_workplace', 'shared_state');
    
    // Completely clean initial state:
    // Empty members list so they can add their own real names!
    const cleanState = {
      members: [],
      pairs: [],
      schedule: {
        sun: { pairId: null, actualMembers: [], completed: false },
        mon: { pairId: null, actualMembers: [], completed: false },
        tue: { pairId: null, actualMembers: [], completed: false },
        wed: { pairId: null, actualMembers: [], completed: false },
        thu: { pairId: null, actualMembers: [], completed: false },
      },
      weeklyAttendance: {},
      dailyOverrides: {},
      products: [
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
        {
          id: 'prod-3',
          category: 'dry',
          name: 'אורז יסמין קלאסי (1 ק"ג)',
          unit: 'חבילה',
          pricePerUnit: 9.90,
          requiredStock: 3,
          currentStock: 0,
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
          currentStock: 0,
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
          currentStock: 0,
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
          currentStock: 0,
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
          currentStock: 0,
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
          currentStock: 0,
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
      ],
      expenses: [],
      deposits: [],
      dailyMenu: {
        protein: 'chicken_breast',
        portionsPerPlate: 3,
        side: 'אורז קוקוס עשיר',
        notes: '',
      },
      swapRequests: [],
      payboxLink: 'https://payboxapp.page.link/shuk-kitchen',
    };

    console.log('Writing clean state to Firestore document...');
    await setDoc(kitchenDocRef, {
      payload: cleanState,
      lastUpdated: new Date().toISOString(),
    });

    console.log('Successfully written clean state to Firestore!');
    
    // Verify by reading back
    const verifySnap = await getDoc(kitchenDocRef);
    if (verifySnap.exists()) {
      console.log('VERIFIED! Read document back from Firestore successfully!');
      console.log('Data timestamp:', verifySnap.data().lastUpdated);
    }
  } catch (err) {
    console.error('Firestore Error:', err);
  }
}

testConnectionAndReset();
