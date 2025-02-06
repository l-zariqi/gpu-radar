document.addEventListener("DOMContentLoaded", function () {
    const favouriteIcons = document.querySelectorAll(".alert-icon");

    // Update the dimming of rows based on favourited state
    function updateDimmedRows() {
        const tableRows = document.querySelectorAll(".product-row");
        let anyFavourited = false;

        // Check if any row is favourited
        tableRows.forEach((row) => {
            const rowIcon = row.querySelector(".alert-icon");
            if (rowIcon.getAttribute("data-favourite") === "true") {
                anyFavourited = true;
            }
        });

        // Dim or undim rows based on whether any row is favourited
        tableRows.forEach((row) => {
            const rowIcon = row.querySelector(".alert-icon");
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

        // Set the initial state of the bell icon
        if (isFavourited) {
            icon.setAttribute("data-favourite", "true");
            icon.classList.remove("fa-regular", "fa-bell");
            icon.classList.add("fa-solid", "fa-bell");
        } else {
            icon.setAttribute("data-favourite", "false");
            icon.classList.remove("fa-solid", "fa-bell");
            icon.classList.add("fa-regular", "fa-bell");
        }
    });

    // Update dimmed rows based on initial favourited states
    updateDimmedRows();

    // Add click event listeners to the bell icons
    favouriteIcons.forEach((icon) => {
        icon.addEventListener("click", function () {
            const productId = icon.closest(".product-row").getAttribute("data-product-id");
            const isFavourited = icon.getAttribute("data-favourite") === "true";

            // Toggle the favourited state
            icon.setAttribute("data-favourite", !isFavourited);

            // Save the favourited state to localStorage
            localStorage.setItem(`favourite-${productId}`, !isFavourited);

            // Toggle between outlined and filled bell
            if (isFavourited) {
                icon.classList.remove("fa-solid", "fa-bell"); // Remove filled bell
                icon.classList.add("fa-regular", "fa-bell"); // Add outlined bell
            } else {
                icon.classList.remove("fa-regular", "fa-bell"); // Remove outlined bell
                icon.classList.add("fa-solid", "fa-bell"); // Add filled bell
            }

            // Update the dimming of rows
            updateDimmedRows();
        });
    });
});