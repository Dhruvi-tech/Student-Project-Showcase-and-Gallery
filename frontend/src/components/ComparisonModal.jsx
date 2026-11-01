import React from 'react';
import { X, GitCompare, ExternalLink, ThumbsUp, Layers, Check, ArrowRight, Star } from 'lucide-react';

const GithubIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export function ComparisonModal({ projects = [], onRemoveProject, onOpenDetails, onClose }) {
  if (!projects || projects.length === 0) return null;

  // Find all unique technologies across compared projects
  const allStacks = Array.from(new Set(projects.flatMap((p) => p.tech_stacks || [])));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container comparison-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1080px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
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
              <GitCompare size={18} />
            </div>
            <div>
              <h3 id="comparison-title" style={{ fontSize: '1.25rem', fontWeight: 750, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Capstone Comparison Matrix
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Comparing {projects.length} student project{projects.length === 1 ? '' : 's'} side-by-side
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div className="modal-body" style={{ padding: '1.4rem 1.6rem', overflowY: 'auto', flex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `180px repeat(${projects.length}, minmax(260px, 1fr))`,
            gap: '1rem',
            minWidth: projects.length === 3 ? '880px' : '650px'
          }}>
            {/* Row: Project Title & Quick Actions */}
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
              Project
            </div>
            {projects.map((p) => (
              <div key={p.id} style={{
                background: 'var(--bg-card)',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <button
                  type="button"
                  onClick={() => onRemoveProject?.(p.id)}
                  title="Remove from comparison"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={12} />
                </button>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text-primary)', paddingRight: '20px' }}>
                    {p.title}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    by {p.author_display_name || p.student_name || 'Student Developer'}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { onOpenDetails?.(p); onClose(); }}
                  style={{ marginTop: '0.85rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
                >
                  <span>Open Full Details</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}

            {/* Row: Domain Track */}
            <div style={{ fontWeight: 650, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              Specialization Domain
            </div>
            {projects.map((p) => (
              <div key={p.id} style={{ padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {p.category || 'Open Source & Utilities'}
              </div>
            ))}

            {/* Row: Difficulty Level */}
            <div style={{ fontWeight: 650, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              Complexity Rating
            </div>
            {projects.map((p) => {
              const diff = p.difficulty || 'Intermediate';
              const color = diff === 'Advanced' ? 'var(--accent-rose)' : diff === 'Intermediate' ? 'var(--accent-cobalt)' : 'var(--accent-emerald)';
              return (
                <div key={p.id} style={{ padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, color }}>
                  {diff}
                </div>
              );
            })}

            {/* Row: Peer Appreciation */}
            <div style={{ fontWeight: 650, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              Peer Community Votes
            </div>
            {projects.map((p) => (
              <div key={p.id} style={{ padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <ThumbsUp size={14} color="var(--accent-cobalt)" />
                <span>{p.upvote_count || 0} peer upvotes</span>
              </div>
            ))}

            {/* Row: Live Links & Verification */}
            <div style={{ fontWeight: 650, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              Deployment & Source
            </div>
            {projects.map((p) => (
              <div key={p.id} style={{ padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {p.demo_url ? (
                  <a href={p.demo_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 650 }}>
                    <ExternalLink size={12} />
                    <span>Live Web App</span>
                  </a>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No live demo</span>
                )}
                {p.github_link && (
                  <a href={p.github_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--accent-cobalt)', fontWeight: 650, marginLeft: 'auto' }}>
                    <GithubIcon size={12} />
                    <span>Source Repo</span>
                  </a>
                )}
              </div>
            ))}

            {/* Row: Tech Stacks Diff */}
            <div style={{ fontWeight: 650, fontSize: '0.82rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
              Tech Stacks ({allStacks.length} total)
            </div>
            {projects.map((p) => {
              const projectStacks = new Set(p.tech_stacks || []);
              return (
                <div key={p.id} style={{ padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(p.tech_stacks || []).map((tech) => (
                      <span key={tech} className="tech-badge" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Row: Overview Description */}
            <div style={{ fontWeight: 650, fontSize: '0.82rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
              Executive Summary
            </div>
            {projects.map((p) => (
              <div key={p.id} style={{ padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {p.description || 'No description provided.'}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '0.85rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Tip: You can compare up to 3 projects at once
          </span>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
