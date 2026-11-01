import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  ChevronDown,
  CheckSquare,
  Square,
  Search,
  Check,
  Globe,
  Cloud,
  Shield,
  Database,
  Smartphone,
  Cpu,
  Wifi,
  Gamepad2,
  Eye,
  MessageSquare,
  Code,
  CreditCard,
  Activity,
  GraduationCap,
} from 'lucide-react';

export const ALL_DOMAINS = [
  { name: 'Web Development & Full Stack', count: 25, icon: Globe, track: 'Web & Cloud' },
  { name: 'Cloud Computing & DevOps', count: 23, icon: Cloud, track: 'Web & Cloud' },
  { name: 'Data Science & Analytics', count: 21, icon: BarChart2, track: 'Data & AI' },
  { name: 'AI & Machine Learning', count: 19, icon: Brain, track: 'Data & AI' },
  { name: 'Cybersecurity', count: 17, icon: Shield, track: 'Security & Systems' },
  { name: 'Blockchain & Web3', count: 15, icon: Layers, track: 'Web3 & Emerging' },
  { name: 'Computer Vision', count: 15, icon: Eye, track: 'Data & AI' },
  { name: 'Natural Language Processing', count: 15, icon: MessageSquare, track: 'Data & AI' },
  { name: 'Mobile App Development', count: 15, icon: Smartphone, track: 'Mobile & Devices' },
  { name: 'Internet of Things', count: 15, icon: Wifi, track: 'Mobile & Devices' },
  { name: 'Generative AI & AI Agents', count: 14, icon: Sparkles, track: 'Data & AI' },
  { name: 'Data Engineering & Big Data', count: 14, icon: Database, track: 'Data & AI' },
  { name: 'Robotics & Automation', count: 14, icon: Cpu, track: 'Mobile & Devices' },
  { name: 'Game Development', count: 14, icon: Gamepad2, track: 'Media & 3D' },
  { name: 'AR/VR', count: 14, icon: Eye, track: 'Media & 3D' },
  { name: 'Software Engineering & Developer Tools', count: 14, icon: Terminal, track: 'Security & Systems' },
  { name: 'Open Source & Developer Utilities', count: 14, icon: Code, track: 'Security & Systems' },
  { name: 'FinTech', count: 14, icon: CreditCard, track: 'Industry Apps' },
  { name: 'HealthTech', count: 14, icon: Activity, track: 'Industry Apps' },
  { name: 'EdTech', count: 14, icon: GraduationCap, track: 'Industry Apps' },
];

