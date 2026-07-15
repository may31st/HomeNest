const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const db = require("../models");

const {
  synonyms,
  amenitiesSynonyms,
  processKeywords,
  removeVietnameseAccents,
  normalizeLocation,
  containsDistrictNumber,
  haversineDistance,
  analyzeQuery,
  geocodeAddress
} = require("../utils/chatbotHelper");

// ----------------- Route handler -----------------
router.post("/query", async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`[ChatBot] Received query: "${query}"`);

    // Kiểm tra câu hỏi xã giao / chào hỏi xã giao
    const greetings = ["xin chào", "chào bạn", "chào", "hello", "hi", "alo", "helo", "chao"];
    const queryClean = removeVietnameseAccents(query).trim();
    const hasSearchKeywords = /phong|tro|nha|can ho|thue|tim|duoi|trieu|gan|quanh|tai|khu vuc|gia/i.test(queryClean);
    // Check if it matches any process keyword before classifying as greeting
    const queryLowerForGreeting = query.toLowerCase();
    const queryNormForGreeting = removeVietnameseAccents(queryLowerForGreeting);
    const isProcessQuery = Object.values(processKeywords).some(keywords =>
      keywords.some(kw => queryLowerForGreeting.includes(kw) || queryNormForGreeting.includes(removeVietnameseAccents(kw)))
    );
    const isGreeting = !isProcessQuery && (greetings.some(g => queryClean === removeVietnameseAccents(g)) || (!hasSearchKeywords && queryClean.length < 10));

    if (isGreeting) {
      console.log("[ChatBot] Intercepted social greeting query.");
      return res.status(200).json({
        query,
        response: `Chào bạn! Mình là Trợ lý ảo của HomeNest. 🧸\n\nMình có thể hỗ trợ bạn:\n1. Tìm kiếm phòng trọ phù hợp (ví dụ: "Tìm phòng trọ gần Triều Khúc dưới 4 triệu" hoặc "Tìm căn hộ mini có máy giặt ở quận 10").\n2. Giải đáp các quy trình đặt phòng, đăng bài, thanh toán hợp đồng và chính sách hoàn tiền trên HomeNest.\n\nBạn cần mình giúp gì hôm nay ạ?`
      });
    }

    const analysis = analyzeQuery(query);
    const filters = analysis.filters;

    let contextDocuments = [];

    if (filters.process_category) {
      // 1. TRUY VẤN QUY TRÌNH HƯỚNG DẪN
      console.log(`[ChatBot] Matched process category: "${filters.process_category}"`);
      const docPath = path.join(__dirname, "../../ChatBot/process_infor_document.json");
      
      let processDocs = [];
      try {
        const raw = await fs.readFile(docPath, "utf-8");
        processDocs = JSON.parse(raw);
      } catch (err) {
        console.error("[ChatBot] Failed to read process_infor_document.json:", err);
      }

      const matchedDoc = processDocs.find(
        (doc) => doc.category.toLowerCase() === filters.process_category.toLowerCase()
      );

      if (matchedDoc) {
        contextDocuments.push({
          type: "process_info",
          category: matchedDoc.category,
          content: matchedDoc.content
        });
      }
    } else {
      // 2. TRUY VẤN TÌM PHÒNG TRỌ
      console.log("[ChatBot] Analyzing room criteria filters:", filters);

      // Nếu có tìm địa chỉ cụ thể, tiến hành geocoding
      let userLocation = null;
      if (filters.userAddress) {
        userLocation = await geocodeAddress(filters.userAddress, filters.city);
        if (userLocation) {
          console.log(`[ChatBot] Geocoded location: lat=${userLocation.latitude}, lon=${userLocation.longitude}`);
        }
      }

      // Lấy toàn bộ phòng có trạng thái 'available' từ database
      const dbRooms = await db.Room.findAll({
        where: { status: "available" }
      });

      const filteredRooms = [];
      for (const room of dbRooms) {
        let valid = true;
        let distance = null;

        // Lọc theo khoảng cách địa lý (Haversine) nếu có toạ độ geocoding
        if (userLocation && room.latitude && room.longitude) {
          distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            room.latitude,
            room.longitude
          );
          if (distance > filters.radius) {
            valid = false;
          }
        }

        // Lọc song song theo text match nếu geocoding không thành công hoặc địa chỉ bị lỗi
        if (filters.userAddress) {
          const roomAddrNorm = removeVietnameseAccents(room.address || "").replace(/\s+/g, '');
          const roomDescNorm = removeVietnameseAccents(room.description || "").replace(/\s+/g, '');
          const roomNameNorm = removeVietnameseAccents(room.room_name || "").replace(/\s+/g, '');
          
          // Lấy cụm chữ không chứa số ở đầu (ví dụ: "54 triều khúc" -> "triềukhúc")
          const addressTextOnly = removeVietnameseAccents(filters.userAddress)
            .replace(/^\d+\s*(?:[\/\-]\s*\d+)?\s*(?:ngõ|ngo|ngách|ngach|hẻm|hem)?\s*/i, "")
            .replace(/\s+/g, '');

          const matchesText = roomAddrNorm.includes(addressTextOnly) || 
                              roomDescNorm.includes(addressTextOnly) || 
                              roomNameNorm.includes(addressTextOnly);

          // Nếu geocoding thất bại (không có toạ độ địa lý) thì ta lọc dựa trên khớp tên đường
          if (!userLocation && !matchesText) {
            valid = false;
          }
        }

        // Lọc theo khoảng giá tối thiểu
        if (filters.price_min && room.price_per_month) {
          if (room.price_per_month * 1000000 < filters.price_min) {
            valid = false;
          }
        }

        // Lọc theo khoảng giá tối đa
        if (filters.price_max && room.price_per_month) {
          if (room.price_per_month * 1000000 > filters.price_max) {
            valid = false;
          }
        }

        // Lọc theo quận/huyện
        if (filters.district && room.address) {
          const filterDistrictNorm = normalizeLocation(filters.district);
          const filterQuanMatch = filterDistrictNorm.match(/quan(\d+)/);
          const filterQuanNumber = filterQuanMatch ? filterQuanMatch[1] : null;

          const addressLower = room.address.toLowerCase();
          const descriptionLower = (room.description || "").toLowerCase();
          let foundDistrict = false;

          if (filterQuanNumber) {
            if (containsDistrictNumber(room.address, filterQuanNumber) || containsDistrictNumber(room.description, filterQuanNumber)) {
              foundDistrict = true;
            }
          } else {
            const docDistrictNorm = normalizeLocation(room.address);
            if (docDistrictNorm.includes(filterDistrictNorm)) {
              foundDistrict = true;
            }
          }

          if (!foundDistrict) {
            valid = false;
          }
        }

        // Lọc theo thành phố
        if (filters.city && room.address) {
          const filterCityNorm = normalizeLocation(filters.city);
          const addressLowerNorm = normalizeLocation(room.address);
          if (!addressLowerNorm.includes(filterCityNorm)) {
            valid = false;
          }
        }

        // Lọc theo loại phòng/nhà
        if (filters.type && room.type) {
          const filterType = filters.type.toLowerCase();
          const docType = room.type.toLowerCase();
          let matchedType = false;

          for (const [key, synonymsList] of Object.entries(synonyms)) {
            if (synonymsList.includes(filterType) && synonymsList.includes(docType)) {
              matchedType = true;
              break;
            }
          }

          if (!matchedType && filterType !== docType) {
            valid = false;
          }
        }

        // Lọc theo các tiện ích
        if (filters.amenities) {
          for (const amenity of filters.amenities) {
            let matchedAmenity = false;
            const docContent = `${room.room_name} ${room.description} ${room.address}`.toLowerCase();
            const syns = amenitiesSynonyms[amenity];

            for (const syn of syns) {
              if (docContent.includes(syn)) {
                matchedAmenity = true;
                break;
              }
            }

            if (!matchedAmenity) {
              valid = false;
            }
          }
        }

        if (valid) {
          filteredRooms.push({ room, distance });
        }
      }

      // Sắp xếp
      if (userLocation) {
        filteredRooms.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        // Mặc định sắp xếp theo giá tăng dần
        filteredRooms.sort((a, b) => (a.room.price_per_month || Infinity) - (b.room.price_per_month || Infinity));
      }

      // Lấy tối đa 3 kết quả
      const topRooms = filteredRooms.slice(0, 3);
      contextDocuments = topRooms.map((r, i) => {
        const roomData = r.room.toJSON ? r.room.toJSON() : r.room;
        return {
          type: "room_info",
          room_name: roomData.room_name,
          address: roomData.address,
          price_per_month: roomData.price_per_month,
          description: roomData.description,
          distance: r.distance,
          url: `http://localhost:3000/user/room-details/${roomData.id}`
        };
      });
    }

    // 3. XÂY DỰNG PROMPT & GỌI OPENROUTER LLM
    let contextStr = "";
    contextDocuments.forEach((doc, i) => {
      if (doc.type === "process_info") {
        contextStr += `--- Hướng dẫn về ${doc.category} ---\n${doc.content}\n\n`;
      } else {
        contextStr += `--- Thông tin phòng ${i + 1} ---\n`;
        contextStr += `Tên: ${doc.room_name || "Không có tên"}\n`;
        contextStr += `Địa chỉ: ${doc.address || "Không có địa chỉ"}\n`;
        contextStr += `Giá: ${doc.price_per_month ? doc.price_per_month + " triệu/tháng" : "Chưa cập nhật"}\n`;
        if (doc.distance !== null && doc.distance !== undefined) {
          contextStr += `Khoảng cách: ${doc.distance.toFixed(2)}km\n`;
        }
        contextStr += `Mô tả: ${doc.description ? doc.description.substring(0, 100) + "..." : "Không có mô tả"}\n`;
        contextStr += `Link: ${doc.url}\n\n`;
      }
    });

    let systemPrompt = "";
    let userPrompt = "";

    if (filters.process_category) {
      systemPrompt = `Bạn là trợ lý ảo cho website HomeNest đăng tin cho thuê phòng trọ và căn hộ.
Hãy trả lời ngắn gọn, tạo phản hồi có cấu trúc rõ ràng, tập trung vào các thông tin quan trọng nhất.
Nếu không có thông tin chi tiết đầy đủ trong ngữ cảnh, hãy nêu những gì bạn biết dựa trên ngữ cảnh đó và khuyên người dùng liên hệ quản trị viên website hoặc hotline để được hỗ trợ thêm.
Trả lời rõ ràng, dễ hiểu, thân thiện, sử dụng thêm các emoji đáng yêu.`;
      
      userPrompt = `Ngữ cảnh hỗ trợ:
${contextStr}

Câu hỏi người dùng: ${query}

Hãy giải thích quy trình một cách rõ ràng và dễ hiểu.`;
    } else {
      systemPrompt = `Bạn là trợ lý ảo cho website HomeNest đăng tin cho thuê phòng trọ và căn hộ.
Nhiệm vụ của bạn là hỗ trợ người dùng tìm được phòng phù hợp nhất dựa trên thông tin danh sách các phòng được đề xuất trong ngữ cảnh.
Nếu có kết quả, hãy tóm tắt ngắn gọn các lựa chọn phòng phù hợp nhất, so sánh ưu điểm nổi bật (như giá cả, khoảng cách, tiện nghi) và đưa ra lời khuyên lựa chọn.
Bắt buộc phải kèm theo link chi tiết của từng phòng ở cuối phản hồi (ví dụ: http://localhost:3000/user/room-details/:id) để người dùng bấm vào xem.
Nếu không có phòng phù hợp, hãy thông báo thân thiện và đề xuất người dùng thay đổi tiêu chí tìm kiếm hoặc từ khóa (ví dụ: mở rộng khoảng cách hoặc giá tiền).
Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, đáng yêu (có các emoji dễ thương).`;

      userPrompt = `Danh sách phòng đề xuất:
${contextStr}

Yêu cầu tìm kiếm của người dùng: ${query}

Hãy tóm tắt các lựa chọn và đưa ra lời khuyên chọn phòng phù hợp nhất.`;
    }

    const openRouterApiKey = process.env.OPENROUTER_KEY;
    if (!openRouterApiKey) {
      console.warn("WARNING: OPENROUTER_KEY is not defined in environment variables.");
    }

    console.log("[ChatBot] Sending request to OpenRouter LLM...");

    let botResponse = "";
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://homenest.com",
          "X-Title": "HomeNest Assistant"
        },
        body: JSON.stringify({
          model: "google/gemma-3-12b-it:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API failed with status ${response.status}: ${errorText}`);
      }

      const resJson = await response.json();
      botResponse = resJson.choices[0].message.content;
      console.log(`[ChatBot] Bot response completed successfully via LLM.`);
    } catch (llmError) {
      console.warn("[ChatBot] OpenRouter LLM failed or unauthorized. Generating fallback response locally...", llmError.message);
      
      // Fallback response generation
      if (filters.process_category && contextDocuments.length > 0) {
        botResponse = `Chào bạn! Dưới đây là thông tin hướng dẫn chi tiết về **${filters.process_category}** tại HomeNest:\n\n${contextDocuments[0].content}\n\n*Nếu bạn cần thêm sự hỗ trợ, hãy liên hệ trực tiếp với bộ phận chăm sóc khách hàng của chúng mình nhé! 🧸*`;
      } else if (!filters.process_category) {
        if (contextDocuments.length > 0) {
          botResponse = `Chào bạn! Dưới đây là danh sách một số phòng trọ phù hợp nhất với yêu cầu tìm kiếm của bạn trên hệ thống HomeNest:\n\n`;
          contextDocuments.forEach((doc, idx) => {
            botResponse += `**Phòng ${idx + 1}: ${doc.room_name}**\n`;
            botResponse += `- Địa chỉ: ${doc.address}\n`;
            botResponse += `- Giá thuê: ${doc.price_per_month ? doc.price_per_month + " triệu/tháng" : "Chưa cập nhật"}\n`;
            if (doc.distance !== null && doc.distance !== undefined) {
              botResponse += `- Khoảng cách: ${doc.distance.toFixed(2)} km\n`;
            }
            botResponse += `- Xem chi tiết phòng: ${doc.url}\n\n`;
          });
          botResponse += `*Lời khuyên từ HomeNest: Bạn nên nhắn tin trực tiếp với chủ trọ hoặc đăng ký đặt phòng ngay để giữ chỗ sớm nhất nhé! 🧸*`;
        } else {
          botResponse = `Chào bạn! Rất tiếc là hiện tại hệ thống HomeNest chưa tìm thấy phòng nào phù hợp hoàn toàn với tiêu chí tìm kiếm của bạn. 😥\n\nBạn có thể thử điều chỉnh lại câu hỏi của mình, ví dụ như:\n- Thay đổi khoảng giá (ví dụ: "dưới 5 triệu", "từ 2 đến 4 triệu")\n- Thay đổi địa điểm hoặc quận khác (ví dụ: "ở quận 10", "gần Đại học Bách Khoa")\n- Tìm kiếm theo các tiện ích khác.\n\nChúc bạn sớm tìm được căn phòng ưng ý! 🧸`;
        }
      } else {
        botResponse = `Chào bạn! HomeNest chưa tìm thấy thông tin phù hợp với yêu cầu hướng dẫn này. Bạn vui lòng liên hệ quản trị viên website để được hỗ trợ nhé! 🧸`;
      }
    }

    return res.status(200).json({
      query,
      response: botResponse
    });

  } catch (error) {
    console.error("[ChatBot] Handler error:", error);
    next(error);
  }
});

module.exports = router;
