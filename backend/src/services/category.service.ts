import { prisma } from "../config/database";
import { getCache, setCache, deleteCache } from "../config/redis";
import AppError from "../utils/AppError";
import logger from "../config/winston";

import { CreateCategoryInput, UpdateCategoryInput } from "../schema/categorySchema";

// ─── Cache TTLs ───────────────────────────────────────────────────────────────
const TTL_CATEGORIES = 30 * 60; // 30 minutes — categories rarely change

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

  // Invalidate list cache
  await deleteCache("categories:all");

  return category;
};

// Update Category
export const UpdateCategoryService = async (categoryId: number, data: UpdateCategoryInput) => {
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

  // Invalidate both the list and the individual entry
  await Promise.all([deleteCache("categories:all"), deleteCache(`categories:id:${categoryId}`)]);

  return updateData;
};

// Get All categories
export const GetCategoryService = async () => {
  const cacheKey = "categories:all";

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await getCache<any[]>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  const category = await prisma.category.findMany();

  // ── Cache write ─────────────────────────────────────────────────────────────
  await setCache(cacheKey, category, TTL_CATEGORIES);

  return category;
};

// Get Single Category
export const getCategoryByIdService = async (categoryId: number) => {
  const cacheKey = `categories:id:${categoryId}`;

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

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

  // ── Cache write ─────────────────────────────────────────────────────────────
  await setCache(cacheKey, category, TTL_CATEGORIES);

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

  const result = await prisma.category.delete({
    where: { id: categoryId },
  });

  // Invalidate caches
  await Promise.all([deleteCache("categories:all"), deleteCache(`categories:id:${categoryId}`)]);

  return result;
};
