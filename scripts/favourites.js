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
        const alertToggle = row.querySelector(".alert-checkbox");

        if (favouriteGPUs.includes(productModel)) {
            setAlertToggle(alertToggle, true);
        } else {
            setAlertToggle(alertToggle, false);
        }
    });

    updateDimmedRows();
}

function createAlertToggles() {
    document.querySelectorAll(".alert-icon").forEach((alertIcon, index) => {
        const toggleId = `alert-toggle-${index}`;
        const alertToggle = document.createElement("input");
        alertToggle.type = "checkbox";
        alertToggle.id = toggleId;
        alertToggle.className = "alert-checkbox";
        alertToggle.setAttribute("aria-label", "Enable stock alert");
        alertToggle.checked = alertIcon.getAttribute("data-favourite") === "true";

        const toggleLabel = document.createElement("label");
        toggleLabel.className = "toggle-label";
        toggleLabel.htmlFor = toggleId;
        toggleLabel.setAttribute("aria-hidden", "true");
        toggleLabel.innerHTML = '<span class="toggle-slider"></span>';

        const toggleContainer = document.createElement("div");
        toggleContainer.className = "alert-toggle";
        toggleContainer.append(alertToggle, toggleLabel);
        alertIcon.replaceWith(toggleContainer);
    });
}

// Handle alert toggle changes using event delegation
document.addEventListener("change", function (event) {
    if (event.target.matches(".alert-checkbox")) {
        toggleFavourite(event.target);
    }
});

function setAlertToggle(toggle, isFavourite) {
    toggle.checked = isFavourite;
    toggle.setAttribute("data-favourite", String(isFavourite));
}

// Toggle favourite status function
function toggleFavourite(toggle) {
    const productRow = toggle.closest(".product-row");
    const modelNameSpan = productRow.querySelector(".model-name");
    const productModel = modelNameSpan ? modelNameSpan.textContent.trim() : "";

    let favouriteGPUs = JSON.parse(localStorage.getItem("favouriteGPUs")) || [];

    if (!toggle.checked) {
        favouriteGPUs = favouriteGPUs.filter(model => model !== productModel);
    } else {
        if (!favouriteGPUs.includes(productModel)) {
            favouriteGPUs.push(productModel);
        }
    }

    setAlertToggle(toggle, toggle.checked);
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

// Deferred module scripts run after the table has been parsed, so replace the
// static placeholders before the first paint.
createAlertToggles();

// Check storage version and load favourites when the page loads
document.addEventListener("DOMContentLoaded", function () {
    checkStorageVersion();
    loadFavourites();
});