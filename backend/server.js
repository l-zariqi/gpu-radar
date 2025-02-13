const express = require('express');
const WebSocket = require('ws');
const fetch = require('node-fetch'); // For fetching stock data

const app = express();
const port = 3000;

// Create an HTTP server
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Function to fetch stock data
async function fetchStockData() {
    try {
        const response = await fetch('https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=en-gb');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return null;
    }
}

// Fetch stock data every 30 seconds and broadcast to clients
setInterval(async () => {
    const stockData = await fetchStockData();
    if (stockData) {
        // Broadcast the data to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(stockData));
            }
        });
    }
}, 30000); // 30 seconds

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send initial data to the client
    fetchStockData().then((data) => {
        if (data) {
            ws.send(JSON.stringify(data));
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});