import { StorageService } from '../services/storage.service.js';
import { ReportService } from '../services/report.service.js';

export class ReportController {
  /**
   * GET /api/report/:scanId/pdf
   */
  static async downloadPdf(req, res) {
    const { scanId } = req.params;

    try {
      const scanData = StorageService.getScan(scanId);
      if (!scanData) {
        return res.status(404).json({ error: 'Scan result not found for PDF generation.' });
      }

      const pdfBuffer = await ReportService.generatePdfReport(scanData);

      const filename = `accessibility-audit-${scanId}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.end(pdfBuffer);
    } catch (err) {
      console.error('[ReportController] PDF generation failed:', err);
      return res.status(500).json({ error: 'Failed to generate PDF compliance report.' });
    }
  }
}
