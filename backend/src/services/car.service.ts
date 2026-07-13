import { prisma } from "../config/database";
import { getCache, setCache, deleteCache, deleteCacheByPattern } from "../config/redis";
import AppError from "../utils/AppError";
import { CreateCarInput, UpdateCarInput, CarQuery } from "../schema/car.schema";
import logger from "../config/winston";
import { CarStatus, Prisma } from "../generated/prisma/client";
import cloudinary from "../config/cloudinary";
import config from "../config/config.env";
import { ProtectedUser } from "../types/express";

// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────
const TTL_CAR_LIST = 5 * 60; // 5 minutes
const TTL_CAR_DETAIL = 10 * 60; // 10 minutes

const buildListKey = (filter: CarQuery) => {
  const sorted = Object.fromEntries(
    Object.entries(filter)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  return `cars:list:${JSON.stringify(sorted)}`;
};

/**
 * CREATE CAR SERVICE
 */
export const CreateCarService = async (data: CreateCarInput, user: ProtectedUser) => {
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
    data: { ...data, lenderId: user.id },
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

  // Invalidate all car list caches (lender's list + global lists)
  await Promise.all([deleteCacheByPattern("cars:list:*"), deleteCache(`cars:lender:${user.id}`)]);

  logger.info(`Car created: ${car.id}`);
  return car;
};

/**
 * GET ALL CARS
 */
export const GetAllCarsService = async (filter: CarQuery) => {
  const cacheKey = buildListKey(filter);

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await getCache<ReturnType<typeof buildResult>>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

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
    fuelType,
    transmission,
    seats,
    sortBy = "createdAt",

    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filter;

  const skip = (page - 1) * limit;

  /**
   * Building where Clause
   */
  const where: Prisma.CarWhereInput = { deletedAt: null, isApproved: true };
  if (brand) where.brand = { contains: brand, mode: "insensitive" };
  if (model) where.model = { contains: model, mode: "insensitive" };
  if (locationCity) where.locationCity = { contains: locationCity, mode: "insensitive" };
  if (availabilityStatus) where.availabilityStatus = availabilityStatus;
  if (categoryId) where.categoryId = categoryId;
  if (lenderId) where.lenderId = lenderId;
  if (fuelType) where.fuelType = fuelType;
  if (transmission) where.transmission = transmission;
  if (seats) where.seats = seats;

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

  const orderBy = { [sortBy]: sortOrder } as Prisma.CarOrderByWithRelationInput;

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
            profileImage: true,
          },
        },
        category: { select: { id: true, name: true } },
        images: {
          where: { isMain: true },
          take: 1,
          select: {
            imageUrl: true,
            publicId: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy,
    }),
    prisma.car.count({ where }),
  ]);

  const carsWithRating = cars.map((car) => {
    const { _count, ...rest } = car;
    return { ...rest, totalReviews: _count.reviews };
  });

  const result = buildResult(carsWithRating, total, page, limit);

  // ── Cache write ─────────────────────────────────────────────────────────────
  await setCache(cacheKey, result, TTL_CAR_LIST);

  logger.info("Fetching all cars (DB)");
  return result;
};

function buildResult<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get Car By ID
 */
export const GetCarByIdService = async (id: string) => {
  const cacheKey = `cars:id:${id}`;

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  const [car, bookedRanges] = await Promise.all([
    prisma.car.findUnique({
      where: { id },
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
            createdAt: true,
            cars: {
              select: {
                _count: { select: { bookings: { where: { status: "completed" } } } },
              },
            },
          },
        },
        category: true,
        images: {
          orderBy: [{ isMain: "desc" }, { order: "asc" }],
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
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
    }),
    prisma.booking.findMany({
      where: {
        carId: id,
        status: { in: ["pending", "confirmed"] },
        endDate: { gte: new Date() },
      },
      select: { startDate: true, endDate: true },
    }),
  ]);

  if (!car || car.deletedAt) {
    logger.warn(`Car with ID: ${id}`);
    throw new AppError("Car not Found", 404);
  }

  if (!car.lender) throw new AppError("Car data is corrupted — missing lender", 500);

  // Sum completed booking counts across all lender cars (already fetched — no extra query)
  const totalTrips = car.lender.cars.reduce((sum, c) => sum + c._count.bookings, 0);

  const { cars: _cars, ...lenderWithoutCars } = car.lender;

  const result = {
    ...car,
    totalReviews: car.reviews.length,
    serviceFee: config.SERVICE_FEE,
    bookedDates: bookedRanges.map((b) => ({
      startDate: b.startDate.toISOString().split("T")[0],
      endDate: b.endDate.toISOString().split("T")[0],
    })),
    lender: {
      ...lenderWithoutCars,
      totalTrips,
    },
  };

  // ── Cache write ─────────────────────────────────────────────────────────────
  await setCache(cacheKey, result, TTL_CAR_DETAIL);

  logger.info(`Fetching Car By ID: ${id} (DB)`);
  return result;
};

/**
 * Update Car
 */
