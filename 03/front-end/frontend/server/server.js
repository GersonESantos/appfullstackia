const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/video-info', async (req, res) => {
    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const videoInfo = await ytdl.getInfo(url);
        const transcript = await YoutubeTranscript.fetchTranscript(url);

        const { title, author, lengthSeconds, likes, viewCount, publishDate } = videoInfo.videoDetails;

        const markdown = `---
title: '${title.replace(/'/g, "''")}'
tags:
  - Javascrip
  - node
status: "Angular"
prazo: 2024-12-20
categoria: estudo
author: "[${author.name}]"
created: "${new Date().toISOString().slice(0, 19).replace('T', ' ')}"
---

# Detalhes do Vídeo: ${title}

**[${title}](${url})**

| Metadados | Detalhes |
| :--- | :--- |
| **Canal** | ${author.name} |
| **Título** | ${title} |
| **Data de Publicação** | ${new Date(publishDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })} |
| **Duração** | ${new Date(lengthSeconds * 1000).toISOString().substr(11, 8)} |
| **Likes** | ${likes} |
| **Visualizações** | ${viewCount} |
| **URL** | ${url} |

---

## 📝 Resumo do Conteúdo (Baseado na Transcrição)

${transcript.map(item => item.text).join(' ')}

---

## 🚀 Tarefas do Projeto

- [ ] Inicio🔼 Angular
- [ ] Angular" quero fazer esta funcionalidade no meu programa tem jeito?
`;

        res.json({ markdown });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process video.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
