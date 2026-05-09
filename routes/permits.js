import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import express from "express";
import Permit from "../models/Permit.js";
import PermitTemplate from "../models/PermitTemplate.js";
import PermitApproval from "../models/PermitApproval.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Get all permits for user
router.get("/user", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const permits = await Permit.find({ userId }).populate("templateId").sort({ createdAt: -1 });
    res.json({ permits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permits." });
  }
});

// Get permit by id
router.get("/:id", auth, async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id).populate("templateId userId rejectedBy");
    if (!permit) return res.status(404).json({ message: "Permit not found." });
    const approvals = await PermitApproval.find({ permitId: req.params.id }).populate("departmentId userId").sort({ approvedAt: 1 });
    res.json({ permit, approvals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permit." });
  }
});

// Create permit
router.post("/", auth, async (req, res) => {
  try {
    const { templateId, data } = req.body;
    const template = await PermitTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: "Template not found." });

    // Generate permit number
    const count = await Permit.countDocuments();
    const permitNumber = `PERMIT-${(count + 1).toString().padStart(4, '0')}`;

    const permit = await Permit.create({
      permitNumber,
      templateId,
      userId: req.user._id,
      data,
      status: "pending",
      currentDepartmentIndex: 0,
    });

    // Notify first department
    if (template.approvalFlow.length > 0) {
      const firstDept = await Department.findById(template.approvalFlow[0]);
      if (firstDept) {
        await Notification.create({
          departmentId: firstDept._id,
          title: "New Permit Request",
          message: `New permit ${permitNumber} requires approval.`,
          type: "permit",
        });
      }
    }

    res.status(201).json({ permit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create permit." });
  }
});

