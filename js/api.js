// js/api.js

import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 1. REGISTER MANUAL (Sesuai Struktur JSON Kamu)
// ==========================================
async function handleRegister() {
    const email = document.getElementById('register-username').value.trim(); 
    const p1 = document.getElementById('register-password1').value.trim();
    const p2 = document.getElementById('register-password2').value.trim();

    if (!email || !p1) return showStatus('status', 'Isi semua data', 'error');
    if (p1 !== p2) return showStatus('status', 'Password tidak sama', 'error');

    showStatus('status', 'Mendaftarkan...', 'warning');

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, p1);
        const user = cred.user;

        // STRUKTUR DATA BARU (SESUAI JSON KAMU)
        const defaultData = {
            username: email.split('@')[0],
            referal_code: "",
            contact: {
                email: email,
                telegram: { chat_id: "", telegram_bot_url: "" }
            },
            exchange: {
                exchange: "tokocrypto",
                api_key: "",
                secret_key: ""
            },
            credit: {
                saldo: 0,
                PROFIT: 0,
                credit_fee_percent: 0.1,
                balance: 0
            },
            state: {}, // Data koin akan masuk sini
            last_login: Date.now()
        };

        await setDoc(doc(db, "users", user.uid), defaultData);
        window.data = { uid: user.uid, ...defaultData };

        showStatus('status', '✅ Berhasil! Login...', 'success');
        if (typeof renderLoginForm === 'function') renderLoginForm();
        
    } catch (error) {
        console.error("Register Error:", error.code);
        // Panggil Penerjemah Error
        const pesan = getFriendlyMessage(error.code);
        showStatus('status', `❌ ${pesan}`, 'error');
    }

}

// ==========================================
// 2. LOGIN MANUAL
// ==========================================
// js/api.js

