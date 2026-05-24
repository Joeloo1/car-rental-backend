import { prisma } from "../config/database";
import { getCache, setCache, deleteCache } from "../config/redis";
import AppError from "../utils/AppError";
import logger from "../config/winston";

const TTL_FAVORITES = 5 * 60;

export const GetUserFavoritesService = async (userId: string) => {
  const cacheKey = `favorites:${userId}`;

  const cached = await getCache<string[]>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { carId: true },
    orderBy: { createdAt: "desc" },
  });

  const carIds = favorites.map((f) => f.carId);
  await setCache(cacheKey, carIds, TTL_FAVORITES);
  return carIds;
};

export const AddFavoriteService = async (userId: string, carId: string) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) throw new AppError("Car not found", 404);

  try {
    await prisma.favorite.create({ data: { userId, carId } });
  } catch (err: any) {
    if (err?.code === "P2002") throw new AppError("Car already in favorites", 409);
    throw err;
  }

  await deleteCache(`favorites:${userId}`);
  logger.info(`User ${userId} added car ${carId} to favorites`);
};

export const RemoveFavoriteService = async (userId: string, carId: string) => {
  const existing = await prisma.favorite.findUnique({
    where: { userId_carId: { userId, carId } },
  });
  if (!existing) throw new AppError("Car not in favorites", 404);

  await prisma.favorite.delete({ where: { userId_carId: { userId, carId } } });
  await deleteCache(`favorites:${userId}`);
  logger.info(`User ${userId} removed car ${carId} from favorites`);
};
