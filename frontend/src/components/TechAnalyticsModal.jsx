import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart3,
  Layers,
  Award,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Search,
  Copy,
  Check,
  Sparkles,
  Server,
  Code2,
  Database,
  Cloud,
  PieChart as PieIcon,
  Flame,
  GitFork,
  Filter,
  RefreshCw,
  Zap,
  Maximize2,
  Minimize2,
  Grid,
  List,
  CheckCircle2,
} from 'lucide-react';

const ECOSYSTEM_RULES = [
  {
    name: 'AI, ML & Data Science',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.28)',
    icon: Sparkles,
    keywords: ['pytorch', 'tensorflow', 'scikit', 'pandas', 'numpy', 'opencv', 'keras', 'nlp', 'bert', 'hugging', 'yolo', 'langchain', 'llama', 'spacy', 'matplotlib', 'seaborn'],
  },
  {
    name: 'Frontend & UI Frameworks',
    color: '#0ea5e9',
    bgColor: 'rgba(14, 165, 233, 0.12)',
    borderColor: 'rgba(14, 165, 233, 0.28)',
    icon: Code2,
    keywords: ['react', 'vue', 'next', 'angular', 'svelte', 'tailwind', 'typescript', 'javascript', 'html', 'css', 'flutter', 'react native', 'redux'],
  },
  {
    name: 'Backend & Microservices',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.28)',
    icon: Server,
    keywords: ['fastapi', 'python', 'node', 'express', 'django', 'flask', 'go', 'golang', 'spring', 'rust', 'graphql', 'rest', 'c#', '.net', 'java'],
  },
  {
    name: 'Cloud, DevOps & Infra',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.28)',
    icon: Cloud,
    keywords: ['docker', 'aws', 'kubernetes', 'terraform', 'ci/cd', 'github actions', 'nginx', 'linux', 'azure', 'gcp', 'serverless', 'lambda'],
  },
  {
    name: 'Databases & Storage',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.28)',
    icon: Database,
    keywords: ['postgres', 'postgresql', 'mongodb', 'sqlite', 'redis', 'mysql', 'prisma', 'sqlalchemy', 'firebase', 'supabase', 'dynamodb'],
  },
];

