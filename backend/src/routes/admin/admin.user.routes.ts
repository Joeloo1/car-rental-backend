import { Router } from "express";
import { adminUpdateUserSchema } from "../../schema/user/user.schema";
import { validateRequest } from "../../middleware/validation_middleware";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} from "../../controllers/admin/admin.user.controller";
import { protect } from "../../middleware/protect.middleware";
import { restrictTo } from "../../middleware/authorization";
import { UserRole } from "../../generated/prisma/client";

const router = Router();

router.use(protect);
router.use(restrictTo(UserRole.admin));

router.get("/", getAllUsers);

router.post("/", createUser);

router.get("/:id", getUser);

router.patch("/:id", validateRequest(adminUpdateUserSchema), updateUser);

router.delete("/:id", deleteUser);

export default router;
