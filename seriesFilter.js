// Filter series of GPU model
document.addEventListener("DOMContentLoaded", function () {
    const modelHeader = document.querySelector(".model-header");
    const modelDropdown = document.getElementById("model-dropdown");
    const dropdownOptions = document.querySelectorAll(".dropdown-option");
    const gpuRows = document.querySelectorAll("tbody tr");
    const modelHeaderText = document.getElementById("model-header-text");

    // Toggle dropdown visibility when clicking "Model"
    modelHeader.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent document click listener from firing
        const isDropdownVisible = modelDropdown.style.display === "block";
        modelDropdown.style.display = isDropdownVisible ? "none" : "block";
    });

    // Filter rows based on selected series
    dropdownOptions.forEach(option => {
        option.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevent document click listener from firing
            const selectedSeries = option.getAttribute("data-series");

            // Update the model header text to show the selected series
            if (selectedSeries === "all") {
                modelHeaderText.innerHTML = `Model <i class="fa-solid fa-chevron-down"></i>`;
            } else if (selectedSeries === "4000") {
                modelHeaderText.innerHTML = `40 Series <i class="fa-solid fa-chevron-down"></i>`;
            } else if (selectedSeries === "5000") {
                modelHeaderText.innerHTML = `50 Series <i class="fa-solid fa-chevron-down"></i>`;
            }

            // Filter the rows based on the selected series
            gpuRows.forEach(row => {
                const modelCell = row.querySelector(".product-model");
                if (modelCell) {
                    const modelText = modelCell.textContent;
                    if (selectedSeries === "all" ||
                        (selectedSeries === "4000" && modelText.includes("40")) ||
                        (selectedSeries === "5000" && modelText.includes("50"))) {
                        row.style.display = ""; // Show row
                    } else {
                        row.style.display = "none"; // Hide row
                    }
                }
            });

            // Hide the dropdown after selection
            modelDropdown.style.display = "none";
        });
    });

    // Hide dropdown if clicked outside
    document.addEventListener("click", function () {
        modelDropdown.style.display = "none";
    });
});