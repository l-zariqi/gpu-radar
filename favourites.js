document.addEventListener("DOMContentLoaded", function () {
    const favouriteIcons = document.querySelectorAll(".favourite-icon");

    // Update the dimming of rows based on favourited state
    function updateDimmedRows() {
        const tableRows = document.querySelectorAll(".product-row");
        let anyFavourited = false;

        // Check if any row is favourited
        tableRows.forEach((row) => {
            const rowIcon = row.querySelector(".favourite-icon");
            if (rowIcon.getAttribute("data-favourite") === "true") {
                anyFavourited = true;
            }
        });

        // Dim or undim rows based on whether any row is favourited
        tableRows.forEach((row) => {
            const rowIcon = row.querySelector(".favourite-icon");
            if (anyFavourited) {
                if (rowIcon.getAttribute("data-favourite") === "false") {
                    row.classList.add("dimmed-row");
                } else {
                    row.classList.remove("dimmed-row");
                }
            } else {
                row.classList.remove("dimmed-row"); // Remove dimming if no rows are favourited
            }
        });
    }

    // Load favourited states from localStorage when the page loads
    favouriteIcons.forEach((icon) => {
        const productId = icon.closest(".product-row").getAttribute("data-product-id");
        const isFavourited = localStorage.getItem(`favourite-${productId}`) === "true";

        // Set the initial state of the heart icon
        if (isFavourited) {
            icon.setAttribute("data-favourite", "true");
            icon.classList.remove("fa-regular", "fa-heart");
            icon.classList.add("fa-solid", "fa-heart");
        } else {
            icon.setAttribute("data-favourite", "false");
            icon.classList.remove("fa-solid", "fa-heart");
            icon.classList.add("fa-regular", "fa-heart");
        }
    });

    // Update dimmed rows based on initial favourited states
    updateDimmedRows();

    // Add click event listeners to the heart icons
    favouriteIcons.forEach((icon) => {
        icon.addEventListener("click", function () {
            const productId = icon.closest(".product-row").getAttribute("data-product-id");
            const isFavourited = icon.getAttribute("data-favourite") === "true";

            // Toggle the favourited state
            icon.setAttribute("data-favourite", !isFavourited);

            // Save the favourited state to localStorage
            localStorage.setItem(`favourite-${productId}`, !isFavourited);

            // Toggle between outlined and filled heart
            if (isFavourited) {
                icon.classList.remove("fa-solid", "fa-heart"); // Remove filled heart
                icon.classList.add("fa-regular", "fa-heart"); // Add outlined heart
            } else {
                icon.classList.remove("fa-regular", "fa-heart"); // Remove outlined heart
                icon.classList.add("fa-solid", "fa-heart"); // Add filled heart
            }

            // Update the dimming of rows
            updateDimmedRows();
        });
    });
});