const db = require("../models/index");

const createPost = async (postData) => {
    try {
      const {
        email,
        lastName,
        phone_number,
        room_name,
        description,
        price_per_month,
        type,
        area,
        address,
        room_images,
        bedrooms,
        bathrooms,
      } = postData;
  
      const result = await db.sequelize.transaction(async (t) => {
        let user = await db.User.findOne({ where: { email }, transaction: t });
  
        if (!user) {
          // Nếu không tìm thấy user, tạo mới
          user = await db.User.create(
            {
              email,
              lastName,
              phone_number,
              password :"123456",
            },
            { transaction: t }
          );
        } else {
          // Nếu đã có user, cập nhật thông tin
          await db.User.update(
            {
              lastName,
              phone_number,
              updated_at: new Date(),
            },
            { where: { id: user.id }, transaction: t }
          );
        }
  
        // 2. Tạo phòng mới
        let latitude = 10.7797;
        let longitude = 106.6668;
        if (address) {
          try {
            const token = process.env.MAPBOX_TOKEN;
            if (!token) {
              console.warn("WARNING: MAPBOX_TOKEN is missing from environment variables.");
            }

            const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`;
            const geoRes = await fetch(geocodeUrl);
            const geoData = await geoRes.json();
            if (geoData && geoData.features && geoData.features.length > 0) {
              const [lng, lat] = geoData.features[0].center;
              latitude = lat;
              longitude = lng;
            } else {
              // Fallback based on address keywords
              if (address.toLowerCase().includes("hà nội") || address.toLowerCase().includes("triều khúc") || address.toLowerCase().includes("thanh xuân") || address.toLowerCase().includes("cầu giấy")) {
                latitude = 21.0285;
                longitude = 105.8048;
              }
            }
          } catch (err) {
            console.error("Mapbox geocoding error during createPost:", err);
          }
        }

        const room = await db.Room.create(
          {
            room_name,
            description,
            price_per_month,
            type,
            area,
            address,
            latitude,
            longitude,
            status: "available",
            room_images: room_images || [],
            bedrooms: type === "phongtro" ? 1 : (parseInt(bedrooms) || 1),
            bathrooms: type === "phongtro" ? 1 : (parseInt(bathrooms) || 1),
          },
          { transaction: t }
        );
  
        // 3. Tạo bài đăng
        const post = await db.RentPost.create(
          {
            user_id: user.id, // Gán user_id từ user đã tìm hoặc tạo mới
            room_id: room.id,
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction: t }
        );
  
        return {
          post,
          room,
          user,
          message: "Post created successfully",
        };
      });
  
      return result;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

// // Query để lấy thông tin post với đầy đủ thông tin liên quan
// const getPostDetails = async (postId) => {
//   try {
//     const post = await db.RentPost.findOne({
//       where: { id: postId },
//       include: [
//         {
//           model: db.User,
//           attributes: ["id", "email", "lastName", "phone_number"],
//         },
//         {
//           model: db.Room,
//           attributes: [
//             "id",
//             "room_name",
//             "description",
//             "price_per_month",
//             "type",
//             "area",
//             "address",
//           ],
//         },
//       ],
//     });

//     return post;
//   } catch (error) {
//     console.error("Error getting post details:", error);
//     throw error;
//   }
// };

// // Query để lấy danh sách posts của một user
// const getUserPosts = async (userId) => {
//   try {
//     const posts = await db.RentPost.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: db.Room,
//           attributes: [
//             "room_name",
//             "description",
//             "price_per_month",
//             "type",
//             "area",
//             "address",
//           ],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     return posts;
//   } catch (error) {
//     console.error("Error getting user posts:", error);
//     throw error;
//   }
// };

const getUserPosts = async (email) => {
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return [];
    
    const posts = await db.RentPost.findAll({
      where: { user_id: user.id },
      order: [['id', 'DESC']]
    });
    if (posts.length === 0) return [];
    
    const results = [];
    for (const post of posts) {
      const room = await db.Room.findByPk(post.room_id);
      if (room) {
        results.push({
          post_id: post.id,
          post_status: post.status || "active",
          created_at: post.createdAt || post.created_at,
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
        });
      }
    }
    return results;
  } catch (error) {
    console.error("Error getting user posts:", error);
    throw error;
  }
};

const updatePost = async (postId, postData) => {
  try {
    const {
      room_name,
      description,
      price_per_month,
      type,
      area,
      address,
      room_images,
      bedrooms,
      bathrooms,
    } = postData;

    const result = await db.sequelize.transaction(async (t) => {
      let post = null;
      let roomId = postId;

      if (typeof postId === "string" && postId.startsWith("temp-room-")) {
        roomId = postId.replace("temp-room-", "");
      } else {
        post = await db.RentPost.findByPk(postId, { transaction: t });
        if (post) {
          roomId = post.room_id;
        }
      }

      const room = await db.Room.findByPk(roomId, { transaction: t });
      if (!room) {
        throw new Error("Không tìm thấy phòng tương ứng");
      }

      // Calculate latitude and longitude if address has changed
      let latitude = room.latitude;
      let longitude = room.longitude;
      if (address && address !== room.address) {
        try {
          const token = process.env.MAPBOX_TOKEN;
          if (!token) {
            console.warn("WARNING: MAPBOX_TOKEN is missing from environment variables.");
          }

          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`;
          const geoRes = await fetch(geocodeUrl);
          const geoData = await geoRes.json();
          if (geoData && geoData.features && geoData.features.length > 0) {
            const [lng, lat] = geoData.features[0].center;
            latitude = lat;
            longitude = lng;
          } else {
            // Fallback based on address keywords
            if (address.toLowerCase().includes("hà nội") || address.toLowerCase().includes("triều khúc") || address.toLowerCase().includes("thanh xuân") || address.toLowerCase().includes("cầu giấy")) {
              latitude = 21.0285;
              longitude = 105.8048;
            }
          }
        } catch (err) {
          console.error("Mapbox geocoding error during updatePost:", err);
        }
      }

      await db.Room.update(
        {
          room_name,
          description,
          price_per_month: parseFloat(price_per_month),
          type,
          area: parseInt(area),
          address,
          latitude,
          longitude,
          room_images: room_images || [],
          bedrooms: type === "phongtro" ? 1 : (parseInt(bedrooms) || 1),
          bathrooms: type === "phongtro" ? 1 : (parseInt(bathrooms) || 1),
        },
        { where: { id: roomId }, transaction: t }
      );

      if (post) {
        await db.RentPost.update(
          {
            updated_at: new Date(),
          },
          { where: { id: post.id }, transaction: t }
        );
      }

      return {
        success: true,
        message: "Bài đăng đã được cập nhật thành công!"
      };
    });

    return result;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

module.exports = {
  createPost,
  getUserPosts,
  updatePost,
};
