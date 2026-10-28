import React from 'react';
import { Search, ArrowUpDown, X } from 'lucide-react';

const COMMON_TECH_STACKS = [
  'All',
  'React',
  'Next.js',
  'TypeScript',
  'Python',
  'FastAPI',
  'Node.js',
  'PostgreSQL',
  'Docker',
  'Tailwind CSS',
  'Go',
  'Rust',
  'GraphQL',
  'Redis',
  'MongoDB',
  'AWS',
  'Firebase',
  'Java',
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedTech,
  onTechChange,
  sortOption,
  onSortChange,
  totalCount,
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
            placeholder="Search projects by title, description, or tech stack..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
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
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="upvotes">Most Appreciated</option>
            <option value="newest">Recently Published</option>
            <option value="oldest">Chronological</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Tech stack pills + Showing count */}
      <div className="tech-pills-row">
        <span className="tech-pills-label">Tech Filter:</span>
        {COMMON_TECH_STACKS.map((tech) => (
          <button
            key={tech}
            className={`tech-pill ${selectedTech === tech ? 'active' : ''}`}
            onClick={() => onTechChange(tech)}
          >
            {tech}
          </button>
        ))}
      </div>
      <div className="filter-results-count">Showing <strong>{totalCount}</strong> projects</div>
    </div>
  );
}
