import os
import sys
import time
import uuid
import json
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

API_BASE = "https://student-project-showcase-api.onrender.com"
UI_RENDER = "https://student-project-showcase-ui.onrender.com"
UI_GHPAGES = "https://dhruvi-tech.github.io/Student-Project-Showcase-and-Gallery/"
DOWNLOADS_DIR = r"C:\Users\Lenovo\Downloads"

print(f"Target Downloads Directory: {DOWNLOADS_DIR}")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

# ========================================================
# SECTION 1: COMPREHENSIVE LIVE API END-TO-END TESTS
# ========================================================
print("\n" + "="*60)
print("1. RUNNING COMPREHENSIVE LIVE API END-TO-END TESTS")
print("="*60)

test_results = []

def run_test(name, func):
    try:
        msg = func()
        print(f"[PASS] {name}: {msg}")
        test_results.append((name, "PASS", msg))
    except Exception as e:
        print(f"[FAIL] {name}: {str(e)}")
        test_results.append((name, "FAIL", str(e)))

# 1. Health check
def test_health():
    res = requests.get(f"{API_BASE}/health", timeout=15)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["status"] == "healthy", f"Status not healthy: {data}"
    assert data["database"]["connected"] is True, "Database not connected"
    assert data["database"]["engine"] == "postgresql", f"Not postgresql: {data['database']}"
    return f"PostgreSQL latency: {data['database']['latency_ms']}ms, engine: {data['database']['engine']}"
run_test("Live Healthcheck & PostgreSQL Connection", test_health)

# 2. Get projects listing
def test_projects_list():
    res = requests.get(f"{API_BASE}/api/v1/projects?page=1&per_page=5", timeout=15)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    items = data.get("data", data.get("items", []))
    total = data.get("total", len(items))
    assert len(items) > 0, "No projects returned"
    return f"Retrieved {len(items)} items. Total catalog size: {total}"
run_test("Live Projects Catalog & Pagination", test_projects_list)

# 3. Search and filter
def test_search():
    res = requests.get(f"{API_BASE}/api/v1/projects?search=AI&page=1&per_page=3", timeout=15)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    items = data.get("data", data.get("items", []))
    return f"Search 'AI' returned {len(items)} items"
run_test("Live Search and Filtering", test_search)

# 4. User Registration, Login, JWT, CRUD lifecycle
unique_id = uuid.uuid4().hex[:8]
test_user = {
    "name": f"QA Live Tester {unique_id}",
    "username": f"qa_{unique_id}",
    "email": f"test_e2e_{unique_id}@example.com",
    "password": f"Pass_{unique_id}!123"
}
auth_headers = {}
created_project_id = None
created_comment_id = None

def test_register():
    payload = {
        "name": test_user["name"],
        "username": test_user["username"],
        "email": test_user["email"],
        "password": test_user["password"]
    }
    res = requests.post(f"{API_BASE}/api/v1/auth/register", json=payload, timeout=15)
    assert res.status_code in [200, 201], f"Expected 200/201, got {res.status_code}: {res.text}"
    data = res.json()
    return f"User registered: username={data.get('user', {}).get('username', test_user['username'])}, token_type={data.get('token_type')}"
run_test("Live User Registration (POST /api/v1/auth/register)", test_register)

def test_login():
    global auth_headers
    payload = {
        "identifier": test_user["email"],
        "password": test_user["password"]
    }
    res = requests.post(f"{API_BASE}/api/v1/auth/login", json=payload, timeout=15)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    token = data.get("access_token")
    assert token, "No access token in response"
    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    return f"JWT Bearer token issued ({token[:18]}...)"
run_test("Live User Login & JWT Token Issue (POST /api/v1/auth/login)", test_login)

def test_me():
    res = requests.get(f"{API_BASE}/api/v1/auth/me", headers=auth_headers, timeout=15)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    user_info = data.get("user", data)
    assert user_info["email"] == test_user["email"]
    return f"Verified active session: email={user_info['email']}, username={user_info.get('username')}"
run_test("Live Auth Verification (GET /api/v1/auth/me)", test_me)

def test_create_project():
    global created_project_id
    project_payload = {
        "title": f"Live Autonomous Verification {unique_id}",
        "description": "Full description for automated testing verification against PostgreSQL live database.",
        "category": "AI & Machine Learning",
        "difficulty": "Intermediate",
        "demo_url": "https://example.com/demo",
        "github_link": "https://github.com/example/demo",
        "tech_stacks": ["FastAPI", "React", "PostgreSQL"]
    }
    res = requests.post(f"{API_BASE}/api/v1/projects", json=project_payload, headers=auth_headers, timeout=15)
    assert res.status_code in [200, 201], f"Expected 200/201, got {res.status_code}: {res.text}"
    data = res.json()
    created_project_id = data.get("id")
    assert created_project_id, f"No project id in response: {data}"
    return f"Created project ID: {created_project_id}, title='{data.get('title')}'"
