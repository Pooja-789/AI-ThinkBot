
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware to serve static files and parse JSON bodies
app.use(express.static('public'));
app.use(express.json());


// Route to handle chat completion requests
app.post('/api/query', async (req, res) => {
    const prompt = req.body.prompt;

    const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
        const url = urlMatch[0];

        try {
            const articleContent = await fetchArticleContent(url);
            const summary = await summarizeText(articleContent);

            res.json({ message: summary });
        } catch (error) {
            console.error('Error processing the URL:', error.message);
            res.status(500).json({ error: 'Failed to process the article URL', details: error.message });
        }
    }
    else {
        try {
            const agent = new https.Agent({
                ca: fs.readFileSync('certificate.crt')
            });
            // Make an API call to the OpenAI chat completion endpoint
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4", // Make sure to use the correct model name
                messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: req.body.prompt }]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent: agent
            });

            // Log the full response data
            console.log('OpenAI API Response:', JSON.stringify(response.data, null, 2));

            // Extract the message content and send back to the client
            const messageContent = response.data.choices[0].message.content;
            res.json({ message: messageContent });

        } catch (error) {
            // Log the error details
            console.error('Error with OpenAI API:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
            // Send a 500 Internal Server Error response to the client
            res.status(500).json({ error: 'Failed to fetch response from OpenAI', details: error.message });
        }
    }
});
async function fetchArticleContent(url) {
    const response = await axios.get(url, {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        }),
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const articleText = $('article').text() || $('body').text();
    if (!articleText) {
        throw new Error('Unable to extract content from the page. The structure may not match.');
    }
    return articleText.trim();
}

async function summarizeText(text) {
    const agent = new https.Agent({
        rejectUnauthorized: false,
        ca: fs.readFileSync('certificate.crt')
    });

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are an assistant that summarizes articles." },
            { role: "user", content: `Summarize this article: ${text}` }
        ]
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: agent
    });

    return response.data.choices[0].message.content;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Log the API key for debugging purposes
    console.log(`Using OpenAI API Key: ${process.env.OPENAI_API_KEY}`);
});

