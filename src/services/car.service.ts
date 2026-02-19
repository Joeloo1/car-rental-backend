import { prisma } from "../config/database";
import AppError from "../utils/AppError";
import { CreateCarInput, UpdateCarInput, CarQuery } from "../schema/car.schema";
import logger from "../config/winston";
import { CarStatus } from "@prisma/client";

/**
 * CREATE CAR SERVICE
 */
export const CreateCarService = async (data: CreateCarInput, user: any) => {
  if (user.role !== "lender") {
    throw new AppError("Only lenders can create cars", 403);
  }

  // Verify category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!categoryExists) {
    logger.warn(`Category with ID: ${data.categoryId} not found `);
    throw new AppError("Category not found", 404);
  }

  const car = await prisma.car.create({
    data: {
      title: data.title,
      brand: data.brand,
      model: data.model,
      year: data.year,
      description: data.description,
      pricePerDay: data.pricePerDay,
      locationCity: data.locationCity,
      availabilityStatus: data.availabilityStatus || "available",
      lenderId: user.id,
      categoryId: data.categoryId,
    },
    include: {
      lender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
      images: { orderBy: { order: "asc" } },
    },
  });

  logger.info(`Car created: ${car.id}`);
  return car;
};

/**
 * GET ALL CARS
 */
export const GetAllCarsService = async (filter: CarQuery) => {
  const {
    brand,
    model,
    minYear,
    maxYear,
    minPrice,
    maxPrice,
    locationCity,
    availabilityStatus,
    categoryId,
    lenderId,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filter;

  const skip = (page - 1) * limit;

  /**
   * Building where Cluase
   */
  const where: any = {};
  if (brand) where.brand = { contains: brand, mode: "insensitive" };
  if (model) where.model = { contains: model, mode: "insensitive" };
  if (locationCity)
    where.locationCity = { contains: locationCity, mode: "insensitive" };
  if (availabilityStatus) where.availabilityStatus = availabilityStatus;
  if (categoryId) where.categoryId = categoryId;
  if (lenderId) where.lenderId = lenderId;

  if (minYear || maxYear) {
    where.year = {};
    if (minYear) where.year.gte = minYear;
    if (maxYear) where.year.lte = maxYear;
  }

  if (minPrice || maxPrice) {
    where.pricePerDay = {};
    if (minPrice) where.pricePerDay.gte = minPrice;
    if (maxPrice) where.pricePerDay.lte = maxPrice;
  }

  /**
   * Building Order By
   */
  let orderBy: any = {};
  if (sortBy === "averageRating") {
    orderBy = { createdAt: sortOrder };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      skip,
      take: limit,
      include: {
        lender: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        images: {
          orderBy: [{ isMain: "desc" }, { order: "asc" }],
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy,
    }),
    prisma.car.count({ where }),
  ]);

  // Calculate average rating
  let carsWithRating = cars.map((car) => {
    const avgRating =
      car.reviews.length > 0
        ? car.reviews.reduce((sum, review) => sum + review.rating, 0) /
          car.reviews.length
        : 0;
    return {
      ...car,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews: car.reviews.length,
      reviews: undefined,
    };
  });

  // Sorting by Average Rating
  if (sortBy === "averageRating") {
    carsWithRating = carsWithRating.sort((a, b) => {
      return sortOrder === "asc"
        ? a.averageRating - b.averageRating
        : b.averageRating - a.averageRating;
    });
  }

  logger.info("Fetching all cars");
  return {
    data: carsWithRating,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get Car By ID
 */
export const GetCarByIdService = async (id: string) => {
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      lender: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
      category: true,
      images: {
        orderBy: [{ isMain: "desc" }, { order: "asc" }],
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!car) {
    logger.warn(`Car with ID: ${id}`);
    throw new AppError("Car not Found", 404);
  }

  // Caculating the average rating
  const avgRating =
    car.reviews.length > 0
      ? car.reviews.reduce((sum, review) => sum + review.rating, 0) /
        car.reviews.length
      : 0;

  logger.info(`Fetching Car By ID: ${id}`);
  return {
    ...car,
    averageRating: Number(avgRating.toFixed(1)),
    totalReviews: car.reviews.length,
  };
};

/**
 * Update Car
 */
export const UpdateCarService = async (
  id: string,
  data: UpdateCarInput,
  user: any,
) => {
  const car = await prisma.car.findUnique({
    where: { id },
  });

  if (!car) {
    logger.warn(`Car with ID: ${id}`);
    throw new AppError("Car not Found", 404);
  }

  // Check if user is the Lender
  if (user.role === "lender" && car.lenderId !== user.id) {
    logger.warn("Unauthorized: You can only update your own cars");
    throw new AppError("You can only update your own cars", 403);
  }

  // Verify if the category exists
  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      logger.warn(`Category with ID: ${data.categoryId} not found`);
      throw new AppError("Category not found", 404);
    }
  }
  const updatedCar = await prisma.car.update({
    where: { id },
    data,
    include: {
      lender: {
        select: {
          id: true,
          name: true,
        },
      },
      category: true,
      images: { orderBy: [{ isMain: "desc" }, { order: "asc" }] },
    },
  });

  logger.info(`Updating car with ID: ${id}`);
  return updatedCar;
};

/**
 *  Delete Car
 */
export const deleteCarService = async (id: string, lenderId?: string) => {
  const car = await prisma.car.findUnique({
    where: { id },
  });

  if (!car) {
    logger.warn(`Car with ID: ${id}`);
    throw new AppError("Car not Found", 404);
  }

  // Check if user is the Lender
  if (lenderId && car.lenderId !== lenderId) {
    logger.warn("Unauthorized: You can only update your own cars");
    throw new AppError("Unauthorized: You can only update your own cars", 400);
  }

  await prisma.car.delete({
    where: { id },
  });
  logger.info(`Deleting car with ID: ${id}`);
};

/**
 * Get Cars By Lenders
 */
export const GetCarsByLenderService = async (lenderId: string) => {
  const cars = await prisma.car.findMany({
    where: { lenderId },
    include: {
      category: true,
      images: { orderBy: [{ isMain: "desc" }, { order: "asc" }] },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Caculating the average rating
  const carsWithRating = cars.map((car) => {
    const avgRating =
      car.reviews.length > 0
        ? car.reviews.reduce((sum, review) => sum + review.rating, 0) /
          car.reviews.length
        : 0;
    return {
      ...car,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews: car.reviews.length,
      reviews: undefined,
    };
  });

  logger.info(`Fetching lenders cars`);
  return carsWithRating;
};

/**
 * Update Car Aailability Status
 */
export const UpdateCarStatusService = async (
  id: string,
  status: CarStatus,
  lenderId?: string,
) => {
  const car = await prisma.car.findUnique({
    where: { id },
  });

  if (!car) {
    logger.warn(`Car with ID: ${id}`);
    throw new AppError("Car not Found", 404);
  }

  // Check if user is the Lender
  if (lenderId && car.lenderId !== lenderId) {
    logger.warn("Unauthorized: You can only update your own cars");
    throw new AppError("Unauthorized: You can only update your own cars", 400);
  }

  const updateCar = await prisma.car.update({
    where: { id },
    data: { availabilityStatus: status },
  });

  logger.info(`Car status updated: ${id} -> ${status}`);
  return updateCar;
};
