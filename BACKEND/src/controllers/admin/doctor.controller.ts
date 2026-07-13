import { Request, Response } from "express";
import { AdminDoctorService } from "../../services/admin/doctor.service";

const service = new AdminDoctorService();

type IdParam = { id: string };

// GET /api/v1/admin/doctors
export const listDoctors = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, status, department } = req.query;
    const result = await service.listDoctors({
      page:       Number(page)  || 1,
      limit:      Number(limit) || 10,
      search:     search     as string,
      status:     status     as string,
      department: department as string,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

// GET /api/v1/admin/doctors/stats
export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await service.getStats();
    return res.status(200).json(stats);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

// GET /api/v1/admin/doctors/:id
export const getDoctor = async (req: Request<IdParam>, res: Response) => {
  try {
    const doctor = await service.getDoctor(req.params.id);
    return res.status(200).json(doctor);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

// POST /api/v1/admin/doctors
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await service.createDoctor(req.body);
    return res.status(201).json({ doctor, message: "Doctor created successfully" });
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

// PUT /api/v1/admin/doctors/:id
export const updateDoctor = async (req: Request<IdParam>, res: Response) => {
  try {
    const doctor = await service.updateDoctor(req.params.id, req.body);
    return res.status(200).json({ doctor, message: "Doctor updated successfully" });
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

// DELETE /api/v1/admin/doctors/:id
export const deleteDoctor = async (req: Request<IdParam>, res: Response) => {
  try {
    const result = await service.deleteDoctor(req.params.id);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};