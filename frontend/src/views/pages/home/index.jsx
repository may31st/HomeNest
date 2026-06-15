import React, { useState } from 'react';
import MediaCard from '../../../components/card/card.jsx';
import CarouselComponent from '../../../components/carousel/carousel.jsx';
import img1 from "../../../assets/images/cours.jpg";
import img2 from "../../../assets/images/cours2.jpg";
import img3 from "../../../assets/images/cours3.jpg";
import img4 from "../../../assets/images/cours4.jpg";
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Select, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import './index.css';
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const { Option } = Select;

const addressOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'Hoàn Kiếm', label: 'Hoàn Kiếm' },
  { value: 'Ba Đình', label: 'Ba Đình' },
  { value: 'Đống Đa', label: 'Đống Đa' },
  { value: 'Hai Bà Trưng', label: 'Hai Bà Trưng' },
  { value: 'Thanh Xuân', label: 'Thanh Xuân' },
  { value: 'Cầu Giấy', label: 'Cầu Giấy' },
  { value: 'Long Biên', label: 'Long Biên' },
  { value: 'Hoàng Mai', label: 'Hoàng Mai' },
  { value: 'Tây Hồ', label: 'Tây Hồ' },
  { value: 'Nam Từ Liêm', label: 'Nam Từ Liêm' },
  { value: 'Bắc Từ Liêm', label: 'Bắc Từ Liêm' },
  { value: 'Hà Đông', label: 'Hà Đông' },
];

const typeOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'phongtro', label: 'Phòng trọ' },
  { value: 'nhanguyencan', label: 'Nhà nguyên căn' },
  { value: 'canhodichvu', label: 'Căn hộ dịch vụ' },
  { value: 'chungcumini', label: 'Chung cư mini' },
];

const priceOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'under2', label: 'Dưới 2 triệu' },
  { value: '2to5', label: '2 - 5 triệu' },
  { value: '5to10', label: '5 - 10 triệu' },
  { value: 'above10', label: 'Trên 10 triệu' },
];

const HomePage = () => {
  const images = [img1, img2, img3, img4];

  // Search bar states
  const [addressFilter, setAddressFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  // Applied filters (only applied on search click)
  const [appliedAddress, setAppliedAddress] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedType, setAppliedType] = useState('');
  const [appliedPrice, setAppliedPrice] = useState('');

  const handleSearch = () => {
    setAppliedAddress(addressFilter);
    setAppliedSearch(searchText);
    setAppliedType(typeFilter);
    setAppliedPrice(priceFilter);
  };

  // Combine address select + search text into one keyword for MediaCard
  const combinedKeyword = [appliedAddress, appliedSearch].filter(Boolean).join(' ');

  const getDynamicTitle = () => {
    if (appliedType) {
      const found = typeOptions.find(o => o.value === appliedType);
      return found ? `Kết quả: ${found.label}` : 'Kết quả tìm kiếm';
    }
    if (combinedKeyword) return 'Kết quả tìm kiếm';
    return 'Các phòng trọ phổ biến';
  };

  return (
    <div>
      <div className="home">
        <div className="carousel-container">
          <CarouselComponent images={images} width="100%" height="90vh" />

          {/* ===== REDESIGNED SEARCH BAR ===== */}
          <div className="search-overlay">
            {/* Row 1: Address select + Search input + Search button */}
            <div className="search-row-main">
              <div className="search-address-select">
                <EnvironmentOutlined className="search-prefix-icon" />
                <Select
                  value={addressFilter}
                  onChange={setAddressFilter}
                  bordered={false}
                  placeholder="Địa chỉ"
                  className="address-select"
                  popupMatchSelectWidth={180}
                  suffixIcon={<span className="select-arrow">▾</span>}
                >
                  {addressOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </div>
              <div className="search-divider-v"></div>
              <div className="search-input-wrap">
                <SearchOutlined className="search-prefix-icon search-icon-grey" />
                <Input
                  placeholder="Tìm kiếm"
                  bordered={false}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  className="search-text-input"
                />
              </div>
              <Button
                type="primary"
                shape="circle"
                icon={<SearchOutlined />}
                className="search-green-btn"
                onClick={handleSearch}
              />
            </div>

            {/* Row 2: Kiểu + Giá dropdowns */}
            <div className="search-row-filters">
              <Select
                value={typeFilter}
                onChange={(val) => { setTypeFilter(val); }}
                placeholder="Kiểu"
                className="filter-select-pill"
                popupMatchSelectWidth={180}
                suffixIcon={<span className="select-arrow">▾</span>}
              >
                {typeOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
              <Select
                value={priceFilter}
                onChange={(val) => { setPriceFilter(val); }}
                placeholder="Giá"
                className="filter-select-pill"
                popupMatchSelectWidth={180}
                suffixIcon={<span className="select-arrow">▾</span>}
              >
                {priceOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </div>
          </div>
          {/* ===== END SEARCH BAR ===== */}

        </div>

        {/* Room listing section */}
        <div className="room-listing-section">
          <div className="listing-header-row">
            <h1 className="titleListHomePage">{getDynamicTitle()}</h1>
            <Link to="/user/list" className="view-all-btn">Xem tất</Link>
          </div>
          <MediaCard
            typeFilter={appliedType || null}
            searchKeyword={combinedKeyword || null}
            priceFilter={appliedPrice || null}
          />
        </div>

        {/* News section */}
        <div className="news-section">
          <div className="listing-header-row">
            <h1 className="titleListHomePage">Các tin tức liên quan</h1>
            <Link to="/user/news" className="view-all-btn">Xem tất</Link>
          </div>
          <div className="news-grid">
            <Link to="/user/news" state={{ articleId: 1 }} className="news-card-link">
              <div className="news-card">
                <div className="news-card-img-wrap">
                  <img src={img1} alt="Tin tức" className="news-card-img" />
                </div>
                <div className="news-card-body">
                  <h3 className="news-card-title">Giá chung cư Hà Nội sau Tết nguyên đán</h3>
                  <div className="news-card-meta">
                    <AccessTimeIcon style={{ fontSize: 16, color: '#94a3b8' }} />
                    <span>2 ngày trước</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/user/news" state={{ articleId: 2 }} className="news-card-link">
              <div className="news-card">
                <div className="news-card-img-wrap">
                  <img src={img2} alt="Tin tức" className="news-card-img" />
                </div>
                <div className="news-card-body">
                  <h3 className="news-card-title">Xu hướng thuê chung cư mini 2026</h3>
                  <div className="news-card-meta">
                    <AccessTimeIcon style={{ fontSize: 16, color: '#94a3b8' }} />
                    <span>3 ngày trước</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/user/news" state={{ articleId: 3 }} className="news-card-link">
              <div className="news-card">
                <div className="news-card-img-wrap">
                  <img src={img3} alt="Tin tức" className="news-card-img" />
                </div>
                <div className="news-card-body">
                  <h3 className="news-card-title">Kinh nghiệm tìm phòng trọ giá rẻ</h3>
                  <div className="news-card-meta">
                    <AccessTimeIcon style={{ fontSize: 16, color: '#94a3b8' }} />
                    <span>5 ngày trước</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;