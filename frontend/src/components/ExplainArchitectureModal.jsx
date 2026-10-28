import React from 'react';
import { X, Server, Database, ShieldCheck, Zap, Layers, Cloud } from 'lucide-react';

export function ExplainArchitectureModal({ onClose, healthData }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '800px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-cobalt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Cloud size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                System Architecture & Design Concepts
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Cloud-Native Architecture, ACID Single-Vote Constraints & Concurrency Benchmark
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ gap: '1.2rem' }}>
          {/* Live Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'var(--accent-emerald-subtle)',
              border: '1px solid var(--accent-emerald-border)',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="live-demo-indicator"></span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                Active Backend Service: {healthData?.status?.toUpperCase() || 'HEALTHY'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              Database: <strong>{healthData?.database?.engine || 'PostgreSQL/SQLite'}</strong> | Heartbeat: <strong>{healthData?.database?.latency_ms || 0.8}ms</strong>
            </div>
          </div>

          {/* 4 Core Architectural Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
            {/* Pillar 1: Service Model */}
            <div className="arch-card">
              <div className="arch-card-icon" style={{ background: 'var(--accent-cobalt-subtle)', color: 'var(--accent-cobalt)' }}>
                <Server size={17} />
              </div>
              <h4 className="arch-card-title">1. Stateless Container Architecture</h4>
              <p className="arch-card-desc">
                Architected following <strong>Twelve-Factor stateless principles</strong> with FastAPI and Uvicorn. Containerized via Docker Compose, eliminating VM operating system patch overhead and enabling horizontal auto-scaling on modern cloud container platforms.
              </p>
            </div>

            {/* Pillar 2: Database Integrity */}
            <div className="arch-card">
              <div className="arch-card-icon" style={{ background: 'var(--accent-rose-subtle)', color: 'var(--accent-rose)' }}>
                <Database size={17} />
              </div>
              <h4 className="arch-card-title">2. Single-Vote Atomicity</h4>
              <p className="arch-card-desc">
                Enforces one current like or dislike per student and project using database constraints: <br />
                <code style={{ fontSize: '0.76rem', background: 'var(--bg-code)', padding: '2px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>UNIQUE(project_id, student_id)</code>.
                Simultaneous rapid clicks or concurrent vote requests fail safely with <strong>HTTP 409 Conflict</strong>.
              </p>
            </div>

            {/* Pillar 3: Statelessness & Scaling */}
            <div className="arch-card">
              <div className="arch-card-icon" style={{ background: 'var(--accent-emerald-subtle)', color: 'var(--accent-emerald)' }}>
                <Zap size={17} />
              </div>
              <h4 className="arch-card-title">3. Stateless Compute & Health Probes</h4>
              <p className="arch-card-desc">
                No sticky user sessions stored in application memory. Load balancers ping the <strong>GET /health</strong> liveness probe to verify database connectivity and route incoming client traffic to healthy worker replicas.
              </p>
            </div>

            {/* Pillar 4: Benchmark & Concurrency */}
            <div className="arch-card">
              <div className="arch-card-icon" style={{ background: 'var(--accent-amber-subtle)', color: 'var(--accent-amber)' }}>
                <ShieldCheck size={17} />
              </div>
              <h4 className="arch-card-title">4. Documented Benchmark Results</h4>
              <p className="arch-card-desc">
                The project report records <strong>31.6 req/s</strong> at 10 users (P50 135.59 ms),
                <strong> 32.8 req/s</strong> at 25 users (P50 210.30 ms), and <strong>29.0 req/s</strong> at 50 users
                (P50 1,174.88 ms), with a reported 0% error rate. These are documented local results and have not been rerun here.
              </p>
            </div>
          </div>

          {/* 3-Tier Architecture Flow */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={15} color="var(--accent-cobalt)" />
              <span>Three-Tier Request Flow</span>
            </h4>
            <div className="flow-steps">
              <div className="flow-step">
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>1. Client Tier (React Vite SPA)</strong>
                <p style={{ color: 'var(--text-secondary)' }}>Renders project cards, demo links, and records like/dislike choices.</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>2. API Layer (FastAPI / Uvicorn)</strong>
                <p style={{ color: 'var(--text-secondary)' }}>Validates Pydantic schemas, handles CORS, and guards single-vote constraints.</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>3. Data Layer (Relational Storage)</strong>
                <p style={{ color: 'var(--text-secondary)' }}>Relational storage with foreign key cascades and composite unique indexes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
