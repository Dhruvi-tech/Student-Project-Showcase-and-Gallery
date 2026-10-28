import React from 'react';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { VoteControls } from './VoteControls';

const GithubIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const AVATAR_COLORS = [
  '#2563eb', // cobalt
  '#4f46e5', // indigo
  '#0d9488', // teal
  '#059669', // emerald
  '#d97706', // amber
  '#e11d48', // rose
  '#7c3aed', // violet
];

function getInitials(name) {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function ProjectCard({
  project,
  onVote,
  onOpenDetails,
  isUpvoting = false,
  index = 0,
}) {

  const formattedDate = new Date(project.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const studentName = project.student_name || 'Student Developer';
  const initials = getInitials(studentName);
  const avatarBg = getAvatarColor(studentName);

  return (
    <article className="project-card">
      {/* Card Header: Title & Upvote Button */}
      <div className="card-header">
        <div className="card-title-group">
          <h3 className="card-title" onClick={() => onOpenDetails(project)}>
            {project.title}
          </h3>

          {/* Student Author Pill */}
          <div className="card-author-pill">
            <div className="avatar-circle" style={{ backgroundColor: avatarBg }}>
              {initials}
            </div>
            <span style={{ fontWeight: 600 }}>Demo · {studentName}</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{formattedDate}</span>
          </div>
        </div>

      </div>

      {/* Description */}
      <p className="card-description" onClick={() => onOpenDetails(project)}>
        {project.description || 'No description provided.'}
      </p>

      {/* Prominent project demo link */}
      {project.demo_url && (
        <div style={{ marginBottom: '0.85rem' }}>
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="live-demo-banner"
            title={`Open demo site: ${project.demo_url}`}
          >
            <span className="live-demo-indicator"></span>
            <span style={{ fontWeight: 600 }}>Demo site:</span>
            <span className="live-demo-url-text">{project.demo_url.replace(/^https?:\/\//, '')}</span>
            <ExternalLink size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </a>
        </div>
      )}

      {/* Tech Stack Badges */}
      <div className="card-tech-stacks">
        {(project.tech_stacks || []).map((tech, idx) => (
          <span key={idx} className="tech-badge">
            {tech}
          </span>
        ))}
      </div>

      <div className="card-vote-row">
        <VoteControls project={project} onVote={onVote} isVoting={isUpvoting} />
        <button className="comments-badge" onClick={() => onOpenDetails(project)} title="View peer feedback and post comments">
          <MessageSquare size={14} />
          <span>{project.comment_count || 0} comments</span>
        </button>
      </div>

      {/* Card Footer: GitHub Link, Live Demo URL, Comments Counter */}
      <div className="card-footer">
        <div className="card-links">
          {project.github_link && (
            <a
              href={project.github_link}
              target="_blank"
              rel="noopener noreferrer"
              className="card-link-item"
              title="View GitHub Repository"
            >
              <GithubIcon size={14} />
              <span>Source</span>
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-link-item"
              title="Visit Live Application Website"
            >
              <ExternalLink size={13} />
              <span>Demo</span>
            </a>
          )}
        </div>

      </div>
    </article>
  );
}