export function TechAnalyticsModal({ projects = [], onSelectTech, onSelectCategory, onOpenProject, onClose }) {
  const [activeTab, setActiveTab] = useState('tech'); // 'tech' | 'synergy' | 'domains' | 'ecosystems' | 'leaderboard'
  const [techSearch, setTechSearch] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Extract unique categories for drilldown filter
  const allCategories = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [projects]);

  // Filter projects by domain drilldown if selected
  const activeProjects = useMemo(() => {
    if (selectedDomainFilter === 'All') return projects;
    return projects.filter((p) => (p.category || 'Other') === selectedDomainFilter);
  }, [projects, selectedDomainFilter]);

  // Compute live multi-dimensional analytics from active projects
  const analytics = useMemo(() => {
    const techCounts = {};
    const categoryCounts = {};
    const categoryVotes = {};
    const pairCounts = {};
    const difficultyCounts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    const ecosystemCounts = {
      'AI, ML & Data Science': 0,
      'Frontend & UI Frameworks': 0,
      'Backend & Microservices': 0,
      'Cloud, DevOps & Infra': 0,
      'Databases & Storage': 0,
      'Other Developer Utilities': 0,
    };
    let totalStacks = 0;
    let liveDemoCount = 0;
    let totalVotes = 0;

    activeProjects.forEach((p) => {
      const stacks = (p.tech_stacks || []).slice();

      // Tech counts & ecosystem categorization
      stacks.forEach((t) => {
        techCounts[t] = (techCounts[t] || 0) + 1;
        totalStacks++;

        const lowerTech = t.toLowerCase();
        let matched = false;
        for (const eco of ECOSYSTEM_RULES) {
          if (eco.keywords.some((kw) => lowerTech.includes(kw))) {
            ecosystemCounts[eco.name] = (ecosystemCounts[eco.name] || 0) + 1;
            matched = true;
            break;
          }
        }
        if (!matched) {
          ecosystemCounts['Other Developer Utilities'] = (ecosystemCounts['Other Developer Utilities'] || 0) + 1;
        }
      });

      // Tech Co-occurrence / Synergy Pairs calculation
      const sortedStacks = stacks.sort();
      for (let i = 0; i < sortedStacks.length; i++) {
        for (let j = i + 1; j < sortedStacks.length; j++) {
          const pairKey = `${sortedStacks[i]} + ${sortedStacks[j]}`;
          pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
        }
      }

      // Category counts & votes
      const cat = p.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      categoryVotes[cat] = (categoryVotes[cat] || 0) + (p.upvote_count || 0);

      // Difficulty
      const diff = p.difficulty || 'Intermediate';
      if (difficultyCounts[diff] !== undefined) {
        difficultyCounts[diff]++;
      } else {
        difficultyCounts['Intermediate']++;
      }

      if (p.demo_url) liveDemoCount++;
      totalVotes += (p.upvote_count || 0);
    });

    // Sorted technologies descending
    const sortedTechs = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: activeProjects.length ? Math.round((count / activeProjects.length) * 100) : 0,
      }));

    // Sorted co-occurrence pairs (Architectural synergy)
    const sortedPairs = Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([pair, count]) => ({
        pair,
        techA: pair.split(' + ')[0],
        techB: pair.split(' + ')[1],
        count,
        percentage: activeProjects.length ? Math.round((count / activeProjects.length) * 100) : 0,
      }));

    // Sorted categories descending
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        totalVotes: categoryVotes[name] || 0,
        avgVotes: count ? ((categoryVotes[name] || 0) / count).toFixed(1) : '0.0',
        percentage: projects.length ? Math.round((count / projects.length) * 100) : 0,
      }));

    // Top 8 upvoted projects (Leaderboard)
    const topProjects = [...activeProjects]
      .sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0))
      .slice(0, 8);

    // Sorted ecosystems
    const totalEcosystemHits = Object.values(ecosystemCounts).reduce((a, b) => a + b, 0);
    const sortedEcosystems = Object.entries(ecosystemCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalEcosystemHits ? Math.round((count / totalEcosystemHits) * 100) : 0,
      }));

    const avgStacks = activeProjects.length ? (totalStacks / activeProjects.length).toFixed(1) : '0.0';

    return {
      totalProjects: activeProjects.length,
      sortedTechs,
      sortedPairs,
      sortedCategories,
      difficultyCounts,
      sortedEcosystems,
      topProjects,
      avgStacks,
      liveDemoCount,
      totalVotes,
      uniqueTechsCount: sortedTechs.length,
    };
  }, [activeProjects, projects]);

  // Filtered techs for in-modal search
  const visibleTechs = useMemo(() => {
    if (!techSearch.trim()) return analytics.sortedTechs;
    const query = techSearch.toLowerCase().trim();
    return analytics.sortedTechs.filter((t) => t.name.toLowerCase().includes(query));
  }, [analytics.sortedTechs, techSearch]);

  const handleTechClick = (tech) => {
    onSelectTech?.(tech);
    onClose();
  };

  const handleCategoryClick = (cat) => {
    onSelectCategory?.(cat);
    onClose();
  };

  // Copy evaluation summary report to clipboard
  const handleCopySummary = () => {
    const top5Tech = analytics.sortedTechs.slice(0, 5).map((t) => `${t.name} (${t.count} projects, ${t.percentage}%)`).join(', ');
    const top3Cats = analytics.sortedCategories.slice(0, 3).map((c) => `${c.name} (${c.count} projects)`).join(', ');
    const topPairs = analytics.sortedPairs.slice(0, 3).map((p) => `${p.pair} (${p.count} projects)`).join(', ');
    const report = `# Student Project Showcase & Peer Gallery Analytics Report
• Scope: ${selectedDomainFilter === 'All' ? 'All 320 Projects (All 20 Domains)' : `${selectedDomainFilter} (${analytics.totalProjects} projects)`}
• Capstone Projects Analyzed: ${analytics.totalProjects}
• Unique Technology Stacks: ${analytics.uniqueTechsCount}
• Average Frameworks/Libs per Project: ${analytics.avgStacks}
• Live Deployments: ${analytics.liveDemoCount} verified websites
• Total Peer Evaluation Votes: ${analytics.totalVotes}
• Difficulty Breakdown: Advanced (${analytics.difficultyCounts.Advanced}), Intermediate (${analytics.difficultyCounts.Intermediate}), Beginner (${analytics.difficultyCounts.Beginner})
• Top 5 Technologies: ${top5Tech}
• Top Architectural Pairings: ${topPairs}
• Top Specialization Domains: ${top3Cats}
Generated live from verified SQLite capstone database.`;

    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }).catch(() => {});
  };

  // Donut chart math for Difficulty breakdown
  const donutData = useMemo(() => {
    const total = analytics.totalProjects || 1;
    const adv = analytics.difficultyCounts.Advanced || 0;
    const int = analytics.difficultyCounts.Intermediate || 0;
    const beg = analytics.difficultyCounts.Beginner || 0;

    const r = 40;
    const c = 2 * Math.PI * r;

    const advLen = (adv / total) * c;
    const intLen = (int / total) * c;
    const begLen = (beg / total) * c;

    return {
      c,
      adv,
      int,
      beg,
      advPct: Math.round((adv / total) * 100),
      intPct: Math.round((int / total) * 100),
      begPct: Math.round((beg / total) * 100),
      advStroke: `${advLen} ${c - advLen}`,
      intStroke: `${intLen} ${c - intLen}`,
      begStroke: `${begLen} ${c - begLen}`,
      advOffset: 0,
      intOffset: -advLen,
      begOffset: -(advLen + intLen),
    };
  }, [analytics]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: isFullscreen ? '0' : '1rem' }}>
      <div
        className="modal-container analytics-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analytics-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isFullscreen ? '100vw' : '96%',
          maxWidth: isFullscreen ? '100vw' : '1240px',
          height: isFullscreen ? '100vh' : '92vh',
          maxHeight: isFullscreen ? '100vh' : '94vh',
          borderRadius: isFullscreen ? '0' : 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header with Title + Compact Inline Metrics Strip */}
        <div className="modal-header" style={{ padding: '0.95rem 1.6rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'var(--accent-cobalt-subtle)',
              color: 'var(--accent-cobalt)',
              border: '1px solid var(--accent-cobalt-border)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)'
            }}>
              <BarChart3 size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h3 id="analytics-title" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Technology &amp; Catalog Analytics
                </h3>
                {/* Sleek inline single-line metrics badges (No bulky vertical stacking!) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                    {analytics.totalProjects} Projects
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--accent-cobalt-subtle)', color: 'var(--accent-cobalt)', border: '1px solid var(--accent-cobalt-border)' }}>
                    {analytics.uniqueTechsCount} Tech Stacks
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--accent-indigo-subtle)', color: 'var(--accent-indigo)', border: '1px solid var(--border-subtle)' }}>
                    {analytics.totalVotes} Peer Votes
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--accent-amber-subtle)', color: 'var(--accent-amber)', border: '1px solid var(--border-subtle)' }}>
                    {analytics.liveDemoCount} Live Sites
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Restore standard size' : 'Expand to Fullscreen'}
              style={{ width: '32px', height: '32px', cursor: 'pointer' }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close analytics modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Compact Navigation Bar: Scope Filter + Search + Tab Selectors (All in one efficient horizontal bar!) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.6rem',
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: '0.65rem'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', alignItems: 'center' }}>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
              onClick={() => setActiveTab('tech')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <Cpu size={13} />
              <span>Technologies ({analytics.sortedTechs.length})</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'synergy' ? 'active' : ''}`}
              onClick={() => setActiveTab('synergy')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <GitFork size={13} color="var(--accent-cobalt)" />
              <span>Stack Synergy Pairs</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'domains' ? 'active' : ''}`}
              onClick={() => setActiveTab('domains')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <Layers size={13} />
              <span>20 Domains</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'ecosystems' ? 'active' : ''}`}
              onClick={() => setActiveTab('ecosystems')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <PieIcon size={13} />
              <span>Ecosystems &amp; Complexity</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <Flame size={13} color="#f59e0b" />
              <span>Top Capstones</span>
            </button>
          </div>

          {/* Scope Filter & Grid/List Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={12} color="var(--accent-cobalt)" />
              <select
                value={selectedDomainFilter}
                onChange={(e) => setSelectedDomainFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '5px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: '220px'
                }}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? '⚡ Entire 320 Catalog' : cat}
                  </option>
                ))}
              </select>
            </div>

            {selectedDomainFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedDomainFilter('All')}
                style={{
                  padding: '0.2rem 0.45rem',
                  borderRadius: '4px',
                  background: 'var(--accent-cobalt-subtle)',
                  color: 'var(--accent-cobalt)',
                  border: '1px solid var(--accent-cobalt-border)',
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
                title="Reset scope to entire catalog"
              >
                Reset
              </button>
            )}

            <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: '5px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{ padding: '0.25rem 0.45rem', background: viewMode === 'grid' ? 'var(--accent-cobalt)' : 'var(--bg-surface)', color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                title="Multi-column grid view (more items on screen)"
              >
                <Grid size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{ padding: '0.25rem 0.45rem', background: viewMode === 'list' ? 'var(--accent-cobalt)' : 'var(--bg-surface)', color: viewMode === 'list' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                title="Single column list view"
              >
                <List size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Spacious Body with Multi-Column Responsive Grids */}
        <div className="modal-body" style={{ padding: '1.25rem 1.6rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: Technologies with In-Modal Search and Multi-Column Grid */}
          {activeTab === 'tech' && (
            <div>
              {/* Quick Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.45rem 0.75rem' }}>
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Quick filter 50+ technologies (e.g. PyTorch, React, Docker, FastAPI, PostgreSQL)..."
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', width: '100%' }}
                />
                {techSearch && (
                  <button type="button" onClick={() => setTechSearch('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Clear
                  </button>
                )}
              </div>

              {visibleTechs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No technologies found matching "{techSearch}".
                </div>
              ) : (
                /* Multi-column grid: in wide view, shows 3 to 4 items per row! Eliminates endless vertical scrolling! */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: '0.65rem'
                }}>
                  {visibleTechs.map((tech, idx) => {
                    const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    return (
                      <button
                        key={tech.name}
                        type="button"
                        onClick={() => handleTechClick(tech.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                        className="analytics-row-btn"
                        title={`Click to filter showcase gallery for ${tech.name}`}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', width: '24px', flexShrink: 0 }}>
                          {rankMedal}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                            <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {tech.name}
                            </strong>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cobalt)', fontFamily: 'var(--font-mono)' }}>
                              {tech.count} ({tech.percentage}%)
                            </span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.max(4, tech.percentage)}%`,
                              height: '100%',
                              background: idx === 0
                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                : idx < 3
                                ? 'linear-gradient(90deg, #2563eb, #38bdf8)'
                                : 'var(--accent-cobalt)',
                              borderRadius: '3px',
                              transition: 'width 0.4s ease'
                            }} />
                          </div>
                        </div>
                        <ArrowUpRight size={13} color="var(--accent-cobalt)" style={{ opacity: 0.6, flexShrink: 0 }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Architectural Synergy & Tech Pairings (Multi-Column Grid) */}
          {activeTab === 'synergy' && (
            <div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--accent-cobalt-subtle)', border: '1px solid var(--accent-cobalt-border)', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 750, color: 'var(--accent-cobalt)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={15} />
                  <span>Architectural Technology Synergy Matrix</span>
                </h4>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Discovers which tools and frameworks student developers pair together in their capstones:
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                gap: '0.65rem'
              }}>
                {analytics.sortedPairs.map((p, idx) => (
                  <div
                    key={p.pair}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', width: '24px', flexShrink: 0 }}>
                      #{idx + 1}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span className="tech-badge" style={{ margin: 0, fontWeight: 700, fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>{p.techA}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800 }}>+</span>
                          <span className="tech-badge" style={{ margin: 0, fontWeight: 700, fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>{p.techB}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a855f7', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                          {p.count} proj ({p.percentage}%)
                        </span>
                      </div>
                      <div style={{ height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, p.percentage * 2.5)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Specialization Domains (Multi-Column Grid) */}
          {activeTab === 'domains' && (
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                All 20 engineering specialization tracks sorted by capstone project distribution:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                gap: '0.65rem'
              }}>
                {analytics.sortedCategories.map((cat, idx) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryClick(cat.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    className="analytics-row-btn"
                    title={`Click to filter showcase gallery for ${cat.name}`}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--text-muted)', width: '24px', flexShrink: 0 }}>
                      #{idx + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cat.name}
                        </strong>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                          {cat.count} ({cat.percentage}%)
                        </span>
                      </div>
                      <div style={{ height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, cat.percentage * 3.5)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                    <ArrowUpRight size={13} color="var(--accent-emerald)" style={{ opacity: 0.6, flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Ecosystems & Difficulty (Side-by-Side 2-Column Split) */}
          {activeTab === 'ecosystems' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {/* Left Column: Difficulty Donut Chart */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 750, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
                  Project Complexity &amp; Difficulty Breakdown
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', margin: 'auto 0' }}>
                  {/* SVG Donut Chart */}
                  <div style={{ position: 'relative', width: '130px', height: '130px', display: 'grid', placeItems: 'center' }}>
                    <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--bg-surface-elevated)" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="12" strokeDasharray={donutData.advStroke} strokeDashoffset={donutData.advOffset} />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="12" strokeDasharray={donutData.intStroke} strokeDashoffset={donutData.intOffset} />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray={donutData.begStroke} strokeDashoffset={donutData.begOffset} />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{analytics.totalProjects}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Projects</div>
                    </div>
                  </div>

                  {/* Legend Cards */}
                  <div style={{ display: 'grid', gap: '0.5rem', minWidth: '150px' }}>
                    <div style={{ padding: '0.55rem 0.85rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', borderLeft: '4px solid #f43f5e' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f43f5e' }}>Advanced: {donutData.adv}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{donutData.advPct}% of catalog</div>
                    </div>
                    <div style={{ padding: '0.55rem 0.85rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb' }}>Intermediate: {donutData.int}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{donutData.intPct}% of catalog</div>
                    </div>
                    <div style={{ padding: '0.55rem 0.85rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>Beginner: {donutData.beg}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{donutData.begPct}% of catalog</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Engineering Ecosystem Share */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.2rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 750, color: 'var(--text-primary)', margin: '0 0 0.85rem' }}>
                  Engineering Ecosystem Share
                </h4>
                <div style={{ display: 'grid', gap: '0.55rem' }}>
                  {analytics.sortedEcosystems.map((eco) => {
                    const rule = ECOSYSTEM_RULES.find((r) => r.name === eco.name) || {
                      color: 'var(--text-muted)',
                      bgColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                    };
                    return (
                      <div
                        key={eco.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)', width: '180px', flexShrink: 0 }}>
                          {eco.name}
                        </strong>
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${eco.percentage}%`,
                            height: '100%',
                            background: rule.color,
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', width: '65px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          {eco.count} ({eco.percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Top 8 Highest-Rated Capstones Leaderboard (Multi-Column Grid) */}
          {activeTab === 'leaderboard' && (
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Highest-appreciated student projects ranked by peer upvotes:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(360px, 1fr))' : '1fr',
                gap: '0.75rem'
              }}>
                {analytics.topProjects.map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, width: '26px', flexShrink: 0 }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.author_display_name || p.student_name || 'Student Author'}</span>
                          <span>•</span>
                          <span className="category-tag-badge" style={{ padding: '0.05rem 0.35rem', fontSize: '0.65rem' }}>{p.category}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--accent-indigo-subtle)', color: 'var(--accent-indigo)', padding: '0.25rem 0.5rem', borderRadius: '5px', fontSize: '0.78rem', fontWeight: 700 }}>
                        <Flame size={13} color="#f59e0b" />
                        <span>{p.upvote_count || 0}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => onOpenProject?.(p)}
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '0.75rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopySummary}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem' }}
            title="Copy academic analytics summary to clipboard for reports or presentations"
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            <span>{copied ? 'Report Copied to Clipboard!' : 'Copy Evaluation Report'}</span>
          </button>

          <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.82rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}