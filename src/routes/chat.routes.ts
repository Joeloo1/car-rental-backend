import { Router } from "express";
import {
  GetUserChat,
  GetChatMessages,
  InitiateChat,
  DeleteChat,
} from "../controllers/chat.controller";
import { protect } from "../middleware/protect.middleware";

const router = Router();

router.use(protect);

/**
 * GET /api/chats
 * Get all chats for logged-in user
 */
router.get("/", GetUserChat);

/**
 * GET /api/chats/:id/messages
 * Get all messages in a chat
 */
router.get("/:id/messages", GetChatMessages);

/**
 * POST /api/chats
 * Create or initiate a chat
 */
router.post("/", InitiateChat);

/**
 * DELETE /api/chats/:id
 * Delete a chat
 */
router.delete("/:id", DeleteChat);

export default router;
