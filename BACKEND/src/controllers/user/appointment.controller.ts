import { Request, Response } from "express";
import { UserAppointmentService } from "../../services/user/appointment.service";

const svc = new UserAppointmentService();

/** GET /api/v1/users/appointments */
export const listMyAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { status, page, limit } = req.query;
    const result = await svc.listAppointments(userId, {
      status: status as string,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/** POST /api/v1/users/appointments */
export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const appointment = await svc.createAppointment(userId, req.body);
    return res.status(201).json(appointment);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/** PATCH /api/v1/users/appointments/:id/cancel */
export const cancelMyAppointment = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const appointment = await svc.cancelAppointment(userId, req.params.id);
    return res.status(200).json(appointment);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/** GET /api/v1/users/dashboard */
export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const overview = await svc.getDashboardOverview(userId);
    return res.status(200).json(overview);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};
