import React from 'react';
import { ExternalLink, Trophy, ArrowRight, Bookmark } from 'lucide-react';
import { VoteControls } from './VoteControls';

const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export function FeaturedSpotlight({ project, onVote, onOpenDetails, isUpvoting, onToggleBookmark }) {
  if (!project) return null;

  return (
    <section className="featured-spotlight-section">
      <div className="featured-card">
        <div className="featured-content">
          {/* Header Badges */}
          <div className="featured-header-pill">
            <span className="trophy-badge">
              <Trophy size={13} />
              <span>Rank #1 Community Choice</span>
            </span>
            <span className="featured-tag">
              <span>Top-ranked community project</span>
            </span>
          </div>

          {/* Project Title & Author */}
          <h2 className="featured-title"><button className="featured-title-button" onClick={() => onOpenDetails(project)}>{project.title}<span className="sr-only"> — open project details</span></button></h2>

          <p className="featured-author-text">
            By <strong>{project.author_display_name || project.student_name || 'Student Developer'}</strong>
          </p>

          {/* Project Description */}
          <p className="featured-desc">
            {project.description}
          </p>

          {/* Tech Stacks */}
          <div className="featured-tech-row">
            {(project.tech_stacks || []).map((tech, i) => (
              <span key={i} className="featured-tech-pill">
                {tech}
              </span>
            ))}
          </div>

          {/* Project site + GitHub + vote + details */}
          <div className="featured-actions">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="featured-btn-live"
                title={`Open project website: ${project.demo_url}`}
              >
                <span className="live-site-indicator"></span>
                <span>Visit website ({project.demo_url.replace(/^https?:\/\//, '')})</span>
                <ExternalLink size={14} />
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
                <GithubIcon size={15} />
                <span>GitHub Repository</span>
              </a>
            )}

            <VoteControls project={project} onVote={onVote} isVoting={isUpvoting} />
            <button className={`bookmark-button ${project.is_saved ? 'is-saved' : ''}`} onClick={() => onToggleBookmark?.(project)} aria-pressed={Boolean(project.is_saved)} aria-label={project.is_saved ? 'Remove saved project' : 'Save project'}><Bookmark size={15} fill={project.is_saved ? 'currentColor' : 'none'} />{project.is_saved ? 'Saved' : 'Save project'}</button>

            <button
              className="featured-btn-details"
              onClick={() => onOpenDetails(project)}
            >
              <span>View Details & Peer Comments</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
