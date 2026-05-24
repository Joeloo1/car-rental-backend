import { Request } from "express";
import { ProtectedUser } from "./express";

export interface AuthRequest extends Request {
  user?: ProtectedUser;
}
