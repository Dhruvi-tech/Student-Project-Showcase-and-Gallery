import React, { useState } from 'react';
import { X, Copy, Check, Quote, BookOpen, Code2 } from 'lucide-react';

export function CitationModal({ project, onClose }) {
  const [tab, setTab] = useState('bibtex'); // 'bibtex' | 'ieee' | 'apa' | 'markdown'
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const year = project.created_at ? new Date(project.created_at).getFullYear() : '2026';
  const author = project.author_display_name || project.student_name || 'Student Developer';
  const title = project.title || 'Student Project';
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/#project-${project.id}` : `http://localhost:5173/#project-${project.id}`;

  const citations = {
    bibtex: `@misc{${slug}_${year},
  author       = {${author}},
  title        = {${title}},
  howpublished = {Student Project Showcase & Peer Gallery, RV University},
  year         = {${year}},
  url          = {${project.github_link || url}}
}`,
    ieee: `[1] ${author}, "${title}," RV University Student Project Showcase & Peer Gallery, ${year}. [Online]. Available: ${project.github_link || url}.`,
    apa: `${author}. (${year}). ${title} [Computer software / Student capstone project]. RV University Student Project Showcase. ${project.github_link || url}`,
    markdown: `### [${title}](${project.github_link || url})
> **Author:** ${author} | **Category:** ${project.category || 'Developer Utilities'}  
> *Published on Student Project Showcase & Peer Gallery (${year})*`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(citations[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container citation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cite-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '90%' }}
      >
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-cobalt-subtle)',
              color: 'var(--accent-cobalt)',
              display: 'grid',
              placeItems: 'center'
            }}>
              <Quote size={16} />
            </div>
            <div>
              <h3 id="cite-title" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Cite Project
              </h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Academic & Portfolio Citation for "{title}"
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          {/* Format Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: '10px' }}>
            {[
              { id: 'bibtex', label: 'BibTeX', icon: Code2 },
              { id: 'ieee', label: 'IEEE', icon: BookOpen },
              { id: 'apa', label: 'APA 7th', icon: Quote },
              { id: 'markdown', label: 'Markdown', icon: Code2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.6rem',
                  borderRadius: '7px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  background: tab === id ? 'var(--bg-surface)' : 'transparent',
                  color: tab === id ? 'var(--accent-cobalt)' : 'var(--text-muted)',
                  boxShadow: tab === id ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Citation Output Box */}
          <div style={{ position: 'relative' }}>
            <pre
              style={{
                margin: 0,
                padding: '1rem',
                background: 'var(--bg-code)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '220px',
                overflowY: 'auto'
              }}
            >
              {citations[tab]}
            </pre>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Ready for project reports & papers
          </span>
          <button
            type="button"
            className="btn-primary"
            onClick={copyToClipboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 650
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Citation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
