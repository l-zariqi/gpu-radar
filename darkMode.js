// Dark Mode toggle
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("dark-mode-toggle");
    const logoImages = document.querySelectorAll(".manufacturer-logo"); // Select all logo images

    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        logoImages.forEach(logoImg => {
            // Switch the logo based on dark mode status using data attributes
            if (document.body.classList.contains("dark-mode")) {
                localStorage.setItem("darkMode", "enabled");
                logoImg.src = logoImg.getAttribute("data-dark-src"); // Set dark mode logo
            } else {
                localStorage.setItem("darkMode", null);
                logoImg.src = logoImg.getAttribute("data-light-src"); // Set light mode logo
            }
        });
    });

    // Keep dark mode state on page reload
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        logoImages.forEach(logoImg => {
            logoImg.src = logoImg.getAttribute("data-dark-src"); // Set dark mode logo on reload
        });
    } else {
        logoImages.forEach(logoImg => {
            logoImg.src = logoImg.getAttribute("data-light-src"); // Set light mode logo on reload
        });
    }
});