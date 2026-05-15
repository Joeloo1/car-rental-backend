import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import {
  GetChatMessagesServices,
  GetUsersChatService,
  InitiateChatService,
  DeleteChatService,
} from "../services/chat.service";
import { AuthRequest } from "../types/authRequest";

// Get User Chat
export const GetUserChat = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const chat = await GetUsersChatService(req.user!.id);

    res.json(chat);
  },
);

// Get message for user
export const GetChatMessages = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const message = await GetChatMessagesServices(
      req.params.id as string,
      req.user!.id,
    );

    res.json(message);
  },
);

// Create chat
export const InitiateChat = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { carId, lenderId } = req.body;
    const chat = await InitiateChatService(carId, userId, lenderId);

    res.json(chat);
  },
);

// Delete Chat
export const DeleteChat = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const chatId = req.params.id as string;

    await DeleteChatService(chatId, userId);

    res.json({ message: "Chat deleted successfully" });
  },
);
