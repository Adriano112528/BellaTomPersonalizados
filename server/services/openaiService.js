const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function gerarImagem(prompt) {

    const response = await client.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
    });

    return response.data[0];
}

module.exports = {
    gerarImagem
};