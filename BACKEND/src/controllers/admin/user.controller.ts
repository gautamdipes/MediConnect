import { Request, Response } from "express";
import { AdminUserService } from "../../services/admin/user.service";

const adminUserService = new AdminUserService();

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await adminUserService.listUsers({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search as string,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const getUser = async (req: Request<{id: string}>, res: Response) => {
  try {
    const user = await adminUserService.getUser(req.params.id);
    return res.status(200).json(user);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await adminUserService.createUser(req.body);
    return res.status(201).json(user);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const updateUser = async (req: Request<{id: string}>, res: Response) => {
  try {
    const user = await adminUserService.updateUser(req.params.id, req.body);
    return res.status(200).json(user);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteUser = async (req: Request<{id: string}>, res: Response) => {
  try {
    const result = await adminUserService.deleteUser(req.params.id);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};