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
    message.style.top = "20px";
    message.style.right = "20px";
    message.style.padding = "10px";
    message.style.backgroundColor = "#ffcc00";
    message.style.color = "black";
    message.style.borderRadius = "5px";
    message.style.zIndex = "1000";

    // Start hidden above the screen & transparent
    message.style.transform = "translateY(-100%)";
    message.style.opacity = "0";
    message.style.transition = "transform 0.5s ease, opacity 0.5s ease";

    document.body.appendChild(message);

    requestAnimationFrame(() => {
        message.style.transform = "translateY(0)";
        message.style.opacity = "1";
    });

    setTimeout(() => {
        message.style.transform = "translateY(-100%)";
        message.style.opacity = "0";
        message.addEventListener("transitionend", () => {
            message.remove();
        }, { once: true });
    }, 5000);
}


export function loadFavourites() {
    const favouriteGPUs = JSON.parse(localStorage.getItem("favouriteGPUs")) || [];

    document.querySelectorAll(".product-row").forEach(row => {
        const modelNameSpan = row.querySelector(".model-name");
        const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : "";
        const bellIcon = row.querySelector(".alert-icon");

        if (favouriteGPUs.includes(productModel)) {
            setBellIcon(bellIcon, true);
        } else {
            setBellIcon(bellIcon, false);
        }
    });

    updateDimmedRows();
}

// Handle bell icon clicks using event delegation
document.addEventListener("click", function (event) {
    const bellIcon = event.target.closest(".alert-icon");
    if (bellIcon) {
        toggleFavourite(bellIcon);
    }
});

const bellPath = '<path d="M0 0h16v16H0z" fill="none" /><path fill="currentColor" d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7c0-2.42-1.72-4.44-4.005-4.901" />';
const bellSlashPath = '<path d="M0 0h16v16H0z" fill="none" /><path fill="currentColor" d="M5.164 14H15c-.299-.199-.557-.553-.78-1c-.9-1.8-1.22-5.12-1.22-6q0-.396-.06-.776l-.938.938c.02.708.157 2.154.457 3.58c.161.767.377 1.566.663 2.258H6.164zm5.581-9.91a4 4 0 0 0-1.948-1.01L8 2.917l-.797.161A4 4 0 0 0 4 7c0 .628-.134 2.197-.459 3.742q-.075.358-.166.718l-1.653 1.653q.03-.055.059-.113C2.679 11.2 3 7.88 3 7c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0c.942.19 1.788.645 2.457 1.284zM10 15a2 2 0 1 1-4 0zm-9.375.625a.53.53 0 0 0 .75.75l14.75-14.75a.53.53 0 0 0-.75-.75z" />';

function setBellIcon(icon, isFavourite) {
    icon.classList.toggle("is-active", isFavourite);
    icon.classList.toggle("is-inactive", !isFavourite);
    icon.setAttribute("data-favourite", String(isFavourite));
    icon.innerHTML = isFavourite ? bellPath : bellSlashPath;
}

// Toggle favourite status function
function toggleFavourite(icon) {
    const productRow = icon.closest(".product-row");
    const modelNameSpan = productRow.querySelector(".model-name");
    const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : "";

    let favouriteGPUs = JSON.parse(localStorage.getItem("favouriteGPUs")) || [];

    if (favouriteGPUs.includes(productModel)) {
        favouriteGPUs = favouriteGPUs.filter(model => model !== productModel);
        setBellIcon(icon, false);
    } else {
        favouriteGPUs.push(productModel);
        setBellIcon(icon, true);
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