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
    clearInterval(countdownInterval);

    // Immediately send the initial timeLeft before any decrement
    self.postMessage({ type: 'countdown', timeLeft });

    countdownInterval = setInterval(() => {
        if (timeLeft > 1) {
            timeLeft -= 1;
            self.postMessage({ type: 'countdown', timeLeft });
        } else {
            self.postMessage({ type: 'countdown', timeLeft });
            self.postMessage({ type: 'fetch' });
            timeLeft = countdownDuration;
            self.postMessage({ type: 'countdown', timeLeft });
        }
    }, 1000);
}

function stopCountdown() {
    clearInterval(countdownInterval);
}