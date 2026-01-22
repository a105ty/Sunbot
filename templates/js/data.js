// js/data.js


 //'XAUT/USDT', 'HYPER/USDT',
const DEFAULT_COINS = [ 'ADA/USDT', 'BTC/USDT', 'BNB/USDT', 'ETH/USDT', 'SOL/USDT','XRP/USDT','XLM/USDT', 
        'DOGE/USDT','SHIB/USDT', 'PEPE/USDT', 'UNI/USDT', 'FARTCOIN/USDT', 
         'DOT/USDT','LUNA/USDT', 'SAND/USDT', 'MANA/USDT','GALA/USDT', 'AXS/USDT', 'ICP/USDT','NEAR/USDT',
             'LTC/USDT', 'LINK/USDT', 'MATIC/USDT', 'AVAX/USDT', 'ATOM/USDT', 'TRX/USDT', 'DOGE/USDT', 'ALGO/USDT', 'VET/USDT', 'FIL/USDT', 'ICP/USDT'
        ];
const THEMES = [{
            name: 'Default',
            value: 'default'
        },  {
            name: 'Electric',
            value: 'electric'
        }, {
            name: 'Light',
            value: 'light'
        }];
const loginAreaElement = document.getElementById('loginArea');
window.data = window.data || {};
let selected = DEFAULT_COINS[0];
const theme = 'electric';  
// === Chart Modal System ===
const activeCoins = [...DEFAULT_COINS];
const CHART_CONTAINER_ID = 'charts-wrapper'; // ID utama chart container

