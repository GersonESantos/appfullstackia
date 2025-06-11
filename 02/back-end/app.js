const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4000; // Permite configurar a porta via .env
const API_KEY_GEMINI = process.env.API_KEY_GEMINI;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY_GEMINI}`; // Usando gemini-1.5-flash-latest para compatibilidade com v1beta

if (!API_KEY_GEMINI) {
    console.error("ERRO: A variável de ambiente API_KEY_GEMINI não está definida. Verifique seu arquivo .env.");
    process.exit(1); // Encerra o processo se a chave não estiver definida
}
console.log("Chave da API Gemini carregada.");

// Middlewares
app.use(cors());
app.use(express.json());
// Se precisar de dados de formulário URL-encoded, descomente a linha abaixo:
// app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('<h2>Welcome to the App.js Server!</h2>');
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage || userMessage.trim() === "") {
        return res.status(400).json({ error: "A mensagem do usuário não pode estar vazia." });
    }

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erro da API Gemini:', data);
            const errorMessage = data.error?.message || 'Erro ao comunicar com a API Gemini.';
            return res.status(response.status).json({ error: errorMessage, details: data.error?.details });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        res.json({ reply: reply || 'Desculpe, não consegui gerar uma resposta no momento.' });
    } catch (error) {
        console.error('Erro ao conversar com o Gemini:', error.message);
        res.status(500).json({ error: 'Erro ao conectar com a IA Gemini' });
    }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});