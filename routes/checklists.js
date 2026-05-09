import express from "express";
import Checklist from "../models/Checklist.js";
import Audit from "../models/Audit.js";
import PDFDocument from "pdfkit";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const checklists = await Checklist.find().lean();
    res.json({ checklists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch checklists." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { title, module, subModule, machineCode, department, questions, isActive } = req.body;
    const checklist = await Checklist.create({ title, module, subModule, machineCode, department, questions, isActive });
    res.status(201).json({ checklist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create checklist." });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const checklist = await Checklist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!checklist) return res.status(404).json({ message: "Checklist not found." });
    res.json({ checklist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update checklist." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const checklist = await Checklist.findByIdAndDelete(req.params.id);
    if (!checklist) return res.status(404).json({ message: "Checklist not found." });
    res.json({ message: "Checklist deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete checklist." });
  }
});

// Get checklist history (audits)
router.get("/history", auth, isAdmin, async (req, res) => {
  try {
    const { machineCode, dateFrom, dateTo } = req.query;
    let query = {};
    
    if (machineCode) {
      query.machineCode = machineCode;
    }
    
    if (dateFrom || dateTo) {
      query.auditDate = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        query.auditDate.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.auditDate.$lte = to;
      }
    }
    
    const records = await Audit.find(query).sort({ auditDate: -1, createdAt: -1 });

    res.json({ records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch checklist history." });
  }
});

// Export single audit as PDF
router.get("/:id/export-pdf", auth, isAdmin, async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id).populate("userId", "name");
    if (!audit) return res.status(404).json({ message: "Checklist record not found." });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${audit.checklistTitle}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('YOKOHAMA', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(12).font('Helvetica-Bold').text('MACHINE SPECIFIC & HSEE CHECKLIST (YANTAI TBM)', { align: 'center' });
    doc.moveDown(0.8);

    const auditDateLabel = new Date(audit.auditDate || audit.createdAt).toLocaleDateString();
    const infoStart = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('Checklist Title:', 40, infoStart);
    doc.font('Helvetica').text(audit.checklistTitle, 120, infoStart, { width: 360 });

    doc.moveDown(0.7);
    const infoY = doc.y;
    doc.font('Helvetica-Bold').text('Module:', 40, infoY);
    doc.font('Helvetica').text(audit.module, 85, infoY, { width: 220 });
    doc.font('Helvetica-Bold').text('Date:', 360, infoY);
    doc.font('Helvetica').text(auditDateLabel, 390, infoY);

    doc.moveDown(0.7);
    const infoY2 = doc.y;
    doc.font('Helvetica-Bold').text('Sub-Module:', 40, infoY2);
    doc.font('Helvetica').text(audit.subModule, 95, infoY2, { width: 220 });
    doc.font('Helvetica-Bold').text('Filled by:', 360, infoY2);
    doc.font('Helvetica').text(audit.userName || 'Unknown', 415, infoY2, { width: 180 });

    doc.moveDown(0.7);
    const infoY3 = doc.y;
    doc.font('Helvetica-Bold').text('Machine Code:', 40, infoY3);
    doc.font('Helvetica').text(audit.machineCode, 115, infoY3, { width: 220 });

    doc.moveDown(1.2);

    const signatureAnswers = audit.answers.filter(a => /name\s*&\s*sign/i.test(a.question));
    const tableAnswers = audit.answers.filter(a => !/name\s*&\s*sign/i.test(a.question));
    const safetyOfficerSignature = signatureAnswers.find(a => /safety officer/i.test(a.question));
    const shiftInchargeSignature = signatureAnswers.find(a => /shift in-charge/i.test(a.question));
    const safetyOfficerName = safetyOfficerSignature?.answer || safetyOfficerSignature?.remark || '';
    const shiftInchargeName = shiftInchargeSignature?.answer || shiftInchargeSignature?.remark || '';

    const tableTop = doc.y;
    const tableLeft = 40;
    const columnWidths = [28, 265, 40, 40, 130];
    const rowHeight = 22;
    const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('SR./NO.', tableLeft + 4, tableTop, { width: columnWidths[0] - 8 });
    doc.text('CATEGORY / ITEM TO ASSESS', tableLeft + columnWidths[0] + 4, tableTop, { width: columnWidths[1] - 8 });
    doc.text('OK', tableLeft + columnWidths[0] + columnWidths[1] + 4, tableTop, { width: columnWidths[2] - 8, align: 'center' });
    doc.text('NOT OK', tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + 4, tableTop, { width: columnWidths[3] - 8, align: 'center' });
    doc.text('REMARKS', tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 4, tableTop, { width: columnWidths[4] - 8 });

    doc.lineWidth(0.5);
    doc.moveTo(tableLeft, tableTop + rowHeight - 4).lineTo(tableLeft + tableWidth, tableTop + rowHeight - 4).stroke();
    doc.moveTo(tableLeft, tableTop).lineTo(tableLeft, tableTop + rowHeight - 4).stroke();
    let left = tableLeft + columnWidths[0];
    columnWidths.slice(0, -1).forEach((width) => {
      doc.moveTo(left, tableTop).lineTo(left, tableTop + rowHeight - 4).stroke();
      left += width;
    });
    doc.moveTo(tableLeft + tableWidth, tableTop).lineTo(tableLeft + tableWidth, tableTop + rowHeight - 4).stroke();

    let y = tableTop + rowHeight;
    doc.font('Helvetica').fontSize(9);

    const printRow = (number, questionText, answer, remarkText) => {
      const questionHeight = doc.heightOfString(questionText, { width: columnWidths[1] - 8 });
      const remarkHeight = doc.heightOfString(remarkText || '', { width: columnWidths[4] - 8 });
      const height = Math.max(questionHeight, remarkHeight, 14) + 8;
      if (y + height > doc.page.height - 80) {
        doc.addPage();
        y = 40;
      }

      doc.text(number.toString(), tableLeft + 4, y + 3, { width: columnWidths[0] - 8 });
      doc.text(questionText, tableLeft + columnWidths[0] + 4, y + 3, { width: columnWidths[1] - 8 });
      doc.text(answer === 'OK' ? 'X' : '', tableLeft + columnWidths[0] + columnWidths[1] + 4, y + 3, { width: columnWidths[2] - 8, align: 'center' });
      doc.text(answer === 'NOT OK' ? 'X' : '', tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + 4, y + 3, { width: columnWidths[3] - 8, align: 'center' });
      doc.text(remarkText || '', tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 4, y + 3, { width: columnWidths[4] - 8 });

      doc.lineWidth(0.3);
      doc.moveTo(tableLeft, y + height - 4).lineTo(tableLeft + tableWidth, y + height - 4).stroke();
      y += height;
    };

    tableAnswers.forEach((answer, index) => {
      printRow(index + 1, answer.question, answer.answer, answer.remark || '');
    });

    doc.moveDown(1.5);
    if (y + 100 > doc.page.height - 80) {
      doc.addPage();
      y = 40;
    }
    doc.fontSize(10).font('Helvetica-Bold').text('Name & Sign of Safety Officer:', 40, y + 10);
    doc.font('Helvetica').text(safetyOfficerName, 220, y + 10, { width: 260 });
    doc.moveTo(220, y + 24).lineTo(520, y + 24).stroke();
    doc.font('Helvetica-Bold').text('Name & Sign of Shift In-charge:', 40, y + 40);
    doc.font('Helvetica').text(shiftInchargeName, 240, y + 40, { width: 260 });
    doc.moveTo(240, y + 54).lineTo(520, y + 54).stroke();

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export audit." });
  }
});

// Export all audits as CSV
router.get("/history/export-csv", auth, isAdmin, async (req, res) => {
  try {
    const { machineCode, dateFrom, dateTo } = req.query;
    let query = {};
    
    if (machineCode) {
      query.machineCode = machineCode;
    }
    
    if (dateFrom || dateTo) {
      query.auditDate = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        query.auditDate.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.auditDate.$lte = to;
      }
    }
    
    const records = await Audit.find(query).sort({ auditDate: -1, createdAt: -1 });

    let csv = 'Checklist Name,Module,Sub-Module,Machine Code,Filled By,Date,Status\n';

    records.forEach(record => {
      const date = new Date(record.auditDate || record.createdAt).toLocaleDateString();
      csv += `"${record.checklistTitle}","${record.module}","${record.subModule}","${record.machineCode}","${record.userName}","${date}","${record.status}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="checklist_history.csv"');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export checklist history." });
  }
});

export default router;
