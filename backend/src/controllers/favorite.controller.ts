import { Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import {
  GetUserFavoritesService,
  AddFavoriteService,
  RemoveFavoriteService,
} from "../services/favorite.service";
import { AuthRequest } from "../types/authRequest";

export const getFavorites = catchAsync(async (req: AuthRequest, res: Response) => {
  const carIds = await GetUserFavoritesService(req.user!.id);
  res.status(200).json({ status: "success", data: { favorites: carIds } });
});

export const addFavorite = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    await AddFavoriteService(req.user!.id, String(req.params.carId));
    res.status(201).json({ status: "success", message: "Added to favorites" });
  },
);

export const removeFavorite = catchAsync(async (req: AuthRequest, res: Response) => {
  await RemoveFavoriteService(req.user!.id, String(req.params.carId));
  res.status(200).json({ status: "success", message: "Removed from favorites" });
});
