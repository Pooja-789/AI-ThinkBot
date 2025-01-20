import OpenAI from 'openai';
const client = new OpenAI();

/**
 * Function to summarize text using OpenAI's GPT-4o-mini model.
 * 
 * @param {string} text - The text to be summarized.
 * @returns {Promise<string>} - A promise that resolves to the summarized text.
 */
export async function summarizeResponseText(text, flag) {

  var messages = []
  if (flag = 'URL') {
    messages = [
      { role: 'developer', content: text },
      { role: 'developer', content: 'Provide the body of the HTML web page' },
      { role: 'user', content: 'Summarize the content and provide me a bulleted text' },
    ]
  }
  else {
    messages = [
      { role: 'system', content: 'You are an assistant that summarizes articles.' },
      {
        role: 'user', content: `Summarize the following text into concise bullet points, ensuring new points are clearly separated with new lines: \n\n${text}`,
      }
    ]
  }
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
  });
  return (response.choices[0].message.content);
}
