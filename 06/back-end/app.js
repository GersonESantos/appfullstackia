// app.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Mantenha para compatibilidade com Node < v18
require('dotenv').config();
const { YoutubeTranscript } = require('youtube-transcript');

// --- Configuração ---
const apiKey = process.env.API_KEY_GEMINI;
if (!apiKey) {
    console.error("ERRO: API_KEY_GEMINI não configurada no arquivo .env");
    process.exit(1);
}

const app = express();
const PORT = 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- Rotas ---

app.get('/', (req, res) => {
    res.send('<h2>Welcome to the App.js Server!</h2>');
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message; 
    
    if (!userMessage) {
        return res.status(400).json({ error: 'O input está vazio.' });
    }

    // Bloco Try/Catch principal
    try {
        const youtubeUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/;
        const match = userMessage.match(youtubeUrlRegex);

        if (match) {
            // Lógica para processar URL do YouTube (BLOCO COMPLEXO)
            const videoUrl = match[0];
            const videoIdMatch = videoUrl.match(/(?<=v=|youtu\.be\/)[\w-]+/);
            const videoId = videoIdMatch ? videoIdMatch[0] : null;

            if (!videoId) {
                return res.json({ reply: 'Erro: Não foi possível extrair o ID do vídeo.' });
            }

            let transcriptText = 'AVISO: Não foi possível obter a transcrição.';
            
            // 1. OBTENDO A TRANSCRIÇÃO (com tratamento de erro específico)
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                
                if (Array.isArray(transcript) && transcript.length > 0) {
                    transcriptText = transcript.map(item => item.text).join(' ');
                } else {
                    transcriptText = 'AVISO: Transcrição indisponível para este vídeo.';
                }
            } catch (e) {
                console.error('AVISO: Erro ao obter transcrição.', e.message);
                transcriptText = `AVISO: Falha técnica ao tentar obter a transcrição. Erro: ${e.message.substring(0, 50)}...`;
            }

            // 2. EXTRAÇÃO DE METADADOS (Simulação via Raspagem - Pode ser instável)
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
                
                Com base na Transcrição fornecida, gere a saída **exatamente** no formato Markdown solicitado abaixo. 
                
                1. Preencha todos os campos do front matter com os valores fornecidos (Título, Autor, Data, Imagem URL).
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

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            // 4. CHAMADA FINAL PARA O GEMINI
            const responseGemini = await fetch(geminiUrl, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptTemplate }] }]
                }),
            });

            // Se o Gemini falhar na resposta, o bloco principal é pego.
            if (!responseGemini.ok) {
                 const errorText = await responseGemini.text();
                 console.error(`Erro da API Gemini (URL): Status ${responseGemini.status}. Resposta: ${errorText.substring(0, 100)}...`);
                 return res.status(responseGemini.status).json({ reply: 'Erro da API Gemini. Verifique a chave ou a URL do vídeo.' });
            }


            const data = await responseGemini.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            return res.json({ reply: reply || 'Erro ao gerar resumo pela IA. Verifique a chave da API ou a resposta.' });

        } else {
            // Lógica para conversa normal (Consulta Simples - BLOCO CORRIGIDO)
            try {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

                const response = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userMessage }] }]
                    }),
                });

                // --- CORREÇÃO: Checagem de status da resposta ---
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Erro da API Gemini: Status ${response.status}. Resposta: ${errorText.substring(0, 100)}...`);
                    return res.status(response.status).json({ reply: 'Erro da API Gemini. Verifique sua chave de acesso (.env).' });
                }
                // ----------------------------------------------------

                const data = await response.json();
                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

                res.json({ reply: reply || 'Sem resposta da IA' });
                
            } catch (apiError) {
                console.error('Erro de rede ou falha ao processar a resposta da IA:', apiError);
                return res.status(500).json({ reply: 'Erro de rede ou falha ao processar a resposta da IA.' });
            }
        }

    } catch (error) {
        console.error('Erro geral no servidor (Bloco Principal):', error);
        res.status(500).json({ error: 'Erro interno ao processar dados com a IA.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor no ar na porta ${PORT}`);
});