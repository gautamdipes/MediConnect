import { Request, Response } from "express";
import { MedicalRecordService } from "../services/medical-record.service";

const service = new MedicalRecordService();

type IdParam = { id: string };

// GET /api/medical-records
export const getAllRecords = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const records = await service.getAll(userId);
    res.status(200).json({ records });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/medical-records/:id
export const getRecordById = async (req: Request<IdParam>, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const record = await service.getById(req.params.id, userId);
    res.status(200).json({ record });
  } catch (err: any) {
    res.status(err.message === "Unauthorized" ? 403 : 404).json({ message: err.message });
  }
};

// POST /api/medical-records
export const createRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { recordName, dept, doctor, format, status, notes, fileUrl } = req.body;
    if (!recordName || !dept || !doctor) {
      return res.status(400).json({ message: "recordName, dept and doctor are required" });
    }
    const record = await service.create(userId, { recordName, dept, doctor, format, status, notes, fileUrl });
    res.status(201).json({ record, message: "Record created successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/medical-records/:id
export const updateRecord = async (req: Request<IdParam>, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const record = await service.update(req.params.id, userId, req.body);
    res.status(200).json({ record, message: "Record updated successfully" });
  } catch (err: any) {
    res.status(err.message === "Unauthorized" ? 403 : 404).json({ message: err.message });
  }
};

// DELETE /api/medical-records/:id
export const deleteRecord = async (req: Request<IdParam>, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    await service.delete(req.params.id, userId);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err: any) {
    res.status(err.message === "Unauthorized" ? 403 : 404).json({ message: err.message });
  }
};