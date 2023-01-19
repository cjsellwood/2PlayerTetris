import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRbnwtGn71P96Eu0sKVuMrt26eD76qRD0",
  authDomain: "tetris-7accc.firebaseapp.com",
  projectId: "tetris-7accc",
  storageBucket: "tetris-7accc.appspot.com",
  messagingSenderId: "629246452442",
  appId: "1:629246452442:web:b1759e35f9f41193457be3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
