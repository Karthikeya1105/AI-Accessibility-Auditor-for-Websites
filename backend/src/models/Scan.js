import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  websiteId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  inputType: {
    type: String,
    enum: ['url', 'html', 'batch'],
    default: 'url'
  },
  source: {
    type: { type: String },
    url: String,
    fileName: String,
    fileSize: Number,
    htmlSnippet: String
  },
  url: {
    type: String,
    required: true
  },
  pageTitle: {
    type: String
  },
  mode: {
    type: String,
    enum: ['url', 'raw-html', 'batch'],
    default: 'url'
  },
  isBatch: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'ACCESS_DENIED', 'NOT_FOUND', 'TIMEOUT', 'DNS_ERROR', 'CONNECTION_REFUSED'],
    default: 'completed'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    required: true
  },
  wcagLevel: {
    type: String
  },
  statusBadge: {
    type: String
  },
  counts: {
    critical: { type: Number, default: 0 },
    major: { type: Number, default: 0 },
    minor: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  categoryScores: {
    type: Map,
    of: Number
  },
  performanceImpact: {
    type: mongoose.Schema.Types.Mixed
  },
  issues: [mongoose.Schema.Types.Mixed],
  pages: [mongoose.Schema.Types.Mixed],
  issueFrequency: [mongoose.Schema.Types.Mixed],
  manualReviewItems: [mongoose.Schema.Types.Mixed]
}, {
  timestamps: true
});

export const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);
