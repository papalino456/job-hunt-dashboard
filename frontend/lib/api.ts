// Use relative URL in production (same origin), localhost in dev
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  posting_url: string;
  date_discovered: string;
  salary_range?: string;
  team_info?: string;
  hiring_manager?: string;
  referral_contact?: string;
  status: string;
  priority: string;
  deadline?: string;
  cv_version?: string;
  date_applied?: string;
  last_contact?: string;
  notes: string;
  research_status: string;
  source: string;
  tags: string[];
}

class API {
  private async request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    
    return res.json();
  }
  
  // Auth
  async login(password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }
  
  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }
  
  async checkAuth() {
    return this.request('/api/auth/status');
  }
  
  // Jobs
  async getJobs(filters?: { status?: string; priority?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return this.request(`/api/jobs${query ? `?${query}` : ''}`);
  }
  
  async getJob(id: string) {
    return this.request(`/api/jobs/${id}`);
  }
  
  async createJob(job: Partial<Job>) {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }
  
  async updateJob(id: string, updates: Partial<Job>) {
    return this.request(`/api/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
  
  async deleteJob(id: string) {
    return this.request(`/api/jobs/${id}`, { method: 'DELETE' });
  }
  
  async getStats() {
    return this.request('/api/jobs/stats');
  }
}

export const api = new API();
