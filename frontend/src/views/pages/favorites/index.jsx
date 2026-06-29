import React, { useState } from "react";
import { Link } from "react-router-dom";
import MediaCard from "../../../components/card/card.jsx";

const FavoritesPage = () => {
  const [favCount, setFavCount] = useState(() => {
    return JSON.parse(localStorage.getItem("favorites") || "[]").length;
  });

  const handleFavoritesChange = (newFavs) => {
    setFavCount(newFavs.length);
  };

  return (
    <div className="favorites-page-container" style={{ padding: "40px 80px", background: "#f8fafc", minHeight: "85vh" }}>
      <div className="favorites-header" style={{ marginBottom: "30px", borderBottom: "2px solid #e2e8f0", paddingBottom: "15px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
          ❤️ Phòng trọ yêu thích của bạn
        </h1>
        <p style={{ color: "#64748b", margin: "6px 0 0 0" }}>Danh sách các phòng trọ bạn đã lưu và quan tâm</p>
      </div>

      {favCount === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ fontSize: "18px", color: "#475569", fontWeight: 600 }}>Chưa có phòng trọ yêu thích nào!</h3>
          <p style={{ color: "#64748b", marginTop: "8px" }}>Hãy bấm nút hình trái tim tại chi tiết các phòng để thêm vào danh sách yêu thích.</p>
          <Link to="/user/list" style={{ display: "inline-block", marginTop: "16px", background: "#16a34a", color: "#ffffff", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, textDecoration: "none" }}>
            Khám phá phòng trọ ngay
          </Link>
        </div>
      ) : (
        <MediaCard favoritesOnly={true} onFavoritesChange={handleFavoritesChange} />
      )}
    </div>
  );
};

export default FavoritesPage;
