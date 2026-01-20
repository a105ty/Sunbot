// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8e7f6H8i6prEKgxO5RxZCS5E6KE4xdJs",
  authDomain: "sunbot-cb0e1.firebaseapp.com",
  projectId: "sunbot-cb0e1",
  storageBucket: "sunbot-cb0e1.firebasestorage.app",
  messagingSenderId: "570831426115",
  appId: "1:570831426115:web:88105fdff641413fe5baf6",
  measurementId: "G-1DKCC3T58H"
};
// 3. Mulai Firebase (Inisialisasi App dulu)
const app = initializeApp(firebaseConfig);

// 4. Siapkan fitur Auth (Login) dan Database
const auth = getAuth(app);
const db = getFirestore(app);

// 5. Export agar bisa dipakai di file lain (api.js, dll)
export { auth, db };