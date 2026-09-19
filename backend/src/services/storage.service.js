import fs from 'fs';
import path from 'path';
import { isDatabaseConnected } from '../config/db.js';
import { Scan } from '../models/Scan.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'scans.json');

export class StorageService {
  static scans = new Map();

  static init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const list = JSON.parse(raw);
        list.forEach(scan => StorageService.scans.set(scan.id, scan));
        console.log(`[StorageService] Loaded ${StorageService.scans.size} previous scan records from disk.`);
      }
    } catch (err) {
      console.warn('[StorageService] Failed to load scans.json:', err.message);
    }
  }

  static async saveScan(scanData) {
    // 1. In-memory & Disk Save
    StorageService.scans.set(scanData.id, scanData);
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const list = Array.from(StorageService.scans.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[StorageService] Failed to persist scan to disk:', err.message);
    }

    // 2. MongoDB Save if connected
    if (isDatabaseConnected()) {
      try {
        await Scan.findOneAndUpdate({ id: scanData.id }, scanData, { upsert: true, new: true });
        console.log(`[StorageService] Scan ${scanData.id} saved to MongoDB collection 'scans'.`);
      } catch (err) {
        console.warn('[StorageService] MongoDB scan persistence warning:', err.message);
      }
    }

    return scanData;
  }

  static async getScan(scanId) {
    if (isDatabaseConnected()) {
      try {
        const dbScan = await Scan.findOne({ id: scanId }).lean();
        if (dbScan) return dbScan;
      } catch (err) {
        console.warn('[StorageService] MongoDB getScan error, using disk fallback:', err.message);
      }
    }
    return StorageService.scans.get(scanId) || null;
  }

  static async getAllScans(filter = {}) {
    if (isDatabaseConnected()) {
      try {
        const dbScans = await Scan.find(filter).sort({ timestamp: -1 }).lean();
        if (dbScans && dbScans.length > 0) return dbScans;
      } catch (err) {
        console.warn('[StorageService] MongoDB getAllScans error, using disk fallback:', err.message);
      }
    }
    return Array.from(StorageService.scans.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

// Auto initialize on module load
StorageService.init();
