import axios from 'axios';

const API_BASE = '/api';

export const api = {
  /**
   * Health check
   */
  async checkHealth() {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  /**
   * Initiate single scan
   */
  async runScan(payload) {
    const res = await axios.post(`${API_BASE}/scan`, payload);
    return res.data;
  },

  /**
   * Discover internal site pages
   */
  async discoverPages(url) {
    const res = await axios.post(`${API_BASE}/scan/batch/discover`, { url });
    return res.data;
  },

  /**
   * Initiate batch site scan
   */
  async runBatchScan(payload) {
    const res = await axios.post(`${API_BASE}/scan/batch`, payload);
    return res.data;
  },

  /**
   * Compare two scan versions
   */
  async compareScans(id1, id2) {
    const res = await axios.get(`${API_BASE}/scan/compare/${id1}/${id2}`);
    return res.data;
  },

  /**
   * Fetch website trend analytics
   */
  async getWebsiteTrends(websiteId) {
    const res = await axios.get(`${API_BASE}/scan/websites/${websiteId}/trends`);
    return res.data;
  },

  /**
   * Fetch scan history
   */
  async getHistory() {
    const res = await axios.get(`${API_BASE}/scan/history`);
    return res.data;
  },

  /**
   * Get scan by ID
   */
  async getScanById(scanId) {
    const res = await axios.get(`${API_BASE}/scan/${scanId}`);
    return res.data;
  },

  /**
   * Get PDF download URL
   */
  getPdfDownloadUrl(scanId) {
    return `${API_BASE}/report/${scanId}/pdf`;
  }
};
