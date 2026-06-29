import React, { useState, useEffect, useRef } from "react";
import { Paper, Box } from "@mui/material";
import SideBar from "./sidebar";
import ChatBox from "./mainchat";
import socket from "./socket";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Selected conversation partner
  const [activePartnerEmail, setActivePartnerEmail] = useState(location.state?.receiverEmail || "");
  const [activePartnerName, setActivePartnerName] = useState(location.state?.receiverName || "");
  
  const activePartnerEmailRef = useRef(location.state?.receiverEmail || "");

  useEffect(() => {
    activePartnerEmailRef.current = activePartnerEmail;
  }, [activePartnerEmail]);
  
  // Chat list and thread messages
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load current user session
  useEffect(() => {
    const authData = sessionStorage.getItem("auth");
    if (!authData) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng nhắn tin!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }
    const parsedUser = JSON.parse(authData);
    setCurrentUser(parsedUser);
  }, [navigate]);

  // Scroll to top of the page on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle initial partner from room detail navigation state
  useEffect(() => {
    if (currentUser && location.state && location.state.receiverEmail) {
      const email = location.state.receiverEmail;
      setActivePartnerEmail(email);
      setActivePartnerName(location.state.receiverName || "Chủ nhà");
    }
  }, [currentUser, location.state]);

  // Connect to Socket.IO and register email
  useEffect(() => {
    if (currentUser?.email) {
      socket.emit("join", currentUser.email);
      console.log("Joined socket room for:", currentUser.email);

      // Listen for incoming messages in real-time
      const handleIncomingMessage = (data) => {
        console.log("Received socket message:", data);
        
        // If the message is from the active chat partner, append it to the current thread
        if (data.senderEmail === activePartnerEmail) {
          setMessages((prev) => [...prev, {
            id: Date.now(),
            senderEmail: data.senderEmail,
            receiverEmail: data.receiverEmail,
            text: data.text,
            createdAt: new Date()
          }]);
        }
        
        // Refresh conversations list to update the latest message and sort order
        fetchConversations();
      };

      socket.on("getMessage", handleIncomingMessage);

      return () => {
        socket.off("getMessage", handleIncomingMessage);
      };
    }
  }, [currentUser, activePartnerEmail]);

  // Fetch all conversations of the user
  const fetchConversations = async () => {
    if (!currentUser?.email) return;
    try {
      const response = await axios.get(`http://localhost:8000/api/message/conversations/${currentUser.email}`);
      if (response.data && response.data.success) {
        setConversations(response.data.conversations);
        
        // If there's no active partner selected yet and we have conversations, select the first one
        if (!activePartnerEmailRef.current && response.data.conversations.length > 0) {
          const firstConv = response.data.conversations[0];
          setActivePartnerEmail(firstConv.partnerEmail);
          setActivePartnerName(firstConv.partnerName);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
    }
  };

  // Fetch messages between current user and selected partner
  const fetchMessages = async () => {
    if (!currentUser?.email || !activePartnerEmail) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/message/chat-history?senderEmail=${currentUser.email}&receiverEmail=${activePartnerEmail}`
      );
      if (response.data && response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử tin nhắn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      fetchConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.email && activePartnerEmail) {
      fetchMessages();
    }
  }, [currentUser, activePartnerEmail]);

  // Function to send a message (triggered from ChatBox/Footer)
  const handleSendMessage = async (text) => {
    if (!currentUser?.email || !activePartnerEmail || !text.trim()) return;
    
    // 1. Send via WebSocket for real-time delivery
    socket.emit("sendMessage", {
      senderEmail: currentUser.email,
      receiverEmail: activePartnerEmail,
      text: text
    });

    // 2. Optimistically append message to current thread
    const optimMessage = {
      id: Date.now(),
      senderEmail: currentUser.email,
      receiverEmail: activePartnerEmail,
      text: text,
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, optimMessage]);

    // 3. Persist message in the database
    try {
      await axios.post("http://localhost:8000/api/message", {
        senderEmail: currentUser.email,
        receiverEmail: activePartnerEmail,
        text: text
      });
      // Refresh the sidebar conversations list
      fetchConversations();
    } catch (error) {
      console.error("Lỗi khi lưu tin nhắn vào DB:", error);
    }
  };

  const displayedConversations = [...conversations];
  if (activePartnerEmail && !conversations.some(c => c.partnerEmail === activePartnerEmail)) {
    displayedConversations.unshift({
      partnerEmail: activePartnerEmail,
      partnerName: activePartnerName || "Chủ nhà",
      latestMessage: "Bắt đầu cuộc trò chuyện mới...",
      updatedAt: new Date().toISOString()
    });
  }

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", width: "100%", background: "#fcfcfc" }}>
      <SideBar 
        conversations={displayedConversations} 
        activePartnerEmail={activePartnerEmail}
        setActivePartnerEmail={setActivePartnerEmail}
        setActivePartnerName={setActivePartnerName}
      />
      <ChatBox 
        activePartnerEmail={activePartnerEmail}
        activePartnerName={activePartnerName}
        messages={messages}
        loading={loading}
        onSendMessage={handleSendMessage}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default Chat;