// Academic Capstone Mortarboard Emblem with Golden Starburst of Innovation
const ShowcaseEmblem = ({ size = 26 }) => (
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
      <linearGradient id="cap-top-grad" x1="2" y1="4" x2="22" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="60%" stopColor="#e0f2fe" />
        <stop offset="100%" stopColor="#bae6fd" />
      </linearGradient>
      <linearGradient id="star-gold-grad" x1="15" y1="1" x2="22" y2="8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef08a" />
        <stop offset="50%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <filter id="star-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Cap Top Diamond Board */}
    <polygon
      points="12,4.8 21.6,9.2 12,13.6 2.4,9.2"
      fill="url(#cap-top-grad)"
      stroke="#ffffff"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    {/* Underneath Skull Cap Band */}
    <path
      d="M5.8 11.2V15C5.8 15 8.4 18 12 18C15.6 18 18.2 15 18.2 15V11.2"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(255, 255, 255, 0.2)"
    />
    {/* Center Button & Tassel Ribbon */}
    <circle cx="12" cy="9.2" r="1.3" fill="#ffffff" />
    <path
      d="M12 9.2L4.6 11.6V16.2"
      stroke="#fef08a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="4.6" cy="16.8" r="1.3" fill="#facc15" />
    {/* Radiant Starburst of Innovation at Upper Right */}
    <path
      d="M18.8 1.8L19.6 4.1L21.8 4.9L19.6 5.7L18.8 8L18 5.7L15.8 4.9L18 4.1Z"
      fill="url(#star-gold-grad)"
      filter="url(#star-glow-filter)"
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
  selectedCategories = ['All'],
  onSelectCategories,
  matchingCount,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDomainsDropdownOpen, setIsDomainsDropdownOpen] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');
  const domainsDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (domainsDropdownRef.current && !domainsDropdownRef.current.contains(e.target)) {
        setIsDomainsDropdownOpen(false);
      }
    };
    if (isDomainsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDomainsDropdownOpen]);

  const handleToggleDomain = (domainName, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    let next;
    if (selectedCategories.includes('All')) {
      // Switch from All to this single domain
      next = [domainName];
    } else if (selectedCategories.includes(domainName)) {
      // Uncheck
      next = selectedCategories.filter((c) => c !== domainName);
    } else {
      // Check additional domain (supports 1, 2, or multiple options)
      next = [...selectedCategories, domainName];
      if (next.length >= ALL_DOMAINS.length) next = ['All'];
    }
    onSelectCategories?.(next);
  };

  const selectAllDomains = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onSelectCategories?.(['All']);
  };

  const clearAllDomains = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onSelectCategories?.([]);
  };

  const getDomainsButtonLabel = () => {
    if (selectedCategories.includes('All') || selectedCategories.length === 0) {
      return 'Domains (All 20)';
    }
    if (selectedCategories.length === 1) {
      const name = selectedCategories[0];
      return name.length > 16 ? name.slice(0, 14) + '…' : name;
    }
    if (selectedCategories.length === 2) {
      const short1 = selectedCategories[0].split(' ')[0];
      const short2 = selectedCategories[1].split(' ')[0];
      return `${short1} + ${short2} (2)`;
    }
    return `Domains (${selectedCategories.length})`;
  };

  const filteredDomains = ALL_DOMAINS.filter((d) =>
    d.name.toLowerCase().includes(domainSearch.toLowerCase()) ||
    d.track.toLowerCase().includes(domainSearch.toLowerCase())
  );

  const navigate = (target) => {
    onNavigate?.(target);
    setMobileOpen(false);
    setIsDomainsDropdownOpen(false);
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

          {/* ALL 20 DOMAINS DROPDOWN & TICK SELECTOR (TOP NAVBAR) */}
          <div className="nav-dropdown-wrapper" ref={domainsDropdownRef}>
            <button
              type="button"
              className={`nav-btn nav-btn-domains ${isDomainsDropdownOpen || (!selectedCategories.includes('All') && selectedCategories.length > 0) ? 'active' : ''}`}
              onClick={() => setIsDomainsDropdownOpen((prev) => !prev)}
              aria-expanded={isDomainsDropdownOpen}
              title="Browse and tick any of the 20 technical domains"
            >
              <Layers size={14} />
              <span>{getDomainsButtonLabel()}</span>
              <ChevronDown size={13} className={`dropdown-caret ${isDomainsDropdownOpen ? 'open' : ''}`} />
            </button>

            {isDomainsDropdownOpen && (
              <div className="top-domains-popover" onClick={(e) => e.stopPropagation()}>
                {/* Popover Header */}
                <div className="popover-header">
                  <div className="popover-title-row">
                    <div className="popover-title">
                      <Layers size={16} className="popover-title-icon" />
                      <strong>Which domains do you want to explore? (All 20)</strong>
                    </div>
                    <button
                      type="button"
                      className="popover-close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDomainsDropdownOpen(false);
                      }}
                      aria-label="Close domains menu"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <p className="popover-subtitle">
                    Tick the domains you want to view across our 320 peer projects:
                  </p>

                  {/* Search and Action Bar */}
                  <div className="popover-search-row">
                    <div className="popover-search-box" onClick={(e) => e.stopPropagation()}>
                      <Search size={13} />
                      <input
                        type="text"
                        placeholder="Search domains (e.g. Cyber, Cloud, Web, Robot)..."
                        value={domainSearch}
                        onChange={(e) => setDomainSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {domainSearch && (
                        <button type="button" className="popover-search-clear" onClick={() => setDomainSearch('')}>
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div className="popover-quick-actions">
                      <button
                        type="button"
                        className="quick-action-link btn-clear-pill"
                        onClick={(e) => clearAllDomains(e)}
                        title="Clear all domain ticks so you can pick 1 or 2 options"
                      >
                        <Square size={13} />
                        <span>Clear All</span>
                      </button>
                      <span className="dot-sep">•</span>
                      <button
                        type="button"
                        className="quick-action-link btn-select-pill"
                        onClick={(e) => selectAllDomains(e)}
                        title="Select all 20 domains"
                      >
                        <CheckSquare size={13} />
                        <span>Select All 20</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick 2-Domain Options */}
                  <div className="popover-presets-row">
                    <span className="preset-row-label">Quick 2-Domain Picks:</span>
                    <button
                      type="button"
                      className="preset-chip-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectCategories?.(['Web Development & Full Stack', 'Cloud Computing & DevOps']);
                      }}
                    >
                      🌐 Web + Cloud (2)
                    </button>
                    <button
                      type="button"
                      className="preset-chip-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectCategories?.(['AI & Machine Learning', 'Generative AI & AI Agents']);
                      }}
                    >
                      🤖 AI + GenAI (2)
                    </button>
                    <button
                      type="button"
                      className="preset-chip-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectCategories?.(['Cybersecurity', 'Software Engineering & Developer Tools']);
                      }}
                    >
                      🛡️ Cyber + Systems (2)
                    </button>
                    <button
                      type="button"
                      className="preset-chip-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectCategories?.(['Mobile App Development', 'Internet of Things']);
                      }}
                    >
                      📱 Mobile + IoT (2)
                    </button>
                  </div>
                </div>

                {/* Grid of all 20 domains with TICK checkboxes */}
                <div className="popover-domains-grid">
                  {filteredDomains.map((domain) => {
                    const Icon = domain.icon;
                    const isAllSelected = selectedCategories.includes('All');
                    const isExplicitlyTicked = !isAllSelected && selectedCategories.includes(domain.name);
                    const isChecked = isAllSelected || isExplicitlyTicked;

                    return (
                      <div
                        key={domain.name}
                        className={`domain-tick-row ${isExplicitlyTicked ? 'is-ticked' : isAllSelected ? 'is-all' : ''}`}
                        onClick={(e) => handleToggleDomain(domain.name, e)}
                      >
                        <div className="tick-box-indicator">
                          {isExplicitlyTicked ? (
                            <CheckSquare size={16} className="tick-icon-checked" />
                          ) : isAllSelected ? (
                            <CheckSquare size={16} className="tick-icon-all" />
                          ) : (
                            <Square size={16} className="tick-icon-empty" />
                          )}
                        </div>
                        <div className="domain-row-icon">
                          <Icon size={14} />
                        </div>
                        <div className="domain-row-content">
                          <span className="domain-row-title">{domain.name}</span>
                          <span className="domain-row-track">{domain.track}</span>
                        </div>
                        <span className="domain-row-count">{domain.count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Popover Footer */}
                <div className="popover-footer">
                  <div className="popover-status-text">
                    {selectedCategories.includes('All')
                      ? '✓ All 20 domains selected (320 projects)'
                      : selectedCategories.length === 0
                      ? 'All ticks cleared • Showing all 320 projects (tick 1 or 2 below to filter)'
                      : `✓ ${selectedCategories.length} domain${selectedCategories.length > 1 ? 's' : ''} selected (${matchingCount !== undefined ? matchingCount : ''} projects)`}
                  </div>
                  <div className="popover-footer-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={(e) => clearAllDomains(e)}
                      title="Clear all ticks"
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={(e) => selectAllDomains(e)}
                      title="Select all 20 domains"
                    >
                      Select All 20
                    </button>
                    <button
                      type="button"
                      className="btn-primary btn-sm btn-apply-domains"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDomainsDropdownOpen(false);
                        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <Check size={13} />
                      <span>Done / View Projects</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
