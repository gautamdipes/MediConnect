import { Request, Response } from "express";
import { AdminHospitalService } from "../../services/admin/hospital.service";

const adminHospitalService = new AdminHospitalService();

export const listHospitals = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await adminHospitalService.listHospitals({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search as string,
      status: status as string,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const getHospital = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const hospital = await adminHospitalService.getHospital(req.params.id);
    return res.status(200).json(hospital);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const createHospital = async (req: Request, res: Response) => {
  try {
    const hospital = await adminHospitalService.createHospital(req.body);
    return res.status(201).json(hospital);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const updateHospital = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const hospital = await adminHospitalService.updateHospital(req.params.id, req.body);
    return res.status(200).json(hospital);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const verifyHospital = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const hospital = await adminHospitalService.verifyHospital(req.params.id);
    return res.status(200).json(hospital);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteHospital = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const result = await adminHospitalService.deleteHospital(req.params.id);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};