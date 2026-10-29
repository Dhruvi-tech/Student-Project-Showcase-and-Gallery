import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Send, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { VoteControls } from './VoteControls';

const GithubIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export function ProjectDetailsModal({
  project,
  currentStudentId,
  students = [],
  onClose,
  onVote,
  isVoting,
  onCommentAdded,
  currentUser,
  onEdit,
  onDelete,
}) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [feedbackType, setFeedbackType] = useState('positive');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentStudent = students.find((s) => s.id === currentStudentId);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      try {
        setLoading(true);
        const data = await api.getProjectDetails(project.id, currentStudentId);
        if (isMounted) setDetails(data);
      } catch (err) {
        if (isMounted) setErrorMsg(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [project.id, currentStudentId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      setErrorMsg('');
      const newComment = await api.addComment(
        project.id,
        {
          content: commentText.trim(),
          feedback_type: feedbackType,
          author_name: currentStudent ? currentStudent.name : 'Peer Reviewer',
        },
        currentStudentId
      );

      // Prepend to local comments list
      setDetails((prev) => ({
        ...prev,
        comments: [newComment, ...(prev?.comments || [])],
        comment_count: (prev?.comment_count || 0) + 1,
      }));
      setCommentText('');
      setFeedbackType('positive');
      if (onCommentAdded) onCommentAdded(project.id);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleVote = async (projectId, direction) => {
    const result = await onVote(projectId, direction);
    if (!result) return;
    setDetails((prev) => ({
      ...(prev || project),
      upvote_count: result.upvote_count,
      downvote_count: result.downvote_count,
      has_voted: result.user_vote === 'up',
      has_liked: result.user_vote === 'up',
      has_disliked: result.user_vote === 'down',
      user_vote: result.user_vote,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
              {project.title}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              By <strong>{details?.author_display_name || project.author_display_name || project.student_name || 'Student Creator'}</strong>{(details?.author_profile_url || project.author_profile_url)?.startsWith('https://') && <a className="profile-source-link" href={details?.author_profile_url || project.author_profile_url} target="_blank" rel="noopener noreferrer">Author profile</a>}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Quick Actions Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="featured-btn-live"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem' }}
                  title={`Open project website: ${project.demo_url}`}
                >
                  <span className="live-site-indicator"></span>
                  <span>Visit website ({project.demo_url.replace(/^https?:\/\//, '')})</span>
                  <ExternalLink size={13} />
                </a>
              )}
              {project.github_link && (
                <a
                  href={project.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  title="View GitHub Repository"
                >
                  <GithubIcon size={14} />
                  <span>GitHub Repository</span>
                </a>
              )}
              {(details?.docs_url || project.docs_url) && <a href={details?.docs_url || project.docs_url} target="_blank" rel="noopener noreferrer" className="btn-secondary"><ExternalLink size={14} /><span>Documentation</span></a>}
            </div>

            <VoteControls project={{ ...project, ...details }} onVote={handleVote} isVoting={isVoting} />
              {currentUser?.id === (details?.student_id || project.student_id) && (
                <div className="owner-actions">
                  <button className="btn-secondary" onClick={() => onEdit?.({ ...project, ...details })}>Edit</button>
                  <button className="btn-secondary owner-delete" onClick={() => {
                    if (window.confirm('Delete this project and its comments and votes?')) onDelete?.(project);
                  }}>Delete</button>
                </div>
              )}
          </div>

          {/* Description Section */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em', fontWeight: 600 }}>
              Project Overview
            </h4>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {details?.description || project.description || 'No description provided.'}
            </p>
          </div>

          {/* Tech Stacks */}
          <div>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em', fontWeight: 600 }}>
              Primary domain
            </h4>
            <span className="tech-badge">{details?.category || project.category || 'Other'}</span>
            <span className="tech-badge difficulty-badge">{details?.difficulty || project.difficulty || 'Intermediate'}</span>
          </div>
          <div>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em', fontWeight: 600 }}>
              Technology Stack
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {(project.tech_stacks || []).map((t, idx) => (
                <span key={idx} className="tech-badge">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Comments / Peer Feedback Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ fontSize: '0.96rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <MessageSquare size={16} color="var(--accent-cobalt)" />
              <span>Peer Feedback & Reviews ({details?.comments?.length ?? project.comment_count ?? 0})</span>
            </h4>

            {/* Post Comment Form */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="feedback-type-picker" role="group" aria-label="Feedback type">
                <button type="button" className={feedbackType === 'positive' ? 'active' : ''} onClick={() => setFeedbackType('positive')}>Positive</button>
                <button type="button" className={feedbackType === 'improvement' ? 'active' : ''} onClick={() => setFeedbackType('improvement')}>Improvement</button>
              </div>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder={feedbackType === 'positive'
                  ? `What works well in ${project.title}? Mention a specific feature, design choice, or detail...`
                  : `What could be improved in ${project.title}? Share a specific, constructive suggestion...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={1000}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {1000 - commentText.length} characters remaining
                </span>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingComment || !commentText.trim()}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                >
                  <Send size={13} />
                  <span>{submittingComment ? 'Posting...' : 'Post Feedback'}</span>
                </button>
              </div>
            </form>

            {errorMsg && (
              <div style={{ color: 'var(--accent-rose)', fontSize: '0.82rem', background: 'var(--accent-rose-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-rose-border)' }}>
                {errorMsg}
              </div>
            )}

            {/* Comments List */}
            {loading ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto 0.5rem', width: 24, height: 24 }}></div>
                Loading feedback history...
              </div>
            ) : details?.comments?.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                No peer comments yet. Be the first student to review this project!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(details?.comments || []).map((c) => (
                  <div key={c.id} className="comment-card">
                    <div className="comment-card-header">
                      <span className="comment-author-name">{c.author_name || 'Anonymous Peer'}</span>
                      {c.feedback_type && <span className={`feedback-type-badge ${c.feedback_type}`}>{c.feedback_type === 'positive' ? 'Positive' : 'Improvement'}</span>}
                      <span className="comment-time">
                        {new Date(c.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="comment-body">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
