import './ExportPanel.css';

const FORMATS = [
  { key: 'json', label: 'JSON', desc: 'Full analysis data', icon: '📦' },
  { key: 'csv', label: 'CSV', desc: 'Tasks spreadsheet', icon: '📊' },
  { key: 'jira', label: 'Jira Import', desc: 'Jira-compatible CSV', icon: '🎯' },
];

function escapeCSV(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(project, agentOutputs) {
  const data = {
    project: { name: project.name, createdAt: project.createdAt },
    requirements: agentOutputs.aria?.output || null,
    qaAnalysis: agentOutputs.quinn?.output || null,
    tasks: agentOutputs.rex?.output || null,
    projectPlan: agentOutputs.sage?.output || null,
  };
  downloadBlob(JSON.stringify(data, null, 2), `${project.name}-speccrew.json`, 'application/json');
}

function exportCSV(project, agentOutputs) {
  const tasks = agentOutputs.rex?.output?.tasks || [];
  const header = ['ID', 'Title', 'Description', 'Effort', 'Hours', 'Component', 'Requirement', 'Acceptance Criteria'].map(escapeCSV).join(',');
  const rows = tasks.map(t =>
    [t.id, t.title, t.description, t.effort, t.estimatedHours, t.component, t.requirementId, (t.acceptanceCriteria || []).join('; ')].map(escapeCSV).join(',')
  );
  downloadBlob([header, ...rows].join('\n'), `${project.name}-tasks.csv`, 'text/csv');
}

function exportJira(project, agentOutputs) {
  const tasks = agentOutputs.rex?.output?.tasks || [];
  const effortToPoints = { S: 1, M: 3, L: 5, XL: 8 };
  const header = ['Summary', 'Description', 'Priority', 'Story Points', 'Labels', 'Acceptance Criteria'].map(escapeCSV).join(',');
  const rows = tasks.map(t =>
    [
      t.title,
      t.description,
      t.effort === 'S' || t.effort === 'M' ? 'Medium' : 'High',
      effortToPoints[t.effort] || 3,
      t.component || 'backend',
      (t.acceptanceCriteria || []).join('; '),
    ].map(escapeCSV).join(',')
  );
  downloadBlob([header, ...rows].join('\n'), `${project.name}-jira-import.csv`, 'text/csv');
}

export default function ExportPanel({ project, agentOutputs }) {
  if (!project || !agentOutputs) return null;

  const handlers = { json: exportJSON, csv: exportCSV, jira: exportJira };

  return (
    <div className="export-panel animate-slideUp">
      <h4 className="export-title">Export Results</h4>
      <div className="export-cards">
        {FORMATS.map(f => (
          <button
            key={f.key}
            className="export-card card-3d"
            onClick={() => handlers[f.key](project, agentOutputs)}
          >
            <span className="export-icon">{f.icon}</span>
            <span className="export-label">{f.label}</span>
            <span className="export-desc">{f.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
