import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';

const SUGGESTED_QUESTIONS = [
  'Which building is consuming the most energy right now?',
  'Are there any HVAC faults I should know about?',
  'How can we reduce our peak load?',
  'What is our current CO₂ impact?',
  'Which buildings are above their energy baseline?',
];

function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 Hi! I\'m EcoPulse AI, powered by Featherless.ai. I have access to live campus energy data. Ask me anything about your buildings\' consumption, anomalies, or sustainability goals.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMessage = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    // Build conversation history for context (exclude the initial greeting)
    const history = updatedMessages
      .slice(1) // skip the greeting
      .slice(-8) // last 8 exchanges
      .map(({ role, content }) => ({ role, content }));

    try {
      const response = await fetch('http://localhost:8080/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: history.slice(0, -1), // exclude the message we just added
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.aiUnavailable) {
          setAiUnavailable(true);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: '⚠️ AI service is not configured. Please add your `FEATHERLESS_API_KEY` to the `.env` file and restart the server.',
              isError: true,
            },
          ]);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
        return;
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply, model: data.model },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Error: ${err.message}. Please ensure the server is running.`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Chat cleared. What would you like to know about campus energy?',
      },
    ]);
    setError(null);
    setAiUnavailable(false);
  }

  return (
    <div className="ai-chat">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <span className="ai-icon">🤖</span>
          <div>
            <h3>EcoPulse AI Assistant</h3>
            <span className="ai-powered-by">Powered by Featherless.ai</span>
          </div>
        </div>
        <button className="clear-chat-btn" onClick={clearChat} title="Clear chat">
          ↺ Clear
        </button>
      </div>

      {aiUnavailable && (
        <div className="ai-unavailable-banner">
          <strong>⚙️ Setup required:</strong> Add <code>FEATHERLESS_API_KEY=your_key</code> to your{' '}
          <code>.env</code> file, then restart the server.{' '}
          <a href="https://featherless.ai/account/api-keys" target="_blank" rel="noopener noreferrer">
            Get API key →
          </a>
        </div>
      )}

      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role} ${msg.isError ? 'error' : ''}`}>
            <div className="message-bubble">
              <span className="message-role-icon">
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </span>
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.model && (
                  <span className="message-model">via {msg.model.split('/').pop()}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="message-bubble">
              <span className="message-role-icon">🤖</span>
              <div className="message-content typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="suggested-questions">
          <p className="suggestions-label">Try asking:</p>
          <div className="suggestions-list">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} className="suggestion-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-chat-input-area">
        <textarea
          ref={inputRef}
          className="ai-chat-input"
          placeholder="Ask about energy consumption, anomalies, savings..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          title="Send (Enter)"
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
}

export default AIChat;
