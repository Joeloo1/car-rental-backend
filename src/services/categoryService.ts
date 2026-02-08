import { prisma } from "../config/database";
import AppError from "../utils/AppError";
import logger from "../config/winston";

import {
  CategoryParamsSchema,
  UpdateCategorySchema,
  CreateCategorySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schema/categorySchema";

// Create Category
export const createCategoryService = async (data: CreateCategoryInput) => {
  // Check DB if category already exist
  const existingCategory = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existingCategory) {
    logger.warn(`Category already exist: ${data.name}`);
    throw new AppError("Category already exist", 400);
  }

  // Create Category
  const category = await prisma.category.create({ data });

  return category;
};

// Update Category
export const UpdateCategoryService = async (
  categoryId: number,
  data: UpdateCategoryInput,
) => {
  // Check if the category if in DB
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    logger.info(`Category with id: ${category} not found`);
    throw new AppError("Category not found", 404);
  }

  // Update category
  const updateData = await prisma.category.update({
    where: { id: categoryId },
    data,
  });

  return updateData;
};

// Get All categories
export const GetCategoryService = async () => {
  const category = await prisma.category.findMany();
  return category;
};

// Get Single Category
export const getCategoryByIdService = async (categoryId: number) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      cars: true,
    },
  });

  if (!category) {
    logger.info(`Category with id: ${categoryId} not found`);
    throw new AppError("Category not found", 404);
  }

  return category;
};

// Delete Category
export const deleteCategoryService = async (categoryId: number) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      cars: true,
    },
  });

  if (!category) {
    logger.info(`Category with id: ${categoryId} not found`);
    throw new AppError("Category not found", 404);
  }

  return await prisma.category.delete({
    where: { id: categoryId },
  });
};
