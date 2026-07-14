import { Request, Response } from "express";
import { MedicalRecordService } from "../services/medical-record.service";

const service = new MedicalRecordService();

export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user?.userId;
    if (!patientId) return res.status(401).json({ message: "Unauthorized" });

    // Allow query parameters for search, dept, status
    const { search, dept, status } = req.query;

    const records = await service.getMedicalRecords({
      patientId,
      search: search ? String(search) : undefined,
      dept: dept ? String(dept) : undefined,
      status: status ? String(status) : undefined,
    });
    res.status(200).json(records);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMedicalRecordById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const record = await service.getMedicalRecordById(req.params.id);
    res.status(200).json(record);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const attachments: string[] = [];
    if (req.file) {
      attachments.push(`/uploads/${req.file.filename}`);
    } else if (req.body.attachments) {
      if (Array.isArray(req.body.attachments)) {
        attachments.push(...req.body.attachments);
      } else {
        attachments.push(req.body.attachments);
      }
    }

    let format = req.body.format || "PDF";
    if (req.file) {
      const ext = req.file.originalname.split('.').pop()?.toUpperCase();
      if (ext === "PDF") format = "PDF";
      else if (ext === "PNG") format = "PNG";
      else if (ext === "JPG" || ext === "JPEG") format = "JPG";
      else if (ext === "DCM" || ext === "DICOM") format = "DICOM";
    }

    // patientId is either req.body.patientId or default to the logged-in patient
    const patientId = req.body.patientId || userId;

    const data = {
      ...req.body,
      patientId,
      attachments,
      format,
    };

    // If a doctor is creating this record, set doctorId
    if (!data.doctorId && req.body.doctorId) {
      data.doctorId = req.body.doctorId;
    }

    const record = await service.createMedicalRecord(data);
    res.status(201).json({ record, message: "Record created successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMedicalRecord = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const existing = await service.getMedicalRecordById(req.params.id);
    if (existing.patientId.toString() !== userId && existing.doctorId?.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = { ...req.body };
    if (req.file) {
      data.attachments = [`/uploads/${req.file.filename}`];
      const ext = req.file.originalname.split('.').pop()?.toUpperCase();
      if (ext === "PDF") data.format = "PDF";
      else if (ext === "PNG") data.format = "PNG";
      else if (ext === "JPG" || ext === "JPEG") data.format = "JPG";
      else if (ext === "DCM" || ext === "DICOM") data.format = "DICOM";
    }

    const record = await service.updateMedicalRecord(req.params.id, data);
    res.status(200).json({ record, message: "Record updated successfully" });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteMedicalRecord = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const existing = await service.getMedicalRecordById(req.params.id);
    if (existing.patientId.toString() !== userId && existing.doctorId?.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await service.deleteMedicalRecord(req.params.id);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};