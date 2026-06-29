require('dotenv').config();
const { Room } = require('./models');

const NEW_ROOMS = [
  {
    room_name: "Cho thuê phòng trọ khép kín full đồ mới tinh tại 54 Triều Khúc",
    description: "Phòng trọ diện tích 25m2 đầy đủ nội thất bao gồm điều hòa, nóng lạnh, giường tủ, bàn ghế. An ninh tốt, khóa vân tay, giờ giấc tự do không chung chủ. Gần trường Đại học Hà Nội, Đại học Công nghệ Giao thông Vận tải.",
    price_per_month: 3.5,
    area: 25,
    status: "available",
    type: "phongtro",
    address: "54 Đường Triều Khúc, Thanh Xuân Nam, Thanh Xuân, Hà Nội",
    latitude: 20.9840,
    longitude: 105.7986,
    room_images: [
      "https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/05/28/1000001306_1779985807.jpg"
    ]
  },
  {
    room_name: "Căn hộ dịch vụ tiện nghi ngõ 66 Triều Khúc, giá rẻ cho sinh viên",
    description: "Nhà mới xây xong sạch sẽ, khép kín, ban công phơi đồ thoáng mát. Có thang máy, máy giặt chung tầng thượng. Gần chợ Phùng Khoang và làng Triều Khúc di chuyển đi học đi làm cực tiện.",
    price_per_month: 3.8,
    area: 28,
    status: "available",
    type: "dichvu",
    address: "66 Đường Triều Khúc, Thanh Xuân Nam, Thanh Xuân, Hà Nội",
    latitude: 20.9835,
    longitude: 105.7990,
    room_images: [
      "https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/04/15/e8d86f58c0aa4df414bb10_1776238445.jpg"
    ]
  },
  {
    room_name: "Chung cư mini cao cấp tại 123 Nguyễn Trãi, sát ga Royal City",
    description: "Căn studio cực đẹp, vị trí đắc địa ngay ngã tư Nguyễn Trãi - Lê Văn Lương. Đầy đủ tiện nghi cao cấp: sofa, tủ lạnh, bếp từ. An ninh tuyệt đối khóa thẻ từ và bảo vệ 24/7.",
    price_per_month: 5.5,
    area: 35,
    status: "available",
    type: "chungcumini",
    address: "123 Đường Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội",
    latitude: 20.9948,
    longitude: 105.8098,
    room_images: [
      "https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/02/01/10_1769943141.jpg"
    ]
  },
  {
    room_name: "Studio khép kín hiện đại tại 200 Nguyễn Xiển, Thanh Xuân",
    description: "Cho thuê căn studio full đồ, cửa sổ đón ánh sáng tự nhiên. Tòa nhà thang máy an ninh vân tay, gần ngã tư Nguyễn Trãi - Nguyễn Xiển, di chuyển sang Hà Đông, Linh Đàm tiện lợi.",
    price_per_month: 4.2,
    area: 30,
    status: "available",
    type: "canho",
    address: "200 Đường Nguyễn Xiển, Hạ Đình, Thanh Xuân, Hà Nội",
    latitude: 20.9912,
    longitude: 105.8123,
    room_images: [
      "https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/11/25/img-8022_1764035242.jpg"
    ]
  },
  {
    room_name: "Căn hộ dịch vụ mặt đường Trần Duy Hưng, Cầu Giấy full đồ",
    description: "Vị trí kim cương ngay mặt đường Trần Duy Hưng, đối diện Charmvit Tower và Big C Thăng Long. Thiết kế sang trọng thích hợp cho người đi làm hoặc người nước ngoài sinh sống và làm việc.",
    price_per_month: 6.8,
    area: 40,
    status: "available",
    type: "dichvu",
    address: "10 Đường Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội",
    latitude: 21.0102,
    longitude: 105.7945,
    room_images: [
      "https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/10/01/z4185545808325-f844a73b29ffd0e6d28c0e0d3f647cc8_1759291678.jpg"
    ]
  },
  {
    room_name: "Nhà trọ giá rẻ cho sinh viên tại 85 Nguyễn Khang, Yên Hòa",
    description: "Phòng trọ giá sinh viên gần cầu Yên Hòa, thông sang Láng, Cầu Giấy, Nguyễn Chí Thanh. Có giường tủ, bàn học, điều hòa mới lắp siêu tiết kiệm điện. Phù hợp ở 2 người.",
    price_per_month: 3.0,
    area: 22,
    status: "available",
    type: "phongtro",
    address: "85 Đường Nguyễn Khang, Yên Hòa, Cầu Giấy, Hà Nội",
    latitude: 21.0185,
    longitude: 105.7998,
    room_images: [
      "https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/08/25/z6929111199938-323fc8a4668782838dad17fad475f0c6_1756101482.jpg"
    ]
  }
];

async function seed() {
  try {
    let createdCount = 0;
    for (const data of NEW_ROOMS) {
      // Check if already seeded
      const exist = await Room.findOne({
        where: { room_name: data.room_name, address: data.address }
      });
      if (!exist) {
        await Room.create(data);
        createdCount++;
        console.log(`Created: "${data.room_name.substring(0, 35)}..." at "${data.address}"`);
      }
    }
    console.log(`Successfully added ${createdCount} brand new rooms to target locations.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to add new rooms:", error);
    process.exit(1);
  }
}

seed();
