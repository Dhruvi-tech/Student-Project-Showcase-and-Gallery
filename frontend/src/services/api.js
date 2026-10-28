/**
 * API Service for Student Project Showcase and Peer Gallery
 * Interacts with FastAPI backend at /api/v1 and /health
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
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
      throw new Error(`Cannot connect to Backend API at ${API_BASE_URL}. Ensure FastAPI is running.`);
    }
    throw error;
  }
}

export const api = {
  /**
   * Fetch ranked projects list
   * GET /api/v1/projects?sort=upvotes&tech_stack=...&search=...
   */
  async getProjects({ sort = 'upvotes', techStack = '', search = '', studentId = '', limit = 100, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (techStack && techStack !== 'All') params.append('tech_stack', techStack);
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
