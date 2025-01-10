    document.addEventListener("DOMContentLoaded", function () {
        const toggleButton = document.getElementById("dark-mode-toggle");
        const logoImages = document.querySelectorAll(".manufacturer-logo"); // Select all logo images
        
        toggleButton.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
        
            logoImages.forEach(logoImg => {
                // Switch the logo based on dark mode status using data attributes
                if (document.body.classList.contains("dark-mode")) {
                    localStorage.setItem("darkMode", "enabled");
                    logoImg.src = logoImg.getAttribute("data-dark-src"); // Set dark mode logo
                } else {
                    localStorage.setItem("darkMode", null);
                    logoImg.src = logoImg.getAttribute("data-light-src"); // Set light mode logo
                }
            });
        });
        
            // Keep dark mode state on page reload
            if (localStorage.getItem("darkMode") === "enabled") {
                document.body.classList.add("dark-mode");
                logoImages.forEach(logoImg => {
                    logoImg.src = logoImg.getAttribute("data-dark-src"); // Set dark mode logo on reload
                });
            } else {
                logoImages.forEach(logoImg => {
                    logoImg.src = logoImg.getAttribute("data-light-src"); // Set light mode logo on reload
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
                statusCell.classList.add("unknown-status"); // Optionally add a class for styling
            }
            if (priceCell && !priceCell.textContent) {
                priceCell.textContent = "Unknown"; // Set price to Unknown
            }
        });
    }  
});

// Add click event listeners to all table headers with the "table-header" class
document.querySelectorAll('.table-header').forEach(header => {
    header.addEventListener('click', () => {
        const currentSort = header.getAttribute('data-sort');
        const newSort = currentSort === 'asc' ? 'desc' : 'asc';

        // Reset all headers to "none"
        document.querySelectorAll('.table-header').forEach(h => {
            h.setAttribute('data-sort', 'none');
            h.querySelector('.sort-icon').textContent = '';
        });

        // Set the new sort direction on the clicked header
        header.setAttribute('data-sort', newSort);
        header.querySelector('.sort-icon').textContent = newSort === 'asc' ? '▲' : '▼';

        // Implement sorting logic here
        sortTable(header.cellIndex, newSort);
    });
});

// Sorting logic (Example: sorts numerically or alphabetically)
function sortTable(columnIndex, sortDirection) {
    const table = document.querySelector('table tbody');
    const rows = Array.from(table.rows);

    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        if (!isNaN(cellA) && !isNaN(cellB)) {
            // Numerical sorting
            return sortDirection === 'asc' ? cellA - cellB : cellB - cellA;
        } else {
            // Alphabetical sorting
            return sortDirection === 'asc'
                ? cellA.localeCompare(cellB)
                : cellB.localeCompare(cellA);
        }
    });

    // Append rows in the new order
    rows.forEach(row => table.appendChild(row));
}
