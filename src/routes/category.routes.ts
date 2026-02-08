import { Router } from "express";
import { validateRequest } from "../middleware/validation_middleware";
import {
  createCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
} from "../controllers/categoryController";
import {
  CategoryParamsSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} from "../schema/categorySchema";

const router = Router();

router
  .route("/")
  .get(getAllCategories)
  .post(validateRequest(CreateCategorySchema), createCategory);

router
  .route("/:id")
  .get(validateRequest(CategoryParamsSchema), getCategoryById)
  .patch(validateRequest(UpdateCategorySchema), updateCategory)
  .delete(validateRequest(CategoryParamsSchema), deleteCategory);

export default router;
