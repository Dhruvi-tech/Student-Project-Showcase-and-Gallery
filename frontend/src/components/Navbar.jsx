import React from 'react';
import { Plus, Terminal, BookOpen, Sun, Moon } from 'lucide-react';

export function Navbar({
  onOpenPublishModal,
  onOpenExplainModal,
  healthData,
  theme = 'light',
  onToggleTheme,
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-icon-box">
            <Terminal size={18} />
          </div>
          <div className="brand-text">
            <h1>Student Project Showcase</h1>
            <span className="badge-course">Open-Source Developer Community</span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="navbar-actions">
          {/* API Health Indicator */}
          <div
            className={`health-pill ${healthData?.status === 'healthy' ? '' : 'degraded'}`}
            title={`Database: ${healthData?.database?.engine || 'Connected'} (${healthData?.database?.latency_ms || 0.8}ms)`}
          >
            <span className="health-dot"></span>
            <span>
              {healthData?.status === 'healthy' ? 'API Active' : 'Connecting...'}
            </span>
          </div>

          {/* Explain Architecture Guide */}
          <button
            className="btn-explain"
            onClick={onOpenExplainModal}
            title="Open Interactive System Architecture & Design Guide"
          >
            <BookOpen size={14} />
            <span>Architecture Guide</span>
          </button>

          {/* Theme Toggle (Warm Light / Polished Slate Dark) */}
          <button
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Warm Neutral' : 'Dark Slate'} Theme`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#4f46e5" />}
          </button>

          {/* Publish Project Action */}
          <button className="btn-primary" onClick={onOpenPublishModal}>
            <Plus size={15} />
            <span>Publish Project</span>
          </button>
        </div>
      </div>
    </header>
  );
}
