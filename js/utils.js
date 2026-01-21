function addCoinPair() {
            const input = document.getElementById('newCoinInput');
            if (!input) return;

            const newCoin = input.value.trim().toUpperCase();
            if (!newCoin) return alert('Masukkan nama koin terlebih dahulu.');
            if (activeCoins.includes(newCoin)) return alert(`${newCoin} sudah ada di chart.`);

            activeCoins.push(newCoin);
            renderAllCharts();
        }

// === Hapus Coin ===
function removeCoinPair(coinToRemove) {
            const index = activeCoins.indexOf(coinToRemove);
            if (index > -1) {
                activeCoins.splice(index, 1);
                renderAllCharts();
            } else {
                console.log(`${coinToRemove} tidak ditemukan.`);
            }
        }

        // === Render Semua Chart ===
        function renderAllCharts() {
            // Header input untuk tambah coin
            let htmlContent = `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
                    <input type="text" id="newCoinInput" 
                        placeholder="Masukkan simbol coin (misal: BTCUSDT)" 
                        style="flex:1;padding:8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff;">
                    <button id="addCoinButton" class="pill" 
                        style="padding:8px 14px;border:none;border-radius:6px;background:#00a86b;color:#fff;cursor:pointer;">
                        + Add Coin
                    </button>
                </div>
                <button class='nav-btn' onclick='closeModal()'>Close</button>
                <div id="${CHART_CONTAINER_ID}" 
                    style="display:grid;grid-template-columns:repeat(auto-fit,minmax(500px,1fr));gap:18px;">
                </div>

            `;
            modalContent.style.minWidth = '96vw';
            showModal(htmlContent); // tampilkan modal (fungsi eksternal kamu)
            const addBtn = document.getElementById('addCoinButton');
            const input = document.getElementById('newCoinInput');
            if (addBtn) addBtn.onclick = addCoinPair;
            if (input) {
                input.onkeydown = (e) => {
                    if (e.key === 'Enter') addCoinPair();
                };
            }

            // Render setiap chart box
            const wrapper = document.getElementById(CHART_CONTAINER_ID);
            if (!wrapper) return;
            wrapper.innerHTML = activeCoins.map(coin => {
                const uniqueId = `chartContainer_${coin}`;
                return `
                    <div class="" 
                        style="background:#1b1b1b;border-radius:10px;padding:10px;position:relative;
                            box-shadow:0 0 6px rgba(0,0,0,0.6);">
                        <h3 style="margin:0 0 5px;">${coin}</h3>
                        <button onclick="removeCoinPair('${coin}')" 
                            style="position:absolute;top:8px;right:10px;background:#ff4444;border:1px solid #aquamarine;
                                padding:4px 8px;border-radius:4px;color:white;cursor:pointer;">
                            &times;
                        </button>
                        <div id="${uniqueId}" style="width:100%;height:300px;"></div>
                    </div>
                `;
            }).join('');

            // Render chart TradingView
            for (const coin of activeCoins) {
                const uniqueId = `chartContainer_${coin}`;
                renderTradingView(coin, uniqueId);
            }
        }
window.renderTradingView = function(coin, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Tentukan teks placeholder loading
    const loadingText = `Memuat Chart: ${coin} (TradingView) — loading...`;
    container.textContent = loadingText;

    // [PERBAIKAN] Hapus Underscore (_) dan Slash (/) agar jadi format BTCUSDT
    // TradingView Binance tidak mengenali "BTC_USDT", harus "BTCUSDT"
    const symbolFormatted = 'BINANCE:' + coin.replace(/[\/_]/g, '');

    const initWidget = () => {
        // Cek apakah TradingView sudah tersedia
        if (window.TradingView && typeof window.TradingView.widget === 'function') {
            clearInterval(intervalId); // Hentikan retry jika berhasil
            container.innerHTML = ''; // Bersihkan placeholder

            try {
                new window.TradingView.widget({
                    container_id: containerId,
                    autosize: true,
                    symbol: symbolFormatted, // Gunakan simbol yang sudah dibersihkan
                    interval: '60',
                    timezone: 'Asia/Jakarta', // Opsional: Sesuaikan zona waktu
                    theme: 'dark',
                    style: '1',
                    locale: 'en',
                    toolbar_bg: '#f1f3f6',
                    enable_publishing: false,
                    hide_side_toolbar: false,
                    allow_symbol_change: true,
                    save_image: false
                });
            } catch (e) {
                container.textContent = `⚠️ Gagal memuat chart untuk ${coin}.`;
                console.error('Error memuat TradingView:', e);
            }
        }
    };

    // 2. Mulai polling (retry) setiap 500ms
    const intervalId = setInterval(initWidget, 500);

    // 3. Batasi waktu polling (10 detik)
    setTimeout(() => {
        if (container.textContent === loadingText) {
            clearInterval(intervalId);
            container.innerHTML = `<div style="padding:20px; text-align:center; color:orange">
                Gagal memuat chart. Pastikan koneksi internet lancar.<br>
                <button onclick="window.renderTradingView('${coin}', '${containerId}')">Coba Lagi</button>
            </div>`;
        }
    }, 10000);

    // Panggil sekali langsung
    initWidget();
}

//===================================================
//Academy Modules Data & Rendering Functions
//===================================================

