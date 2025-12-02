const express = require('express')
const cors = require('cors')
// Incluir 'node-fetch' para compatibilidade com versões mais antigas do Node
const fetch = require('node-fetch'); 
require('dotenv').config()
const { YoutubeTranscript } = require('youtube-transcript');

// Certifique-se de que esta linha está no .env: API_KEY_GEMINI=SUA_CHAVE_AQUI
const apiKey = process.env.API_KEY_GEMINI; 

if (!apiKey) {
    console.warn("AVISO: API_KEY_GEMINI não encontrada. O chat com a IA falhará.");
}

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
        return res.status(400).json({ error: 'O input está vazio.' });
    }
    
    // URL da API do Gemini (sem a chave)
    const geminiBaseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try{
        const youtubeUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/;
        const match = userMessage.match(youtubeUrlRegex);

        if (match) {
            // --- MODO: PROCESSAMENTO DE URL ---
            const videoUrl = match[0];
            const videoIdMatch = videoUrl.match(/(?<=v=|youtu\.be\/)[\w-]+/);
            const videoId = videoIdMatch ? videoIdMatch[0] : null;

            if (!videoId) {
                return res.json({ reply: 'Erro: Não foi possível extrair o ID do vídeo.' });
            }
            
            let transcriptText = 'AVISO: Não foi possível obter a transcrição.';

            // 1. Tenta obter a transcrição
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                
                if (Array.isArray(transcript) && transcript.length > 0) {
                    transcriptText = transcript.map(item => item.text).join(' ');
                } else {
                    transcriptText = 'AVISO: Transcrição indisponível para este vídeo.';
                }
            } catch (e) {
                console.error('ERRO YOUTUBE-TRANSCRIPT:', e.message);
                transcriptText = `AVISO: Falha técnica ao tentar obter a transcrição. Erro: ${e.message.substring(0, 50)}...`;
            }

            // 2. EXTRAÇÃO DE METADADOS (Raspagem instável, mas necessária para o template)
            const responseHtml = await fetch(videoUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const html = await responseHtml.text();

            const titleMatch = html.match(/<meta property="og:title" content="(.*?)">/);
            const title = titleMatch ? titleMatch[1] : "Título não encontrado";

            const authorMatch = html.match(/"author":"(.*?)"/);
            const author = authorMatch ? authorMatch[1] : "Autor não encontrado";

            const now = new Date();
            const formattedDate = now.toISOString().replace(/T/, ' ').slice(0, 19);
            const imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;


            // 3. CONSTRUÇÃO DO PROMPT COMPLEXO PARA O GEMINI
            const promptTemplate = `
                Você é um assistente de análise de conteúdo de vídeo. Sua tarefa é analisar o vídeo no URL: ${videoUrl}, usando o seguinte Título: "${title}", Autor: "${author}" e a Transcrição:
                ---
                ${transcriptText}
                ---
                
                Com base no contexto fornecido (e na Transcrição, se disponível), gere a saída **exatamente** no formato Markdown solicitado abaixo. 
                
                1. Preencha todos os campos do front matter.
                2. Preencha a seção "Resumo do Conteúdo (Baseado na Transcrição)" detalhando os pontos principais, **incluindo timestamps aproximados entre colchetes** (ex: [00:03:15]) para os tópicos mais relevantes.
                
                A SAÍDA DEVE SER APENAS O MARKDOWN COMPLETO:
                
                ---
                title: "${title}"
                tags:
                  - Angular
                  - node
                status:  "Inicio"
                prazo: 90
                categoria: estudo
                "author:": "[${author}]"
                "created:": "${formattedDate}"
                image: ${imageUrl}
                ---  

                Resumo do Conteúdo (Baseado na Transcrição)
                #### em markdown
            `;


            // 4. CHAMADA FINAL PARA O GEMINI
            const responseGemini = await fetch(geminiBaseUrl, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptTemplate }] }]
                }),
            });

            if (!responseGemini.ok) {
                 const errorText = await responseGemini.text();
                 console.error(`Erro da API Gemini (URL): Status ${responseGemini.status}. Resposta: ${errorText.substring(0, 100)}...`);
                 return res.status(responseGemini.status).json({ reply: 'Erro da API Gemini durante a análise do vídeo. Verifique a chave ou o prompt.' });
            }

            const data = await responseGemini.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            return res.json({ reply: reply || 'Erro ao gerar resumo pela IA. Verifique a resposta da IA.' });

        } else {
            // --- MODO: CHAT SIMPLES (Mantido robusto) ---
            try {
                const response = await fetch(geminiBaseUrl, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json",},
                    body: JSON.stringify({
                        contents: [{parts: [{text: userMessage}]}]
                    }),
                })
                
                if (!response.ok) {
                     const errorText = await response.text();
                     console.error(`Erro da API Gemini: Status ${response.status}`);
                     return res.status(response.status).json({ reply: 'Erro da API Gemini. Verifique sua chave de acesso (.env).' });
                }

                const data = await response.json()
                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

                res.json({ reply: reply || 'Sem resposta da IA'})
            } catch (apiError) {
                console.error('Erro de rede ou falha ao processar a resposta da IA:', apiError);
                return res.status(500).json({ reply: 'Erro de rede ou falha ao processar a resposta da IA.' });
            }
        }
        
    } catch (error) {
        console.error('Erro geral no servidor (Bloco Principal):', error.message);
        res.status(500).json({ error: 'Erro ao conectar com a IA Gemini' });
    }
})

app.listen(PORT, () => {
    console.log(`Servidor no ar na porta ${PORT}`)
})