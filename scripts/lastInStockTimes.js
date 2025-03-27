// Initialize lastInStockTimes for each GPU model and locale
const lastInStockTimes = {
    "NVIDIA RTX 5090": {},
    "NVIDIA RTX 5080": {},
    "NVIDIA RTX 5070": {},
    "NVIDIA RTX 4090": {},
    "NVIDIA RTX 4080 SUPER": {},
    "NVIDIA RTX 4080": {},
    "NVIDIA RTX 4070 SUPER": {},
    "NVIDIA RTX 4070": {},
    "NVIDIA RTX 4060 Ti": {}
};

// Load saved data from localStorage (if any)
const savedLastInStockTimes = JSON.parse(localStorage.getItem("lastInStockTimes")) || {};
for (const [model, times] of Object.entries(savedLastInStockTimes)) {
    if (lastInStockTimes[model]) {
        Object.assign(lastInStockTimes[model], times);
    }
}

export default lastInStockTimes;