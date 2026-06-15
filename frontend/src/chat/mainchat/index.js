import { Box } from "@mui/material";
import Header from "./Header";
import ChatArea from "./ChatArea";
import Footer from "./Footer";

const ChatBox = ({ activePartnerEmail, activePartnerName, messages, loading, onSendMessage }) => {
  return (
    <Box sx={{ width: "75vw", display: "flex", flexDirection: "column", height: "100%", background: "#ffffff" }}>
      <Header activePartnerEmail={activePartnerEmail} activePartnerName={activePartnerName} />
      <ChatArea activePartnerEmail={activePartnerEmail} messages={messages} loading={loading} />
      <Footer onSendMessage={onSendMessage} />
    </Box>
  );
};

export default ChatBox;