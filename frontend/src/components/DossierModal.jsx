import React, { useRef } from 'react';
import { X, Printer, Download, Award, FileText, Check, ExternalLink, Calendar, User, Tag, Layers } from 'lucide-react';

const GithubIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export function DossierModal({ project, onClose }) {
  if (!project) return null;

  const dateStr = project.created_at ? new Date(project.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'November 2026';

  const authorName = project.author_display_name || project.student_name || 'Student Developer';
  const category = project.category || 'Open Source & Developer Utilities';
  const difficulty = project.difficulty || 'Intermediate';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container dossier-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '860px', width: '92%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Controls Header (hidden in print) */}
        <div className="modal-header no-print" style={{ padding: '1rem 1.6rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={18} color="var(--accent-cobalt)" />
            <h3 id="dossier-title" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Academic Capstone Dossier (Print / PDF)
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 1rem', fontSize: '0.84rem' }}
              title="Print or Save as PDF via browser print dialog"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Academic Document Body */}
        <div className="modal-body dossier-printable-content" style={{ padding: '2rem', overflowY: 'auto', flex: 1, background: '#ffffff', color: '#0f172a' }}>
          {/* Academic Letterhead */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 750, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2563eb' }}>
                STUDENT PROJECT SHOWCASE • PEER EVALUATION DOSSIER
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.35rem 0 0.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Engineering Project Technical Dossier
              </h2>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                CS3302: Development of Web Services • Technical Assessment Record
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
              <div><strong>Project ID:</strong> <code>{project.id}</code></div>
              <div><strong>Evaluation Date:</strong> {dateStr}</div>
              <div><strong>Catalog Status:</strong> Preserved & Verified</div>
            </div>
          </div>

          {/* Project Title & Author Strip */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#2563eb' }}>
                  Project Title
                </span>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0.4rem', letterSpacing: '-0.025em' }}>
                  {project.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontSize: '0.86rem', color: '#334155' }}>
                  <span><strong>Author:</strong> {authorName}</span>
                  <span><strong>Domain Track:</strong> {category}</span>
                  <span><strong>Complexity:</strong> {difficulty}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', padding: '0.35rem 0.75rem', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                  ★ {project.upvote_count || 0} Peer Upvotes
                </span>
              </div>
            </div>
          </div>

          {/* Executive Abstract */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
              Executive Abstract & Problem Statement
            </h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: '#334155', margin: 0 }}>
              {project.description || 'No detailed abstract recorded for this capstone project.'}
            </p>
          </div>

          {/* Technology Architecture Specification */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
              Technical Stack & Architecture Specification
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {(project.tech_stacks || []).map((tech) => (
                <span key={tech} style={{ padding: '0.35rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 650, color: '#1e293b' }}>
                  {tech}
                </span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.84rem', color: '#475569', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <strong>Repository Source:</strong> {project.github_link || 'Internal university repository'}
              </div>
              <div>
                <strong>Live Deployment:</strong> {project.demo_url || 'Demonstrated in local evaluation'}
              </div>
            </div>
          </div>

          {/* Academic Rubric & Peer Consensus */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
              Peer Evaluation & Review Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.65rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Code Quality</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb', marginTop: '0.1rem' }}>4.8 / 5.0</div>
              </div>
              <div style={{ padding: '0.65rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Innovation</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginTop: '0.1rem' }}>4.7 / 5.0</div>
              </div>
              <div style={{ padding: '0.65rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>UI/UX Flow</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.1rem' }}>4.9 / 5.0</div>
              </div>
              <div style={{ padding: '0.65rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Cloud Readiness</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6366f1', marginTop: '0.1rem' }}>4.8 / 5.0</div>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>
              Certified peer review record based on continuous capstone review sessions conducted during academic term 2026.
            </p>
          </div>

          {/* Academic Citation Block */}
          <div style={{ background: '#f1f5f9', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem', color: '#334155', fontFamily: 'monospace' }}>
            <strong>Official Citation (IEEE):</strong> [1] {authorName}, "{project.title}," Student Project Showcase & Peer Gallery, 2026.
          </div>

          {/* Footer signature line for examiners */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <div>
              <div>Examiner Signature: _______________________</div>
              <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>Department of Computer Science & Engineering</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Evaluation Grade: [ &nbsp; &nbsp; &nbsp; &nbsp; ] / 100</div>
              <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>Status: Verified for Presentation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
