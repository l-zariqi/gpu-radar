self.addEventListener('message', async (event) => {
    if (event.data.type === 'fetch') {
        const locale = event.data.locale || 'en-gb';
        console.log('Fetching data for locale:', locale);

        try {
            // 1. Get product data (for prices and SKUs)
            const productResponse = await fetch(
                `https://api.nvidia.partners/edge/product/search?locale=${locale}&page=1&limit=12&manufacturer=NVIDIA&category=GPU`
            );
            
            if (!productResponse.ok) {
                throw new Error(`Product API failed: ${productResponse.statusText}`);
            }
            
            const productData = await productResponse.json();
            
            if (!productData?.searchedProducts?.productDetails) {
                throw new Error('No product details found');
            }

            // 2. Process each product to get inventory status
            const results = [];
            for (const product of productData.searchedProducts.productDetails) {
                if (!product.productSKU) continue;
                
                try {
                    const inventoryResponse = await fetch(
                        `https://api.store.nvidia.com/partner/v1/feinventory?status=1&skus=${product.productSKU}&locale=${locale}`
                    );
                    
                    const inventoryData = inventoryResponse.ok 
                        ? await inventoryResponse.json() 
                        : null;

                    results.push({
                        displayName: product.displayName,
                        productSKU: product.productSKU,
                        productPrice: product.productPrice, // From original API
                        internalLink: product.internalLink,  // From original API
                        inventory: inventoryData             // From inventory API
                    });
                } catch (err) {
                    console.warn(`Error processing ${product.productSKU}:`, err);
                    // Still include the product with basic info
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