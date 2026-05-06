import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import Upload from '../components/Upload/Upload';
import { AGENTS } from '../components/AgentCard/AgentCard';
import './Home.css';

export default function Home() {
  const { projects, fetchProjects, createProject } = useProject();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const agentNames = Object.keys(AGENTS);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  function handleSubmit(formData) {
    setCreating(true);
    try {
      const name = formData.get('name');
      const rawInput = formData.get('rawInput') || '';
      const file = formData.get('file');

      if (file && file.size > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileText = e.target.result;
          const fullInput = rawInput
            ? `${rawInput}\n\n--- Uploaded File: ${file.name} ---\n\n${fileText}`
            : fileText;
          const project = createProject({ name, rawInput: fullInput });
          navigate(`/project/${project.id}`);
        };
        reader.readAsText(file);
      } else {
        const project = createProject({ name, rawInput });
        navigate(`/project/${project.id}`);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  const statusColors = {
    draft: '#9b8ec4',
    analyzing: '#7c3aed',
    completed: '#059669',
    error: '#dc2626',
  };

  return (
    <div className="home">
      <section className="hero scene-3d">
        <div className="hero-content animate-slideUp">
          <h1 className="hero-title">
            Your AI-Powered<br />
            <span className="hero-gradient">Development Crew</span>
          </h1>
          <p className="hero-subtitle">
            Transform messy requirements into structured tasks, test cases, and project plans — powered by a crew of specialized AI agents.
          </p>
          <button
            className="btn-primary hero-cta"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Close' : '✨ New Project'}
          </button>
        </div>

        <div className="hero-agents">
          {agentNames.map((name, i) => {
            const a = AGENTS[name];
            return (
              <div
                key={name}
                className={`hero-agent-card card-3d agent-${name}`}
                style={{ animationDelay: `${i * 0.12}s`, '--agent-color': a.color }}
              >
                <div className={`agent-avatar agent-${name}`}>{a.emoji}</div>
                <span className="agent-name">{a.displayName}</span>
                <span className="agent-role">{a.role}</span>
              </div>
            );
          })}
        </div>
      </section>

      {showForm && (
        <section className="new-project-section">
          <Upload onSubmit={handleSubmit} loading={creating} />
        </section>
      )}

      {projects.length > 0 && (
        <section className="projects-section animate-slideUp">
          <h2 className="section-title">Your Projects</h2>
          <div className="projects-grid">
            {projects.map((p, i) => (
              <div
                key={p.id}
                className="project-card card-3d"
                onClick={() => navigate(`/project/${p.id}`)}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="project-card-header">
                  <h3 className="project-card-name">{p.name}</h3>
                  <span
                    className="project-status-badge"
                    style={{ color: statusColors[p.status], background: statusColors[p.status] + '18' }}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="project-card-date">
                  {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <div className="project-card-preview">
                  {p.rawInput?.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
