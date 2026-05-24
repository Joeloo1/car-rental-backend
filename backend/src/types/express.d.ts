import { AccountStatus, Provider, UserRole } from "@/generated/prisma/client";

export type ProtectedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  profileImage: string;
  profileImagePublicId: string | null;
  passwordChangedAt: Date | null;
  isVerified: boolean;
  phoneNumber: string | null;
  provider: Provider | null;
  createdAt: Date;
  updatedAt: Date;
};

declare global {
  namespace Express {
    export interface Request {
      user?: ProtectedUser;
    }
  }
}
