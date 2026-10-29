import React, { useState } from 'react';
import { X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { COMMON_TECH_STACKS, PROJECT_CATEGORIES } from '../constants/catalog';

const PRESET_STACKS = COMMON_TECH_STACKS.filter((stack) => stack !== 'All');

export function PublishProjectModal({
  currentStudentId,
  students = [],
  onClose,
  onProjectPublished,
  initialProject = null,
  onSaved,
}) {
  const [title, setTitle] = useState(initialProject?.title || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [category, setCategory] = useState(initialProject?.category || 'Web Development & Full Stack');
  const [difficulty, setDifficulty] = useState(initialProject?.difficulty || 'Intermediate');
  const [docsUrl, setDocsUrl] = useState(initialProject?.docs_url || '');
  const [githubLink, setGithubLink] = useState(initialProject?.github_link || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialProject?.demo_url || '');
  const [selectedStacks, setSelectedStacks] = useState(initialProject?.tech_stacks || ['React', 'TypeScript', 'FastAPI']);
  const [customStackInput, setCustomStackInput] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [assistant, setAssistant] = useState(null);
  const [assistantLoading, setAssistantLoading] = useState(false);

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

  const handleDescriptionAssist = async () => {
    setAssistantLoading(true);
    setAssistant(null);
    try {
      setAssistant(await api.assistProjectDescription({ title, description, tech_stacks: selectedStacks }));
    } catch (err) {
      setErrorMessage(err.message || 'Writing suggestions are unavailable.');
    } finally {
      setAssistantLoading(false);
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

    if (websiteUrl.trim() && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      setErrorMessage('Website URL must start with http:// or https://');
      return;
    }

    let thumbnailKey = initialProject?.thumbnail_key || null;
    try {
      setLoading(true);
      if (thumbnailFile) {
        const upload = await api.uploadAsset(thumbnailFile, currentStudentId);
        thumbnailKey = upload.thumbnail_key;
      }
    } catch (err) {
      setErrorMessage(err.message || 'Project image upload failed.');
      setLoading(false);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      docs_url: docsUrl.trim() || null,
      github_link: githubLink.trim() || null,
      demo_url: websiteUrl.trim() || null,
      tech_stacks: selectedStacks,
      student_id: currentStudentId,
      thumbnail_key: thumbnailKey,
    };

    try {
      if (initialProject?.id) {
        await api.updateProject(initialProject.id, payload, currentStudentId);
        onSaved?.();
      } else {
        const createdProject = await api.publishProject(payload, currentStudentId);
        onProjectPublished(createdProject);
      }
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
              {initialProject ? 'Edit Project' : 'Publish Student Project'}
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
              <label htmlFor="proj-image" className="form-label">Project thumbnail (optional, JPEG/PNG/GIF/WebP, max 5 MiB)</label>
              <input id="proj-image" className="form-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
              {initialProject?.thumbnail_url && !thumbnailFile && <img className="thumbnail-preview" src={initialProject.thumbnail_url} alt="Current project thumbnail" />}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="proj-category" className="form-label">Primary technology domain *</label>
              <select id="proj-category" className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
                {PROJECT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
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
              <button type="button" className="writing-assist-button" onClick={handleDescriptionAssist} disabled={assistantLoading || title.trim().length < 2}>
                <Sparkles size={14} />{assistantLoading ? 'Finding suggestions…' : 'Suggest category, tags & difficulty'}
              </button>
              {assistant && <div className="assistant-suggestion" role="status">
                <strong>Review these local suggestions</strong>
                <span>{assistant.category ? `Category: ${assistant.category} · ` : ''}Difficulty: ${assistant.difficulty} · Tags: {assistant.tech_stacks.join(', ') || 'No additional tags detected'}</span>
                <small>{assistant.notes}</small>
                <button type="button" className="btn-secondary" onClick={() => { if (assistant.category) setCategory(assistant.category); setDifficulty(assistant.difficulty); setSelectedStacks(assistant.tech_stacks); }}>Apply suggestions</button>
              </div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              <div className="form-group">
                <label htmlFor="proj-difficulty" className="form-label">Difficulty</label>
                <select id="proj-difficulty" className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="proj-docs" className="form-label">Documentation URL (optional)</label>
                <input id="proj-docs" className="form-input" type="url" placeholder="https://…" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} />
              </div>
            </div>

            {/* Repository and website links */}
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
                <label htmlFor="proj-website" className="form-label">Project Website URL</label>
                <input
                  id="proj-website"
                  className="form-input"
                  type="url"
                  placeholder="https://your-project.example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
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
              <span>{loading ? (initialProject ? 'Saving...' : 'Publishing...') : (initialProject ? 'Save Changes' : 'Publish Project')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
