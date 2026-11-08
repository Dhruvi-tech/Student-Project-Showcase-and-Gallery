import React, { useState, useEffect } from 'react';
import { X, Search, ExternalLink, Star, GitFork, Plus, Check, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export function ExploreGithubModal({ onClose, onSelectRepo }) {
  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'search'
  const [usernameInput, setUsernameInput] = useState('Dhruvi-tech');
  const [searchQuery, setSearchQuery] = useState('student capstone');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load: fetch user repos
  useEffect(() => {
    fetchUserRepos(usernameInput);
  }, []);

  const fetchUserRepos = async (user) => {
    if (!user.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getGitHubUserRepos(user.trim());
      setRepos(res.data || []);
      if (!res.data?.length) {
        setError(`No public repositories found for user '${user}'.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch repositories from GitHub.');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchRepos = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.searchGitHubRepos(searchQuery.trim());
      setRepos(res.data || []);
      if (!res.data?.length) {
        setError(`No GitHub repositories matched '${searchQuery}'.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to search GitHub.');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    fetchUserRepos(usernameInput);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '820px', width: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'var(--card-bg, #1e293b)',
                border: '1px solid var(--border-color, #334155)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GithubIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Connect &amp; Import from GitHub
              </h3>
              <p style={{ fontSize: '0.78rem', margin: 0, color: 'var(--text-secondary)' }}>
                Explore open-source repositories and showcase them on the peer gallery with one click
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem 0.25rem',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
          }}
        >
          <button
            className={`tech-pill ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('user');
              fetchUserRepos(usernameInput);
            }}
            style={{ borderRadius: '6px', padding: '0.35rem 0.8rem' }}
          >
            👤 Browse by GitHub User / Org
          </button>
          <button
            className={`tech-pill ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('search');
              handleSearchRepos();
            }}
            style={{ borderRadius: '6px', padding: '0.35rem 0.8rem' }}
          >
            🔍 Search GitHub Repositories
          </button>
        </div>

        {/* Input Bar */}
        <div style={{ padding: '0.75rem 1.25rem 0.5rem' }}>
          {activeTab === 'user' ? (
            <form onSubmit={handleUserSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="search-box" style={{ flex: 1 }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter GitHub username (e.g. Dhruvi-tech, torvalds, facebook)..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                {loading ? 'Loading...' : 'Fetch Repos'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSearchRepos} style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="search-box" style={{ flex: 1 }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search GitHub repositories (e.g. student capstone, vision ai, web app)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              margin: '0.5rem 1.25rem',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '0.84rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Repositories List */}
        <div
          className="modal-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem 1.25rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '0.85rem',
          }}
        >
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
              <Loader2 size={28} className="spin" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
              <span>Fetching live repositories from GitHub...</span>
            </div>
          ) : repos.length === 0 && !error ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
              <span>No repositories to display. Try searching for another user or topic.</span>
            </div>
          ) : (
            repos.map((repo) => (
              <div
                key={repo.github_link}
                style={{
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  background: 'var(--card-bg, #ffffff)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                      {repo.author_avatar_url ? (
                        <img
                          src={repo.author_avatar_url}
                          alt={repo.author_display_name || 'avatar'}
                          style={{ width: 20, height: 20, borderRadius: '50%' }}
                        />
                      ) : (
                        <GithubIcon size={16} />
                      )}
                      <h4
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          margin: 0,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={repo.title}
                      >
                        {repo.title}
                      </h4>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      {repo.stars || 0}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.35rem',
                      marginBottom: '0.5rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {repo.description || 'No description available for this repository.'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(79, 70, 229, 0.1)',
                        color: 'var(--accent-primary, #4f46e5)',
                        fontWeight: 600,
                      }}
                    >
                      {repo.suggested_category || 'Open Source'}
                    </span>
                    {(repo.tech_stacks || []).slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: 'var(--border-color, #f1f5f9)',
                          color: 'var(--text-secondary, #475569)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-color, #e2e8f0)',
                  }}
                >
                  <a
                    href={repo.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    <span>View GitHub</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    className="btn-primary"
                    onClick={() => {
                      onSelectRepo?.(repo);
                      onClose();
                    }}
                    style={{
                      fontSize: '0.76rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Plus size={13} />
                    <span>Showcase This</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            💡 Projects imported from GitHub are automatically credited to the repository author with live source links.
          </span>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
