import { fetchStockData } from './fetchStock.js';

let autoRefreshWorker;
let isAutoRefreshEnabled = false;
let countdownDuration = 11; // Default countdown duration in seconds
let timeLeft = countdownDuration; // Track timeLeft in the main thread
const MIN_DURATION = 5;
const refreshInput = document.getElementById("refresh-time-input");
const autoRefreshCheckbox = document.getElementById("auto-refresh-checkbox");

function updateCountdownDisplay(value) {
    timeLeft = value;

    if (!isAutoRefreshEnabled || !refreshInput || refreshInput.value === String(value)) {
        return;
    }

    refreshInput.value = value;
    refreshInput.readOnly = true;

    // Flash effect
    refreshInput.classList.remove("flash");
    void refreshInput.offsetWidth;
    refreshInput.classList.add("flash");
}

// Function to start the auto-refresh worker
function startAutoRefreshWorker() {
    if (!autoRefreshWorker) {
        autoRefreshWorker = new Worker('./scripts/autoRefreshWorker.js');
        autoRefreshWorker.addEventListener('message', (event) => {
            const data = event.data;
            if (data.type === 'countdown') {
                updateCountdownDisplay(data.timeLeft);
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
    if (autoRefreshCheckbox.checked) {
        isAutoRefreshEnabled = true;
        if (refreshInput) {
            refreshInput.readOnly = true;
        }
        if (autoRefreshWorker) {
            autoRefreshWorker.postMessage({ type: 'start', duration: countdownDuration, timeLeft });
        }
    } else {
        isAutoRefreshEnabled = false;
        refreshInput.readOnly = false;
        if (autoRefreshWorker) {
            autoRefreshWorker.postMessage({ type: 'stop' });
        }
    }
}

// Function to handle user input for refresh time
function handleRefreshTimeInput() {
    refreshInput.addEventListener("input", (event) => {
        const newDuration = parseInt(event.target.value, 10);
        if (!isNaN(newDuration) && newDuration >= MIN_DURATION) {
            countdownDuration = newDuration;
            timeLeft = newDuration;
            if (autoRefreshWorker && isAutoRefreshEnabled) {
                autoRefreshWorker.postMessage({ type: 'start', duration: countdownDuration, timeLeft });
            }
        } else if (newDuration < MIN_DURATION) {
            refreshInput.value = MIN_DURATION;
            countdownDuration = MIN_DURATION;
            timeLeft = MIN_DURATION;
        }
    });
}

// Function to limit user input characters
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('refresh-time-input');
    const maxLength = 2;

    input.addEventListener('input', () => {
        if (input.value.length > maxLength) {
            input.value = input.value.slice(0, maxLength);
        }
    });
});

// Initialize the refresh time input handler
handleRefreshTimeInput();

// Add event listener for the auto-refresh checkbox
autoRefreshCheckbox.addEventListener("change", toggleAutoRefresh);

// Start the auto-refresh worker
startAutoRefreshWorker();
toggleAutoRefresh();