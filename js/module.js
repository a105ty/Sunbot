function showStatus(id, message, type) {
    const el = document.getElementById(id);
            if (!el) {
                console.warn(`Elemen status dengan ID "${id}" tidak ditemukan.`);
                return;
            }
            el.textContent = message;
            el.className = `alert ${type}`;
            el.style.display = 'block';
            console.log(`Status shown: ${message}`);
            setTimeout (() => {
                hideStatus(id);
            }, 10000);
        }
function hideStatus(id) {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`Elemen status dengan ID "${id}" tidak ditemukan.`);
                return;
            }
            el.style.display = 'none';
        }

// ---------- helpers ----------
function idify(s) {
            return String(s).replace(/[^a-zA-Z0-9_-]/g, '_')
        }

function escapeHtml(s) {
            return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }   
function collectCardSettings(coin) {
            const id = idify(coin);
            
            // Fungsi helper untuk mendapatkan nilai angka dari ID
            const getNum = (elementId) => {
                const el = document.getElementById(elementId);
                // Gunakan parseFloat, default ke 0 jika gagal
                return el ? parseFloat(el.value) || 0 : 0;
            };

            // Fungsi helper untuk mendapatkan nilai dari SELECT
            const getSelect = (elementId) => {
                const el = document.getElementById(elementId);
                // Mengembalikan boolean (true/false) berdasarkan nilai select 'true'/'false'
                return el ? el.value === 'true' : false;
            };

            const latestSettings = {
                // Mengumpulkan semua nilai dari elemen input/select berdasarkan ID
                trailing_tp: getSelect(`trail_${id}`),
                trailing_tp_percent: getNum(`trailp_${id}`),
                layer_percent_base: getNum(`base_${id}`),
                layer_percent_step: getNum(`step_${id}`),
                buy_amount: getNum(`buy_${id}`),
                max_layer: getNum(`layers_${id}`),
                sell_layer: getNum(`sell_${id}`),
                sell_fraction: getNum(`frac_${id}`),
                rebound_percent: getNum(`rebound_${id}`),
                trading: document.getElementById(`run_${id}`).textContent === 'Stop' // 'Stop' berarti sedang berjalan
            };
            
            // Pastikan max_layer adalah integer karena itu hitungan layer
            latestSettings.max_layer = parseInt(latestSettings.max_layer);

            return latestSettings;
        }    
function showModal(html) {
            document.getElementById('modalContent').innerHTML = html;
            document.getElementById('modalBack').style.display = 'flex';
        }
function closeModal() {
            document.getElementById('modalBack').style.display = 'none';
        }