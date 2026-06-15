const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = require("sequelize");
const { landlords } = require("../queries/roomQuery");

// Helper to find or map email to User (with self-healing)
const getUserByEmail = async (email) => {
  let user = await db.User.findOne({ where: { email } });
  if (!user) {
    const landlordMatch = landlords.find(l => l.email.toLowerCase() === email.toLowerCase());
    let firstName = "Chủ nhà";
    let lastName = "Behome";
    
    if (landlordMatch) {
      const parts = landlordMatch.name.trim().split(" ");
      if (parts.length > 1) {
        firstName = parts.pop();
        lastName = parts.join(" ");
      } else {
        firstName = landlordMatch.name;
        lastName = "";
      }
    } else if (email.includes("nhatrosachse")) {
      lastName = "Nhâtrosachsee";
    } else if (email.includes("anna")) {
      lastName = "Nguyễn Văn A";
    } else {
      lastName = email.split("@")[0];
    }
    try {
      user = await db.User.create({
        email,
        firstName,
        lastName,
        password: "Password123",
        role: "user",
        phone_number: landlordMatch ? parseInt(landlordMatch.phone.replace(/\s+/g, "")) || 999888777 : 999888777
      });
      console.log(`👤 Created self-healing user in DB: ${email}`);
    } catch (e) {
      console.error("Failed to self-heal user:", e);
    }
  }
  return user;
};

// 1. Gửi tin nhắn mới
router.post("/", async (req, res) => {
  try {
    const { senderEmail, receiverEmail, text } = req.body;
    if (!senderEmail || !receiverEmail || !text) {
      return res.status(400).json({ error: "Thiếu thông tin người gửi, nhận hoặc nội dung!" });
    }

    const sender = await getUserByEmail(senderEmail);
    const receiver = await getUserByEmail(receiverEmail);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản người gửi hoặc nhận!" });
    }

    const newMessage = await db.Message.create({
      senderId: sender.id,
      receiverId: receiver.id,
      messageText: text,
      isRead: false
    });

    return res.status(201).json({
      success: true,
      message: newMessage,
      senderEmail,
      receiverEmail
    });
  } catch (error) {
    console.error("Lỗi khi tạo tin nhắn:", error);
    return res.status(500).json({ error: "Lỗi máy chủ khi gửi tin nhắn" });
  }
});

// 2. Lấy tin nhắn giữa 2 người dùng theo Email
router.get("/chat-history", async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.query;
    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({ error: "Thiếu email người gửi hoặc nhận!" });
    }

    const sender = await getUserByEmail(senderEmail);
    const receiver = await getUserByEmail(receiverEmail);

    if (!sender || !receiver) {
      return res.status(200).json({ success: true, messages: [] });
    }

    const messages = await db.Message.findAll({
      where: {
        [Op.or]: [
          { senderId: sender.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: sender.id }
        ]
      },
      order: [["createdAt", "ASC"]]
    });

    // Định dạng lại tin nhắn kèm email để frontend dễ hiển thị
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderEmail: msg.senderId === sender.id ? senderEmail : receiverEmail,
      receiverEmail: msg.senderId === sender.id ? receiverEmail : senderEmail,
      text: msg.messageText,
      createdAt: msg.createdAt
    }));

    return res.status(200).json({
      success: true,
      messages: formattedMessages
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử tin nhắn:", error);
    return res.status(500).json({ error: "Lỗi máy chủ khi lấy lịch sử tin nhắn" });
  }
});

// 3. Lấy danh sách hội thoại của người dùng (gồm tin nhắn mới nhất và thông tin đối tác)
router.get("/conversations/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const currentUser = await getUserByEmail(email);
    if (!currentUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng!" });
    }

    // Lấy tất cả tin nhắn liên quan tới người dùng này
    let messages = await db.Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id }
        ]
      },
      order: [["createdAt", "DESC"]]
    });

    if (messages.length === 0) {
      // Seed two welcome messages in the DB between currentUser and behome / nhatrosachse
      const behome = await getUserByEmail("behome@gmail.com");
      const nhatrosachse = await getUserByEmail("nhatrosachse@gmail.com");
      
      await db.Message.create({
        senderId: behome.id,
        receiverId: currentUser.id,
        messageText: "Chào bạn, mình có thấy phòng STUDIO FULL NỘI THẤT QUẬN 8 - THUÊ NGAY KẺO LỠ và rất có hứng thú.",
        isRead: false
      });
      
      await db.Message.create({
        senderId: nhatrosachse.id,
        receiverId: currentUser.id,
        messageText: "Chào bạn, mình có thấy phòng giá rẻ tiện nghi bên mình, bạn cần tư vấn thêm gì không?",
        isRead: false
      });

      // Refetch messages!
      messages = await db.Message.findAll({
        where: {
          [Op.or]: [
            { senderId: currentUser.id },
            { receiverId: currentUser.id }
          ]
        },
        order: [["createdAt", "DESC"]]
      });
    }

    // Nhóm theo đối tác chat
    const partnersMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      if (!partnersMap.has(partnerId)) {
        partnersMap.set(partnerId, msg);
      }
    }

    const conversations = [];
    for (const [partnerId, latestMsg] of partnersMap.entries()) {
      const partner = await db.User.findByPk(partnerId);
      if (partner) {
        conversations.push({
          partnerEmail: partner.email,
          partnerName: `${partner.lastName || ""} ${partner.firstName || ""}`.trim() || partner.email,
          latestMessage: latestMsg.messageText,
          updatedAt: latestMsg.createdAt
        });
      }
    }

    // Sắp xếp cuộc trò chuyện có tin nhắn mới nhất lên đầu
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
    return res.status(500).json({ error: "Lỗi máy chủ khi lấy danh sách hội thoại" });
  }
});

module.exports = router;
