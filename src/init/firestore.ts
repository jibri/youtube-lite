// Initialize Cloud Firestore through Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// config firebase
const firebaseConfig = {
  apiKey: "AIzaSyCyqMQ1prIpkE1zu7CwtJBvAeL1yPfez2I",
  authDomain: "lite-280209.firebaseapp.com",
  databaseURL: "https://lite-280209.firebaseio.com",
  projectId: "youtube-lite-280209",
  storageBucket: "youtube-lite-280209.appspot.com",
  messagingSenderId: "468424122318",
  appId: "1:468424122318:web:146925b7493aae3f82559f",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore();

// on localhost we connect to the emulator
// if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
//   connectFirestoreEmulator(db, "localhost", 8080);
// }

// Enable offline mode
// enableIndexedDbPersistence(db).catch((err) => {
//   if (err.code === "failed-precondition") {
//     // Multiple tabs open, persistence can only be enabled
//     // in one tab at a a time.
//     console.log("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
//   } else if (err.code === "unimplemented") {
//     // The current browser does not support all of the
//     // features required to enable persistence
//     console.log(
//       "The current browser does not support all of the features required to enable persistence"
//     );
//   }
// });
