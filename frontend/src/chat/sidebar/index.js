import React from "react";
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Typography } from "@mui/material";

const SideBar = ({ conversations, activePartnerEmail, setActivePartnerEmail, setActivePartnerName }) => {
  return (
    <Box sx={{ 
      width: "25vw", 
      display: "flex", 
      flexDirection: "column", 
      height: "100%", 
      borderRight: "1px solid #e0e0e0",
      background: "#ffffff"
    }}>
      {/* Pink Header exactly like the mockup */}
      <Box sx={{ p: 2, background: "#ffffff", borderBottom: "1px solid #f0f0f0" }}>
        <Box sx={{
          background: "#ec9ca4", // signature pinkish/coral color from mockup
          color: "#000000",
          p: "10px 20px",
          borderRadius: "8px",
          textAlign: "center",
          fontWeight: 700,
          fontSize: "15px"
        }}>
          Danh sách hội thoại
        </Box>
      </Box>

      {/* Conversations List */}
      <List sx={{ p: 0, overflowY: "auto", flex: "1 0 0" }}>
        {conversations.length > 0 ? (
          conversations.map((conv, index) => {
            const isActive = conv.partnerEmail === activePartnerEmail;
            return (
              <React.Fragment key={conv.partnerEmail}>
                <ListItem 
                  alignItems="flex-start"
                  onClick={() => {
                    setActivePartnerEmail(conv.partnerEmail);
                    setActivePartnerName(conv.partnerName);
                  }}
                  sx={{
                    cursor: "pointer",
                    background: isActive ? "#f5f5f5" : "transparent",
                    transition: "background 0.2s",
                    "&:hover": {
                      background: "#fafafa"
                    },
                    p: "12px 16px"
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      alt={conv.partnerName} 
                      // Custom avatars based on name to match mockup beautifully
                      src={
                        conv.partnerName.toLowerCase().includes("behome") 
                          ? "https://cdn-icons-png.flaticon.com/512/6073/6073873.png" 
                          : conv.partnerName.toLowerCase().includes("nha")
                          ? "https://cdn-icons-png.flaticon.com/512/4397/4397573.png"
                          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      sx={{ width: 44, height: 44 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333333" }}>
                        {conv.partnerName}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: "#666666", 
                          display: "inline-block",
                          width: "100%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "12px",
                          mt: 0.5
                        }}
                      >
                        {conv.latestMessage}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < conversations.length - 1 && <Divider component="li" sx={{ borderColor: "#f4f4f4" }} />}
              </React.Fragment>
            );
          })
        ) : (
          <Box sx={{ p: 3, textAlign: "center", color: "#999999" }}>
            <Typography variant="body2">Chưa có đoạn hội thoại nào.</Typography>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default SideBar;