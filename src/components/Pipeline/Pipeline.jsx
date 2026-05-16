import AgentCard from '../AgentCard/AgentCard';
import { motion, useReducedMotion } from 'framer-motion';
import { ease, springs, timing } from '../../motion/system';
import './Pipeline.css';

const AGENT_ORDER = ['aria', 'quinn', 'rex', 'sage'];
const STAGE_LABELS = {
  mocking: 'Mocking',
  aria: 'Aria',
  quinn: 'Quinn',
  rex: 'Rex',
  sage: 'Sage',
};
const STAGE_ACTIVITY = {
  mocking: 'Simulating full flow',
  aria: 'Extracting requirements',
  quinn: 'Generating QA analysis',
  rex: 'Creating implementation tasks',
  sage: 'Synthesizing delivery plan',
};

export default function Pipeline({
  activeAgent,
  completedAgents = [],
  pipelineStatus,
  showMockingStage = false,
  estimatedStageSeconds = 20,
}) {
  const shouldReduceMotion = useReducedMotion();
  const stageOrder = showMockingStage ? ['mocking', ...AGENT_ORDER] : AGENT_ORDER;

  function getAgentStatus(name) {
    if (name === 'mocking') {
      if (activeAgent?.agent === 'mocking') return 'thinking';
      if (pipelineStatus !== 'idle') return 'complete';
      return 'idle';
    }
    if (completedAgents.includes(name)) return 'complete';
    if (activeAgent?.agent === name) return 'thinking';
    return 'idle';
  }

  function getConnectorClass(index) {
    if (index >= stageOrder.length - 1) return '';
    const currentStatus = getAgentStatus(stageOrder[index]);
    const nextStatus = getAgentStatus(stageOrder[index + 1]);
    if (currentStatus === 'complete' && nextStatus === 'complete') return 'agent-connector-done';
    if (currentStatus === 'complete' || currentStatus === 'thinking') return 'agent-connector-active';
    return '';
  }

  const completedCount = completedAgents.length + (showMockingStage && pipelineStatus !== 'idle' ? 1 : 0);
  const progress = (completedCount / stageOrder.length) * 100;
  const isMockingActive = activeAgent?.agent === 'mocking';
  const statusText = isMockingActive ? 'Mocking flow...' : 'Processing...';
  const activeIndex = activeAgent ? stageOrder.indexOf(activeAgent.agent) : -1;
  const stageNumber = activeIndex >= 0 ? activeIndex + 1 : completedCount;
  const remainingStages = activeIndex >= 0
    ? Math.max(stageOrder.length - (activeIndex + 1), 0)
    : Math.max(stageOrder.length - completedCount, 0);
  const etaSeconds = remainingStages * estimatedStageSeconds;
  const activeLabel = STAGE_LABELS[activeAgent?.agent] || 'Pipeline';
  const activeActivity = STAGE_ACTIVITY[activeAgent?.agent] || 'Running';

  return (
    <motion.div
      className="pipeline-wrapper"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
    >
      <div className="pipeline-header">
        <div className="pipeline-heading">
          <h3 className="pipeline-title">AI Crew Pipeline</h3>
          {pipelineStatus === 'running' && (
            <p className="pipeline-subtitle">
              Stage {stageNumber}/{stageOrder.length}: {activeLabel} - {activeActivity}
            </p>
          )}
        </div>
        {pipelineStatus === 'running' && (
          <span className="pipeline-status-running">
            <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            {statusText} · ETA ~{etaSeconds}s
          </span>
        )}
        {pipelineStatus === 'completed' && (
          <span className="pipeline-status-done">✓ Analysis Complete</span>
        )}
      </div>

      <div className="pipeline-track scene-3d">
        {stageOrder.map((name, i) => (
          <motion.div
            key={name}
            className={`pipeline-stage ${getAgentStatus(name) === 'thinking' ? 'pipeline-stage-active' : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
            initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            animate={getAgentStatus(name) === 'thinking'
              ? (shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 1, x: 0, y: [0, -2, 0] })
              : { opacity: 1, x: 0, y: 0 }}
            transition={getAgentStatus(name) === 'thinking'
              ? { duration: 1.6, repeat: Infinity, ease: ease.soft }
              : { delay: shouldReduceMotion ? 0 : i * 0.08, duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
            whileHover={shouldReduceMotion ? undefined : { y: -3, transition: springs.interaction }}
          >
            {name === 'mocking' ? (
              <div className={`mock-stage-card mock-stage-${getAgentStatus(name)}`}>
                <div className="mock-stage-icon">🧪</div>
                <div className="mock-stage-info">
                  <span className="mock-stage-name">Mocking</span>
                  <span className="mock-stage-role">Debug Flow Stage</span>
                </div>
                <span className={`status-badge status-${getAgentStatus(name)}`}>
                  {getAgentStatus(name) === 'thinking' ? 'Running' : getAgentStatus(name) === 'complete' ? 'Done' : 'Ready'}
                </span>
              </div>
            ) : (
              <AgentCard name={name} status={getAgentStatus(name)} />
            )}
            {i < stageOrder.length - 1 && (
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
            {completedCount} / {stageOrder.length} stages completed
          </span>
        </div>
      )}
    </motion.div>
  );
}