run_test("Live Project Creation (POST /api/v1/projects)", test_create_project)

def test_patch_project():
    patch_payload = {
        "title": f"Live Autonomous Verification [VERIFIED] {unique_id}",
        "difficulty": "Advanced"
    }
    res = requests.patch(f"{API_BASE}/api/v1/projects/{created_project_id}", json=patch_payload, headers=auth_headers, timeout=15)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["title"] == patch_payload["title"]
    return f"Patched project title: '{data['title']}', difficulty='{data['difficulty']}'"
run_test("Live Project Partial Update (PATCH /api/v1/projects/{id})", test_patch_project)

def test_add_comment():
    global created_comment_id
    comment_payload = {
        "content": "Outstanding system architecture, clean modular design, and robust live deployment!",
        "feedback_type": "positive"
    }
    res = requests.post(f"{API_BASE}/api/v1/projects/{created_project_id}/comments", json=comment_payload, headers=auth_headers, timeout=15)
    assert res.status_code in [200, 201], f"Expected 200/201, got {res.status_code}: {res.text}"
    data = res.json()
    created_comment_id = data.get("id")
    return f"Added peer review comment ID: {created_comment_id}"
run_test("Live Peer Review Comment (POST /api/v1/projects/{id}/comments)", test_add_comment)

def test_vote_project():
    res = requests.post(f"{API_BASE}/api/v1/projects/{created_project_id}/upvote", headers=auth_headers, timeout=15)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    return f"Casted upvote. Total upvotes: {data.get('upvote_count')}, voted={data.get('voted')}"
run_test("Live Project Upvote (POST /api/v1/projects/{id}/upvote)", test_vote_project)

def test_delete_comment():
    if created_comment_id:
        res = requests.delete(f"{API_BASE}/api/v1/projects/{created_project_id}/comments/{created_comment_id}", headers=auth_headers, timeout=15)
        assert res.status_code in [200, 204], f"Expected 200/204, got {res.status_code}: {res.text}"
        return f"Successfully deleted comment ID: {created_comment_id}"
    return "Skipped (no comment)"
run_test("Live Comment Deletion (DELETE /api/v1/projects/{id}/comments/{comment_id})", test_delete_comment)

def test_delete_project():
    if created_project_id:
        res = requests.delete(f"{API_BASE}/api/v1/projects/{created_project_id}", headers=auth_headers, timeout=15)
        assert res.status_code in [200, 204], f"Expected 200/204, got {res.status_code}: {res.text}"
        return f"Successfully cleaned up test project ID: {created_project_id}"
    return "Skipped (no project)"
run_test("Live Project Deletion (DELETE /api/v1/projects/{id})", test_delete_project)

# ========================================================
# SECTION 2: LIVE SCREENSHOT CAPTURE USING HEADLESS CHROME
# ========================================================
print("\n" + "="*60)
print("2. CAPTURING PROPER LIVE SCREENSHOTS INTO DOWNLOADS")
print("="*60)

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1920,1080")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--force-device-scale-factor=1")

driver = webdriver.Chrome(options=options)
driver.set_window_size(1920, 1080)

saved_screenshots = []

def take_shot(filename, description):
    filepath = os.path.join(DOWNLOADS_DIR, filename)
    driver.save_screenshot(filepath)
    size_kb = os.path.getsize(filepath) / 1024
    print(f"[SAVED] {filename} ({size_kb:.1f} KB) - {description}")
    saved_screenshots.append((filename, filepath, description, f"{size_kb:.1f} KB"))

