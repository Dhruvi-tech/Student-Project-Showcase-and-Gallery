import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const PRESET_STACKS = [
  'React',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'FastAPI',
  'Python',
  'Node.js',
  'Express',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'Go',
  'Rust',
  'GraphQL',
  'Prisma',
  'Supabase',
  'Firebase',
  'AWS',
  'Django',
  'Vue.js',
  'Svelte',
  'Java',
  'C++',
];

export function PublishProjectModal({
  currentStudentId,
  students = [],
  onClose,
  onProjectPublished,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [selectedStacks, setSelectedStacks] = useState(['React', 'TypeScript', 'FastAPI']);
  const [customStackInput, setCustomStackInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleStack = (stack) => {
    if (selectedStacks.includes(stack)) {
      setSelectedStacks(selectedStacks.filter((s) => s !== stack));
    } else {
      setSelectedStacks([...selectedStacks, stack]);
    }
  };

  const handleAddCustomStack = (e) => {
    e.preventDefault();
    const clean = customStackInput.trim();
    if (clean && !selectedStacks.includes(clean)) {
      setSelectedStacks([...selectedStacks, clean]);
      setCustomStackInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || title.trim().length < 2) {
      setErrorMessage('Project title is required (minimum 2 characters).');
      return;
    }

    if (githubLink.trim() && !githubLink.startsWith('http://') && !githubLink.startsWith('https://')) {
      setErrorMessage('GitHub Link must start with http:// or https://');
      return;
    }

    if (demoUrl.trim() && !demoUrl.startsWith('http://') && !demoUrl.startsWith('https://')) {
      setErrorMessage('Demo URL must start with http:// or https://');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      github_link: githubLink.trim() || null,
      demo_url: demoUrl.trim() || null,
      tech_stacks: selectedStacks,
      student_id: currentStudentId,
    };

    try {
      setLoading(true);
      const createdProject = await api.publishProject(payload, currentStudentId);
      onProjectPublished(createdProject);
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStudent = students.find((s) => s.id === currentStudentId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container publish-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Publish Student Project
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Author: <strong>{currentStudent ? currentStudent.name : 'Active Student'}</strong>
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form className="publish-project-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div style={{ background: 'var(--accent-rose-subtle)', border: '1px solid var(--accent-rose-border)', color: 'var(--accent-rose)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
                <AlertCircle size={15} color="var(--accent-rose)" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label htmlFor="proj-title" className="form-label">Project Title *</label>
              <input
                id="proj-title"
                className="form-input"
                type="text"
                placeholder="e.g. Distributed Task Orchestrator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="proj-desc" className="form-label">Project Overview & Objectives</label>
              <textarea
                id="proj-desc"
                className="form-textarea"
                rows={3}
                placeholder="Explain the problem domain, full-stack architecture, and key features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {2000 - description.length} characters remaining
              </span>
            </div>

            {/* GitHub & Demo Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              <div className="form-group">
                <label htmlFor="proj-github" className="form-label">GitHub Repository URL</label>
                <input
                  id="proj-github"
                  className="form-input"
                  type="url"
                  placeholder="https://github.com/student/project"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="proj-demo" className="form-label">Live Demo Website URL</label>
                <input
                  id="proj-demo"
                  className="form-input"
                  type="url"
                  placeholder="https://project-demo.example.com"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Tech Stack Selector */}
            <div className="form-group">
              <label className="form-label">Technology Stacks</label>
              <div className="tech-selector-grid">
                {PRESET_STACKS.map((stack) => (
                  <button
                    type="button"
                    key={stack}
                    className={`tech-toggle-chip ${selectedStacks.includes(stack) ? 'selected' : ''}`}
                    onClick={() => toggleStack(stack)}
                  >
                    {selectedStacks.includes(stack) ? '✓ ' : '+ '}
                    {stack}
                  </button>
                ))}
              </div>

              {/* Add Custom Stack */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add custom tech stack..."
                  value={customStackInput}
                  onChange={(e) => setCustomStackInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddCustomStack}
                  disabled={!customStackInput.trim()}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Plus size={15} />
              <span>{loading ? 'Publishing...' : 'Publish Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
