// Versioning system for localStorage
const STORAGE_VERSION = "2.0"; // Increment this when you make breaking changes

// Function to check and update the localStorage version
function checkStorageVersion() {
    const currentVersion = localStorage.getItem("favouriteGPUsVersion");

    // If the version is outdated or doesn't exist, clear or migrate old data
    if (currentVersion !== STORAGE_VERSION) {
        localStorage.removeItem("favouriteGPUs"); // Clear old favourites
        localStorage.setItem("favouriteGPUsVersion", STORAGE_VERSION); // Update to the new version
        showMigrationMessage(); // Notify the user
    }
}

// Function to show a migration message to the user
function showMigrationMessage() {
    const message = document.createElement("div");
    message.textContent = "We've updated our system. Your favourites have been reset.";
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
    }, 10000); // Remove the message after 5 seconds
}

// Function to load favourites from localStorage
export function loadFavourites() {
    const favouriteGPUs = JSON.parse(localStorage.getItem("favouriteGPUs")) || [];
    
    document.querySelectorAll(".product-row").forEach(row => {
        const modelNameSpan = row.querySelector(".model-name");
        const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : ""; // Use model-name
        const bellIcon = row.querySelector(".alert-icon");

        if (favouriteGPUs.includes(productModel)) {
            bellIcon.classList.add("fa-solid");
            bellIcon.classList.remove("fa-regular");
            bellIcon.setAttribute("data-favourite", "true");
        } else {
            bellIcon.classList.add("fa-regular");
            bellIcon.classList.remove("fa-solid");
            bellIcon.setAttribute("data-favourite", "false");
        }
    });

    updateDimmedRows();
}

// Function to handle bell icon clicks using event delegation
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("alert-icon")) {
        toggleFavourite(event.target);
    }
});

// Function to toggle favourite status
function toggleFavourite(icon) {
    const productRow = icon.closest(".product-row");
    const modelNameSpan = productRow.querySelector(".model-name");
    const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : ""; // Use model-name

    let favouriteGPUs = JSON.parse(localStorage.getItem("favouriteGPUs")) || [];

    if (favouriteGPUs.includes(productModel)) {
        favouriteGPUs = favouriteGPUs.filter(model => model !== productModel);
        icon.classList.add("fa-regular");
        icon.classList.remove("fa-solid");
        icon.setAttribute("data-favourite", "false");
    } else {
        favouriteGPUs.push(productModel);
        icon.classList.add("fa-solid");
        icon.classList.remove("fa-regular");
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
        const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : ""; // Use model-name

        if (favouriteGPUs.length > 0 && !favouriteGPUs.includes(productModel)) {
            row.classList.add("dimmed-row");
        } else {
            row.classList.remove("dimmed-row");
        }
    });
}

// Check storage version and load favourites when the page loads
document.addEventListener("DOMContentLoaded", function () {
    checkStorageVersion(); // Check and update the version
    loadFavourites(); // Load favourites
});