import { Request, Response } from "express";
import { HospitalAppointmentService } from "../../services/hospital/appointment.service";

const service = new HospitalAppointmentService();
const hospitalId = (req: Request) => String((req as any).hospitalId);

export const listHospitalAppointments = async (req: Request, res: Response) => {
  try { res.json(await service.list(hospitalId(req), { status: req.query.status as string, search: req.query.search as string })); }
  catch (error: any) { res.status(error.status || 500).json({ message: error.message || "Unable to load appointments" }); }
};
export const createHospitalAppointment = async (req: Request, res: Response) => {
  try { res.status(201).json(await service.create(hospitalId(req), req.body)); }
  catch (error: any) { res.status(error.status || 500).json({ message: error.message || "Unable to create appointment" }); }
};
export const updateHospitalAppointmentStatus = async (req: Request<{ id: string }>, res: Response) => {
  try { res.json(await service.updateStatus(hospitalId(req), req.params.id, req.body.status)); }
  catch (error: any) { res.status(error.status || 500).json({ message: error.message || "Unable to update appointment" }); }
};
