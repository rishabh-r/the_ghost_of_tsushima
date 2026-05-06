import { useState, useCallback } from 'react';

export function useAgentChat() {
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  const sendMessage = useCallback(async (agent, message, context = {}) => {
    if (!agent || !message.trim()) return;
    setIsLoading(true);

    const userMsg = { role: 'user', content: message, agent_name: agent, created_at: new Date().toISOString() };
    setMessages(prev => ({
      ...prev,
      [agent]: [...(prev[agent] || []), userMsg],
    }));

    try {
      const history = (messages[agent] || []).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: agent,
          message,
          projectName: context.projectName || '',
          rawInput: context.rawInput || '',
          analyses: context.analyses || {},
          history,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const assistantMsg = { role: 'assistant', content: data.response, agent_name: agent, created_at: new Date().toISOString() };
      setMessages(prev => ({
        ...prev,
        [agent]: [...(prev[agent] || []), assistantMsg],
      }));
    } catch (err) {
      const errMsg = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', agent_name: agent, created_at: new Date().toISOString() };
      setMessages(prev => ({
        ...prev,
        [agent]: [...(prev[agent] || []), errMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => setMessages({}), []);

  return { messages, sendMessage, isLoading, activeChat, setActiveChat, clearMessages };
}
