import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useSSE } from '../hooks/useSSE';
import { useAgentChat } from '../hooks/useAgentChat';
import Pipeline from '../components/Pipeline/Pipeline';
import Results from '../components/Results/Results';
import Dashboard from '../components/Dashboard/Dashboard';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import ExportPanel from '../components/ExportPanel/ExportPanel';
import './ProjectView.css';

export default function ProjectView() {
  const { id } = useParams();
  const { currentProject, fetchProject, updateProject } = useProject();
  const sse = useSSE();
  const chat = useAgentChat();

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

  function handleLaunch() {
    updateProject(id, { status: 'analyzing' });
    sse.startPipeline(currentProject.rawInput);
  }

  const chatContext = {
    projectName: currentProject?.name,
    rawInput: currentProject?.rawInput,
    analyses: hasLive
      ? Object.fromEntries(Object.entries(sse.agentOutputs).map(([k, v]) => [k, v.output]))
      : savedAnalyses,
  };

  return (
    <div className="project-view">
      <div className="project-topbar animate-slideUp">
        <div className="topbar-left">
          <Link to="/" className="back-link">← Back</Link>
          <h2 className="project-name">{currentProject?.name || 'Loading...'}</h2>
        </div>
        <div className="topbar-right">
          {currentProject?.status && (
            <span className={`project-status project-status-${currentProject.status}`}>
              {currentProject.status}
            </span>
          )}
          {canRun && (
            <button className="btn-primary" onClick={handleLaunch}>
              {hasSaved ? '🔄 Re-analyze' : '🚀 Launch Crew'}
            </button>
          )}
        </div>
      </div>

      <Pipeline
        activeAgent={sse.activeAgent}
        completedAgents={sse.completedAgents}
        pipelineStatus={sse.pipelineStatus === 'idle' && isPipelineDone ? 'completed' : sse.pipelineStatus}
      />

      {sse.error && (
        <div className="error-banner animate-scaleIn">
          <span>⚠️ {sse.error}</span>
          <button className="btn-secondary" onClick={handleLaunch}>Retry</button>
        </div>
      )}

      {hasResults && (
        <>
          <Dashboard agentOutputs={displayOutputs} />
          <Results agentOutputs={displayOutputs} />
          {isPipelineDone && (
            <ExportPanel project={currentProject} agentOutputs={displayOutputs} />
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
      />
    </div>
  );
}
