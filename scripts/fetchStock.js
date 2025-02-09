// Global variable to track sound state
let isSoundEnabled = true;

// Audio object for the notification sound
const stockSound = new Audio('./sounds/notification.mp3');

// Function to play the notification sound for 30 seconds
function playNotificationSound() {
    console.log("playNotificationSound called");

    const soundDuration = 30000;
    const startTime = Date.now();

    function playLoop() {
        if (Date.now() - startTime < soundDuration) {
            stockSound.play();
            setTimeout(playLoop, stockSound.duration * 1000);
        }
    }

    playLoop();
}

// Fetch stock data and update the table
fetchStockData();
async function fetchStockData() {
    const baseApiUrl = "https://api.nvidia.partners/edge/product/search";
    const limit = 9;
    const totalPages = 3;
    let allProducts = [];

    console.log("Fetching stock data from API...");

    try {
        // Loop through multiple pages
        for (let page = 1; page <= totalPages; page++) {
            const apiUrl = `${baseApiUrl}?page=${page}&limit=${limit}&locale=en-gb`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Network response was not OK for page ${page}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Data fetched successfully for page ${page}:`, data);

            // Add products from this page to the allProducts array
            if (data.searchedProducts && data.searchedProducts.productDetails) {
                allProducts = allProducts.concat(data.searchedProducts.productDetails);
            } else {
                console.error(`Error: No 'productDetails' key in 'searchedProducts' for page ${page}.`);
            }
        }

        // Update stock status with all products
        updateStockStatus(allProducts);
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

function updateStockStatus(products) {
    console.log("Updating stock status and prices for products:", products);
    const gpuRows = document.querySelectorAll("tbody tr");

    // Clear previous statuses and prices
    gpuRows.forEach(row => {
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        if (statusCell) {
            statusCell.textContent = "";
            statusCell.classList.remove("in-stock", "out-of-stock");
        }
        if (priceCell) {
            priceCell.textContent = "";
        }
    });

    products.forEach(product => {
        const isNvidiaProduct = product.manufacturer === "NVIDIA";

        if (isNvidiaProduct) {
            gpuRows.forEach(row => {
                const productSKU = row.getAttribute("data-product-sku"); // Get the productSKU from the row

                // Match product using the productSKU from the API
                if (productSKU && product.productSKU === productSKU) {
                    const statusCell = row.querySelector(".stock-status");
                    const priceCell = row.querySelector(".product-price");
                    const alertIcon = row.querySelector(".alert-icon");

                    // Check if the GPU is favourited
                    const isFavourited = alertIcon.getAttribute("data-favourite") === "true";

                    // Update stock status based on productAvailable
                    if (statusCell) {
                        let stockStatus = "";
                        if (product.productAvailable === true) {
                            stockStatus = "In Stock";
                            statusCell.classList.remove("out-of-stock");
                            statusCell.classList.add("in-stock");

                            // Play sound if the GPU is favourited and just came in stock
                            if (isFavourited && statusCell.textContent !== "In Stock") {
                                playNotificationSound();
                            }
                        } else if (product.productAvailable === false) {
                            stockStatus = "Out of Stock";
                            statusCell.classList.remove("in-stock");
                            statusCell.classList.add("out-of-stock");
                        }
                        statusCell.textContent = stockStatus;
                    }

                    // Update price
                    if (priceCell && product.productPrice) {
                        let priceString = product.productPrice.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
                        let price = parseFloat(priceString); // Convert the cleaned string to a number

                        if (!isNaN(price)) {
                            priceCell.textContent = `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
                        } else {
                            priceCell.textContent = "Unknown";
                        }
                    }
                }
            });
        }
    });

    // Set "Unknown" status and price for GPUs not found in API response
    gpuRows.forEach(row => {
        const productSKU = row.getAttribute("data-product-sku");
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");

        // Check if the status or price cells are still empty
        if (statusCell && !statusCell.textContent) {
            statusCell.textContent = "Unknown";
            statusCell.classList.add("unknown-status");
        }
        if (priceCell && !priceCell.textContent) {
            priceCell.textContent = "Unknown";
        }
    });
}