import { updateStockStatus } from './fetchStock.js';

let worker;
let isAutoRefreshEnabled = false;
let countdownInterval = null;
const countdownDuration = 30; // Countdown duration in seconds
let timeLeft = countdownDuration;

// Define currentLocale globally
let currentLocale = localStorage.getItem("selectedLocale") || "en-gb"; // Default to "en-gb" if no locale is saved

// Function to start the countdown timer
function startCountdown() {
    const toggleText = document.querySelector(".toggle-text");

    // Clear any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Update the countdown every second
    countdownInterval = setInterval(() => {
        timeLeft--;
        toggleText.textContent = `Auto Refresh (${timeLeft}s)`;

        // When the timer reaches 0, fetch data and reset the timer
        if (timeLeft <= 0) {
            clearInterval(countdownInterval); // Stop the countdown when it reaches 0
            toggleText.textContent = "Auto Refresh (30s)"; // Reset text

            if (isAutoRefreshEnabled) {
                console.log('Timer reached zero. Fetching data...');
                // Fetch data by sending a message to the worker
                if (window.worker) {
                    window.worker.postMessage({ type: 'fetch', locale: currentLocale });
                } else {
                    console.error('Web Worker is not initialized.');
                }
                timeLeft = countdownDuration; // Reset the timer
                startCountdown(); // Restart the countdown
            }
        }
    }, 1000);
}

// Function to stop the countdown timer
function stopCountdown() {
    clearInterval(countdownInterval); // Stop the countdown
    const toggleText = document.querySelector(".toggle-text");
    toggleText.textContent = `Auto Refresh (${timeLeft}s)`;
}

// Function to start the Web Worker
function startWorker() {
    if (!window.worker) {
        window.worker = new Worker('./scripts/fetchWorker.js');

        // Listen for messages from the worker (fetched data)
        window.worker.addEventListener('message', (event) => {
            const data = event.data;
            console.log('Data received from worker:', data);

            // Ensure the data structure is correct before updating the UI
            if (data && data.searchedProducts && data.searchedProducts.productDetails) {
                updateStockStatus(data.searchedProducts.productDetails); // Update the UI with fetched data
            } else {
                console.error('Invalid data structure received from worker:', data);
            }
        });

        console.log('Web Worker started.');
    }
}

// Function to stop the Web Worker
function stopWorker() {
    if (window.worker) {
        window.worker.terminate(); // Clean up the worker
        window.worker = null;
        console.log('Web Worker stopped.');
    }
}

// Function to toggle auto-refresh
function toggleAutoRefresh() {
    const autoRefreshCheckbox = document.getElementById("auto-refresh-checkbox");

    if (autoRefreshCheckbox.checked) {
        isAutoRefreshEnabled = true;
        startCountdown(); // Start the countdown
    } else {
        isAutoRefreshEnabled = false;
        stopCountdown(); // Stop the countdown
    }
}

// Add event listener to the checkbox
document.getElementById("auto-refresh-checkbox").addEventListener("change", toggleAutoRefresh);

// Make currentLocale globally accessible
window.currentLocale = currentLocale;

// Start the worker when the page loads
startWorker();

// Trigger an initial fetch when the page loads
if (window.worker) {
    window.worker.postMessage({ type: 'fetch', locale: currentLocale });
}