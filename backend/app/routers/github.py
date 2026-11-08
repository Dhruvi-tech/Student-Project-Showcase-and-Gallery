"""GitHub integration router: auto-fetches repository metadata and connects public repos."""
from typing import List, Optional
import re
import logging
from fastapi import APIRouter, HTTPException, Query, status
import httpx

router = APIRouter(prefix="/api/v1/github", tags=["GitHub Integration"])
logger = logging.getLogger("showcase.github")

GITHUB_API_BASE = "https://api.github.com"
DEFAULT_HEADERS = {
    "User-Agent": "Student-Project-Showcase/1.0",
    "Accept": "application/vnd.github.v3+json",
}


def parse_github_coords(raw: str) -> Optional[tuple[str, str]]:
    """Extract (owner, repo) from URL or owner/repo string."""
    clean = raw.strip()
    # Match https://github.com/owner/repo or github.com/owner/repo or owner/repo
    pattern = r"(?:https?://)?(?:www\.)?github\.com/([^/]+)/([^/#?]+)"
    match = re.search(pattern, clean, re.IGNORECASE)
    if match:
        owner = match.group(1).strip()
        repo = match.group(2).strip().rstrip(".git")
        return owner, repo
    
    # Or shorthand owner/repo
    shorthand = re.match(r"^([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)$", clean)
    if shorthand:
        return shorthand.group(1).strip(), shorthand.group(2).strip().rstrip(".git")
        
    return None


def detect_category(repo_data: dict) -> str:
    """Intelligently map GitHub repo language and topics to project domains."""
    topics = [t.lower() for t in repo_data.get("topics", [])]
    language = (repo_data.get("language") or "").lower()
    description = (repo_data.get("description") or "").lower()
    combined_text = f"{' '.join(topics)} {language} {description}"

    if any(k in combined_text for k in ["computer vision", "opencv", "yolo", "object detection"]):
        return "Computer Vision"
    if any(k in combined_text for k in ["natural language", "nlp", "transformers", "sentiment", "bert"]):
        return "Natural Language Processing"
    if any(k in combined_text for k in ["llm", "generative ai", "langchain", "llama", "gemini", "agent"]):
        return "Generative AI & AI Agents"
    if any(k in combined_text for k in ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit", "model"]):
        return "AI & Machine Learning"
    if any(k in combined_text for k in ["cybersecurity", "security", "cryptography", "infosec", "pentest", "vulnerability"]):
        return "Cybersecurity"
    if any(k in combined_text for k in ["data science", "data analysis", "pandas", "jupyter", "visualization"]):
        return "Data Science & Analytics"
    if any(k in combined_text for k in ["docker", "kubernetes", "devops", "ci/cd", "terraform", "aws", "cloud"]):
        return "Cloud Computing & DevOps"
    if any(k in combined_text for k in ["android", "ios", "flutter", "react native", "swift", "kotlin", "mobile"]):
        return "Mobile App Development"
    if any(k in combined_text for k in ["blockchain", "web3", "solidity", "ethereum", "smart contract", "crypto"]):
        return "Blockchain & Web3"
    if any(k in combined_text for k in ["iot", "arduino", "raspberry", "esp32", "embedded", "sensors"]):
        return "Internet of Things"
    if any(k in combined_text for k in ["robotics", "ros", "drone", "automation"]):
        return "Robotics & Automation"
    if any(k in combined_text for k in ["big data", "spark", "kafka", "hadoop", "etl"]):
        return "Data Engineering & Big Data"
    if any(k in combined_text for k in ["fintech", "finance", "trading", "banking", "payment"]):
        return "FinTech"
    if any(k in combined_text for k in ["health", "medical", "clinical", "hospital"]):
        return "HealthTech"
    if any(k in combined_text for k in ["edtech", "education", "learning", "student", "quiz"]):
        return "EdTech"
    if any(k in combined_text for k in ["game", "unity", "unreal", "godot", "pygame"]):
        return "Game Development"
    if any(k in combined_text for k in ["ar", "vr", "augmented reality", "virtual reality", "xr"]):
        return "AR/VR"
    if any(k in combined_text for k in ["react", "next.js", "vue", "fastapi", "django", "express", "node", "flask", "full stack", "html", "css", "javascript", "typescript"]):
        return "Web Development & Full Stack"
        
    return "Open Source & Developer Utilities"


def extract_tech_stacks(repo_data: dict) -> List[str]:
    """Extract standard tech stack badges from repository language and topics."""
    stacks = []
    lang = repo_data.get("language")
    if lang and lang not in stacks:
        stacks.append(lang)

    for topic in repo_data.get("topics", []):
        cleaned = topic.replace("-", " ").title()
        if cleaned not in stacks and len(stacks) < 8:
            stacks.append(cleaned)

    # Ensure at least one tech stack
    if not stacks:
        stacks = ["Python", "FastAPI"] if lang == "Python" else ["React", "JavaScript"]

    return stacks


def humanize_title(name: str) -> str:
    """Turn repo slug 'student-project-showcase' into 'Student Project Showcase'."""
    words = re.split(r"[-_]+", name)
    return " ".join(w.capitalize() for w in words if w)


@router.get(
    "/repo",
    summary="Fetch repository metadata from GitHub",
    description="Resolves repository title, description, stars, author, language, and topics from GitHub URL or owner/repo.",
)
async def fetch_github_repository(
    url: str = Query(..., description="GitHub repository URL or owner/repo slug"),
):
    coords = parse_github_coords(url)
    if not coords:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GitHub URL format. Use https://github.com/owner/repo or owner/repo",
        )

    owner, repo = coords
    target_api = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(target_api, headers=DEFAULT_HEADERS)
            if resp.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"GitHub repository '{owner}/{repo}' not found or is private.",
                )
            if resp.status_code == 403:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="GitHub rate limit reached. Please try again shortly or fill manually.",
                )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"GitHub API returned error status {resp.status_code}",
                )

            data = resp.json()
    except httpx.RequestError as exc:
        logger.error("GitHub request failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach GitHub. Please check your internet connection.",
        )

    return {
        "title": humanize_title(data.get("name", repo)),
        "raw_name": data.get("name"),
        "description": data.get("description") or f"Open source repository {owner}/{repo} hosted on GitHub.",
        "github_link": data.get("html_url") or f"https://github.com/{owner}/{repo}",
        "demo_url": data.get("homepage") if data.get("homepage") and data.get("homepage").startswith("http") else None,
        "primary_language": data.get("language"),
        "topics": data.get("topics", []),
        "tech_stacks": extract_tech_stacks(data),
        "suggested_category": detect_category(data),
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "open_issues": data.get("open_issues_count", 0),
        "author_display_name": data.get("owner", {}).get("login", owner),
        "author_avatar_url": data.get("owner", {}).get("avatar_url"),
        "author_profile_url": data.get("owner", {}).get("html_url", f"https://github.com/{owner}"),
    }


