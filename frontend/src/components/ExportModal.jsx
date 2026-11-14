import React, { useState } from 'react';
import { X, Download, FileText, FileCode, Check } from 'lucide-react';

export function ExportModal({ projects = [], selectedCategory = 'All', onClose }) {
  const [format, setFormat] = useState('markdown'); // 'markdown' | 'json'
  const [downloaded, setDownloaded] = useState(false);

  const generateMarkdown = () => {
    let md = `# Student Project Showcase Catalog\n`;
    md += `**Category:** ${selectedCategory} | **Total Projects:** ${projects.length}\n`;
    md += `*Exported from Student Project Showcase & Peer Gallery on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    projects.forEach((p, idx) => {
      md += `### ${idx + 1}. ${p.title}\n`;
      md += `- **Author:** ${p.author_display_name || p.student_name || 'Student'}\n`;
      md += `- **Category:** ${p.category || 'General'}\n`;
      md += `- **Difficulty:** ${p.difficulty || 'Intermediate'}\n`;
      if (p.tech_stacks?.length) {
        md += `- **Technologies:** ${p.tech_stacks.join(', ')}\n`;
      }
      if (p.github_link) {
        md += `- **GitHub:** [${p.github_link}](${p.github_link})\n`;
      }
      if (p.demo_url) {
        md += `- **Live Demo:** [${p.demo_url}](${p.demo_url})\n`;
      }
      md += `- **Description:** ${p.description || 'No description'}\n\n`;
    });

    return md;
  };

  const generateJSON = () => {
    const cleanData = projects.map((p) => ({
      id: p.id,
      title: p.title,
      author: p.author_display_name || p.student_name || 'Student Developer',
      category: p.category,
      difficulty: p.difficulty,
      technologies: p.tech_stacks || [],
      upvotes: p.upvote_count,
      downvotes: p.downvote_count,
      github_link: p.github_link,
      demo_url: p.demo_url,
      description: p.description,
      created_at: p.created_at,
    }));
    return JSON.stringify(cleanData, null, 2);
  };

  const handleDownload = () => {
    const content = format === 'markdown' ? generateMarkdown() : generateJSON();
    const mime = format === 'markdown' ? 'text/markdown;charset=utf-8;' : 'application/json;charset=utf-8;';
    const filename = `student-showcase-${selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`;

    const blob = new Blob([content], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container export-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', width: '90%' }}
      >
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-emerald-subtle)',
              color: 'var(--accent-emerald)',
              display: 'grid',
              placeItems: 'center'
            }}>
              <Download size={16} />
            </div>
            <div>
              <h3 id="export-title" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Export Projects Catalog
              </h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Export {projects.length} project{projects.length === 1 ? '' : 's'} for reports or offline review
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Choose your preferred export format for grading records, capstone documentation, or personal portfolio archives:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={() => setFormat('markdown')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${format === 'markdown' ? 'var(--accent-cobalt)' : 'var(--border-subtle)'}`,
                background: format === 'markdown' ? 'var(--accent-cobalt-subtle)' : 'var(--bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={22} color={format === 'markdown' ? 'var(--accent-cobalt)' : 'var(--text-muted)'} style={{ marginBottom: '0.5rem' }} />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Markdown (.md)</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Formatted document for GitHub, Notion, or reports
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('json')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${format === 'json' ? 'var(--accent-cobalt)' : 'var(--border-subtle)'}`,
                background: format === 'json' ? 'var(--accent-cobalt-subtle)' : 'var(--bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <FileCode size={22} color={format === 'json' ? 'var(--accent-cobalt)' : 'var(--text-muted)'} style={{ marginBottom: '0.5rem' }} />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>JSON (.json)</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Structured data for programmatic analysis or backup
              </span>
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 650
            }}
          >
            {downloaded ? <Check size={15} /> : <Download size={15} />}
            <span>{downloaded ? 'Downloaded!' : `Download .${format === 'markdown' ? 'md' : 'json'}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
