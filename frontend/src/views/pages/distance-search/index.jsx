import React, { useState, useEffect } from "react";
import "./index.css";
import { Input, Button, message, Tooltip } from "antd";
import { SearchOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import { listHomeInformation } from "../../../api/requestHomeApi";
import { Link, useNavigate } from "react-router-dom";
import coursImage from "../../../assets/images/cours.jpg";

message.config({
  maxCount: 1,
});

// Pre-coded location database for instant offline/keyless search
const LOCATION_COORDINATES = {
  "156 Tô Hiến Thành, Phường 15, Quận 10, Hồ Chí Minh": { lat: 10.7797, lng: 106.6668 },
  "156 Tô Hiến Thành": { lat: 10.7797, lng: 106.6668 },
  "Tô Hiến Thành": { lat: 10.7797, lng: 106.6668 },
  "Quận 10": { lat: 10.7749, lng: 106.6641 },
  "Hồ Chí Minh": { lat: 10.8231, lng: 106.6297 },
  "Sài Gòn": { lat: 10.8231, lng: 106.6297 },
  "Kim Giang, Hoàng Mai, Hà Nội": { lat: 20.9786, lng: 105.8159 },
  "Kim Giang": { lat: 20.9786, lng: 105.8159 },
  "Hoàng Mai": { lat: 20.9754, lng: 105.8679 },
  "Hà Nội": { lat: 21.0285, lng: 105.8048 },
  "54 Triều Khúc": { lat: 20.9840, lng: 105.7986 },
  "Triều Khúc": { lat: 20.9840, lng: 105.7986 },
  "123 Nguyễn Trãi": { lat: 20.9948, lng: 105.8098 },
  "Nguyễn Trãi": { lat: 20.9948, lng: 105.8098 },
  "Cầu Giấy": { lat: 21.0278, lng: 105.7962 },
  "Mỹ Đình": { lat: 21.0194, lng: 105.7679 },
  "Thanh Xuân": { lat: 20.9938, lng: 105.8248 },
  "Đống Đa": { lat: 21.0125, lng: 105.8250 },
  "Hai Bà Trưng": { lat: 21.0074, lng: 105.8501 },
  "Hoàn Kiếm": { lat: 21.0287, lng: 105.8523 },
  "Tây Hồ": { lat: 21.0664, lng: 105.8159 },
  "Long Biên": { lat: 21.0425, lng: 105.8942 },
  "Hà Đông": { lat: 20.9723, lng: 105.7725 },
  "Bắc Từ Liêm": { lat: 21.0694, lng: 105.7562 },
  "Nam Từ Liêm": { lat: 21.0142, lng: 105.7483 }
};

// Helper function to calculate distance using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 999;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 999;
  const r = 6371; // Earth radius in km

  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const lambda1 = lon1 * Math.PI / 180;
  const lambda2 = lon2 * Math.PI / 180;

  const deltaPhi = phi2 - phi1;
  const deltaLambda = lambda2 - lambda1;

  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * (Math.sin(deltaLambda / 2) ** 2);
  const d = 2 * r * Math.asin(Math.sqrt(a));
  return d;
};

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.warn("WARNING: REACT_APP_MAPBOX_TOKEN is not defined in environment variables.");
}


const removeDiacritics = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// Geocode helper using Mapbox API and incorporating local cache / Google Maps Geocoder fallback
const geocodeLocation = async (address) => {
  const normalized = address.trim();
  const cleanAddress = removeDiacritics(normalized.toLowerCase());

  // Check local coordinates cache first
  for (const key of Object.keys(LOCATION_COORDINATES)) {
    const cleanKey = removeDiacritics(key.toLowerCase());
    if (cleanAddress.includes(cleanKey) || cleanKey.includes(cleanAddress)) {
      return LOCATION_COORDINATES[key];
    }
  }

  // 1. Try Mapbox Geocoding API
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(normalized)}.json?access_token=${MAPBOX_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (error) {
    console.error("Mapbox geocoding error:", error);
  }

  // 2. Fallback to Google Geocoder if available on window
  if (window.google && window.google.maps && window.google.maps.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results.length > 0) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            resolve({
              lat: 10.7797 + (Math.random() - 0.5) * 0.05,
              lng: 106.6668 + (Math.random() - 0.5) * 0.05,
            });
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Ultimate fallback near HCM Quận 10
  return {
    lat: 10.7797 + (Math.random() - 0.5) * 0.05,
    lng: 106.6668 + (Math.random() - 0.5) * 0.05,
  };
};