@router.get(
    "/user/{username}/repos",
    summary="List public GitHub repositories for a user or organization",
)
async def list_user_repositories(
    username: str,
    limit: int = Query(15, ge=1, le=50),
):
    target_api = f"{GITHUB_API_BASE}/users/{username.strip()}/repos?sort=updated&per_page={limit}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(target_api, headers=DEFAULT_HEADERS)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=f"Could not fetch repos for user '{username}'")
            repos = resp.json()
    except httpx.RequestError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to connect to GitHub: {str(exc)}")

    results = []
    for r in repos:
        if r.get("fork") and not r.get("description"):
            continue
        results.append({
            "name": r.get("name"),
            "title": humanize_title(r.get("name")),
            "description": r.get("description") or "No description provided",
            "github_link": r.get("html_url"),
            "demo_url": r.get("homepage") if r.get("homepage") and r.get("homepage").startswith("http") else None,
            "stars": r.get("stargazers_count", 0),
            "language": r.get("language"),
            "topics": r.get("topics", []),
            "tech_stacks": extract_tech_stacks(r),
            "suggested_category": detect_category(r),
            "author_display_name": r.get("owner", {}).get("login"),
            "author_avatar_url": r.get("owner", {}).get("avatar_url"),
            "author_profile_url": r.get("owner", {}).get("html_url"),
        })

    return {"username": username, "data": results, "total": len(results)}


@router.get(
    "/search",
    summary="Search public GitHub repositories",
)
async def search_github_repositories(
    q: str = Query(..., min_length=2, description="Search query keywords or topics"),
    limit: int = Query(12, ge=1, le=30),
):
    target_api = f"{GITHUB_API_BASE}/search/repositories?q={q.strip()}&sort=stars&order=desc&per_page={limit}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(target_api, headers=DEFAULT_HEADERS)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="GitHub search error")
            data = resp.json()
    except httpx.RequestError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to connect to GitHub: {str(exc)}")

    items = data.get("items", [])
    results = []
    for r in items:
        results.append({
            "name": r.get("name"),
            "title": humanize_title(r.get("name")),
            "description": r.get("description") or "No description provided",
            "github_link": r.get("html_url"),
            "demo_url": r.get("homepage") if r.get("homepage") and r.get("homepage").startswith("http") else None,
            "stars": r.get("stargazers_count", 0),
            "language": r.get("language"),
            "tech_stacks": extract_tech_stacks(r),
            "suggested_category": detect_category(r),
            "author_display_name": r.get("owner", {}).get("login"),
            "author_avatar_url": r.get("owner", {}).get("avatar_url"),
            "author_profile_url": r.get("owner", {}).get("html_url"),
        })

    return {"query": q, "data": results, "total": data.get("total_count", len(results))}
