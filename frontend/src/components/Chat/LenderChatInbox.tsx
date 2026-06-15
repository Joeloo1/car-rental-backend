import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Loader2, User } from '@/lib/icons';
import { io, Socket } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { chatService, type Chat, type ChatMessage } from '../../services/chat.service';

// ─── Chat Pane (right panel) ─────────────────────────────────────────────────

interface ChatPaneProps {
  chat: Chat;
  currentUserId: string;
}

const ChatPane: React.FC<ChatPaneProps> = ({ chat, currentUserId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // OLD: import.meta.env.VITE_API_URL?.replace(/\/api$/, '')
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, "") ||
      "http://localhost:3000";
    const socket = io(socketUrl, { path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('authenticate', token, (res: { success: boolean }) => {
        if (res.success) {
          socket.emit('join_chat', chat.id);
        } else {
          setIsConnecting(false);
        }
      });
    });

    socket.on('message_history', (history: ChatMessage[]) => {
      setMessages(history);
      setIsConnecting(false);
      socket.emit('mark_read', chat.id);
    });

    socket.on('new_message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      socket.emit('mark_read', chat.id);
    });

    socket.on('typing', () => setIsTyping(true));
    socket.on('stop_typing', () => setIsTyping(false));
    socket.on('connect_error', () => setIsConnecting(false));

    return () => {
      socket.disconnect();
    };
  }, [chat.id]);

  const handleSend = () => {
    if (!inputText.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', { chatId: chat.id, messageText: inputText.trim() });
    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('stop_typing', chat.id);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('typing', chat.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', chat.id);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const otherPerson = chat.userId === currentUserId ? chat.lender : chat.user;

  return (
    <div className="flex flex-col h-full">
      {/* Pane Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
          {otherPerson.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{otherPerson.name}</p>
          <p className="text-xs text-gray-500">{chat.car?.model || 'Car listing'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-amber-400' : 'bg-emerald-400'}`}
          />
          <span className="text-xs text-gray-500">{isConnecting ? 'Connecting…' : 'Live'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
        {isConnecting ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Connecting…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600">
            <MessageCircle size={36} />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-gold text-black rounded-br-sm'
                      : 'bg-white/8 text-gray-200 rounded-bl-sm border border-white/10'
                  }`}
                >
                  <p>{msg.messageText}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isMine ? 'text-black/50' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/8 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-white/8 flex-shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a reply…"
          disabled={isConnecting}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/50 focus:bg-white/8 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isConnecting}
          className="w-10 h-10 rounded-xl bg-gold text-black flex items-center justify-center hover:bg-gold-light transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Lender Chat Inbox ────────────────────────────────────────────────────────

const LenderChatInbox: React.FC = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['lender-chats'],
    queryFn: chatService.getChats,
    refetchInterval: 30_000,
  });

  const formatPreview = (chat: Chat) => {
    const last = chat.messages[0];
    if (!last) return 'No messages yet';
    const prefix = last.senderId === user?.id ? 'You: ' : '';
    const text = last.messageText;
    return prefix + (text.length > 50 ? text.slice(0, 47) + '…' : text);
  };

  const formatDate = (chat: Chat) => {
    const last = chat.messages[0];
    if (!last) return '';
    const d = new Date(last.createdAt);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const hasUnread = (chat: Chat) => {
    const last = chat.messages[0];
    return last && last.senderId !== user?.id && last.status !== 'read';
  };

  const getOtherPerson = (chat: Chat) =>
    chat.userId === user?.id ? chat.lender : chat.user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#111115] border border-white/8 overflow-hidden h-[600px] flex">
      {/* Left: conversation list */}
      <div
        className={`w-full sm:w-72 flex-shrink-0 border-r border-white/8 flex flex-col ${
          selectedChat ? 'hidden sm:flex' : 'flex'
        }`}
      >
        <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <MessageCircle size={16} className="text-gold" />
            Conversations
            {chats.length > 0 && (
              <span className="ml-auto text-xs text-gray-500">{chats.length}</span>
            )}
          </h3>
        </div>

        {chats.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <User size={36} className="text-gray-700" />
            <p className="text-sm text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-700">
              Renters will message you about your listings here.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => {
              const other = getOtherPerson(chat);
              const unread = hasUnread(chat);
              const isActive = selectedChat?.id === chat.id;

              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left px-5 py-4 flex items-start gap-3 border-b border-white/5 transition-all hover:bg-white/[0.04] ${
                    isActive ? 'bg-gold/[0.08] border-l-2 border-l-gold' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-bold text-sm flex-shrink-0 mt-0.5">
                    {other.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p
                        className={`text-sm truncate ${unread ? 'font-semibold text-white' : 'font-medium text-gray-300'}`}
                      >
                        {other.name}
                      </p>
                      <span className="text-[10px] text-gray-600 flex-shrink-0">
                        {formatDate(chat)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{chat.car?.model || '—'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-600 truncate flex-1">
                        {formatPreview(chat)}
                      </p>
                      {unread && (
                        <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: chat pane */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          selectedChat ? 'flex' : 'hidden sm:flex'
        }`}
      >
        {selectedChat ? (
          <>
            {/* Mobile back button */}
            <div className="sm:hidden px-4 pt-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="flex items-center gap-1.5 text-sm text-gold hover:text-gold-light transition-colors"
              >
                <ArrowLeft size={15} /> Back
              </button>
            </div>
            {user && (
              <ChatPane key={selectedChat.id} chat={selectedChat} currentUserId={user.id} />
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <MessageCircle size={24} className="text-gold" />
            </div>
            <p className="text-gray-400 font-medium">Select a conversation</p>
            <p className="text-xs text-gray-600">Choose a chat from the left to reply</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LenderChatInbox;
