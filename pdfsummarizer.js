const fs = require('fs');
const pdf = require('pdf-parse');

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

// Example usage
processPdf('C:/Users/vgaddipati/Downloads/Holiday List 2025.pdf');
