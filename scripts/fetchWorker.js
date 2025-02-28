self.addEventListener('message', (event) => {
    // console.log('Worker received message:', event.data);

    if (event.data.type === 'fetch') {
        const locale = event.data.locale || 'en-gb';

        console.log('Fetching data for locale:', locale);

        // Fetch data from the API with the selected locale
        fetch(`https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=${locale}`)
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