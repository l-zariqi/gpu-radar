console.log("JavaScript is running!");

document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("dark-mode-toggle");

    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        
        // Optionally, save the user's preference in local storage
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", null);
        }
    });

    // Load the user's preference on page load
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }
});
