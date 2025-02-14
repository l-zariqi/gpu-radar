let countdownInterval;
let timeLeft;
let countdownDuration;

self.addEventListener('message', (event) => {
    const data = event.data;

    if (data.type === 'start') {
        countdownDuration = data.duration;
        timeLeft = data.timeLeft || countdownDuration; // Use preserved timeLeft if available
        startCountdown();
    } else if (data.type === 'stop') {
        stopCountdown();
    }
});

function startCountdown() {
    clearInterval(countdownInterval); // Clear any existing interval
    countdownInterval = setInterval(() => {
        timeLeft -= 1;
        self.postMessage({ type: 'countdown', timeLeft });

        if (timeLeft <= 0) {
            self.postMessage({ type: 'fetch' });
            timeLeft = countdownDuration; // Reset the countdown
        }
    }, 1000);
}

function stopCountdown() {
    clearInterval(countdownInterval);
    self.postMessage({ type: 'countdown', timeLeft }); // Send the current timeLeft back to the main thread
}