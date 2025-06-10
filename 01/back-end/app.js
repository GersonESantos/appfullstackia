const express = require('express')
const cors = require('cors')
require('dotenv').config()
console.log(process.env.API_KEY_GEMINI) 

const app = express()
const PORT = 4000

app.use(express())
app.use(cors());
app.use(express.json())

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