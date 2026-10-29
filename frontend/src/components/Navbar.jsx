import React from 'react';
import { useState } from 'react';
import { Plus, Terminal, BookOpen, Sun, Moon, Menu, X, Bookmark, Sparkles } from 'lucide-react';

export function Navbar({
  onOpenPublishModal,
  onOpenExplainModal,
  healthData,
  theme = 'light',
  onToggleTheme,
  user,
  onOpenAuth,
  onLogout,
  onShowMyProjects,
  onNavigate,
  onShowSaved,
  onShowRecommendations,
  onEditProfile,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (target) => { onNavigate?.(target); setMobileOpen(false); };
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

        <button className="mobile-nav-toggle" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <nav className={`primary-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <button onClick={() => navigate('home')}>Home</button>
          <button onClick={() => navigate('explore')}>Explore</button>
          <button onClick={() => navigate('ai')}>AI &amp; ML</button>
          <button onClick={() => navigate('data')}>Data Science</button>
          <button onClick={() => navigate('trending')}>Trending</button>
          <button onClick={() => { onShowRecommendations?.(); setMobileOpen(false); }}><Sparkles size={14} /> For you</button>
        </nav>

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
          {user ? (
            <>
              <button className="btn-secondary my-projects-nav" onClick={onShowMyProjects}>My Projects</button>
              <span className="nav-user-name">@{user.username}</span>
              <button className="btn-secondary" onClick={onEditProfile}>Profile</button>
              <button className="btn-secondary" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <button className="btn-secondary" onClick={onOpenAuth}>Log in / Sign up</button>
          )}

          <button className="btn-secondary saved-nav" onClick={onShowSaved}><Bookmark size={14} /> Saved</button>

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
