import { updateStockStatus } from './fetchStock.js';

let worker;
let isAutoRefreshEnabled = false;
const countdownDuration = 30; // Countdown duration in seconds
let timeLeft = countdownDuration;

let currentLocale = localStorage.getItem("selectedLocale") || "en-gb";

function startCountdown() {
    const toggleText = document.querySelector(".toggle-text");
    let nextFetchTime = Date.now() + countdownDuration * 1000;

    function countdown() {
        const now = Date.now();
        timeLeft = Math.max(0, Math.ceil((nextFetchTime - now) / 1000));
        toggleText.textContent = `Auto Refresh (${timeLeft}s)`;

        if (timeLeft <= 0) {
            console.log('Timer reached zero. Fetching data at:', new Date().toISOString()); // Log fetch time
            if (window.worker) {
                window.worker.postMessage({ type: 'fetch', locale: currentLocale });
            }
            nextFetchTime = now + countdownDuration * 1000;
        }              

        if (isAutoRefreshEnabled) {
            requestAnimationFrame(countdown);
        }
    }

    countdown();
}

function stopCountdown() {
    isAutoRefreshEnabled = false;
    const toggleText = document.querySelector(".toggle-text");
    toggleText.textContent = `Auto Refresh (${timeLeft}s)`;
}

function startWorker() {
    if (!window.worker) {
        window.worker = new Worker('./scripts/fetchWorker.js');
        window.worker.addEventListener('message', (event) => {
            const data = event.data;
            console.log('Data received from worker:', data);
            if (data && data.searchedProducts && data.searchedProducts.productDetails) {
                updateStockStatus(data.searchedProducts.productDetails);
            } else {
                console.error('Invalid data structure received from worker:', data);
            }
        });
        console.log('Web Worker started.');
    }
}

function stopWorker() {
    if (window.worker) {
        window.worker.terminate();
        window.worker = null;
        console.log('Web Worker stopped.');
    }
}

function toggleAutoRefresh() {
    const autoRefreshCheckbox = document.getElementById("auto-refresh-checkbox");
    if (autoRefreshCheckbox.checked) {
        isAutoRefreshEnabled = true;
        startCountdown();
    } else {
        isAutoRefreshEnabled = false;
        stopCountdown();
    }
}

document.getElementById("auto-refresh-checkbox").addEventListener("change", toggleAutoRefresh);
window.currentLocale = currentLocale;
startWorker();
if (window.worker) {
    window.worker.postMessage({ type: 'fetch', locale: currentLocale });
}
