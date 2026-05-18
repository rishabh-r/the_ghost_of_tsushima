import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import { useSSE } from '../hooks/useSSE';
import { useAgentChat } from '../hooks/useAgentChat';
import Pipeline from '../components/Pipeline/Pipeline';
import Results from '../components/Results/Results';
import Dashboard from '../components/Dashboard/Dashboard';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import ExportPanel from '../components/ExportPanel/ExportPanel';
import { ease, springs, timing } from '../motion/system';
import { flags } from '../config/runtimeFlags';
import './ProjectView.css';

export default function ProjectView() {
  const { id } = useParams();
  const { currentProject, fetchProject, updateProject } = useProject();
  const sse = useSSE();
  const chat = useAgentChat();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => { fetchProject(id); }, [id, fetchProject]);

  useEffect(() => {
    if (sse.pipelineStatus === 'completed' && Object.keys(sse.agentOutputs).length > 0) {
      const analyses = {};
      for (const [key, val] of Object.entries(sse.agentOutputs)) {
        analyses[key] = val.output;
      }
      updateProject(id, { status: 'completed', analyses });
    }
  }, [sse.pipelineStatus, sse.agentOutputs, id, updateProject]);

  const savedAnalyses = currentProject?.analyses || {};
  const hasSaved = Object.keys(savedAnalyses).length > 0;
  const hasLive = Object.keys(sse.agentOutputs).length > 0;
  const hasResults = hasLive || hasSaved;

  const displayOutputs = hasLive
    ? sse.agentOutputs
    : Object.entries(savedAnalyses).reduce((acc, [key, val]) => {
        acc[key] = { agent: key, output: val };
        return acc;
      }, {});

  const isPipelineDone = sse.pipelineStatus === 'completed' || (hasSaved && Object.keys(savedAnalyses).length === 4);
  const canRun = currentProject?.rawInput && sse.pipelineStatus !== 'running';
  const revealSection = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium },
  };

  function handleLaunch() {
    updateProject(id, { status: 'analyzing' });
    sse.startPipeline(currentProject.rawInput);
  }

  function handleResetFlow() {
    sse.stopPipeline();
    updateProject(id, { status: 'draft' });
  }

  const chatContext = {
    projectName: currentProject?.name,
    rawInput: currentProject?.rawInput,
    analyses: hasLive
      ? Object.fromEntries(Object.entries(sse.agentOutputs).map(([k, v]) => [k, v.output]))
      : savedAnalyses,
  };

  return (
    <motion.div
      className="project-view"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? timing.fast : timing.slow, ease: ease.premium }}
    >
      <motion.div
        className="project-topbar section-fade"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.05, duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
      >
        <div className="topbar-left">
          <Link to="/" className="back-link">← Back</Link>
          <h2 className="project-name">{currentProject?.name || 'Loading...'}</h2>
        </div>
        <div className="topbar-right">
          {flags.debug && (
            <span className="debug-mode-badge">Debug</span>
          )}
          {currentProject?.status && (
            <span className={`project-status project-status-${currentProject.status}`}>
              {currentProject.status}
            </span>
          )}
          {canRun && (
            <motion.button
              className="btn-primary magnetic-btn"
              onClick={handleLaunch}
              whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01, transition: springs.interaction }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              {hasSaved ? '🔄 Re-analyze' : '🚀 Launch Crew'}
            </motion.button>
          )}
        </div>
      </motion.div>

      <motion.div
        className="section-fade"
        {...revealSection}
      >
        <Pipeline
          activeAgent={sse.activeAgent}
          completedAgents={sse.completedAgents}
          pipelineStatus={sse.pipelineStatus === 'idle' && isPipelineDone ? 'completed' : sse.pipelineStatus}
          showMockingStage={flags.mockPipeline}
          estimatedStageSeconds={flags.mockPipeline ? 1 : 20}
        />
      </motion.div>

      {sse.error && (
        <motion.div
          className="error-banner animate-scaleIn"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
        >
          <div className="error-banner-content">
            <span>⚠️ {sse.error}</span>
            <p>Try rerunning the crew or reset the current flow state.</p>
          </div>
          <div className="error-actions">
            <button className="btn-secondary" onClick={handleLaunch}>Retry</button>
            <button className="btn-secondary" onClick={handleResetFlow}>Reset Flow</button>
          </div>
        </motion.div>
      )}

      {!hasResults && sse.pipelineStatus === 'running' && (
        <div className="analysis-loading-shell">
          <div className="loading-block">
            <div className="shimmer-line" style={{ width: '34%', marginBottom: 12 }} />
            <div className="shimmer-line" style={{ width: '100%', marginBottom: 10 }} />
            <div className="shimmer-line" style={{ width: '92%', marginBottom: 10 }} />
            <div className="shimmer-line" style={{ width: '78%' }} />
          </div>
          <div className="loading-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="loading-card">
                <div className="shimmer-line" style={{ width: '40%', marginBottom: 10 }} />
                <div className="shimmer-line" style={{ width: '90%', marginBottom: 8 }} />
                <div className="shimmer-line" style={{ width: '74%' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {hasResults && (
        <>
          <motion.div
            className="section-fade"
            {...revealSection}
            transition={{ ...revealSection.transition, delay: shouldReduceMotion ? 0 : 0.1 }}
          >
            <Dashboard agentOutputs={displayOutputs} />
          </motion.div>
          <motion.div
            className="section-fade"
            {...revealSection}
            transition={{ ...revealSection.transition, delay: shouldReduceMotion ? 0 : 0.18 }}
          >
            <Results agentOutputs={displayOutputs} />
          </motion.div>
          {isPipelineDone && (
            <motion.div
              className="section-fade"
              {...revealSection}
              transition={{ ...revealSection.transition, delay: shouldReduceMotion ? 0 : 0.26 }}
            >
              <ExportPanel project={currentProject} agentOutputs={displayOutputs} />
            </motion.div>
          )}
        </>
      )}

      {!hasResults && sse.pipelineStatus === 'idle' && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <span className="empty-state-emoji">🚀</span>
          <p className="empty-state-text">Click "Launch Crew" to start the AI analysis pipeline</p>
        </div>
      )}

      <ChatPanel
        messages={chat.messages}
        sendMessage={(agent, message) => chat.sendMessage(agent, message, chatContext)}
        isLoading={chat.isLoading}
        activeChat={chat.activeChat}
        setActiveChat={chat.setActiveChat}
        isMockChat={chat.isMockChat}
      />
    </motion.div>
  );
}
