
    const minterContractABI = [{"inputs":[{"internalType":"address payable","name":"_taxCollector","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EtherWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"taxPaid","type":"uint256"}],"name":"TokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"BURN_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NET_TAX_PER_100000","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TOKENS_PER_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newTaxCollector","type":"address"}],"name":"changeTaxCollector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mintToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"taxCollector","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawEther","outputs":[],"stateMutability":"nonpayable","type":"function"}];
    const minterContractAddress = '0x6cB08635073dC88921c2819DAEb6A70e63abc91c';
    const BASE_CHAIN_ID = 8453;
    const MINT_PRICE = '0.0001735';

    let web3;
    let minterInstance;
    let currentAccount;

async function connectWallet() {
    if (!window.ethereum) {
        alert('Non-Ethereum browser detected. Please install MetaMask!');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3 = new Web3(window.ethereum);
        currentAccount = accounts[0];

        await checkNetwork();

        initContract();

        updateWalletInfo();

        toggleUI('connected');
    } catch (error) {
        console.error("Error connecting wallet:", error.message);
        alert(`Failed to connect wallet: ${error.message}`);
    }
}

function initContract() {
    if (web3) {
        minterInstance = new web3.eth.Contract(minterContractABI, minterContractAddress);
    }
}

async function checkNetwork() {
    const chainId = await web3.eth.getChainId();
    console.log("Current chainId:", chainId);

    if (chainId !== 0x15eb) {

        await switchToBaseNetwork();
    } else {
        toggleUI('correctNetwork');
    }
}

async function switchToBaseNetwork() {
    try {
        const networks = await window.ethereum.request({ method: 'eth_chainId' });

        if (!networks.includes('0x2105')) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x2105',
                    chainName: 'Base',
                    nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: ['https://mainnet.base.org/'],
                    blockExplorerUrls: ['https://basescan.org/']
                }]
            });
        }

        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }]
        });

        setTimeout(async () => {
            await checkNetwork();
        }, 2000);
    } catch (error) {
        console.error("Error switching network:", error.message);
        alert(`Failed to switch network: ${error.message}`);
    }
}

if (window.ethereum) {
    window.ethereum.on('chainChanged', async (chainId) => {
        console.log('Chain changed to:', chainId);
        await checkNetwork();
    });
}
    async function mintTokens() {
        if (!minterInstance || !currentAccount) {
            alert("Please connect your wallet first.");
            return;
        }

        const mintPrice = web3.utils.toWei(MINT_PRICE, 'ether');

try {
    const gasLimit = await minterInstance.methods.mintToken().estimateGas({
        from: currentAccount,
        value: mintPrice,
    });

    const result = await minterInstance.methods.mintToken().send({
        from: currentAccount,
        value: mintPrice,
        gas: gasLimit,
    });

    console.log("Minting result:", result);
    document.getElementById("status").innerText = "Minting succeeded!";
} catch (error) {
    console.error("Minting error:", error);
    document.getElementById("status").innerText = "Minting failed. Please try again.";
}

async function updateWalletInfo() {
    document.getElementById('walletAddress').textContent = currentAccount;

    const balance = await web3.eth.getBalance(currentAccount);

    const balanceInETH = web3.utils.fromWei(balance, 'ether');
    document.getElementById('ethBalance').textContent = balanceInETH + " ETH";
}

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

    function disconnectWallet() {
        web3 = null;
        currentAccount = null;
        minterInstance = null;
        toggleUI('disconnected');
}
