import React, { useEffect, useState } from 'react';
import { X, ExternalLink, FolderOpen } from 'lucide-react';
import { api } from '../services/api';

export function AuthorProfileModal({ studentId, onClose, onOpenProject }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.getStudentProfile(studentId).then((data) => { if (active) setProfile(data); })
      .catch((err) => { if (active) setError(err.message || 'Could not load this profile.'); });
    return () => { active = false; };
  }, [studentId]);

  return <div className="modal-overlay" onClick={onClose}>
    <section className="modal-container author-profile-modal" role="dialog" aria-modal="true" aria-labelledby="author-profile-title" onClick={(event) => event.stopPropagation()}>
      <header className="modal-header">
        <div><span className="eyebrow">ProjectSpace member</span><h2 id="author-profile-title">{profile?.name || (error ? 'Profile unavailable' : 'Loading profile…')}</h2>{profile?.username && <span className="profile-handle">@{profile.username}</span>}</div>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close profile"><X size={18} /></button>
      </header>
      <div className="modal-body">
        {error ? <p className="auth-error">{error}</p> : profile && <>
          <p className="profile-bio">{profile.bio || 'This member has not added a bio yet.'}</p>
          {!!profile.interests?.length && <div className="profile-interest-list"><strong>Interests</strong><div>{profile.interests.map((interest) => <span className="tech-badge" key={interest}>{interest}</span>)}</div></div>}
          <div className="profile-projects-heading"><FolderOpen size={16} /><strong>Published projects ({profile.projects.length})</strong></div>
          {profile.projects.length ? <ul className="profile-project-list">{profile.projects.map((project) => <li key={project.id}><button onClick={() => onOpenProject(project.id)}>{project.title}<span>{project.category}</span></button>{project.github_link && <a href={project.github_link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} source`}><ExternalLink size={14} /></a>}</li>)}</ul> : <p className="state-desc">No published projects yet.</p>}
        </>}
      </div>
    </section>
  </div>;
}
