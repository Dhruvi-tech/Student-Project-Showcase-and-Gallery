import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { FeaturedSpotlight } from './components/FeaturedSpotlight';
import { ProjectDetailsModal } from './components/ProjectDetailsModal';
import { PublishProjectModal } from './components/PublishProjectModal';
import { ExplainArchitectureModal } from './components/ExplainArchitectureModal';
import { AuthModal } from './components/AuthModal';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { ProfileEditModal } from './components/ProfileEditModal';
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('upvotes');

  // Development Identity Personas
  const [students, setStudents] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [myProjectsMode, setMyProjectsMode] = useState(false);
  const [savedProjectsMode, setSavedProjectsMode] = useState(false);
  const [recommendationsMode, setRecommendationsMode] = useState(false);
  const [followedCategories, setFollowedCategories] = useState([]);
  const [interests, setInterests] = useState([]);
  const [technologyCatalog, setTechnologyCatalog] = useState([]);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

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
        const [health, studentsList, userResult, technologyResult] = await Promise.allSettled([
          api.getHealth(),
          api.getStudents(),
          api.getCurrentUser(),
          api.getTechnologies(),
        ]);

        if (health.status === 'fulfilled') {
          setHealthData(health.value);
        }
        if (technologyResult.status === 'fulfilled') setTechnologyCatalog(technologyResult.value.data || []);

        if (studentsList.status === 'fulfilled' && studentsList.value.length > 0) {
          setStudents(studentsList.value);
          setCurrentStudentId(studentsList.value[0].id);
          const [follows, profileInterests] = await Promise.allSettled([
            api.getFollowedCategories(studentsList.value[0].id), api.getInterests(studentsList.value[0].id),
          ]);
          if (follows.status === 'fulfilled') setFollowedCategories(follows.value.data || []);
          if (profileInterests.status === 'fulfilled') setInterests(profileInterests.value.data || []);
        }
        if (userResult.status === 'fulfilled' && userResult.value?.user) {
          setCurrentUser(userResult.value.user);
          setCurrentStudentId(userResult.value.user.id);
          setInterests(userResult.value.user.interests || []);
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
      const res = myProjectsMode
        ? await api.getMyProjects()
        : savedProjectsMode
          ? await api.getBookmarks(currentStudentId)
          : recommendationsMode
            ? await api.getRecommendations(currentStudentId)
        : await api.getProjects({
        sort: sortOption,
        category: selectedCategory,
        search: searchQuery,
        studentId: currentStudentId,
        limit: 200,
        offset: 0,
        });
      setProjects(res.data || []);
      setTotalCount(res.total ?? (res.data ? res.data.length : 0));
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [sortOption, selectedCategory, searchQuery, currentStudentId, myProjectsMode, savedProjectsMode, recommendationsMode]);

  // Refetch when filters or identity change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  // The current profile can cast one vote per project and switch between like/dislike.
  const handleVote = async (projectId, direction) => {
    if (!currentStudentId) {
      showToast('Your profile is loading. Try again in a moment.', 'error');
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
    api.getTechnologies().then((result) => setTechnologyCatalog(result.data || [])).catch(() => {});
  };

  const handleCommentAdded = () => {
    showToast('Feedback comment added successfully!', 'success');
    loadProjects();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setCurrentUser(null);
      setCurrentStudentId(students[0]?.id || '');
      setMyProjectsMode(false);
      setSavedProjectsMode(false);
      setRecommendationsMode(false);
      showToast('You are logged out.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not log out.', 'error');
    }
  };

  const showMyProjects = () => {
    setMyProjectsMode(true);
    setSavedProjectsMode(false);
    setRecommendationsMode(false);
    setSearchQuery('');
    setSelectedTech('All');
    setSelectedCategory('All');
  };

  const handleNavigate = (target) => {
    setMyProjectsMode(false);
    setSavedProjectsMode(target === 'saved');
    setRecommendationsMode(target === 'recommended');
    setSearchQuery('');
    setSelectedTech('All');
    if (target === 'ai') setSelectedCategory('AI & Machine Learning');
    else if (target === 'data') setSelectedCategory('Data Science & Analytics');
    else setSelectedCategory('All');
    if (target === 'trending') setSortOption('upvotes');
    if (target === 'saved' || target === 'recommended') setSelectedCategory('All');
    else if (target === 'home' || target === 'explore') setSortOption(target === 'home' ? 'upvotes' : sortOption);
    if (target === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else requestAnimationFrame(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const toggleBookmark = async (project) => {
    try {
      await api.setBookmark(project.id, !project.is_saved, currentStudentId);
      setProjects((rows) => rows.filter((row) => row.id !== project.id || !project.is_saved).map((row) => row.id === project.id ? { ...row, is_saved: !project.is_saved } : row));
      showToast(project.is_saved ? 'Removed from saved projects.' : 'Project saved for later.', 'success');
      if (savedProjectsMode && project.is_saved) loadProjects();
    } catch (err) { showToast(err.message || 'Could not update saved projects.', 'error'); }
  };

  const toggleCategoryFollow = async (category) => {
    const next = followedCategories.includes(category)
      ? followedCategories.filter((item) => item !== category)
      : [...followedCategories, category];
    try {
      const result = await api.setFollowedCategories(next, currentStudentId);
      setFollowedCategories(result.data || next);
      showToast(next.includes(category) ? `Following ${category}.` : `Unfollowed ${category}.`, 'success');
    } catch (err) { showToast(err.message || 'Could not save your category preferences.', 'error'); }
  };

  const handleAuthenticated = async (user) => {
    setCurrentUser(user);
    setCurrentStudentId(user.id);
    setMyProjectsMode(false);
    setSavedProjectsMode(false);
    setRecommendationsMode(false);
    setInterests(user.interests || []);
    try {
      const result = await api.getFollowedCategories(user.id);
      setFollowedCategories(result.data || []);
    } catch { setFollowedCategories([]); }
    showToast(`Signed in as @${user.username}.`, 'success');
  };

  // Top featured spotlight project (Rank #1 or first item)
  const spotlightProject = sortOption === 'upvotes' && projects.length > 0 ? projects[0] : null;
  const showSpotlight = !myProjectsMode && !savedProjectsMode && !recommendationsMode && !loading && !error && !searchQuery && selectedCategory === 'All' && spotlightProject;

  return (
    <div className="app-layout">
      {/* Navigation Header */}
      <Navbar
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenExplainModal={() => setIsExplainModalOpen(true)}
        healthData={healthData}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onShowMyProjects={showMyProjects}
        onNavigate={handleNavigate}
        onShowSaved={() => handleNavigate('saved')}
        onShowRecommendations={() => handleNavigate('recommended')}
        onEditProfile={() => setIsProfileEditorOpen(true)}
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
            <p className="catalog-data-note">Catalog includes upstream open-source projects and clearly labeled fictional samples. Sample entries do not include invented repository or website links.</p>
          </div>

          <aside className="hero-community" aria-label="Project gallery summary">
            <div className="community-panel-heading">
              <span className="community-spark">✳</span>
              <div><strong>Gallery overview</strong><span>Student and open-source projects</span></div>
            </div>
            <div className="stats-strip">
              <div className="stat-item">
                <span className="stat-value">{totalCount}</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">20</span>
                <span className="stat-label">Domains</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{technologyCatalog.length}</span>
                <span className="stat-label">Technologies</span>
              </div>
            </div>
            <p className="community-panel-note">Search by idea, filter by stack, and open a project for details and feedback.</p>
          </aside>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="main-content">
        <div id="gallery" className="gallery-anchor" />
        {(myProjectsMode || savedProjectsMode || recommendationsMode) && <div className="gallery-section-heading"><div><h2>{myProjectsMode ? 'My projects' : savedProjectsMode ? 'Saved projects' : 'Picked for you'}</h2><p>{myProjectsMode ? 'Projects published by your account' : savedProjectsMode ? 'Your bookmarked projects' : 'Ranked using your followed categories, technology interests, recency, and stored community votes.'}</p></div><button className="btn-secondary" onClick={() => handleNavigate('explore')}>Back to Explore</button></div>}
        {/* Featured Spotlight Card */}
        {showSpotlight && (
          <FeaturedSpotlight
            project={spotlightProject}
            onVote={handleVote}
            onOpenDetails={(p) => setActiveProject(p)}
            isUpvoting={votingIds.has(spotlightProject.id)}
            onToggleBookmark={toggleBookmark}
            onOpenAuthor={(id) => setProfileStudentId(id)}
          />
        )}

        {/* Search, Filter, Sort Controls */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalCount={totalCount}
          showingCount={projects.length}
          followedCategories={followedCategories}
          onToggleCategoryFollow={toggleCategoryFollow}
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
              {searchQuery || selectedCategory !== 'All'
                ? `No projects matched your current filters. Try clearing filters.`
              : myProjectsMode ? 'You have not published a project with this account yet.' : savedProjectsMode ? 'Save projects from the gallery and they will be collected here.' : recommendationsMode ? 'Follow categories or technologies to personalize recommendations.' : 'The showcase gallery is currently empty. Be the first to publish a project!'}
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
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
                onToggleBookmark={toggleBookmark}
                onOpenAuthor={(id) => setProfileStudentId(id)}
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
          currentUser={currentUser}
          onClose={() => setActiveProject(null)}
          onVote={handleVote}
          onEdit={(project) => { setActiveProject(null); setProjectToEdit(project); setIsPublishModalOpen(true); }}
          onDelete={async (project) => {
            try {
              await api.deleteProject(project.id, currentUser?.id);
              setActiveProject(null);
              showToast('Project deleted.', 'success');
              loadProjects();
            } catch (err) { showToast(err.message || 'Could not delete project.', 'error'); }
          }}
          isVoting={votingIds.has(activeProject.id)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {profileStudentId && <AuthorProfileModal studentId={profileStudentId} onClose={() => setProfileStudentId(null)} onOpenProject={(projectId) => { setProfileStudentId(null); const found = projects.find((project) => project.id === projectId); if (found) setActiveProject(found); else api.getProjectDetails(projectId, currentStudentId).then(setActiveProject).catch((err) => showToast(err.message || 'Could not open project.', 'error')); }} />}

      {isProfileEditorOpen && currentUser && <ProfileEditModal user={currentUser} onClose={() => setIsProfileEditorOpen(false)} onSaved={(user) => { setCurrentUser(user); setInterests(user.interests || []); showToast('Profile updated.', 'success'); }} />}

      {isPublishModalOpen && (
        <PublishProjectModal
          currentStudentId={currentStudentId}
          students={students}
          onClose={() => { setIsPublishModalOpen(false); setProjectToEdit(null); }}
          onProjectPublished={handleProjectPublished}
          initialProject={projectToEdit}
          onSaved={() => { setProjectToEdit(null); setIsPublishModalOpen(false); loadProjects(); showToast('Project updated.', 'success'); }}
        />
      )}

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onAuthenticated={handleAuthenticated} />}

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
