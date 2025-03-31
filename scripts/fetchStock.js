import { loadFavourites } from './favourites.js';
import lastInStockTimes from './lastInStockTimes.js';

window.currentLocale = localStorage.getItem("selectedLocale") || "en-gb";

// Helper function to format display time
function formatDisplayTime(isoString) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update the last in-stock time for a specific GPU and locale
function updateLastInStockTime(productModel, locale) {
    const now = new Date();
    if (!lastInStockTimes[productModel]) {
        lastInStockTimes[productModel] = {};
    }
    lastInStockTimes[productModel][locale] = now.toISOString();
    localStorage.setItem("lastInStockTimes", JSON.stringify(lastInStockTimes));
}

// Initialize the fetchWorker if it doesn't already exist
if (!window.fetchWorker) {
    window.fetchWorker = new Worker('./scripts/fetchWorker.js');
    window.fetchWorker.addEventListener('message', (event) => {
        const data = event.data;
        if (data?.searchedProducts?.productDetails) {
            updateStockStatus(data.searchedProducts.productDetails);
            isApiDown = false;
        } else {
            if (!isApiDown) {
                isApiDown = true;
                playNotificationSound();
            }
        }
    });
}

// Fetch stock data
export function fetchStockData() {
    if (window.fetchWorker) {
        window.fetchWorker.postMessage({ type: 'fetch', locale: window.currentLocale });
    }
}

// Format the last fetched time
function formatLastFetchTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

let lastFetchTime = null;
let isApiDown = false;

// Update table data
export function updateStockStatus(products) {
    console.log("Updating table data:", products);
    const gpuRows = document.querySelectorAll("tbody tr");

    // Update the last fetch time
    lastFetchTime = formatLastFetchTime();
    document.getElementById("fetch-time").textContent = `Last fetch: ${lastFetchTime}`;

    // Create a set of GPU models from the fetched data
    const fetchedGpuModels = new Set(products.map(product => product.displayName));

    // Clear previous table data
    gpuRows.forEach(row => {
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");
        const skuSpan = row.querySelector(".product-sku");

        if (statusCell) {
            statusCell.textContent = "";
            statusCell.classList.remove("in-stock", "out-of-stock", "unknown-status");
        }
        if (priceCell) priceCell.textContent = "";
        if (linkCell) linkCell.innerHTML = "";
        if (skuSpan) skuSpan.textContent = "";
    });

    // Update the table with the fetched data
    products.forEach(product => {
        if (product.manufacturer === "NVIDIA") {
            gpuRows.forEach(row => {
                const modelNameSpan = row.querySelector(".model-name");
                const rowModelName = modelNameSpan?.textContent;

                if (rowModelName && product.displayName === rowModelName) {
                    const statusCell = row.querySelector(".stock-status");
                    const priceCell = row.querySelector(".product-price");
                    const linkCell = row.querySelector(".product-link");
                    const skuSpan = row.querySelector(".product-sku");
                    const alertIcon = row.querySelector(".alert-icon");

                    const isFavourited = alertIcon?.getAttribute("data-favourite") === "true";
                    const previousStatus = statusCell?.textContent;

                    // Update stock status
                    if (statusCell) {
                        let stockStatus = "";
                        if (product.prdStatus === "buy_now") {
                            stockStatus = "In Stock";
                            statusCell.classList.add("in-stock");
                            
                            // Update last in-stock time
                            updateLastInStockTime(product.displayName, window.currentLocale);
                            
                            if (isFavourited && previousStatus !== "In Stock") {
                                playNotificationSound();
                            }
                        } else if (product.prdStatus === "out_of_stock") {
                            stockStatus = "Out of Stock";
                            statusCell.classList.add("out-of-stock");
                        }
                        statusCell.textContent = stockStatus;

                        // Set tooltip with last in-stock time
                        const lastTime = lastInStockTimes[product.displayName]?.[window.currentLocale];
                        statusCell.setAttribute("data-tooltip", `Last In Stock: ${formatDisplayTime(lastTime)}`);
                    }

                    // Update other cells
                    if (priceCell && product.productPrice) {
                        priceCell.textContent = product.productPrice;
                        priceCell.style.color = "";
                    }
                    if (linkCell && product.internalLink) {
                        linkCell.innerHTML = `<a href="${product.internalLink}" target="_blank" rel="noopener noreferrer">View<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 17.59L15.59 7H9V5h10v10h-2V8.41L6.41 19z"/></svg></a>`;
                        linkCell.style.color = "";
                    }
                    if (skuSpan && product.productSKU) {
                        skuSpan.textContent = `SKU: ${product.productSKU}`;
                    }
                }
            });
        }
    });

    // Set "Unknown" status for GPUs not found in API response
    gpuRows.forEach(row => {
        const modelNameSpan = row.querySelector(".model-name");
        const rowModelName = modelNameSpan?.textContent;
        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");
        const skuSpan = row.querySelector(".product-sku");

        if (rowModelName && !fetchedGpuModels.has(rowModelName)) {
            if (statusCell) {
                statusCell.textContent = "Not Available";
                statusCell.classList.add("unknown-status");
                const lastTime = lastInStockTimes[rowModelName]?.[window.currentLocale];
                statusCell.setAttribute("data-tooltip", `Last In Stock: ${formatDisplayTime(lastTime)}`);
            }
            if (priceCell) priceCell.textContent = "N/A";
                priceCell.style.color = "#666";
            if (linkCell) linkCell.innerHTML = `<a href="#" style="color:#666;" rel="noopener noreferrer">N/A</a>`;
            if (skuSpan) skuSpan.textContent = "SKU: N/A";
        }
    });

    loadFavourites();
}

// Play notification sound
function playNotificationSound() {
    const soundDuration = 30000;
    const playbackInterval = 1000;
    const startTime = Date.now();

    function playLoop() {
        if (Date.now() - startTime < soundDuration) {
            stockSound.play().catch(e => console.error("Error playing sound:", e));
            setTimeout(playLoop, playbackInterval);
        }
    }
    playLoop();
}

// Initialize audio
let stockSound = new Audio('./sounds/sound1.mp3');

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    fetchStockData();

    const localeDropdown = document.getElementById("locale-dropdown");
    const soundDropdown = document.getElementById("sound-dropdown");

    if (localeDropdown) {
        localeDropdown.value = window.currentLocale;
        localeDropdown.addEventListener("change", (event) => {
            window.currentLocale = event.target.value;
            localStorage.setItem("selectedLocale", window.currentLocale);
            fetchStockData();
        });
    }

    if (soundDropdown) {
        soundDropdown.addEventListener("change", (event) => {
            stockSound = new Audio(event.target.value);
        });
    }
});