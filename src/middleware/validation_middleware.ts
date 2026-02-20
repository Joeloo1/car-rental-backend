import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny, ZodIssue } from "zod";
import AppError from "../utils/AppError";

export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map(
          (e: ZodIssue) => `${e.path.join(",")}: ${e.message}`,
        );
        next(new AppError(message.join(","), 400));
      } else {
        next(error as Error);
      }
    }
  };
};