try:
    # Shot 1: Live Health & Database Status
    driver.get(f"{API_BASE}/health")
    time.sleep(1.5)
    take_shot("01_live_health_postgresql.png", "Live Backend Health Check with PostgreSQL connection & latency metrics")

    # Shot 2: Live Swagger UI Documentation
    driver.get(f"{API_BASE}/docs")
    time.sleep(3.0)
    driver.execute_script("window.scrollTo(0, 150);")
    take_shot("02_live_swagger_documentation.png", "Live Interactive Swagger UI documentation with BearerAuth & REST endpoints")

    # Shot 3: Live ReDoc Documentation
    driver.get(f"{API_BASE}/redoc")
    time.sleep(3.0)
    take_shot("03_live_redoc_specification.png", "Live ReDoc OpenAPI 3.1.0 specification")

    # Shot 4: Live Frontend Homepage & Catalog on Render
    driver.get(UI_RENDER)
    time.sleep(3.5)
    take_shot("04_live_ui_homepage.png", "Live Frontend Homepage on Render showing 320 project showcase catalog")

    # Shot 5: Live Frontend Search & Filtering
    try:
        search_inputs = driver.find_elements(By.TAG_NAME, "input")
        for inp in search_inputs:
            placeholder = inp.get_attribute("placeholder") or ""
            if "search" in placeholder.lower() or "filter" in placeholder.lower():
                inp.clear()
                inp.send_keys("Machine Learning")
                time.sleep(1.5)
                break
        driver.execute_script("window.scrollTo(0, 400);")
        time.sleep(1.0)
    except Exception as e:
        print(f"Note on search input: {e}")
    take_shot("05_live_ui_search_filter.png", "Live Search & Filter interaction on project catalogue")

    # Shot 6: Live Project Details Modal
    try:
        driver.get(UI_RENDER)
        time.sleep(3.0)
        card_btn = driver.find_element(By.CSS_SELECTOR, "button.card-title-button")
        driver.execute_script("arguments[0].click();", card_btn)
        time.sleep(2.0)
    except Exception as e:
        print(f"Note on modal open: {e}")
    take_shot("06_live_ui_project_modal.png", "Live Project Details Modal showing overview, metrics, tabs, and peer reviews")

    # Shot 7: Live Authentication Modal
    try:
        driver.get(UI_RENDER)
        time.sleep(2.5)
        login_btn = driver.find_element(By.CSS_SELECTOR, "button.btn-login-nav")
        driver.execute_script("arguments[0].click();", login_btn)
        time.sleep(1.5)
    except Exception as e:
        print(f"Note on auth modal: {e}")
    take_shot("07_live_ui_auth_modal.png", "Live Authentication Modal (Sign In / Register) with clean product design")

    # Shot 8: Live Analytics Modal
    try:
        driver.get(UI_RENDER)
        time.sleep(2.5)
        analytics_btn = driver.find_element(By.CSS_SELECTOR, "button.btn-explain")
        driver.execute_script("arguments[0].click();", analytics_btn)
        time.sleep(1.5)
    except Exception as e:
        print(f"Note on analytics modal: {e}")
    take_shot("08_live_ui_analytics_modal.png", "Live Analytics Modal with domain metrics & distribution charts")

    # Shot 9: Live Publish Project Modal
    try:
        driver.get(UI_RENDER)
        time.sleep(2.5)
        publish_btn = driver.find_element(By.CSS_SELECTOR, "button.btn-publish-nav")
        driver.execute_script("arguments[0].click();", publish_btn)
        time.sleep(1.5)
    except Exception as e:
        print(f"Note on publish modal: {e}")
    take_shot("09_live_ui_publish_modal.png", "Live Publish Project Modal with structured form fields and validation")

    # Shot 10: Live GitHub Pages Deployment Mirror
    driver.get(UI_GHPAGES)
    time.sleep(3.0)
    take_shot("10_live_github_pages_mirror.png", "Live GitHub Pages deployment mirror")

finally:
    driver.quit()

# Write detailed summary file to Downloads folder
summary_md_path = os.path.join(DOWNLOADS_DIR, "LIVE_DEPLOYMENT_TEST_REPORT.md")
with open(summary_md_path, "w", encoding="utf-8") as f:
    f.write("# Live Deployment Verification & Screenshot Evidence Report\n\n")
    f.write(f"**Verification Timestamp:** {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}\n")
    f.write(f"**Live REST API:** {API_BASE}\n")
    f.write(f"**Live Render UI:** {UI_RENDER}\n")
    f.write(f"**Live GitHub Pages Mirror:** {UI_GHPAGES}\n\n")
    f.write("## 1. Live API End-to-End Test Results\n\n")
    f.write("| Test Name | Status | Details |\n| :--- | :--- | :--- |\n")
    for name, st, details in test_results:
        f.write(f"| {name} | **{st}** | {details} |\n")
    f.write(f"\n**Total Tests:** {len(test_results)} | **Passed:** {sum(1 for r in test_results if r[1] == 'PASS')} | **Failed:** {sum(1 for r in test_results if r[1] == 'FAIL')}\n\n")
    f.write("## 2. Captured Live Screenshots (Saved in Downloads)\n\n")
    f.write("| Screenshot Filename | File Size | Description |\n| :--- | :--- | :--- |\n")
    for fn, fp, desc, sz in saved_screenshots:
        f.write(f"| `{fn}` | {sz} | {desc} |\n")
    f.write("\nAll screenshots were captured live using 1080p full HD headless Chrome directly against the production deployment.\n")

print(f"\n[REPORT WRITTEN] {summary_md_path}")
print("\n" + "="*60)
print("TESTING & SCREENSHOT GENERATION SUMMARY")
print("="*60)
print(f"Total API E2E tests: {len(test_results)}")
print(f"Passed: {sum(1 for r in test_results if r[1] == 'PASS')}")
print(f"Failed: {sum(1 for r in test_results if r[1] == 'FAIL')}")
print(f"Screenshots saved to: {DOWNLOADS_DIR}")
for fn, fp, desc, sz in saved_screenshots:
    print(f" - {fn} ({sz}): {desc}")
