import { loadFavourites } from './favourites.js';

// Global variable to track sound state
let isSoundEnabled = true;

// Audio object for the notification sound
let stockSound = new Audio('./sounds/notification.mp3');

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
            if (window.worker) {
                console.log('Locale changed. Fetching data for:', window.currentLocale);
                window.worker.postMessage({ type: 'fetch', locale: window.currentLocale });
            } else {
                console.error('Web Worker is not initialized.');
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

// Function to update stock status and prices
// fetchStock.js
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
    });

    // Update the table with the fetched data
    products.forEach(product => {
        const isNvidiaProduct = product.manufacturer === "NVIDIA";

        if (isNvidiaProduct) {
            gpuRows.forEach(row => {
                const productModel = row.querySelector(".product-model").textContent;

                // Match product using the GPU model name from the API (productTitle)
                if (productModel && product.productTitle === productModel) {
                    const statusCell = row.querySelector(".stock-status");
                    const priceCell = row.querySelector(".product-price");
                    const linkCell = row.querySelector(".product-link");
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
                    }
                }
            });
        }
    });

    // Set "Unknown" status, price, and link for GPUs not found in API response
    gpuRows.forEach(row => {
        const productModel = row.querySelector(".product-model").textContent;
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");

        // Check if the GPU model is not in the fetched data
        if (!fetchedGpuModels.has(productModel)) {
            if (statusCell) {
                statusCell.textContent = "Not Available";
                statusCell.classList.add("unknown-status");
            }
            if (priceCell) {
                priceCell.textContent = "Not Available";
            }
            if (linkCell) {
                linkCell.innerHTML = `<a href="#" rel="noopener noreferrer">N/A</a>`;
            }
        }
    });

    // Load favourites and setup favourite icons after the table is populated
    loadFavourites();
}