const AcademyModules = [
    {
        id: 1,
        title: "Pengenalan Pasaran Saham",
        desc: "Fahami asas pemilikan syarikat dan bagaimana pasaran berfungsi.",
        image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=600",
        contentBlocks: [
            { type: 'text', value: "Saham adalah bukti pemilikan sebahagian daripada sesebuah syarikat. Apabila anda membeli saham, anda menjadi pemilik bersama." },
            { 
                type: 'image-text', 
                layout: 'right', 
                src: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400", 
                text: "<strong>Bull vs Bear Market:</strong><br>Istilah 'Bull' digunakan apabila pasaran sedang naik, manakala 'Bear' digunakan apabila pasaran sedang jatuh." 
            },
            { type: 'text', value: "Strategi terbaik untuk pemula adalah pelaburan jangka panjang (Dollar Cost Averaging)." }
        ]
    },
    {
        id: 2,
        title: "Apa itu Bitcoin?",
        desc: "Ketahui sejarah dan fungsi mata wang digital pertama di dunia.",
        image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600",
        contentBlocks: [
            { type: 'text', value: "Bitcoin dicipta oleh Satoshi Nakamoto pada tahun 2009 sebagai sistem tunai elektronik peer-to-peer." },
            { 
                type: 'gallery', 
                images: [
                    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400",
                    "https://images.unsplash.com/photo-1516245834210-c4c14278733f?w=400"
                ] 
            },
            { type: 'text', value: "Gambar kiri: Perlombongan (Mining) Bitcoin. Gambar kanan: Dompet digital fizikal." }
        ]
    },
    {
        id: 3,
        title: "Teknologi Blockchain",
        desc: "Sistem di sebalik crypto: Selamat, telus, dan tidak boleh diubah.",
        image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600",
        contentBlocks: [
            { type: 'text', value: "Blockchain adalah buku besar digital (ledger) yang mencatat transaksi merentas banyak komputer." },
            { 
                type: 'image-text', 
                layout: 'left', 
                src: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400", 
                text: "Setiap blok data dirantai menggunakan kriptografi (hashing). Jika satu blok diubah, semua blok seterusnya akan rosak, menjadikan sistem ini sangat selamat." 
            }
        ]
    },
    {
        id: 4,
        title: "Analisis Candlestick",
        desc: "Belajar membaca grafik harga untuk trading.",
        image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=600",
        contentBlocks: [
            { type: 'text', value: "Candlestick Jepun memberikan 4 informasi utama: Harga Buka, Tutup, Tertinggi, dan Terendah." },
            { 
                type: 'image', 
                src: "https://images.unsplash.com/photo-1535320903710-d9cf113d2054?w=600", 
                caption: "Contoh grafik candlestick pada skrin pedagang."
            },
            { type: 'text', value: "Pola seperti 'Doji' atau 'Hammer' boleh menandakan perubahan arah trend pasaran." }
        ]
    },
    {
        id: 5,
        title: "Ethereum & Smart Contracts",
        desc: "Lebih daripada sekadar mata wang: Aplikasi terdesentralisasi.",
        image: "https://images.unsplash.com/photo-1622790698141-94e30457ef12?w=600",
        contentBlocks: [
            { type: 'image-text', 
              layout: 'right', 
              src: "https://images.unsplash.com/photo-1644143379190-08a5f055de1d?w=400", 
              text: "Ethereum memperkenalkan konsep <strong>Smart Contracts</strong>. Ia adalah kod pengaturcaraan yang berjalan secara automatik apabila syarat tertentu dipenuhi, tanpa orang tengah." 
            },
            { type: 'text', value: "Ini membolehkan wujudnya DeFi (Kewangan Terdesentralisasi) dan NFT." }
        ]
    },
    {
        id: 6,
        title: "Pengurusan Risiko (Risk Management)",
        desc: "Kunci utama bertahan lama dalam dunia pelaburan.",
        image: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=600",
        contentBlocks: [
            { type: 'text', value: "Peraturan #1: Jangan sesekali melabur wang yang anda tidak sanggup rugi." },
            { 
                type: 'gallery', 
                images: [
                    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400",
                    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400"
                ] 
            },
            { type: 'text', value: "Gunakan 'Stop Loss' untuk menghadkan kerugian dan pelbagaikan (diversify) aset anda." }
        ]
    },
    {
        id: 7,
        title: "Stablecoins: Crypto Stabil",
        desc: "Memahami USDT, USDC, dan kegunaannya.",
        image: "https://images.unsplash.com/photo-1621504450168-b8c493179079?w=600",
        contentBlocks: [
            { type: 'text', value: "Stablecoin adalah aset crypto yang nilainya disandarkan pada aset sebenar seperti Dolar AS (1:1)." },
            { type: 'image-text', layout: 'left', src: "https://images.unsplash.com/photo-1620321023374-d1a68fddadb3?w=400", text: "Pedagang menggunakan stablecoin (seperti Tether/USDT) untuk mengamankan keuntungan semasa pasaran jatuh tanpa perlu menukar ke wang fiat." }
        ]
    },
    {
        id: 8,
        title: "Dompet Crypto (Wallets)",
        desc: "Hot Wallet vs Cold Wallet: Mana lebih selamat?",
        image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600",
        contentBlocks: [
            { type: 'text', value: "Dompet crypto menyimpan 'kunci peribadi' (private key) anda, bukan koin itu sendiri." },
            { type: 'image-text', layout: 'right', src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400", text: "<strong>Cold Wallet (Hardware):</strong> Disimpan di luar talian (offline), sangat selamat dari peretas. Contoh: Ledger, Trezor.<br><br><strong>Hot Wallet:</strong> Bersambung ke internet, mudah digunakan tetapi berisiko." }
        ]
    },
    {
        id: 9,
        title: "Kitaran Pasaran (Market Cycles)",
        desc: "Memahami fasa Akumulasi, Uptrend, dan Distribusi.",
        image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=600",
        contentBlocks: [
            { type: 'text', value: "Pasaran bergerak dalam kitaran. Emosi pelabur berubah dari Takut -> Tamak -> Takut semula." },
            { type: 'image', src: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600", caption: "Psikologi pasaran sering berulang." }
        ]
    },
    {
        id: 10,
        title: "DeFi (Decentralized Finance)",
        desc: "Bank tanpa bank? Meminjam dan menyimpan secara digital.",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600",
        contentBlocks: [
            { type: 'text', value: "DeFi membolehkan anda meminjam, memberi pinjaman, dan memperoleh faedah (yield farming) tanpa melalui bank tradisional." },
            { type: 'gallery', images: ["https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400", "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400"] }
        ]
    }
];