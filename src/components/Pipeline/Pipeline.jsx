import AgentCard from '../AgentCard/AgentCard';
import { motion, useReducedMotion } from 'framer-motion';
import { ease, springs, timing } from '../../motion/system';
import './Pipeline.css';

const AGENT_ORDER = ['aria', 'quinn', 'rex', 'sage'];

export default function Pipeline({ activeAgent, completedAgents = [], pipelineStatus }) {
  const shouldReduceMotion = useReducedMotion();

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
    <motion.div
      className="pipeline-wrapper"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
    >
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
          <motion.div
            key={name}
            className={`pipeline-stage ${getAgentStatus(name) === 'thinking' ? 'pipeline-stage-active' : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
            initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12, filter: 'blur(5px)' }}
            animate={getAgentStatus(name) === 'thinking'
              ? (shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 1, x: 0, y: [0, -2, 0] })
              : { opacity: 1, x: 0, y: 0 }}
            transition={getAgentStatus(name) === 'thinking'
              ? { duration: 1.6, repeat: Infinity, ease: ease.soft }
              : { delay: shouldReduceMotion ? 0 : i * 0.08, duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
            whileHover={shouldReduceMotion ? undefined : { y: -3, transition: springs.interaction }}
          >
            <AgentCard name={name} status={getAgentStatus(name)} />
            {i < AGENT_ORDER.length - 1 && (
              <div className={`agent-connector ${getConnectorClass(i)}`}>
                <div className="connector-arrow">→</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {pipelineStatus !== 'idle' && (
        <div className="pipeline-progress">
          <div className="pipeline-progress-track">
            <div
              className="pipeline-progress-fill"
              style={{ '--progress': progress / 100 }}
            />
          </div>
          <span className="pipeline-progress-label">
            {completedAgents.length} / 4 agents completed
          </span>
        </div>
      )}
    </motion.div>
  );
}
