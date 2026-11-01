import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Printer,
  ShieldAlert,
} from 'lucide-react';

// Domain-specific viva question generator
function getVivaQuestionsForProject(project) {
  const cat = project?.category || '';
  const stacks = (project?.tech_stacks || []).map((s) => s.toLowerCase());

  const genericQuestions = [
    {
      q: 'What architectural trade-offs did you make when selecting this technology stack over alternative frameworks?',
      hint: 'Discuss latency, ecosystem maturity, developer productivity, and scalability.',
      answer: `We selected ${(project?.tech_stacks || []).slice(0, 3).join(', ')} because it provided an optimal balance between rapid iteration, robust ecosystem libraries, and verifiable local execution without recurring cloud cost overhead.`,
    },
    {
      q: 'How does your application handle data validation, edge cases, and unexpected runtime errors?',
      hint: 'Mention client-side validation, server-side schemas, error boundaries, and defensive programming.',
      answer: 'All external inputs are strictly validated at the API boundary using structured schemas. Edge cases such as missing parameters or network disconnections trigger graceful error states without crashing the service.',
    },
    {
      q: 'Explain the security posture of your project, including session integrity and authentication flow.',
      hint: 'Highlight PBKDF2 password hashing, signed session cookies, CSRF protection, and zero hardcoded secrets.',
      answer: 'User credentials are protected using salted PBKDF2 hashing. Sessions use HTTP-only signed cookies paired with cryptographically secure CSRF tokens, adhering to OWASP security guidelines.',
    },
    {
      q: 'How would you horizontally scale this system to support 10,000+ concurrent active students?',
      hint: 'Explain stateless API tier, database connection pooling, read replicas, and caching.',
      answer: 'Because the compute layer is stateless, application containers can scale horizontally behind a load balancer. We would migrate local SQLite persistence to an Amazon Aurora/RDS PostgreSQL cluster with read replicas and Redis caching.',
    },
    {
      q: 'What was the most challenging technical roadblock during implementation, and how did you resolve it?',
      hint: 'Share a concrete engineering challenge, your debugging methodology, and the verified resolution.',
      answer: 'Managing cross-origin session synchronization and state consistency between the React frontend and asynchronous backend was challenging. We resolved this by standardizing cookie exchange headers, introducing defensive state fallbacks, and adding rigorous unit test suites.',
    },
  ];

  if (cat.includes('AI') || cat.includes('Machine Learning') || cat.includes('Vision') || stacks.some((s) => s.includes('torch') || s.includes('tensor'))) {
    genericQuestions[0] = {
      q: 'How do you evaluate model generalization and prevent overfitting on your training data?',
      hint: 'Mention k-fold cross validation, dropout/regularization, loss curves, and test set separation.',
      answer: 'We split datasets into strict training, validation, and holdout test partitions. We monitor validation loss across training epochs and employ early stopping and regularization to prevent overfitting.',
    };
    genericQuestions[1] = {
      q: 'What is the computational inference latency of your model, and how can it be optimized for production?',
      hint: 'Discuss model quantization (FP16/INT8), ONNX runtime export, batch inference, or pruning.',
      answer: 'Inference latency was profiled per request. To optimize for deployment, we can quantize model weights from FP32 to INT8 and leverage ONNX Runtime or TensorRT for low-latency batch serving.',
    };
  } else if (cat.includes('Cloud') || cat.includes('DevOps') || stacks.some((s) => s.includes('docker') || s.includes('aws') || s.includes('kube'))) {
    genericQuestions[0] = {
      q: 'How does your deployment satisfy the Twelve-Factor App methodology for cloud-native applications?',
      hint: 'Address environment variables for configuration, stateless processes, port binding, and disposable containers.',
      answer: 'The system conforms to the Twelve-Factor standard: configuration is injected strictly via environment variables, compute processes are completely stateless, and dependencies are isolated via Docker containers.',
    };
    genericQuestions[1] = {
      q: 'Explain your strategy for cloud cost control and adhering to the ₹0 budget policy.',
      hint: 'Explain why public AWS resources remain unprovisioned until account credits and IAM gates are approved.',
      answer: 'We maintain a strict ₹0 cloud policy by utilizing verified local Docker containers and SQLite for evaluation. CloudFormation templates and least-privilege IAM policies are prepared and validated without incurring billable AWS resource charges.',
    };
  }

  return genericQuestions;
}

