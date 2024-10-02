document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("dark-mode-toggle");
    const logoImages = document.querySelectorAll(".manufacturer-logo"); // Select all logo images

    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        logoImages.forEach(logoImg => {
            // Switch the logo based on dark mode status
            if (document.body.classList.contains("dark-mode")) {
                localStorage.setItem("darkMode", "enabled");
                logoImg.src = "./images/nvidia-logo-horz-dark-mode.png"; // Switch to dark mode logo
            } else {
                localStorage.setItem("darkMode", null);
                logoImg.src = "./images/nvidia-logo-horz.png"; // Switch back to light mode logo
            }
        });
    });

    // Keep dark mode state on page reload
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        logoImages.forEach(logoImg => {
            logoImg.src = "./images/nvidia-logo-horz-dark-mode.png"; // Set dark mode logo on reload
        });
    } else {
        logoImages.forEach(logoImg => {
            logoImg.src = "./images/nvidia-logo-horz.png"; // Set light mode logo on reload
        });
    }

    // Fetch product stock data from the API
    fetchStockData();

    function fetchStockData() {
        const apiUrl = "https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=en-gb";
    
        console.log("Fetching stock data from API..."); // Log when fetching starts
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("Data fetched successfully:", data); // Log the fetched data
                if (data.searchedProducts && data.searchedProducts.productDetails) {
                    updateStockStatus(data.searchedProducts.productDetails);
                } else {
                    console.error("Error: No 'productDetails' key in 'searchedProducts'.");
                }
            })
            .catch(error => {
                console.error('Error fetching stock data:', error);
            });
    }
    

    function updateStockStatus(products) {
        console.log("Updating stock status for products:", products); // Log the products being processed
        const gpuRows = document.querySelectorAll("tbody tr");
    
        // Clear previous statuses
        gpuRows.forEach(row => {
            const statusCell = row.querySelector(".stock-status");
            if (statusCell) {
                statusCell.textContent = ""; // Clear previous status
                statusCell.classList.remove("in-stock", "out-of-stock");
            }
        });
    
        products.forEach(product => {
            const isNvidiaProduct = product.manufacturer === "NVIDIA";
    
            if (isNvidiaProduct) {
                gpuRows.forEach(row => {
                    const productId = row.getAttribute("data-product-id"); // Get the productID from the row
                    let found = false; // Flag to check if we found the product
    
                    // Match product using the productID from the API
                    if (productId && product.productID === parseInt(productId)) { // Ensure we compare as numbers
                        found = true; // Set found flag to true
                        const statusCell = row.querySelector(".stock-status");
    
                        if (statusCell) {
                            let stockStatus = "";
                            if (product.prdStatus === "buy_now") {
                                stockStatus = "In Stock";
                                statusCell.classList.remove("out-of-stock");
                                statusCell.classList.add("in-stock");
                            } else if (product.prdStatus === "out_of_stock") {
                                stockStatus = "Out of Stock";
                                statusCell.classList.remove("in-stock");
                                statusCell.classList.add("out-of-stock");
                            }
    
                            statusCell.textContent = stockStatus; // Update the status
                        }
                    }
                });
            }
        });
    
        // Set "Unknown" status for GPUs not found in API response
        gpuRows.forEach(row => {
            const productId = row.getAttribute("data-product-id");
            const statusCell = row.querySelector(".stock-status");
    
            // Check if the status cell is still empty
            if (statusCell && !statusCell.textContent) {
                statusCell.textContent = "Unknown"; // Set status to Unknown
                statusCell.classList.add("unknown-status"); // Optionally add a class for styling
            }
        });
    }    
});
