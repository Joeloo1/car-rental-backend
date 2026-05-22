import api from '../api/axios';

export interface ChatMessage {
  id: string;
  messageText: string;
  senderId: string;
  sender: { id: string; name: string };
  createdAt: string;
  status: string;
}

export interface Chat {
  id: string;
  carId: string;
  userId: string;
  lenderId: string;
  createdAt: string;
  user: { id: string; name: string };
  lender: { id: string; name: string };
  car: { id: string; model: string };
  messages: ChatMessage[];
}

export const chatService = {
  getChats: async (): Promise<Chat[]> => {
    const { data } = await api.get('/chats');
    return data.data ?? data;
  },

  getChatMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get(`/chats/${chatId}/messages`);
    return data.data ?? data;
  },

  deleteChat: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}`);
  },
};
