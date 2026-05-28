import { prisma } from "../config/database";
import { getCache, setCache, deleteCache, deleteCacheByPattern } from "../config/redis";
import AppError from "../utils/AppError";
import { CreateCarInput, UpdateCarInput, CarQuery } from "../schema/car.schema";
import logger from "../config/winston";
import { CarStatus } from "../generated/prisma/client";
import cloudinary from "../config/cloudinary";
import config from "../config/config.env";

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
    data: { ...data, lenderId: user.id },
    // data: {
    //   title: data.title,
    //   brand: data.brand,
    //   model: data.model,
    //   year: data.year,
    //   description: data.description,
    //   pricePerDay: data.pricePerDay,
    //   locationCity: data.locationCity,
    //   availabilityStatus: data.availabilityStatus || "available",
    //   lenderId: user.id,
    //   categoryId: data.categoryId,
    //   fuelType: data.fuelType,
    //   transmission: data.transmission,
    //   seats: data.seats,
    //   topSpeed: data.topSpeed,
    //   acceleration: data.acceleration,
    //   enginePower: data.enginePower,
    //   latitude: data.latitude,
    //   longitude: data.longitude,
    // },

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
  const where: any = {};
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

  const orderBy: any = { [sortBy]: sortOrder };

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
        category: true,
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

// Helper to keep return type consistent for TS inference
function buildResult(data: any[], total: number, page: number, limit: number) {
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

  if (!car) {
    logger.warn(`Car with ID: ${id}`);
    throw new AppError("Car not Found", 404);
  }

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
export const UpdateCarService = async (id: string, data: UpdateCarInput, user: any) => {
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

  // Block deletion if there are active bookings
  const activeBookingCount = await prisma.booking.count({
    where: { carId: id, status: { in: ["pending", "confirmed"] } },
  });
  if (activeBookingCount > 0) {
    throw new AppError(
      "Cannot delete a car with active bookings. Cancel or complete all bookings first.",
      409,
    );
  }

  // Remove images from Cloudinary before deleting the car record
  const images = await prisma.carImage.findMany({
    where: { carId: id },
    select: { publicId: true },
  });

  if (images.length > 0) {
    await Promise.allSettled(images.map((img) => cloudinary.uploader.destroy(img.publicId)));
  }

  await prisma.car.delete({ where: { id } });

  // Invalidate relevant caches
  await Promise.all([
    deleteCache(`cars:id:${id}`),
    deleteCacheByPattern("cars:list:*"),
    deleteCache(`cars:lender:${car.lenderId}`),
  ]);

  logger.info(`Deleted car ${id} with ${images.length} Cloudinary image(s) removed`);
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
    where: { lenderId },
    include: {
      category: true,
      images: { orderBy: [{ isMain: "desc" }, { order: "asc" }] },
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
export const UpdateCarStatusService = async (id: string, status: CarStatus, lenderId?: string) => {
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

  // Invalidate caches — status changes affect listing and detail views
  await Promise.all([
    deleteCache(`cars:id:${id}`),
    deleteCacheByPattern("cars:list:*"),
    deleteCache(`cars:lender:${car.lenderId}`),
  ]);

  logger.info(`Car status updated: ${id} -> ${status}`);
  return updateCar;
};