async function handleLogin() {
    const email = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) return showStatus('login-status', 'Isi email & password', 'error');
    showStatus('login-status', 'Sedang masuk...', 'warning');

    try {
        // 1. Login ke Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // [PENTING] Kita harus ambil data 'user' dari hasil login di atas
        const user = userCredential.user; 

        // 2. Update jam login sekarang (Agar tidak ditendang Security Rules)
        // Karena variabel 'user' sudah ada (baris di atas), ini TIDAK AKAN error lagi
        await updateDoc(doc(db, "users", user.uid), {
            last_login: Date.now() 
        });

        showStatus('login-status', '✅ Login Berhasil!', 'success');
        
        // 3. Render dashboard tanpa refresh
        if (typeof renderLoginForm === 'function') renderLoginForm();

    } catch (error) {
        console.error("Login Error:", error); // Cek Console jika masih error
        const pesan = typeof getFriendlyMessage === 'function' ? getFriendlyMessage(error.code) : error.message;
        showStatus('login-status', `❌ ${pesan}`, 'error');
    }
}
// ==========================================
// 3. LOGOUT
// ==========================================
async function handleLogout() {
    try {
        await signOut(auth); 
        clearSessionData();
        localStorage.removeItem('auth_token');
        if (window.renderLoginForm) window.renderLoginForm();
        if (window.renderAll) window.renderAll();
    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// 4. MAIN LISTENER
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Status: User Login (" + user.email + ")");
        localStorage.setItem('auth_token', 'active');

        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                window.data = { uid: user.uid, ...docSnap.data() };
                localStorage.setItem('cached_data', JSON.stringify(window.data));
                if (window.renderAll) window.renderAll();
            } else {
                // Dokumen tidak ditemukan
                window.data = { uid: user.uid, email: user.email };
            }
            
            localStorage.setItem('cached_data', JSON.stringify(window.data));

            if (window.renderAll) window.renderAll();

        } catch (e) {
            console.error("Akses Ditolak Server:", e.message);
            
            if (e.message.includes("permission") || e.code === "permission-denied") {
                handleLogout(); // Paksa Logout
            }        }

    } else {
        console.log("Status: User Logout");
        window.data = {};
        
        // [BARU] HAPUS CADANGAN SAAT LOGOUT
        localStorage.removeItem('auth_token');
        localStorage.removeItem('cached_data'); 
        localStorage.removeItem('auth_token');
        clearSessionData();
        if (window.renderLoginForm) window.renderLoginForm();
        if (window.renderAll) window.renderAll();
    }
});
// ==========================================
// HELPER: PEMBERSIH DATA (FILTER SECURITY)
// ==========================================
function clearSessionData() {
    console.log("🧹 Membersihkan jejak user...");

    // 1. Hapus Semua Key Sensitif di LocalStorage
    const keysToRemove = [
        'auth_token', 
        'cached_data', 
        'session_start', 
        'user_preferences' // Jika ada nanti
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // 2. Reset Variabel Global di Memori (RAM)
    // Kita reset ke struktur dasar agar tidak error saat render ulang
    window.data = { 
        state: {},      // Kosongkan setting koin
        credit: {},     // Kosongkan saldo
        contact: {},    // Kosongkan email/tele
        exchange: {}    // Kosongkan API Key
    };

    // 3. Reset Pilihan Koin (Opsional, kembalikan ke default)
    if (window.DEFAULT_COINS && window.DEFAULT_COINS.length > 0) {
        window.selected = window.DEFAULT_COINS[0];
    }

    console.log("✅ Session bersih. User aman.");
}
// ==========================================
// HELPER: FUNGSI PENERJEMAH ERROR (Tambahkan di paling bawah file)
// ==========================================
function getFriendlyMessage(errorCode) {
    switch (errorCode) {
        // --- Error Register ---
        case 'auth/email-already-in-use':
            return "Email ini sudah terdaftar. Silakan Login.";
        case 'auth/invalid-email':
            return "Format email tidak valid.";
        case 'auth/weak-password':
            return "Password terlalu lemah. Gunakan kombinasi huruf & angka.";

        // --- Error Login ---
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/wrong-password': 
            // Google menyarankan pesan umum agar hacker tidak bisa menebak email valid
            return "Email atau Password salah."; 
        
        case 'auth/too-many-requests':
            return "Terlalu banyak percobaan gagal. Coba lagi nanti.";
        
        case 'auth/user-disabled':
            return "Akun ini telah dinonaktifkan oleh Admin.";

        // --- Error Server/Jaringan ---
        case 'auth/network-request-failed':
            return "Gagal terhubung. Periksa koneksi internet Anda.";
        case 'auth/internal-error':
            return "Terjadi kesalahan pada server. Coba sesaat lagi.";
        
        // --- Error Lainnya ---
        default:
            return "Terjadi kesalahan: " + errorCode;
    }
}
async function saveCoin(coinRaw, settings) {
    if (!auth.currentUser) return showStatus('status', 'Login dulu!', 'error');
    
    // Gunakan window.idify jika ada, atau fallback manual
    const coinKey = window.idify ? window.idify(coinRaw) : coinRaw.replace(/[^a-zA-Z0-9]/g, '_');

    try {
        // 1. Siapkan data untuk update ke Firestore
        // Kita menggunakan "Dot Notation" agar hanya mengupdate bagian koin tersebut
        const updateData = {};
        updateData[`state.${coinKey}`] = settings;

        // 2. Kirim perintah simpan ke Database
        await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
        
        // 3. Update Data Lokal (RAM) agar UI langsung berubah
        if (!window.data.state) window.data.state = {};
        window.data.state[coinKey] = settings;

        // 4. Update Cadangan (LocalStorage) agar tidak hilang saat refresh
        localStorage.setItem('cached_data', JSON.stringify(window.data));
        
        // 5. Beri notifikasi sukses
        // Pastikan ada elemen dengan id 'status' di HTML atau sesuaikan parameter ini
        if(typeof showStatus === 'function') {
            showStatus('status', `✅ ${coinRaw} tersimpan!`, 'success');
        } else {
            console.log(`✅ ${coinRaw} tersimpan!`);
            alert(`Setting ${coinRaw} berhasil disimpan.`);
        }
        
        return true;
    } catch (e) {
        console.error("Save Error:", e);
        if(typeof showStatus === 'function') {
            showStatus('status', `❌ Gagal: ${e.message}`, 'error');
        } else {
            alert(`Gagal menyimpan: ${e.message}`);
        }
        return false;
    }
}

// ==========================================
// 6. SAVE PROFILE (Simpan Exchange & Contact)
// ==========================================
async function saveUserProfile(payload) {
    if (!auth.currentUser) return;
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), payload);
        
        // Update local object secara manual agar responsif
        if(payload.exchange) window.data.exchange = payload.exchange;
        if(payload.contact) window.data.contact = payload.contact;

        alert("Profil disimpan!");
        if (window.closeModal) window.closeModal();
    } catch (e) {
        alert("Gagal simpan: " + e.message);
    }
}

// Expose ke Window
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.saveCoin = saveCoin;
window.saveUserProfile = saveUserProfile;