document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
        } else {
            localStorage.setItem("darkMode", null);
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
        }
    });

    // Keep dark mode state on page reload
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";
    } else {
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";
    }
});