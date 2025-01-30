// Web3.js setup
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Masukkan alamat kontrak smart contract Anda
const contractABI = YOUR_CONTRACT_ABI; // Masukkan ABI kontrak Anda

const contract = new web3.eth.Contract(contractABI, contractAddress);

let userWalletAddress = null;
let userReferralLink = `https://yourproject.com/referral?code=${userWalletAddress}`;
let userStreak = 0; // Menyimpan streak check-in

// Fungsi untuk menghubungkan wallet
async function connectWallet() {
    try {
        const accounts = await web3.eth.requestAccounts();
        userWalletAddress = accounts[0];
        document.getElementById('walletAddress').innerText = `Wallet Address: ${userWalletAddress}`;
        document.getElementById('connectButton').style.display = 'none';
        document.getElementById('disconnectButton').style.display = 'block';

        // Verifikasi follow Twitter (contoh sederhana, perlu implementasi lebih lanjut)
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

// Fungsi untuk memverifikasi apakah pengguna mengikuti akun Twitter proyek
async function verifyTwitterFollow() {
    // Verifikasi melalui API atau backend Twitter (sederhana, hanya contoh)
    const twitterHandle = 'YourTwitterHandle'; // Ganti dengan handle Twitter proyek
    const userTwitterHandle = await getTwitterHandle(); // Anda bisa membuat mekanisme untuk mendapatkan handle
    return userTwitterHandle === twitterHandle;
}

// Fungsi untuk mendapatkan handle Twitter pengguna (contoh menggunakan prompt, bisa dikembangkan)
function getTwitterHandle() {
    return prompt("Enter your Twitter handle (without @):");
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

// Fungsi untuk mendapatkan saldo TPoint pengguna
async function getTPointBalance() {
    const accounts = await web3.eth.getAccounts();
    const balance = await contract.methods.getTPointBalance(accounts[0]).call();
    document.getElementById('totalReferrals').innerText = `TPoint Balance: ${balance}`;
}

// Event Listeners
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('disconnectButton').addEventListener('click', disconnectWallet);
document.getElementById('claimButton').addEventListener('click', claimPoints);
document.getElementById('checkInButton').addEventListener('click', checkIn);

// Inisialisasi
async function init() {
    // Ambil saldo TPoint awal
    await getTPointBalance();
}
init();
