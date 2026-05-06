import './AgentCard.css';

const AGENTS = {
  aria: { emoji: '🔍', displayName: 'Aria', role: 'Requirement Analyst', color: '#FF6B6B' },
  quinn: { emoji: '🧪', displayName: 'Quinn', role: 'QA Engineer', color: '#4ECDC4' },
  rex: { emoji: '⚙️', displayName: 'Rex', role: 'Tech Lead', color: '#45B7D1' },
  sage: { emoji: '📋', displayName: 'Sage', role: 'Project Manager', color: '#96CEB4' },
};

export { AGENTS };

export default function AgentCard({ name, status = 'idle', compact = false, onClick }) {
  const agent = AGENTS[name];
  if (!agent) return null;

  const statusClass = status === 'thinking' ? 'agent-status-thinking'
    : status === 'complete' ? 'agent-status-complete' : '';

  return (
    <div
      className={`agent-card card-3d agent-${name} ${statusClass} ${compact ? 'agent-card-compact' : ''}`}
      style={{ '--agent-color': agent.color }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
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
    </div>
  );
}
