import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { AGENTS } from '../AgentCard/AgentCard';
import { ease, springs, timing } from '../../motion/system';
import './ChatPanel.css';

export default function ChatPanel({ messages, sendMessage, isLoading, activeChat, setActiveChat, isMockChat }) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const agentNames = Object.keys(AGENTS);
  const shouldReduceMotion = useReducedMotion();
  const chatDescription = isMockChat
    ? 'This is a local crew simulator. Pick an agent and ask a question; each reply is mocked from the agent role, project brief, and saved analyses.'
    : 'Pick an agent and ask a question; each reply is grounded in the current project brief and saved analyses.';
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [messages, activeChat, shouldReduceMotion]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !activeChat || isLoading) return;
    sendMessage(activeChat, input.trim());
    setInput('');
  }

  const currentMessages = messages[activeChat] || [];
  const agent = activeChat ? AGENTS[activeChat] : null;

  if (!portalTarget) return null;

  return createPortal(
    <>
      <motion.button
        className={`chat-toggle-btn btn-secondary ${isOpen ? 'chat-toggle-open' : ''}`}
        aria-expanded={isOpen}
        aria-controls="crew-chat-panel"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && !activeChat) setActiveChat('aria'); }}
        whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02, transition: springs.interaction }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      >
        {isOpen ? '→ Minimize' : '💬 Chat with Crew'}
      </motion.button>

      <motion.div
        id="crew-chat-panel"
        className={`chat-panel glass-strong ${isOpen ? 'chat-panel-open' : ''}`}
        initial={false}
        animate={isOpen ? { x: 0, opacity: 1 } : { x: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 1 : 0 }}
        transition={shouldReduceMotion ? { duration: timing.fast } : springs.panel}
      >
        <div className="chat-header">
          <div className="chat-header-copy">
            <div className="chat-title-row">
              <h4 className="chat-title">Chat with Crew</h4>
              {isMockChat && <span className="chat-mode-badge">Demo mode</span>}
            </div>
            <p className="chat-description">{chatDescription}</p>
          </div>
          <button className="chat-close" aria-label="Close chat panel" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="chat-agent-tabs">
          {agentNames.map(name => {
            const a = AGENTS[name];
            return (
              <motion.button
                key={name}
                className={`chat-agent-tab agent-${name} ${activeChat === name ? 'chat-agent-tab-active' : ''}`}
                onClick={() => setActiveChat(name)}
                title={a.displayName}
                aria-label={`Chat with ${a.displayName}`}
                whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.02, transition: springs.interaction }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <span className="chat-agent-tab-emoji">{a.emoji}</span>
                <span className="chat-agent-tab-name">{a.displayName}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="chat-messages">
          {currentMessages.length === 0 && agent && (
            <motion.div
              className="chat-empty"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
            >
              <span style={{ fontSize: '2rem' }}>{agent.emoji}</span>
              <p>
                Ask <strong>{agent.displayName}</strong> anything about the project.
                {isMockChat ? ' This reply is a mock demo response.' : ''}
              </p>
            </motion.div>
          )}
          <AnimatePresence initial={false}>
            {currentMessages.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${i}-${msg.content?.length || 0}`}
                className={`chat-message chat-message-${msg.role}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? timing.fast : 0.24, ease: ease.premium }}
              >
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
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              className="chat-message chat-message-assistant"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? timing.fast : 0.2, ease: ease.premium }}
            >
              {agent && (
                <div className={`agent-avatar agent-avatar-sm agent-${activeChat}`}>
                  {agent.emoji}
                </div>
              )}
              <div className="chat-bubble chat-bubble-assistant">
                <span className="thinking-dots">Thinking</span>
              </div>
            </motion.div>
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
            aria-label="Send message"
          >
            ↑
          </button>
        </form>
      </motion.div>
    </>,
    portalTarget,
  );
}
