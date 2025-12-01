const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { YoutubeTranscript } = require('youtube-transcript');

console.log(process.env.API_KEY_GEMINI)

const app = express()
const PORT = 4000

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('<h2>Welcome to the App.js Server!</h2>');
})

app.post('/chat', async (req, res) => {
    let userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'o input esta vasio' });
    }
    try {
        const youtubeUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/;
        const match = userMessage.match(youtubeUrlRegex);

        if (match) {
            const videoUrl = match[0];
            try {
                const response = await fetch(videoUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
                });
                const html = await response.text();

                const titleMatch = html.match(/<meta property="og:title" content="(.*?)">/);
                const title = titleMatch ? titleMatch[1] : "Título não encontrado";

                const authorMatch = html.match(/"author":"(.*?)"/);
                const author = authorMatch ? authorMatch[1] : "Autor não encontrado";

                const now = new Date();
                const formattedDate = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');

                const reply = `---
title: '"${title}"'
tags:
  - Angular
  - node
status:  "Inicio"
prazo: 90
categoria: estudo
"author:": "[${author}]"
"created:": "${formattedDate}"
---`;

                return res.json({ reply });

            } catch (error) {
                console.error('Erro ao processar URL do YouTube:', error);
                return res.json({ reply: 'Erro ao processar o vídeo do YouTube.' });
            }
        }

        const apiKey = process.env.API_KEY_GEMINI;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            }),
        })

        const data = await response.json()

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        res.json({ reply: reply || 'Sem resposta da IA' })
    } catch (error) {
        console.error('Erro ao conversar com o Gemini:', error.message);
        res.status(500).json({ error: 'Erro ao conectar com a IA Gemini' });
    }
})

app.listen(PORT, () => {
    console.log(`Servidor no ar na porta ${PORT}`)
})