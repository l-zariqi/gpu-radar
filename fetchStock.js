// Fetch product stock data from the API
fetchStockData();

function fetchStockData() {
    const apiUrl = "https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=en-gb";

    console.log("Fetching stock data from API..."); // Log when fetching starts
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not OK ' + response.statusText);
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
    console.log("Updating stock status and prices for products:", products); // Log the products being processed
    const gpuRows = document.querySelectorAll("tbody tr");

    // Clear previous statuses and prices
    gpuRows.forEach(row => {
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price"); // Select the price cell using the product-price class
        if (statusCell) {
            statusCell.textContent = ""; // Clear previous status
            statusCell.classList.remove("in-stock", "out-of-stock");
        }
        if (priceCell) {
            priceCell.textContent = ""; // Clear previous price
        }
    });

    products.forEach(product => {
        const isNvidiaProduct = product.manufacturer === "NVIDIA";

        if (isNvidiaProduct) {
            gpuRows.forEach(row => {
                const productId = row.getAttribute("data-product-id"); // Get the productID from the row

                // Match product using the productID from the API
                if (productId && product.productID === parseInt(productId)) {
                    const statusCell = row.querySelector(".stock-status");
                    const priceCell = row.querySelector(".product-price"); // Select the price cell using the product-price class

                    // Update stock status
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

                    // Update price
                    if (priceCell && product.productPrice) {
                        let priceString = product.productPrice.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
                        let price = parseFloat(priceString); // Convert the cleaned string to a number

                        if (!isNaN(price)) {
                            priceCell.textContent = `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`; // Format price and update if it's a valid number
                        } else {
                            priceCell.textContent = "Unknown"; // If price is not a valid number, set as "Unknown"
                        }
                    }
                }
            });
        }
    });

    // Set "Unknown" status and price for GPUs not found in API response
    gpuRows.forEach(row => {
        const productId = row.getAttribute("data-product-id");
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");

        // Check if the status or price cells are still empty
        if (statusCell && !statusCell.textContent) {
            statusCell.textContent = "Unknown"; // Set status to Unknown
            statusCell.classList.add("unknown-status");
        }
        if (priceCell && !priceCell.textContent) {
            priceCell.textContent = "Unknown"; // Set price to Unknown
        }
    });
}