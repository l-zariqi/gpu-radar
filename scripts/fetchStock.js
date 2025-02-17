import { loadFavourites } from './favourites.js';

window.currentLocale = localStorage.getItem("selectedLocale") || "en-gb"; // Define globally

// Initialize the fetchWorker if it doesn't already exist
if (!window.fetchWorker) {
    window.fetchWorker = new Worker('./scripts/fetchWorker.js');
    window.fetchWorker.addEventListener('message', (event) => {
        const data = event.data;
        if (data && data.searchedProducts && data.searchedProducts.productDetails) {
            updateStockStatus(data.searchedProducts.productDetails);
        }
    });
    console.log('Fetch Worker initialized.');
}

// Function to fetch stock data (runs in the main thread)
function fetchStockData() {
    if (window.fetchWorker) {
        window.fetchWorker.postMessage({ type: 'fetch', locale: window.currentLocale });
    } else {
        console.error('Fetch Worker is not initialized.');
        // Optionally, initialize the fetchWorker here if it's not already initialized
        if (!window.fetchWorker) {
            window.fetchWorker = new Worker('./scripts/fetchWorker.js');
            window.fetchWorker.addEventListener('message', (event) => {
                const data = event.data;
                if (data && data.searchedProducts && data.searchedProducts.productDetails) {
                    updateStockStatus(data.searchedProducts.productDetails);
                    isApiDown = false;
                } else {
                    // API is down or returned an error
                    if (!isApiDown) {
                        isApiDown = true;
                        playNotificationSound();
                    }
                }
            });
            console.log('Fetch Worker initialized in fetchStockData.');
        }
    }
}

// Trigger initial fetch when the page loads
document.addEventListener("DOMContentLoaded", function () {
    fetchStockData();

    // Optionally, set an initial fetch time if needed
    const fetchTimeElement = document.getElementById("fetch-time");
    if (fetchTimeElement) {
        fetchTimeElement.textContent = `Last fetch: ${formatLastFetchTime()}`;
    }
});

// Function to format the last fetched time
function formatLastFetchTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Format: 03:45:00 PM
}

let lastFetchTime = null; // Track the last fetch time globally

// Update table data function
export function updateStockStatus(products) {
    console.log("Updating table data:", products);
    const gpuRows = document.querySelectorAll("tbody tr");

    // Update the last fetch time
    lastFetchTime = formatLastFetchTime();

    // Update the fetch time in the auto-refresh button
    const fetchTimeElement = document.getElementById("fetch-time");
    if (fetchTimeElement) {
        fetchTimeElement.textContent = `Last fetch: ${lastFetchTime}`;
    }

    // Create a set of GPU models from the fetched data
    const fetchedGpuModels = new Set(products.map(product => product.displayName));

    // Clear previous statuses, prices, and links
    gpuRows.forEach(row => {
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");
        const skuSpan = row.querySelector(".product-sku");

        if (statusCell) {
            const previousStatus = statusCell.textContent;

            // Clear the status cell
            statusCell.textContent = "";
            statusCell.classList.remove("in-stock", "out-of-stock", "unknown-status");
        }
        if (priceCell) {
            priceCell.textContent = "";
            priceCell.style.color = ""; // Reset the color to default
        }
        if (linkCell) {
            linkCell.innerHTML = "";
            linkCell.style.color = ""; // Reset the color to default
        }
        if (skuSpan) {
            skuSpan.textContent = "";
        }
    });

    // Update the table with the fetched data
    products.forEach(product => {
        const isNvidiaProduct = product.manufacturer === "NVIDIA";

        if (isNvidiaProduct) {
            gpuRows.forEach(row => {
                const modelNameSpan = row.querySelector(".model-name");
                const productModel = modelNameSpan ? modelNameSpan.textContent : "";

                // Match product using the GPU model name from the API (displayName)
                if (productModel && product.displayName === productModel) {
                    const statusCell = row.querySelector(".stock-status");
                    const priceCell = row.querySelector(".product-price");
                    const linkCell = row.querySelector(".product-link");
                    const skuSpan = row.querySelector(".product-sku");
                    const alertIcon = row.querySelector(".alert-icon");

                    // Check if the GPU is favourited
                    const isFavourited = alertIcon.getAttribute("data-favourite") === "true";

                    // Update stock status based on prdStatus
                    if (statusCell) {
                        const previousStatus = statusCell.textContent;
                        const currentStatus = product.prdStatus === "buy_now" ? "In Stock" : "Out of Stock";

                        let stockStatus = "";
                        if (product.prdStatus === "buy_now") {
                            stockStatus = "In Stock";
                            statusCell.classList.remove("out-of-stock", "unknown-status");
                            statusCell.classList.add("in-stock");

                            // Play sound if the GPU is favourited and just came in stock
                            if (isFavourited && previousStatus !== "In Stock") {
                                playNotificationSound();
                            }
                        } else if (product.prdStatus === "out_of_stock") {
                            stockStatus = "Out of Stock";
                            statusCell.classList.remove("in-stock", "unknown-status");
                            statusCell.classList.add("out-of-stock");
                        }
                        statusCell.textContent = stockStatus;
                    }

                    // Update price
                    if (priceCell && product.productPrice) {
                        priceCell.textContent = product.productPrice;
                        priceCell.style.color = ""; // Reset the color to default
                    }

                    // Update link
                    if (linkCell && product.internalLink) {
                        linkCell.innerHTML = `<a href="${product.internalLink}" target="_blank" rel="noopener noreferrer">View</a>`;
                        linkCell.style.color = ""; // Reset the color to default
                    }

                    // Update SKU
                    if (skuSpan && product.productSKU) {
                        skuSpan.textContent = `SKU: ${product.productSKU}`;
                    }
                }
            });
        }
    });

    // Set "Unknown" status, price, and link for GPUs not found in API response
    gpuRows.forEach(row => {
        const modelNameSpan = row.querySelector(".model-name");
        const productModel = modelNameSpan ? modelNameSpan.textContent : "";
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");
        const skuSpan = row.querySelector(".product-sku");

        // Check if the GPU model is not in the fetched data
        if (!fetchedGpuModels.has(productModel)) {
            if (statusCell) {
                statusCell.textContent = "Not Available";
                statusCell.classList.add("unknown-status");
            }
            if (priceCell) {
                priceCell.textContent = "N/A";
                priceCell.style.color = "#666"; // Set grey color for unavailable products
            }
            if (linkCell) {
                linkCell.innerHTML = `<a href="#" style="color:#666;" rel="noopener noreferrer">N/A</a>`;
            }
            if (skuSpan) {
                skuSpan.textContent = "SKU: N/A";
            }
        }
    });

    // Load favourites and setup favourite icons after the table is populated
    loadFavourites();
}

