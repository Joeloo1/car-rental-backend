import { Router } from "express";
import { validateRequest } from "../middleware/validation_middleware";
import {
  CreateAddressSchema,
  UpdateAddressSchema,
  AddressParamsSchema,
} from "../schema/address.schema";
import { protect } from "../middleware/protect.middleware";
import {
  createAddress,
  updateAddress,
  getAddress,
  getAllAddress,
  deleteAddress,
} from "../controllers/address.controller";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(getAllAddress)
  .post(validateRequest(CreateAddressSchema), createAddress);

router
  .route("/:id")
  .get(validateRequest(AddressParamsSchema), getAddress)
  .patch(validateRequest(UpdateAddressSchema), updateAddress)
  .delete(validateRequest(AddressParamsSchema), deleteAddress);

export default router;
