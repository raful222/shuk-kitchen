import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, enableIndexedDbPersistence } from 'firebase/firestore';

let db = null;
let unsubscribe = null;

export const initFirebase = (config) => {
  try {
    if (!config || !config.projectId) return null;
    
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    return db;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return null;
  }
};

/**
 * Subscribes to real-time changes in the shared kitchen document.
 * Whenever anyone updates data, onDataReceived is called with the new state.
 */
export const subscribeToKitchenData = (config, onDataReceived) => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  const firestoreDb = initFirebase(config);
  if (!firestoreDb) return () => {};

  try {
    const kitchenDocRef = doc(firestoreDb, 'kitchen_workplace', 'shared_state');
    
    unsubscribe = onSnapshot(
      kitchenDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          if (remoteData && remoteData.payload) {
            onDataReceived(remoteData.payload);
          }
        }
      },
      (error) => {
        console.warn('Real-time listener notice:', error);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.error('Failed to subscribe to Firestore:', e);
    return () => {};
  }
};

/**
 * Saves the entire shared kitchen state to the cloud.
 * Triggers real-time update on all other connected phones.
 */
export const syncKitchenDataToCloud = async (config, fullState) => {
  const firestoreDb = initFirebase(config);
  if (!firestoreDb) return false;

  try {
    const kitchenDocRef = doc(firestoreDb, 'kitchen_workplace', 'shared_state');
    await setDoc(kitchenDocRef, {
      payload: fullState,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to push update to cloud database:', error);
    return false;
  }
};
