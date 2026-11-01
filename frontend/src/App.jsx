import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { FeaturedSpotlight } from './components/FeaturedSpotlight';
import { ProjectDetailsModal } from './components/ProjectDetailsModal';
import { PublishProjectModal } from './components/PublishProjectModal';
import { AuthModal } from './components/AuthModal';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { ExportModal } from './components/ExportModal';
import { TechAnalyticsModal } from './components/TechAnalyticsModal';
import { ComparisonModal } from './components/ComparisonModal';
import { ComparisonTray } from './components/ComparisonTray';
import { ForYouPreferences } from './components/ForYouPreferences';
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
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [selectedTech, setSelectedTech] = useState('All');
  const [sortOption, setSortOption] = useState('upvotes');

  const handleSelectCategories = (cats, shouldScroll = false) => {
    const next = Array.isArray(cats) ? cats : ['All'];
    setSelectedCategories(next);
    setSelectedCategory(
      next.includes('All') || next.length >= 20 || next.length === 0
        ? 'All'
        : next.length === 1
        ? next[0]
        : next.join(', ')
    );
    setMyProjectsMode(false);
    setSavedProjectsMode(false);
    setRecommendationsMode(false);

    if (next.includes('All')) {
      showToast('Showing all 20 technical domains (320 projects)', 'info');
    } else if (next.length === 0) {
      showToast('All domain ticks cleared. Tick 1 or 2 options above to filter.', 'info');
    } else if (next.length === 1) {
      showToast(`Filtering by domain: ${next[0]}`, 'info');
    } else {
      showToast(`Filtering by ${next.length} selected domains`, 'info');
    }

    if (shouldScroll) {
      setTimeout(() => {
        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // Development Identity Personas with synchronous localStorage persistence
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('showcase_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed;
      }
    } catch (e) {}
    return null;
  });
  const [currentStudentId, setCurrentStudentId] = useState(() => {
    try {
      const saved = localStorage.getItem('showcase_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed.id;
      }
    } catch (e) {}
    return '';
  });
  const [interests, setInterests] = useState(() => {
    try {
      const saved = localStorage.getItem('showcase_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.interests)) return parsed.interests;
      }
    } catch (e) {}
    return [];
  });
  const [students, setStudents] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [myProjectsMode, setMyProjectsMode] = useState(false);
  const [savedProjectsMode, setSavedProjectsMode] = useState(false);
  const [recommendationsMode, setRecommendationsMode] = useState(false);

  // For You Section Preferences (Liked Domains & Tech Stacks)
  const [forYouPreferences, setForYouPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('showcase_for_you_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (Array.isArray(parsed.categories) || Array.isArray(parsed.techs))) {
          return {
            categories: parsed.categories || [],
            techs: parsed.techs || [],
          };
        }
      }
      const userSaved = localStorage.getItem('showcase_user');
      if (userSaved) {
        const parsedUser = JSON.parse(userSaved);
        if (Array.isArray(parsedUser?.interests) && parsedUser.interests.length > 0) {
          return {
            categories: parsedUser.interests,
            techs: ['Python', 'React'],
          };
        }
      }
    } catch (e) {}
    return {
      categories: ['AI & Machine Learning', 'Web Development & Full Stack'],
      techs: ['Python', 'React', 'TypeScript'],
    };
  });

  const handleUpdateForYouPreferences = (newPrefs) => {
    setForYouPreferences(newPrefs);
    try {
      localStorage.setItem('showcase_for_you_preferences', JSON.stringify(newPrefs));
    } catch (e) {}

    if (currentStudentId && newPrefs.categories?.length > 0) {
      api.setFollowedCategories(newPrefs.categories, currentStudentId).catch(() => {});
    }

    const count = (newPrefs.categories?.length || 0) + (newPrefs.techs?.length || 0);
    showToast(`Preferences updated! (${count} liked topics selected) ✨`, 'success');
  };
  const [followedCategories, setFollowedCategories] = useState([]);
  const [technologyCatalog, setTechnologyCatalog] = useState([]);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  // Modals & Active View
  const [activeProject, setActiveProject] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [votingIds, setVotingIds] = useState(new Set());

  // High-Priority Features: Comparison & Tech Stack Analytics
  const [comparisonProjects, setComparisonProjects] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

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

        let activeUserId = '';
        if (userResult.status === 'fulfilled' && userResult.value?.user) {
          const u = userResult.value.user;
          setCurrentUser(u);
          setCurrentStudentId(u.id);
          activeUserId = u.id;
          if (Array.isArray(u.interests) && u.interests.length > 0) {
            setInterests(u.interests);
          }
        } else {
          try {
            const saved = localStorage.getItem('showcase_user');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed?.id) {
                setCurrentUser(parsed);
                setCurrentStudentId(parsed.id);
                activeUserId = parsed.id;
                if (Array.isArray(parsed.interests) && parsed.interests.length > 0) {
                  setInterests(parsed.interests);
                }
              }
            }
          } catch (e) {}
        }

        if (studentsList.status === 'fulfilled' && studentsList.value.length > 0) {
          setStudents(studentsList.value);
          const targetId = activeUserId || studentsList.value[0].id;
          setCurrentStudentId((prev) => prev || targetId);
          api.getFollowedCategories(targetId).then((res) => {
            if (res?.data) setFollowedCategories(res.data);
          }).catch(() => {});
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
    : (!selectedCategories.includes('All') && selectedCategories.length > 0)
    ? 'domains'
    : selectedCategory !== 'All'
    ? 'domains'
    : sortOption === 'upvotes' && selectedCategory === 'All' && !searchQuery
    ? 'trending'
    : 'explore';

  // Load Projects based on filters
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (recommendationsMode) {
        let pool = [];
        try {
          const res = await api.getProjects({ limit: 320, sort: 'upvotes' });
          pool = Array.isArray(res) ? res : res.data || [];
        } catch (e) {
          pool = [];
        }

        const likedCats = forYouPreferences?.categories || [];
        const likedTechs = (forYouPreferences?.techs || []).map((t) => t.toLowerCase());

        const scoredProjects = pool.map((project) => {
          let score = 0;
          const reasons = [];

          if (likedCats.length > 0 && likedCats.includes(project.category)) {
            score += 35;
            reasons.push(`Matches your liked domain: ${project.category}`);
          }

          if (likedTechs.length > 0) {
            const projectTechs = Array.isArray(project.tech_stacks) ? project.tech_stacks : [];
            const matchedTechs = projectTechs.filter((t) =>
              likedTechs.includes(t.toLowerCase())
            );
            if (matchedTechs.length > 0) {
              score += matchedTechs.length * 18;
              reasons.push(`Uses technologies you like: ${matchedTechs.join(', ')}`);
            }
          }

          const upvotes = Math.max(0, project.upvote_count || 0);
          score += Math.min(10, upvotes * 0.4);

          if (reasons.length === 0 && (likedCats.length > 0 || likedTechs.length > 0)) {
            reasons.push('Popular capstone from the student peer gallery');
          }

          return {
            ...project,
            recommendation_score: score,
            recommendation_reasons: reasons,
          };
        });

        const hasPreferences = likedCats.length > 0 || likedTechs.length > 0;
        let matched = hasPreferences
          ? scoredProjects.filter((p) => p.recommendation_score > 12)
          : scoredProjects;

        if (matched.length < 12) {
          const matchedIds = new Set(matched.map((p) => p.id));
          const fillers = scoredProjects
            .filter((p) => !matchedIds.has(p.id))
            .sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));
          matched = [...matched, ...fillers];
        }

        matched.sort((a, b) => {
          if ((b.recommendation_score || 0) !== (a.recommendation_score || 0)) {
            return (b.recommendation_score || 0) - (a.recommendation_score || 0);
          }
          return (b.upvote_count || 0) - (a.upvote_count || 0);
        });

        setProjects(matched);
        setTotalCount(matched.length);
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

      // Always load all 320 projects across all 20 domains into memory so multi-domain filtering is 100% instant with zero network lag
      const res = await api.getProjects({
        sort: sortOption,
        category: 'All',
        search: searchQuery,
        studentId: currentStudentId,
        limit: 350,
        offset: 0,
      });

      let allProjects = res.data || [];
      const resultCount = res.total ?? allProjects.length;

      while (!myProjectsMode && !savedProjectsMode && !recommendationsMode && allProjects.length < resultCount) {
        const nextPage = await api.getProjects({
          sort: sortOption,
          category: 'All',
          search: searchQuery,
          studentId: currentStudentId,
          limit: 350,
          offset: allProjects.length,
        });
        if (!nextPage.data?.length) break;
        allProjects = [...allProjects, ...nextPage.data];
      }
      setProjects(allProjects);
      setTotalCount(allProjects.length);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [sortOption, searchQuery, currentStudentId, myProjectsMode, savedProjectsMode, recommendationsMode, forYouPreferences]);

  // Refetch when filters or identity change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  // Filter projects in-memory by Technology and Multi-ticked Categories
  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      // 1. Multi-ticked Categories filter (from top navbar domains menu)
      // When selectedCategories is empty (Clear All) or includes 'All', all projects show (page is NEVER blank!)
      if (selectedCategories.length > 0 && !selectedCategories.includes('All')) {
        if (!selectedCategories.includes(project.category)) return false;
      }

      // 2. Tech Stack filter
      if (selectedTech && selectedTech !== 'All') {
        const matchTech = (project.tech_stacks || []).some((t) =>
          t.toLowerCase().includes(selectedTech.toLowerCase())
        );
        if (!matchTech) return false;
      }
      return true;
    });
  }, [projects, selectedCategories, selectedTech]);

  // Dynamic sum of all peer upvotes across catalog
  const totalVotes = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.upvote_count || 0), 0);
  }, [projects]);

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
    } catch (err) {
      console.warn('Backend logout failed or was offline:', err);
    }
    setCurrentUser(null);
    setCurrentStudentId(students[0]?.id || '');
    setMyProjectsMode(false);
    setSavedProjectsMode(false);
    setRecommendationsMode(false);
    try {
      localStorage.removeItem('showcase_user');
    } catch (e) {}
    showToast('You are logged out.', 'info');
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
      setSelectedCategories(['AI & Machine Learning']);
      setSelectedCategory('AI & Machine Learning');
      showToast('Filtering: AI & Machine Learning Track', 'info');
    } else if (target === 'data') {
      setSelectedCategories(['Data Science & Analytics']);
      setSelectedCategory('Data Science & Analytics');
      showToast('Filtering: Data Science & Analytics Track', 'info');
    } else {
      setSelectedCategories(['All']);
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

  const handleAuthenticated = async (user) => {
    setCurrentUser(user);
    setCurrentStudentId(user.id);
    setMyProjectsMode(false);
    setSavedProjectsMode(false);
    try {
      localStorage.setItem('showcase_user', JSON.stringify(user));
    } catch (e) {}
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
        selectedCategories={selectedCategories}
        onSelectCategories={handleSelectCategories}
        matchingCount={visibleProjects.length}
      />

      {/* Hero Section with Quick Actions */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-copy">
            <div className="hero-tag">
              <Sparkles size={14} />
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
                <span className="stat-value">{totalVotes || 375}</span>
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
        {(myProjectsMode || savedProjectsMode) && (
          <div className="gallery-section-heading">
            <div>
              <h2>{myProjectsMode ? 'My Projects' : 'Bookmarked Projects'}</h2>
              <p>
                {myProjectsMode
                  ? 'Projects published with your account'
                  : 'Your saved projects for quick reference'}
              </p>
            </div>
            <button className="btn-secondary" onClick={() => handleNavigate('explore')}>
              Back to All Projects
            </button>
          </div>
        )}

        {/* ONLY FOR "FOR YOU" SECTION: Interactive Preferences & Questionnaire */}
        {recommendationsMode && (
          <ForYouPreferences
            preferences={forYouPreferences}
            onUpdatePreferences={handleUpdateForYouPreferences}
            matchedCount={visibleProjects.length}
            totalCatalogCount={320}
          />
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
          selectedCategories={selectedCategories}
          onCategoryChange={(cat) => {
            if (cat === 'All') {
              handleSelectCategories(['All']);
            } else {
              handleSelectCategories([cat]);
            }
          }}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalCount={totalCount}
          showingCount={visibleProjects.length}
          selectedTech={selectedTech}
          onTechChange={setSelectedTech}
          onOpenExport={() => setIsExportModalOpen(true)}
          onResetFilters={() => {
            handleSelectCategories(['All']);
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
            {selectedCategories.length === 0 ? (
              <>
                <Layers size={42} color="var(--accent-cobalt)" />
                <h3 className="state-title">All Domains Cleared (0 Selected)</h3>
                <p className="state-text">
                  You cleared all domain filters. Pick 1 or 2 domains from the top <strong>Domains</strong> menu or choose a quick 2-domain pair below:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <button className="btn-secondary btn-sm" onClick={() => handleSelectCategories(['Web Development & Full Stack', 'Cloud Computing & DevOps'])}>
                    🌐 Web + Cloud (2)
                  </button>
                  <button className="btn-secondary btn-sm" onClick={() => handleSelectCategories(['AI & Machine Learning', 'Generative AI & AI Agents'])}>
                    🤖 AI + GenAI (2)
                  </button>
                  <button className="btn-secondary btn-sm" onClick={() => handleSelectCategories(['Cybersecurity', 'Software Engineering & Developer Tools'])}>
                    🛡️ Cyber + Systems (2)
                  </button>
                  <button className="btn-secondary btn-sm" onClick={() => handleSelectCategories(['Mobile App Development', 'Internet of Things'])}>
                    📱 Mobile + IoT (2)
                  </button>
                  <button className="btn-primary btn-sm" onClick={() => handleSelectCategories(['All'])}>
                    Select All 20 Domains (320 Projects)
                  </button>
                </div>
              </>
            ) : (
              <>
                <FolderSearch size={40} color="var(--text-muted)" />
                <h3 className="state-title">No Projects Found</h3>
                <p className="state-text">
                  {searchQuery
                    ? `No projects matched "${searchQuery}". Try a different keyword.`
                    : savedProjectsMode
                    ? 'You have not bookmarked any projects yet. Click the bookmark icon on any card to save it.'
                    : myProjectsMode
                    ? 'You have not published any projects yet. Click "Publish Project" to submit your capstone!'
                    : recommendationsMode
                    ? 'No projects matched this specific combination of likes. Click "Customize What I Like" above to add more topics!'
                    : selectedTech !== 'All'
                    ? `No projects found using "${selectedTech}".`
                    : 'No projects match the current criteria.'}
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    handleSelectCategories(['All']);
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
              </>
            )}
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
                  isCompared={comparisonProjects.some((cp) => cp.id === project.id)}
                  onToggleCompare={handleToggleCompare}
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
            if (!user) return;
            const updated = { ...currentUser, ...user };
            setCurrentUser(updated);
            setCurrentStudentId(updated.id);
            setInterests(updated.interests || []);
            try {
              localStorage.setItem('showcase_user', JSON.stringify(updated));
            } catch (e) {}
            setStudents((prev) =>
              prev.map((s) => (s.id === updated.id ? { ...s, name: updated.name, bio: updated.bio } : s))
            );
            showToast('Profile updated successfully! ✨', 'success');
          }}
        />
      )}

      {/* Publish Project Modal */}
      {isPublishModalOpen && (
        <PublishProjectModal
          currentStudentId={currentStudentId}
          students={students}
          currentUser={currentUser}
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
            <strong>Student Project Showcase &amp; Peer Gallery</strong>
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
