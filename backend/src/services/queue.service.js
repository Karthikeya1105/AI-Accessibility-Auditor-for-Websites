import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

class BatchQueueService extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
  }

  /**
   * Creates a new background job for batch site auditing.
   * @param {object} payload { url, selectedUrls, maxPages, userId }
   * @returns {string} jobId
   */
  createJob(payload) {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const jobRecord = {
      id: jobId,
      payload,
      status: 'pending',
      progress: 0,
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobs.set(jobId, jobRecord);
    logger.info(`[QueueService] Batch audit job created: ${jobId}`);
    return jobId;
  }

  /**
   * Retrieves current status of a background job.
   * @param {string} jobId 
   * @returns {object|null}
   */
  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Updates progress or status of a background job.
   * @param {string} jobId 
   * @param {object} updates { status, progress, result, error }
   */
  updateJob(jobId, updates) {
    const job = this.jobs.get(jobId);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date().toISOString() });
      this.jobs.set(jobId, job);
      this.emit(`job:${jobId}`, job);
    }
  }
}

export const QueueService = new BatchQueueService();
