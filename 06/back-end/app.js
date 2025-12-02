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
    if(!userMessage) {
        return res.status(400).json({ error: 'o input esta vasio' });
    }
    try{
        const youtubeUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/;
        const match = userMessage.match(youtubeUrlRegex);

        if (match) {
            const videoUrl = match[0];
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
                if (!transcript || transcript.length === 0) {
                     throw new Error('Transcrição vazia ou indisponível.');
                }
                const transcriptText = transcript.map(item => item.text).join(' ');
                userMessage += `\n\nContexto do vídeo (transcrição): ${transcriptText}\n\nResponda com base no vídeo acima.`;
            } catch (transcriptError) {
                console.error('Erro ao buscar transcrição:', transcriptError);
                userMessage += `\n\n(Nota: Não foi possível obter a transcrição do vídeo citado. Responda normalmente.)`;
            }
        }

        const apiKey = process.env.API_KEY_GEMINI;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
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