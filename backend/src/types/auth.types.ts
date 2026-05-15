import { UserRole } from "../generated/prisma/client";

export interface Jwtpayload {
  id: string;
  role: UserRole;
  iat: number;
  exp?: number;
}
