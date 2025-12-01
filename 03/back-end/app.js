const express = require('express')
const cors = require('cors')
require('dotenv').config()
console.log(process.env.API_KEY_GEMINI) 

const app = express()
const PORT = 4000

app.use(cors({
    origin: '*', // Permite todas as origens
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.post('/youtube-details', async (req, res) => {
    const { url: videoUrl } = req.body;

    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).json({ error: 'URL do YouTube inválida ou não fornecida.' });
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        const details = info.videoDetails;

        const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl);
        const transcript = transcriptParts.map(part => part.text).join(' ');

        // Formatação da data de publicação
        const publishDate = new Date(details.publishDate);
        const formattedPublishDate = `${publishDate.getDate()} de ${publishDate.toLocaleString('pt-BR', { month: 'long' })} de ${publishDate.getFullYear()}`;

        // Formatação da duração
        const durationInSeconds = parseInt(details.lengthSeconds, 10);
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        const durationFormatted = `PT${hours > 0 ? hours + 'H' : ''}${minutes}M${seconds}S`;


        const formattedString = `---
title: '${details.title.replace(/'/g, "''")}'
tags:
  - Javascrip
  - node
status: "Angular"
prazo: 2024-12-20
categoria: estudo
author: "[${details.author.name}]"
created: "${new Date().toISOString().replace('T', ' ').substring(0, 19)}"
---

# Detalhes do Vídeo: ${details.title}

**[${details.title}](${details.video_url})**

| Metadados | Detalhes |
| :--- | :--- |
| **Canal** | ${details.author.name} |
| **Título** | ${details.title} |
| **Data de Publicação** | ${formattedPublishDate} |
| **Duração** | ${durationFormatted} |
| **Likes** | ${details.likes ? details.likes.toString() : 'N/A'} |
| **Visualizações** | ${details.viewCount} |
| **URL** | ${details.video_url} |

---

## 📝 Resumo do Conteúdo (Baseado na Transcrição)

${transcript}

---

## 🚀 Tarefas do Projeto

- [ ] Inicio🔼 Angular
- [ ] Angular"`;

        res.send(formattedString);

    } catch (error) {
        console.error('Erro ao buscar detalhes do vídeo:', error);
        res.status(500).json({ error: 'Falha ao buscar detalhes do vídeo.', details: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('<h2>Welcome to the App.js Server!</h2>');
    })

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if(!userMessage) {
        return res.status(400).json({ error: 'o input esta vasio' });
    }
    try{

        const apiKey = process.env.API_KEY_GEMINI;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
   const response = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json",},
            body: JSON.stringify({
                contents: [{parts: [{text: userMessage}]}]
            }),
        })

        const data = await response.json()

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        res.json({ reply: reply || 'Sem resposta da IA'})
    } catch (error) {
        console.error('Erro ao conversar com o Gemini:', error.message);
        res.status(500).json({ error: 'Erro ao conectar com a IA Gemini' });
    }
})

app.listen(PORT, () => {
    console.log(`Servidor no ar na porta ${PORT}`)
})