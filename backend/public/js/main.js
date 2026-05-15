// Initialize socket - it will auth via JWT handshake (see backend middleware)
const socket = io({
  auth: {
    token: localStorage.getItem("token"), // your existing JWT
  },
});

const PAGE_CAR_ID = document.getElementById("chat-widget").dataset.carId;
const PAGE_LENDER_ID = document.getElementById("chat-widget").dataset.lenderId;

let currentChatId = null;
let typingTimer;

// DOM elements
const messagesDiv = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const typingIndicator = document.getElementById("typing-indicator");
const chatHeader = document.getElementById("chat-header");

// ─── On connect, authenticate first, then initiate chat ──────────────────────

socket.on("connect", () => {
  console.log("✅ Socket connected");
  console.log("Authenticating as:", window.__AUTHENTICATE_AS__);
  console.log("Car ID:", PAGE_CAR_ID);
  console.log("Lender ID:", PAGE_LENDER_ID);

  socket.emit("authenticate", window.__AUTHENTICATE_AS__, (response) => {
    if (response?.success) {
      console.log("✅ Authenticated! Initiating chat...");
      socket.emit("initiate_chat", {
        carId: PAGE_CAR_ID,
        lenderId: PAGE_LENDER_ID,
      });
    } else {
      console.error("❌ Authentication failed", response);
    }
  });
});

// Server responds with the chatId (new or existing)
socket.on("chat_initiated", ({ chatId }) => {
  console.log("✅ Chat initiated, chatId:", chatId);
  currentChatId = chatId;
  socket.emit("join_chat", chatId); // join the socket.io room
});

// Load message history when joining
socket.on("message_history", (messages) => {
  console.log("✅ Message history received:", messages.length, "messages");
  messagesDiv.innerHTML = ""; // clear loader
  messages.forEach(renderMessage);
  scrollToBottom();

  // Enable input now that chat is ready
  messageInput.disabled = false;
  document.getElementById("send-button").disabled = false;
});

// ─── Sending messages ────────────────────────────────────────────────────────

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !currentChatId) return;

  socket.emit("send_message", {
    chatId: currentChatId,
    messageText: text,
  });

  messageInput.value = "";
  socket.emit("stop_typing", currentChatId);
  clearTimeout(typingTimer);
});

// ─── Receiving messages ──────────────────────────────────────────────────────

socket.on("new_message", (message) => {
  renderMessage(message);
  scrollToBottom();

  // mark as read since the user is actively in the chat
  socket.emit("mark_read", currentChatId);
});

socket.on("messages_read", ({ readBy }) => {
  const sentMessages = messagesDiv.querySelectorAll(".message.sent");
  if (sentMessages.length > 0) {
    const last = sentMessages[sentMessages.length - 1];
    let seenLabel = last.querySelector(".seen-label");
    if (!seenLabel) {
      seenLabel = document.createElement("div");
      seenLabel.className = "seen-label";
      last.appendChild(seenLabel);
    }
    seenLabel.textContent = "Seen";
  }
});

// ─── Typing indicators ───────────────────────────────────────────────────────

messageInput.addEventListener("input", () => {
  if (!currentChatId) return;
  socket.emit("typing", currentChatId);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit("stop_typing", currentChatId);
  }, 1000);
});

socket.on("typing", ({ chatId }) => {
  if (chatId === currentChatId) {
    typingIndicator.textContent = "typing...";
  }
});

socket.on("stop_typing", ({ chatId }) => {
  if (chatId === currentChatId) {
    typingIndicator.textContent = "";
  }
});

// ─── Error handling ──────────────────────────────────────────────────────────

socket.on("error", (msg) => {
  console.error("Chat error:", msg);
});

socket.on("connect_error", (err) => {
  console.error("Connection failed:", err.message);
  chatHeader.textContent = "Reconnecting...";
});

socket.on("reconnect", () => {
  chatHeader.textContent = "Connected";
  if (currentChatId) socket.emit("join_chat", currentChatId);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderMessage(message) {
  const myUserId = window.__CURRENT_USER_ID__;
  const isMine = message.senderId === myUserId;

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${isMine ? "sent" : "received"}`;
  msgDiv.innerHTML = `
    <div class="sender">${isMine ? "You" : message.sender.name}</div>
    <div class="text">${escapeHtml(message.messageText)}</div>
    <div class="time">${new Date(message.createdAt).toLocaleTimeString()}</div>
    ${message.status === "read" && isMine ? '<div class="seen-label">Seen</div>' : ""}
  `;
  messagesDiv.appendChild(msgDiv);
}

function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
