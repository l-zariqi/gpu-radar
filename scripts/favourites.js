// Versioning system for localStorage
const STORAGE_VERSION = "2.0";

// Check and update the localStorage version
function checkStorageVersion() {
    const currentVersion = localStorage.getItem("favouriteGPUsVersion");

    // If the version is outdated or doesn't exist, clear or migrate old data
    if (currentVersion !== STORAGE_VERSION) {
        localStorage.removeItem("favouriteGPUs");
        localStorage.setItem("favouriteGPUsVersion", STORAGE_VERSION);
        showMigrationMessage();
    }
}

// Show migration message function
function showMigrationMessage() {
    const message = document.createElement("div");
    message.textContent = "Your favourites have been reset.";
    message.style.position = "fixed";
    message.style.bottom = "20px";
    message.style.right = "20px";
    message.style.padding = "10px";
    message.style.backgroundColor = "#ffcc00";
    message.style.color = "black"
    message.style.borderRadius = "5px";
    message.style.zIndex = "1000";
    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 10000); // Remove message after 10 seconds
}

// Load favourites from localStorage
export function loadFavourites() {
    const favouriteGPUs = JSON.parse(localStorage.getItem("favouriteGPUs")) || [];

    document.querySelectorAll(".product-row").forEach(row => {
        const modelNameSpan = row.querySelector(".model-name");
        const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : "";
        const bellIcon = row.querySelector(".alert-icon");

        if (favouriteGPUs.includes(productModel)) {
            // If the product is favourited, show the filled bell icon
            bellIcon.classList.remove("fa-bell-slash");
            bellIcon.classList.add("fa-solid", "fa-bell");
            bellIcon.setAttribute("data-favourite", "true");
        } else {
            // If the product is not favourited, show the bell-slash icon
            bellIcon.classList.remove("fa-bell", "fa-solid");
            bellIcon.classList.add("fa-solid", "fa-bell-slash");
            bellIcon.setAttribute("data-favourite", "false");
        }
    });

    updateDimmedRows();
}

// Handle bell icon clicks using event delegation
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("alert-icon")) {
        toggleFavourite(event.target);
    }
});

// Toggle favourite status function
function toggleFavourite(icon) {
    const productRow = icon.closest(".product-row");
    const modelNameSpan = productRow.querySelector(".model-name");
    const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : "";

    let favouriteGPUs = JSON.parse(localStorage.getItem("favouriteGPUs")) || [];

    if (favouriteGPUs.includes(productModel)) {
        // If the product is already favourited, remove it and show the bell-slash icon
        favouriteGPUs = favouriteGPUs.filter(model => model !== productModel);
        icon.classList.remove("fa-bell", "fa-solid");
        icon.classList.add("fa-solid", "fa-bell-slash");
        icon.setAttribute("data-favourite", "false");
    } else {
        // If the product is not favourited, add it and show the filled bell icon
        favouriteGPUs.push(productModel);
        icon.classList.remove("fa-bell-slash");
        icon.classList.add("fa-solid", "fa-bell");
        icon.setAttribute("data-favourite", "true");
    }

    localStorage.setItem("favouriteGPUs", JSON.stringify(favouriteGPUs));
    updateDimmedRows();
}

// Function to dim rows that aren't favourited
function updateDimmedRows() {
    const favouriteGPUs = JSON.parse(localStorage.getItem("favouriteGPUs")) || [];
    const productRows = document.querySelectorAll(".product-row");

    productRows.forEach(row => {
        const modelNameSpan = row.querySelector(".model-name");
        const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : "";

        if (favouriteGPUs.length > 0 && !favouriteGPUs.includes(productModel)) {
            row.classList.add("dimmed-row");
        } else {
            row.classList.remove("dimmed-row");
        }
    });
}

// Check storage version and load favourites when the page loads
document.addEventListener("DOMContentLoaded", function () {
    checkStorageVersion();
    loadFavourites();
});