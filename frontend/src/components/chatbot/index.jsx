import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "antd";
import axios from "axios";
import "./index.css";

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Chào bạn, mình là Trợ lý HomeNest! Mình có thể giúp gì cho bạn hôm nay? 🧸",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat logs
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue("");
    
    // Add user message to state
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessageText,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/v1/chatbot/query", {
        query: userMessageText,
      });

      if (response.status === 200 && response.data?.response) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: response.data.response,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("ChatBot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Xin lỗi bạn, hệ thống đang gặp lỗi kết nối. Bạn vui lòng thử lại sau nhé! 😥",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Helper to detect URLs in chatbot response and make them clickable
  const formatText = (text) => {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="chatbot-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Format time (HH:MM)
  const formatTime = (dateObj) => {
    const d = new Date(dateObj);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="chatbot-widget-container">
      {/* 1. Floating Teddy Bear Icon (Image 1) */}
      {!isOpen && (
        <Tooltip title="Hỏi Trợ lý HomeNest" placement="left">
          <div className="chatbot-float-btn" onClick={() => setIsOpen(true)}>
            <div className="chatbot-bear-avatar">🧸</div>
          </div>
        </Tooltip>
      )}

      {/* 2. Chatbot Overlay Panel (Image 2) */}
      {isOpen && (
        <div className="chatbot-panel animate-slide-up">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <span className="chatbot-header-avatar">🧸</span>
              <span className="chatbot-header-title">Trợ lý HomeNest</span>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              ➖
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message-row ${
                  msg.sender === "user" ? "user-row" : "bot-row"
                }`}
              >
                <div className={`chatbot-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                  <div className="chatbot-bubble-text">{formatText(msg.text)}</div>
                  <div className="chatbot-bubble-meta">
                    <span className="chatbot-msg-time">{formatTime(msg.timestamp)}</span>
                    {msg.sender === "user" && (
                      <span className="chatbot-msg-status">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="chatbot-message-row bot-row">
                <div className="chatbot-bubble bot-bubble chatbot-loading-bubble">
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-footer">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Nhập câu hỏi bạn muốn hỏi"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="chatbot-send-btn" onClick={handleSend} disabled={isLoading}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotWidget;
