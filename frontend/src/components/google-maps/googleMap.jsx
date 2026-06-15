import React from "react";

const GoogleMapComponent = ({ address }) => {
  const query = address ? encodeURIComponent(address) : "Thanh Xuân, Hà Nội";
  const mapUrl = `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
      }}
    >
      <iframe
        title="Bản đồ phòng trọ"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      />
    </div>
  );
};

export default GoogleMapComponent;
