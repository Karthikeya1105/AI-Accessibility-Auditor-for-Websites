import PDFDocument from 'pdfkit';

export class ReportService {
  /**
   * Generates a downloadable PDF accessibility compliance audit report.
   * Supports both single-page and multi-page batch site scan reports.
   * @param {object} scanData 
   * @returns {Promise<Buffer>}
   */
  static generatePdfReport(scanData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const isBatch = Boolean(scanData.isBatch);

        // Header Background Banner
        doc
          .rect(0, 0, doc.page.width, 100)
          .fill('#1E293B');

        // Document Title
        doc
          .fillColor('#FFFFFF')
          .fontSize(22)
          .font('Helvetica-Bold')
          .text(isBatch ? 'Site-Wide Accessibility Audit Report' : 'AI Accessibility Audit Report', 40, 30);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#94A3B8')
          .text(`Target: ${scanData.baseUrl || scanData.url || scanData.pageTitle || 'HTML Audit'}`, 40, 60)
          .text(`Scanned: ${new Date(scanData.timestamp || Date.now()).toLocaleString()} | Pages Analyzed: ${scanData.pagesScanned || 1}`, 40, 75);

        // Score Badge Card
        let scoreColor = '#22C55E';
        if (scanData.score < 50) scoreColor = '#EF4444';
        else if (scanData.score < 80) scoreColor = '#F59E0B';

        doc
          .rect(doc.page.width - 150, 20, 110, 60)
          .fill(scoreColor);

        doc
          .fillColor('#FFFFFF')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text(`${scanData.score}%`, doc.page.width - 150, 30, { width: 110, align: 'center' });

        doc
          .fontSize(8)
          .font('Helvetica')
          .text('OVERALL SCORE', doc.page.width - 150, 58, { width: 110, align: 'center' });

        doc.y = 120;

        // 1. Executive Summary & Status
        doc
          .fillColor('#0F172A')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('1. Executive Summary', 40, doc.y);

        doc.moveDown(0.5);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#334155')
          .text(`Status: ${scanData.wcagLevel}`)
          .text(`Total Critical: ${scanData.counts.critical} | Major: ${scanData.counts.major} | Minor: ${scanData.counts.minor}`);

        doc.moveDown(1);

        // 2. Category Breakdown Scores
        doc
          .fillColor('#0F172A')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('2. Category Breakdown Scores');

        doc.moveDown(0.5);

        if (scanData.categoryScores) {
          Object.entries(scanData.categoryScores).forEach(([cat, catScore]) => {
            doc
              .fontSize(10)
              .font('Helvetica-Bold')
              .fillColor('#475569')
              .text(`${cat}: `, { continued: true })
              .font('Helvetica')
              .fillColor(catScore > 80 ? '#16A34A' : catScore > 50 ? '#D97706' : '#DC2626')
              .text(`${catScore}%`);
          });
        }

        doc.moveDown(1.5);

        // If Batch, show Page Score Summary & Most Common Site-Wide Violations
        if (isBatch && scanData.pages) {
          doc
            .fillColor('#0F172A')
            .fontSize(14)
            .font('Helvetica-Bold')
            .text(`3. Page-by-Page Scores (${scanData.pages.length} Pages Scanned)`);

          doc.moveDown(0.5);

          scanData.pages.forEach(p => {
            doc
              .fontSize(9)
              .font('Helvetica-Bold')
              .fillColor('#1E293B')
              .text(`${p.pageTitle || p.url}: `, { continued: true })
              .font('Helvetica')
              .fillColor(p.score > 80 ? '#16A34A' : p.score > 50 ? '#D97706' : '#DC2626')
              .text(`${p.score}%  (Critical: ${p.counts?.critical || 0}, Major: ${p.counts?.major || 0}, Minor: ${p.counts?.minor || 0})`);
            doc.moveDown(0.2);
          });

          doc.moveDown(1.5);

          if (scanData.issueFrequency && scanData.issueFrequency.length > 0) {
            doc
              .fillColor('#0F172A')
              .fontSize(14)
              .font('Helvetica-Bold')
              .text(`4. Most Common Site-Wide Violations`);

            doc.moveDown(0.5);

            scanData.issueFrequency.slice(0, 5).forEach((freq, idx) => {
              doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#991B1B')
                .text(`#${idx + 1} ${freq.category} - ${freq.context}`)
                .font('Helvetica')
                .fillColor('#334155')
                .text(`Occurrences: ${freq.occurrences} | Affected Pages: ${freq.affectedPagesCount} (${freq.affectedPages.slice(0, 3).join(', ')})`);
              doc.moveDown(0.4);
            });

            doc.moveDown(1.5);
          }
        }

        // 5. Detailed Findings & Fixes
        const issuesList = isBatch ? (scanData.issueFrequency || []) : (scanData.issues || []);
        doc
          .fillColor('#0F172A')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(`${isBatch ? '5. Site-Wide' : '3.'} Detailed Issues & Remediation (${issuesList.length} Unique Rules)`);

        doc.moveDown(0.5);

        issuesList.forEach((issue, index) => {
          if (doc.y > doc.page.height - 120) {
            doc.addPage();
          }

          let sevBg = '#F3F4F6';
          let sevColor = '#374151';
          if (issue.severity === 'Critical') {
            sevBg = '#FEE2E2';
            sevColor = '#991B1B';
          } else if (issue.severity === 'Major') {
            sevBg = '#FEF3C7';
            sevColor = '#92400E';
          }

          // Issue Container Box
          const boxY = doc.y;
          doc
            .rect(40, boxY, doc.page.width - 80, 20)
            .fill(sevBg);

          doc
            .fillColor(sevColor)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`#${index + 1} [${issue.severity}] ${issue.category} ${issue.element ? '- <' + issue.element + '>' : ''}`, 45, boxY + 5);

          doc.y = boxY + 25;

          doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .fillColor('#1E293B')
            .text(`WCAG: `, 45, doc.y, { continued: true })
            .font('Helvetica')
            .fillColor('#475569')
            .text(issue.wcag || 'WCAG 2.1 AA');

          doc.moveDown(0.3);

          doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .fillColor('#1E293B')
            .text(`Explanation: `, 45, doc.y, { continued: true })
            .font('Helvetica')
            .fillColor('#334155')
            .text(issue.explanation || issue.context);

          doc.moveDown(0.3);

          // Code Diff Box
          if (issue.originalSnippet) {
            doc
              .fontSize(8)
              .font('Helvetica-Bold')
              .fillColor('#DC2626')
              .text(`Problematic Code: `);

            doc
              .font('Courier')
              .fillColor('#7F1D1D')
              .text(issue.originalSnippet.substring(0, 180));

            doc.moveDown(0.2);
          }

          if (issue.suggestedFixCode) {
            doc
              .fontSize(8)
              .font('Helvetica-Bold')
              .fillColor('#16A34A')
              .text(`Suggested Code Fix: `);

            doc
              .font('Courier')
              .fillColor('#14532D')
              .text(issue.suggestedFixCode.substring(0, 180));

            doc.moveDown(1);
          }
        });

        // Footer Disclaimer
        doc.moveDown(2);
        doc
          .fontSize(8)
          .font('Helvetica-Oblique')
          .fillColor('#94A3B8')
          .text('Note: This automated audit report serves as an internal assessment indicator and does not replace comprehensive human accessibility evaluation or formal WCAG legal certification.', { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
