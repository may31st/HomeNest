require("dotenv").config();
const { createPost, getUserPosts } = require("../queries/postQuery");
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
        const rooms = await db.Room.findAll();
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

module.exports = {
    createPostController,
    getUserPostsController,
    deletePostController,
    toggleStatusController,
    getAllPostsController
};
