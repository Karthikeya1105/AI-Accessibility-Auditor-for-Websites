import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';

const router = Router();

router.get('/:scanId/pdf', ReportController.downloadPdf);

export default router;
