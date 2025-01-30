let web3;
let contract;
let userWalletAddress;

// ABI dari kontrak pintar dan alamat kontrak pintar (ganti dengan yang sebenarnya)
const contractABI = [ /* ABI kontrak pintar */ ];
const contractAddress = "0xYourContractAddress";  // Ganti dengan alamat kontrak pintar yang sebenarnya

// Inisialisasi Web3 (menggunakan MetaMask sebagai provider)
if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);  // MetaMask akan menjadi provider
} else {
    alert("MetaMask is required to use this dApp.");
}

async function init() {
    try {
        // Memastikan web3 sudah terhubung dan mendapatkan akun wallet pengguna
        const accounts = await web3.eth.requestAccounts();
        userWalletAddress = accounts[0];
        
        // Membuat instance dari kontrak pintar
        contract = new web3.eth.Contract(contractABI, contractAddress);
        
        // Ambil saldo awal TPoint
        await getTPointBalance();
    } catch (error) {
        console.error("Error initializing Web3 and contract:", error);
    }
}

async function checkIn() {
    try {
        const accounts = await web3.eth.getAccounts();
        // Panggil kontrak pintar untuk check-in
        await contract.methods.checkIn().send({ from: accounts[0] })
            .on('transactionHash', function(hash) {
                console.log("Transaction sent: " + hash);
            })
            .on('confirmation', function(confirmationNumber, receipt) {
                console.log("Transaction confirmed: " + receipt);
                getTPointBalance();  // Memperbarui saldo TPoint setelah check-in
            });
    } catch (error) {
        alert("Check-in failed. Please try again.");
    }
}

async function getTPointBalance() {
    try {
        const accounts = await web3.eth.getAccounts();
        // Memanggil fungsi getTPointBalance pada kontrak pintar untuk mendapatkan saldo TPoint
        const balance = await contract.methods.getTPointBalance(accounts[0]).call();
        document.getElementById('totalReferrals').innerText = `TPoint Balance: ${balance}`;
    } catch (error) {
        console.error("Failed to get TPoint balance:", error);
    }
}

document.getElementById('checkInButton').addEventListener('click', checkIn);

// Fungsi untuk memverifikasi apakah pengguna mengikuti akun Twitter proyek
async function verifyTwitterFollow() {
    const userTwitterHandle = await getTwitterHandle(); 
    if (!userTwitterHandle) return false;

    try {
        const response = await fetch(`/verify-twitter?username=${userTwitterHandle}`);
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Twitter verification failed:", error);
        return false;
    }
}

// Fungsi untuk mendapatkan handle Twitter pengguna (contoh menggunakan prompt, bisa dikembangkan)
function getTwitterHandle() {
    return prompt("Enter your Twitter handle (without @):");
}

// Fungsi untuk menghubungkan wallet pengguna
async function connectWallet() {
    try {
        const accounts = await web3.eth.requestAccounts();
        userWalletAddress = accounts[0];
        document.getElementById('walletAddress').innerText = `Wallet Address: ${userWalletAddress}`;
        
        // Verifikasi follow Twitter sebelum melanjutkan
        const isFollowing = await verifyTwitterFollow();
        if (!isFollowing) {
            alert("Please follow our Twitter account before proceeding!");
            return;
        }

        // Set referral link dan tampilkan
        document.getElementById('link').innerText = userReferralLink;
    } catch (error) {
        alert('Error connecting wallet: ' + error.message);
    }
}

// Fungsi untuk memutuskan wallet
function disconnectWallet() {
    userWalletAddress = null;
    document.getElementById('walletAddress').innerText = '';
    document.getElementById('connectButton').style.display = 'block';
    document.getElementById('disconnectButton').style.display = 'none';
}

// Fungsi untuk klaim poin referral
function claimPoints() {
    // Logika klaim poin (memanggil kontrak untuk klaim poin)
    console.log("Claiming points...");
    // Set tombol klaim nonaktif setelah klaim
    document.getElementById('claimButton').disabled = true;
}

// Fungsi untuk melakukan check-in
async function checkIn() {
    const today = new Date().toISOString().split('T')[0];  // Ambil tanggal hari ini
    const lastCheckedInDate = localStorage.getItem('lastCheckedInDate');
    
    if (today === lastCheckedInDate) {
        alert('You have already checked in today!');
        return;
    }

    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.checkIn().send({ from: accounts[0] })
            .on('transactionHash', function(hash) {
                console.log("Transaction sent: " + hash);
            })
            .on('confirmation', function(confirmationNumber, receipt) {
                console.log("Transaction confirmed: " + receipt);
                getTPointBalance();  // Memperbarui saldo TPoint setelah check-in
                localStorage.setItem('lastCheckedInDate', today);  // Simpan tanggal terakhir check-in
            });
    } catch (error) {
        alert("Check-in failed. Please try again.");
    }
}

