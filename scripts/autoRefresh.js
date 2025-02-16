let autoRefreshWorker;
let isAutoRefreshEnabled = false;
const countdownDuration = 11; // Countdown duration in seconds
let timeLeft = countdownDuration; // Track timeLeft in the main thread

function startAutoRefreshWorker() {
    if (!autoRefreshWorker) {
        autoRefreshWorker = new Worker('./scripts/autoRefreshWorker.js');
        autoRefreshWorker.addEventListener('message', (event) => {
            const data = event.data;
            if (data.type === 'countdown') {
                const toggleText = document.querySelector(".toggle-text");
                toggleText.textContent = `Auto Refresh (${data.timeLeft}s)`;
                timeLeft = data.timeLeft; // Update timeLeft in the main thread
            } else if (data.type === 'fetch') {
                // console.log('Countdown reached zero. Fetching data...');
                fetchStockData();
            }
        });
        console.log('Auto Refresh Worker started.');
    }
}

function stopAutoRefreshWorker() {
    if (autoRefreshWorker) {
        autoRefreshWorker.terminate();
        autoRefreshWorker = null;
        console.log('Auto Refresh Worker stopped.');
    }
}

function toggleAutoRefresh() {
    const autoRefreshCheckbox = document.getElementById("auto-refresh-checkbox");
    if (autoRefreshCheckbox.checked) {
        isAutoRefreshEnabled = true;
        if (autoRefreshWorker) {
            autoRefreshWorker.postMessage({ type: 'start', duration: countdownDuration, timeLeft });
        }
    } else {
        isAutoRefreshEnabled = false;
        if (autoRefreshWorker) {
            autoRefreshWorker.postMessage({ type: 'stop' });
        }
    }
}

// Function to fetch stock data (runs in the main thread)
function fetchStockData() {
    if (window.fetchWorker) {
        window.fetchWorker.postMessage({ type: 'fetch', locale: window.currentLocale });
    } else {
        console.error('Fetch Worker is not initialized.');
        // Optionally, initialize the fetchWorker here if it's not already initialized
        if (!window.fetchWorker) {
            window.fetchWorker = new Worker('./scripts/fetchWorker.js');
            window.fetchWorker.addEventListener('message', (event) => {
                const data = event.data;
                if (data && data.searchedProducts && data.searchedProducts.productDetails) {
                    updateStockStatus(data.searchedProducts.productDetails);
                }
            });
            console.log('Fetch Worker initialized in autoRefresh.js');
        }
    }
}

document.getElementById("auto-refresh-checkbox").addEventListener("change", toggleAutoRefresh);
startAutoRefreshWorker();