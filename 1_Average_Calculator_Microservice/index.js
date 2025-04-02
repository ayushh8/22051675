const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
const WINDOW_SIZE = process.env.WINDOW_SIZE;
const BASE_URL = process.env.BASE_URL;
const BEARER_TOKEN = process.env.BEARER_TOKEN;
console.log("Base url: ", BASE_URL);

const VALID_IDS = { p: 'primes', f: 'fibo', e: 'even', r: 'rand' };

let numberWindow = [];
const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(`${BASE_URL}/${type}`, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
        });
        return response.data.numbers || [];
    } catch {
        return [];
    }
};

const updateWindow = (newNumbers) => {
    const uniqueNumbers = [...new Set([...numberWindow, ...newNumbers])].slice(-WINDOW_SIZE);
    const prevState = [...numberWindow];
    numberWindow = uniqueNumbers;
    return prevState;
};

app.get('/numbers/:numberid', async (req, res) => {
    const type = VALID_IDS[req.params.numberid];
    if (!type) return res.status(400).json({ error: 'Invalid number ID' });
    
    const newNumbers = await fetchNumbers(type);
    const prevState = updateWindow(newNumbers);
    const avg = numberWindow.length ? (numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length).toFixed(2) : 0;
    
    res.json({
        windowPrevState: prevState,
        windowCurrState: numberWindow,
        numbers: newNumbers,
        avg: parseFloat(avg)
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
