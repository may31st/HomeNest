require("dotenv").config();
const { createPost, getUserPosts, updatePost } = require("../queries/postQuery");
const db = require("../models/index");
const { getLandlord } = require("../queries/roomQuery");

const createPostController = async (req, res) => {
    try {
        const postData = req.body;
        if (!postData || !postData.email) {
            return res.status(400).json({ error: "Dữ liệu đầu vào không hợp lệ" });
        }

        const newPost = await createPost(postData);

        return res.status(200).json({
            success: true,
            message: "Bài đăng đã được tạo thành công!",
            data: newPost
        });
    } catch (error) {
        console.error("Lỗi khi tạo bài đăng:", error);
        return res.status(500).json({
            success: false,
            error: "Đã xảy ra lỗi khi tạo bài đăng. Vui lòng thử lại!"
        });
    }
};

const getUserPostsController = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ error: "Email không hợp lệ" });
        }

        const posts = await getUserPosts(email);

        return res.status(200).json({
            success: true,
            posts: posts
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bài đăng:", error);
        return res.status(500).json({
            success: false,
            error: "Đã xảy ra lỗi khi lấy danh sách bài đăng. Vui lòng thử lại!"
        });
    }
};

const deletePostController = async (req, res) => {
    try {
        const { id } = req.params;
        let post = null;
        let roomId = id;

        if (typeof id === "string" && id.startsWith("temp-room-")) {
            roomId = id.replace("temp-room-", "");
        } else {
            post = await db.RentPost.findByPk(id);
            if (post) {
                roomId = post.room_id;
                await db.RentPost.destroy({ where: { id } });
            }
        }

        await db.Room.destroy({ where: { id: roomId } });

        return res.status(200).json({
            success: true,
            message: "Bài đăng đã được xóa thành công!"
        });
    } catch (error) {
        console.error("Lỗi khi xóa bài đăng:", error);
        return res.status(500).json({
            success: false,
            error: "Lỗi server khi xóa bài đăng. Vui lòng thử lại!"
        });
    }
};

const toggleStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        let post = null;
        let room = null;

        if (typeof id === "string" && id.startsWith("temp-room-")) {
            const roomId = id.replace("temp-room-", "");
            room = await db.Room.findByPk(roomId);
        } else {
            post = await db.RentPost.findByPk(id);
            if (post) {
                room = await db.Room.findByPk(post.room_id);
            } else {
                room = await db.Room.findByPk(id);
            }
        }

        if (!room) {
            return res.status(404).json({ error: "Không tìm thấy phòng tương ứng" });
        }

        const newRoomStatus = room.status === "available" ? "hidden" : "available";
        await db.Room.update({ status: newRoomStatus }, { where: { id: room.id } });

        if (post) {
            const newPostStatus = post.status === "active" ? "hidden" : "active";
            await db.RentPost.update({ status: newPostStatus }, { where: { id: post.id } });
        }

        return res.status(200).json({
            success: true,
            message: "Trạng thái bài đăng đã được thay đổi thành công!"
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái bài đăng:", error);
        return res.status(500).json({
            success: false,
            error: "Lỗi server khi cập nhật trạng thái bài đăng. Vui lòng thử lại!"
        });
    }
};

const getAllPostsController = async (req, res) => {
    try {
        const rooms = await db.Room.findAll({
            order: [['id', 'DESC']]
        });
        const results = [];
        for (const room of rooms) {
            const post = await db.RentPost.findOne({ where: { room_id: room.id } });
            let user = null;
            if (post) {
                user = await db.User.findByPk(post.user_id);
            }

            let owner_name = "Chủ trọ";
            let owner_email = "system@renthouse.com";
            let owner_phone = "Không rõ";

            if (user) {
                owner_name = `${user.lastName || ""} ${user.firstName || ""}`.trim();
                owner_email = user.email;
                owner_phone = user.phone_number || "Không rõ";
            } else {
                const landlord = getLandlord(room.id);
                if (landlord) {
                    owner_name = landlord.name;
                    owner_email = landlord.email;
                    owner_phone = landlord.phone;
                }
            }

            results.push({
                post_id: post ? post.id : `temp-room-${room.id}`,
                post_status: post ? (post.status || "active") : "active",
                created_at: post ? (post.createdAt || post.created_at) : room.createdAt,
                room_id: room.id,
                room_name: room.room_name,
                description: room.description,
                price_per_month: room.price_per_month,
                type: room.type,
                area: room.area,
                address: room.address,
                status: room.status,
                room_images: room.room_images,
                bedrooms: room.bedrooms,
                bathrooms: room.bathrooms,
                owner_name: owner_name,
                owner_email: owner_email,
                owner_phone: owner_phone
            });
        }
        return res.status(200).json({
            success: true,
            posts: results
        });
    } catch (error) {
        console.error("Lỗi khi lấy tất cả bài đăng:", error);
        return res.status(500).json({
            success: false,
            error: "Lỗi server khi lấy danh sách tất cả bài đăng"
        });
    }
};

