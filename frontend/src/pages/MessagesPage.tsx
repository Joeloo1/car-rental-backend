import React from "react";
import LenderChatInbox from "../components/Chat/LenderChatInbox";

const MessagesPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1
            className="font-heading font-bold mb-1"
            style={{ fontSize: "clamp(22px, 3vw, 28px)", color: "var(--color-text-primary)" }}
          >
            Messages
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Your conversations with car hosts and renters
          </p>
        </div>

        <LenderChatInbox />
      </div>
    </div>
  );
};

export default MessagesPage;
