import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import Upload from '../components/Upload/Upload';
import { AGENTS } from '../components/AgentCard/AgentCard';
import { ease, springs, timing } from '../motion/system';
import './Home.css';

export default function Home() {
  const { projects, fetchProjects, createProject } = useProject();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const agentNames = Object.keys(AGENTS);
  const formRef = useRef(null);
  const heroLines = ['Your AI-Powered', 'Development Crew'];

  const sectionReveal = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, filter: 'blur(8px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium },
  };

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
    draft: '#c0cde7',
    analyzing: '#b7cdff',
    completed: '#b8f0cf',
    error: '#ffc2c2',
  };

  return (
    <motion.div
      className="home"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? timing.fast : timing.slow, ease: ease.premium }}
    >
      <motion.section className="hero scene-3d section-fade" {...sectionReveal}>
        <motion.div
          className="hero-content"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.06, duration: shouldReduceMotion ? timing.fast : timing.slow, ease: ease.premium }}
        >
          <h1 className="hero-title">
            {heroLines.map((line, i) => (
              <motion.span
                key={line}
                className={i === 1 ? 'hero-gradient' : ''}
                style={{ display: 'block' }}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.09 + i * 0.08, duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.soft }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="hero-subtitle"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.2, duration: timing.standard, ease: ease.premium }}
          >
            Transform messy requirements into structured tasks, test cases, and project plans — powered by a crew of specialized AI agents.
          </motion.p>
          <motion.button
            className="btn-primary magnetic-btn hero-cta"
            aria-expanded={showForm}
            aria-controls="new-project-form"
            onClick={() => {
              const next = !showForm;
              setShowForm(next);
              if (next) setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }}
            whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.012, transition: springs.interaction }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          >
            {showForm ? '✕ Close' : '✨ New Project'}
          </motion.button>
        </motion.div>

        <div className="hero-agents">
          {agentNames.map((name, i) => {
            const a = AGENTS[name];
            return (
              <motion.div
                key={name}
                className={`hero-agent-card card-3d agent-${name}`}
                style={{ animationDelay: `${i * 0.12}s`, '--agent-color': a.color }}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.16 + i * 0.08, duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
                whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01, transition: springs.interaction }}
              >
                <div className={`agent-avatar agent-${name}`}>{a.emoji}</div>
                <span className="agent-name">{a.displayName}</span>
                <span className="agent-role">{a.role}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {showForm && (
        <motion.section
          id="new-project-form"
          className="new-project-section section-fade"
          ref={formRef}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.99, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
        >
          <Upload onSubmit={handleSubmit} loading={creating} />
        </motion.section>
      )}

      {projects.length > 0 && (
        <motion.section
          className="projects-section section-fade"
          {...sectionReveal}
        >
          <h2 className="section-title">Your Projects</h2>
          <div className="projects-grid">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                className="project-card card-3d"
                onClick={() => navigate(`/project/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/project/${p.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                style={{ animationDelay: `${i * 0.08}s` }}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : i * 0.05, duration: shouldReduceMotion ? timing.fast : timing.standard, ease: ease.premium }}
                whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.008, transition: springs.interaction }}
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
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
