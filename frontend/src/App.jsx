import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { FeaturedSpotlight } from './components/FeaturedSpotlight';
import { ProjectDetailsModal } from './components/ProjectDetailsModal';
import { PublishProjectModal } from './components/PublishProjectModal';
import { ExplainArchitectureModal } from './components/ExplainArchitectureModal';
import { api } from './services/api';
import './styles/App.css';
import { Terminal, FolderSearch, AlertTriangle, CheckCircle } from 'lucide-react';

export function App() {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme state: warm neutral light (default) or polished slate dark
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('All');
  const [sortOption, setSortOption] = useState('upvotes');

  // Development Identity Personas
  const [students, setStudents] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState('');

  // Modals & Active View
  const [activeProject, setActiveProject] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [votingIds, setVotingIds] = useState(new Set());

  // Health and System State
  const [healthData, setHealthData] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync theme attribute to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3600);
  };

  // Initial Boot: Load Students and Health
  useEffect(() => {
    async function initSystem() {
      try {
        const [health, studentsList] = await Promise.allSettled([
          api.getHealth(),
          api.getStudents(),
        ]);

        if (health.status === 'fulfilled') {
          setHealthData(health.value);
        }

        if (studentsList.status === 'fulfilled' && studentsList.value.length > 0) {
          setStudents(studentsList.value);
          setCurrentStudentId(studentsList.value[0].id);
        }
      } catch (err) {
        console.error('System initialization error:', err);
      }
    }
    initSystem();
  }, []);

  // Fetch Projects Callback
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProjects({
        sort: sortOption,
        techStack: selectedTech,
        search: searchQuery,
        studentId: currentStudentId,
      });
      setProjects(res.data || []);
      setTotalCount(res.total ?? (res.data ? res.data.length : 0));
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [sortOption, selectedTech, searchQuery, currentStudentId]);

  // Refetch when filters or identity change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  // A demo identity can cast one vote per project and switch between like/dislike.
  const handleVote = async (projectId, direction) => {
    if (!currentStudentId) {
      showToast('The demo voting identity is loading. Try again in a moment.', 'error');
      return null;
    }

    setVotingIds((prev) => new Set(prev).add(projectId));

    try {
      const result = direction === null
        ? await api.removeVote(projectId, currentStudentId)
        : direction === 'down'
          ? await api.downvoteProject(projectId, currentStudentId)
          : await api.upvoteProject(projectId, currentStudentId);
      const vote = Object.prototype.hasOwnProperty.call(result, 'user_vote') ? result.user_vote : direction;
      const applyVote = (project) => ({
        ...project,
        upvote_count: result.upvote_count,
        downvote_count: result.downvote_count ?? project.downvote_count ?? 0,
        has_voted: vote === 'up',
        has_liked: vote === 'up',
        has_disliked: vote === 'down',
        user_vote: vote,
      });

      setProjects((prev) => prev.map((project) => project.id === projectId ? applyVote(project) : project));
      if (activeProject && activeProject.id === projectId) {
        setActiveProject((prev) => applyVote(prev));
      }
      showToast(vote === 'up' ? 'You liked this project.' : vote === 'down' ? 'You disliked this project.' : 'Your vote was removed.', 'success');
      return { ...result, user_vote: vote };
    } catch (err) {
      showToast(err.message || 'Your vote could not be saved.', 'error');
      return null;
    } finally {
      setVotingIds((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  const handleProjectPublished = (newProject) => {
    showToast(`Project "${newProject.title}" published successfully!`, 'success');
    loadProjects();
  };

  const handleCommentAdded = () => {
    showToast('Feedback comment added successfully!', 'success');
    loadProjects();
  };

  // Top featured spotlight project (Rank #1 or first item)
  const spotlightProject = sortOption === 'upvotes' && projects.length > 0 ? projects[0] : null;
  const showSpotlight = !loading && !error && !searchQuery && selectedTech === 'All' && spotlightProject;

  return (
    <div className="app-layout">
      {/* Navigation Header */}
      <Navbar
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenExplainModal={() => setIsExplainModalOpen(true)}
        healthData={healthData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-copy">
            <div className="hero-tag">
              <Terminal size={13} />
              <span>Student Project Gallery</span>
            </div>
            <h2 className="hero-title">Builds worth sharing.<br />Feedback that helps them grow.</h2>
            <p className="hero-subtitle">
              Explore student work, open the source, and leave a thoughtful vote or comment.
              Publish your own project when it is ready to share.
            </p>
            <p className="demo-data-note">Demo mode: sample profiles, votes, and comments. Votes can be switched later.</p>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Featured Spotlight Card */}
        {showSpotlight && (
          <FeaturedSpotlight
            project={spotlightProject}
            onVote={handleVote}
            onOpenDetails={(p) => setActiveProject(p)}
            isUpvoting={votingIds.has(spotlightProject.id)}
          />
        )}

        {/* Search, Filter, Sort Controls */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTech={selectedTech}
          onTechChange={setSelectedTech}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalCount={totalCount}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="state-box">
            <div className="spinner"></div>
            <h3 className="state-title">Loading Projects Gallery</h3>
            <p className="state-desc">Fetching ranked student projects from the API...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-box">
            <AlertTriangle size={36} color="var(--accent-rose)" />
            <h3 className="state-title">Unable to Connect to Backend API</h3>
            <p className="state-desc">{error}</p>
            <button className="btn-primary" onClick={loadProjects} style={{ marginTop: '0.8rem' }}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className="state-box">
            <FolderSearch size={38} color="var(--text-muted)" />
            <h3 className="state-title">No Projects Found</h3>
            <p className="state-desc">
              {searchQuery || selectedTech !== 'All'
                ? `No projects matched "${searchQuery || selectedTech}". Try clearing filters.`
                : 'The showcase gallery is currently empty. Be the first to publish a project!'}
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedTech('All');
              }}
              style={{ marginTop: '0.8rem' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && projects.length > 0 && (
          <>
            {showSpotlight && <div className="gallery-section-heading">
              <div><h2>More projects</h2><p>{Math.max(0, totalCount - 1)} additional projects in the gallery</p></div>
            </div>}
            <div className="projects-grid">
            {projects.filter((project) => !showSpotlight || project.id !== spotlightProject.id).map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
                onVote={handleVote}
                onOpenDetails={(p) => setActiveProject(p)}
                isUpvoting={votingIds.has(project.id)}
              />
            ))}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {activeProject && (
        <ProjectDetailsModal
          project={activeProject}
          currentStudentId={currentStudentId}
          students={students}
          onClose={() => setActiveProject(null)}
          onVote={handleVote}
          isVoting={votingIds.has(activeProject.id)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {isPublishModalOpen && (
        <PublishProjectModal
          currentStudentId={currentStudentId}
          students={students}
          onClose={() => setIsPublishModalOpen(false)}
          onProjectPublished={handleProjectPublished}
        />
      )}

      {isExplainModalOpen && (
        <ExplainArchitectureModal
          healthData={healthData}
          onClose={() => setIsExplainModalOpen(false)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle size={16} color="var(--accent-emerald)" />
          ) : (
            <AlertTriangle size={16} color="var(--accent-rose)" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <strong>Student Project Showcase & Peer Gallery</strong>
            <span>Peer-to-Peer Engineering Platform & Open-Source Community</span>
          </div>
          <div className="footer-links">
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer">
              REST API Docs
            </a>
            <a href="http://127.0.0.1:8000/redoc" target="_blank" rel="noopener noreferrer">
              API Specifications
            </a>
            <a href="http://127.0.0.1:8000/health" target="_blank" rel="noopener noreferrer">
              System Health
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
