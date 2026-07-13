import { Request, Response } from "express";
import { AdminAppointmentService } from "../../services/admin/appointment.service";

const service = new AdminAppointmentService();

export const listAppointments = async (req: Request, res: Response) => {
  try {
    const { page, limit, status } = req.query;
    const result = await service.listAppointments({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      status: status as string,
    });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getAppointment = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const appointment = await service.getAppointment(req.params.id);
    res.status(200).json(appointment);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const updateAppointmentStatus = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });
    
    const appointment = await service.updateAppointmentStatus(req.params.id, status);
    res.status(200).json(appointment);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await service.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const updateAppointment = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const appointment = await service.updateAppointment(req.params.id, req.body);
    res.status(200).json(appointment);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteAppointment = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const result = await service.deleteAppointment(req.params.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