export function VivaDefenseModal({ project, onClose }) {
  if (!project) return null;

  // 10-Minute Presentation Timer
  const TOTAL_SECONDS = 600; // 10 minutes
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [checklist, setChecklist] = useState({
    problem: true,
    architecture: false,
    demo: false,
    verification: false,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const questions = useMemo(() => getVivaQuestionsForProject(project), [project]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100;

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_SECONDS);
  };

  const toggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyNotes = () => {
    const qText = questions.map((q, idx) => `Q${idx + 1}: ${q.q}\nKey Hint: ${q.hint}\nModel Answer: ${q.answer}\n`).join('\n');
    const fullText = `# Oral Viva Defense Sheet: ${project.title}
Author: ${project.author_display_name || project.student_name || 'Student Author'}
Domain: ${project.category || 'Engineering'}
Tech Stacks: ${(project.tech_stacks || []).join(', ')}

=== VIVA EXAMINATION QUESTIONS & ANSWERS ===
${qText}
Generated by ProjectSpace Oral Viva Defense Simulator.`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }).catch(() => {});
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container viva-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="viva-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '860px', width: '94%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.2rem 1.6rem 0.85rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.28))',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'grid',
              placeItems: 'center',
            }}>
              <Award size={20} />
            </div>
            <div>
              <h3 id="viva-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Capstone Oral Defense &amp; Viva Simulator
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Exam preparation for <strong>{project.title}</strong>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Presentation Timer Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.6rem',
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={18} color="var(--accent-amber)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Oral Defense Presentation Clock
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 850, fontFamily: 'var(--font-mono)', color: timeLeft < 120 ? 'var(--accent-rose)' : 'var(--text-primary)', letterSpacing: '0.02em' }}>
                {timeFormatted}
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: '0.4rem', fontWeight: 500 }}>
                  ({Math.round(progressPct)}% elapsed)
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className={isRunning ? 'btn-secondary' : 'btn-primary'}
              onClick={() => setIsRunning(!isRunning)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{isRunning ? 'Pause Timer' : 'Start 10-Min Defense'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetTimer}
              style={{ padding: '0.4rem 0.65rem' }}
              title="Reset presentation timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.6rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Defense Milestones Self-Check */}
          <div style={{ padding: '0.9rem 1.15rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-primary)' }}>
              Oral Presentation Milestones Checklist
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
              {[
                { key: 'problem', label: '1. Problem & Motivation' },
                { key: 'architecture', label: '2. System Design & Stack' },
                { key: 'demo', label: '3. Live Working Demo' },
                { key: 'verification', label: '4. Testing & Cloud Policy' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleChecklist(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.75rem',
                    background: checklist[key] ? 'var(--accent-emerald-subtle)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${checklist[key] ? 'var(--accent-emerald-border)' : 'var(--border-subtle)'}`,
                    color: checklist[key] ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    borderRadius: '7px',
                    fontSize: '0.8rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <CheckCircle2 size={14} fill={checklist[key] ? 'currentColor' : 'none'} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5 Tailored Viva Defense Questions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 750, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HelpCircle size={16} color="var(--accent-cobalt)" />
                <span>Domain-Tailored Examiner Viva Questions &amp; Model Answers</span>
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Track: {project.category || 'General'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {questions.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1.15rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          background: 'var(--accent-cobalt)',
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4, display: 'block' }}>
                            {item.q}
                          </strong>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                            Key Hint: {item.hint}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-muted)', paddingTop: '2px' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '0.85rem 1.15rem 1rem 3.2rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
                          Model Examiner Defense Answer:
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                          "{item.answer}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '0.85rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyNotes}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
            title="Copy defense questions and talking points to clipboard"
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            <span>{copied ? 'Viva Notes Copied!' : 'Copy Viva Study Sheet'}</span>
          </button>

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}