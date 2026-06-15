import React, { useEffect, useRef } from "react";
import { Box, List, ListItem, Paper, Typography } from "@mui/material";

const ChatArea = ({ activePartnerEmail, messages, loading }) => {
  const bottomRef = useRef(null);

  // Smooth scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activePartnerEmail) {
    return (
      <Box sx={{ 
        flex: "1 1 0", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "#ffffff",
        color: "#999999"
      }}>
        <Typography>Vui lòng chọn một cuộc hội thoại từ danh sách để bắt đầu nhắn tin.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: "80%", 
      overflowY: "auto", 
      p: 3, 
      flex: "1 1 0", 
      background: "#ffffff" // white/clean background matching mockup
    }}>
      <List sx={{ p: 0 }}>
        {messages.map((msg, index) => {
          // If the message is from activePartnerEmail, it's a RECEIVED message (left / light gray)
          // Otherwise, it's a SENT message (right / light green)
          const isReceived = msg.senderEmail === activePartnerEmail;

          // Format timestamp cleanly
          const formattedTime = msg.createdAt 
            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "vài giây trước";

          return (
            <ListItem 
              key={msg.id || index} 
              sx={{ 
                display: "flex", 
                justifyContent: isReceived ? "flex-start" : "flex-end", 
                mb: 2.5,
                p: 0
              }}
            >
              <Box sx={{ 
                maxWidth: "70%", 
                display: "flex", 
                flexDirection: "column",
                alignItems: isReceived ? "flex-start" : "flex-end"
              }}>
                <Paper sx={{ 
                  p: "14px 20px", 
                  borderRadius: isReceived ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                  // Colors matching Figure 4.24 perfectly!
                  background: isReceived ? "#e9e9e9" : "#e2ffd2", 
                  boxShadow: "none",
                  border: isReceived ? "1px solid #e0e0e0" : "1px solid #d4f3c0"
                }}>
                  <Typography variant="body2" sx={{ 
                    color: "#2c2c2c", 
                    fontSize: "14px", 
                    lineHeight: "1.5",
                    wordBreak: "break-word"
                  }}>
                    {msg.text}
                  </Typography>
                </Paper>
                
                <Typography variant="caption" sx={{ color: "#a0a0a0", mt: 0.5, fontSize: "10px", px: 1 }}>
                  {formattedTime}
                </Typography>
              </Box>
            </ListItem>
          );
        })}
        <div ref={bottomRef} />
      </List>
    </Box>
  );
};

export default ChatArea;