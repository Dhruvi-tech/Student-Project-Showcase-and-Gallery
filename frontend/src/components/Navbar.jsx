import React, { useState } from 'react';
import {
  Plus,
  Terminal,
  Sun,
  Moon,
  Menu,
  X,
  Bookmark,
  Sparkles,
  TrendingUp,
  Brain,
  BarChart2,
  BarChart3,
  Compass,
  Home,
  User,
  LogOut,
  FolderGit2,
  Zap,
} from 'lucide-react';

// Modern 3D isometric project cube emblem with illuminated center core
const ShowcaseEmblem = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="brand-emblem"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="emblem-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="100%" stopColor="#dbeafe" />
      </linearGradient>
      <linearGradient id="emblem-node" x1="9.5" y1="9.5" x2="14.5" y2="14.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    {/* Outer Isometric Project Cube / Hexagon */}
    <path
      d="M12 2.6L20.5 7.5V16.5L12 21.4L3.5 16.5V7.5L12 2.6Z"
      stroke="url(#emblem-grad)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Isometric Faces: Top, Left, and Right dividing axes */}
    <path
      d="M12 2.6V12M20.5 7.5L12 12M3.5 7.5L12 12"
      stroke="url(#emblem-grad)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Translucent Isometric Top Diamond Surface */}
    <polygon
      points="12,3.8 19.3,8 12,11.4 4.7,8"
      fill="rgba(255, 255, 255, 0.22)"
    />
    {/* Glowing Central Project Core Node */}
    <circle
      cx="12"
      cy="12"
      r="2.5"
      fill="url(#emblem-node)"
    />
    <circle
      cx="12"
      cy="12"
      r="1.1"
      fill="#ffffff"
    />
  </svg>
);

export function Navbar({
  onOpenPublishModal,
  onOpenExplainModal,
  onOpenAnalytics,
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
  activeNav = 'home',
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (target) => {
    onNavigate?.(target);
    setMobileOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Section */}
        <div className="brand-section" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box" title="Student Project Showcase & Peer Gallery">
            <ShowcaseEmblem size={22} />
          </div>
          <div className="brand-text">
            <h1>Student Project Showcase</h1>
            <span className="badge-course">Peer Gallery</span>
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <button
          className="mobile-nav-toggle"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Primary Desktop/Mobile Nav Links */}
        <nav className={`primary-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <button
            className={`nav-btn ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => navigate('home')}
            title="Overview & Top Projects"
          >
            <Home size={14} />
            <span>Home</span>
          </button>

          <button
            className={`nav-btn ${activeNav === 'explore' ? 'active' : ''}`}
            onClick={() => navigate('explore')}
            title="Browse all 320 projects"
          >
            <Compass size={14} />
            <span>Explore (320)</span>
          </button>

          <button
            className={`nav-btn ${activeNav === 'ai' ? 'active' : ''}`}
            onClick={() => navigate('ai')}
            title="Filter AI & Machine Learning projects"
          >
            <Brain size={14} />
            <span>AI &amp; ML</span>
          </button>

          <button
            className={`nav-btn ${activeNav === 'data' ? 'active' : ''}`}
            onClick={() => navigate('data')}
            title="Filter Data Science & Analytics projects"
          >
            <BarChart2 size={14} />
            <span>Data Science</span>
          </button>

          <button
            className={`nav-btn ${activeNav === 'trending' ? 'active' : ''}`}
            onClick={() => navigate('trending')}
            title="Sort by Most Appreciated"
          >
            <TrendingUp size={14} />
            <span>Trending</span>
          </button>

          <button
            className={`nav-btn ${activeNav === 'recommended' ? 'active' : ''}`}
            onClick={() => {
              onShowRecommendations?.();
              setMobileOpen(false);
            }}
            title="Personalized recommendations"
          >
            <Sparkles size={14} />
            <span>For You</span>
          </button>

          <button
            className={`nav-btn ${activeNav === 'saved' ? 'active' : ''}`}
            onClick={() => {
              onShowSaved?.();
              setMobileOpen(false);
            }}
            title="Your Bookmarked Projects"
          >
            <Bookmark size={14} />
            <span>Saved</span>
          </button>

          {/* Feature 3: Tech Stack Analytics */}
          <button
            className={`nav-btn ${activeNav === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              onOpenAnalytics?.();
              setMobileOpen(false);
            }}
            title="Tech Stack Analytics & Visual Distribution Charts"
          >
            <BarChart3 size={14} />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="navbar-actions">
          {/* API Health Indicator */}
          <div
            className={`health-pill ${healthData?.status === 'healthy' ? '' : 'degraded'}`}
            title={`Database: ${healthData?.database?.engine || 'Connected'} (${healthData?.database?.latency_ms || 0.8}ms)`}
          >
            <span className="health-dot"></span>
            <span>{healthData?.status === 'healthy' ? 'API Active' : 'Connecting…'}</span>
          </div>

          {/* Feature 3: Analytics Action */}
          <button
            className="btn-explain"
            onClick={onOpenAnalytics}
            title="Open Tech Stack Analytics & Visual Distribution"
          >
            <BarChart3 size={14} />
            <span className="btn-explain-text">Analytics</span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="user-nav-dropdown">
              <button
                className={`btn-secondary ${activeNav === 'my-projects' ? 'active' : ''}`}
                onClick={onShowMyProjects}
                title="View your published projects"
              >
                <FolderGit2 size={14} />
                <span>My Projects</span>
              </button>
              <button className="btn-secondary" onClick={onEditProfile} title="Edit your profile">
                <User size={14} />
                <span>@{user.username}</span>
              </button>
              <button className="btn-secondary btn-icon-only" onClick={onLogout} title="Log out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn-secondary btn-login-nav" onClick={onOpenAuth}>
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* Publish Project Action */}
          <button className="btn-primary btn-publish-nav" onClick={onOpenPublishModal}>
            <Plus size={15} />
            <span>Publish</span>
          </button>
        </div>
      </div>
    </header>
  );
}
