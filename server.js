import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { summarizeResponseText } from './openaiapi.js';

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Route to handle chat completion requests
app.post('/api/query', async (req, res) => {
    const prompt = req.body.prompt;

    const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
        try {
            const summary = await summarizeResponseText(prompt, 'URL');
            console.log(summary)
            res.json({ message: summary });
        } catch (error) {
            console.error('Error processing the URL:', error.message);
            res.status(500).json({ error: 'Failed to process the article URL', details: error.message });
        }
    }
    else {
        try {
            const summary = await summarizeResponseText(prompt, '');
            //console.log(summary)
            res.json({ message: summary });
        } catch (error) {
            console.error('Error with OpenAI API:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
            res.status(500).json({ error: 'Failed to fetch response from OpenAI', details: error.message });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Log the API key for debugging purposes
    // console.log(`Using OpenAI API Key: ${process.env.OPENAI_API_KEY}`);
});

