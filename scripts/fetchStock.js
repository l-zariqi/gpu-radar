import { loadFavourites } from './favourites.js';
import lastInStockTimes from './lastInStockTimes.js';

window.currentLocale = localStorage.getItem("selectedLocale") || "en-gb";
let isLocaleChanging = false;

// Format display time
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
        if (event.data?.success) {
            updateStockStatus(event.data.data);
            isApiDown = false;
        } else {
            console.error('Fetch error:', event.data?.error || 'Unknown error');
            if (!isApiDown) {
                isApiDown = true;
                playNotificationSound();
            }
            document.getElementById("fetch-time").textContent = `Error: ${event.data?.error || 'API request failed'}`;
        }
        isLocaleChanging = false;
    });
}

function showLoadingSpinners() {
    const gpuRows = document.querySelectorAll("tbody tr");
    const spinnerHTML = `
        <svg class="loading-spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path stroke-dasharray="16" stroke-dashoffset="16" d="M12 3c4.97 0 9 4.03 9 9">
                    <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"/>
                    <animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
                </path>
                <path stroke-dasharray="64" stroke-dashoffset="64" stroke-opacity="0.3" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                    <animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"/>
                </path>
            </g>
        </svg>`;

    gpuRows.forEach(row => {
        const cells = [
            row.querySelector(".stock-status"),
            row.querySelector(".product-price"),
            row.querySelector(".product-link")
        ];
        
        cells.forEach(cell => {
            if (cell) {
                cell.innerHTML = spinnerHTML;
                cell.style.color = "";
                cell.className = cell.className.split(' ')[0];
            }
        });
    });
}

export function fetchStockData() {
    if (window.fetchWorker) {
        if (isLocaleChanging) {
            showLoadingSpinners();
        }
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

export function updateStockStatus(inventoryData) {
    const gpuRows = document.querySelectorAll("tbody tr");
    lastFetchTime = formatLastFetchTime();
    document.getElementById("fetch-time").textContent = `Last fetch: ${lastFetchTime}`;

    const inventoryMap = {};
    inventoryData.forEach(item => {
        inventoryMap[item.displayName] = item;
    });

    gpuRows.forEach(row => {
        const modelNameSpan = row.querySelector(".model-name");
        const rowModelName = modelNameSpan?.textContent;
        if (!rowModelName) return;

        const statusCell = row.querySelector(".stock-status");
        const priceCell = row.querySelector(".product-price");
        const linkCell = row.querySelector(".product-link");
        const skuSpan = row.querySelector(".product-sku");
        const alertIcon = row.querySelector(".alert-icon");

        const item = inventoryMap[rowModelName];
        const isFavourited = alertIcon?.getAttribute("data-favourite") === "true";

        // Reset cell styling
        [statusCell, priceCell, linkCell, skuSpan].forEach(cell => {
            if (cell) {
                cell.className = cell.className.split(' ')[0];
                cell.style.color = "";
            }
        });

        if (!item) {
            if (statusCell) {
                statusCell.textContent = "Not Available";
                statusCell.classList.add("unknown-status");
                const lastTime = lastInStockTimes[rowModelName]?.[window.currentLocale];
                statusCell.setAttribute("data-tooltip", `Last In Stock: ${formatDisplayTime(lastTime)}`);
            }
            if (priceCell) {
                priceCell.textContent = "N/A";
                priceCell.style.color = "#666";
            }
            if (linkCell) {
                linkCell.innerHTML = '<a href="#" style="color:#666;">N/A</a>';
            }
            if (skuSpan) {
                skuSpan.textContent = "SKU: N/A";
            }
            return;
        }

        // Update status cell
        if (statusCell) {
            const isInStock = item.inventory?.listMap?.some(i => i.is_active === "true");
            statusCell.textContent = isInStock ? "In Stock" : "Out of Stock";
            statusCell.classList.add(isInStock ? "in-stock" : "out-of-stock");
            
            // Update last in-stock time and play sound if favourited
            if (isInStock) {
                updateLastInStockTime(rowModelName, window.currentLocale);
                if (isFavourited) {
                    playNotificationSound();
                }
            }
        
            const lastTime = lastInStockTimes[rowModelName]?.[window.currentLocale];
            statusCell.setAttribute("data-tooltip", `Last In Stock: ${formatDisplayTime(lastTime)}`);
        }

        // Update price cell
        if (priceCell) {
            if (item.productPrice) {
                const temp = document.createElement('div');
                temp.innerHTML = item.productPrice;
                priceCell.textContent = temp.textContent;
                priceCell.style.color = "";
            } else {
                priceCell.textContent = "N/A";
                priceCell.style.color = "#666";
            }
        }

        // Update link cell
        if (linkCell) {
            const url = item.inventory?.listMap?.[0]?.product_url || item.internalLink;
            if (url) {
                linkCell.innerHTML = `
                    <a href="${url}" target="_blank" rel="noopener noreferrer">
                        View
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M5 17.59L15.59 7H9V5h10v10h-2V8.41L6.41 19z"/>
                        </svg>
                    </a>`;
                linkCell.style.color = "";
            } else {
                linkCell.innerHTML = '<a href="#" style="color:#666;">N/A</a>';
            }
        }

        // Update SKU
        if (skuSpan) {
            skuSpan.textContent = item.productSKU ? `SKU: ${item.productSKU}` : "SKU: N/A";
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
            isLocaleChanging = true;
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