export const UpdateCarService = async (id: string, data: UpdateCarInput, user: ProtectedUser) => {
  const car = await prisma.car.findUnique({
    where: { id },
  });

  if (!car || car.deletedAt) {
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

  // Invalidate relevant caches
  await Promise.all([
    deleteCache(`cars:id:${id}`),
    deleteCacheByPattern("cars:list:*"),
    deleteCache(`cars:lender:${car.lenderId}`),
  ]);

  logger.info(`Updating car with ID: ${id}`);
  return updatedCar;
};

/**
 *  Delete Car
 */
export const deleteCarService = async (id: string, userId: string, isAdmin: boolean) => {
  const car = await prisma.car.findUnique({
    where: { id },
  });

  if (!car || car.deletedAt) {
    logger.warn(`Car with ID: ${id}`);
    throw new AppError("Car not Found", 404);
  }

  if (!isAdmin && car.lenderId !== userId) {
    logger.warn(`Unauthorized: User ${userId} attempted to delete car ${id}`);
    throw new AppError("You can only delete your own cars", 403);
  }

  // Cancel any active bookings so renters are notified and the car is freed
  await prisma.booking.updateMany({
    where: { carId: id, status: { in: ["pending", "confirmed"] } },
    data: { status: "cancelled" },
  });

  // Remove images from Cloudinary
  const images = await prisma.carImage.findMany({
    where: { carId: id },
    select: { publicId: true },
  });

  if (images.length > 0) {
    const results = await Promise.allSettled(
      images.map((img) => cloudinary.uploader.destroy(img.publicId)),
    );
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        logger.error("Failed to delete image from Cloudinary", {
          publicId: images[i].publicId,
          error: r.reason,
        });
      }
    });
    // Remove image records from DB now that Cloudinary copies are gone
    await prisma.carImage.deleteMany({ where: { carId: id } });
  }

  // Soft-delete — preserves booking/review history while hiding the car from listings
  await prisma.car.update({
    where: { id },
    data: { deletedAt: new Date(), availabilityStatus: "unavailable" },
  });

  // Invalidate relevant caches
  await Promise.all([
    deleteCache(`cars:id:${id}`),
    deleteCacheByPattern("cars:list:*"),
    deleteCache(`cars:lender:${car.lenderId}`),
  ]);

  logger.info(`Soft-deleted car ${id} with ${images.length} Cloudinary image(s) removed`);
};

/**
 * Get Cars By Lenders
 */
export const GetCarsByLenderService = async (lenderId: string) => {
  const cacheKey = `cars:lender:${lenderId}`;

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await getCache<any[]>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  const cars = await prisma.car.findMany({
    where: { lenderId, deletedAt: null },
    include: {
      category: { select: { id: true, name: true } },
      images: {
        where: { isMain: true },
        take: 1,
        select: { imageUrl: true, publicId: true },
      },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const carsWithRating = cars.map((car) => {
    const { _count, ...rest } = car;
    return { ...rest, totalReviews: _count.reviews };
  });

  // ── Cache write ─────────────────────────────────────────────────────────────
  await setCache(cacheKey, carsWithRating, TTL_CAR_LIST);

  logger.info(`Fetching lenders cars (DB)`);
  return carsWithRating;
};

/**
 * Update Car Availability Status
 */
export const UpdateCarStatusService = async (
  id: string,
  status: CarStatus,
  userId: string,
  isAdmin: boolean,
) => {
  const car = await prisma.car.findUnique({
    where: { id },
  });

  if (!car || car.deletedAt) {
    logger.warn(`Car with ID: ${id}`);
    throw new AppError("Car not Found", 404);
  }

  if (!isAdmin && car.lenderId !== userId) {
    logger.warn(`Unauthorized: User ${userId} attempted to update status of car ${id}`);
    throw new AppError("You can only update status for your own cars", 403);
  }

  const updateCar = await prisma.car.update({
    where: { id },
    data: { availabilityStatus: status },
  });

  // Invalidate caches — status changes affect listing and detail views
  await Promise.all([
    deleteCache(`cars:id:${id}`),
    deleteCacheByPattern("cars:list:*"),
    deleteCache(`cars:lender:${car.lenderId}`),
  ]);

  logger.info(`Car status updated: ${id} -> ${status}`);
  return updateCar;
};

/**
 * Autocomplete search — returns distinct brands, models, and cities matching a query
 */
export const SearchCarsService = async (q: string) => {
  const term = q.trim();
  if (term.length < 2) return { brands: [], models: [], cities: [] };

  const cacheKey = `cars:search:${term.toLowerCase()}`;
  const cached = await getCache<{ brands: string[]; models: string[]; cities: string[] }>(cacheKey);
  if (cached) return cached;

  const [brands, models, cities] = await Promise.all([
    prisma.car.findMany({
      where: { deletedAt: null, isApproved: true, brand: { contains: term, mode: "insensitive" } },
      select: { brand: true },
      distinct: ["brand"],
      take: 5,
    }),
    prisma.car.findMany({
      where: { deletedAt: null, isApproved: true, model: { contains: term, mode: "insensitive" } },
      select: { model: true },
      distinct: ["model"],
      take: 5,
    }),
    prisma.car.findMany({
      where: { deletedAt: null, isApproved: true, locationCity: { contains: term, mode: "insensitive" } },
      select: { locationCity: true },
      distinct: ["locationCity"],
      take: 5,
    }),
  ]);

  const result = {
    brands: brands.map((c) => c.brand).filter(Boolean) as string[],
    models: models.map((c) => c.model).filter(Boolean) as string[],
    cities: cities.map((c) => c.locationCity).filter(Boolean) as string[],
  };

  await setCache(cacheKey, result, 60);
  return result;
};

/**
 * Check if a car is available for given date range
 */
export const CheckCarAvailabilityService = async (
  carId: string,
  startDateStr: string,
  endDateStr: string,
) => {
  const car = await prisma.car.findUnique({ where: { id: carId, deletedAt: null } });
  if (!car) throw new AppError("Car not found", 404);

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new AppError("Invalid date format", 400);
  }
  if (startDate >= endDate) throw new AppError("End date must be after start date", 400);

  const conflict = await prisma.booking.findFirst({
    where: {
      carId,
      status: { in: ["pending", "confirmed"] },
      OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
    },
    select: { startDate: true, endDate: true },
  });

  return {
    available: !conflict && car.availabilityStatus === "available",
    carStatus: car.availabilityStatus,
    conflictingDates: conflict ?? null,
  };
};
