document.addEventListener('DOMContentLoaded', function () {
    const askButtonText = document.getElementById('askButtonText');
    const askButtonURL = document.getElementById('askButtonURL');
    const textInput = document.getElementById('textInput');
    const urlInput = document.getElementById('urlInput');
    const answerDivText = document.getElementById('answerDivText');
    const answerDivURL = document.getElementById('answerDivURL');
    const copyButtonText = document.getElementById('copyButtonText');
    const copyButtonURL = document.getElementById('copyButtonURL');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    const hamburgerIcon = document.getElementById('menuDisplay');
    const menuDiv = document.getElementById('menu');
    const textContentMenu = document.getElementById('textContentMenu');
    const webpageContentMenu = document.getElementById('webpageContentMenu');
    const textContent = document.getElementById('textContent');
    const webpageContent = document.getElementById('webpageContent');

    textContent.style.display = 'none';
    webpageContent.style.display = 'none';
    textContentMenu.style.color = 'grey'

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
    });

    askButtonText.addEventListener('click', function () {
        let prompt = textInput.value.trim(); // Text input from Text Summarizer page

        if (prompt) {
            const urlPattern = /https?:\/\/[^\s]+/;
            if (urlPattern.test(prompt)) {
                answerDivText.textContent = 'Please provide valid text, not a URL.';
                return;
            }
            const interval = showProgressBar();
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            })
                .then(response => response.json())
                .then(data => {
                    let message = data.message;
                    if (message) {
                        const bulletPattern = /- \*\*(.*)/g;
                        message = message.replace(bulletPattern, '<li>$1</li>');
                        message = `<ul>${message}</ul>`;
                    }
                    answerDivText.innerHTML = message;
                    hideProgressBar(interval);
                })
                .catch(error => {
                    console.error('Error:', error);
                    answerDivText.textContent = 'Failed to load response. ' + error.message;
                    hideProgressBar(interval);
                });
        } else {
            answerDivText.textContent = 'Please provide some text to summarize.';
        }
    });

    askButtonURL.addEventListener('click', function () {
        let prompt = urlInput.value.trim(); // URL input from Webpage Summarizer page

        if (prompt) {
            const urlPattern = /https?:\/\/[^\s]+/;
            if (!urlPattern.test(prompt)) {
                answerDivURL.innerHTML = 'Please provide a valid URL.';
                return;
            }
            const interval = showProgressBar();
            fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            })
                .then(response => response.json())
                .then(data => {
                    let message = data.message;
                    if (message) {
                        const bulletPattern = /- \*\*(.*)/g;
                        message = message.replace(bulletPattern, '<li>$1</li>');
                        message = `<ul>${message}</ul>`;
                    }
                    answerDivURL.innerHTML = message;
                    hideProgressBar(interval);
                })
                .catch(error => {
                    console.error('Error:', error);
                    answerDivURL.innerHTML = 'Failed to load response. ' + error.message;
                    hideProgressBar(interval);
                });
        } else {
            answerDivURL.webpageContent = 'Please provide a URL to summarize.';
        }
    });

    copyButtonText.addEventListener('click', function () {
        if (answerDivText.textContent) {
            navigator.clipboard.writeText(answerDivText.textContent)
                .then(() => {
                    console.log('Text copied to clipboard');
                })
                .catch(err => {
                    console.error('Error in copying text: ', err);
                });
        }
    });

    copyButtonURL.addEventListener('click', function () {
        if (answerDivURL.textContent) {
            navigator.clipboard.writeText(answerDivURL.textContent)
                .then(() => {
                    console.log('URL response copied to clipboard');
                })
                .catch(err => {
                    console.error('Error in copying text: ', err);
                });
        }
    });

    hamburgerIcon.addEventListener('click', function () {
        if (menuDiv.style.display === 'none' || menuDiv.style.display === '') {
            menuDiv.style.display = 'block';
            console.log('Menu shown');
        } else {
            menuDiv.style.display = 'none';
            console.log('Menu hidden');
        }
    });

    textContentMenu.addEventListener('click', function () {
        textContentMenu.style.color = 'blue'
        webpageContentMenu.style.color = 'grey'
        textContent.style.display = 'block'
        webpageContent.style.display = 'none'
    })

    webpageContentMenu.addEventListener('click', function () {
        webpageContentMenu.style.color = 'blue'
        textContentMenu.style.color = 'grey'
        textContent.style.display = 'none'
        webpageContent.style.display = 'block'
    })
});
