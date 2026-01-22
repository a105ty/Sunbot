  window.renderLoginForm = function() {
    const loginView = document.getElementById('login-view');
    if (!loginView) return;

    // Cek token sesi (hanya sebagai penanda UI agar tidak kedip)
    const token = localStorage.getItem('auth_token'); 
    let formHTML = '';

    if (token) {
        // TAMPILAN SUDAH LOGIN
        formHTML = `
            <div class="form-container" style="text-align:center">
                <h3>Halo, ${window.data?.username || 'Trader'}</h3>
                <p>Status: <span style="color:#4caf50">● Terhubung</span></p>
                <p style="font-size:12px; color:#aaa">Saldo: ${window.data?.balance || 0} USDT</p>
                <button onclick="handleLogout()" class="nav-btn" style="background:#ef4444;margin-top:10px">Logout</button>
            </div>`;
    } else {
        // TAMPILAN BELUM LOGIN
        formHTML = `
            <div class="form-container">
                <h2 stle="text-align:center margin-bottom:20px">Login Sunbot</h2>
                <p id="status" class="alert error" style="display:none;"></p>
                
                <input type="text" id="login-username" placeholder="Email (contoh: user@gmail.com)" required>
                <input type="password" id="login-password" placeholder="Password" required>
                
                <button onclick="handleLogin()">Login</button>
                <p class="switch-link">
                    Belum punya akun? <a href="#" onclick="renderRegisterForm()">Register</a>
                </p>
                <pre id="bot-state-data">Hai Sunbot Man</pre>
            </div>`;
    } 
    loginView.innerHTML = formHTML;
}

window.renderRegisterForm = function() {
    const loginView = document.getElementById('login-view');
    if (!loginView) return; 

    loginView.innerHTML = `
        <div class="form-container" style="min-height: auto; height: auto; padding: 5px;">
            <h2 style="margin: 0 0 10px 0; font-size: 1.2rem;">Register Sunbot</h2>

            <p id="status" class="alert error" style="display:none; padding: 5px; margin-bottom: 5px; font-size: 12px;">
                Silahkan daftar akun Anda
            </p>
            
            <input type="text" id="register-username" placeholder="Email" required 
                   style="margin: 4px 0; padding: 8px; font-size: 13px;">
            
            <input type="password" id="register-password1" placeholder="Password (min 6 karakter)" required 
                   style="margin: 4px 0; padding: 8px; font-size: 13px;">
            
            <input type="password" id="register-password2" placeholder="Ulangi Password" required 
                   style="margin: 4px 0; padding: 8px; font-size: 13px;">
            <input data-tooltip="Kode Referral (Opsional) dapatkan diskon!!" type="text" id="register-ref" placeholder="Kode Referral (Opsional)"  
                   style="margin: 4px 0; padding: 8px; font-size: 13px;">
            
           
            <button onclick="handleRegister()" style="margin-top: 8px; padding: 8px; font-size: 14px;">Register</button>
            
            <p class="switch-link" style="margin-top: 10px; font-size: 12px;">
                Sudah punya akun? <a href="#" onclick="renderLoginForm()">Login</a>
            </p>
        </div>`;
}
//=================================================================
// ---------- select & render selected card ----------
//=================================================================
window.renderCoins = function() {
    const wrap = document.getElementById('coinsList');
    if (!wrap) return;
    wrap.innerHTML = '';           
    
    // Pastikan list koin ada
    const coinsList = DEFAULT_COINS;

    coinsList.forEach(coin => {
        // [UBAH DISINI] Gunakan ID yang aman (ADA_USDT) untuk akses ke 'state'
        const id = window.idify(coin); 
        const settings = (window.data?.state?.[id]) || {};
        const isTrading = settings.trading || false;
        
        const row = document.createElement('div');
        row.className = 'coin-item';
        
        row.innerHTML = `
        <div class='meta'>
            <div class='sym'>${coin}</div>
        </div>
        <div style='display:flex;gap:8px'>         
            <button id='run_${id}' data-tooltip="${isTrading ? 'Matikan Bot' : 'Jalankan Bot'}">
                ${isTrading ? 'Stop' : 'Run'}
            </button> 
            <button class='nav-btn' onclick="window.selectCoin('${coin}')">Settings</button>
        </div>`

        const runBtn = row.querySelector(`#run_${id}`);
        if(runBtn) {
            runBtn.onclick = () => window.toggleCoinTrading(coin);
        }
        wrap.appendChild(row);
    });
}
       
