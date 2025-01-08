import OpenAI from 'openai';
const client = new OpenAI();

// const response = await client.chat.completions.create({
//     messages: [
//         { role: 'developer', content: `https://www.nrdc.org/stories/global-warming-101` },
//         { role: 'developer', content: 'Provide the body of the HTML web page' },
//         { role: 'user', content: 'Summarize the content and provide me a bulleted text' },
//     ],
//     model: 'gpt-4o-mini'
// }).catch(async (err) => {
//     if (err instanceof OpenAI.APIError) {
//       console.log(err.status); // 400
//       console.log(err.name); // BadRequestError
//       console.log(err.headers); // {server: 'nginx', ...}
//     } else {
//       throw err;
//     }
//   });

// console.log(response.choices[0].message.content);

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
