import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../landing-page/landingPage.css";
import { DownOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from "@ant-design/icons";
import { Button, Dropdown, message, Space, Modal, Form, Input } from "antd";

const LandingPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState("EN");
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm] = Form.useForm();

  // Translations
  const translations = {
    EN: {
      home: "Home",
      contactUs: "Contact Us",
      login: "Login",
      signup: "Signup",
      findHouse: "Find House With",
      subtitle: "Rent Space",
      description: "We provide a seamless platform to connect you with the perfect rooms. Whether you're a student, a working professional, or a family, you'll effortlessly find your ideal place with clear, transparent information and a simple process. Start your journey to find your new home today!",
      startNow: "Start Now",
      contactTitle: "Contact Rent Space Support",
      contactName: "Your Name",
      contactEmail: "Your Email",
      contactMsg: "Message",
      contactSubmit: "Send Message",
      contactSuccess: "Message sent successfully! We will contact you back in 24 hours.",
      reqName: "Please enter your name!",
      reqEmail: "Please enter your email!",
      reqMsg: "Please enter your message!",
      phone: "Phone",
      email: "Email",
      address: "Address",
      adrVal: "570 Kim Giang, Thanh Xuan, Ha Noi"
    },
    VN: {
      home: "Trang chủ",
      contactUs: "Liên hệ",
      login: "Đăng nhập",
      signup: "Đăng ký",
      findHouse: "Tìm Kiếm Phòng Trọ Cùng",
      subtitle: "Rent Space",
      description: "Chúng tôi cung cấp một nền tảng liền mạch giúp bạn dễ dàng kết nối với những phòng trọ lý tưởng. Cho dù bạn là sinh viên, người đi làm hay hộ gia đình, bạn sẽ nhanh chóng tìm thấy tổ ấm phù hợp với thông tin minh bạch và quy trình đơn giản nhất. Hãy bắt đầu hành trình tìm kiếm ngay hôm nay!",
      startNow: "Bắt đầu ngay",
      contactTitle: "Liên hệ Ban quản trị Rent Space",
      contactName: "Họ và tên của bạn",
      contactEmail: "Địa chỉ Email",
      contactMsg: "Lời nhắn",
      contactSubmit: "Gửi tin nhắn",
      contactSuccess: "Gửi lời nhắn thành công! Ban quản trị sẽ phản hồi cho bạn trong 24 giờ tới.",
      reqName: "Vui lòng nhập họ tên của bạn!",
      reqEmail: "Vui lòng nhập địa chỉ email!",
      reqMsg: "Vui lòng nhập nội dung lời nhắn!",
      phone: "Điện thoại",
      email: "Email",
      address: "Địa chỉ",
      adrVal: "Số 570 Kim Giang, Thanh Xuân, Hà Nội"
    }
  };

  const t = translations[lang];

  const handleMenuClick = (e) => {
    if (e.key === "1") {
      setLang("EN");
      message.success("Switched to English");
    } else if (e.key === "2") {
      setLang("VN");
      message.success("Đã chuyển sang Tiếng Việt");
    }
  };

  const items = [
    {
      label: "English",
      key: "1",
    },
    {
      label: "Vietnamese",
      key: "2",
    },
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleContactSubmit = (values) => {
    message.success(t.contactSuccess);
    contactForm.resetFields();
    setIsContactOpen(false);
  };

  return (
    <div className="landingPage">
      <header>
        <div>
          <img
            src={require("../../../assets/images/logo.jpg")}
            alt="Logo"
            className="logo"
          />
        </div>
        <nav>
          <Link to="/landing">{t.home}</Link>
          <a href="#contact" onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}>
            {t.contactUs}
          </a>
          <Link to="/login">{t.login}</Link>
          <Link to="/sign-up">{t.signup}</Link>
          <div className="language-selector">
            <Dropdown menu={menuProps}>
              <Button>
                <Space>
                  {lang}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </nav>
      </header>
      
      <main>
        <div className="rightLand">
          <h1 className="titleLand">
            {t.findHouse} <br />
            <span>{t.subtitle}</span>
          </h1>
          <p>{t.description}</p>
          <button onClick={() => navigate("/user/home")}>{t.startNow}</button>
        </div>
        <div className="leftLand">
          <img
            src={require("../../../assets/images/landing.png")}
            alt="images"
            className="imagesland"
          />
        </div>
      </main>

      {/* Beautiful Contact Us Modal */}
      <Modal
        title={<div style={{ fontSize: 18, fontWeight: 700, color: "#2e7d32" }}>{t.contactTitle}</div>}
        open={isContactOpen}
        onCancel={() => setIsContactOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div style={{ marginTop: 15, marginBottom: 25, fontSize: 14, color: "#555" }}>
          <p><PhoneOutlined style={{ color: "#2e7d32", marginRight: 8 }} /> <strong>{t.phone}:</strong> +84 987 654 321</p>
          <p><MailOutlined style={{ color: "#2e7d32", marginRight: 8 }} /> <strong>{t.email}:</strong> support@renthouse.vn</p>
          <p><HomeOutlined style={{ color: "#2e7d32", marginRight: 8 }} /> <strong>{t.address}:</strong> {t.adrVal}</p>
        </div>
        
        <Form 
          form={contactForm} 
          layout="vertical" 
          onFinish={handleContactSubmit}
          style={{ borderTop: "1px solid #eee", paddingTop: 15 }}
        >
          <Form.Item 
            label={t.contactName} 
            name="name" 
            rules={[{ required: true, message: t.reqName }]}
          >
            <Input placeholder={t.contactName} />
          </Form.Item>
          
          <Form.Item 
            label={t.contactEmail} 
            name="email" 
            rules={[
              { required: true, message: t.reqEmail },
              { type: "email", message: "Email invalid!" }
            ]}
          >
            <Input placeholder={t.contactEmail} />
          </Form.Item>
          
          <Form.Item 
            label={t.contactMsg} 
            name="message" 
            rules={[{ required: true, message: t.reqMsg }]}
          >
            <Input.TextArea rows={4} placeholder={t.contactMsg} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button style={{ marginRight: 10 }} onClick={() => setIsContactOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: "#2e7d32", borderColor: "#2e7d32" }}>
              {t.contactSubmit}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LandingPage;
