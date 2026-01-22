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
                <p id="login-status" class="alert error" style="display:none;"></p>
                
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
            
            <p id="register-status" class="alert error" style="display:none; padding: 5px; margin-bottom: 5px; font-size: 12px;">
                Silahkan daftar akun Anda
            </p>
            
            <input type="text" id="register-username" placeholder="Email" required 
                   style="margin: 4px 0; padding: 8px; font-size: 13px;">
            
            <input type="password" id="register-password1" placeholder="Password (min 6 karakter)" required 
                   style="margin: 4px 0; padding: 8px; font-size: 13px;">
            
            <input type="password" id="register-password2" placeholder="Ulangi Password" required 
                   style="margin: 4px 0; padding: 8px; font-size: 13px;">
            
            <button onclick="handleRegisterClick()" style="margin-top: 8px; padding: 8px; font-size: 14px;">Register</button>
            
            <p class="switch-link" style="margin-top: 10px; font-size: 12px;">
                Sudah punya akun? <a href="#" onclick="renderLoginForm()">Login</a>
            </p>
        </div>`;
}

        // LOAD CONFIG
        async function loadConfig() {            
            try {
                const response = 0;
                if (response.status === 401) {
                    // Token invalid atau expired
                    return handleLogout(false);
                }
                const data = await response.json();
                window.data = data;   // simpan global (opsional)

                if (data.success) {
                    console.log("Config loaded:", data.config);
                } else {
                    showStatus('status', 'Gagal memuat data konfigurasi.', 'error');
                }
            } catch {
                showStatus('status', 'Kesalahan saat memuat data.', 'error');
            }
        }      



 // ---------- select & render selected card ----------
        function renderCoins() {
            const wrap = document.getElementById('coinsList');
            wrap.innerHTML = '';           
            
            DEFAULT_COINS.forEach(coin => {
                const settings = (window.data?.config?.state?.[coin]) ?? {};
                const isTrading = settings.trading ?? false;
                const id = idify(coin);
                const row = document.createElement('div');
                row.className = 'coin-item';
                
                // 1. Set the innerHTML as usual.
                row.innerHTML = `
                <div class='meta'>
                    <div class='sym'>${escapeHtml(coin)}</div>
                </div>
                <div style='display:flex;gap:8px'>         
                    <button id='run_${id}'></button> <button class='nav-btn' onclick="selectCoin('${coin}')">Settings</button>
                </div>`

                // 2. Find the button *within the created row* element.
                //    Use querySelector to find the element by its ID inside 'row'.
                const runButton = row.querySelector(`#run_${id}`);
                
                // 3. Set the text content and attach the event handler directly.
                if (runButton) {
                    runButton.textContent = isTrading ? 'Stop' : 'Run';
                    runButton.onclick = () => {
                        console.log('Toggling trading for', coin);
                        toggleCoinTrading(coin);
                    };
                }

                // 4. Finally, append the row to the DOM.
                wrap.appendChild(row);
            })
        }
       
        // js/app.js

// GANTI baris 'function selectCoin(coin) {' menjadi:
window.selectCoin = function(coin) {
    selected = coin;
    
    // Update judul di panel kanan
    const elTitle = document.getElementById('selectedCoin');
    if(elTitle) elTitle.textContent = coin;
    
    const elSub = document.getElementById('selectedSubtitle');
    if(elSub) elSub.textContent = 'Edit per-coin settings below';
    
    // Render ulang card di kanan
    renderSelectedCard();
}

