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
                // Note: sell_fraction tidak ada di JSON, jadi defaultnya 0
                ttp: settings.trailing_tp ?? false,
                trailing_tp_percent: settings.trailing_tp_percent ?? 0.01,
                layer_percent_base: settings.layer_percent_base ?? 0.006,
                layer_percent_step: settings.layer_percent_step ?? 0.002,
                buy_amount: settings.buy_amount ?? 25,
                max_layer: settings.max_layer ?? 15,
                sell_layer: settings.sell_layer ?? 1,
                sell_fraction: settings.sell_fraction ?? 1, // Tambahkan default yang wajar
                rebound_percent: settings.rebound_percent ?? 0.025,
                trading: settings.trading ?? false // 'trading' di JSON sama dengan 'running'
            };

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class='inner'>                        
                        <div style='display:flex; justify-content: space-between; width: 100%;'>
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
                                <div><label data-tooltip="a">Buy amount (USDT)</label><input id='buy_${id}' type='number' step='0.1' value='${coinSetting.buy_amount}' /></div>
                                <div><label data-tooltip="">Max layers</label><input id='layers_${id}' type='number' value='${coinSetting.max_layer}' /></div>

                                <div><label data-tooltip="">Layer base %</label><input id='base_${id}' type='number' step='0.0001' value='${coinSetting.layer_percent_base}' /></div>
                                <div><label data-tooltip="">Layer step %</label><input id='step_${id}' type='number' step='0.0001' value='${coinSetting.layer_percent_step}' /></div>
                                <div><label data-tooltip="">Trailing TP</label>
                                    <select class='form-control-item' id='trail_${id}'>
                                        <option value='false' ${!coinSetting.ttp ? 'selected' : ''}>Off</option>
                                        <option value='true' ${coinSetting.ttp ? 'selected' : ''}>On</option>
                                    </select>
                                </div>
                                <div><label data-tooltip="">Trailing %</label><input id='trailp_${id}' type='number' step='0.0001' value='${coinSetting.trailing_tp_percent}' /></div>

                                <div><label data-tooltip="">Sell layer %</label><input id='sell_${id}' type='number' step='0.0001' value='${coinSetting.sell_layer}' /></div>

                                <div ><label data-tooltip="">Rebound %</label><input id='rebound_${id}' type='number' step='0.0001' value='${coinSetting.rebound_percent}' /></div>
                                <div><label data-tooltip="">Trading</label><input id='label_${id}' type='text' value='${coinSetting.trading}' /></div>
                            </div>
                    </div>
                </div>`
                ;

            cards.appendChild(card);

            const saveButton = card.querySelector(`#save_${id}`);
            const runButton = card.querySelector(`#run_${id}`);
            const trailSelect = card.querySelector(`#trail_${id}`);
            
            // Set the select value
            if (trailSelect) {
                trailSelect.value = coinSetting.ttp ? 'true' : 'false';
            }

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
                trailing_tp: getSel(`trail_${id}`), // Pastikan key ini sama dengan JSON
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
                <p>SunBot is a demo trading-bot control panel. Founder: Nama Founder. Version: 0.9-demo.</p>
                <div style='text-align:right;margin-top:12px'>
                    <button class='nav-btn' onclick='closeModal()'>Close</button>
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
            
            showModal(`
            <h2>User Profile</h2>
            <div style='display:grid;grid-template-columns:1fr 1fr;gap:8px'>
                <div><label>Username</label>
                    <label>${username}</label>
                </div>
                <div>
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
                </div>
                <div>
                    <label>Credit Fees</label>
                    <label>${credit_fee_percent}</label>
                </div>
                <div>
                    <label>Profit</label>
                    <label>${creditProfit}</label>
                </div>
                <div>
                    <label>Saldo Credit</label>
                    <label>${creditSaldo}</label>
                </div>
                <div>
                    <label>Balance :</label>
                    <label>${balance}</label>
                </div>    

                <div style='grid-column:1/3'>
                    <label>API Key</label>
                    <input id='um_key' type='text' value='***' />
                </div>
                <div style='grid-column:1/3'>
                    <label>Secret Key</label>
                    <input id='um_secret' type='text' value='***' />
                </div>
            </div>
            <div style='display:flex;justify-content:flex-end;gap:8px;margin-top:12px'>
                <button class="nav-btn" id="btnTheme">Theme</button>
                <button class='nav-btn' id='btnSaveUserProfile'>Save</button>
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
    
    // [PENTING] Jika data kosong (belum login), kita buat object kosong
    // supaya kode di bawah tidak error saat baca 'window.data.state'
    if (!window.data) window.data = { state: {} }; 

    // 2. RENDER LOGIN FORM
    // Fungsi ini pintar: kalau belum login dia munculkan form input,
    // kalau sudah login dia munculkan tombol Logout & Saldo.
    if (window.renderLoginForm) window.renderLoginForm();
    
    // ============================================================
    // 3. RENDER DASHBOARD (KOIN & CARD) - INI PERUBAHANNYA
    // ============================================================
    // Dulu kode ini ada di dalam "if (token)". 
    // Sekarang kita keluarkan agar SELALU dieksekusi.
    
    console.log("Merender dashboard (Login/Guest Mode)...");
    
    // A. Render Daftar Koin (Kiri)
    if (window.renderCoins) window.renderCoins();
    
    // B. Pilih Koin Default (Jika belum ada yang dipilih)
    if (!window.selected && window.DEFAULT_COINS?.length > 0) {
        window.selected = window.DEFAULT_COINS[0];
    }
    
    // C. Render Card Setting (Kanan)
    if (typeof window.renderSelectedCard === 'function') {
        window.renderSelectedCard();
    } 
    
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