async function getTPointBalance() {
    const accounts = await web3.eth.getAccounts();
    const balance = await contract.methods.getTPointBalance(accounts[0]).call();
    document.getElementById('totalReferrals').innerText = `TPoint Balance: ${balance}`;
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('disconnectButton').addEventListener('click', disconnectWallet);
document.getElementById('claimButton').addEventListener('click', claimPoints);
document.getElementById('checkInButton').addEventListener('click', checkIn);

// Inisialisasi
init();

// Leaderboard
let leaderboardData = []; // Data leaderboard
let currentPage = 1; // Halaman saat ini
const itemsPerPage = 10; // Jumlah posisi per halaman

// Fungsi untuk mendapatkan leaderboard (data posisi pengguna) dari kontrak pintar
async function getLeaderboard() {
    try {
        // Panggil kontrak pintar untuk mendapatkan data leaderboard
        const leaderboard = await contract.methods.getLeaderboard().call();
        leaderboardData = leaderboard; // Menyimpan data leaderboard

        // Urutkan leaderboard berdasarkan poin secara menurun (peringkat tertinggi di atas)
        leaderboardData.sort((a, b) => b[1] - a[1]); // Urutkan berdasarkan poin, b[1] lebih besar dari a[1]

        // Menampilkan leaderboard sesuai dengan halaman saat ini
        renderLeaderboard(currentPage);
    } catch (error) {
        console.error("Failed to get leaderboard:", error);
    }
}

// Fungsi untuk menampilkan leaderboard pada halaman yang sesuai
function renderLeaderboard(page) {
    const start = (page - 1) * itemsPerPage; // Indeks awal data yang ditampilkan
    const end = page * itemsPerPage; // Indeks akhir data yang ditampilkan
    const leaderboardPage = leaderboardData.slice(start, end); // Ambil data untuk halaman ini

    // Bersihkan kontainer leaderboard sebelumnya
    const leaderboardContainer = document.getElementById('leaderboard');
    leaderboardContainer.innerHTML = '';

    // Render data leaderboard
    leaderboardPage.forEach((entry, index) => {
        const rank = start + index + 1;
        const user = entry[0]; // Alamat wallet pengguna
        const points = entry[1]; // Poin pengguna

        const entryElement = document.createElement('div');
        entryElement.classList.add('leaderboard-entry');
        entryElement.innerHTML = `#${rank} - Wallet: ${user} - Points: ${points}`;
        leaderboardContainer.appendChild(entryElement);
    });

    // Render tombol navigasi
    renderPagination();
}

// Fungsi untuk menampilkan tombol navigasi (First, Previous, Next, Last)
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Bersihkan tombol navigasi sebelumnya

    const totalPages = Math.ceil(leaderboardData.length / itemsPerPage); // Total halaman

    // Tombol "First"
    const firstButton = document.createElement('button');
    firstButton.innerText = 'First';
    firstButton.disabled = currentPage === 1;
    firstButton.onclick = () => goToPage(1);
    paginationContainer.appendChild(firstButton);

    // Tombol "Previous"
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => goToPage(currentPage - 1);
    paginationContainer.appendChild(prevButton);

    // Tombol "Next"
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => goToPage(currentPage + 1);
    paginationContainer.appendChild(nextButton);

    // Tombol "Last"
    const lastButton = document.createElement('button');
    lastButton.innerText = 'Last';
    lastButton.disabled = currentPage === totalPages;
    lastButton.onclick = () => goToPage(totalPages);
    paginationContainer.appendChild(lastButton);
}

// Fungsi untuk berpindah halaman
function goToPage(page) {
    if (page < 1 || page > Math.ceil(leaderboardData.length / itemsPerPage)) return; // Validasi halaman
    currentPage = page;
    renderLeaderboard(currentPage); // Render leaderboard pada halaman baru
}

// Inisialisasi leaderboard ketika kontrak pintar sudah terhubung
async function initLeaderboard() {
    await getLeaderboard(); // Dapatkan leaderboard dan tampilkan
}

// Menambahkan event listener untuk memanggil fungsi leaderboard
document.getElementById('leaderboardButton').addEventListener('click', initLeaderboard);

// HTML Kontainer untuk leaderboard dan tombol navigasi
/*
<div id="leaderboard"></div>
<div id="pagination"></div>
<button id="leaderboardButton">Load Leaderboard</button>
*/
