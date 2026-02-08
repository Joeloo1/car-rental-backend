import { Request, Response, NextFunction } from "express";
import {
  createCategoryService,
  UpdateCategoryService,
  GetCategoryService,
  getCategoryByIdService,
  deleteCategoryService,
} from "../services/categoryService";
import catchAsync from "../utils/catchAsync";
import logger from "../config/winston";

// Create category
export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const category = await createCategoryService(req.body);

    logger.info("creating category...");
    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  },
);

// Update category
export const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const categoryId = parseInt(String(req.params.id), 10);
    const category = await UpdateCategoryService(categoryId, req.body);

    logger.info(`Updating category with Id: ${category.id}`);
    res.status(200).json({
      status: "success",
      message: "Category updated sucessfully",
      data: {
        category,
      },
    });
  },
);

// Get All Categories
export const getAllCategories = catchAsync(
  async (req: Request, res: Response) => {
    const categories = await GetCategoryService();

    logger.info("Getting all Categories");
    res.status(200).json({
      status: "success",
      result: categories.length,
      data: {
        categories,
      },
    });
  },
);

// Get Category BY ID
export const getCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const categoryId = parseInt(String(req.params.id), 10);
    const category = await getCategoryByIdService(categoryId);

    logger.info(`Getting category with ID: ${category.id}`);
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  },
);

// Delete Category
export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const categoryId = parseInt(String(req.params.id), 10);
    await deleteCategoryService(categoryId);

    logger.info(`Deleting category with ID: ${categoryId}`);
    res.status(200).json({
      status: "success",
      message: "Category deleted sucessfully",
    });
  },
);
