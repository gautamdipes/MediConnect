import { Request, Response } from "express";
import { MedicalRecordService } from "../services/medical-record.service";

const service = new MedicalRecordService();

export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user?.userId;
    if (!patientId) return res.status(401).json({ message: "Unauthorized" });

    const records = await service.getMedicalRecords({ patientId });
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
    const doctorId = (req as any).user?.userId; // Assuming doctor creates it
    if (!doctorId) return res.status(401).json({ message: "Unauthorized" });

    const data = { ...req.body, doctorId };
    const record = await service.createMedicalRecord(data);
    res.status(201).json({ record, message: "Record created successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMedicalRecord = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const record = await service.updateMedicalRecord(req.params.id, req.body);
    res.status(200).json({ record, message: "Record updated successfully" });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteMedicalRecord = async (req: Request<{ id: string }>, res: Response) => {
  try {
    await service.deleteMedicalRecord(req.params.id);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};