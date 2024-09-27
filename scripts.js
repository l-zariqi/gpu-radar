document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("dark-mode-toggle");

    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", null);
        }
    });

    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // Fetch product stock data from the API
    fetchStockData();

    function fetchStockData() {
        const apiUrl = "https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=en-gb";

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
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
        const gpuRows = document.querySelectorAll("tbody tr");
    
        // Clear previous statuses
        gpuRows.forEach(row => {
            const statusCell = row.querySelector("td:last-child");
            statusCell.textContent = ""; // Clear any previous status
            statusCell.classList.remove("in-stock", "out-of-stock"); // Ensure no status classes are present
        });
    
        products.forEach(product => {
            // Ensure we're only processing NVIDIA products
            const isNvidiaProduct = product.manufacturer === "NVIDIA";
    
            if (isNvidiaProduct) {
                gpuRows.forEach(row => {
                    const gpuModel = row.querySelector("td:first-child").textContent.trim();
                    const specificProductTitleStart = `NVIDIA GeForce `;
                    const specificProductTitleEnd = ` ${gpuModel}`;
    
                    // Log the product title being checked
                    console.log(`Checking product: ${product.productTitle} | prdStatus: ${product.prdStatus}`);
    
                    // Match product title specifically for NVIDIA products
                    if (product.productTitle.startsWith(specificProductTitleStart) && product.productTitle.endsWith(specificProductTitleEnd)) {
                        const statusCell = row.querySelector("td:last-child");
    
                        // Use 'prdStatus' to determine the stock status
                        let stockStatus = "";
    
                        if (product.prdStatus === "buy_now") {
                            stockStatus = "In Stock";
                            statusCell.classList.remove("out-of-stock");
                            statusCell.classList.add("in-stock");
                        } else if (product.prdStatus === "out_of_stock") {
                            stockStatus = "Out of Stock";
                            statusCell.classList.remove("in-stock");
                            statusCell.classList.add("out-of-stock");
                        } else {
                            stockStatus = "Unknown";
                        }
    
                        statusCell.textContent = stockStatus;
    
                        // Log for verification
                        console.log(`Set status for ${gpuModel}: ${stockStatus}`); // Debug log
                    }
                });
            } else {
                console.log(`Skipping non-NVIDIA product: ${product.productTitle}`); // Log non-NVIDIA products
            }
        });
    }                  
});
