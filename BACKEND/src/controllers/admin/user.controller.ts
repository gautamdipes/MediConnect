import { Request, Response, NextFunction } from "express";
import { AdminUserService } from "../../services/admin/user.service";
import { HttpException } from "../../exceptions/http-exception";
import { IUser } from "../../types/user.type";
const adminUserService = new AdminUserService();

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = req.query as any;
    const result = await adminUserService.listUsers({ page, limit, search });
    res.json(result);
  } catch (err: any) {
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminUserService.getUser(req.params.id as string);
    res.json(user);
  } catch (err: any) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminUserService.createUser(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminUserService.updateUser(req.params.id as string, req.body as Partial<IUser>);
    res.json(user);
  } catch (err: any) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminUserService.deleteUser(req.params.id as string);
    res.json(result);
  } catch (err: any) {
    next(err);
  }
};
