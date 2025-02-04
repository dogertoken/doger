 <script>
        // Gunakan RPC yang lebih stabil untuk Base Mainnet
        const RPC_URL = "https://base.blockpi.network/v1/rpc/public"; 
        const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));

        // Alamat kontrak di Base Mainnet
        const CONTRACT_ADDRESS = "0x6cB08635073dC88921c2819DAEb6A70e63abc91c";

        // ABI kontrak
        const CONTRACT_ABI = [{"inputs":[{"internalType":"address payable","name":"_taxCollector","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EtherWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"taxPaid","type":"uint256"}],"name":"TokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"BURN_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NET_TAX_PER_100000","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TOKENS_PER_MINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newTaxCollector","type":"address"}],"name":"changeTaxCollector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mintToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"taxCollector","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawEther","outputs":[],"stateMutability":"nonpayable","type":"function"}];
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        let allEvents = [];
        let currentPage = 1;
        const itemsPerPage = 10;

        function formatTimeAgo(timestamp) {
            const now = Math.floor(Date.now() / 1000);
            const secondsAgo = now - timestamp;
            if (secondsAgo < 60) return "Just now";
            const minutes = Math.floor(secondsAgo / 60);
            if (minutes < 60) return `${minutes} min ago`;
            const hours = Math.floor(secondsAgo / 3600);
            if (hours < 24) return `${hours} hr ago`;
            const days = Math.floor(secondsAgo / 86400);
            return `${days} days ago`;
        }

        function shortenTxid(txid) {
            return `${txid.substring(0, 10)}...${txid.substring(txid.length - 10)}`;
        }

        function shortenAddress(address) {
            return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        }

        async function fetchMintingHistory() {
            try {
                console.log("Fetching events...");
                const events = await contract.getPastEvents('Transfer', {
                    fromBlock: "earliest",
                    toBlock: "latest"
                });

                if (events.length === 0) {
                    console.warn("No events found! Trying alternative method...");
                    return fetchLogsAsBackup(); 
                }

                allEvents = await Promise.all(events.map(async event => {
                    const block = await web3.eth.getBlock(event.blockNumber);
                    return {
                        to: event.returnValues.to,
                        value: web3.utils.fromWei(event.returnValues.value, 'ether'),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: block.timestamp || Math.floor(Date.now() / 1000) 
                    };
                }));

                renderPage(currentPage);
            } catch (error) {
                console.error("Error fetching minting history:", error);
                fetchLogsAsBackup();
            }
        }

        async function fetchLogsAsBackup() {
            try {
                console.log("Fetching logs as backup...");
                const logs = await web3.eth.getPastLogs({
                    fromBlock: "earliest",
                    toBlock: "latest",
                    address: CONTRACT_ADDRESS,
                    topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
                });

                allEvents = await Promise.all(logs.map(async log => {
                    const decoded = web3.eth.abi.decodeLog([
                        { type: 'address', indexed: true, name: 'from' },
                        { type: 'address', indexed: true, name: 'to' },
                        { type: 'uint256', indexed: false, name: 'value' }
                    ], log.data, log.topics.slice(1));

                    const block = await web3.eth.getBlock(log.blockNumber);
                    return {
                        to: decoded.to,
                        value: web3.utils.fromWei(decoded.value, 'ether'),
                        blockNumber: log.blockNumber,
                        transactionHash: log.transactionHash,
                        timestamp: block.timestamp || Math.floor(Date.now() / 1000)
                    };
                }));

                renderPage(currentPage);
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        }

        function renderPage(page) {
            const historyContainer = document.getElementById("historyContainer");
            const pagination = document.getElementById("pagination");

            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            const paginatedEvents = allEvents.slice(startIndex, endIndex);

            historyContainer.innerHTML = paginatedEvents.map(event => `
                <div class="event">
                    <p><strong>Tx Id:</strong> <a href="https://basescan.org/tx/${event.transactionHash}" target="_blank">${shortenTxid(event.transactionHash)}</a></p>
                    <p><strong>Block:</strong> ${event.blockNumber}</p>
                    <p><strong>Wallet:</strong> ${shortenAddress(event.to)}</p>
                    <p><strong>Amount:</strong> ${event.value} DOGER</p>
                    <p><strong>Time:</strong> ${formatTimeAgo(event.timestamp)}</p>
                </div>
                <hr>
            `).join("");

            const totalPages = Math.ceil(allEvents.length / itemsPerPage);
            pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => `
                <button onclick="changePage(${i + 1})" ${i + 1 === page ? 'disabled' : ''}>
                    ${i + 1}
                </button>
            `).join("");
        }

        function changePage(page) {
            currentPage = page;
            renderPage(page);
        }

        fetchMintingHistory();
        setInterval(fetchMintingHistory, 5000);
    </script>
