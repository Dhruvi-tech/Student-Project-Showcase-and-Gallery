"""Canonical discovery taxonomy and local, transparent search helpers."""

CATEGORIES = [
    "AI & Machine Learning",
    "Data Science & Analytics",
    "Cybersecurity",
    "Cloud Computing & DevOps",
    "Web Development & Full Stack",
    "Mobile App Development",
    "Internet of Things",
    "Blockchain & Web3",
    "Computer Vision",
    "Natural Language Processing",
    "Generative AI & AI Agents",
    "Robotics & Automation",
    "Data Engineering & Big Data",
    "Software Engineering & Developer Tools",
    "FinTech",
    "HealthTech",
    "EdTech",
    "Game Development",
    "AR/VR",
    "Open Source & Developer Utilities",
]

LEGACY_CATEGORIES = {
    "web development": "Web Development & Full Stack",
    "mobile development": "Mobile App Development",
    "blockchain": "Blockchain & Web3",
    "other": "Open Source & Developer Utilities",
}

SEARCH_SYNONYMS = {
    "phishing": ("fraud detection", "email security", "cybersecurity", "threat detection"),
    "image classification": ("computer vision", "image recognition", "object detection", "pytorch"),
    "data visualization": ("analytics", "charts", "dashboard", "data science"),
    "recommendation": ("personalization", "ranking", "collaborative filtering", "machine learning"),
    "chatbot": ("natural language processing", "generative ai", "conversational agent", "llm"),
}


def normalize_category(category: str | None) -> str:
    value = (category or "").strip()
    if not value:
        return CATEGORIES[-1]
    for canonical in CATEGORIES:
        if value.casefold() == canonical.casefold():
            return canonical
    return LEGACY_CATEGORIES.get(value.casefold(), value)


def search_terms(query: str) -> list[str]:
    """Return original words plus curated local intent synonyms; no remote model."""
    original = query.strip().casefold()
    terms = {original}
    for phrase, related in SEARCH_SYNONYMS.items():
        if phrase in original:
            terms.update(related)
    return sorted(terms, key=len, reverse=True)