const updatePostController = async (req, res) => {
    try {
        const { id } = req.params;
        const postData = req.body;
        if (!id || !postData) {
            return res.status(400).json({ error: "Dữ liệu đầu vào không hợp lệ" });
        }

        const result = await updatePost(id, postData);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi cập nhật bài đăng:", error);
        return res.status(500).json({
            success: false,
            error: "Đã xảy ra lỗi khi cập nhật bài đăng. Vui lòng thử lại!"
        });
    }
};

const generatePostAIController = async (req, res) => {
    try {
        const { type, area, price_per_month, address, amenities } = req.body;
        
        // Map type code to Vietnamese text
        const typeMap = {
            phongtro: "Phòng trọ",
            nhanguyencan: "Nhà nguyên căn",
            canho: "Căn hộ chung cư",
            chungcumini: "Chung cư mini",
            canhodichvu: "Căn hộ dịch vụ"
        };
        const typeText = typeMap[type] || type || "Phòng trọ";
        const areaText = area ? `${area} m²` : "Chưa xác định";
        const priceText = price_per_month ? `${price_per_month} triệu/tháng` : "Thỏa thuận";
        const addressText = address || "Chưa xác định";
        const amenitiesText = Array.isArray(amenities) && amenities.length > 0 
            ? amenities.join(", ") 
            : "Chưa cập nhật (Wifi, máy lạnh, chỗ để xe...)";

        const systemPrompt = `Bạn là một chuyên gia viết nội dung quảng cáo bất động sản phòng trọ chuyên nghiệp.
Nhiệm vụ của bạn là tạo tiêu đề (title) và mô tả (description) cực kỳ hấp dẫn và chân thực cho một bài đăng cho thuê phòng dựa trên các thông tin được cung cấp.

Yêu cầu đầu ra:
1. Tiêu đề (title): Ngắn gọn (dưới 15 từ), nổi bật, thu hút người thuê ngay từ cái nhìn đầu tiên. Sử dụng các từ ngữ kích thích (ví dụ: "SIÊU RỘNG", "HOT!", "SẮP HẾT!"). Bắt buộc KHÔNG được sử dụng bất kỳ emoji hay biểu tượng cảm xúc nào.
2. Mô tả (description): Một đoạn văn ngắn gồm 3-5 câu. Nội dung phải nêu bật các đặc điểm, ưu thế vị trí, sự tiện nghi của các tiện ích và lý do nên thuê. Sử dụng giọng văn tự nhiên, thuyết phục. Bắt buộc KHÔNG được sử dụng bất kỳ emoji hay biểu tượng cảm xúc nào.
3. Định dạng đầu ra: Bắt buộc trả về đúng định dạng JSON object, không có bất kỳ ký tự nào khác bên ngoài JSON. Cấu trúc JSON như sau:
{
  "title": "tiêu đề bài đăng",
  "description": "đoạn mô tả 3-5 câu"
}
Chú ý: Không bao gồm bất kỳ ký tự Markdown nào khác như \`\`\`json ở đầu và cuối phản hồi. Hãy trả về JSON thô.`;

        const userPrompt = `Hãy tạo tiêu đề và mô tả bài đăng cho thuê phòng với thông tin sau:
- Loại phòng: ${typeText}
- Diện tích: ${areaText}
- Mức giá thuê: ${priceText}
- Địa chỉ/Vị trí: ${addressText}
- Các tiện ích đi kèm: ${amenitiesText}`;

        const openRouterApiKey = process.env.OPENROUTER_KEY;
        if (!openRouterApiKey) {
            return res.status(500).json({
                success: false,
                error: "OPENROUTER_KEY chưa được cấu hình trên server."
            });
        }

        console.log("[AI Generate] Sending request to OpenRouter LLM...");
        
        let apiResponse = null;
        const models = [
            "google/gemma-3-12b-it:free",
            "google/gemma-2-9b-it:free",
            "meta-llama/llama-3-8b-instruct:free"
        ];
        
        let lastError = null;
        for (const model of models) {
            try {
                console.log(`[AI Generate] Trying model: ${model}`);
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${openRouterApiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://homenest.com",
                        "X-Title": "HomeNest Assistant"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt }
                        ],
                        max_tokens: 500,
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`Model ${model} failed: ${response.status} - ${errText}`);
                }

                const resJson = await response.json();
                if (resJson && resJson.choices && resJson.choices.length > 0) {
                    apiResponse = resJson.choices[0].message.content;
                    console.log(`[AI Generate] Success with model: ${model}`);
                    break;
                }
            } catch (err) {
                console.warn(`[AI Generate] Error with model ${model}:`, err.message);
                lastError = err;
            }
        }

        if (!apiResponse) {
            throw new Error(lastError ? lastError.message : "Tất cả các model của OpenRouter đều thất bại.");
        }

        // Parse response
        let botText = apiResponse.trim();
        let cleanedText = botText;
        
        // Extract JSON using regex just in case the model returned markdown backticks
        const jsonMatch = botText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanedText = jsonMatch[0];
        }

        let resultData;
        try {
            resultData = JSON.parse(cleanedText);
        } catch (parseErr) {
            console.error("[AI Generate] Failed to parse JSON from response:", botText);
            resultData = {
                title: `Cho thuê ${typeText} ${areaText} tại ${addressText.split(',')[0]}`,
                description: `Cho thuê ${typeText} diện tích ${areaText} với giá ${priceText} tại địa chỉ ${addressText}. Phòng có sẵn các tiện ích: ${amenitiesText}. Vui lòng liên hệ để biết thêm chi tiết.`
            };
        }

        return res.status(200).json({
            success: true,
            data: resultData
        });

    } catch (error) {
        console.warn("[AI Generate] OpenRouter LLM failed or unauthorized. Generating local fallback...", error.message);
        
        const { type, area, price_per_month, address, amenities } = req.body;
        const typeMap = {
            phongtro: "Phòng trọ",
            nhanguyencan: "Nhà nguyên căn",
            canho: "Căn hộ chung cư",
            chungcumini: "Chung cư mini",
            canhodichvu: "Căn hộ dịch vụ"
        };
        const typeText = typeMap[type] || type || "Phòng trọ";
        const areaText = area ? `${area}m²` : "";
        
        let formattedPrice = "Thỏa thuận";
        if (price_per_month) {
            const priceNum = parseFloat(price_per_month);
            if (!isNaN(priceNum)) {
                if (priceNum >= 1) {
                    formattedPrice = `${priceNum.toLocaleString("vi-VN")} TRIỆU`;
                } else {
                    formattedPrice = `${Math.round(priceNum * 1000000).toLocaleString("vi-VN")}đ`;
                }
            }
        }

        let locationText = "khu vực trung tâm";
        if (address) {
            const parts = address.split(",");
            if (parts.length > 1) {
                locationText = `${parts[0].trim()} - ${parts[1].trim()}`;
            } else {
                locationText = address.trim();
            }
        }
        
        const randomTitle = `HOT! ${typeText.toUpperCase()} SIÊU RỘNG, giá chỉ ${formattedPrice}! SẮP HẾT!`;

        const selectedAmenities = amenities || [];
        const amenitiesText = Array.isArray(selectedAmenities) && selectedAmenities.length > 0
            ? `Căn phòng đã được trang bị đầy đủ tiện ích tiện lợi: ${selectedAmenities.join(", ")}.`
            : "Căn phòng đã có sẵn đầy đủ các trang thiết bị tiện nghi cơ bản.";

        const description = `WOW! Bạn không nhìn nhầm đâu! Cho thuê ${typeText.toLowerCase()} rộng ${areaText || "rãi"} tại ${address || "khu vực trung tâm"} chỉ với giá thuê cực kỳ hấp dẫn: ${price_per_month ? parseFloat(price_per_month).toLocaleString("vi-VN") + " triệu/tháng" : "Thỏa thuận"}! GIÁ CỰC ƯU ĐÃI – ${amenitiesText} Không gian thoáng mát, sạch sẽ, khu vực cực kỳ an ninh, gần nhiều tiện ích xung quanh. Cơ hội vàng không thể bỏ lỡ!`;

        return res.status(200).json({
            success: true,
            data: {
                title: randomTitle,
                description: description
            }
        });
    }
};

module.exports = {
    createPostController,
    getUserPostsController,
    deletePostController,
    toggleStatusController,
    getAllPostsController,
    updatePostController,
    generatePostAIController
};

