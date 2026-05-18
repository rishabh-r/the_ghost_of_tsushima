import { useState } from 'react';
import { normalizeAria, normalizeQuinn, normalizeRex, normalizeSage } from '../../utils/normalize';
import './Results.css';

const TABS = [
  { key: 'aria', label: 'Requirements', emoji: '🔍', color: '#FF6B6B' },
  { key: 'quinn', label: 'QA Analysis', emoji: '🧪', color: '#4ECDC4' },
  { key: 'rex', label: 'Tasks', emoji: '⚙️', color: '#45B7D1' },
  { key: 'sage', label: 'Summary', emoji: '📋', color: '#96CEB4' },
];

const normalizers = { aria: normalizeAria, quinn: normalizeQuinn, rex: normalizeRex, sage: normalizeSage };

export default function Results({ agentOutputs }) {
  const [activeTab, setActiveTab] = useState('aria');
  const rawData = agentOutputs[activeTab]?.output;
  const data = rawData ? normalizers[activeTab](rawData) : null;

  return (
    <div className="results-wrapper animate-slideUp">
      <div className="results-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`results-tab ${activeTab === tab.key ? 'results-tab-active' : ''}`}
            style={{ '--tab-color': tab.color }}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="results-tab-emoji">{tab.emoji}</span>
            {tab.label}
            {agentOutputs[tab.key] && <span className="results-tab-dot" />}
          </button>
        ))}
      </div>

      <div className="results-content">
        {!data ? (
          <div className="empty-state">
            <span className="empty-state-emoji">{TABS.find(t => t.key === activeTab)?.emoji}</span>
            <p className="empty-state-text">Waiting for analysis...</p>
          </div>
        ) : (
          <>
            {activeTab === 'aria' && <AriaResults data={data} />}
            {activeTab === 'quinn' && <QuinnResults data={data} />}
            {activeTab === 'rex' && <RexResults data={data} />}
            {activeTab === 'sage' && <SageResults data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

function AriaResults({ data }) {
  return (
    <div className="results-section">
      {data.summary && (
        <div className="result-summary-box">
          <h4>Summary</h4>
          <p>{data.summary}</p>
        </div>
      )}
      <h4 className="result-section-title">Requirements ({data.requirements?.length || 0})</h4>
      <div className="result-cards">
        {data.requirements?.map((req, i) => (
          <div key={i} className="result-card card-3d">
            <div className="result-card-header">
              <span className="result-id">{req.id}</span>
              <div className="result-badges">
                <span className={`badge badge-${req.type?.replace(/[- ]/g, '_')?.replace('non_functional','medium')}`}>
                  {req.type}
                </span>
                <span className={`badge badge-${req.priority}`}>{req.priority}</span>
              </div>
            </div>
            <h5 className="result-card-title">{req.title}</h5>
            <p className="result-card-desc">{req.description}</p>
            {req.source && <p className="result-card-source">Source: "{req.source}"</p>}
          </div>
        ))}
      </div>
      {data.assumptions?.length > 0 && (
        <>
          <h4 className="result-section-title">Assumptions</h4>
          <ul className="result-list">
            {data.assumptions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

function QuinnResults({ data }) {
  const [expandedTC, setExpandedTC] = useState(null);

  return (
    <div className="results-section">
      {data.coverageScore != null && (
        <div className="coverage-bar-wrap">
          <span className="coverage-label">Test Coverage Score</span>
          <div className="coverage-bar">
            <div className="coverage-fill" style={{ width: `${data.coverageScore}%` }} />
          </div>
          <span className="coverage-value">{data.coverageScore}%</span>
        </div>
      )}

      <h4 className="result-section-title">Ambiguities ({data.ambiguities?.length || 0})</h4>
      <div className="result-cards">
        {data.ambiguities?.map((amb, i) => (
          <div key={i} className="result-card card-3d ambiguity-card">
            <div className="result-card-header">
              <span className="result-id">{amb.requirementId}</span>
              <span className={`badge badge-${amb.severity}`}>{amb.severity}</span>
            </div>
            <p className="result-card-desc"><strong>Issue:</strong> {amb.issue}</p>
            <p className="result-card-suggestion">💡 {amb.suggestion}</p>
          </div>
        ))}
      </div>

      <h4 className="result-section-title">Test Cases ({data.testCases?.length || 0})</h4>
      <div className="result-cards">
        {data.testCases?.map((tc, i) => (
          <div
            key={i}
            className={`result-card card-3d testcase-card ${expandedTC === i ? 'expanded' : ''}`}
            onClick={() => setExpandedTC(expandedTC === i ? null : i)}
          >
            <div className="result-card-header">
              <span className="result-id">{tc.id}</span>
              <div className="result-badges">
                <span className="result-id">{tc.requirementId}</span>
                <span className={`badge badge-${tc.type}`}>{tc.type}</span>
              </div>
            </div>
            <h5 className="result-card-title">{tc.title}</h5>
            {expandedTC === i && (
              <div className="tc-details animate-fadeIn">
                {tc.preconditions && <p><strong>Preconditions:</strong> {tc.preconditions}</p>}
                <div className="tc-steps">
                  <strong>Steps:</strong>
                  <ol>
                    {tc.steps?.map((s, j) => <li key={j}>{s}</li>)}
                  </ol>
                </div>
                <p className="tc-expected"><strong>Expected:</strong> {tc.expectedResult}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.risks?.length > 0 && (
        <>
          <h4 className="result-section-title">Risks</h4>
          <div className="result-cards">
            {data.risks.map((r, i) => (
              <div key={i} className="result-card card-3d">
                <div className="result-card-header">
                  <span className={`badge badge-${r.impact}`}>{r.impact} impact</span>
                </div>
                <p className="result-card-desc">{r.description}</p>
                <p className="result-card-suggestion">🛡️ {r.mitigation}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RexResults({ data }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="results-section">
      {data.architectureNotes && (
        <div className="result-summary-box">
          <h4>Architecture Notes</h4>
          <p>{data.architectureNotes}</p>
        </div>
      )}

      <h4 className="result-section-title">Tasks ({data.tasks?.length || 0})</h4>
      <div className="result-cards">
        {data.tasks?.map((task, i) => (
          <div
            key={i}
            className={`result-card card-3d task-card ${expanded === i ? 'expanded' : ''}`}
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="result-card-header">
              <span className="result-id">{task.id}</span>
              <div className="result-badges">
                <span className={`badge badge-${task.effort?.toLowerCase()}`}>{task.effort}</span>
                <span className="badge badge-medium">{task.estimatedHours}h</span>
                <span className="badge badge-functional">{task.component}</span>
              </div>
            </div>
            <h5 className="result-card-title">{task.title}</h5>
            <p className="result-card-desc">{task.description}</p>
            {expanded === i && (
              <div className="task-details animate-fadeIn">
                <div className="task-ac">
                  <strong>Acceptance Criteria:</strong>
                  <ul>
                    {task.acceptanceCriteria?.map((ac, j) => <li key={j}>{ac}</li>)}
                  </ul>
                </div>
                {task.dependencies?.length > 0 && (
                  <p className="task-deps">
                    <strong>Dependencies:</strong> {task.dependencies.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.techRecommendations?.length > 0 && (
        <>
          <h4 className="result-section-title">Tech Recommendations</h4>
          <ul className="result-list">
            {data.techRecommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

function SageResults({ data }) {
  return (
    <div className="results-section">
      {data.projectSummary && (
        <div className="result-summary-box sage-summary">
          <h4>Project Summary</h4>
          <p>{data.projectSummary}</p>
          <div className="sage-stats">
            <div className="sage-stat">
              <span className="sage-stat-value">{data.totalEstimatedHours || '—'}h</span>
              <span className="sage-stat-label">Total Effort</span>
            </div>
            <div className="sage-stat">
              <span className="sage-stat-value">{data.milestones?.length || 0}</span>
              <span className="sage-stat-label">Milestones</span>
            </div>
            <div className="sage-stat">
              <span className="sage-stat-value">{data.suggestedTimeline || '—'}</span>
              <span className="sage-stat-label">Timeline</span>
            </div>
          </div>
        </div>
      )}

      {data.milestones?.length > 0 && (
        <>
          <h4 className="result-section-title">Milestones</h4>
          <div className="milestone-timeline">
            {data.milestones.map((m, i) => (
              <div key={i} className="milestone-item card-3d">
                <div className="milestone-marker">{i + 1}</div>
                <div className="milestone-content">
                  <h5>{m.name}</h5>
                  {m.description && <p>{m.description}</p>}
                  <span className="milestone-duration">⏱️ {m.estimatedDuration}</span>
                  {m.tasks?.length > 0 && (
                    <div className="milestone-tasks">
                      {m.tasks.map((t, j) => (
                        <span key={j} className="badge badge-functional">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.risks?.length > 0 && (
        <>
          <h4 className="result-section-title">Risk Assessment</h4>
          <div className="result-cards">
            {data.risks.map((r, i) => (
              <div key={i} className="result-card card-3d">
                <div className="result-card-header">
                  <div className="result-badges">
                    <span className={`badge badge-${r.probability}`}>P: {r.probability}</span>
                    <span className={`badge badge-${r.impact}`}>I: {r.impact}</span>
                  </div>
                </div>
                <p className="result-card-desc">{r.description}</p>
                <p className="result-card-suggestion">🛡️ {r.mitigation}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {data.recommendations?.length > 0 && (
        <>
          <h4 className="result-section-title">Recommendations</h4>
          <ul className="result-list recommendations">
            {data.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