window.selectCoin = function(coin) {
    window.selected = coin;
    
    // Update judul di panel kanan
    const elTitle = document.getElementById('selectedCoin');
    if(elTitle) elTitle.textContent = coin;
    
    const elSub = document.getElementById('selectedSubtitle');
    if(elSub) elSub.textContent = 'Edit per-coin settings below';
    
    // Render ulang card di kanan
    if(window.renderSelectedCard) window.renderSelectedCard();
}
window.selectCoin(selected || window.DEFAULT_COINS[0]);

window.renderSelectedCard = function() {
            const cards = document.getElementById('cards');
            if(!cards) return;
            cards.innerHTML = '';   
            
            const coin = window.selected;
            if (!coin) return;

            const id = window.idify(coin); 
            const settings = (window.data?.state?.[id]) || {};
            const isTrading = settings.trading || false;
            const coinSetting = {
                trailing_tp: settings.trailing_tp ?? false,
                trailing_tp_percent: settings.trailing_tp_percent ?? 0.01,
                layer_percent_base: settings.layer_percent_base ?? 0.006,
                layer_percent_step: settings.layer_percent_step ?? 0.002,
                buy_amount: settings.buy_amount ?? 25,
                max_layer: settings.max_layer ?? 15,
                rebound_percent: settings.rebound_percent ?? 0.025,
            };

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                            <div class='inner'>                        
                                    <div style='display:flex; justify-content: space-between; width: 100%; '>
                                        <div>
                                            <strong>${escapeHtml(selected)}</strong>
                                            <div class='small'>per-coin bot settings</div>
                                        </div>
                                        
                                        <div style='display:flex;gap:8px'>
                                            <button id='run_${id}' data-tooltip="${isTrading ? 'Matikan Bot' : 'Jalankan Bot'}">
                                                ${isTrading ? 'Stop' : 'Run'}
                                            </button> 
                                            <button class='save-btn' id='save_${id}' data-tooltip="Save Bot Settings">Save</button>
                                        </div>
                                    </div>
                                    <div class='chart' id='chart_${id}' style='margin-top:12px'>Chart will appear here</div>
                                    <div style='margin-top:12px'>
                                        <div class='form-grid'>
                                            <div data-tooltip="The amount of USDT to buy"><label >Buy amount (USDT)</label><input id='buy_${id}' type='number' step='0.1' value='${coinSetting.buy_amount}' /></div>
                                            <div data-tooltip="Maximum number of Buy layers"><label >Max layers</label><input id='layers_${id}' type='number' value='${coinSetting.max_layer}' /></div>

                                            <div data-tooltip="base increment for each layer">
                                                <label >Layer base</label>
                                                <input id='base_${id}' type='number' step='0.0001' value='${coinSetting.layer_percent_base}' />
                                            </div>
                                            <div data-tooltip="extra increment for each layer">
                                                <label >Layer Increment Step</label>
                                                <input id='step_${id}' type='number' step='0.0001' value='${coinSetting.layer_percent_step}' />
                                            </div>

                                            <div data-tooltip="Take Profit with Trailing">
                                                <label >Trailing TP</label>
                                                <input id='trail_${id}' type='checkbox' ${coinSetting.trailing_tp ? 'checked' : ''} />
                                            </div>
                                            <div data-tooltip="Trailing Take Profit Triger">
                                                <label >Trailing</label>
                                                <input id='trailp_${id}' type='number' step='0.0001' value='${coinSetting.trailing_tp_percent}' />
                                            </div>
                                            <div data-tooltip="Rebound Trigger"><label >Rebound</label><input id='rebound_${id}' type='number' step='0.0001' value='${coinSetting.rebound_percent}' />
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>`
                            ;

            cards.appendChild(card);

            const saveButton = card.querySelector(`#save_${id}`);
            const runButton = card.querySelector(`#run_${id}`);

            // Attach save handler
            if (saveButton) {
                saveButton.onclick = () => {
                    const updatedSettings = collectCardSettings(selected);
                    // Tambahkan window.
                    if(window.saveCoin) window.saveCoin(selected, updatedSettings);
                };
            }

            if (runButton) {
                runButton.onclick = () => {
                    // Tambahkan window.
                    if(window.toggleCoinTrading) window.toggleCoinTrading(selected);
                };
            }
            
            // chart - placeholder or TradingView try
            renderTradingView(selected, 'chart_' + id);
        }
