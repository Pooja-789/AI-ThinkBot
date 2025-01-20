const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Function to extract text from a PDF file
async function extractPdfText(filePath) {
  const dataBuffer = fs.readFileSync(filePath); // Read the PDF file as a buffer
  const pdfData = await pdf(dataBuffer); // Extract text using pdf-parse
  return pdfData.text; // Return the extracted text
}

// Function to split text into chunks
function splitIntoChunks(text, chunkSize = 1000) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }

  return chunks;
}

// Function to search for answers in text chunks
function searchChunks(chunks, question) {
  const relevantChunks = chunks.filter(chunk => 
    chunk.toLowerCase().includes(question.toLowerCase())
  );

  if (relevantChunks.length === 0) {
    return "I couldn't find any relevant information for your question.";
  }

  return relevantChunks.join('\n\n');
}

/**
 * Function to join relevant chunks of text.
 * 
 * @param {Array<string>} relevantChunks - The chunks of text to be joined.
 * @returns {string} - The joined text.
 */
function joinRelevantChunks(relevantChunks) {
  return relevantChunks.join('\n\n');
}

/**
 * Function to get an answer from Gemini based on extracted text and a question.
 * 
 * @param {string} extractedText - The text extracted from the PDF.
 * @param {string} question - The question to be answered based on the extracted text.
 * @returns {Promise<string>} - A promise that resolves to the answer from Gemini.
 */
async function getAnswerFromGemini(extractedText, question) {
  try {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Given the following text from a PDF document, please answer the question below.
      
      Document text:
      ${extractedText}

      Question: ${question}

      Please provide a clear and concise answer based only on the information present in the document text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting answer from Gemini:', error);
    return "An error occurred while processing your question.";
  }
}

/**
 * Function to process a PDF file and optionally answer a question based on its content.
 * 
 * @param {string} filePath - The path to the PDF file.
 * @param {string} [question] - An optional question to be answered based on the PDF content.
 * @returns {Promise<string>} - A promise that resolves to the extracted text or the answer to the question.
 */
async function processPdf(filePath, question) {
  try {
    const text = await extractPdfText(filePath);

    if (question) {
      const answer = await getAnswerFromGemini(text, question);
      console.log('Question:', question);
      console.log('Answer:', answer);
      return answer;
    }

    console.log('Extracted text length:', text.length);
    console.log('First 500 characters:', text.substring(0, 500));
    return text;
  } catch (error) {
    console.error('Error processing PDF:', error);
  }
}

// Example usage
processPdf('C:\\Users\\vgaddipati\\Downloads\\Holiday List 2025.pdf', 'which is the second calendar month that doesn`t have any holidays');
