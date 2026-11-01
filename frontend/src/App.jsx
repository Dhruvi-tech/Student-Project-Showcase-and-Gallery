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
import { CitationModal } from './components/CitationModal';
import { ExportModal } from './components/ExportModal';
import { TechAnalyticsModal } from './components/TechAnalyticsModal';
import { ComparisonModal } from './components/ComparisonModal';
import { ComparisonTray } from './components/ComparisonTray';
import { DossierModal } from './components/DossierModal';
import { VivaDefenseModal } from './components/VivaDefenseModal';
import { ArchitectureVisualizerModal } from './components/ArchitectureVisualizerModal';
import { api } from './services/api';
import './styles/App.css';
import {
  Terminal,
  FolderSearch,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  TrendingUp,
  Brain,
  BarChart2,
  BarChart3,
  GitCompare,
  FileText,
  Plus,
  Compass,
} from 'lucide-react';

export function App() {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme state: dark (modern slate) or light (crisp slate)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTech, setSelectedTech] = useState('All');
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
  const [projectToCite, setProjectToCite] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [votingIds, setVotingIds] = useState(new Set());

  // High-Priority Features: Comparison, Analytics & Academic Dossier
  const [comparisonProjects, setComparisonProjects] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [projectForDossier, setProjectForDossier] = useState(null);

  // 2 New Advanced Features: Viva Defense Simulator & Architecture Diagram Visualizer
  const [projectForViva, setProjectForViva] = useState(null);
  const [projectForArchitecture, setProjectForArchitecture] = useState(null);

  // Health and System State
  const [healthData, setHealthData] = useState(null);
  const [toast, setToast] = useState(null);

  // Global Quick Search Shortcut (Ctrl+K or /)
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.querySelector('.search-input');
        if (input) {
          input.focus();
          input.select();
        }
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const input = document.querySelector('.search-input');
        if (input) {
          input.focus();
          input.select();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

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

  // Initial Boot: Load Students, Health, and User
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
        if (technologyResult.status === 'fulfilled') {
          setTechnologyCatalog(technologyResult.value.data || []);
        }

        if (studentsList.status === 'fulfilled' && studentsList.value.length > 0) {
          setStudents(studentsList.value);
          setCurrentStudentId(studentsList.value[0].id);
          const [follows, profileInterests] = await Promise.allSettled([
            api.getFollowedCategories(studentsList.value[0].id),
            api.getInterests(studentsList.value[0].id),
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

  // Compute Active Navigation tab
  const activeNav = isAnalyticsModalOpen
    ? 'analytics'
    : savedProjectsMode
    ? 'saved'
    : myProjectsMode
    ? 'my-projects'
    : recommendationsMode
    ? 'recommended'
    : selectedCategory === 'AI & Machine Learning'
    ? 'ai'
    : selectedCategory === 'Data Science & Analytics'
    ? 'data'
    : sortOption === 'upvotes' && selectedCategory === 'All' && !searchQuery
    ? 'trending'
    : 'explore';

  // Load Projects based on filters
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (recommendationsMode && currentStudentId) {
        const res = await api.getRecommendations(currentStudentId);
        setProjects(res.data || []);
        setTotalCount(res.count || (res.data || []).length);
        return;
      }

      if (savedProjectsMode) {
        const res = await api.getSavedProjects(currentStudentId);
        const bookmarkedList = res.data || [];
        setProjects(bookmarkedList);
        setTotalCount(res.total ?? bookmarkedList.length);
        return;
      }

      if (myProjectsMode) {
        const res = await api.getStudentProjects(currentStudentId);
        const myList = res.data || [];
        setProjects(myList);
        setTotalCount(res.total ?? myList.length);
        return;
      }

      const res = await api.getProjects({
            sort: sortOption,
            category: selectedCategory,
            search: searchQuery,
            studentId: currentStudentId,
            limit: 200,
            offset: 0,
          });

      let allProjects = res.data || [];
      const resultCount = res.total ?? allProjects.length;

      while (!myProjectsMode && !savedProjectsMode && !recommendationsMode && allProjects.length < resultCount) {
        const nextPage = await api.getProjects({
          sort: sortOption,
          category: selectedCategory,
          search: searchQuery,
          studentId: currentStudentId,
          limit: 200,
          offset: allProjects.length,
        });
        if (!nextPage.data?.length) break;
        allProjects = [...allProjects, ...nextPage.data];
      }
      setProjects(allProjects);
      setTotalCount(resultCount);
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

  // Filter projects in-memory by Technology
  const visibleProjects = projects.filter((project) => {
    if (selectedTech && selectedTech !== 'All') {
      const matchTech = (project.tech_stacks || []).some((t) =>
        t.toLowerCase().includes(selectedTech.toLowerCase())
      );
      if (!matchTech) return false;
    }
    return true;
  });

  const handleVote = async (projectId, direction) => {
    if (!currentStudentId) {
      showToast('Please sign in or select a profile to vote.', 'error');
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
      showToast(vote === 'up' ? 'You upvoted this project! 👍' : vote === 'down' ? 'You downvoted this project.' : 'Vote removed.', 'success');
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
    showToast(`Project "${newProject.title}" published successfully! 🚀`, 'success');
    loadProjects();
    api.getTechnologies().then((result) => setTechnologyCatalog(result.data || [])).catch(() => {});
  };

  const handleCommentAdded = () => {
    showToast('Feedback comment added! 💬', 'success');
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
      showToast('You are logged out.', 'info');
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
    showToast('Showing projects authored by your profile', 'info');
  };

  const handleNavigate = (target) => {
    setMyProjectsMode(target === 'my-projects');
    setSavedProjectsMode(target === 'saved');
    setRecommendationsMode(target === 'recommended');
    setSearchQuery('');
    setSelectedTech('All');

    if (target === 'ai') {
      setSelectedCategory('AI & Machine Learning');
      showToast('Filtering: AI & Machine Learning Track', 'info');
    } else if (target === 'data') {
      setSelectedCategory('Data Science & Analytics');
      showToast('Filtering: Data Science & Analytics Track', 'info');
    } else {
      setSelectedCategory('All');
      if (target === 'explore') showToast('Showing all 320 projects', 'info');
    }

    if (target === 'trending') {
      setSortOption('upvotes');
      showToast('Sorted by Most Appreciated 🔥', 'info');
    } else if (target === 'saved') {
      showToast('Showing your Bookmarked Projects 🔖', 'info');
    } else if (target === 'recommended') {
      showToast('Showing curated recommendations for you ✨', 'info');
    }

    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const toggleBookmark = async (project) => {
    try {
      const willBeSaved = !project.is_saved;
      await api.setBookmark(project.id, willBeSaved, currentStudentId);
      setProjects((rows) => {
        if (savedProjectsMode && !willBeSaved) {
          return rows.filter((row) => row.id !== project.id);
        }
        return rows.map((row) => (row.id === project.id ? { ...row, is_saved: willBeSaved } : row));
      });
      if (savedProjectsMode && !willBeSaved) {
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
      showToast(willBeSaved ? 'Project bookmarked! 🔖' : 'Removed from saved projects.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not update saved projects.', 'error');
    }
  };

  const handleShareProject = (project) => {
    showToast(`Share link copied for "${project.title}"! 🔗`, 'success');
  };

  // Feature 1: Project Comparison Handlers
  const handleToggleCompare = (project) => {
    setComparisonProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      if (exists) {
        showToast(`Removed "${project.title}" from comparison tray.`, 'info');
        return prev.filter((p) => p.id !== project.id);
      }
      if (prev.length >= 3) {
        showToast('You can compare at most 3 projects at once.', 'error');
        return prev;
      }
      showToast(`Added "${project.title}" to comparison (${prev.length + 1}/3).`, 'success');
      return [...prev, project];
    });
  };

  const handleRemoveCompare = (projectId) => {
    setComparisonProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleClearCompare = () => {
    setComparisonProjects([]);
    showToast('Comparison tray cleared.', 'info');
  };

  // Feature 10: Academic Dossier Handler
  const handleOpenDossier = (project) => {
    setProjectForDossier(project);
  };

  const handleAuthenticated = async (user) => {
    setCurrentUser(user);
    setCurrentStudentId(user.id);
    setMyProjectsMode(false);
    setSavedProjectsMode(false);
    showToast(`Welcome back, ${user.name || user.username}! 👋`, 'success');
    loadProjects();
  };

  const spotlightProject = visibleProjects[0] || null;
  const showSpotlight =
    !myProjectsMode &&
    !savedProjectsMode &&
    !recommendationsMode &&
    selectedCategory === 'All' &&
    selectedTech === 'All' &&
    !searchQuery &&
    spotlightProject !== null;

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar
        onOpenPublishModal={() => { setProjectToEdit(null); setIsPublishModalOpen(true); }}
        onOpenExplainModal={() => setIsExplainModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
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
        activeNav={activeNav}
      />

      {/* Hero Section with Quick Actions */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-copy">
            <div className="hero-tag">
              <Terminal size={14} />
              <span>Student Project Showcase & Peer Gallery</span>
            </div>
            <h2 className="hero-title">Builds worth sharing.<br />Feedback that helps them grow.</h2>
            <p className="hero-subtitle">
              Explore 320 capstone projects across 20 technical domains, inspect real code, save your favorites, and leave constructive peer feedback.
            </p>

            {/* Quick Action Buttons in Hero */}
            <div className="hero-action-buttons">
              <button className="btn-hero-primary" onClick={() => handleNavigate('explore')}>
                <Compass size={16} />
                <span>Explore 320 Projects</span>
              </button>
              <button className="btn-hero-secondary" onClick={() => handleNavigate('ai')}>
                <Brain size={16} />
                <span>AI &amp; ML</span>
              </button>
              <button className="btn-hero-secondary" onClick={() => handleNavigate('data')}>
                <BarChart2 size={16} />
                <span>Data Science</span>
              </button>
              <button className="btn-hero-secondary" onClick={() => handleNavigate('trending')}>
                <TrendingUp size={16} />
                <span>Trending</span>
              </button>
              <button
                className="btn-hero-secondary"
                onClick={() => setIsAnalyticsModalOpen(true)}
                title="View Tech Stack Analytics & Visual Distribution Charts"
              >
                <BarChart3 size={16} />
                <span>Analytics</span>
              </button>
              <button className="btn-hero-cta" onClick={() => { setProjectToEdit(null); setIsPublishModalOpen(true); }}>
                <Plus size={16} />
                <span>Publish Project</span>
              </button>
            </div>
          </div>

          <aside className="hero-community" aria-label="Project gallery summary">
            <div className="community-panel-heading">
              <span className="community-spark">✦</span>
              <div><strong>Live Catalog Metrics</strong><span>Preserved SQLite Database</span></div>
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
                <span className="stat-value">120</span>
                <span className="stat-label">Authors</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">374</span>
                <span className="stat-label">Peer Votes</span>
              </div>
            </div>
            <p className="community-panel-note">
              Search by idea, filter by tech stack, and click any card for live details, feedback, and repository source.
            </p>
          </aside>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="main-content">
        <div id="gallery" className="gallery-anchor" />

        {/* Section Heading when in Filter / Custom Modes */}
        {(myProjectsMode || savedProjectsMode || recommendationsMode) && (
          <div className="gallery-section-heading">
            <div>
              <h2>{myProjectsMode ? 'My Projects' : savedProjectsMode ? 'Bookmarked Projects' : 'Picked for You'}</h2>
              <p>
                {myProjectsMode
                  ? 'Projects published with your account'
                  : savedProjectsMode
                  ? 'Your saved projects for quick reference'
                  : 'Curated projects based on community engagement and categories'}
              </p>
            </div>
            <button className="btn-secondary" onClick={() => handleNavigate('explore')}>
              Back to All Projects
            </button>
          </div>
        )}

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
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            setMyProjectsMode(false);
            setSavedProjectsMode(false);
            setRecommendationsMode(false);
          }}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalCount={totalCount}
          showingCount={visibleProjects.length}
          selectedTech={selectedTech}
          onTechChange={setSelectedTech}
          onOpenExport={() => setIsExportModalOpen(true)}
          onResetFilters={() => {
            setSelectedCategory('All');
            setSelectedTech('All');
            setSearchQuery('');
            setSortOption('upvotes');
            setMyProjectsMode(false);
            setSavedProjectsMode(false);
            setRecommendationsMode(false);
            showToast('Filters reset to default.', 'info');
          }}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="state-box">
            <div className="spinner"></div>
            <h3 className="state-title">Loading Projects Gallery…</h3>
            <p className="state-text">Fetching verified catalog data from SQLite.</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="state-box error-box">
            <AlertTriangle size={32} color="var(--accent-rose)" />
            <h3 className="state-title">Unable to Load Projects</h3>
            <p className="state-text">{error}</p>
            <button className="btn-primary" onClick={loadProjects} style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && visibleProjects.length === 0 && (
          <div className="state-box empty-box">
            <FolderSearch size={40} color="var(--text-muted)" />
            <h3 className="state-title">No Projects Found</h3>
            <p className="state-text">
              {searchQuery
                ? `No projects matched "${searchQuery}". Try a different keyword.`
                : savedProjectsMode
                ? 'You have not bookmarked any projects yet. Click the bookmark icon on any card to save it.'
                : myProjectsMode
                ? 'You have not published any projects yet. Click "Publish Project" to submit your capstone!'
                : selectedTech !== 'All'
                ? `No projects found using "${selectedTech}".`
                : 'No projects match the current criteria.'}
            </p>
            <button
              className="btn-secondary"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedTech('All');
                setSearchQuery('');
                setMyProjectsMode(false);
                setSavedProjectsMode(false);
                setRecommendationsMode(false);
              }}
              style={{ marginTop: '1rem' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && visibleProjects.length > 0 && (
          <>
            {showSpotlight && (
              <div className="gallery-section-heading">
                <div>
                  <h2>All Projects</h2>
                  <p>{visibleProjects.length} projects matching your current filters</p>
                </div>
              </div>
            )}
            <div className="projects-grid">
              {(showSpotlight ? visibleProjects.slice(1) : visibleProjects).map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onVote={handleVote}
                  onOpenDetails={(p) => setActiveProject(p)}
                  isUpvoting={votingIds.has(project.id)}
                  index={index}
                  onToggleBookmark={toggleBookmark}
                  onOpenAuthor={(id) => setProfileStudentId(id)}
                  onShare={handleShareProject}
                  onCite={(p) => setProjectToCite(p)}
                  isCompared={comparisonProjects.some((cp) => cp.id === project.id)}
                  onToggleCompare={handleToggleCompare}
                  onOpenDossier={handleOpenDossier}
                  onOpenViva={(p) => setProjectForViva(p)}
                  onOpenArchitecture={(p) => setProjectForArchitecture(p)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Project Details Modal */}
      {activeProject && (
        <ProjectDetailsModal
          project={activeProject}
          currentStudentId={currentStudentId}
          students={students}
          currentUser={currentUser}
          onClose={() => setActiveProject(null)}
          onVote={handleVote}
          onOpenDossier={handleOpenDossier}
          onOpenViva={(p) => setProjectForViva(p)}
          onOpenArchitecture={(p) => setProjectForArchitecture(p)}
          onEdit={(project) => {
            setActiveProject(null);
            setProjectToEdit(project);
            setIsPublishModalOpen(true);
          }}
          onDelete={async (project) => {
            try {
              await api.deleteProject(project.id, currentUser?.id);
              setActiveProject(null);
              showToast('Project deleted successfully.', 'success');
              loadProjects();
            } catch (err) {
              showToast(err.message || 'Could not delete project.', 'error');
            }
          }}
          isVoting={votingIds.has(activeProject.id)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Author Profile Modal */}
      {profileStudentId && (
        <AuthorProfileModal
          studentId={profileStudentId}
          onClose={() => setProfileStudentId(null)}
          onOpenProject={(projectId) => {
            setProfileStudentId(null);
            const found = projects.find((project) => project.id === projectId);
            if (found) setActiveProject(found);
            else api.getProjectDetails(projectId, currentStudentId).then(setActiveProject).catch((err) => showToast(err.message || 'Could not open project.', 'error'));
          }}
        />
      )}

      {/* Profile Edit Modal */}
      {isProfileEditorOpen && currentUser && (
        <ProfileEditModal
          user={currentUser}
          onClose={() => setIsProfileEditorOpen(false)}
          onSaved={(user) => {
            setCurrentUser(user);
            setInterests(user.interests || []);
            showToast('Profile updated.', 'success');
          }}
        />
      )}

      {/* Publish Project Modal */}
      {isPublishModalOpen && (
        <PublishProjectModal
          currentStudentId={currentStudentId}
          students={students}
          onClose={() => {
            setIsPublishModalOpen(false);
            setProjectToEdit(null);
          }}
          onProjectPublished={handleProjectPublished}
          initialProject={projectToEdit}
          onSaved={() => {
            setProjectToEdit(null);
            setIsPublishModalOpen(false);
            loadProjects();
            showToast('Project updated successfully.', 'success');
          }}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {/* Architecture Guide Modal */}
      {isExplainModalOpen && (
        <ExplainArchitectureModal
          healthData={healthData}
          onClose={() => setIsExplainModalOpen(false)}
        />
      )}

      {/* Citation Generator Modal */}
      {projectToCite && (
        <CitationModal
          project={projectToCite}
          onClose={() => setProjectToCite(null)}
        />
      )}

      {/* Catalog Exporter Modal */}
      {isExportModalOpen && (
        <ExportModal
          projects={visibleProjects}
          selectedCategory={selectedCategory}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Feature 1: Floating Comparison Tray */}
      <ComparisonTray
        selectedProjects={comparisonProjects}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
        onOpenModal={() => setIsComparisonModalOpen(true)}
      />

      {/* Feature 1: Capstone Side-by-Side Comparison Matrix Modal */}
      {isComparisonModalOpen && (
        <ComparisonModal
          projects={comparisonProjects}
          onRemoveProject={handleRemoveCompare}
          onOpenDetails={(p) => {
            setIsComparisonModalOpen(false);
            setActiveProject(p);
          }}
          onClose={() => setIsComparisonModalOpen(false)}
        />
      )}

      {/* Feature 3: Technology Analytics & Distribution Chart Modal */}
      {isAnalyticsModalOpen && (
        <TechAnalyticsModal
          projects={projects}
          onSelectTech={(tech) => {
            setSelectedTech(tech);
            setIsAnalyticsModalOpen(false);
            document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setIsAnalyticsModalOpen(false);
            document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenProject={(project) => {
            setIsAnalyticsModalOpen(false);
            setActiveProject(project);
          }}
          onClose={() => setIsAnalyticsModalOpen(false)}
        />
      )}

      {/* Feature 10: Academic Capstone Dossier Print / PDF Modal */}
      {projectForDossier && (
        <DossierModal
          project={projectForDossier}
          onClose={() => setProjectForDossier(null)}
        />
      )}

      {/* New Feature 1: Capstone Oral Defense & Viva Simulator */}
      {projectForViva && (
        <VivaDefenseModal
          project={projectForViva}
          onClose={() => setProjectForViva(null)}
        />
      )}

      {/* New Feature 2: Interactive System Architecture Flowchart & Layer Inspector */}
      {projectForArchitecture && (
        <ArchitectureVisualizerModal
          project={projectForArchitecture}
          onClose={() => setProjectForArchitecture(null)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle size={16} color="var(--accent-emerald)" />
          ) : toast.type === 'info' ? (
            <Info size={16} color="var(--accent-cobalt)" />
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
            <strong>ProjectSpace • Student Project Showcase</strong>
            <span>Preserved 320-Project Academic Catalog</span>
          </div>
          <div className="footer-links">
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer">
              Swagger API Docs
            </a>
            <a href="http://127.0.0.1:8000/redoc" target="_blank" rel="noopener noreferrer">
              ReDoc Specs
            </a>
            <a href="http://127.0.0.1:8000/health" target="_blank" rel="noopener noreferrer">
              System Health Check
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
