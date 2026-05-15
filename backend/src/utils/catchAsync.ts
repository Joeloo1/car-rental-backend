import { Request, Response, NextFunction } from "express";

// type AsyncFunction = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => Promise<void>;
//
// const catchAsync = (fn: AsyncFunction) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     fn(req, res, next).catch(next);
//   };
// };
//

export type AsyncFunction<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const catchAsync = <T extends Request = Request>(fn: AsyncFunction<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as T, res, next).catch(next);
  };
};

export default catchAsync;
