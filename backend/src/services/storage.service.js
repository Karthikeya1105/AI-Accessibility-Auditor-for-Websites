import fs from 'fs';
import path from 'path';

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

  static saveScan(scanData) {
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
    return scanData;
  }

  static getScan(scanId) {
    return StorageService.scans.get(scanId) || null;
  }

  static getAllScans() {
    return Array.from(StorageService.scans.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

// Auto initialize on module load
StorageService.init();
