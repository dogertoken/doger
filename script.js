
    const minterContractABI =[{"inputs":[{"internalType":"address payable","name":"_taxCollector","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EtherWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"taxPaid","type":"uint256"}],"name":"TokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"BURN_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NET_TAX_PER_1000","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TOKENS_PER_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newTaxCollector","type":"address"}],"name":"changeTaxCollector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mintToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"taxCollector","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawEther","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}];

    const minterContractAddress = '0x01cA226f0D215F6877DF1D1C50791CdB0743e2e3';
    const OPBNB_CHAIN_ID = 5611;
    const MINT_PRICE = '0.0001735';

    let web3;
    let minterInstance;
    let currentAccount;

// Menghubungkan dompet pengguna
async function connectWallet() {
    if (!window.ethereum) {
        alert('Non-Ethereum browser detected. Please install MetaMask!');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3 = new Web3(window.ethereum);
        currentAccount = accounts[0];

        // Memeriksa jaringan yang digunakan oleh dompet
        await checkNetwork();

        // Inisialisasi kontrak
        initContract();

        // Update informasi dompet
        updateWalletInfo();

        // Menampilkan UI jika berhasil terhubung
        toggleUI('connected');
    } catch (error) {
        console.error("Error connecting wallet:", error.message);
        alert(`Failed to connect wallet: ${error.message}`);
    }
}

// Inisialisasi kontrak
function initContract() {
    if (web3) {
        minterInstance = new web3.eth.Contract(minterContractABI, minterContractAddress);
    }
}

// Memeriksa jaringan
async function checkNetwork() {
    const chainId = await web3.eth.getChainId();
    console.log("Current chainId:", chainId); // Debug log untuk memeriksa chainId

    if (chainId !== 0x15eb) {  // ID hexadecimal untuk OPBNB Testnet

        await switchToOPBNBNetwork();  // Arahkan untuk berpindah jaringan
    } else {
        toggleUI('correctNetwork');  // Menampilkan UI jika sudah di jaringan yang benar
    }
}

// Berpindah ke jaringan OPBNB Testnet
async function switchToOPBNBNetwork() {
    try {
        // Periksa apakah OPBNB Testnet sudah ada di dalam dompet
        const networks = await window.ethereum.request({ method: 'eth_chainId' });

        if (!networks.includes('0x15eb')) {  // Jika belum terdaftar
            // Menambahkan jaringan OPBNB Testnet
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x15eb',  // ID jaringan OPBNB Testnet dalam format hexadecimal
                    chainName: 'opBNB Testnet',
                    nativeCurrency: {
                        name: 'opBNB',
                        symbol: 'tBNB',
                        decimals: 18
                    },
                    rpcUrls: ['https://opbnb-testnet-rpc.bnbchain.org/'],  // Ganti dengan URL RPC yang benar
                    blockExplorerUrls: ['https://opbnb-testnet.bscscan.com/']  // Ganti dengan URL explorer yang benar
                }]
            });
        }

        // Mencoba untuk beralih ke jaringan OPBNB Testnet setelah menambahkannya
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x15eb' }]  // ID jaringan OPBNB Testnet dalam format hexadecimal
        });

        // Menambahkan penundaan kecil untuk memastikan jaringan sudah berhasil beralih
        setTimeout(async () => {
            await checkNetwork();  // Memeriksa kembali setelah berpindah jaringan
        }, 2000); // Menunggu 2 detik (2000 ms) untuk memastikan jaringan beralih
    } catch (error) {
        console.error("Error switching network:", error.message);
        alert(`Failed to switch network: ${error.message}`);
    }
}

// Event listener untuk mendeteksi perubahan jaringan setelah switch
if (window.ethereum) {
    window.ethereum.on('chainChanged', async (chainId) => {
        console.log('Chain changed to:', chainId);
        await checkNetwork();  // Memeriksa jaringan setelah perubahan chain
    });
}
    // Mint token
    async function mintTokens() {
        if (!minterInstance || !currentAccount) {
            alert("Please connect your wallet first.");
            return;
        }

        try {
            const mintPrice = web3.utils.toWei(MINT_PRICE, 'ether');
            const result = await minterInstance.methods.mintToken().send({
                from: currentAccount,
                value: mintPrice,
            });

            console.log("Minting result:", result);
            document.getElementById("status").innerText = "Minting succeeded!";
        } catch (error) {
            console.error("Minting error:", error);
            document.getElementById("status").innerText = "Minting failed. Please try again.";
        }
    }

    // Update wallet information, including wallet address and balance
async function updateWalletInfo() {
    // Menampilkan alamat wallet
    document.getElementById('walletAddress').textContent = currentAccount;

    // Mengambil saldo tBNB
    const balance = await web3.eth.getBalance(currentAccount);

    // Menampilkan saldo dalam format yang lebih mudah dibaca (misalnya dalam BNB)
    const balanceInBNB = web3.utils.fromWei(balance, 'ether'); // Mengonversi dari Wei ke Ether/BNB
    document.getElementById('ethBalance').textContent = balanceInBNB + " tBNB";
}

    // Tampilkan atau sembunyikan elemen UI
    function toggleUI(state) {
        const uiState = {
            connected: ['walletInfo', 'mintSection'],
            wrongNetwork: ['networkSwitch'],
            correctNetwork: ['connectWallet'],
            disconnected: ['connectWallet'],
        };

        for (const [key, elements] of Object.entries(uiState)) {
            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = key === state ? 'block' : 'none';
                }
            });
        }
    }

    // Putuskan koneksi dompet
    function disconnectWallet() {
        web3 = null;
        currentAccount = null;
        minterInstance = null;
        toggleUI('disconnected');
    }

   // Progress Bar Section

  // Alamat Kontrak Token
  const CONTRACT_ADDRESS = "0x01cA226f0D215F6877DF1D1C50791CdB0743e2e3";
  
  // ABI hanya memerlukan metode totalSupply
  const ABI = [{"inputs":[{"internalType":"address payable","name":"_taxCollector","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EtherWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"taxPaid","type":"uint256"}],"name":"TokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"BURN_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NET_TAX_PER_1000","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TOKENS_PER_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newTaxCollector","type":"address"}],"name":"changeTaxCollector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mintToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"taxCollector","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawEther","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}];

  // Gunakan RPC opBNB Testnet
  const web3 = new Web3("https://opbnb-testnet-rpc.bnbchain.org");

  const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

  // Ambil jumlah desimal dari kontrak
  async function getDecimals() {
    const decimals = await contract.methods.decimals().call();
    return parseInt(decimals);
  }

  // Total pasokan maksimum yang bisa diminting
  const MAX_SUPPLY = 1000000;

  async function updateProgress() {
    try {
      // Ambil total supply yang sudah diminting
      const mintedTokens = await contract.methods.totalSupply().call();
      const decimals = await getDecimals();
      const minted = parseInt(mintedTokens) / Math.pow(10, decimals);

      // Hitung persentase progress
      const progressPercentage = (minted / MAX_SUPPLY) * 100;

      // Update tampilan
      document.getElementById('progressFill').style.width = progressPercentage + '%';
      document.getElementById('progressText').innerText = `${minted.toFixed(2)} / ${MAX_SUPPLY} Tokens Minted`;
    } catch (error) {
      console.error("Error fetching contract data:", error);
      document.getElementById('progressText').innerText = "Error loading data";
    }
  }

  // Jalankan saat halaman dimuat
  updateProgress();

  // Refresh progress setiap 10 detik
  setInterval(updateProgress, 10000);
