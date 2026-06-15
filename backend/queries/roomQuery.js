const db = require("../models/index");
 
const landlords = [
  { name: 'Trần Minh Tuấn', phone: '0912 345 678', email: 'tuan.tran@gmail.com' },
  { name: 'Nguyễn Thị Hồng', phone: '0987 654 321', email: 'hong.nguyen@gmail.com' },
  { name: 'Lê Văn Hùng', phone: '0903 112 233', email: 'hung.le@gmail.com' },
  { name: 'Phạm Thanh Hà', phone: '0976 889 001', email: 'ha.pham@gmail.com' },
  { name: 'Hoàng Đức Anh', phone: '0918 776 554', email: 'anh.hoang@gmail.com' },
  { name: 'Vũ Thị Mai Lan', phone: '0933 445 667', email: 'lan.vu@gmail.com' },
  { name: 'Đặng Quốc Bảo', phone: '0965 321 987', email: 'bao.dang@gmail.com' },
  { name: 'Bùi Thị Ngọc', phone: '0944 556 778', email: 'ngoc.bui@gmail.com' },
  { name: 'Ngô Văn Thắng', phone: '0908 223 344', email: 'thang.ngo@gmail.com' },
  { name: 'Trịnh Thị Phương', phone: '0971 998 887', email: 'phuong.trinh@gmail.com' },
  { name: 'Đỗ Hoàng Nam', phone: '0922 113 445', email: 'nam.do@gmail.com' },
  { name: 'Lý Thị Kim Oanh', phone: '0939 667 889', email: 'oanh.ly@gmail.com' },
  { name: 'Phan Văn Đạt', phone: '0916 778 990', email: 'dat.phan@gmail.com' },
  { name: 'Mai Thị Thu Hằng', phone: '0955 234 567', email: 'hang.mai@gmail.com' },
  { name: 'Đinh Công Minh', phone: '0901 445 668', email: 'minh.dinh@gmail.com' },
  { name: 'Hồ Thị Yến Nhi', phone: '0967 112 334', email: 'nhi.ho@gmail.com' },
  { name: 'Dương Văn Khải', phone: '0948 998 776', email: 'khai.duong@gmail.com' },
  { name: 'Tô Thị Bích Ngọc', phone: '0923 556 112', email: 'ngoc.to@gmail.com' },
  { name: 'Châu Minh Quân', phone: '0979 334 556', email: 'quan.chau@gmail.com' },
  { name: 'Lương Thị Thanh Tâm', phone: '0911 887 665', email: 'tam.luong@gmail.com' },
];

const getLandlord = (roomId) => {
  const idx = (roomId || 0) % landlords.length;
  return landlords[idx];
};

const getListRoom = async (roomData) => {
  try {
    const existroom = await db.Room.findAll({
      where: {
         status: 'available',
      },
    });
    const populatedRooms = await Promise.all(existroom.map(async (room) => {
      const roomData = room.toJSON ? room.toJSON() : room;
      const post = await db.RentPost.findOne({
        where: { room_id: room.id }
      });
      
      let ownerInfo = null;
      if (post && post.user_id) {
        const dbUser = await db.User.findByPk(post.user_id);
        if (dbUser) {
          ownerInfo = {
            name: `${dbUser.lastName || ""} ${dbUser.firstName || ""}`.trim() || dbUser.email,
            email: dbUser.email,
            phone: dbUser.phone_number || "Chưa cập nhật",
            createdDate: post.createdAt 
              ? new Date(post.createdAt).toLocaleDateString("vi-VN") 
              : "13/12/2024"
          };
        }
      }

      if (!ownerInfo) {
        const landlord = getLandlord(room.id);
        ownerInfo = {
          name: landlord.name,
          email: landlord.email,
          phone: landlord.phone,
          createdDate: post && post.createdAt 
            ? new Date(post.createdAt).toLocaleDateString("vi-VN") 
            : "13/12/2024"
        };
      }

      roomData.Owner = ownerInfo;
      return roomData;
    }));
    return populatedRooms; 
  } catch (error) {
    throw error;
  }
}
 
const getRoomById = async (id) => {
  const room = await db.Room.findByPk(id);
  if (room) {
    const roomData = room.toJSON ? room.toJSON() : room;
    const post = await db.RentPost.findOne({
      where: { room_id: id }
    });
    
    let ownerInfo = null;
    if (post && post.user_id) {
      const dbUser = await db.User.findByPk(post.user_id);
      if (dbUser) {
        ownerInfo = {
          name: `${dbUser.lastName || ""} ${dbUser.firstName || ""}`.trim() || dbUser.email,
          email: dbUser.email,
          phone: dbUser.phone_number || "Chưa cập nhật",
          createdDate: post.createdAt 
            ? new Date(post.createdAt).toLocaleDateString("vi-VN") 
            : "13/12/2024"
        };
      }
    }

    if (!ownerInfo) {
      const landlord = getLandlord(room.id);
      ownerInfo = {
        name: landlord.name,
        email: landlord.email,
        phone: landlord.phone,
        createdDate: post && post.createdAt 
          ? new Date(post.createdAt).toLocaleDateString("vi-VN") 
          : "13/12/2024"
      };
    }

    roomData.Owner = ownerInfo;
    return roomData;
  }
  return room;
};

const updateRoomStatus = async (id, status) => {
  try {
    const room = await db.Room.findByPk(id);
    if (!room) {
      throw new Error("Không tìm thấy phòng");
    }
    room.status = status;
    await room.save();
    return room;
  } catch (error) {
    throw error;
  }
};

module.exports = {getListRoom, getRoomById, updateRoomStatus, getLandlord, landlords};