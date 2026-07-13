import { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string) => {
  res.status(statusCode).json({
    status: "success",
    ...(message && { message }),
    data,
  });
};

export const sendCreated = <T>(res: Response, data: T, message?: string) =>
  sendSuccess(res, data, 201, message);

export const sendNoContent = (res: Response) => res.status(204).send();

export const sendError = (res: Response, message: string, status = 400): void => {
  res.status(status).json({ success: false, message });
};
