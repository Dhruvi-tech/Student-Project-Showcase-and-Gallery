import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Brain,
  Globe,
  Shield,
  Smartphone,
  Gamepad2,
  Cpu,
  BarChart2,
  Wand2,
  Layers,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  'AI & Machine Learning',
  'Generative AI & AI Agents',
  'Computer Vision',
  'Natural Language Processing',
  'Web Development & Full Stack',
  'Mobile App Development',
  'Cybersecurity',
  'Cloud Computing & DevOps',
  'Data Science & Analytics',
  'Data Engineering & Big Data',
  'Robotics & Automation',
  'Internet of Things',
  'Blockchain & Web3',
  'Game Development',
  'AR/VR',
  'FinTech',
  'HealthTech',
  'EdTech',
  'Software Engineering & Developer Tools',
  'Open Source & Developer Utilities',
];

const POPULAR_TECHS = [
  'Python',
  'TypeScript',
  'React',
  'Next.js',
  'PyTorch',
  'Docker',
  'Node.js',
  'FastAPI',
  'Rust',
  'Go',
  'Flutter',
  'PostgreSQL',
  'LLM',
  'LangChain',
  'OpenCV',
  'Unity',
  'TensorFlow',
  'Pandas',
  'Solidity',
  'Redis',
  'MongoDB',
  'C++',
  'Java',
  'Android',
];

const PRESETS = [
  {
    id: 'ai-data',
    label: 'AI & Data Science',
    icon: Brain,
    categories: ['AI & Machine Learning', 'Generative AI & AI Agents', 'Data Science & Analytics', 'Computer Vision'],
    techs: ['Python', 'PyTorch', 'LLM', 'FastAPI'],
  },
  {
    id: 'fullstack-web',
    label: 'Full-Stack Web Dev',
    icon: Globe,
    categories: ['Web Development & Full Stack', 'Cloud Computing & DevOps'],
    techs: ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL'],
  },
  {
    id: 'cloud-security',
    label: 'Cybersecurity & Cloud',
    icon: Shield,
    categories: ['Cybersecurity', 'Cloud Computing & DevOps'],
    techs: ['Docker', 'Go', 'Rust', 'Python'],
  },
  {
    id: 'mobile-iot',
    label: 'Mobile & IoT',
    icon: Smartphone,
    categories: ['Mobile App Development', 'Internet of Things'],
    techs: ['Flutter', 'Android', 'C++', 'Python'],
  },
  {
    id: 'gamedev-3d',
    label: 'Game Dev & AR/VR',
    icon: Gamepad2,
    categories: ['Game Development', 'AR/VR'],
    techs: ['Unity', 'C++'],
  },
  {
    id: 'data-engineering',
    label: 'Data & Systems Eng',
    icon: BarChart2,
    categories: ['Data Engineering & Big Data', 'Software Engineering & Developer Tools'],
    techs: ['Python', 'Docker', 'PostgreSQL', 'Redis', 'Go'],
  },
];

