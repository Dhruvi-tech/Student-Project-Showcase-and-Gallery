import React from 'react';
import { Search, ArrowUpDown, X, Tag, Layers, Filter, Download } from 'lucide-react';
import { PROJECT_CATEGORIES } from '../constants/catalog';

const POPULAR_TECHS = [
  'All',
  'Python',
  'React',
  'FastAPI',
  'PyTorch',
  'Docker',
  'TypeScript',
  'TensorFlow',
  'PostgreSQL',
  'Node.js',
  'AWS',
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  selectedCategories = ['All'],
  onCategoryChange,
  sortOption,
  onSortChange,
  totalCount,
  showingCount,
  selectedTech = 'All',
  onTechChange,
  onResetFilters,
  onOpenExport,
}) {
  const isAllActive = selectedCategories.includes('All') || selectedCategory === 'All';
  const isPillActive = (cat) =>
    selectedCategories.includes('All')
      ? selectedCategory === cat
      : selectedCategories.includes(cat);

  const isFiltered =
    (!selectedCategories.includes('All') && selectedCategories.length > 0) ||
    selectedCategory !== 'All' ||
    selectedTech !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <div className="filter-bar-card">
      {/* Top row: Search input + Sorting dropdown + Reset */}
      <div className="filter-top-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            aria-label="Search projects"
            placeholder="Search 320 projects (or press Ctrl+K / /)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <kbd className="search-kbd-hint" title="Keyboard shortcut: Ctrl+K or /">Ctrl K</kbd>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="search-clear-btn"
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="sort-group">
          <ArrowUpDown size={14} className="sort-icon" />
          <span className="sort-label">Sort By:</span>
          <select
            className="sort-select"
            aria-label="Sort projects"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="upvotes">🔥 Most Appreciated</option>
            <option value="newest">⚡ Recently Published</option>
            <option value="oldest">📅 Chronological</option>
            <option value="alphabetical">🔤 Alphabetical (A-Z)</option>
          </select>
        </div>

        {isFiltered && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Popular Tech Filter Row */}
      <div className="tech-filter-row">
        <span className="filter-section-title">
          <Tag size={13} />
          <span>Technology:</span>
        </span>
        <div className="tech-pills-scroll">
          {POPULAR_TECHS.map((tech) => (
            <button
              key={tech}
              type="button"
              className={`tech-filter-pill ${selectedTech === tech ? 'active' : ''}`}
              onClick={() => onTechChange?.(tech)}
            >
              {tech === 'All' ? 'All Tech' : tech}
            </button>
          ))}
        </div>
      </div>

      {/* 20 Engineering Domains Filter Row */}
      <div className="domain-filter-row">
        <span className="filter-section-title">
          <Layers size={13} />
          <span>Domain (20):</span>
        </span>
        <div className="domain-pills-scroll">
          <button
            type="button"
            className={`domain-pill ${isAllActive ? 'active' : ''}`}
            onClick={() => onCategoryChange('All')}
          >
            All Tracks
          </button>
          {PROJECT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`domain-pill ${isPillActive(category) ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header + Export Feature */}
      <div className="filter-status-bar">
        <div className="filter-results-badge">
          <span className="results-dot"></span>
          <span>
            Showing <strong>{showingCount ?? totalCount}</strong> of <strong>{totalCount}</strong> projects
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {selectedTech !== 'All' && ` using ${selectedTech}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>

        <button
          type="button"
          className="btn-export-catalog"
          onClick={onOpenExport}
          title="Export current filtered project list as Markdown or JSON"
        >
          <Download size={13} />
          <span>Export Catalog</span>
        </button>
      </div>
    </div>
  );
}