// Function to play the notification sound for 30 seconds
function playNotificationSound() {
    console.log("playNotificationSound called");

    const soundDuration = 30000; // Total duration to play the sound (30 seconds)
    const playbackInterval = 1000; // Delay between playbacks in milliseconds (1 second)
    const startTime = Date.now();

    function playLoop() {
        if (Date.now() - startTime < soundDuration) {
            stockSound.play();
            setTimeout(playLoop, playbackInterval);
        }
    }

    playLoop();
}

// Event listener for locale dropdown
document.addEventListener("DOMContentLoaded", function () {
    const localeDropdown = document.getElementById("locale-dropdown");
    const soundDropdown = document.getElementById("sound-dropdown");

    if (localeDropdown) {
        // Set the dropdown to the saved locale (or default)
        localeDropdown.value = window.currentLocale || "en-gb";

        // Add event listener for locale changes
        localeDropdown.addEventListener("change", function (event) {
            window.currentLocale = event.target.value; // Update the current locale
            localStorage.setItem("selectedLocale", window.currentLocale); // Save the selected locale to localStorage

            // Send a message to the Web Worker to fetch data with the new locale
            if (window.fetchWorker) {
                window.fetchWorker.postMessage({ type: 'fetch', locale: window.currentLocale });
            } else {
                console.error('Fetch Worker is not initialized.');
                // Initialize the fetchWorker if it's not already initialized
                if (!window.fetchWorker) {
                    window.fetchWorker = new Worker('./scripts/fetchWorker.js');
                    window.fetchWorker.addEventListener('message', (event) => {
                        const data = event.data;
                        if (data && data.searchedProducts && data.searchedProducts.productDetails) {
                            updateStockStatus(data.searchedProducts.productDetails);
                        }
                    });
                    console.log('Fetch Worker initialized in locale dropdown handler.');
                }
            }
        });
    }

    if (soundDropdown) {
        // Add event listener for sound changes
        soundDropdown.addEventListener("change", function (event) {
            const selectedSound = event.target.value;
            stockSound = new Audio(selectedSound);
            console.log("Sound changed to:", selectedSound);
        });
    }
});

// Audio object for the notification sound
let stockSound = new Audio('./sounds/notification.mp3'); // Default sound