function collectCardSettings(coin) {
            const id = window.idify(coin);
            const getNum = (eid) => { const el = document.getElementById(eid); return el ? parseFloat(el.value) || 0 : 0; };
            const getSel = (eid) => { const el = document.getElementById(eid); return el ? el.value === 'true' : false; };
            const isChecked = (eid) => { 
                const el = document.getElementById(eid); 
                return el ? el.checked : false; 
            };
            // Ambil status trading lama dari 'state'
            const oldState = window.data?.state?.[id]?.trading || false;

            return {
                buy_amount: getNum(`buy_${id}`),
                max_layer: getNum(`layers_${id}`),
                layer_percent_base: getNum(`base_${id}`),
                layer_percent_step: getNum(`step_${id}`),
                trailing_tp_percent: getNum(`trailp_${id}`),
                sell_layer: getNum(`sell_${id}`),
                rebound_percent: getNum(`rebound_${id}`),
                trailing_tp: isChecked(`trail_${id}`),
                trading: oldState
                
            };
        }
window.toggleCoinTrading = async function(coin) {
    const id = window.idify(coin);
    let settings;
    
    if (document.getElementById(`buy_${id}`)) {
        settings = collectCardSettings(coin);
    } else {
        // [UBAH DISINI] Baca dari state
        settings = (window.data?.state?.[id]) || {};
    }

    const newStatus = !settings.trading;
    settings.trading = newStatus;

    if (window.saveCoin) {
        const success = await window.saveCoin(coin, settings);
        if(success) {
            if(window.renderCoins) window.renderCoins();
            if (window.selected === coin) {
                window.renderSelectedCard(); 
            }
        }
    }
}
        
        

        // ---------------- tradingview loader ----------------
        function loadTradingView() {
            if (window.TradingView || document.getElementById('tvjs')) return;
            const s = document.createElement('script');
            s.id = 'tvjs';
            s.src = 'https://s3.tradingview.com/tv.js';
            document.head.appendChild(s);
        };
        loadTradingView();

        


        
        // === Fungsi awal untuk membuka chart modal ===
        function openChart() {
            renderAllCharts();
        }
        // ---------- About & User modals ----------
        function openAbout() {
            modalContent.style.removeProperty('min-width');    // Re-bind tombol add setelah modal dirender
            showModal(`
                <h2>About SunBot</h2>
                <p>SunBot is a trading-bot. Version: 0.9-demo. This is a demo version. thank you for using it and your support.</p>
                <div style='text-align:right;margin-top:12px'>
                    <button class='nav-btn' onclick='closeModal()' data-tooltip="Close About">Close</button>
                </div>`);
        }
        
        function openUser() {
            modalContent.style.removeProperty('min-width');    // Re-bind tombol add setelah modal dirender
            
            const username = window.data?.username || 'User';
            const exchange = window.data?.exchange?.exchange || '';
            const telegramChatId = window.data?.contact?.telegram?.chat_id || '';
            const telegramBotUrl = window.data?.contact?.telegram?.telegram_bot_url || '';
            const email = window.data?.contact?.email || '';
            const credit_fee_percent = window.data?.credit?.credit_fee_percent || 0;
            const creditProfit = window.data?.credit?.PROFIT || 0;
            const creditSaldo = window.data?.credit?.saldo || 0;
            const balance = window.data?.credit?.balance || 0; 
            const uplink = window.data?.uplink || 'N/A';
            const downlink = window.data?.downlink || 'N/A';

            showModal(`
            <h2>User Profile</h2>
            <div style='display:grid;grid-template-columns:1fr 1fr;gap:8px'>
                <div><label>Username</label>
                    <label>${username}</label>
                </div>
                <div data-tooltip="The exchange you are using for Sunbot">
                    <label>Exchange</label>
                    <label>${exchange}</label>
                </div>
                <div>           
                    <div>
                        <label>Telegram Chat ID</label>
                        <input id='um_teleid' type='text' value='${telegramChatId}' style='margin-top:8px' />
                    </div>
                    <div>
                        <label>Telegram Chat URL</label>
                        <input id='um_teleurl' type='text' value='${telegramBotUrl}' style='margin-top:8px' />
                    </div>
                </div>
                <div>    
                    <div>
                        <label>Email</label>
                        <input id='um_email' type='text' value='${email}' style='margin-top:8px' />
                    </div>

                    <div data-tooltip="Your friends referral code ">
                        <label>Uplink</label>
                        <label>${uplink}</label>
                    </div>
                    <div data-tooltip="Give your referral code ro your fiends to get bonus">
                        <label>Your Referral Code</label>
                        <label>${downlink}</label>
                    </div>
                </div>
                <div data-tooltip="Charge from your profit with Sunbot services">
                    <label>Credit Fees</label>
                    <label>${credit_fee_percent}</label>
                </div>
                <div>
                    <label>Profit</label>
                    <label>${creditProfit}</label>
                </div>
                <div data-tooltip="Credit saldo available for trading">
                    <label>Saldo Credit</label>
                    <label>${creditSaldo}</label>
                </div>
                <div data-tooltip="Total USDT">
                    <label>Balance :</label>
                    <label>${balance}</label>
                </div>    

                <div style='grid-column:1/3' data-tooltip="Your API key for exchange connection (kept secret)">
                    <label>API Key</label>
                    <input id='um_key' type='text' value='***' />
                </div>
                <div style='grid-column:1/3' data-tooltip="Your Secret Key for exchange connection (kept secret)">
                    <label>Secret Key</label>
                    <input id='um_secret' type='text' value='***' />
                </div>
            </div>
            <div style='display:flex;justify-content:flex-end;gap:8px;margin-top:12px'>
                <button class="nav-btn" id="btnTheme" data-tooltip="Change Theme">Theme</button>
                <button class='nav-btn' id='btnSaveUserProfile' data-tooltip="Save User Profile">Save</button>
                <button class='nav-btn' onclick='closeModal()'>Close</button>
            </div>`);
            document.getElementById('btnSaveUserProfile').onclick = () => {
                const payload = {
                    exchange: {
                        api_key: document.getElementById('um_key').value,
                        secret_key: document.getElementById('um_secret').value
                    },
                    contact: {
                        email: email, // Email biarkan tetap
                        telegram: {
                            chat_id: document.getElementById('um_teleid').value,
                            telegram_bot_url: document.getElementById('um_teleurl').value
                        }
                    }
                };
                if(window.saveUserProfile) window.saveUserProfile(payload);            };
             document.getElementById('btnTheme').onclick = () => { // Buat HTML untuk daftar pilihan tema
                window.openThemeSelector();
            };
        }
        // Fungsi pembuka Modal Utama

        function openAcademy() {
            // 1. Atur lebar modal menjadi 90% dari layar/web app
            if (modalContent) {
                modalContent.style.width = '90%';
                modalContent.style.maxWidth = 'none'; // Hapus batasan max-width jika ada
                modalContent.style.height = 'auto';   // Agar tinggi menyesuaikan isi
                modalContent.style.minHeight = '50vh'; // Minimal tinggi setengah layar agar bagus
            }

            // 2. Panggil fungsi untuk menampilkan daftar modul pertama kali
            renderModuleList();
        }

        
        // ============================================================
        // 4. LOGIC TEMA (THEME) - PERBAIKAN DI SINI
        // ============================================================

        // Fungsi untuk menerapkan tema
        window.applyTheme = function(themeName) {
            // 1. Hapus semua class tema yang mungkin ada
            document.body.classList.remove('theme-coinbase', 'theme-electric', 'theme-light');
            
            // 2. Tambahkan class tema baru (kecuali default)
            if (themeName && themeName !== 'default') {
                document.body.classList.add('theme-' + themeName);
            }
            
            // 3. Simpan ke LocalStorage agar tidak hilang saat refresh
            localStorage.setItem('site_theme', themeName);
            console.log("Tema diubah ke:", themeName);

            // 4. Tutup modal jika sedang terbuka
            window.closeModal();
        }

