import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AGENTS } from '../AgentCard/AgentCard';
import './ChatPanel.css';

export default function ChatPanel({ messages, sendMessage, isLoading, activeChat, setActiveChat }) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const agentNames = Object.keys(AGENTS);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !activeChat || isLoading) return;
    sendMessage(activeChat, input.trim());
    setInput('');
  }

  const currentMessages = messages[activeChat] || [];
  const agent = activeChat ? AGENTS[activeChat] : null;

  return (
    <>
      <button
        className={`chat-toggle-btn btn-secondary ${isOpen ? 'chat-toggle-open' : ''}`}
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && !activeChat) setActiveChat('aria'); }}
      >
        {isOpen ? '→ Minimize' : '💬 Chat with Crew'}
      </button>

      <div className={`chat-panel glass-strong ${isOpen ? 'chat-panel-open' : ''}`}>
        <div className="chat-header">
          <h4 className="chat-title">Chat with Crew</h4>
          <button className="chat-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="chat-agent-tabs">
          {agentNames.map(name => {
            const a = AGENTS[name];
            return (
              <button
                key={name}
                className={`chat-agent-tab agent-${name} ${activeChat === name ? 'chat-agent-tab-active' : ''}`}
                onClick={() => setActiveChat(name)}
                title={a.displayName}
              >
                <span className="chat-agent-tab-emoji">{a.emoji}</span>
                <span className="chat-agent-tab-name">{a.displayName}</span>
              </button>
            );
          })}
        </div>

        <div className="chat-messages">
          {currentMessages.length === 0 && agent && (
            <div className="chat-empty">
              <span style={{ fontSize: '2rem' }}>{agent.emoji}</span>
              <p>Ask <strong>{agent.displayName}</strong> anything about the analysis!</p>
            </div>
          )}
          {currentMessages.map((msg, i) => (
            <div key={i} className={`chat-message chat-message-${msg.role}`}>
              {msg.role === 'assistant' && agent && (
                <div className={`agent-avatar agent-avatar-sm agent-${activeChat}`}>
                  {agent.emoji}
                </div>
              )}
              <div className={`chat-bubble chat-bubble-${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message chat-message-assistant">
              {agent && (
                <div className={`agent-avatar agent-avatar-sm agent-${activeChat}`}>
                  {agent.emoji}
                </div>
              )}
              <div className="chat-bubble chat-bubble-assistant">
                <span className="thinking-dots">Thinking</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder={agent ? `Ask ${agent.displayName}...` : 'Select an agent'}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!activeChat || isLoading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || !activeChat || isLoading}
          >
            ↑
          </button>
        </form>
      </div>
    </>
  );
}
