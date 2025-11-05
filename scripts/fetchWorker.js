self.addEventListener('message', async (event) => {
    if (event.data.type === 'fetch') {
        const locale = event.data.locale || 'en-gb';
        console.log('Fetching data for locale:', locale);

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
                `https://api.nvidia.partners/edge/product/search?page=1&limit=12&locale=${locale}&category=GPU`
            );

            if (!productResponse.ok) {
                throw new Error(`Product API failed: ${productResponse.statusText}`);
            }

            const productData = await safeJsonParse(productResponse);

            if (!productData?.searchedProducts?.productDetails) {
                throw new Error(`No valid product details found for locale "${locale}". The API may not support this region.`);
            }

            // Process each product to get inventory status
            const results = [];
            for (const product of productData.searchedProducts.productDetails) {
                if (product.manufacturer !== 'NVIDIA') continue;

                try {
                    const inventoryResponse = await fetch(
                        `https://api.store.nvidia.com/partner/v1/feinventory?status=1&skus=${product.productSKU}&locale=${locale}`
                    );

                    const inventoryData = inventoryResponse.ok
                        ? await safeJsonParse(inventoryResponse)
                        : null;

                    results.push({
                        displayName: product.displayName,
                        productSKU: product.productSKU,
                        productPrice: product.productPrice,
                        internalLink: product.internalLink,
                        inventory: inventoryData
                    });
                } catch (err) {
                    console.warn(`Error processing ${product.productSKU}:`, err);
                    results.push({
                        displayName: product.displayName,
                        productSKU: product.productSKU,
                        productPrice: product.productPrice,
                        internalLink: product.internalLink,
                        inventory: null
                    });
                }
            }

            self.postMessage({ success: true, data: results });
        } catch (error) {
            console.error('Main fetch error:', error);
            self.postMessage({ success: false, error: error.message });
        }
    }
});
