import * as React from "react";
import coursImage from "../../assets/images/cours.jpg";
import { useState, useEffect } from "react";
import { listHomeInformation } from "../../api/requestHomeApi";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import "./card.css";

function MediaCard({ typeFilter, searchKeyword, priceFilter }) {
  const [listHome, setListHome] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // 3 columns x 2 rows per page

  const fetchListHome = async () => {
    try {
      const homelist = await listHomeInformation();
      setListHome(homelist.listRoom);
    } catch (error) {
      console.error("Failed to fetch list home: ", error);
    }
  };

  useEffect(() => {
    fetchListHome();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, searchKeyword, priceFilter]);

  // Filter listings
  let filteredList = listHome;

  if (typeFilter) {
    filteredList = filteredList.filter(room => room.type === typeFilter);
  }

  if (searchKeyword && searchKeyword.trim() !== '') {
    const kw = searchKeyword.toLowerCase().trim();
    filteredList = filteredList.filter(room =>
      (room.room_name && room.room_name.toLowerCase().includes(kw)) ||
      (room.address && room.address.toLowerCase().includes(kw))
    );
  }

  if (priceFilter) {
    filteredList = filteredList.filter(room => {
      const price = parseFloat(room.price_per_month);
      if (isNaN(price)) return false;
      switch (priceFilter) {
        case 'under2': return price < 2;
        case '2to5': return price >= 2 && price <= 5;
        case '5to10': return price > 5 && price <= 10;
        case 'above10': return price > 10;
        default: return true;
      }
    });
  }

  // Paginate
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedList = filteredList.slice(startIdx, startIdx + pageSize);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    const num = parseFloat(price);
    if (isNaN(num)) return "Liên hệ";
    if (num >= 1) return `${num.toFixed(1)} triệu/Tháng`;
    return `${(num * 1000).toFixed(0)}k/Tháng`;
  };


  const landlords = [
    { name: 'Trần Minh Tuấn', phone: '0912 345 678' },
    { name: 'Nguyễn Thị Hồng', phone: '0987 654 321' },
    { name: 'Lê Văn Hùng', phone: '0903 112 233' },
    { name: 'Phạm Thanh Hà', phone: '0976 889 001' },
    { name: 'Hoàng Đức Anh', phone: '0918 776 554' },
    { name: 'Vũ Thị Mai Lan', phone: '0933 445 667' },
    { name: 'Đặng Quốc Bảo', phone: '0965 321 987' },
    { name: 'Bùi Thị Ngọc', phone: '0944 556 778' },
    { name: 'Ngô Văn Thắng', phone: '0908 223 344' },
    { name: 'Trịnh Thị Phương', phone: '0971 998 887' },
    { name: 'Đỗ Hoàng Nam', phone: '0922 113 445' },
    { name: 'Lý Thị Kim Oanh', phone: '0939 667 889' },
    { name: 'Phan Văn Đạt', phone: '0916 778 990' },
    { name: 'Mai Thị Thu Hằng', phone: '0955 234 567' },
    { name: 'Đinh Công Minh', phone: '0901 445 668' },
    { name: 'Hồ Thị Yến Nhi', phone: '0967 112 334' },
    { name: 'Dương Văn Khải', phone: '0948 998 776' },
    { name: 'Tô Thị Bích Ngọc', phone: '0923 556 112' },
    { name: 'Châu Minh Quân', phone: '0979 334 556' },
    { name: 'Lương Thị Thanh Tâm', phone: '0911 887 665' },
  ];

  const getLandlord = (roomId) => {
    const idx = (roomId || 0) % landlords.length;
    return landlords[idx];
  };

  return (
    <div className="mc-wrapper">
      <div className="mc-grid">
        {paginatedList.map((room, index) => {
          const roomImg = room.room_images && room.room_images.length > 0 ? room.room_images[0] : coursImage;
          const landlord = getLandlord(room.id);
          return (
            <Link to={`/user/room-details/${room.id}`} key={room.id || index} className="mc-card-link">
              <div className="mc-card">
                {/* Image */}
                <div className="mc-img-wrap">
                  <img src={roomImg} alt={room.room_name} className="mc-img" />
                  <span className="mc-badge">Cho thuê</span>
                </div>

                {/* Content */}
                <div className="mc-body">
                  <h3 className="mc-title">{room.room_name}</h3>
                  <p className="mc-price">{formatPrice(room.price_per_month)}</p>
                  <p className="mc-address">{room.address || "Không có địa chỉ"}</p>

                  {/* Specs row */}
                  <div className="mc-specs">
                    <span>1 phòng ngủ</span>
                    <span className="mc-spec-dot">·</span>
                    <span>2 phòng tắm</span>
                    <span className="mc-spec-dot">·</span>
                    <span>{room.area ? `${room.area}m²` : '20m²'}</span>
                  </div>

                  {/* Divider */}
                  <div className="mc-divider"></div>

                  {/* Author */}
                  <div className="mc-author">
                    <div className="mc-avatar">{landlord.name.charAt(0)}</div>
                    <div className="mc-author-info">
                      <span className="mc-author-name">{landlord.name}</span>
                      <span className="mc-author-phone">{landlord.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredList.length > pageSize && (
        <div className="mc-pagination">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredList.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default MediaCard;
