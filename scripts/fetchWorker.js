let activeController;

self.addEventListener('message', async (event) => {
    if (event.data.type === 'fetch') {
        const locale = event.data.locale || 'en-gb';
        console.log('Fetching data for locale:', locale);
        activeController?.abort();
        activeController = new AbortController();
        const { signal } = activeController;

        // Helper function to safely parse JSON
        async function safeJsonParse(response) {
            const text = await response.text();
            if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
                console.warn("Invalid JSON response (not JSON):", text.slice(0, 200));
                return null;
            }
            try {
                return JSON.parse(text);
            } catch (err) {
                console.warn("Failed to parse JSON:", err, "Response snippet:", text.slice(0, 200));
                return null;
            }
        }

        try {
            // Get product data (for prices and SKUs)
            const productResponse = await fetch(
                `https://api.nvidia.partners/edge/product/search?page=1&limit=12&locale=${encodeURIComponent(locale)}&category=GPU`,
                { signal }
            );

            if (!productResponse.ok) {
                throw new Error(`Product API failed: ${productResponse.statusText}`);
            }

            const productData = await safeJsonParse(productResponse);

            if (!productData?.searchedProducts?.productDetails) {
                throw new Error(`No valid product details found for locale "${locale}". The API may not support this region.`);
            }

            // Inventory requests are independent; run them concurrently to reduce total latency.
            const products = productData.searchedProducts.productDetails
                .filter(product => product.manufacturer === 'NVIDIA');
            const results = await Promise.all(products.map(async product => {
                try {
                    const inventoryResponse = await fetch(
                        `https://api.store.nvidia.com/partner/v1/feinventory?status=1&skus=${encodeURIComponent(product.productSKU)}&locale=${encodeURIComponent(locale)}`,
                        { signal }
                    );

                    const inventoryData = inventoryResponse.ok
                        ? await safeJsonParse(inventoryResponse)
                        : null;

                    return {
                        displayName: product.displayName,
                        productSKU: product.productSKU,
                        productPrice: product.productPrice,
                        internalLink: product.internalLink,
                        inventory: inventoryData
                    };
                } catch (err) {
                    if (err.name === 'AbortError') throw err;
                    console.warn(`Error processing ${product.productSKU}:`, err);
                    return {
                        displayName: product.displayName,
                        productSKU: product.productSKU,
                        productPrice: product.productPrice,
                        internalLink: product.internalLink,
                        inventory: null
                    };
                }
            }));

            self.postMessage({ success: true, data: results });
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Main fetch error:', error);
            self.postMessage({ success: false, error: error.message });
        }
    }
});
