import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { tokenStore } from '../../utils/tokenStore';
import './ChatWindow.css';

interface Message {
  id: string;
  messageText: string;
  senderId: string;
  sender: { id: string; name: string };
  createdAt: string;
  status: string;
}

interface ChatWindowProps {
  carId: string;
  lenderId: string;
  lenderName: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ carId, lenderId, lenderName, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const token = tokenStore.get();
    if (!token) return;

    // OLD: import.meta.env.VITE_API_URL?.replace(/\/api$/, '')
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, "") ||
      "http://localhost:3000";
    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Authenticate the socket
      socket.emit('authenticate', token, (res: { success: boolean }) => {
        if (res.success) {
          // Initiate or find existing chat
          socket.emit('initiate_chat', { carId, lenderId });
        } else {
          setIsConnecting(false);
        }
      });
    });

    socket.on('chat_initiated', ({ chatId: id }: { chatId: string }) => {
      setChatId(id);
      socket.emit('join_chat', id);
    });

    socket.on('message_history', (history: Message[]) => {
      setMessages(history);
      setIsConnecting(false);
      // Mark messages as read
      if (chatId) socket.emit('mark_read', chatId);
    });

    socket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (chatId) socket.emit('mark_read', chatId);
    });

    socket.on('typing', () => {
      setIsTyping(true);
    });

    socket.on('stop_typing', () => {
      setIsTyping(false);
    });

    socket.on('connect_error', () => {
      setIsConnecting(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, carId, lenderId]);

  const handleSend = () => {
    if (!inputText.trim() || !chatId || !socketRef.current) return;
    socketRef.current.emit('send_message', { chatId, messageText: inputText.trim() });
    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('stop_typing', chatId);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!chatId || !socketRef.current) return;
    socketRef.current.emit('typing', chatId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', chatId);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window glass animate-slide-up">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            {lenderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="chat-name">{lenderName}</p>
            <p className="chat-status">
              <span className="status-dot"></span>
              {isConnecting ? 'Connecting...' : 'Online'}
            </p>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {isConnecting ? (
          <div className="chat-loading">
            <Loader2 size={24} className="spin" />
            <span>Connecting to chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <MessageCircle size={40} opacity={0.3} />
            <p>Start the conversation with {lenderName}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                <div className={`chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                  <p>{msg.messageText}</p>
                  <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="chat-bubble-wrapper theirs">
            <div className="chat-bubble bubble-theirs typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          disabled={isConnecting || !chatId}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!inputText.trim() || !chatId}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
