document.addEventListener('DOMContentLoaded', function () {
    const askButton = document.getElementById('askButton');
    const textInput = document.getElementById('textInput');
    const urlInput = document.getElementById('urlInput');
    const answerDiv = document.getElementById('answerDiv');
    const copyButton = document.getElementById('copyButton');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');

    function showProgressBar() {
        progressBarContainer.style.display = 'block';
        progressBar.style.width = '0%';
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) {
                clearInterval(interval);
            } else {
                width += 1;
                progressBar.style.width = `${width}%`;
            }
        }, 50);
        return interval;
    }

    function hideProgressBar(interval) {
        clearInterval(interval);
        progressBar.style.width = '100%';
        setTimeout(() => {
            progressBarContainer.style.display = 'none';
        }, 500);
    }

    textInput.addEventListener('input', function () {
        textInput.style.height = 'auto';
        textInput.style.overflowY = 'hidden';
        const maxHeight = 200;
        if (textInput.scrollHeight > maxHeight) {
            textInput.style.height = `${maxHeight}px`;
            textInput.style.overflowY = 'scroll';
        } else {
            textInput.style.height = `${textInput.scrollHeight}px`;
        }
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
        const interval = showProgressBar();

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
                let message = data.message;
                if (message) {
                    const bulletPattern = /- \*\*(.*)/g;
                    message = message.replace(bulletPattern, '<li>$1</li>');
                    message = `<ul>${message}</ul>`;
                }
                answerDiv.innerHTML = message;
                hideProgressBar(interval);
            })
            .catch(error => {
                console.error('Error:', error);
                answerDiv.textContent = 'Failed to load response. ' + error.message;
                hideProgressBar(interval);
            })
    });

    copyButton.addEventListener('click', function () {
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
