import React from "react";
import { Box, Typography } from "@mui/material";

const Header = ({ activePartnerEmail, activePartnerName }) => {
  return (
    <Box sx={{ 
      p: "16px 24px", 
      borderBottom: "1px solid #e0e0e0",
      background: "#ffffff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "16px", color: "#333333" }}>
        {activePartnerName || "Chưa chọn cuộc trò chuyện"}
      </Typography>
      {activePartnerEmail && (
        <Typography variant="caption" sx={{ color: "#8c8c8c", mt: 0.5 }}>
          {activePartnerEmail} • Đã kết nối
        </Typography>
      )}
    </Box>
  );
};

export default Header;