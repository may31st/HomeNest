import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Select, Radio, Button, message, Upload } from "antd";
import { UploadOutlined, EnvironmentOutlined, HomeOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import axios from "axios";
import { detailRoomInformation } from "../../../api/requestHomeApi";
import coursImage from "../../../assets/images/cours.jpg";
import "./index.css";

const { Option } = Select;

const DepositPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cccdImageBase64, setCccdImageBase64] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  useEffect(() => {
    // Check authentication
    const authData = sessionStorage.getItem("auth");
    if (!authData) {
      message.error("Vui lòng đăng nhập để thực hiện đặt cọc phòng!");
      navigate("/login");
      return;
    }
    const user = JSON.parse(authData);
    setCurrentUser(user);

    // Fetch room data
    const fetchRoom = async () => {
      try {
        const dataRoom = await detailRoomInformation(id);
        if (dataRoom && dataRoom.dataRoom) {
          setRoom(dataRoom.dataRoom);
        } else {
          message.error("Không tìm thấy thông tin phòng trọ!");
          navigate("/user/home");
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
        message.error("Không thể tải thông tin phòng trọ!");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, navigate]);

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCccdImageBase64(e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const onFinish = async (values) => {
    if (!cccdImageBase64) {
      message.warning("Vui lòng tải ảnh CMND/CCCD lên!");
      return;
    }

    setSubmitting(true);
    try {
      const dob = `${values.dobDay}/${values.dobMonth}/${values.dobYear}`;
      const depositAmount = Math.round(room.price_per_month * 1000000 * 0.1); // 10% of monthly price

      const payload = {
        roomId: room.id,
        tenantEmail: currentUser.email,
        tenantName: values.tenantName,
        tenantCccd: values.tenantCccd,
        tenantDob: dob,
        tenantAddress: values.tenantAddress,
        tenantCccdImage: cccdImageBase64,
        tenantPhone: values.tenantPhone || currentUser.phone_number?.toString() || "0912345678",
        amount: depositAmount,
        paymentMethod: paymentMethod
      };

      const res = await axios.post("http://localhost:8000/api/v1/payment/create-deposit", payload);
      if (res.data && res.data.success) {
        message.success("Khởi tạo đặt cọc thành công! Đang chuyển đến cổng thanh toán...");
        // Redirect to payment gateway
        window.location.href = res.data.paymentUrl;
      } else {
        message.error(res.data.error || "Giao dịch đặt cọc thất bại.");
      }
    } catch (error) {
      console.error("Deposit submission error:", error);
      message.error(error.response?.data?.error || "Có lỗi xảy ra khi xử lý giao dịch!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="deposit-loading-container">
        <div className="loader"></div>
        <p>Đang tải thông tin đặt cọc...</p>
      </div>
    );
  }

  if (!room) return null;

  // Calculate prices
  const roomPriceVnd = Math.round(room.price_per_month * 1000000);
  const depositAmountVnd = Math.round(roomPriceVnd * 0.1);

  // Generate day, month, year options
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i); // Must be at least 18 years old

  return (
    <div className="deposit-page-wrapper">
      <div className="deposit-container">
        
        {/* Header Title */}
        <div className="deposit-header-sec">
          <h1 className="deposit-page-title">Thông tin đặt cọc của bạn</h1>
          <p className="deposit-page-subtitle">Hãy đảm bảo thông tin chính xác trước khi thanh toán</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            tenantPhone: currentUser?.phone_number || "",
            tenantName: currentUser?.lastName || currentUser?.firstName || ""
          }}
          className="deposit-grid-layout"
        >
          {/* LEFT SIDE: Personal Information Form */}
          <div className="deposit-left-column">
            <h3 className="section-form-title">Thông tin khách hàng</h3>

            <Form.Item
              label="Họ tên (CMND/CCCD)"
              name="tenantName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên đầy đủ!" }]}
            >
              <Input placeholder="Nhập họ tên đầy đủ" className="deposit-input" />
            </Form.Item>

            <Form.Item
              label="Số CMND/CCCD"
              name="tenantCccd"
              rules={[
                { required: true, message: "Vui lòng nhập số CMND/CCCD!" },
                { pattern: /^\d{9}$|^\d{12}$/, message: "Số CMND/CCCD phải là 9 hoặc 12 chữ số!" }
              ]}
            >
              <Input placeholder="Nhập 9 hoặc 12 chữ số" maxLength={12} className="deposit-input" />
            </Form.Item>

            <div className="dob-dropdowns-row">
              <span className="dob-label-hint">Ngày - Tháng - Năm sinh *</span>
              <div className="dob-select-group">
                <Form.Item
                  name="dobDay"
                  rules={[{ required: true, message: "Ngày sinh!" }]}
                  noStyle
                >
                  <Select placeholder="Ngày" style={{ width: 85 }} className="dob-select">
                    {days.map(d => (
                      <Option key={d} value={d}>{d}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="dobMonth"
                  rules={[{ required: true, message: "Tháng sinh!" }]}
                  noStyle
                >
                  <Select placeholder="Tháng" style={{ width: 95 }} className="dob-select">
                    {months.map(m => (
                      <Option key={m} value={m}>{m}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="dobYear"
                  rules={[{ required: true, message: "Năm sinh!" }]}
                  noStyle
                >
                  <Select placeholder="Năm" style={{ width: 105 }} className="dob-select">
                    {years.map(y => (
                      <Option key={y} value={y}>{y}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <Form.Item
              label="Địa chỉ thường trú"
              name="tenantAddress"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ thường trú!" }]}
            >
              <Input placeholder="Nhập địa chỉ chi tiết theo hộ khẩu" className="deposit-input" />
            </Form.Item>

            <div className="cccd-upload-section">
              <span className="cccd-upload-label">Tải ảnh CCCD *</span>
              <Upload
                accept="image/*"
                beforeUpload={handleImageUpload}
                showUploadList={false}
              >
                <div className="cccd-upload-box">
                  {cccdImageBase64 ? (
                    <img src={cccdImageBase64} alt="CCCD Preview" className="cccd-preview-img" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="plus-icon">+</span>
                      <span className="upload-text">Tải ảnh</span>
                    </div>
                  )}
                </div>
              </Upload>
            </div>

            <h3 className="section-form-title" style={{ marginTop: 32 }}>Thông tin liên lạc</h3>
            <div className="contact-row">
              <Form.Item
                label="Số điện thoại"
                name="tenantPhone"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="Nhập số điện thoại liên hệ" className="deposit-input" />
              </Form.Item>

              <div className="readOnly-email-box">
                <span className="email-label">Email tài khoản</span>
                <div className="email-value">{currentUser?.email}</div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Room Details & Deposit Details */}
          <div className="deposit-right-column">
            
            {/* Room Info Box */}
            <div className="deposit-info-card room-summary-card">
              <h3 className="deposit-card-title">Thông tin phòng</h3>
              
              <div className="room-summary-image-wrapper">
                <img 
                  src={(room.room_images && room.room_images.length > 0) ? room.room_images[0] : coursImage} 
                  alt={room.room_name} 
                  className="room-summary-img"
                />
              </div>

              <div className="room-summary-details">
                <h4 className="room-summary-name">{room.room_name}</h4>
                
                <p className="room-summary-detail-item">
                  <EnvironmentOutlined className="summary-icon" />
                  <span><strong>Địa chỉ:</strong> {room.address || "Hà Nội"}</span>
                </p>

                <p className="room-summary-detail-item">
                  <HomeOutlined className="summary-icon" />
                  <span><strong>Giá phòng:</strong> {roomPriceVnd.toLocaleString('vi-VN')} đồng/tháng</span>
                </p>

                <p className="room-summary-detail-item">
                  <span>📐 <strong>Diện tích:</strong> {room.area || "---"} m²</span>
                </p>

                <p className="room-summary-detail-item">
                  <span>✨ <strong>Tiện ích:</strong> {room.type === "canhodichvu" ? "Căn hộ dịch vụ cao cấp" : "Đầy đủ tiện ích cơ bản"}</span>
                </p>
              </div>
            </div>

            {/* Deposit Payment Box */}
            <div className="deposit-info-card deposit-payment-card">
              <h3 className="deposit-card-title">Thông tin cọc</h3>
              <p className="deposit-payment-subtitle">Số tiền cần đặt cọc (10% của tháng thuê đầu tiên)</p>
              
              <div className="deposit-amount-display">
                {depositAmountVnd.toLocaleString('vi-VN')} VND
              </div>

              <div className="payment-gateways-container">
                <h4 className="gateway-title">Phương thức thanh toán</h4>
                
                <div className="gateways-grid">
                  <div 
                    className={`gateway-panel ${paymentMethod === 'vnpay' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('vnpay')}
                  >
                    <div className="gateway-logo-wrapper vnpay-logo">
                      <SafetyCertificateOutlined className="gateway-icon" />
                      <span>VNPay</span>
                    </div>
                    <div className="radio-circle"></div>
                  </div>

                  <div 
                    className={`gateway-panel ${paymentMethod === 'momo' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                  >
                    <div className="gateway-logo-wrapper momo-logo">
                      <span className="momo-logo-text">MoMo</span>
                    </div>
                    <div className="radio-circle"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="deposit-pay-button"
            >
              Thanh toán đặt cọc
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default DepositPage;
