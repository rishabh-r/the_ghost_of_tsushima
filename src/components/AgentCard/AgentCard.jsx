import { useState } from 'react';
import './AgentCard.css';
import { motion, useReducedMotion } from 'framer-motion';
import { ease, springs, timing } from '../../motion/system';

const AGENTS = {
  aria: { emoji: '🔍', displayName: 'Aria', role: 'Requirement Analyst', color: '#FF6B6B' },
  quinn: { emoji: '🧪', displayName: 'Quinn', role: 'QA Engineer', color: '#4ECDC4' },
  rex: { emoji: '⚙️', displayName: 'Rex', role: 'Tech Lead', color: '#45B7D1' },
  sage: { emoji: '📋', displayName: 'Sage', role: 'Project Manager', color: '#96CEB4' },
};

export { AGENTS };

export default function AgentCard({ name, status = 'idle', compact = false, onClick }) {
  const agent = AGENTS[name];
  const shouldReduceMotion = useReducedMotion();
  const [pointerStyle, setPointerStyle] = useState({});
  if (!agent) return null;

  const statusClass = status === 'thinking' ? 'agent-status-thinking'
    : status === 'complete' ? 'agent-status-complete' : '';
  const isThinking = status === 'thinking';

  function handlePointerMove(event) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;
    const rotateY = (relativeX - 0.5) * 7;
    const rotateX = (0.5 - relativeY) * 6;
    setPointerStyle({
      '--tilt-rotate-x': `${rotateX}deg`,
      '--tilt-rotate-y': `${rotateY}deg`,
      '--glow-x': `${relativeX * 100}%`,
      '--glow-y': `${relativeY * 100}%`,
    });
  }

  function resetPointerStyle() {
    setPointerStyle({});
  }

  return (
    <motion.div
      className={`agent-card card-3d agent-${name} ${statusClass} ${compact ? 'agent-card-compact' : ''}`}
      style={{ '--agent-color': agent.color, ...pointerStyle }}
      onClick={onClick}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointerStyle}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={isThinking
        ? (shouldReduceMotion ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 1, y: [0, -2, 0], rotate: [0, -0.2, 0.2, 0] })
        : { opacity: 1, y: 0, rotate: 0 }}
      transition={isThinking
        ? { duration: 2.1, repeat: Infinity, ease: ease.soft }
        : { duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
      whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01, transition: springs.interaction }}
    >
      <div className="agent-card-border" style={{ background: agent.color }} />

      <div className="agent-card-body">
        <div className={`agent-avatar agent-${name} ${status === 'thinking' ? 'float-3d' : ''}`}>
          {agent.emoji}
        </div>

        <div className="agent-card-info">
          <span className="agent-name">{agent.displayName}</span>
          <span className="agent-role" style={{ color: agent.color }}>{agent.role}</span>
        </div>

        <div className="agent-card-status">
          {status === 'idle' && <span className="status-badge status-idle">Waiting</span>}
          {status === 'thinking' && (
            <span className="status-badge status-thinking">
              Analyzing<span className="thinking-dots" />
            </span>
          )}
          {status === 'complete' && <span className="status-badge status-complete">✓ Done</span>}
        </div>
      </div>
    </motion.div>
  );
}
