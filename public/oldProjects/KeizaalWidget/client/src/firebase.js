import { initializeApp } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database';

// ─────────────────────────────────────────────────────────────────────────────
//  SETUP — one-time, takes ~5 minutes:
//
//  1. Go to https://console.firebase.google.com → "Add project" (free plan)
//  2. In the project: Build > Realtime Database > Create database
//     → choose a region → Start in TEST mode (allows all reads/writes)
//  3. Project Overview → "</> Web" → register app → copy the config object
//  4. Replace every "REPLACE_ME" below with your values
//  5. npm run build and redeploy
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            'REPLACE_ME',
  authDomain:        'REPLACE_ME.firebaseapp.com',
  databaseURL:       'https://REPLACE_ME-default-rtdb.firebaseio.com',
  projectId:         'REPLACE_ME',
  storageBucket:     'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId:             'REPLACE_ME',
};

export const FIREBASE_READY = Object.values(firebaseConfig).every(v => v !== 'REPLACE_ME');

let _db = null;
if (FIREBASE_READY) {
  _db = getDatabase(initializeApp(firebaseConfig));
}

export const db = _db;

export const mkRef  = (id) => FIREBASE_READY ? ref(db, `keizaal/markers/${id}`) : null;
export const allRef = ()   => FIREBASE_READY ? ref(db, 'keizaal/markers')       : null;
