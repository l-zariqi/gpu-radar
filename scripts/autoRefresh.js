import { fetchStockData } from './fetchStock.js';

let autoRefreshWorker;
let isAutoRefreshEnabled = false;
let countdownDuration = 11; // Default countdown duration in seconds
let timeLeft = countdownDuration; // Track timeLeft in the main thread

// Function to start the auto-refresh worker
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
                fetchStockData();
            }
        });
        console.log('Auto Refresh Worker started.');
    }
}

// Function to stop the auto-refresh worker
function stopAutoRefreshWorker() {
    if (autoRefreshWorker) {
        autoRefreshWorker.terminate();
        autoRefreshWorker = null;
        console.log('Auto Refresh Worker stopped.');
    }
}

// Function to toggle auto-refresh
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

// Function to handle user input for refresh time
function handleRefreshTimeInput() {
    const refreshTimeInput = document.getElementById("refresh-time-input");
    refreshTimeInput.addEventListener("input", (event) => {
        const newDuration = parseInt(event.target.value, 10);
        if (!isNaN(newDuration) && newDuration > 0) {
            countdownDuration = newDuration;
            timeLeft = newDuration; // Reset timeLeft to the new duration
            if (autoRefreshWorker && isAutoRefreshEnabled) {
                autoRefreshWorker.postMessage({ type: 'start', duration: countdownDuration, timeLeft });
            }
        }
    });
}

// Initialize the refresh time input handler
handleRefreshTimeInput();

// Add event listener for the auto-refresh checkbox
document.getElementById("auto-refresh-checkbox").addEventListener("change", toggleAutoRefresh);

// Start the auto-refresh worker
startAutoRefreshWorker();