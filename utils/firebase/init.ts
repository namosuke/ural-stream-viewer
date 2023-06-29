import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAf36rgv61YjuxYJRPz_unf0FyvLxI5rPY",
  authDomain: "ural-stream.firebaseapp.com",
  projectId: "ural-stream",
  storageBucket: "ural-stream.appspot.com",
  messagingSenderId: "72478777363",
  appId: "1:72478777363:web:6f3d3d7582c3c42e13dfe6",
  measurementId: "G-77D3NJ22VF",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
