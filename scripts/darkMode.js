document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
    const logoImages = document.querySelectorAll(".manufacturer-logo");

    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";

            // Switch manufacturer logos to dark mode versions
            logoImages.forEach(logoImg => {
                logoImg.src = logoImg.getAttribute("data-dark-src"); // Set dark mode logo
            });
        } else {
            localStorage.setItem("darkMode", null);
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";

            // Switch manufacturer logos to light mode versions
            logoImages.forEach(logoImg => {
                logoImg.src = logoImg.getAttribute("data-light-src"); // Set light mode logo
            });
        }
    });

    // Keep dark mode state on page reload
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";

        // Ensure manufacturer logos are in dark mode on reload
        logoImages.forEach(logoImg => {
            logoImg.src = logoImg.getAttribute("data-dark-src");
        });
    } else {
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";

        // Ensure manufacturer logos are in light mode on reload
        logoImages.forEach(logoImg => {
            logoImg.src = logoImg.getAttribute("data-light-src");
        });
    }
});
