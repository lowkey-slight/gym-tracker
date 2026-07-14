import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

// Public client identifiers — security lives in Firestore rules, not here.
const firebaseConfig = {
  apiKey: 'AIzaSyDCGl3An_zjpCELPEne5tnvvpnNUyiwVPM',
  authDomain: 'gymlogs-202ee.firebaseapp.com',
  projectId: 'gymlogs-202ee',
  storageBucket: 'gymlogs-202ee.firebasestorage.app',
  messagingSenderId: '715330191849',
  appId: '1:715330191849:web:cebb64821e9d969b2c0b78',
  measurementId: 'G-43S32FQ776',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Offline-first: reads/writes hit the local cache immediately and sync when online.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})
