
// script.js
document.addEventListener('DOMContentLoaded', function () {
    const askButton = document.getElementById('askButton');
    // const questionInput = document.getElementById('questionInput');
    const textInput = document.getElementById('textInput');
    const urlInput = document.getElementById('urlInput');
    const answerDiv = document.getElementById('answerDiv');
    const copyButton = document.getElementById('copyButton');

    textInput.addEventListener('input', function () {
        urlInput.disabled = textInput.value.trim().length > 0;
    });

    urlInput.addEventListener('input', function () {
        textInput.disabled = urlInput.value.trim().length > 0;
    });

    askButton.addEventListener('click', function () {
        let prompt = textInput.value.trim(); // First, prioritize textInput

        if (prompt) {
            const urlPattern = /https?:\/\/[^\s]+/;
            if (urlPattern.test(prompt)) {
                answerDiv.textContent = 'Please provide valid text, not a URL.';
                return;
            }
        } else {
            prompt = urlInput.value.trim();
            if (!prompt) {
                answerDiv.textContent = 'Please provide either a text or a URL.';
                return;
            }
            const urlPattern = /https?:\/\/[^\s]+/;
            if (!urlPattern.test(prompt)) {
                answerDiv.textContent = 'Please provide a valid URL.';
                return;
            }
        }

        // Proceed with the fetch request if input is valid
        fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data);
                answerDiv.textContent = data.message;
            })
            .catch(error => {
                console.error('Error:', error);
                answerDiv.textContent = 'Failed to load response. ' + error.message;
            });
    });

    ntListener('click', function () {
        if (answerDiv.textContent) {
            navigator.clipboard.writeText(answerDiv.textContent)
                .then(() => {
                    console.log('Text copied to clipboard');

                })
                .catch(err => {
                    console.error('Error in copying text: ', err);

                });
        }
    });
});
