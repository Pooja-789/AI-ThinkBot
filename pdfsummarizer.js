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

// Main function to process the PDF
async function processPdf(filePath) {
  try {
    // Step 1: Extract text from the PDF
    const text = await extractPdfText(filePath);

    // Step 2: Split the text into smaller chunks
    const chunks = splitIntoChunks(text, 1000); // Adjust chunkSize as needed

    console.log('Number of Chunks:', chunks.length);
    console.log('First Chunk:', chunks[0]); // Example: Show the first chunk

    // You can now pass these chunks for embedding or further processing
    return chunks;
  } catch (error) {
    console.error('Error processing PDF:', error);
  }
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

// Main function to process the PDF and handle questions
async function processPdf(filePath, question = null) {
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
processPdf('/Users/vivekgaddipati/Downloads/HolidayList2025.pdf','which month has no holidays');
