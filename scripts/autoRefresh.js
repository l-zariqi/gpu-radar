let autoRefreshInterval = null; // Variable to store the auto-refresh interval ID
let countdownInterval = null; // Variable to store the countdown interval ID
const countdownDuration = 30; // Countdown duration in seconds

// Function to start the countdown timer
function startCountdown() {
    let timeLeft = countdownDuration;
    const autoRefreshButton = document.getElementById("auto-refresh-toggle");

    // Clear any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Update the countdown every second
    countdownInterval = setInterval(() => {
        timeLeft--;
        autoRefreshButton.innerHTML = `
            <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>
            </svg>
            Disable Auto Refresh (${timeLeft}s)
        `;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval); // Stop the countdown when it reaches 0
            autoRefreshButton.innerHTML = `
                <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>
                </svg>
                Disable Auto Refresh
            `; // Reset button text
        }
    }, 1000);
}

// Function to stop the countdown timer
function stopCountdown() {
    clearInterval(countdownInterval); // Stop the countdown
    const autoRefreshButton = document.getElementById("auto-refresh-toggle");
    autoRefreshButton.innerHTML = `
        <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>
        </svg>
        Enable Auto Refresh (30s)
    `; // Reset button text
}

// Function to toggle auto-refresh
function toggleAutoRefresh() {
    const autoRefreshButton = document.getElementById("auto-refresh-toggle");

    if (autoRefreshInterval) {
        // If auto-refresh is already enabled, disable it
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        stopCountdown(); // Stop the countdown
        autoRefreshButton.classList.remove("enabled"); // Remove the "enabled" class
        console.log("Auto refresh disabled.");
    } else {
        // If auto-refresh is disabled, enable it
        autoRefreshInterval = setInterval(() => {
            fetchStockData(); // Fetch data immediately
            startCountdown(); // Reset and start the countdown
        }, countdownDuration * 1000); // 30 seconds

        // Fetch data immediately when auto-refresh is enabled
        fetchStockData();
        startCountdown(); // Start the countdown
        autoRefreshButton.classList.add("enabled"); // Add the "enabled" class
        console.log("Auto refresh enabled. Checking API every 30 seconds.");
    }
}

// Add event listener to the button
document.getElementById("auto-refresh-toggle").addEventListener("click", toggleAutoRefresh);