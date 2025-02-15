const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const locale = event.queryStringParameters.locale || 'en-gb';
    const apiUrl = `https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=${locale}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};