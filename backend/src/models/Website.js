import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  websiteId: {
    type: String,
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true
  },
  baseUrl: {
    type: String
  },
  baselineScanId: {
    type: String
  },
  latestScanId: {
    type: String
  },
  firstScannedAt: {
    type: Date,
    default: Date.now
  },
  lastScannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Website = mongoose.models.Website || mongoose.model('Website', websiteSchema);