function renderContentBlocks(blocks) {
    if (!blocks) return '';

    return blocks.map(block => {
        // Teks biasa
        if (block.type === 'text') {
            return `<p style="margin-bottom: 15px; line-height: 1.6; color: #e2e8f0;">${block.value}</p>`;
        }
        
        // Gambar tunggal dalam konten
        if (block.type === 'image') {
            return `
                <div style="margin: 20px 0; background: #020617; padding: 10px; border-radius: 8px; text-align: center;">
                    <img src="${block.src}" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 4px;">
                    ${block.caption ? `<div style="color:#94a3b8; font-size: 0.9em; margin-top: 5px;">${block.caption}</div>` : ''}
                </div>`;
        }

        // Gallery
        if (block.type === 'gallery') {
            const imagesHTML = block.images.map(img => 
                `<div style="height: 150px; background: #020617; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <img src="${img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                 </div>`
            ).join('');
            
            return `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 20px 0;">
                    ${imagesHTML}
                </div>`;
        }

        // Image Text (Kiri/Kanan)
        if (block.type === 'image-text') {
            const direction = block.layout === 'right' ? 'row-reverse' : 'row';
            return `
                <div style="display: flex; flex-direction: ${direction}; gap: 20px; align-items: center; margin: 20px 0; flex-wrap: wrap;">
                    <div style="flex: 1 1 200px; height: 200px; background: #020617; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                        <img src="${block.src}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <p style="flex: 2 1 300px; line-height: 1.6; color: #e2e8f0;">${block.text}</p>
                </div>`;
        }
        return '';
    }).join('');
}
// Fungsi 1: Menampilkan Daftar Modul (Grid View)
function renderModuleList() {
    let modulesHTML = AcademyModules.map(modul => `
        <div onclick="openModuleDetail(${modul.id})" 
             style="
                cursor: pointer; 
                border: 1px solid #0a0f28; 
                border-radius: 12px; 
                background: rgb(19, 25, 51); /* --bg-4 */
                overflow: hidden; 
                transition: transform 0.2s; 
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
             "
             onmouseover="this.style.transform='translateY(-5px)'"
             onmouseout="this.style.transform='translateY(0)'">
            
            <div style="
                height: 180px; 
                width: 100%; 
                background: #020617; /* --bg-1 */
                display: flex; 
                align-items: center; 
                justify-content: center;
                border-bottom: 1px solid #0a0f28;">
                
                <img src="${modul.image}" alt="${modul.title}" 
                     style="
                        max-width: 100%; 
                        max-height: 100%; 
                        object-fit: contain; /* KUNCI AGAR TIDAK STRETCH */
                        display: block;">
            </div>

            <div style="padding: 15px;">
                <h3 style="margin-top:0; margin-bottom: 8px; color: #ffffff; font-size: 16px;">${modul.title}</h3>
                <p style="color: #a0aec0; font-size: 13px; margin-bottom: 15px; line-height: 1.4;">${modul.desc}</p>
                <span style="color: #60a5fa; font-weight: 600; font-size: 12px;">Buka Materi &rarr;</span>
            </div>
        </div>
    `).join('');

    showModal(`
        <div style='display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #0a0f28; padding-top: 15px; padding-bottom: 15px;'>
            <h2 style="margin: 0; color: #ffffff;">Pustaka Modul Investasi</h2>
            
            <button class='nav-btn'  onclick='closeModal()'>Close</button>
        </div>
        <div style="
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
            gap: 20px; 
            margin-bottom: 20px;">
            ${modulesHTML}
        </div>

        
    `);
}

// Fungsi 2: Menampilkan Detail Modul (Detail View)
function openModuleDetail(id) {
    const modul = AcademyModules.find(m => m.id === id);
    if (!modul) return;

    // Pastikan teks konten berwarna terang untuk dark mode
    const contentHTML = renderContentBlocks(modul.contentBlocks); // Asumsi fungsi helper ada, tapi perlu disesuaikan warnanya nanti

    showModal(`
        <div style="display: flex; align-items: center; border-bottom: 1px solid #0a0f28; padding-bottom: 15px; margin-bottom: 20px;">
            <button onclick="renderModuleList()" class="nav-btn" style="margin-right: 15px; background: #0a0f28; color: white; border: 1px solid #333;">&larr; Kembali</button>
            <h2 style="margin:0; color: #ffffff;">${modul.title}</h2>
        </div>

        <div style="text-align: left; padding: 5px;">
            
            <div style="
                width: 100%; 
                height: 300px; 
                margin-bottom: 25px; 
                border-radius: 12px; 
                overflow: hidden; 
                background: #020617; /* --bg-1 */
                display: flex; 
                align-items: center; 
                justify-content: center;
                border: 1px solid #0a0f28;">
                
                <img src="${modul.image}" 
                     style="max-width: 100%; max-height: 100%; object-fit: contain;" 
                     alt="${modul.title}">
            </div>

            <div style="line-height: 1.8; color: #e2e8f0; font-size: 16px;">
                ${contentHTML}
            </div>
        </div>

        <div style='text-align:right; border-top: 1px solid #0a0f28; padding-top: 15px; margin-top: 30px;'>
            <button class='nav-btn' onclick='closeModal()'>Close</button>
        </div>
    `);
}

`function notify(){
            if (data,credit.saldo < 10 ){
                showStatus('status', '⚠️ Saldo credit anda kurang dari 10 USDT, silahkan topup untuk melanjutkan trading.', 'warning');
            }
        }`