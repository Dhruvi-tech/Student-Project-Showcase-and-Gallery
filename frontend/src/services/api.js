/**
 * API Service for Student Project Showcase and Peer Gallery
 * Interacts with FastAPI backend at /api/v1 and /health
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
let csrfToken = null;

async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, { credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || 'Could not initialize secure session');
  csrfToken = data.csrf_token;
  return csrfToken;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const csrfExempt = endpoint === '/api/v1/auth/login' || endpoint === '/api/v1/auth/register';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !csrfExempt) {
    csrfToken = csrfToken || await getCsrfToken();
  }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };
  if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)) defaultHeaders['X-CSRF-Token'] = csrfToken;

  const config = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.detail?.message ||
        (typeof data?.detail === 'string' ? data.detail : null) ||
        (Array.isArray(data?.detail) ? data.detail.map((item) => item.msg).join('; ') : null) ||
        data?.message ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to the Backend API${API_BASE_URL ? ` at ${API_BASE_URL}` : ''}. Ensure FastAPI is running.`);
    }
    throw error;
  }
}

export const api = {
  async registerAccount(account) {
    return request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(account) });
  },

  async login(identifier, password) {
    return request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
  },

  async logout() {
    const result = await request('/api/v1/auth/logout', { method: 'POST' });
    csrfToken = null;
    return result;
  },

  async getCurrentUser() {
    return request('/api/v1/auth/me');
  },

  async updateCurrentUser(profile) {
    return request('/api/v1/auth/me', { method: 'PATCH', body: JSON.stringify(profile) });
  },

  async updateProject(id, projectData, studentId = '') {
    const headers = {};
    if (studentId) headers['X-Student-Id'] = studentId;
    return request(`/api/v1/projects/${id}`, { method: 'PUT', headers, body: JSON.stringify(projectData) });
  },

  async deleteProject(id, studentId = '') {
    const headers = {};
    if (studentId) headers['X-Student-Id'] = studentId;
    return request(`/api/v1/projects/${id}`, { method: 'DELETE', headers });
  },

  async uploadAsset(file, studentId = '') {
    const form = new FormData();
    form.append('file', file);
    const headers = {};
    if (studentId) headers['X-Student-Id'] = studentId;
    return request('/api/v1/assets', { method: 'POST', headers, body: form });
  },

  async getMyProjects() {
    return request('/api/v1/my/projects');
  },

  async getBookmarks(studentId = '') {
    const headers = studentId ? { 'X-Student-Id': studentId } : {};
    return request('/api/v1/my/bookmarks', { headers });
  },

  async setBookmark(projectId, saved, studentId = '') {
    const headers = studentId ? { 'X-Student-Id': studentId } : {};
    return request(`/api/v1/projects/${projectId}/bookmark`, { method: saved ? 'POST' : 'DELETE', headers });
  },

  async getRecommendations(studentId = '', limit = 50) {
    const headers = studentId ? { 'X-Student-Id': studentId } : {};
    return request(`/api/v1/recommendations?limit=${limit}`, { headers });
  },

  async getFollowedCategories(studentId = '') {
    const headers = studentId ? { 'X-Student-Id': studentId } : {};
    return request('/api/v1/preferences/categories', { headers });
  },

  async setFollowedCategories(categories, studentId = '') {
    const headers = studentId ? { 'X-Student-Id': studentId } : {};
    return request('/api/v1/preferences/categories', { method: 'PUT', headers, body: JSON.stringify({ categories }) });
  },

  async getInterests(studentId = '') {
    const headers = studentId ? { 'X-Student-Id': studentId } : {};
    return request('/api/v1/preferences/interests', { headers });
  },

  async setInterests(interests, studentId = '') {
    const headers = studentId ? { 'X-Student-Id': studentId } : {};
    return request('/api/v1/preferences/interests', { method: 'PUT', headers, body: JSON.stringify({ interests }) });
  },

  async getTechnologies() {
    return request('/api/v1/catalog/technologies');
  },

  async getStudentProfile(id) {
    return request(`/api/v1/students/${id}`);
  },

  async assistProjectDescription(payload) {
    return request('/api/v1/assist/project-description', { method: 'POST', body: JSON.stringify(payload) });
  },
  /**
   * Fetch ranked projects list
   * GET /api/v1/projects?sort=upvotes&tech_stack=...&search=...
   */
  async getProjects({ sort = 'upvotes', techStack = '', category = '', search = '', studentId = '', limit = 100, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (techStack && techStack !== 'All') params.append('tech_stack', techStack);
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const headers = {};
    if (studentId) headers['X-Student-Id'] = studentId;

    return request(`/api/v1/projects?${params.toString()}`, { headers });
  },

  /**
   * Fetch single project details including comments
   * GET /api/v1/projects/{id}
   */
  async getProjectDetails(id, studentId = '') {
    const headers = {};
    if (studentId) headers['X-Student-Id'] = studentId;
    return request(`/api/v1/projects/${id}`, { headers });
  },

  /**
   * Publish a new project
   * POST /api/v1/projects (201 Created)
   */
  async publishProject(projectData, studentId = '') {
    const headers = {};
    if (studentId) headers['X-Student-Id'] = studentId;

    return request('/api/v1/projects', {
      method: 'POST',
      headers,
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Upvote a project
   * POST /api/v1/projects/{id}/upvote (200 OK or 409 Conflict)
   */
  async upvoteProject(id, studentId) {
    return request(`/api/v1/projects/${id}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    });
  },

  /** Record or switch to a dislike for the selected project. */
  async downvoteProject(id, studentId) {
    return request(`/api/v1/projects/${id}/downvote`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    });
  },

  async removeVote(id, studentId) {
    return request(`/api/v1/projects/${id}/vote`, {
      method: 'DELETE',
      body: JSON.stringify({ student_id: studentId }),
    });
  },

  /**
   * Add peer feedback comment
   * POST /api/v1/projects/{id}/comments (201 Created)
   */
  async addComment(id, commentData, studentId = '') {
    const headers = {};
    if (studentId) headers['X-Student-Id'] = studentId;

    return request(`/api/v1/projects/${id}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...commentData,
        student_id: studentId,
      }),
    });
  },

  /**
   * List available development students for the UI persona switcher
   * GET /api/v1/students
   */
  async getStudents() {
    return request('/api/v1/students');
  },

  /**
   * Check backend and database health
   * GET /health
   */
  async getHealth() {
    return request('/health');
  },
};
