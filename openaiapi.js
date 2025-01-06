import OpenAI from 'openai';
const client = new OpenAI();

const response = await client.chat.completions.create({
    messages: [{ role: 'developer', content: 'get the content of this html string and summarise it : <html><body><div>Vivek is a great programmer</div></body></html>' }],
    model: 'gpt-4o-mini'
});

console.log(response.choices[0].message.content);