import axios from 'axios';
import { useState } from 'react'
import './App.css'; 

function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  

  const sendMessage = async () => {

    if (!input.trim()) return;

    // Guarda a mensagem do usuário antes de limpar o input
    const userMessage = { sender: 'user', text: input };
    const currentInput = input; 
    
    // 1. Atualiza o estado para mostrar a mensagem do usuário
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // --- LÓGICA DE DETECÇÃO DE URL NO FRONTEND ---
    const youtubeUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/;
    const match = currentInput.match(youtubeUrlRegex);

    if (match) {
        // Se for URL, mostra a URL e retorna (SEM CHAMAR O BACKEND)
        const videoUrl = match[0];
        const botMessage = { sender: 'bot', text: `URL LOCALMENTE DETECTADA: ${videoUrl}. Processamento do Backend Desativado para Debug.` };
        
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
        return; // Sai da função, ignorando o try/catch do Axios
    }
    // --- FIM DA LÓGICA DE DETECÇÃO DE URL ---

    try {
      // 2. Envia a requisição POST para o backend (Apenas para texto normal)
      const response = await axios.post('http://localhost:4000/chat', {
        message: currentInput, 
      });

      // 3. Atualiza o estado com a resposta do bot/servidor
      const botMessage = { sender: 'bot', text: response.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
        // Se houver qualquer erro de rede ou falha na resposta (e.g., código 500)
        let errorMessage = 'Erro ao se conectar com a API ou servidor.';
        if (error.response && error.response.data && error.response.data.reply) {
             errorMessage = error.response.data.reply; // Pega mensagem de erro do backend
        }
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }

  }

  const handleKeyPress = (e) => {
    // Verifica se a tecla pressionada é 'Enter' (e não Shift+Enter, por exemplo)
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage();
    }
  }

  return (
    <div className="chat-container">
      <h1 className="chat-title">Chat do GersonES I.A</h1>

      <div className="messages-area">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
            <p className="message-sender">{msg.sender === 'user' ? 'Você' : 'Gemini'}:</p>
            {/* O texto completo (incluindo o Markdown) é renderizado aqui. */}
            <p className="message-text">{msg.text}</p>
          </div>
        ))}
        {loading && <div className="loading-indicator">Digitando...</div>}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder='Cole a URL do vídeo ou digite sua pergunta'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="chat-input"
        />
        <button onClick={sendMessage} className="send-button">Enviar</button>
        </div>
    </div>
  )
}

export default App