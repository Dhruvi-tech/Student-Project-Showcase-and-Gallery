import React from 'react';
import { Search, ArrowUpDown, X } from 'lucide-react';
import { PROJECT_CATEGORIES } from '../constants/catalog';

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
  totalCount,
  showingCount,
  followedCategories = [],
  onToggleCategoryFollow,
}) {
  return (
    <div className="filter-bar">
      {/* Top row: Search input + Sorting dropdown */}
      <div className="filter-top-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            aria-label="Search projects"
            placeholder="Search projects by title, description, or tech stack..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '0.75rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="sort-group">
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <span className="sort-label">Sort:</span>
          <select
            className="sort-select"
            aria-label="Sort projects"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="upvotes">Most Appreciated</option>
            <option value="newest">Recently Published</option>
            <option value="oldest">Chronological</option>
            <option value="alphabetical">A to Z</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Tech stack pills + Showing count */}
      <div className="tech-pills-row domain-filter-row" aria-label="Filter by project domain">
        <span className="tech-pills-label">Domain:</span>
        <button aria-pressed={selectedCategory === 'All'} className={`tech-pill ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => onCategoryChange('All')}>All domains</button>
        {PROJECT_CATEGORIES.map((category) => (
          <span className="category-filter-item" key={category}>
            <button aria-pressed={selectedCategory === category} className={`tech-pill ${selectedCategory === category ? 'active' : ''}`} onClick={() => onCategoryChange(category)}>{category}</button>
            <button className={`follow-mini ${followedCategories.includes(category) ? 'active' : ''}`} aria-label={`${followedCategories.includes(category) ? 'Unfollow' : 'Follow'} ${category}`} aria-pressed={followedCategories.includes(category)} onClick={() => onToggleCategoryFollow?.(category)}>{followedCategories.includes(category) ? '★' : '☆'}</button>
          </span>
        ))}
      </div>
      <div className="filter-results-count">Showing <strong>{showingCount ?? totalCount}</strong>{showingCount !== undefined && showingCount < totalCount ? <> of <strong>{totalCount}</strong></> : null} projects</div>
    </div>
  );
}
