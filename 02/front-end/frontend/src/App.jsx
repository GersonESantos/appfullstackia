import axios from 'axios';
import { useState } from 'react'
import './App.css';

const API_URL = 'http://localhost:4000/chat';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);


  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    // Adiciona a mensagem do usuário e limpa o input imediatamente
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(API_URL, {
        message: input,
      });

      const botMessage = { sender: 'bot', text: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage = error.response?.data?.error || 'Erro ao se conectar com a IA. Tente novamente mais tarde.';
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: errorMessage },
      ]);
    } finally {
      // Garante que o loading seja desativado mesmo se o input já foi limpo
      setLoading(false);
    }

  }

  const handleKeyPress = (e) => {
    // Verifica se a tecla pressionada é 'Enter' e se não há teclas modificadoras (Shift, Ctrl, Alt) pressionadas
    // para evitar envio ao usar Shift+Enter para nova linha, por exemplo.
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) sendMessage();
  }


  return (
    <div className="chat-container">
      <h1 className="chat-title">Chat do GersonES I.A</h1>

      <div className="messages-area">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
            <p className="message-sender">{msg.sender === 'user' ? 'Você' : 'Gemini'}:</p>
            <p className="message-text">{msg.text}</p>
          </div>
        ))}
        {loading && <div className="loading-indicator">Digitando...</div>}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder='Digite sua pergunta'
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
