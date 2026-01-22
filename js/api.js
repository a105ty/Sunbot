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
    const refInput = document.getElementById('register-ref').value.trim().toUpperCase(); // Kode punya orang lain
    
    if (!email || !p1) return showStatus('status', 'Isi semua data', 'error');
    if (p1 !== p2) return showStatus('status', 'Password tidak sama', 'error');

    showStatus('status', 'Mendaftarkan...', 'warning');

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, p1);
        const user = cred.user;

        const prefix = email.split('@')[0].substring(0, 4).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const generatedCode = prefix + randomNum;
                

        // STRUKTUR DATA BARU (SESUAI JSON KAMU)
        const defaultData = {
            username: email.split('@')[0],
            up_link: refInput ? refInput : "",//Anda menggunakan kode referral orang lain untuk mendaftar
            down_link: generatedCode,//Anda memberikan kode referral Anda kepada orang lain,
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
    showStatus('status', 'Sedang masuk...', 'warning');

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

        showStatus('status', '✅ Login Berhasil!', 'success');
        
        // 3. Render dashboard tanpa refresh
        if (typeof renderLoginForm === 'function') renderLoginForm();

    } catch (error) {
        console.error("Login Error:", error); // Cek Console jika masih error
        const pesan = typeof getFriendlyMessage === 'function' ? getFriendlyMessage(error.code) : error.message;
        showStatus('status', `❌ ${pesan}`, 'error');
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

    // Sanitasi nama koin
    const coinKey = window.idify ? window.idify(coinRaw) : coinRaw.replace(/[^a-zA-Z0-9]/g, '_');

    try {
        // --- 1. UPDATE FIREBASE (Cloud) ---
       
        const updateData = {};
        for (const [key, value] of Object.entries(settings)) {
            updateData[`state.${coinKey}.${key}`] = value;
        }

        // Kirim ke database
        await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
        
        // --- 2. UPDATE LOKAL (RAM) ---
        if (!window.data.state) window.data.state = {};
        const oldData = window.data.state[coinKey] || {};
        window.data.state[coinKey] = {
            ...oldData,
            ...settings
        };        
        console.log(`✅ Save Coin ${coinKey} success!`, window.data.state[coinKey]);

        // --- 3. UPDATE STORAGE (Cache Browser) ---
        localStorage.setItem('cached_data', JSON.stringify(window.data));
        
        // --- 4. NOTIFIKASI ---
        if(typeof showStatus === 'function') {
            showStatus('status', `✅ ${coinRaw} Save Success!`, 'success');
        } 
        return true;

    } catch (e) {
        console.error("Save Error:", e);
        if(typeof showStatus === 'function') {
            showStatus('status', `❌ Save Failed: ${e.message}`, 'error');
        }
        return false;
    }
}
// ==========================================
// 6. SAVE PROFILE (Simpan Exchange & Contact)
// ==========================================
async function saveUserProfile(payload) {
    if (!auth.currentUser) {
        if(typeof showStatus === 'function') showStatus('status', 'Login dulu!', 'error');
        else alert('Login dulu!');
        return;
    }

    try {
        // 1. Update ke Firebase
        // (Asumsi: payload sudah berisi data lengkap untuk exchange/contact)
        await updateDoc(doc(db, "users", auth.currentUser.uid), payload);
        
        // 2. Update Local Data (RAM) dengan AMAN (Merging)
        // Gunakan 'Spread Operator' (...) agar data lama tidak hilang
        if (payload.exchange) {
            window.data.exchange = {
                ...(window.data.exchange || {}), // Ambil data lama
                ...payload.exchange              // Timpa dengan yang baru
            };
        }

        if (payload.contact) {
            window.data.contact = {
                ...(window.data.contact || {}),
                ...payload.contact
            };
        }

        // 3. Update Cache Browser (PENTING!)
        // Agar saat di-refresh, data baru tetap tampil
        localStorage.setItem('cached_data', JSON.stringify(window.data));

        // 4. Feedback ke User
        console.log("✅ Profile Updated:", window.data);
        
        if (typeof showStatus === 'function') {
            showStatus('status', 'Profil berhasil disimpan!', 'success');
        } else {
            alert("Profil disimpan!");
        }

        if (window.closeModal) window.closeModal();

    } catch (e) {
        console.error("Save Profile Error:", e);
        if (typeof showStatus === 'function') {
            showStatus('status', "Gagal simpan: " + e.message, 'error');
        } else {
            alert("Gagal simpan: " + e.message);
        }
    }
}

// Expose ke Window
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.saveCoin = saveCoin;
window.saveUserProfile = saveUserProfile;