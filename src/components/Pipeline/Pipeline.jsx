import AgentCard from '../AgentCard/AgentCard';
import './Pipeline.css';

const AGENT_ORDER = ['aria', 'quinn', 'rex', 'sage'];

export default function Pipeline({ activeAgent, completedAgents = [], pipelineStatus }) {
  function getAgentStatus(name) {
    if (completedAgents.includes(name)) return 'complete';
    if (activeAgent?.agent === name) return 'thinking';
    return 'idle';
  }

  function getConnectorClass(index) {
    if (index >= AGENT_ORDER.length - 1) return '';
    const current = AGENT_ORDER[index];
    const next = AGENT_ORDER[index + 1];
    if (completedAgents.includes(current) && completedAgents.includes(next)) return 'agent-connector-done';
    if (completedAgents.includes(current)) return 'agent-connector-active';
    return '';
  }

  const progress = (completedAgents.length / 4) * 100;

  return (
    <div className="pipeline-wrapper">
      <div className="pipeline-header">
        <h3 className="pipeline-title">AI Crew Pipeline</h3>
        {pipelineStatus === 'running' && (
          <span className="pipeline-status-running">
            <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            Processing...
          </span>
        )}
        {pipelineStatus === 'completed' && (
          <span className="pipeline-status-done">✓ Analysis Complete</span>
        )}
      </div>

      <div className="pipeline-track scene-3d">
        {AGENT_ORDER.map((name, i) => (
          <div key={name} className="pipeline-stage" style={{ animationDelay: `${i * 0.1}s` }}>
            <AgentCard name={name} status={getAgentStatus(name)} />
            {i < AGENT_ORDER.length - 1 && (
              <div className={`agent-connector ${getConnectorClass(i)}`}>
                <div className="connector-arrow">→</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {pipelineStatus !== 'idle' && (
        <div className="pipeline-progress">
          <div className="pipeline-progress-track">
            <div
              className="pipeline-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="pipeline-progress-label">
            {completedAgents.length} / 4 agents completed
          </span>
        </div>
      )}
    </div>
  );
}
