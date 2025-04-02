const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
const WINDOW_SIZE = process.env.WINDOW_SIZE;
const BASE_URL = process.env.BASE_URL;
const BEARER_TOKEN = process.env.BEARER_TOKEN;

console.log("Base URL:", BASE_URL);

const VALID_IDS = { p: 'primes', f: 'fibo', e: 'even', r: 'rand' };

let numberWindow = [];

async function fetchNumbers(type) {
    try {
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => source.cancel(), 500); // this will help us receive quick responses.
        
        const response = await axios.get(`${BASE_URL}/${type}`, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
            cancelToken: source.token
        });
        
        clearTimeout(timeout);
        return response.data.numbers || [];
    } catch (error) {
        console.log("Error fetching numbers or request timeout:", error.message);
        return [];
    }
}

function updateWindow(newNumbers) {
    let prevState = [...numberWindow];
    numberWindow = Array.from(new Set([...numberWindow, ...newNumbers])).slice(-WINDOW_SIZE);
    return prevState;
}

app.get('/numbers/:numberid', async (req, res) => {
    let type = VALID_IDS[req.params.numberid];
    if (!type) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }
    
    const timeout = setTimeout(() => res.status(408).json({ error: "Request timed out" }), 500);
    let newNumbers = await fetchNumbers(type);
    clearTimeout(timeout);
    
    let prevState = updateWindow(newNumbers);
    let avg = numberWindow.length > 0 ? (numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length).toFixed(2) : 0;
    
    res.json({
        windowPrevState: prevState,
        windowCurrState: numberWindow,
        numbers: newNumbers,
        avg: parseFloat(avg)
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
