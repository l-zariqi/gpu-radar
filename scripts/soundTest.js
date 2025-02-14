// Define the Audio object
let stockSound = new Audio('./sounds/notification.mp3');

// Log when the audio is loaded and ready to play
stockSound.addEventListener("canplaythrough", function () {
    console.log("Audio is ready to play.");
});

// Log any errors with the audio file
stockSound.addEventListener("error", function (e) {
    console.error("Error loading audio:", e);
});

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
    const soundTestButton = document.getElementById("sound-test-button");
    const soundDropdown = document.getElementById("sound-dropdown");

    if (soundTestButton && soundDropdown) {
        // Play sound when the button is clicked
        soundTestButton.addEventListener("click", function () {
            // console.log("Playing sound...");
            stockSound.play().then(() => {
                console.log("Alert test played successfully.");
            }).catch((error) => {
                console.error("Error playing alert test:", error);
            });
        });

        // Change the sound when the dropdown selection changes
        soundDropdown.addEventListener("change", function (event) {
            const selectedSound = event.target.value;
            stockSound = new Audio(selectedSound);
            // console.log("Sound changed to:", selectedSound);
        });
    }
});