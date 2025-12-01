// src/App.js

import axios from 'axios';
import { useState } from 'react'
import './App.css'; 

function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    // Limpa o input ANTES de enviar
    const currentInput = input; 
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4000/chat', {
        message: currentInput, // Usa o valor salvo
      });

      const botMessage = { sender: 'bot', text: response.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Erro ao se conectar com a API ou servidor.' },
      ]);
    } finally {
      setLoading(false);
    }

  }

  const handleKeyPress = (e) => {
    // Verifica se a tecla pressionada é 'Enter' (ou 'enter')
    if (e.key === 'Enter') {
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
            {/* Renderiza como texto simples. Se quiser renderizar como Markdown, precisará de uma biblioteca como 'react-markdown' */}
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