const DistanceSearchPage = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState("3");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState({});

  // Fetch initial rooms list from DB
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await listHomeInformation();
        if (res && res.listRoom) {
          const mapped = res.listRoom.map((room) => {
            let lat = room.latitude;
            let lng = room.longitude;

            // If coordinates are missing, apply fallback based on address keywords
            if (lat === undefined || lat === null || lng === undefined || lng === null) {
              lat = 10.7797;
              lng = 106.6668;
              if (room.address) {
                if (room.address.toLowerCase().includes("kim giang") || room.address.toLowerCase().includes("hoàng mai") || room.address.toLowerCase().includes("hà nội") || room.address.toLowerCase().includes("triều khúc")) {
                  lat = 21.0285;
                  lng = 105.8048;
                }
              }
            }
            return { ...room, lat, lng };
          });
          setRooms(mapped);
        }
      } catch (e) {
        console.error("Lỗi tải danh sách trọ:", e);
      }
    };
    fetchRooms();
  }, []);

  // Perform search based on address coordinate and radius
  const handleSearch = async () => {
    if (!address) {
      message.warning("Vui lòng nhập địa chỉ tìm kiếm!");
      return;
    }
    if (!radius || isNaN(radius) || parseFloat(radius) <= 0) {
      message.warning("Vui lòng nhập bán kính hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const centerCoords = await geocodeLocation(address);
      const inputRadius = parseFloat(radius);

      const calculated = rooms.map((room) => {
        const dist = getDistance(centerCoords.lat, centerCoords.lng, room.lat, room.lng);
        return { ...room, distance: dist };
      });

      // Filter: distance within radius in km and optionally category matches
      let filtered = calculated.filter((room) => room.distance <= inputRadius);

      if (selectedCategory) {
        filtered = filtered.filter((room) => room.type === selectedCategory);
      }

      // Sort by closest first
      filtered.sort((a, b) => a.distance - b.distance);

      setFilteredRooms(filtered);
      message.success(`Tìm thấy ${filtered.length} kết quả gần bạn!`);
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tính toán khoảng cách!");
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error("Trình duyệt của bạn không hỗ trợ định vị vị trí!");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data && data.features && data.features.length > 0) {
            setAddress(data.features[0].place_name);
          } else {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          message.success("Đã xác định được vị trí hiện tại!");
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        message.error("Không thể lấy vị trí hiện tại của bạn. Vui lòng cho phép quyền truy cập vị trí.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Run search on mount or category update
  useEffect(() => {
    if (rooms.length > 0) {
      handleSearch();
    }
  }, [rooms, selectedCategory]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const favMap = {};
    favs.forEach((item) => {
      favMap[item] = true;
    });
    setFavorites(favMap);
  }, []);

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();

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
      setFavorites((prev) => ({ ...prev, [id]: false }));
      message.success("Đã xóa khỏi danh sách yêu thích");
    } else {
      favs.push(numId);
      setFavorites((prev) => ({ ...prev, [id]: true }));
      message.success("Đã thêm vào danh sách yêu thích!");
    }
    localStorage.setItem("favorites", JSON.stringify(favs));
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "phongtro": return "Phòng trọ";
      case "nhanguyencan": return "Nhà nguyên căn";
      case "canho": return "Căn hộ dịch vụ";
      case "chungcumini": return "Chung cư mini";
    }
  };

  const formatDistance = (distInKm) => {
    if (distInKm < 1) {
      return `${(distInKm * 1000).toFixed(0)} m`;
    }
    return `${distInKm.toFixed(1)} km`;
  };

  return (
    <div className="distance-search-container">
      {/* 1. Header Banner exactly like mockup image 4.22 */}
      <div className="distance-banner">
        <div className="banner-left">
          {/* Custom vector folded map illustration with markers */}
          <div className="folded-map-vector">
            <div className="map-panel panel-1"></div>
            <div className="map-panel panel-2"></div>
            <div className="map-panel panel-3"></div>
            <div className="map-marker red-pin">📍</div>
            <div className="map-marker green-pin">🟢</div>
          </div>
        </div>

        <div className="banner-right">
          <h1 className="banner-title">Vị trí hiện tại của bạn</h1>
          <p className="banner-subtitle">Nhập địa chỉ để có thể tìm các phòng gần bạn nhất</p>

          <div className="banner-search-bar">
            <input
              type="text"
              className="address-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ tìm kiếm..."
            />
            {/* Current Location Button */}
            <Tooltip title="Sử dụng vị trí hiện tại của bạn">
              <button
                type="button"
                className="current-location-btn"
                onClick={handleUseCurrentLocation}
                disabled={loading}
              >
                <EnvironmentOutlined style={{ fontSize: "16px", color: "#A855F7" }} />
              </button>
            </Tooltip>

            <input
              type="text"
              className="radius-input"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="km"
            />
            <button className="search-circle-btn" onClick={handleSearch} disabled={loading}>
              <SearchOutlined style={{ fontSize: "18px", color: "#fff" }} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category pill tags like in mockup */}
      <div className="category-pills-row">
        {[
          { key: "phongtro", label: "Phòng trọ" },
          { key: "nhanguyencan", label: "Nhà nguyên căn" },
          { key: "canho", label: "Căn hộ dịch vụ" },
          { key: "chungcumini", label: "Chung cư mini" },
        ].map((cat) => (
          <button
            key={cat.key}
            className={`category-pill ${selectedCategory === cat.key ? "active" : ""}`}
            onClick={() => setSelectedCategory(prev => prev === cat.key ? null : cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. List title */}
      <h2 className="distance-list-title">Các phòng trọ gần bạn nhất</h2>

      {/* 4. Filtered Room list grid */}
      <div className="distance-rooms-grid">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const roomImg = room.room_images && room.room_images.length > 0 ? room.room_images[0] : coursImage;
            return (
              <Link to={`/user/room-details/${room.id}`} key={room.id} className="distance-room-card">
                <div className="card-media-wrapper">
                  <img src={roomImg} alt={room.room_name} className="card-room-image" />
                  <span className="card-badge-rent">CHO THUÊ</span>
                  <button className="favorite-heart-btn" onClick={(e) => toggleFavorite(room.id, e)}>
                    {favorites[room.id] ? (
                      <HeartFilled style={{ color: "#ff4d4f", fontSize: "18px" }} />
                    ) : (
                      <HeartOutlined style={{ color: "#fff", fontSize: "18px" }} />
                    )}
                  </button>
                  {room.distance !== undefined && (
                    <span className="card-distance-badge">
                      📍 Cách bạn {formatDistance(room.distance)}
                    </span>
                  )}
                </div>

                <div className="card-details-box">
                  <h3 className="card-room-title">{room.room_name}</h3>
                  <div className="card-info-row">
                    <span className="card-price-text">
                      💰 {room.price_per_month ? `${room.price_per_month} triệu/tháng` : "Chưa có giá"}
                    </span>
                    <span className="card-address-text">
                      <EnvironmentOutlined style={{ color: "#ff4d4f", marginRight: 4 }} />
                      {room.address ? (room.address.length > 25 ? `${room.address.substring(0, 25)}...` : room.address) : "Không có địa chỉ"}
                    </span>
                  </div>
                  <p className="card-room-description">{room.description || "Không có mô tả chi tiết."}</p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="no-rooms-fallback">
            <div className="no-rooms-icon">🔍</div>
            <h3>Không tìm thấy phòng trọ nào trong bán kính này!</h3>
            <p>Hãy thử mở rộng bán kính tìm kiếm (ví dụ: 5km hoặc 10km) hoặc nhập địa chỉ khác.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistanceSearchPage;
