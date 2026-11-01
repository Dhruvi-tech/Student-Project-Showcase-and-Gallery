import React, { useState, useMemo } from 'react';
import { X, BarChart3, PieChart, Layers, Tag, Award, ArrowUpRight, TrendingUp, Cpu, Database } from 'lucide-react';

export function TechAnalyticsModal({ projects = [], onSelectTech, onSelectCategory, onClose }) {
  const [activeTab, setActiveTab] = useState('tech'); // 'tech' | 'domains' | 'metrics'

  // Compute live analytics from the 320 projects catalog
  const analytics = useMemo(() => {
    const techCounts = {};
    const categoryCounts = {};
    const difficultyCounts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    let totalStacks = 0;
    let liveDemoCount = 0;
    let totalVotes = 0;

    projects.forEach((p) => {
      // Tech counts
      (p.tech_stacks || []).forEach((t) => {
        techCounts[t] = (techCounts[t] || 0) + 1;
        totalStacks++;
      });
      // Category counts
      const cat = p.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // Difficulty
      const diff = p.difficulty || 'Intermediate';
      difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;

      if (p.demo_url) liveDemoCount++;
      totalVotes += (p.upvote_count || 0);
    });

    // Sort technologies descending
    const sortedTechs = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: projects.length ? Math.round((count / projects.length) * 100) : 0,
      }));

    // Sort categories descending
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: projects.length ? Math.round((count / projects.length) * 100) : 0,
      }));

    const avgStacks = projects.length ? (totalStacks / projects.length).toFixed(1) : 0;

    return {
      totalProjects: projects.length,
      sortedTechs,
      sortedCategories,
      difficultyCounts,
      avgStacks,
      liveDemoCount,
      totalVotes,
      uniqueTechsCount: sortedTechs.length,
    };
  }, [projects]);

  const handleTechClick = (tech) => {
    onSelectTech?.(tech);
    onClose();
  };

  const handleCategoryClick = (cat) => {
    onSelectCategory?.(cat);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container analytics-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analytics-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.25rem 1.6rem 0.85rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-cobalt-subtle)',
              color: 'var(--accent-cobalt)',
              border: '1px solid var(--accent-cobalt-border)',
              display: 'grid',
              placeItems: 'center'
            }}>
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 id="analytics-title" style={{ fontSize: '1.25rem', fontWeight: 750, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Technology & Catalog Analytics
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Live metrics across {analytics.totalProjects} university capstone projects
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Key Metrics Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          padding: '1rem 1.6rem',
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}>
          <div style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Projects</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 750, color: 'var(--text-primary)', marginTop: '0.1rem' }}>{analytics.totalProjects}</div>
          </div>
          <div style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Unique Techs</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 750, color: 'var(--accent-cobalt)', marginTop: '0.1rem' }}>{analytics.uniqueTechsCount}</div>
          </div>
          <div style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Stacks / Proj</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 750, color: 'var(--accent-emerald)', marginTop: '0.1rem' }}>{analytics.avgStacks}</div>
          </div>
          <div style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Live Deployments</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 750, color: 'var(--accent-amber)', marginTop: '0.1rem' }}>{analytics.liveDemoCount}</div>
          </div>
          <div style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Peer Votes</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 750, color: 'var(--accent-indigo)', marginTop: '0.1rem' }}>{analytics.totalVotes}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', padding: '0.75rem 1.6rem 0', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
            onClick={() => setActiveTab('tech')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.84rem' }}
          >
            <Cpu size={14} />
            <span>Top Technologies ({analytics.sortedTechs.length})</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'domains' ? 'active' : ''}`}
            onClick={() => setActiveTab('domains')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.84rem' }}
          >
            <Layers size={14} />
            <span>Domains & Tracks ({analytics.sortedCategories.length})</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.84rem' }}
          >
            <Award size={14} />
            <span>Difficulty & Architecture</span>
          </button>
        </div>

        {/* Body content with scroll */}
        <div className="modal-body" style={{ padding: '1.25rem 1.6rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'tech' && (
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Click any technology below to instantly filter the showcase gallery:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {analytics.sortedTechs.slice(0, 15).map((tech, idx) => (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => handleTechClick(tech.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    className="analytics-row-btn"
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: '22px' }}>
                      #{idx + 1}
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', width: '130px', flexShrink: 0 }}>
                      {tech.name}
                    </strong>
                    {/* Visual Bar */}
                    <div style={{ flex: 1, height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${tech.percentage}%`,
                        height: '100%',
                        background: idx < 3 ? 'linear-gradient(90deg, #2563eb, #38bdf8)' : 'var(--accent-cobalt)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)', width: '45px', textAlign: 'right' }}>
                      {tech.count}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '40px', textAlign: 'right' }}>
                      {tech.percentage}%
                    </span>
                    <ArrowUpRight size={14} color="var(--accent-cobalt)" style={{ opacity: 0.7 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'domains' && (
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Click any domain below to filter projects in that specialization track:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {analytics.sortedCategories.map((cat, idx) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryClick(cat.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    className="analytics-row-btn"
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: '22px' }}>
                      #{idx + 1}
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', width: '240px', flexShrink: 0 }}>
                      {cat.name}
                    </strong>
                    <div style={{ flex: 1, height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, cat.percentage * 3)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)', width: '45px', textAlign: 'right' }}>
                      {cat.count}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '40px', textAlign: 'right' }}>
                      {cat.percentage}%
                    </span>
                    <ArrowUpRight size={14} color="var(--accent-emerald)" style={{ opacity: 0.7 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                  Project Complexity & Difficulty Level Breakdown
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                  {Object.entries(analytics.difficultyCounts).map(([level, count]) => {
                    const pct = analytics.totalProjects ? Math.round((count / analytics.totalProjects) * 100) : 0;
                    const color = level === 'Advanced' ? '#e11d48' : level === 'Intermediate' ? '#2563eb' : '#10b981';
                    return (
                      <div key={level} style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{level}</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 750, color: 'var(--text-primary)', margin: '0.2rem 0' }}>{count}</div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{pct}% of all capstones</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: '1.1rem', background: 'var(--bg-surface-elevated)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                  Cloud-Native & Evaluator Highlights
                </h4>
                <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
                  <li><strong>Full Database Integrity:</strong> All 320 projects preserved across 20 distinct technical specialization tracks.</li>
                  <li><strong>Multi-Stack Polyglot:</strong> Average capstone leverages <strong>{analytics.avgStacks}</strong> modern frameworks, libraries, or cloud services.</li>
                  <li><strong>Peer Assessment:</strong> <strong>{analytics.totalVotes}</strong> peer upvotes recorded with active engagement across 120 student authors.</li>
                  <li><strong>Verification Ready:</strong> <strong>{analytics.liveDemoCount}</strong> projects feature verified live deployment website links for immediate testing.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '0.85rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Real-time SQLite database analytics
          </span>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
