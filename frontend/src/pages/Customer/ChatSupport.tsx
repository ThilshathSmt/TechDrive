// src/pages/Support/ChatSupport.tsx
import React from "react";
import { MessageSquare } from "lucide-react";
import ChatWidget from "../../components/ChatWidget"; // adjust path

const ChatSupport: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat Support</h1>
        <p className="text-gray-600 mt-1">Talk to our support chatbot</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <ChatWidget
          mode="inline"
          height={520}
          title="Support Chatbot"
          subtitle="Typically replies in seconds"
          // apiUrl="http://localhost:8005/chat" // override if needed
          // temperature={0.7}
          // maxTokens={500}
        />
      </div>
    </div>
  );
};

export default ChatSupport;