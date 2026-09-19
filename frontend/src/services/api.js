import axios from 'axios';

const API_BASE = '/api';

// Create Axios Instance with Bearer Token Interceptor
const apiClient = axios.create({
  baseURL: API_BASE
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('a11y_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  /**
   * Auth Endpoints
   */
  async register(payload) {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },

  async login(payload) {
    const res = await apiClient.post('/auth/login', payload);
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  /**
   * Health check
   */
  async checkHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  /**
   * Initiate single scan
   */
  async runScan(payload) {
    const res = await apiClient.post('/scan', payload);
    return res.data;
  },

  /**
   * Discover internal site pages
   */
  async discoverPages(url) {
    const res = await apiClient.post('/scan/batch/discover', { url });
    return res.data;
  },

  /**
   * Initiate batch site scan
   */
  async runBatchScan(payload) {
    const res = await apiClient.post('/scan/batch', payload);
    return res.data;
  },

  /**
   * Compare two scan versions
   */
  async compareScans(id1, id2) {
    const res = await apiClient.get(`/scan/compare/${id1}/${id2}`);
    return res.data;
  },

  /**
   * Fetch website trend analytics
   */
  async getWebsiteTrends(websiteId) {
    const res = await apiClient.get(`/scan/websites/${websiteId}/trends`);
    return res.data;
  },

  /**
   * Fetch scan history
   */
  async getHistory() {
    const res = await apiClient.get('/scan/history');
    return res.data;
  },

  /**
   * Get scan by ID
   */
  async getScanById(scanId) {
    const res = await apiClient.get(`/scan/${scanId}`);
    return res.data;
  },

  /**
   * Get PDF download URL
   */
  getPdfDownloadUrl(scanId) {
    return `${API_BASE}/report/${scanId}/pdf`;
  }
};
