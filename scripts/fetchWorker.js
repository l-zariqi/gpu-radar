self.addEventListener('message', (event) => {
    // console.log('Worker received message:', event.data);

    if (event.data.type === 'fetch') {
        const locale = event.data.locale || 'en-gb';

        console.log('Fetching data for locale:', locale);

        // Fetch data from the API with the selected locale
        // fetch(`https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=${locale}&category=GPU`)
        fetch(`https://api.nvidia.partners/edge/product/search?locale=${locale}&page=1&limit=12&manufacturer=NVIDIA&manufacturer_filter=NVIDIA~3,ASUS~32,GAINWARD~5,GIGABYTE~13,INNO3D~3,KFA2~1,MSI~21,PALIT~8,PNY~7,ZOTAC~10&category=GPU`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not OK: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Data fetched successfully:', data);
                self.postMessage(data);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                self.postMessage({});
            });
    }
});