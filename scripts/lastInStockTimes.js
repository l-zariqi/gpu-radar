// Initialize lastInStockTimes for each GPU model and locale
const lastInStockTimes = {
    "NVIDIA RTX 5090": {},
    "NVIDIA RTX 5080": {},
    "NVIDIA RTX 5070": {}
};

// Load saved data from localStorage (if any)
const savedLastInStockTimes = JSON.parse(localStorage.getItem("lastInStockTimes")) || {};
for (const [model, times] of Object.entries(savedLastInStockTimes)) {
    if (lastInStockTimes[model]) {
        Object.assign(lastInStockTimes[model], times);
    }
}

export default lastInStockTimes;