// Fungsi untuk membuka Pilihan Tema
window.openThemeSelector = function() {
    const themes = window.THEMES || [
        { name: 'Default', value: 'default' },
        { name: 'Electric', value: 'electric' },
        { name: 'Light', value: 'light' }
    ];

    // Buat tombol untuk setiap tema
    const buttonsHtml = themes.map(t => `
        <button class="pill" 
            style="margin: 5px; cursor: pointer;"
            onclick="applyTheme('${t.value}')">
            ${t.name}
        </button>
    `).join('');

    showModal(`
        <h2>Pilih Tema</h2>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:20px;">
            ${buttonsHtml}
        </div>
        <div style='text-align:right;margin-top:20px'>
            <button class='nav-btn' onclick='closeModal()'>Batal</button>
        </div>
    `);
}
window.handleServerAlert = async function() {
    // 1. Cek apakah ada pesan dari server?
    const alertData = window.data?.server_alert;

    // 2. Jika ada, dan statusnya masih ACTIVE (belum dibaca/ditutup)
    if (alertData && alertData.is_active) {
        
        // Tampilkan Notifikasi menggunakan fungsi showStatus kamu
        // alertData.type bisa 'error' (merah), 'warning' (kuning), 'success' (hijau)
        if (typeof showStatus === 'function') {
            showStatus('status', `🔔 SISTEM: ${alertData.message}`, alertData.type || 'info');
        } else {
            alert(`SISTEM: ${alertData.message}`);
        }

        // 3. MATIKAN PESAN (Agar tidak muncul terus menerus saat refresh)
        // Kita update 'is_active' jadi false di Firebase
        try {
            const uid = auth.currentUser?.uid;
            if (uid) {
                // Kita gunakan updateDoc dari firebase/firestore
                // Pastikan kamu import updateDoc dan doc di bagian atas module script kamu jika perlu,
                // atau gunakan global variable 'db' yg sudah ada.
                await updateDoc(doc(db, "users", uid), {
                    "server_alert.is_active": false
                });
                console.log("✅ Pesan server ditandai sudah dibaca.");
            }
        } catch (e) {
            console.error("Gagal mark-as-read notifikasi:", e);
        }
    }
}
// js/app.js - Bagian Paling Bawah

