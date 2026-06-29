import React, { useEffect, useState } from "react";
import "./index.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import { detailRoomInformation, listHomeInformation, updateRoomStatus } from "../../../api/requestHomeApi";
import GoogleMapComponent from "../../../components/google-maps/googleMap";
import { Rating } from "@mui/material";
import { Button, message, Modal, Input } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import coursImage from "../../../assets/images/cours.jpg";
import cours2Image from "../../../assets/images/cours2.jpg";
import cours3Image from "../../../assets/images/cours3.jpg";
import cours4Image from "../../../assets/images/cours4.jpg";

const DEFAULT_IMAGES = [coursImage, cours2Image, cours3Image, cours4Image];

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

const DetailRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagesDetails, setImagesDetails] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [room, setRoom] = useState({});
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [favorite, setFavorite] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [rentModalVisible, setRentModalVisible] = useState(false);

  // Form states for consultant request
  const [consultName, setConsultName] = useState("");
  const [consultPhone, setConsultPhone] = useState("");

  const fetchRoomData = async () => {
    try {
      // 1. Fetch Room Details
      const dataRoom = await detailRoomInformation(id);
      if (dataRoom && dataRoom.dataRoom) {
        const item = dataRoom.dataRoom;
        setRoom(item);
        let images = [];
        if (item.room_images && Array.isArray(item.room_images)) {
          images = item.room_images.filter(img => img !== null && img !== undefined && img !== "");
        }
        if (images.length === 0) {
          images = DEFAULT_IMAGES;
        }
        setImagesDetails(images);
        setSelectedImage(images[0]);
      }

      // 2. Fetch Related Rooms dynamically
      const resRelated = await listHomeInformation();
      if (resRelated && resRelated.listRoom) {
        // Exclude the current room and take the first 3
        const filtered = resRelated.listRoom.filter((r) => String(r.id) !== String(id)).slice(0, 3);
        setRelatedRooms(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch room details: ", error);
    }
  };

  useEffect(() => {
    fetchRoomData();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Initialize favorite status from localStorage
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const isFav = favs.includes(Number(id)) || favs.includes(id);
    setFavorite(isFav);
  }, [id]);

  const toggleFavorite = () => {
    const isLoggedIn = !!sessionStorage.getItem("auth");
    if (!isLoggedIn) {
      message.warning("Vui lòng đăng nhập để lưu phòng yêu thích!");
      return;
    }

    let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const numId = Number(id);
    const isFav = favs.includes(numId) || favs.includes(id);

    if (isFav) {
      favs = favs.filter((item) => item !== numId && item !== id);
      setFavorite(false);
      message.success("Đã xóa khỏi danh sách yêu thích");
    } else {
      favs.push(numId);
      setFavorite(true);
      message.success("Đã thêm vào danh sách yêu thích!");
    }
    localStorage.setItem("favorites", JSON.stringify(favs));
  };

  const handleConsultSubmit = () => {
    if (!consultName || !consultPhone) {
      message.warning("Vui lòng điền đầy đủ Họ tên và Số điện thoại!");
      return;
    }
    message.success("Yêu cầu tư vấn của bạn đã được gửi thành công! Chủ nhà sẽ liên hệ lại sớm nhất.");
    setContactModalVisible(false);
    setConsultName("");
    setConsultPhone("");
  };

  const handleRentConfirm = async () => {
    try {
      await updateRoomStatus(room.id, "rented");
      message.success("Đăng ký thuê trọ thành công! Hợp đồng đang được khởi tạo trong Dashboard.");
      setRentModalVisible(false);
      fetchRoomData();
    } catch (e) {
      console.error(e);
      message.error("Có lỗi xảy ra khi đăng ký thuê phòng!");
    }
  };

  return (
    <div className="detail-room-container">
      {/* Upper Grid Layout exactly like the mockup */}
      <div className="detail-upper-layout">
        
        {/* Left Column: Media Swiper & Room Attributes */}
        <div className="upper-left-col">
          <div className="main-cover-image-wrapper">
            <img src={selectedImage || coursImage} alt={room.room_name} className="main-cover-image" />
            <button className="cover-favorite-heart" onClick={toggleFavorite}>
              {favorite ? (
                <HeartFilled style={{ color: "#ff4d4f", fontSize: "22px" }} />
              ) : (
                <HeartOutlined style={{ color: "#ff4d4f", fontSize: "22px" }} />
              )}
            </button>
          </div>

          {/* Thumbnails row below the cover */}
          <div className="room-thumbnails-row">
            {imagesDetails.length > 0 ? (
              imagesDetails.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail-box ${selectedImage === img ? "active" : ""}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
                </div>
              ))
            ) : (
              <div className="thumbnail-box active">
                <img src={coursImage} alt="Placeholder" />
              </div>
            )}
          </div>

          {/* Basic specifications row */}
          <div className="room-specs-row">
            <span className="spec-item">🛏️ {room.bedrooms || 1} phòng ngủ</span>
            <span className="spec-item">🛁 {room.bathrooms || 1} phòng tắm</span>
            <span className="spec-item">📐 Diện tích: {room.area || 120} m²</span>
          </div>
        </div>

        {/* Right Column: Room Title, Owner Card, Action Buttons */}
        <div className="upper-right-col">
          <div className="room-detail-badge-row">
            <span className={`room-type-badge ${room.type || "phongtro"}`}>
              {room.type === "canhodichvu"
                ? "Căn Hộ Dịch Vụ"
                : room.type === "nhanguyencan"
                ? "Nhà Nguyên Căn"
                : room.type === "chungcu"
                ? "Căn Hộ Chung Cư"
                : room.type === "chungcumini"
                ? "Chung Cư Mini"
                : "Phòng Trọ"}
            </span>
            <span className={`room-status-badge ${room.status === "available" ? "available" : "rented"}`}>
              {room.status === "available" ? "Còn Phòng" : "Hết Phòng"}
            </span>
          </div>

          <h1 className="room-detail-title">{room.room_name}</h1>
          
          <div className="room-detail-location-row">
            <EnvironmentOutlined style={{ color: "#3b82f6", marginRight: 6 }} />
            <span>{room.address || "Hà Nội"}</span>
          </div>

          <div className="room-detail-meta-row">
            <div className="meta-price-box">
              <span className="meta-price-label">Giá thuê</span>
              <span className="meta-price-value">
                {room.price_per_month ? `${room.price_per_month} triệu/tháng` : "Liên hệ"}
              </span>
            </div>
            <div className="meta-divider"></div>
            <div className="meta-area-box">
              <span className="meta-area-label">Diện tích</span>
              <span className="meta-area-value">{room.area || "---"} m²</span>
            </div>
          </div>

          {/* Owner Info Card */}
          <div className="detail-owner-card">
            <div className="owner-card-header">
              <span className="owner-label">Chủ nhà</span>
              <span className="owner-name">{room.Owner?.name || getLandlord(room.id)?.name}</span>
            </div>
            
            <div className="owner-card-body">
              <div className="owner-info-row">
                <PhoneOutlined className="owner-icon" />
                <span>{room.Owner?.phone || getLandlord(room.id)?.phone}</span>
              </div>
              <div className="owner-info-row">
                <MailOutlined className="owner-icon" />
                <span>{room.Owner?.email || getLandlord(room.id)?.email}</span>
              </div>
              <div className="owner-info-row">
                <CalendarOutlined className="owner-icon" />
                <span>{room.Owner?.createdDate || "13/12/2024"}</span>
              </div>
            </div>
          </div>

          {/* Direct CTA Buttons */}
          <div className="detail-cta-buttons">
            <button 
              className="cta-btn consult-btn" 
              onClick={() => navigate("/user/chat", { state: { receiverEmail: room.Owner?.email || getLandlord(room.id)?.email, receiverName: room.Owner?.name || getLandlord(room.id)?.name } })}
            >
              Liên hệ tư vấn
            </button>
            {room.status === "available" ? (
              <button className="cta-btn rent-btn" onClick={() => navigate(`/user/deposit/${room.id}`)}>
                Thuê
              </button>
            ) : (
              <button className="cta-btn rent-btn disabled" disabled>
                Đã được thuê
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description section */}
      <div className="detail-section">
        <h2 className="section-title">Mô tả</h2>
        <p className="section-paragraph-text">
          {room.description ||
            "Căn hộ bao gồm 2 phòng ngủ rộng rãi, 2 phòng vệ sinh, một phòng khách thoáng đãng nối liền với khu vực bếp và bàn ăn, tạo nên sự liên kết hài hòa. Ban công rộng, hướng nhìn ra khuôn viên xanh mát hoặc thành phố nhộn nhịp, mang lại không gian thư giãn lý tưởng. Với hệ thống tiện ích cao cấp như trung tâm thương mại, bể bơi, khu vui chơi, Royal City đáp ứng trọn vẹn nhu cầu sống sang trọng và tiện nghi."}
        </p>
      </div>

      {/* Furniture section with 3 columns and icons */}
      <div className="detail-section">
        <h2 className="section-title">Nội thất</h2>
        <div className="furniture-grid-cols">
          <div className="furniture-item">
            <span>📺 TV</span>
            <span>1</span>
          </div>
          <div className="furniture-item">
            <span>❄️ Tủ lạnh</span>
            <span>1</span>
          </div>
          <div className="furniture-item">
            <span>🧼 Máy giặt</span>
            <span>1</span>
          </div>
          <div className="furniture-item">
            <span>☕ Coffee machine</span>
            <span>1</span>
          </div>
          <div className="furniture-item">
            <span>💨 Máy sấy</span>
            <span>1</span>
          </div>
          <div className="furniture-item">
            <span>🍽️ Dishes</span>
            <span>Bộ</span>
          </div>
          <div className="furniture-item">
            <span>🚪 Tủ quần áo</span>
            <span>2</span>
          </div>
        </div>
      </div>

      {/* Project description section */}
      <div className="detail-section">
        <h2 className="section-title">Mô tả dự án</h2>
        <p className="section-paragraph-text">
          Căn hộ bao gồm 2 phòng ngủ rộng rãi, 2 phòng vệ sinh, một phòng khách thoáng đãng nối liền với khu vực bếp và bàn ăn, tạo nên sự liên kết hài hòa. Ban công rộng, hướng nhìn ra khuôn viên xanh mát hoặc thành phố nhộn nhịp, mang lại không gian thư giãn lý tưởng. Với hệ thống tiện ích cao cấp như trung tâm thương mại, bể bơi, khu vui chơi, Royal City đáp ứng trọn vẹn nhu cầu sống sang trọng và tiện nghi.
        </p>
      </div>

      {/* Google map component */}
      <div className="detail-section">
        <h2 className="section-title">Xem trên bản đồ</h2>
        <div className="detail-google-map-wrapper">
          <GoogleMapComponent address={room.address || "Thanh Xuân, Hà Nội"} />
        </div>
      </div>

      {/* Related Projects section */}
      <div className="detail-section">
        <h2 className="section-title">Các dự án liên quan</h2>
        <div className="related-projects-grid">
          {relatedRooms.length > 0 ? (
            relatedRooms.map((rel) => {
              const relImg = rel.room_images && rel.room_images.length > 0 ? rel.room_images[0] : coursImage;
              const relLandlord = rel.Owner || getLandlord(rel.id);
              return (
                <Link to={`/user/room-details/${rel.id}`} key={rel.id} className="related-room-card">
                  <div className="rel-card-media">
                    <img src={relImg} alt={rel.room_name} />
                    <span className="rel-badge-rent">THUÊ</span>
                  </div>
                  <div className="rel-card-details">
                    <h3 className="rel-card-title">{rel.room_name}</h3>
                    <p className="rel-card-price">{rel.price_per_month} triệu/tháng</p>
                    <div className="rel-card-info-footer">
                      <span>📐 {rel.area || 120} m²</span>
                    </div>
                    <div className="rel-card-owner-footer">
                      <div className="owner-avatar-mini" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#4caf50", color: "white", fontWeight: "bold", fontSize: 14 }}>
                        {relLandlord?.name?.charAt(0)}
                      </div>
                      <div className="owner-meta-mini">
                        <h4>{relLandlord?.name}</h4>
                        <p>Chủ nhà</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="no-related-rooms">Không có bài viết liên quan khác.</div>
          )}
        </div>
      </div>

      {/* 1. Modal: Contact Consultant */}
      <Modal
        title="Đăng Ký Nhận Tư Vấn Trực Tiếp"
        open={contactModalVisible}
        onCancel={() => setContactModalVisible(false)}
        onOk={handleConsultSubmit}
        okText="Gửi yêu cầu"
        cancelText="Hủy bỏ"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Họ và tên của bạn:</label>
            <Input
              value={consultName}
              onChange={(e) => setConsultName(e.target.value)}
              placeholder="Nhập đầy đủ họ tên..."
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Số điện thoại liên lạc:</label>
            <Input
              value={consultPhone}
              onChange={(e) => setConsultPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
            />
          </div>
        </div>
      </Modal>

      {/* 2. Modal: Fast Checkout / Rent */}
      <Modal
        title="Đăng Ký Thuê Căn Hộ"
        open={rentModalVisible}
        onCancel={() => setRentModalVisible(false)}
        onOk={handleRentConfirm}
        okText="Xác nhận đăng ký"
        cancelText="Đóng"
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ fontSize: "15px", lineHeight: "1.6" }}>
            Hệ thống đang hỗ trợ liên kết hợp đồng trực tuyến với chủ nhà <strong>{room.Owner?.name || "Nguyễn Văn A"}</strong>.
          </p>
          <div
            style={{
              background: "#F1FBF2",
              padding: "16px",
              borderRadius: "10px",
              marginTop: "16px",
              border: "1px solid #C8E6C9",
            }}
          >
            <h4 style={{ color: "#2E7D32", margin: "0 0 8px 0", fontWeight: 700 }}>Thông tin thanh toán dự kiến:</h4>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              <strong>Mức giá thuê:</strong> {room.price_per_month || "---"} triệu đồng/tháng
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              <strong>Tiền đặt cọc giữ chỗ:</strong> 1 tháng tiền nhà
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DetailRoom;
