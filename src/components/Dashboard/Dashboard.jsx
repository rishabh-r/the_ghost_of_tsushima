import { useEffect, useState } from 'react';
import './Dashboard.css';

export default function Dashboard({ agentOutputs }) {
  const aria = agentOutputs.aria?.output;
  const quinn = agentOutputs.quinn?.output;
  const rex = agentOutputs.rex?.output;
  const sage = agentOutputs.sage?.output;

  const stats = [
    { label: 'Requirements', value: aria?.requirements?.length || 0, color: '#FF6B6B', emoji: '🔍' },
    { label: 'Test Cases', value: quinn?.testCases?.length || 0, color: '#4ECDC4', emoji: '🧪' },
    { label: 'Tasks', value: rex?.tasks?.length || 0, color: '#45B7D1', emoji: '⚙️' },
    { label: 'Est. Hours', value: sage?.totalEstimatedHours || 0, color: '#96CEB4', emoji: '📋' },
  ];

  return (
    <div className="dashboard-stats">
      {stats.map((s, i) => (
        <StatCard key={i} {...s} delay={i * 100} />
      ))}
    </div>
  );
}

function StatCard({ label, value, color, emoji, delay }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplayed(0); return; }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="stat-card card-3d"
      style={{ '--stat-color': color, animationDelay: `${delay}ms` }}
    >
      <div className="stat-emoji">{emoji}</div>
      <div className="stat-value">{displayed}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ background: color, width: value > 0 ? '100%' : '0%' }} />
      </div>
    </div>
  );
}