window.renderAll = async function() {
    console.log("🚀 RenderAll dimulai...");

    // 1. CEK CACHE & INISIALISASI DATA
    const cachedData = localStorage.getItem('cached_data');
    if ((!window.data || Object.keys(window.data).length === 0) && cachedData) {
        try {
            window.data = JSON.parse(cachedData);
            console.log("✅ Data dipulihkan dari Cache.");
        } catch (e) {
            console.error("Cache rusak.");
        }
    }
    if (!window.data) window.data = { state: {} }; 
    if (window.renderLoginForm) window.renderLoginForm();
    console.log("Merender dashboard (Login/Guest Mode)...");
    if (window.renderCoins) window.renderCoins();
    if (!window.selected && window.DEFAULT_COINS?.length > 0) {
        window.selected = window.DEFAULT_COINS[0];
    }
    if (typeof window.renderSelectedCard === 'function') {
        window.renderSelectedCard();
    } 
    if (window.handleServerAlert) window.handleServerAlert();
    // ============================================================

    // 4. TERAPKAN TEMA
    const savedTheme = localStorage.getItem('site_theme');
    if (window.applyTheme && savedTheme) window.applyTheme(savedTheme);
}

// Inisialisasi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
    // Bind tombol-tombol header
    if(document.getElementById('btnChart')) document.getElementById('btnChart').onclick = openChart;
    if(document.getElementById('btnAbout')) document.getElementById('btnAbout').onclick = openAbout;
    if(document.getElementById('btnAcademy')) document.getElementById('btnAcademy').onclick = openAcademy;
    if(document.getElementById('btnUser')) document.getElementById('btnUser').onclick = openUser;

    // Panggil renderAll pertama kali
    if(window.renderAll) window.renderAll();
});