// Pastikan inisialisasi awal juga memanggil versi window
window.selectCoin(selected || window.DEFAULT_COINS[0]);

        function renderSelectedCard() {
            const cards = document.getElementById('cards');
            cards.innerHTML = '';
            
            const id = idify(selected);
            const settings = (window.data?.config?.state?.[selected]) ?? {};
            const isTrading = settings.trading ?? false;
            const coinSetting = {
                // Note: sell_fraction tidak ada di JSON, jadi defaultnya 0
                ttp: settings.trailing_tp ?? false,
                trailing_tp_percent: settings.trailing_tp_percent ?? 0.01,
                layer_percent_base: settings.layer_percent_base ?? 0.006,
                layer_percent_step: settings.layer_percent_step ?? 0.002,
                buy_amount: settings.buy_amount ?? 6,
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
                                <button id='run_${id}'>${isTrading ? 'Stop' : 'Run'}</button>
                                <button class='save-btn' id='save_${id}'>Save</button>
                            </div>
                        </div>
                        <div class='chart' id='chart_${id}' style='margin-top:12px'>Chart will appear here</div>
                        <div style='margin-top:12px'>
                            <div class='form-grid'>
                                <div><label>Buy amount (USDT)</label><input id='buy_${id}' type='number' step='0.1' value='${coinSetting.buy_amount}' /></div>
                                <div><label>Max layers</label><input id='layers_${id}' type='number' value='${coinSetting.max_layer}' /></div>

                                <div><label>Layer base %</label><input id='base_${id}' type='number' step='0.0001' value='${coinSetting.layer_percent_base}' /></div>
                                <div><label>Layer step %</label><input id='step_${id}' type='number' step='0.0001' value='${coinSetting.layer_percent_step}' /></div>

                                <div><label>Trailing TP</label>
                                    <select class='form-control-item' id='trail_${id}'>
                                        <option value='false' ${!coinSetting.ttp ? 'selected' : ''}>Off</option>
                                        <option value='true' ${coinSetting.ttp ? 'selected' : ''}>On</option>
                                    </select>
                                </div>
                                <div><label>Trailing %</label><input id='trailp_${id}' type='number' step='0.0001' value='${coinSetting.trailing_tp_percent}' /></div>

                                <div><label>Sell layer %</label><input id='sell_${id}' type='number' step='0.0001' value='${coinSetting.sell_layer}' /></div>

                                <div ><label>Rebound %</label><input id='rebound_${id}' type='number' step='0.0001' value='${coinSetting.rebound_percent}' /></div>
                                <div><label>Trading</label><input id='label_${id}' type='text' value='${coinSetting.trading}' /></div>
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
                    console.log('Saving settings for', selected, updatedSettings);
                    saveCoin(selected, updatedSettings);
                };
            }

            // Attach run handler (The original problem element)
            if (runButton) {
                runButton.onclick = () => {
                    console.log('Toggling trading for', selected);
                    toggleCoinTrading(selected);
                };
            }
            
            // chart - placeholder or TradingView try
            renderTradingView(selected, 'chart_' + id);
        }
        
        async function toggleCoinTrading(coin) {
            const id = idify(coin);
            // 1. Correctly find the button again (must be done after DOM insertion)
            // We'll use document.getElementById since the card is now rendered.
            const runBtn = document.getElementById(`run_${id}`); 
            
            // 2. FIX: Ensure the return is CONDITIONAL using curly braces {}
            if (!runBtn) { 
                showStatus('status', `⚠️ Koin ${coin} BELUM memiliki tombol trading.`, 'warning');
                return; // Exit the function ONLY if the button is not found
            }
            
            // Kumpulkan pengaturan terbaru dari form
            const updatedSettings = collectCardSettings(coin);

            // Dapatkan status saat ini untuk di-toggle
            const currentTradingStatus = window.data?.config?.state?.[coin]?.trading;
            
            // Cek apakah konfigurasi ada sebelum melanjutkan
            if (currentTradingStatus === undefined) {
                showStatus('status', `⚠️ Koin ${coin} BELUM memiliki konfigurasi trading yang tersimpan.`, 'warning');
                return;
            }
            
            // Toggle status trading
            const newTradingStatus = !currentTradingStatus; // Store the intended new status
            updatedSettings.trading = newTradingStatus;

            // Lakukan pembaruan dan simpan
            const success = await saveCoin(coin, updatedSettings);
            
            if (success) {
                // FIX: Use the 'newTradingStatus' variable (or updatedSettings.trading)
                runBtn.style.backgroundColor = newTradingStatus ? "#4CAF50" : "#f44336"; // Green for running, red for stopped
                runBtn.textContent = newTradingStatus ? 'Stop' : 'Run'; // Update the button text
                showStatus('status', `✅ Status trading ${coin} ${newTradingStatus ? 'Running' : 'Stopped'}.`, 'success');

                // Panggil renderSelectedCard() untuk memperbarui seluruh tampilan card
                // This will re-render the card, ensuring the trading status indicator/input is correct.
                renderSelectedCard(); 
            }
            else {
                // Jika gagal, jangan ubah tombol
                showStatus('status', `❌ Gagal mengubah status trading untuk ${coin}.`, 'error');
            }
        }
        async function saveCoin(coin, settings) {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert("Anda belum login.");
                return false;
            }

            try {
                const response = await fetch(`${API_BASE}/save_coin`, {   // <-- changed endpoint
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({
                        symbol: coin,   // gunakan 'symbol' sesuai backend
                        state: settings
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showStatus('status', `✅ Pengaturan ${coin} berhasil disimpan.`, 'success');
                    await renderAll(); // re-render UI setelah simpan
                    return true;
                } else {
                    showStatus('status', `❌ Gagal menyimpan ${coin}: ${data.message || 'Error'}`, 'error');
                    return false;
                }
            } catch (err) {
                showStatus('status', '⚠️ Gagal koneksi ke server.', 'error');
                return false;
            }
        }
        async function saveUser() {
            const token = localStorage.getItem('auth_token');
            if (!token) return alert("Anda belum login.");

            // --- Data Collection ---
            const exchangeName = document.getElementById('um_ex').value || '';
            const apiVal = (document.getElementById('um_key')?.value || '***').trim();
            const secretVal = (document.getElementById('um_secret')?.value || '***').trim();
            const teleId = (document.getElementById('um_teleid')?.value || '***').trim();
            const teleUrl = (document.getElementById('um_teleurl')?.value || '***').trim();
            const emailBaru = (document.getElementById('um_email')?.value || '***').trim();

            // --- FIX: Initialize the Full Nested Payload Structure ---
            const data = {
                exchange: { exchange: exchangeName },
                contact: {
                    telegram: {} // Initialize telegram object
                }
            };
            // --------------------------------------------------------

            // Exchange API Keys
            if (apiVal && apiVal !== '***') {
                data.exchange.api_key = apiVal;
            }
            if (secretVal && secretVal !== '***') {
                data.exchange.secret_key = secretVal;
            }

            // Contact (Telegram)
            if (teleUrl && teleUrl !== '***' && teleId && teleId !== '***') {
                data.contact.telegram = {
                    chat_id: teleId,
                    telegram_bot_url: teleUrl
                }
            }

            // Contact (Email)
            // Only update email if it's different from the currently loaded value
            if (emailBaru && emailBaru !== '***' && emailBaru !== window.data?.config?.contact?.email) {
                data.contact.email = emailBaru;
            }

            // --- API Call ---
            try {
                const res = await fetch(`${API_BASE}/save_profile`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify(data)
                });

                const json = await res.json();
                if (res.ok && json.success) {
                    showStatus('status', "✅ Profil berhasil disimpan.", 'success');
                    closeModal();
                } else {
                    // Log the full JSON response for better debugging
                    console.error('Save Profile Error:', json);
                    showStatus('status', `❌ Gagal menyimpan profil: ${json.message || 'Error'}`, 'error');
                }
            } catch (err) {
                console.error('Network Error:', err);
                showStatus('status', "⚠️ Koneksi ke server gagal.", 'error');
            }
            
            // Ensure this call is outside the try/catch block if you want it to run on failure too, 
            // or place it in a 'finally' block. Currently, it runs on network fail, success, and backend fail.
            await renderAll(); // re-render UI setelah simpan
        }

        // ---------------- tradingview loader ----------------
        (function() {
            if (window.TradingView || document.getElementById('tvjs')) return;
            const s = document.createElement('script');
            s.id = 'tvjs';
            s.src = 'https://s3.tradingview.com/tv.js';
            document.head.appendChild(s);
        })();

        


        
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
            
            const username = window.data?.config?.username || 'User';
            const exchange = window.data?.config?.exchange?.exchange || '';
            const telegramChatId = window.data?.config?.contact?.telegram?.chat_id || '';
            const telegramBotUrl = window.data?.config?.contact?.telegram?.telegram_bot_url || '';
            const email = window.data?.config?.contact?.email || '';
            const credit_fee_percent = window.data?.config?.credit?.fee_percent || 0;
            const creditProfit = window.data?.config?.credit?.profit || 0;
            const creditSaldo = window.data?.config?.credit?.saldo || 0;
            const balance = window.data?.config?.credit?.balance || 0; 
            
            const html = `
            <h2>User Profile</h2>
            <div style='display:grid;grid-template-columns:1fr 1fr;gap:8px'>
                <div><label>Username</label>
                    <label>${username}</label>
                </div>
                <div>
                    <label>Exchange</label>
                        <select id='um_ex'>
                            <option>binance</option>
                            <option>tokocrypto</option>
                            <option>coinbase</option>
                        </select>
                </div>
                <div>           
                    <div>
                        <label>Telegram Chat ID</label>
                        <input id='um_teleid' type='text' value='***' />
                    </div>
                    <div>
                        <label>Telegram Chat URL</label>
                        <input id='um_teleurl' type='text' value='***' style='margin-top:8px' />
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
                <button class='nav-btn' id='btnSaveUser'>Save</button>
                <button class='nav-btn' onclick='closeModal()'>Close</button>
            </div>`;
            showModal(html);
            document.getElementById('um_ex').value = exchange;
            document.getElementById('btnSaveUser').onclick = () => {
                saveUser();
            };
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
        // initial render
        // js/app.js

// GANTI baris 'async function renderAll() {' menjadi:
window.renderAll = async function() {
    // Pastikan loadConfig ada (atau ganti dengan logika lain jika pakai firebase)
    if (typeof loadConfig === 'function') await loadConfig();
    
    // Render semua komponen
    if (window.renderLoginForm) window.renderLoginForm();
    if (typeof renderCoins === 'function') renderCoins();
    if (typeof renderSelectedCard === 'function') renderSelectedCard();
    
    // Terapkan tema
    if (window.applyTheme && typeof theme !== 'undefined') window.applyTheme(theme);
}
        document.getElementById('btnChart').onclick = openChart;
        document.getElementById('btnAbout').onclick = openAbout;
        document.getElementById('btnAcademy').onclick = openAcademy;
        document.getElementById('btnUser').onclick = () => {
            openUser();
        };
        
       

        renderAll();