// Approve permit
router.post("/:id/approve", auth, async (req, res) => {
  try {
    const { remarks } = req.body;
    const permit = await Permit.findById(req.params.id).populate("templateId");
    if (!permit) return res.status(404).json({ message: "Permit not found." });

    const user = await User.findById(req.user._id);
    if (!user || user.role !== "department" || !user.departmentId.equals(permit.templateId.approvalFlow[permit.currentDepartmentIndex])) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Create approval record
    await PermitApproval.create({
      permitId: permit._id,
      departmentId: user.departmentId,
      userId: req.user._id,
      status: "approved",
      remarks,
    });

    // Move to next department
    const nextIndex = permit.currentDepartmentIndex + 1;
    if (nextIndex >= permit.templateId.approvalFlow.length) {
      // All approved
      permit.status = "approved";
      permit.currentDepartmentIndex = nextIndex;
      await permit.save();

      // Notify user
      await Notification.create({
        userId: permit.userId,
        title: "Permit Approved",
        message: `Your permit ${permit.permitNumber} has been fully approved.`,
        type: "permit",
        data: { permitId: permit._id },
      });
    } else {
      // Notify next department
      permit.currentDepartmentIndex = nextIndex;
      await permit.save();

      const nextDept = await Department.findById(permit.templateId.approvalFlow[nextIndex]);
      if (nextDept) {
        await Notification.create({
          departmentId: nextDept._id,
          title: "Permit Approval Pending",
          message: `Permit ${permit.permitNumber} requires your approval.`,
          type: "permit",
        });
      }
    }

    res.json({ message: "Permit approved." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve permit." });
  }
});

// Reject permit
router.post("/:id/reject", auth, async (req, res) => {
  try {
    const { remarks } = req.body;
    const permit = await Permit.findById(req.params.id).populate("templateId");
    if (!permit) return res.status(404).json({ message: "Permit not found." });

    const user = await User.findById(req.user._id);
    if (!user || user.role !== "department" || !user.departmentId.equals(permit.templateId.approvalFlow[permit.currentDepartmentIndex])) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Create approval record
    await PermitApproval.create({
      permitId: permit._id,
      departmentId: user.departmentId,
      userId: req.user._id,
      status: "rejected",
      remarks,
    });

    permit.status = "rejected";
    permit.rejectedBy = user.departmentId;
    permit.rejectionReason = remarks;
    await permit.save();

    // Notify user
    await Notification.create({
      userId: permit.userId,
      title: "Permit Rejected",
      message: `Your permit ${permit.permitNumber} has been rejected.`,
      type: "permit",
      data: { permitId: permit._id },
    });

    res.json({ message: "Permit rejected." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reject permit." });
  }
});

// Get permits for department
router.get("/department/pending", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "department") return res.status(403).json({ message: "Not authorized." });

    const permits = await Permit.find({
      status: "pending"
    }).populate("templateId userId");

    // Filter where current department matches
    const filtered = permits.filter(p => p.templateId && p.templateId.approvalFlow[p.currentDepartmentIndex]?.equals(user.departmentId));

    res.json({ permits: filtered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permits." });
  }
});

// Get all permits (admin)
router.get("/admin/all", auth, isAdmin, async (req, res) => {
  try {
    const permits = await Permit.find().populate("templateId userId rejectedBy").sort({ createdAt: -1 });
    res.json({ permits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permits." });
  }
});

// Generate PDF
router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id).populate("templateId userId rejectedBy");
    if (!permit) return res.status(404).json({ message: "Permit not found." });

    const approvals = await PermitApproval.find({ permitId: req.params.id }).populate("departmentId userId").sort({ approvedAt: 1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${permit.permitNumber}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Permit Document', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(permit.permitNumber, { align: 'center' });
    doc.moveDown();

    // Permit Info
    doc.fontSize(12).text(`Template: ${permit.templateId?.name}`);
    doc.text(`Submitted by: ${permit.userId?.name}`);
    doc.text(`Created: ${new Date(permit.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${permit.status}`);
    doc.moveDown();

    // Form Data
    if (permit.templateId?.sections) {
      permit.templateId.sections.forEach((section, sIndex) => {
        doc.fontSize(14).text(section.title);
        doc.moveDown(0.5);

        section.questions.forEach((question, qIndex) => {
          const key = `${sIndex}-${qIndex}`;
          const value = permit.data[key] || 'N/A';
          doc.fontSize(10).text(`${question.question}: ${value}`);
        });
        doc.moveDown();
      });
    }

    // Approvals
    doc.fontSize(14).text('Approval History');
    doc.moveDown(0.5);
    approvals.forEach(approval => {
      doc.fontSize(10).text(`${approval.status === 'approved' ? 'Approved' : 'Rejected'} by ${approval.departmentId?.name} (${approval.userId?.name})`);
      doc.fontSize(8).text(`Date: ${new Date(approval.approvedAt).toLocaleString()}`);
      if (approval.remarks) {
        doc.text(`Remarks: ${approval.remarks}`);
      }
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF." });
  }
});

// Export permits as ZIP (admin)
router.get("/admin/export-zip", auth, isAdmin, async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;
    const query = {};
    
    if (status) query.status = status;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        query.createdAt.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }
    
    const permits = await Permit.find(query).populate("templateId userId rejectedBy");

    if (permits.length === 0) {
      return res.status(400).json({ message: "No permits to export." });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="permits_export_${new Date().getTime()}.zip"`);

    archive.pipe(res);

    // Add each permit as PDF to the archive
    for (const permit of permits) {
      const approvals = await PermitApproval.find({ permitId: permit._id }).populate("departmentId userId").sort({ approvedAt: 1 });

      const pdfBuffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('Permit Document', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(permit.permitNumber, { align: 'center' });
        doc.moveDown();

        // Permit Info
        doc.fontSize(12).text(`Template: ${permit.templateId?.name}`);
        doc.text(`Submitted by: ${permit.userId?.name}`);
        doc.text(`Created: ${new Date(permit.createdAt).toLocaleDateString()}`);
        doc.text(`Status: ${permit.status}`);
        doc.moveDown();

        // Form Data
        if (permit.templateId?.sections) {
          permit.templateId.sections.forEach((section, sIndex) => {
            doc.fontSize(14).text(section.title);
            doc.moveDown(0.5);

            section.questions.forEach((question, qIndex) => {
              const key = `${sIndex}-${qIndex}`;
              const value = permit.data[key] || 'N/A';
              doc.fontSize(10).text(`${question.question}: ${value}`);
            });
            doc.moveDown();
          });
        }

        // Approvals
        doc.fontSize(14).text('Approval History');
        doc.moveDown(0.5);
        approvals.forEach(approval => {
          doc.fontSize(10).text(`${approval.status === 'approved' ? 'Approved' : 'Rejected'} by ${approval.departmentId?.name} (${approval.userId?.name})`);
          doc.fontSize(8).text(`Date: ${new Date(approval.approvedAt).toLocaleString()}`);
          if (approval.remarks) {
            doc.text(`Remarks: ${approval.remarks}`);
          }
          doc.moveDown(0.5);
        });

        doc.end();
      });

      archive.append(pdfBuffer, { name: `${permit.permitNumber}.pdf` });
    }

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export permits." });
  }
});

export default router;
