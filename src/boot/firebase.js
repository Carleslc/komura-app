// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from 'firebase/app';

import 'firebase/auth';
// import 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAjFIyCp-dsix1cyFv9gk2XYsOpRU-S2qI',
  authDomain: 'komura-app.firebaseapp.com',
  databaseURL: 'https://komura-app.firebaseio.com',
  projectId: 'komura-app',
  storageBucket: 'komura-app.appspot.com',
  messagingSenderId: '271844254809',
  appId: '1:271844254809:web:02bf8fcbfd3cce8b333d48',
  measurementId: 'G-EQKMW6SJY6'
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseAuth = firebaseApp.auth();
// const firebaseDb = firebaseApp.database();

export { firebase, firebaseAuth /* firebaseDb */ };
