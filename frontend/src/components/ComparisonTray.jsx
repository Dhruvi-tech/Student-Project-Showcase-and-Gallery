import React from 'react';
import { GitCompare, X, ArrowRight } from 'lucide-react';

export function ComparisonTray({ selectedProjects = [], onRemove, onClear, onOpenModal }) {
  if (!selectedProjects || selectedProjects.length === 0) return null;

  return (
    <aside className="comparison-floating-tray" aria-label="Project comparison tray">
      <div className="comparison-tray-container">
        <div className="comparison-tray-header">
          <GitCompare size={16} className="text-cobalt" />
          <span className="comparison-tray-title">
            Compare ({selectedProjects.length}/3):
          </span>
        </div>

        {/* Selected Project Chips */}
        <div className="comparison-chips">
          {selectedProjects.map((p) => (
            <div key={p.id} className="comparison-chip">
              <span className="comparison-chip-title" title={p.title}>
                {p.title.length > 22 ? p.title.slice(0, 22) + '…' : p.title}
              </span>
              <button
                type="button"
                className="comparison-chip-remove"
                onClick={() => onRemove(p.id)}
                aria-label={`Remove ${p.title} from comparison`}
                title="Remove"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Tray Action Buttons */}
        <div className="comparison-tray-actions">
          <button
            type="button"
            className="btn-tray-clear"
            onClick={onClear}
            title="Clear all selected projects"
          >
            Clear
          </button>

          <button
            type="button"
            className="btn-tray-compare"
            onClick={onOpenModal}
            disabled={selectedProjects.length < 2}
            title={selectedProjects.length < 2 ? 'Select at least 2 projects to compare' : 'Open comparison matrix'}
          >
            <span>Compare {selectedProjects.length >= 2 ? `(${selectedProjects.length})` : '(Select 2+)'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
