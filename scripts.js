console.log("JavaScript is running!");

document.addEventListener("DOMContentLoaded", function () {
    // Dark mode toggle script
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

    // Add stock status logic
    const stockStatusCells = document.querySelectorAll(".stock-status");

    stockStatusCells.forEach(cell => {
        const stockStatus = cell.getAttribute("data-stock");
        if (stockStatus === "in-stock") {
            cell.style.backgroundColor = "green";  // Set color for in-stock
            cell.textContent = "In Stock";
        } else {
            cell.style.backgroundColor = "red";    // Set color for out-of-stock
            cell.textContent = "Out of Stock";
        }
    });
});