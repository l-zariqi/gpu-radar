import { fetchStockData } from './fetchStock.js';

let autoRefreshInterval = null; // Variable to store the auto-refresh interval ID
let countdownInterval = null; // Variable to store the countdown interval ID
const countdownDuration = 30; // Countdown duration in seconds
let timeLeft = countdownDuration; // Variable to track the remaining time
let isAutoRefreshEnabled = false; // Variable to track if auto-refresh is enabled

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
                fetchStockData() // Fetch data only when the timer reaches 0
                    .then(() => {
                        timeLeft = countdownDuration; // Reset the timer
                        startCountdown(); // Restart the countdown
                    })
                    .catch((error) => {
                        console.error('Error during auto-refresh:', error);
                        // Retry after 5 seconds if there's an error
                        setTimeout(() => {
                            timeLeft = countdownDuration;
                            startCountdown();
                        }, 5000);
                    });
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

// Function to toggle auto-refresh
function toggleAutoRefresh() {
    const autoRefreshCheckbox = document.getElementById("auto-refresh-checkbox");

    if (autoRefreshCheckbox.checked) {
        isAutoRefreshEnabled = true;
        if (!autoRefreshInterval) {
            startCountdown();
            console.log("Auto refresh enabled. Checking API every 30 seconds.");
        }
    } else {
        isAutoRefreshEnabled = false;
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
        stopCountdown();
        console.log("Auto refresh disabled.");
    }
}

// Add event listener to the checkbox
document.getElementById("auto-refresh-checkbox").addEventListener("change", toggleAutoRefresh);