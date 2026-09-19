import { Router } from 'express';
import { ScanController } from '../controllers/scan.controller.js';

const router = Router();

router.post('/', ScanController.scan);
router.post('/batch/discover', ScanController.discoverPages);
router.post('/batch', ScanController.batchScan);
router.get('/compare/:id1/:id2', ScanController.compareScans);
router.get('/websites/:websiteId/trends', ScanController.getWebsiteTrends);
router.get('/history', ScanController.getHistory);
router.get('/:id', ScanController.getScanById);

export default router;
