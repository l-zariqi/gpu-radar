// Import the functions from favourites.js
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

// Global variable to store the current locale
let currentLocale = localStorage.getItem("selectedLocale") || "en-gb"; // Default to "en-gb" if no locale is saved

// Event listener for locale dropdown
document.addEventListener("DOMContentLoaded", function () {
    const localeDropdown = document.getElementById("locale-dropdown");
    const soundDropdown = document.getElementById("sound-dropdown");

    if (localeDropdown) {
        // Set the dropdown to the saved locale (or default)
        localeDropdown.value = currentLocale;

        // Add event listener for locale changes
        localeDropdown.addEventListener("change", function (event) {
            currentLocale = event.target.value; // Update the current locale
            localStorage.setItem("selectedLocale", currentLocale); // Save the selected locale to localStorage
            fetchStockData(); // Refresh the stock data with the new locale
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


// Function to fetch stock data with the selected locale
fetchStockData();
export async function fetchStockData() {
    // const baseApiUrl = "http://localhost:8000/mock-api.json"; MOCK API
    const baseApiUrl = "https://api.nvidia.partners/edge/product/search";
    const limit = 9;
    const totalPages = 1;
    let allProducts = [];

    console.log("Fetching stock data from API...");

    try {
        // Loop through multiple pages
        for (let page = 1; page <= totalPages; page++) {
            const apiUrl = `${baseApiUrl}?page=${page}&limit=${limit}&locale=${currentLocale}`;
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

// Function to update stock status and prices
function updateStockStatus(products) {
    console.log("Updating stock status, prices, and links for products:", products);
    const gpuRows = document.querySelectorAll("tbody tr");

    // Clear previous statuses, prices, and links
    gpuRows.forEach(row => {
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");
        if (statusCell) {
            statusCell.textContent = "";
            statusCell.classList.remove("in-stock", "out-of-stock");
        }
        if (priceCell) {
            priceCell.textContent = "";
        }
        if (linkCell) {
            linkCell.innerHTML = "";
        }
    });

    products.forEach(product => {
        const isNvidiaProduct = product.manufacturer === "NVIDIA";

        if (isNvidiaProduct) {
            gpuRows.forEach(row => {
                const productModel = row.querySelector(".product-model").textContent;

                // Match product using the GPU model name from the API (productTitle)
                if (productModel && product.productTitle === productModel) {
                    // Set the data-product-sku attribute dynamically
                    row.setAttribute("data-product-sku", product.productSKU);

                    // Migrate the favourite state from the model name to the SKU
                    const oldIdentifier = productModel; // Fallback identifier
                    const newIdentifier = product.productSKU; // New identifier
                    const isFavouritedMigration = localStorage.getItem(`favourite-${oldIdentifier}`) === "true";

                    if (isFavouritedMigration) {
                        // Migrate the favourite state to the new identifier
                        localStorage.setItem(`favourite-${newIdentifier}`, true);
                        localStorage.removeItem(`favourite-${oldIdentifier}`);
                    }

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
                        priceCell.textContent = product.productPrice; // Display the price string
                    }

                    // Update link
                    if (linkCell && product.internalLink) {
                        linkCell.innerHTML = `<a href="${product.internalLink}" target="_blank" rel="noopener noreferrer">View</a>`;
                    } else {
                        linkCell.innerHTML = `<a href="#" target="_blank" rel="noopener noreferrer">View</a>`; // Default link if internalLink is missing
                    }
                }
            });
        }
    });

    // Set "Unknown" status, price, and link for GPUs not found in API response
    gpuRows.forEach(row => {
        const productSKU = row.getAttribute("data-product-sku");
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");

        // Check if the status, price, or link cells are still empty
        if (statusCell && !statusCell.textContent) {
            statusCell.textContent = "Not Available";
            statusCell.classList.add("unknown-status");
        }
        if (priceCell && !priceCell.textContent) {
            priceCell.textContent = "Not Available";
        }
        if (linkCell && !linkCell.innerHTML) {
            linkCell.innerHTML = `<a href="#" target="_blank" rel="noopener noreferrer">View</a>`; // Default link if Unknown
        }
    });

    // Load favourites and setup favourite icons after the table is populated
    loadFavourites();
}