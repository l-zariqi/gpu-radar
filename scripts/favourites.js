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

// Load favourites when the page loads
document.addEventListener("DOMContentLoaded", loadFavourites);