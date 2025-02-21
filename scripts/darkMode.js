document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    // Function to set the theme based on system preference
    function setThemeBasedOnSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add("dark-mode");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
            localStorage.setItem("darkMode", "enabled");
        } else {
            document.body.classList.remove("dark-mode");
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
            localStorage.setItem("darkMode", null);
        }
    }

    // Set theme based on system preference on page load
    setThemeBasedOnSystemPreference();

    // Toggle theme manually
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
    } else if (localStorage.getItem("darkMode") === null) {
        document.body.classList.remove("dark-mode");
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";
    }

    // Listen for system theme changes (optional)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        const newColorScheme = event.matches ? "dark" : "light";
        if (newColorScheme === "dark") {
            document.body.classList.add("dark-mode");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
        } else {
            document.body.classList.remove("dark-mode");
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
        }
    });
});