export function ForYouPreferences({
  preferences,
  onUpdatePreferences,
  matchedCount = 0,
  totalCatalogCount = 320,
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    // If no preferences set yet, open expanded by default
    const totalSelected = (preferences?.categories?.length || 0) + (preferences?.techs?.length || 0);
    return totalSelected === 0;
  });

  const selectedCategories = preferences?.categories || [];
  const selectedTechs = preferences?.techs || [];
  const totalSelected = selectedCategories.length + selectedTechs.length;

  const toggleCategory = (cat) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    onUpdatePreferences({ categories: next, techs: selectedTechs });
  };

  const toggleTech = (tech) => {
    const next = selectedTechs.includes(tech)
      ? selectedTechs.filter((t) => t !== tech)
      : [...selectedTechs, tech];
    onUpdatePreferences({ categories: selectedCategories, techs: next });
  };

  const applyPreset = (preset) => {
    onUpdatePreferences({
      categories: preset.categories,
      techs: preset.techs,
    });
  };

  const clearAll = () => {
    onUpdatePreferences({ categories: [], techs: [] });
  };

  const selectAllCategories = () => {
    onUpdatePreferences({ categories: [...CATEGORIES], techs: selectedTechs });
  };

  return (
    <div className="for-you-container">
      {/* Active Summary / Toggle Bar */}
      <div className="for-you-header-bar">
        <div className="for-you-header-left">
          <div className="for-you-badge">
            <Sparkles size={14} />
            <span>FOR YOU ENGINE</span>
          </div>
          <div>
            <h3 className="for-you-title">
              {totalSelected === 0
                ? 'What topics and tech do you like?'
                : `Personalized Feed • ${matchedCount} Matching Projects`}
            </h3>
            <p className="for-you-subtitle">
              {totalSelected === 0
                ? 'Select your favorite domains and tools below to tailor recommendations from 320 peer capstones.'
                : `Curated for your liked interests (${totalSelected} selected: ${selectedCategories.length} domains, ${selectedTechs.length} tech stacks).`}
            </p>
          </div>
        </div>

        <div className="for-you-header-actions">
          <button
            type="button"
            className="btn-toggle-preferences"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <Sliders size={14} />
            <span>{isExpanded ? 'Hide Filter Panel' : 'Customize What I Like'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Compact Active Chips Preview (visible when collapsed with items selected) */}
      {!isExpanded && totalSelected > 0 && (
        <div className="for-you-collapsed-pills">
          <span className="pills-label">Active Likes:</span>
          {selectedCategories.map((cat) => (
            <span key={cat} className="for-you-pill category" onClick={() => toggleCategory(cat)} title="Click to remove">
              {cat} <span className="pill-remove">×</span>
            </span>
          ))}
          {selectedTechs.map((tech) => (
            <span key={tech} className="for-you-pill tech" onClick={() => toggleTech(tech)} title="Click to remove">
              {tech} <span className="pill-remove">×</span>
            </span>
          ))}
          <button className="pill-add-more" onClick={() => setIsExpanded(true)}>
            + Add more likes
          </button>
        </div>
      )}

      {/* Expanded Interactive Questionnaire Card */}
      {isExpanded && (
        <div className="for-you-card">
          {/* Quick Presets */}
          <div className="for-you-section">
            <div className="section-label-row">
              <span className="section-label">
                <Wand2 size={13} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
                Instant 1-Click Persona Presets:
              </span>
            </div>
            <div className="presets-grid">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected =
                  preset.categories.every((c) => selectedCategories.includes(c)) &&
                  preset.techs.every((t) => selectedTechs.includes(t));
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => applyPreset(preset)}
                  >
                    <Icon size={14} />
                    <span>{preset.label}</span>
                    {isSelected && <Check size={13} className="preset-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 1: Categories / Domains */}
          <div className="for-you-section">
            <div className="section-label-row">
              <span className="section-label">
                <Layers size={13} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
                What domains do you like? ({selectedCategories.length} selected)
              </span>
              <div className="section-quick-links">
                <button type="button" className="text-link-btn" onClick={selectAllCategories}>
                  Select All Domains
                </button>
                <span className="divider">•</span>
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => onUpdatePreferences({ categories: [], techs: selectedTechs })}
                >
                  Clear Domains
                </button>
              </div>
            </div>
            <div className="chips-grid">
              {CATEGORIES.map((cat) => {
                const isChecked = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`choice-chip ${isChecked ? 'is-active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    <span className="chip-indicator">{isChecked ? <Check size={12} /> : '+'}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Technologies */}
          <div className="for-you-section">
            <div className="section-label-row">
              <span className="section-label">
                <Cpu size={13} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
                What tech stacks & tools do you want to see? ({selectedTechs.length} selected)
              </span>
              <div className="section-quick-links">
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => onUpdatePreferences({ categories: selectedCategories, techs: [] })}
                >
                  Clear Techs
                </button>
              </div>
            </div>
            <div className="chips-grid">
              {POPULAR_TECHS.map((tech) => {
                const isChecked = selectedTechs.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    className={`choice-chip tech-choice ${isChecked ? 'is-active' : ''}`}
                    onClick={() => toggleTech(tech)}
                  >
                    <span className="chip-indicator">{isChecked ? <Check size={12} /> : '+'}</span>
                    <span>{tech}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="for-you-footer">
            <div className="footer-status">
              <CheckCircle2 size={16} color="var(--accent-emerald, #10b981)" />
              <span>
                <strong>{matchedCount}</strong> out of {totalCatalogCount} projects match your current selections
              </span>
            </div>
            <div className="footer-actions">
              <button type="button" className="btn-secondary btn-sm" onClick={clearAll}>
                <RotateCcw size={13} />
                <span>Reset All</span>
              </button>
              <button
                type="button"
                className="btn-primary btn-sm btn-save-likes"
                onClick={() => setIsExpanded(false)}
              >
                <Sparkles size={13} />
                <span>Apply & Discover Recommendations</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
