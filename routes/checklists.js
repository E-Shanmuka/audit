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
    doc.fontSize(20).text('Checklist Report', { align: 'center' });
    doc.moveDown();

    // Checklist Info
    doc.fontSize(14).text(audit.checklistTitle);
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Module: ${audit.module}`);
    doc.text(`Sub-Module: ${audit.subModule}`);
    doc.text(`Machine Code: ${audit.machineCode}`);
    doc.text(`Filled by: ${audit.userId?.name || 'Unknown'}`);
    doc.text(`Date: ${new Date(audit.auditDate || audit.createdAt).toLocaleString()}`);
    doc.text(`Status: ${audit.status}`);
    doc.moveDown();

    // Answers
    doc.fontSize(12).text('Answers');
    doc.moveDown(0.5);
    audit.answers.forEach((answer, index) => {
      doc.fontSize(10).text(`${index + 1}. ${answer.question}`);
      doc.fontSize(9).text(`Answer: ${answer.answer}`, { indent: 20 });
      if (answer.remark) {
        doc.text(`Remark: ${answer.remark}`, { indent: 20 });
      }
      doc.moveDown(0.3);
    });

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
