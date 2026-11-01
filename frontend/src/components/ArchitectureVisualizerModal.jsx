import React, { useState } from 'react';
import {
  X,
  Layers,
  ShieldCheck,
  Database,
  Server,
  Monitor,
  Cloud,
  ArrowRight,
  Check,
  Copy,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function ArchitectureVisualizerModal({ project, onClose }) {
  if (!project) return null;

  const [selectedLayer, setSelectedLayer] = useState('gateway');
  const [copied, setCopied] = useState(false);

  const layers = [
    {
      id: 'client',
      title: 'Presentation & Client Layer',
      tech: 'React 18 + Vite SPA',
      icon: Monitor,
      color: '#0ea5e9',
      protocol: 'HTTPS / TLS 1.3',
      description: 'Single-page application client delivering responsive views across dark and light slate themes with instant client-side filtering and optimistic updates.',
      security: 'Strict Content-Security-Policy, Sanitized UI inputs, no inline credentials or tokens stored in localStorage.',
      cloudReadiness: 'Stateless static asset bundle ready for Amazon S3 / CloudFront edge distribution without server lock-in.',
    },
    {
      id: 'gateway',
      title: 'API Gateway & Security Layer',
      tech: 'FastAPI + Starlette Middleware',
      icon: ShieldCheck,
      color: '#8b5cf6',
      protocol: 'RESTful JSON / CORS Shielded',
      description: 'Centralized API gateway handling request routing, rate limiting, and structured logging. Validates all mutating payloads against strict Pydantic schemas.',
      security: 'Double-Submit Cookie CSRF Defense, HTTP-only signed session cookies, PBKDF2-SHA256 password hashing with salt.',
      cloudReadiness: 'Twelve-Factor stateless process; containerized via Docker and ready for AWS ECS Fargate or local Compose.',
    },
    {
      id: 'compute',
      title: 'Domain Engine & Compute Services',
      tech: 'Python 3.13 Async Core',
      icon: Server,
      color: '#10b981',
      protocol: 'Internal In-Process Async Calls',
      description: 'Executes core capstone logic: domain ranking, recommendation algorithms, peer review rubric processing, and catalog export generation.',
      security: 'Strict server-side identity verification via X-Student-Id and signed session claims; author ownership strictly enforced.',
      cloudReadiness: 'CPU-efficient asynchronous event loop supporting high concurrency with low memory footprint (<80MB resident).',
    },
    {
      id: 'database',
      title: 'Relational Persistence Layer',
      tech: 'SQLite (Preserved Catalog) / SQLAlchemy',
      icon: Database,
      color: '#f59e0b',
      protocol: 'SQLAlchemy ORM with Foreign Keys',
      description: 'Stores 320 projects, 120 student authors, 829 unique peer reviews, 374 votes, and category bookmark preferences.',
      security: 'Parameterized SQL queries prevent injection; ACID transaction isolation; write-ahead logging (WAL) enabled.',
      cloudReadiness: 'Zero-cost file persistence for local demo; seamless migration script to Amazon Aurora PostgreSQL prepared.',
    },
    {
      id: 'cloud',
      title: 'DevOps & Cloud Integration Layer',
      tech: 'Docker + Least-Privilege IAM',
      icon: Cloud,
      color: '#f43f5e',
      protocol: 'AWS CloudFormation / ₹0 Local Policy',
      description: 'Cloud deployment manifests, container specs, health checks, and optional private S3 storage integration templates.',
      security: 'Strict ₹0 Cloud Policy: zero public AWS billable resources created; local simulation ensures absolute safety against unexpected costs.',
      cloudReadiness: 'CloudFormation stack templates, CloudWatch logging formats, and disaster recovery checkpoint backups in place.',
    },
  ];

  const current = layers.find((l) => l.id === selectedLayer) || layers[0];

  const handleCopyArchitecture = () => {
    const text = `┌────────────────────────────────────────────────────────┐
│           PROJECTSPACE 5-TIER SYSTEM ARCHITECTURE      │
├────────────────────────────────────────────────────────┤
│ 1. Client Tier:    React 18 + Vite (HTTPS / TLS 1.3)   │
│ 2. Gateway Tier:   FastAPI + CSRF & PBKDF2 Auth Shield │
│ 3. Compute Tier:   Async Domain & Recommendation Engine│
│ 4. Storage Tier:   Preserved 320-Project SQLite / ORM  │
│ 5. DevOps Tier:    Docker + ₹0 Cloud Policy & S3 Plan  │
└────────────────────────────────────────────────────────┘
Project: ${project.title} (${project.category || 'Engineering'})
Stacks: ${(project.tech_stacks || []).join(', ')}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }).catch(() => {});
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container architecture-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="architecture-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', width: '94%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.2rem 1.6rem 0.85rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(2, 132, 199, 0.28))',
              color: '#0284c7',
              border: '1px solid rgba(14, 165, 233, 0.4)',
              display: 'grid',
              placeItems: 'center',
            }}>
              <Layers size={20} />
            </div>
            <div>
              <h3 id="architecture-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                System Architecture &amp; Data Flow Topology
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Multi-tier engineering design for <strong>{project.title}</strong>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ padding: '1.3rem 1.6rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Interactive 5-Tier Architecture Flowchart */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              Click any tier below to inspect technical specification:
            </div>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {layers.map((l, idx) => {
                const Icon = l.icon;
                const isSelected = selectedLayer === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedLayer(l.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1.1rem',
                      borderRadius: '10px',
                      background: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${isSelected ? l.color : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: isSelected ? `0 4px 14px ${l.color}25` : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: `${l.color}18`,
                        color: l.color,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={17} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                          Tier {idx + 1}: {l.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: isSelected ? l.color : 'var(--text-muted)', fontWeight: 600 }}>
                          {l.tech}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        {l.protocol}
                      </span>
                      <ArrowRight size={14} color={isSelected ? l.color : 'var(--text-muted)'} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Inspector Panel for Selected Tier */}
          <div style={{
            padding: '1.2rem',
            background: 'var(--bg-surface)',
            border: `1px solid var(--border-subtle)`,
            borderLeft: `4px solid ${current.color}`,
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: current.color }}>✦</span>
                <span>{current.title} Deep-Dive</span>
              </h4>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '5px', background: `${current.color}15`, color: current.color }}>
                Protocol: {current.protocol}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {current.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.25rem' }}>
              <div style={{ padding: '0.75rem 0.95rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 750, color: 'var(--accent-emerald)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={12} />
                  <span>Security &amp; Integrity Controls</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {current.security}
                </div>
              </div>

              <div style={{ padding: '0.75rem 0.95rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 750, color: 'var(--accent-cobalt)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Cloud size={12} />
                  <span>Cloud Readiness &amp; ₹0 Policy</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {current.cloudReadiness}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '0.85rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyArchitecture}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
            title="Copy system architecture topology diagram to clipboard"
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            <span>{copied ? 'Diagram Copied!' : 'Copy Architecture Diagram'}</span>
          </button>

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}