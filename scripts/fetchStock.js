import { loadFavourites } from './favourites.js'; // Import loadFavourites

window.currentLocale = localStorage.getItem("selectedLocale") || "en-gb"; // Define globally
// console.log('Current Locale:', window.currentLocale);

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
        // console.log('Fetching data for locale:', window.currentLocale);
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
                }
            });
            // console.log('Fetch Worker started in fetchStockData.');
        }
    }
}

// Trigger initial fetch when the page loads
document.addEventListener("DOMContentLoaded", function () {
    // console.log('DOM fully loaded. Fetching initial data...');
    fetchStockData();
});

// Function to update stock status and prices
export function updateStockStatus(products) {
    console.log("Updating stock status, prices, and links for products:", products);
    const gpuRows = document.querySelectorAll("tbody tr");

    // Create a set of GPU models from the fetched data
    const fetchedGpuModels = new Set(products.map(product => product.productTitle));

    // Clear previous statuses, prices, and links
    gpuRows.forEach(row => {
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");
        const skuSpan = row.querySelector(".product-sku");
        if (statusCell) {
            statusCell.textContent = "";
            statusCell.classList.remove("in-stock", "out-of-stock", "unknown-status");
        }
        if (priceCell) {
            priceCell.textContent = "";
        }
        if (linkCell) {
            linkCell.innerHTML = "";
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

                // Match product using the GPU model name from the API (productTitle)
                if (productModel && product.productTitle === productModel) {
                    const statusCell = row.querySelector(".stock-status");
                    const priceCell = row.querySelector(".product-price");
                    const linkCell = row.querySelector(".product-link");
                    const skuSpan = row.querySelector(".product-sku");
                    const alertIcon = row.querySelector(".alert-icon");

                    // Check if the GPU is favourited
                    const isFavourited = alertIcon.getAttribute("data-favourite") === "true";

                    // Update stock status based on productAvailable
                    if (statusCell) {
                        let stockStatus = "";
                        if (product.productAvailable === true) {
                            stockStatus = "In Stock";
                            statusCell.classList.remove("out-of-stock", "unknown-status");
                            statusCell.classList.add("in-stock");

                            // Play sound if the GPU is favourited and just came in stock
                            if (isFavourited && statusCell.textContent !== "In Stock") {
                                playNotificationSound();
                            }
                        } else if (product.productAvailable === false) {
                            stockStatus = "Out of Stock";
                            statusCell.classList.remove("in-stock", "unknown-status");
                            statusCell.classList.add("out-of-stock");
                        }
                        statusCell.textContent = stockStatus;
                    }

                    // Update price
                    if (priceCell && product.productPrice) {
                        priceCell.textContent = product.productPrice;
                    }

                    // Update link
                    if (linkCell && product.internalLink) {
                        linkCell.innerHTML = `<a href="${product.internalLink}" target="_blank" rel="noopener noreferrer">View</a>`;
                        // <svg class="url-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 10.5L21 3m-5 0h5v5m0 6v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>
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
                priceCell.style.color = "#666";
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
                // console.log('Locale changed. Fetching data for:', window.currentLocale);
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
let stockSound = new Audio('./sounds/notification.mp3');