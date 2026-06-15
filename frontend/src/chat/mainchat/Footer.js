import React, { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { Input } from "antd";
import { SendOutlined } from "@ant-design/icons";

const Footer = ({ onSendMessage }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      display: "flex", 
      alignItems: "center", 
      p: 2, 
      borderTop: "1px solid #f0f0f0",
      background: "#ffffff"
    }}>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        style={{
          flex: 1,
          height: "46px",
          borderRadius: "4px", // matches mockup sharp border or rounded look!
          padding: "8px 16px",
          backgroundColor: "#ffffff",
          border: "1px solid #d9d9d9",
          fontSize: "14px"
        }}
      />
      <IconButton 
        onClick={handleSend} 
        disabled={!text.trim()}
        sx={{ 
          ml: 2, 
          color: text.trim() ? "#ec9ca4" : "#cccccc", // matches coral/pink theme
          transition: "color 0.2s"
        }}
      >
        <SendOutlined style={{ fontSize: "22px" }} />
      </IconButton>
    </Box>
  );
};

export default Footer;