self.addEventListener('message', (event) => {
    if (event.data.type === 'fetch') {
        const locale = event.data.locale || 'en-gb';
        const proxyUrl = `https://gpu-radar.netlify.app/.netlify/functions/proxy?locale=${locale}`;

        console.log('Fetching data via Netlify proxy for locale:', locale);

        fetch(proxyUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not OK: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Data fetched successfully via proxy:', data);
                self.postMessage(data);
            })
            .catch(error => {
                console.error('Proxy fetch error:', error);
                self.postMessage({});
            });
    }
});