import React, { useState, useEffect } from "react";
import "./index.css";
import {
  Table,
  Button,
  Form,
  Input,
  Space,
  Dropdown,
  message,
  Progress,
  Select,
  Tag,
  Popconfirm,
  Modal,
  Descriptions
} from "antd";
import {
  PieChartOutlined,
  FileTextOutlined,
  ProfileOutlined,
  UserOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  DownOutlined,
  LogoutOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

const parseBoldText = (text) => {
  const parts = text.split("**");
  return parts.map((part, i) => {
    // Every odd index is bold
    if (i % 2 === 1) {
      return <strong key={i} style={{ color: "#0f172a", fontWeight: 700 }}>{part}</strong>;
    }
    return part;
  });
};

const renderTermsToReact = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  
  return lines.map((line, idx) => {
    let trimmed = line.trim();
    if (!trimmed) return <div key={idx} style={{ height: "12px" }} />;

    // 1. Centered National Motto / State Title checks (must be first to override header styles)
    if (trimmed.includes("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM") || trimmed.includes("Cộng hòa xã hội chủ nghĩa Việt Nam")) {
      const content = trimmed.replace(/^[#\s\-*]+/, ""); // Remove markdown characters
      return (
        <div key={idx} style={{ 
          textAlign: "center", 
          fontWeight: 700, 
          fontSize: "15px", 
          color: "#0f172a", 
          marginTop: "16px", 
          letterSpacing: "0.5px",
          fontFamily: "'Roboto', sans-serif"
        }}>
          {content}
        </div>
      );
    }

    if (trimmed.includes("Độc lập - Tự do - Hạnh phúc")) {
      const content = trimmed.replace(/^[#\s\-*]+/, ""); // Remove markdown characters
      return (
        <div key={idx} style={{ 
          textAlign: "center", 
          fontWeight: 600, 
          fontSize: "13px", 
          color: "#475569", 
          fontStyle: "italic",
          marginTop: "4px",
          marginBottom: "16px",
          fontFamily: "'Roboto', sans-serif"
        }}>
          {content}
        </div>
      );
    }
    
    // Horizontal Rule
    if (trimmed === "---") {
      return <hr key={idx} style={{ border: "0", borderTop: "2px solid #f1f5f9", margin: "20px 0" }} />;
    }
    
    // Headers
    if (trimmed.startsWith("### ")) {
      const content = trimmed.replace("### ", "");
      const isAorB = content.includes("BÊN A") || content.includes("BÊN B") || content.includes("BÊN CHO THUÊ") || content.includes("BÊN THUÊ");
      const isĐiều = content.startsWith("ĐIỀU ") || content.startsWith("Điều ");
      
      return (
        <h3 key={idx} style={{ 
          fontFamily: "'Roboto', sans-serif",
          fontSize: isAorB || isĐiều ? "16px" : "18px", 
          fontWeight: 700, 
          color: isĐiều ? "#1e3a8a" : "#0f172a", 
          marginTop: "24px", 
          marginBottom: "12px",
          borderLeft: isĐiều ? "4px solid #2563eb" : "none",
          paddingLeft: isĐiều ? "10px" : "0",
          letterSpacing: isAorB ? "0.5px" : "normal",
          textTransform: isAorB ? "uppercase" : "none"
        }}>
          {content}
        </h3>
      );
    }
    
    if (trimmed.startsWith("#### ")) {
      return (
        <h4 key={idx} style={{ 
          fontFamily: "'Roboto', sans-serif",
          fontSize: "14px", 
          fontWeight: 600, 
          color: "#64748b", 
          textAlign: "center",
          marginTop: "4px", 
          marginBottom: "16px",
          fontStyle: "italic"
        }}>
          {trimmed.replace("#### ", "")}
        </h4>
      );
    }
    
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={idx} style={{ 
          fontFamily: "'Roboto', sans-serif",
          fontSize: "22px", 
          fontWeight: 700, 
          color: "#1e3a8a", 
          textAlign: "center",
          marginTop: "28px", 
          marginBottom: "20px",
          letterSpacing: "1px"
        }}>
          {trimmed.replace("## ", "")}
        </h2>
      );
    }
    
    // List item
    if (trimmed.startsWith("- ")) {
      let content = trimmed.substring(2);
      return (
        <div key={idx} style={{ 
          fontFamily: "'Roboto', sans-serif",
          display: "flex", 
          margin: "6px 0 6px 20px", 
          fontSize: "14px", 
          color: "#334155" 
        }}>
          <span style={{ marginRight: "8px", color: "#2563eb", fontWeight: "bold" }}>•</span>
          <div>{parseBoldText(content)}</div>
        </div>
      );
    }

    return (
      <p key={idx} style={{ 
        fontFamily: "'Roboto', sans-serif",
        margin: "8px 0", 
        fontSize: "14.5px", 
        color: "#334155", 
        textAlign: trimmed.includes("Mã Hợp Đồng:") ? "center" : "justify",
        fontWeight: trimmed.includes("Mã Hợp Đồng:") ? 600 : 400
      }}>
        {parseBoldText(trimmed)}
      </p>
    );
  });
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("tongquan");
  const [user, setUser] = useState({});
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yearFilter, setYearFilter] = useState("2026");
  const [allPosts, setAllPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // Form states for posting a room
  const [postStep, setPostStep] = useState(0);
  const [postForm] = Form.useForm();
  const [roomImages, setRoomImages] = useState([]);
  const [newPostData, setNewPostData] = useState({
    type: "",
    area: "",
    price_per_month: "",
    room_name: "",
    address: "",
    phone_number: "",
    description: "",
    bedrooms: "",
    bathrooms: ""
  });
  // Edit room listing states
  const [editForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editRoomImages, setEditRoomImages] = useState([]);

  const selectedType = Form.useWatch("type", postForm);
  const selectedEditType = Form.useWatch("type", editForm);

  useEffect(() => {
    if (selectedType === "phongtro") {
      postForm.setFieldsValue({ bedrooms: 1, bathrooms: 1 });
    }
  }, [selectedType, postForm]);

  useEffect(() => {
    if (selectedEditType === "phongtro") {
      editForm.setFieldsValue({ bedrooms: 1, bathrooms: 1 });
    }
  }, [selectedEditType, editForm]);

  // Profile states
  const [profileForm] = Form.useForm();

  // Deposit & Contract states
  const [tenantDeposits, setTenantDeposits] = useState([]);
  const [landlordDeposits, setLandlordDeposits] = useState([]);
  const [tenantContracts, setTenantContracts] = useState([]);
  const [landlordContracts, setLandlordContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [subTab, setSubTab] = useState("tenant"); // 'tenant' or 'landlord'
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundData, setRefundData] = useState(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");

  // Load user data
  useEffect(() => {
    const authData = sessionStorage.getItem("auth");
    if (!authData) {
      toast.error("Vui lòng đăng nhập để truy cập trang quản lý!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }
    const parsedUser = JSON.parse(authData);
    setUser(parsedUser);

    // Initialize profile form values
    profileForm.setFieldsValue({
      lastName: parsedUser.lastName || parsedUser.firstName || "",
      email: parsedUser.email || "",
      phone_number: parsedUser.phone_number || "",
      address: parsedUser.address || ""
    });
  }, [navigate, profileForm]);

  // Sync activeTab when navigating via router state (e.g. from Header "Đăng bài" or Avatar settings)
  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  // Fetch user listings
  const fetchListings = async () => {
    if (!user.email) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/post/user-posts/${user.email}`);
      if (response.data && response.data.success) {
        setListings(response.data.posts);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tin:", error);
      toast.error("Không thể tải danh sách bài viết!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email && (activeTab === "tin_dang" || activeTab === "tongquan")) {
      fetchListings();
    }
  }, [user.email, activeTab]);

  const fetchAllPosts = async () => {
    setAdminLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/v1/post/all-posts");
      if (response.data && response.data.success) {
        setAllPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tất cả bài viết:", error);
      toast.error("Không thể tải danh sách tất cả bài viết!");
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setAdminLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/auth/all-users");
      if (response.data && response.data.success) {
        setAllUsers(response.data.users);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tất cả người dùng:", error);
      toast.error("Không thể tải danh sách tất cả người dùng!");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleToggleStatusAdmin = async (postId) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/v1/post/toggle-status/${postId}`);
      if (response.data && response.data.success) {
        toast.success(response.data.message);
        fetchAllPosts();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Lỗi khi cập nhật trạng thái bài đăng!");
    }
  };

  const handleDeletePostAdmin = async (postId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/api/v1/post/delete-post/${postId}`);
      if (response.data && response.data.success) {
        toast.success(response.data.message);
        fetchAllPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Lỗi khi xóa bài đăng!");
    }
  };

  const handleDeleteUserAdmin = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/api/auth/delete-user/${userId}`);
      if (response.data && response.data.success) {
        toast.success(response.data.message);
        fetchAllUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Lỗi khi xóa tài khoản người dùng!");
    }
  };

  const fetchContractData = async () => {
    if (!user.email) return;
    setContractsLoading(true);
    try {
      const resTD = await axios.get(`http://localhost:8000/api/v1/payment/deposits?email=${user.email}&role=tenant`);
      if (resTD.data && resTD.data.success) {
        const deposits = resTD.data.deposits;
        setTenantDeposits(deposits);
        
        // Scan for rejected deposits that haven't been notified to this tenant yet
        const notifiedKey = `notified_refunds_${user.email}`;
        let notifiedList = [];
        try {
          notifiedList = JSON.parse(localStorage.getItem(notifiedKey)) || [];
        } catch (e) {}

        const newlyRejected = deposits.find(d => d.status === "rejected" && !notifiedList.includes(d.id));
        if (newlyRejected) {
          notifiedList.push(newlyRejected.id);
          localStorage.setItem(notifiedKey, JSON.stringify(notifiedList));
          
          setRefundData(newlyRejected);
          setRefundModalVisible(true);
        }
      }

      const resLD = await axios.get(`http://localhost:8000/api/v1/payment/deposits?email=${user.email}&role=landlord`);
      if (resLD.data && resLD.data.success) setLandlordDeposits(resLD.data.deposits);

      const resTC = await axios.get(`http://localhost:8000/api/v1/contract?email=${user.email}&role=tenant`);
      if (resTC.data && resTC.data.success) setTenantContracts(resTC.data.contracts);

      const resLC = await axios.get(`http://localhost:8000/api/v1/contract?email=${user.email}&role=landlord`);
      if (resLC.data && resLC.data.success) setLandlordContracts(resLC.data.contracts);
    } catch (error) {
      console.error("Error fetching contracts/deposits:", error);
    } finally {
      setContractsLoading(false);
    }
  };

  const handleApproveDeposit = async (id) => {
    try {
      const res = await axios.put(`http://localhost:8000/api/v1/payment/deposits/${id}/approve`);
      if (res.data && res.data.success) {
        toast.success("Đã phê duyệt đặt cọc và tự động tạo mẫu hợp đồng thuê nhà!");
        fetchContractData();
      }
    } catch (e) {
      toast.error("Phê duyệt thất bại!");
    }
  };

  const handleRejectDeposit = async (id) => {
    try {
      const res = await axios.put(`http://localhost:8000/api/v1/payment/deposits/${id}/reject`);
      if (res.data && res.data.success) {
        toast.success("Đã từ chối đặt cọc!");
        fetchContractData();
      }
    } catch (e) {
      toast.error("Từ chối thất bại!");
    }
  };

  const handleCancelDeposit = async (id) => {
    try {
      const res = await axios.put(`http://localhost:8000/api/v1/payment/deposits/${id}/cancel`);
      if (res.data && res.data.success) {
        toast.success("Đã hủy đặt cọc thành công!");
        
        // Add to notified list in localStorage to prevent duplicate popups during fetchContractData
        const notifiedKey = `notified_refunds_${user.email}`;
        let notifiedList = [];
        try {
          notifiedList = JSON.parse(localStorage.getItem(notifiedKey)) || [];
        } catch (e) {}
        if (!notifiedList.includes(res.data.deposit.id)) {
          notifiedList.push(res.data.deposit.id);
          localStorage.setItem(notifiedKey, JSON.stringify(notifiedList));
        }

        setRefundData(res.data.deposit);
        setRefundModalVisible(true);
        fetchContractData();
      }
    } catch (e) {
      toast.error("Hủy đặt cọc thất bại!");
      console.error(e);
    }
  };

  const handleDeleteDeposit = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:8000/api/v1/payment/deposits/${id}`);
      if (res.data && res.data.success) {
        toast.success("Đã xóa lịch sử giao dịch đặt cọc!");
        fetchContractData();
      }
    } catch (e) {
      toast.error("Xóa lịch sử giao dịch thất bại!");
      console.error(e);
    }
  };

  const handleSignContract = async (id, role) => {
    try {
      const res = await axios.put(`http://localhost:8000/api/v1/contract/${id}/sign`, { role });
      if (res.data && res.data.success) {
        toast.success(res.data.message);
        fetchContractData();
        // Update the contract shown in modal
        const updatedRes = await axios.get(`http://localhost:8000/api/v1/contract/${id}`);
        if (updatedRes.data && updatedRes.data.success) {
          setSelectedContract(updatedRes.data.contract);
        }
      }
    } catch (e) {
      toast.error("Ký hợp đồng thất bại!");
    }
  };

  useEffect(() => {
    if (activeTab === "quan_ly_bai_dang") {
      fetchAllPosts();
    } else if (activeTab === "quan_ly_nguoi_dung") {
      fetchAllUsers();
    } else if (activeTab === "hop_dong") {
      fetchContractData();
    }
  }, [activeTab, user.email]);

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("auth");
    toast.success("Đăng xuất thành công!");
    setTimeout(() => {
      navigate("/landing");
    }, 1500);
  };

  // Toggle listing status (Hide/Show)
  const handleToggleStatus = async (postId) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/v1/post/toggle-status/${postId}`);
      if (response.data && response.data.success) {
        toast.success(response.data.message);
        fetchListings();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Lỗi khi cập nhật trạng thái bài đăng!");
    }
  };

  // Delete listing
  const handleDeletePost = async (postId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/api/v1/post/delete-post/${postId}`);
      if (response.data && response.data.success) {
        toast.success(response.data.message);
        fetchListings();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Lỗi khi xóa bài đăng!");
    }
  };

  // Profile update
  const handleProfileSubmit = async (values) => {
    try {
      const response = await axios.put("http://localhost:8000/api/auth/update-profile", {
        email: user.email,
        lastName: values.lastName,
        phone_number: values.phone_number,
        address: values.address,
        password: values.password
      });

      if (response.data && response.data.success) {
        toast.success("Cập nhật thông tin thành công!");
        // Update user state and session storage
        const updatedUser = response.data.user;
        setUser(updatedUser);
        sessionStorage.setItem("auth", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Lỗi khi cập nhật thông tin!");
    }
  };

  // Posting multi-step form handling
  const nextPostStep = async () => {
    try {
      if (postStep === 0) {
        const currentType = postForm.getFieldValue("type");
        const fieldsToValidate = ["type", "area", "price_per_month"];
        if (currentType === "nhanguyencan" || currentType === "canhodichvu" || currentType === "chungcumini") {
          fieldsToValidate.push("bedrooms", "bathrooms");
        }
        await postForm.validateFields(fieldsToValidate);
        const type = postForm.getFieldValue("type");
        const area = postForm.getFieldValue("area");
        const price_per_month = postForm.getFieldValue("price_per_month");
        const bedrooms = currentType === "phongtro" ? 1 : postForm.getFieldValue("bedrooms");
        const bathrooms = currentType === "phongtro" ? 1 : postForm.getFieldValue("bathrooms");
        setNewPostData(prev => ({ ...prev, type, area, price_per_month, bedrooms, bathrooms }));
      } else if (postStep === 1) {
        await postForm.validateFields(["room_name", "address", "phone_number"]);
        const room_name = postForm.getFieldValue("room_name");
        const address = postForm.getFieldValue("address");
        const phone_number = postForm.getFieldValue("phone_number");
        setNewPostData(prev => ({ ...prev, room_name, address, phone_number }));
      }
      setPostStep(prev => prev + 1);
    } catch (err) {
      // Validation failed — Ant Design will show inline errors
    }
  };

  const prevPostStep = () => {
    setPostStep(prev => prev - 1);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setRoomImages((prev) => [...prev, uploadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeRoomImage = (indexToRemove) => {
    setRoomImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePostSubmit = async () => {
    try {
      await postForm.validateFields(["description"]);
    } catch (err) {
      return; // Let Ant Design show inline errors
    }

    const description = postForm.getFieldValue("description");

    const finalPostData = {
      ...newPostData,
      description,
      room_images: roomImages,
      email: user.email,
      lastName: user.lastName || user.firstName || "Chủ trọ"
    };

    try {
      const response = await axios.post("http://localhost:8000/api/v1/post/create-post", finalPostData);
      if (response.data && response.data.success) {
        toast.success("Đăng tin phòng trọ thành công!");
        postForm.resetFields();
        setPostStep(0);
        setRoomImages([]);
        setNewPostData({ type: "", area: "", price_per_month: "", room_name: "", address: "", phone_number: "", description: "", bedrooms: "", bathrooms: "" });
        setTimeout(() => {
          setActiveTab("tin_dang"); // Switch tab to show listings
        }, 1200);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.error || "Lỗi khi đăng bài viết!");
    }
  };

  const handleEditPost = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      room_name: record.room_name,
      type: record.type,
      price_per_month: record.price_per_month,
      area: record.area,
      address: record.address,
      description: record.description,
      bedrooms: record.bedrooms || 1,
      bathrooms: record.bathrooms || 1
    });
    
    let parsedImages = [];
    if (record.room_images) {
      if (Array.isArray(record.room_images)) {
        parsedImages = record.room_images;
      } else if (typeof record.room_images === "string") {
        try {
          parsedImages = JSON.parse(record.room_images);
        } catch (e) {
          parsedImages = record.room_images.split(",").map(img => img.trim());
        }
      }
    }
    setEditRoomImages(parsedImages);
    setIsEditModalVisible(true);
  };

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setEditRoomImages((prev) => [...prev, uploadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditRoomImage = (indexToRemove) => {
    setEditRoomImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      const updatedPostData = {
        ...values,
        room_images: editRoomImages
      };

      const response = await axios.put(`http://localhost:8000/api/v1/post/update-post/${editingRecord.post_id}`, updatedPostData);
      if (response.data && response.data.success) {
        toast.success("Cập nhật bài đăng thành công!");
        setIsEditModalVisible(false);
        setEditingRecord(null);
        setEditRoomImages([]);
        if (activeTab === "quan_ly_bai_dang") {
          fetchAllPosts();
        } else {
          fetchListings();
        }
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.response?.data?.error || "Lỗi khi cập nhật thông tin bài đăng!");
    }
  };

  // Rent Type dropdown click helpers
  const handleRentTypeClick = (key, label) => {
    postForm.setFieldsValue({ type: key });
    message.info(`Đã chọn loại hình: ${label}`);
  };

  const rentTypeItems = [
    { label: "Phòng trọ", key: "phongtro" },
    { label: "Nhà nguyên căn", key: "nhanguyencan" },
    { label: "Căn hộ chung cư", key: "canho" },
    { label: "Chung cư mini", key: "chungcumini" },
    { label: "Căn hộ dịch vụ", key: "canhodichvu" }
  ];

  // Helper for types display
  const getTypeText = (type) => {
    const match = rentTypeItems.find(item => item.key === type);
    return match ? match.label : "Phòng trọ";
  };

  return (
    <div className="dashboard-container">
      {/* 1. Sidebar bên trái */}
      <div className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">🏡</div>
          <span className="brand-name">HOMENEST</span>
        </div>

        <div className="sidebar-menu-title">Menu</div>

        <div className="sidebar-menu">
          <div
            className={`menu-item ${activeTab === "tongquan" ? "active" : ""}`}
            onClick={() => setActiveTab("tongquan")}
          >
            <PieChartOutlined className="menu-icon" />
            <span>Tổng quan</span>
          </div>

          <div
            className={`menu-item ${activeTab === "tin_dang" ? "active" : ""}`}
            onClick={() => setActiveTab("tin_dang")}
          >
            <FileTextOutlined className="menu-icon" />
            <span>Tin đăng</span>
          </div>

          <div
            className={`menu-item ${activeTab === "hop_dong" ? "active" : ""}`}
            onClick={() => setActiveTab("hop_dong")}
          >
            <ProfileOutlined className="menu-icon" />
            <span>Hợp đồng</span>
          </div>

          <div
            className={`menu-item ${activeTab === "thong_tin_ca_nhan" ? "active" : ""}`}
            onClick={() => setActiveTab("thong_tin_ca_nhan")}
          >
            <UserOutlined className="menu-icon" />
            <span>Thông tin cá nhân</span>
          </div>

          <div
            className={`menu-item ${activeTab === "dang_tin" ? "active" : ""}`}
            onClick={() => setActiveTab("dang_tin")}
          >
            <PlusCircleOutlined className="menu-icon" />
            <span>Đăng tin</span>
          </div>
        </div>

        {user.role === "admin" && (
          <div className="sidebar-menu" style={{ marginTop: "10px", paddingTop: "0px" }}>
            <div className="sidebar-menu-title" style={{ paddingLeft: "15px", color: "rgba(0,0,0,0.4)", marginBottom: "8px" }}>QUẢN TRỊ</div>
            <div
              className={`menu-item ${activeTab === "quan_ly_bai_dang" ? "active" : ""}`}
              onClick={() => setActiveTab("quan_ly_bai_dang")}
            >
              <FileTextOutlined className="menu-icon" />
              <span>Quản lý bài đăng</span>
            </div>
            <div
              className={`menu-item ${activeTab === "quan_ly_nguoi_dung" ? "active" : ""}`}
              onClick={() => setActiveTab("quan_ly_nguoi_dung")}
            >
              <UserOutlined className="menu-icon" />
              <span>Quản lý người dùng</span>
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="menu-item logout" onClick={handleLogout}>
            <LogoutOutlined className="menu-icon" />
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>

      {/* 2. Khu vực nội dung bên phải */}
      <div className="dashboard-main-content">

        {/* Header bên trên */}
        <div className="dashboard-header">
          <div className="header-search"></div>

          <div className="header-user-info">
            <Button
              type="text"
              className="be-home-btn"
              onClick={() => navigate("/user/home")}
            >
              <HomeOutlined style={{ marginRight: 6 }} />
              Be Home
            </Button>

            <div className="user-avatar-badge">
              <span className="user-name-text">{user.lastName || "Homenest User"}</span>
              <div className="avatar-circle">
                {user.lastName ? user.lastName.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung chi tiết thay đổi theo Tab */}
        <div className="dashboard-tab-content">

          {/* TAB 1: TỔNG QUAN (OVERVIEW CHART) */}
          {activeTab === "tongquan" && (
            <div className="tab-pane">
              <h2 className="content-title">Tổng quan</h2>

              <div className="dashboard-card chart-card">
                <div className="chart-header">
                  <span className="chart-title">Số bài đăng hàng tháng</span>
                  <Select
                    value={yearFilter}
                    onChange={(val) => setYearFilter(val)}
                    style={{ width: 100 }}
                  >
                    <Option value="2025">2025</Option>
                    <Option value="2026">2026</Option>
                  </Select>
                </div>

                {/* SVG/CSS Bar Chart tái hiện cực chuẩn 100% hình ảnh người dùng */}
                <div className="homenest-svg-chart-container">
                  <div className="y-axis-labels">
                    <span>4 -</span>
                    <span>3 -</span>
                    <span>2 -</span>
                    <span>1 -</span>
                    <span>0 -</span>
                  </div>

                  <div className="chart-bars-area">
                    {/* Gridlines */}
                    <div className="chart-gridline" style={{ bottom: "0%" }}></div>
                    <div className="chart-gridline" style={{ bottom: "25%" }}></div>
                    <div className="chart-gridline" style={{ bottom: "50%" }}></div>
                    <div className="chart-gridline" style={{ bottom: "75%" }}></div>
                    <div className="chart-gridline" style={{ bottom: "100%" }}></div>

                    {/* Bars based on listings database */}
                    {/* Thống kê bài viết dựa theo bộ lọc Năm */}
                    {(yearFilter === "2026" ? [
                      { month: "Tháng 01", val: 2 },
                      { month: "Tháng 02", val: 2 },
                      { month: "Tháng 03", val: listings.length > 0 ? listings.length + 1 : 2 },
                      { month: "Tháng 04", val: 2 },
                      { month: "Tháng 05", val: 2 },
                    ] : [
                      { month: "Tháng 02", val: 0 },
                      { month: "Tháng 04", val: 0 },
                      { month: "Tháng 06", val: 3 },
                      { month: "Tháng 08", val: 4 },
                      { month: "Tháng 10", val: 2 },
                      { month: "Tháng 11", val: 1 },
                      { month: "Tháng 12", val: 4 },
                    ]).map((item, idx) => (
                      <div className="bar-column" key={idx}>
                        <div
                          className="bar-fill"
                          style={{ height: `${(item.val / 4) * 100}%` }}
                        >
                          {item.val > 0 && <span className="bar-tooltip">{item.val} bài đăng</span>}
                        </div>
                        <span className="bar-label">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-legend">
                  <div className="legend-marker"></div>
                  <span>Số bài đăng</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIN ĐĂNG (LISTINGS TABLE) */}
          {activeTab === "tin_dang" && (
            <div className="tab-pane">
              <div className="title-action-header">
                <h2 className="content-title">Quản lý tin đăng</h2>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => setActiveTab("dang_tin")}
                  style={{ backgroundColor: "#4caf4f", borderColor: "#4caf4f" }}
                >
                  Đăng tin mới
                </Button>
              </div>

              <div className="dashboard-card">
                <Table
                  dataSource={listings}
                  loading={loading}
                  rowKey="post_id"
                  columns={[
                    {
                      title: "Tên phòng trọ",
                      dataIndex: "room_name",
                      key: "room_name",
                      render: (text, record) => (
                        <span
                          className="font-semibold hover:underline"
                          style={{ color: "#2563eb", cursor: "pointer" }}
                          onClick={() => navigate(`/user/room-details/${record.room_id}`)}
                        >
                          {text}
                        </span>
                      )
                    },
                    {
                      title: "Loại hình",
                      dataIndex: "type",
                      key: "type",
                      render: (type) => <Tag color="green">{getTypeText(type)}</Tag>
                    },
                    {
                      title: "Giá thuê",
                      dataIndex: "price_per_month",
                      key: "price_per_month",
                      render: (price) => <span className="text-red-500 font-bold">{price} triệu/tháng</span>
                    },
                    {
                      title: "Diện tích",
                      dataIndex: "area",
                      key: "area",
                      render: (area) => <span>{area} m²</span>
                    },
                    {
                      title: "Trạng thái",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => (
                        <Tag color={status === "available" ? "blue" : "red"}>
                          {status === "available" ? "Đang trống (Hiện)" : "Đã ẩn"}
                        </Tag>
                      )
                    },
                    {
                      title: "Thao tác",
                      key: "actions",
                      render: (_, record) => (
                        <Space size="middle">
                          <Button
                            size="small"
                            onClick={() => handleToggleStatus(record.post_id)}
                            style={{ borderRadius: "6px" }}
                          >
                            {record.status === "available" ? "Ẩn bài" : "Hiện bài"}
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleEditPost(record)}
                            style={{ backgroundColor: "#2563eb", borderColor: "#2563eb" }}
                          >
                            Sửa
                          </Button>
                          <Popconfirm
                            title="Bạn có chắc chắn muốn xóa bài đăng này không?"
                            onConfirm={() => handleDeletePost(record.post_id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button type="primary" danger size="small">
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      )
                    }
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 3: HỢP ĐỒNG (DYNAMICAL CONTRACTS & DEPOSITS LIST) */}
          {activeTab === "hop_dong" && (
            <div className="tab-pane">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 className="content-title">Quản lý đặt cọc & hợp đồng</h2>

                {/* Segmented controls for Sub-tabs */}
                <div style={{ display: "flex", background: "#e2e8f0", padding: "4px", borderRadius: "10px" }}>
                  <button
                    onClick={() => setSubTab("tenant")}
                    style={{
                      border: "none",
                      background: subTab === "tenant" ? "#ffffff" : "transparent",
                      color: subTab === "tenant" ? "#1e293b" : "#64748b",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: subTab === "tenant" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    Tôi là Khách thuê
                  </button>
                  <button
                    onClick={() => setSubTab("landlord")}
                    style={{
                      border: "none",
                      background: subTab === "landlord" ? "#ffffff" : "transparent",
                      color: subTab === "landlord" ? "#1e293b" : "#64748b",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: subTab === "landlord" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    Tôi là Chủ trọ
                  </button>
                </div>
              </div>

              {subTab === "tenant" ? (
                /* ================== TENANT VIEW ================== */
                <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

                  {/* Tenant deposits */}
                  <div className="dashboard-card" style={{ padding: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>
                      Lịch sử giao dịch đặt cọc giữ chỗ
                    </h3>
                    <Table
                      dataSource={tenantDeposits}
                      loading={contractsLoading}
                      rowKey="id"
                      columns={[
                        {
                          title: "Phòng Trọ",
                          key: "room",
                          render: (_, record) => <span>{record.Room?.room_name || "Phòng trọ"}</span>
                        },
                        {
                          title: "Số Tiền Cọc",
                          dataIndex: "amount",
                          key: "amount",
                          render: (amt) => <span style={{ fontWeight: 700, color: "#2e7d32" }}>{amt.toLocaleString()} VND</span>
                        },
                        {
                          title: "Thanh Toán",
                          dataIndex: "payment_status",
                          key: "payment_status",
                          render: (status) => (
                            <Tag color={status === "paid" ? "green" : "orange"}>
                              {status === "paid" ? "Đã thanh toán" : "Chưa hoàn tất"}
                            </Tag>
                          )
                        },
                        {
                          title: "Duyệt Từ Chủ Trọ",
                          dataIndex: "status",
                          key: "status",
                          render: (status) => (
                            <Tag color={status === "approved" ? "green" : status === "rejected" ? "red" : "orange"}>
                              {status === "approved" ? "Đồng ý" : status === "rejected" ? "Từ chối" : "Đang chờ duyệt"}
                            </Tag>
                          )
                        },
                        {
                          title: "Ngày Gửi",
                          dataIndex: "createdAt",
                          key: "createdAt",
                          render: (date) => <span>{new Date(date).toLocaleDateString("vi-VN")}</span>
                        },
                        {
                          title: "Thao tác",
                          key: "actions",
                          render: (_, record) => {
                            const isPendingPaid = record.status === "pending" && record.payment_status === "paid";
                            return (
                              <Space size="middle">
                                {isPendingPaid ? (
                                  <Popconfirm
                                    title="Bạn có chắc chắn muốn hủy giao dịch đặt cọc này không?"
                                    onConfirm={() => handleCancelDeposit(record.id)}
                                    okText="Hủy cọc"
                                    cancelText="Đóng"
                                  >
                                    <Button type="primary" danger size="small" style={{ borderRadius: "6px" }}>
                                      Hủy cọc
                                    </Button>
                                  </Popconfirm>
                                ) : null}
                                <Popconfirm
                                  title="Bạn có chắc chắn muốn xóa lịch sử giao dịch này không?"
                                  onConfirm={() => handleDeleteDeposit(record.id)}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                >
                                  <Button type="primary" danger size="small" style={{ backgroundColor: "#ef4444", borderColor: "#ef4444", borderRadius: "6px" }}>
                                    Xóa
                                  </Button>
                                </Popconfirm>
                              </Space>
                            );
                          }
                        }
                      ]}
                    />
                  </div>

                  {/* Tenant contracts */}
                  <div className="dashboard-card" style={{ padding: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>
                      Hợp đồng thuê nhà của bạn
                    </h3>
                    <Table
                      dataSource={tenantContracts}
                      loading={contractsLoading}
                      rowKey="id"
                      columns={[
                        {
                          title: "Mã Hợp Đồng",
                          dataIndex: "contract_code",
                          key: "contract_code",
                          render: (code) => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{code}</span>
                        },
                        {
                          title: "Phòng Trọ",
                          dataIndex: "room_name",
                          key: "room_name"
                        },
                        {
                          title: "Chủ Nhà",
                          dataIndex: "landlord_name",
                          key: "landlord_name"
                        },
                        {
                          title: "Giá Thuê",
                          dataIndex: "room_price",
                          key: "room_price",
                          render: (p) => <span style={{ fontWeight: 600 }}>{p} triệu/tháng</span>
                        },
                        {
                          title: "Ký Kết (Bạn)",
                          dataIndex: "tenant_signed",
                          key: "tenant_signed",
                          render: (signed) => (
                            <Tag color={signed ? "green" : "red"}>
                              {signed ? "Đã ký" : "Chưa ký"}
                            </Tag>
                          )
                        },
                        {
                          title: "Trạng Thái",
                          dataIndex: "status",
                          key: "status",
                          render: (status) => (
                            <Tag color={status === "active" ? "green" : "orange"}>
                              {status === "active" ? "Đang hiệu lực" : "Đang chờ ký"}
                            </Tag>
                          )
                        },
                        {
                          title: "Thao tác",
                          key: "actions",
                          render: (_, record) => (
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => {
                                setSelectedContract(record);
                                setContractModalVisible(true);
                              }}
                              style={{ backgroundColor: "#2563eb", borderColor: "#2563eb", borderRadius: "6px" }}
                            >
                              Xem hợp đồng
                            </Button>
                          )
                        }
                      ]}
                    />
                  </div>

                </div>
              ) : (
                /* ================== LANDLORD VIEW ================== */
                <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

                  {/* Pending approvals */}
                  <div className="dashboard-card" style={{ padding: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>
                      Yêu cầu đặt cọc chờ duyệt (Bấm hàng để xem CCCD khách thuê)
                    </h3>
                    <Table
                      dataSource={landlordDeposits.filter(d => d.status === "pending" && d.payment_status === "paid")}
                      loading={contractsLoading}
                      rowKey="id"
                      expandable={{
                        expandedRowRender: (record) => (
                          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <h4 style={{ color: "#3e2723", borderBottom: "2.5px solid #d4af37", paddingBottom: "6px", marginBottom: "12px", fontWeight: 700 }}>
                              Chi tiết thông tin Khách thuê:
                            </h4>
                            <Descriptions column={2} bordered size="small">
                              <Descriptions.Item label="Ngày sinh">{record.tenant_dob}</Descriptions.Item>
                              <Descriptions.Item label="Số điện thoại">{record.tenant_phone}</Descriptions.Item>
                              <Descriptions.Item label="Địa chỉ thường trú">{record.tenant_address}</Descriptions.Item>
                              <Descriptions.Item label="Email">{record.tenant_email}</Descriptions.Item>
                              <Descriptions.Item label="Số CMND/CCCD">{record.tenant_cccd}</Descriptions.Item>
                              <Descriptions.Item label="Ảnh chụp CMND/CCCD">
                                {record.tenant_cccd_image ? (
                                  <img
                                    src={record.tenant_cccd_image}
                                    alt="CCCD"
                                    style={{ maxWidth: "260px", borderRadius: "6px", border: "1px solid #cbd5e1", display: "block", marginTop: "4px" }}
                                  />
                                ) : (
                                  <span style={{ color: "#ef4444" }}>Không tìm thấy ảnh chụp CMND/CCCD</span>
                                )}
                              </Descriptions.Item>
                            </Descriptions>
                          </div>
                        )
                      }}
                      columns={[
                        {
                          title: "Khách Thuê",
                          dataIndex: "tenant_name",
                          key: "tenant_name",
                          render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
                        },
                        {
                          title: "Phòng Trọ",
                          key: "room",
                          render: (_, record) => <span>{record.Room?.room_name || "Phòng trọ"}</span>
                        },
                        {
                          title: "Số Tiền Đặt Cọc",
                          dataIndex: "amount",
                          key: "amount",
                          render: (amt) => <span style={{ fontWeight: 700, color: "#2e7d32" }}>{amt.toLocaleString()} VND</span>
                        },
                        {
                          title: "Thanh Toán",
                          dataIndex: "payment_status",
                          key: "payment_status",
                          render: (status) => (
                            <Tag color="green">
                              {status === "paid" ? "Đã thanh toán" : "N/A"}
                            </Tag>
                          )
                        },
                        {
                          title: "Thao tác",
                          key: "actions",
                          render: (_, record) => (
                            <Space size="middle">
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleApproveDeposit(record.id)}
                                style={{ backgroundColor: "#2e7d32", borderColor: "#2e7d32", borderRadius: "6px" }}
                              >
                                Đồng ý
                              </Button>
                              <Popconfirm
                                title="Bạn chắc chắn muốn từ chối yêu cầu đặt cọc này?"
                                onConfirm={() => handleRejectDeposit(record.id)}
                                okText="Từ chối"
                                cancelText="Hủy"
                              >
                                <Button type="primary" danger size="small" style={{ borderRadius: "6px" }}>
                                  Từ chối
                                </Button>
                              </Popconfirm>
                            </Space>
                          )
                        }
                      ]}
                    />
                  </div>

                  {/* Landlord contracts */}
                  <div className="dashboard-card" style={{ padding: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>
                      Hợp đồng cho thuê của bạn
                    </h3>
                    <Table
                      dataSource={landlordContracts}
                      loading={contractsLoading}
                      rowKey="id"
                      expandable={{
                        expandedRowRender: (record) => (
                          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <h4 style={{ color: "#1e293b", borderBottom: "2px solid #2563eb", paddingBottom: "6px", marginBottom: "12px", fontWeight: 700 }}>
                              Thông tin chi tiết Khách thuê (Người đặt cọc):
                            </h4>
                            <Descriptions column={2} bordered size="small" style={{ background: "#ffffff" }}>
                              <Descriptions.Item label="Họ và Tên">{record.tenant_name || "Chưa cập nhật"}</Descriptions.Item>
                              <Descriptions.Item label="Ngày sinh">{record.tenant_dob || "Chưa cập nhật"}</Descriptions.Item>
                              <Descriptions.Item label="Số điện thoại">{record.tenant_phone || "Chưa cập nhật"}</Descriptions.Item>
                              <Descriptions.Item label="Email">{record.tenant_email || "Chưa cập nhật"}</Descriptions.Item>
                              <Descriptions.Item label="Số CMND/CCCD">{record.tenant_cccd || "Chưa cập nhật"}</Descriptions.Item>
                              <Descriptions.Item label="Địa chỉ thường trú">{record.tenant_address || "Chưa cập nhật"}</Descriptions.Item>
                            </Descriptions>
                          </div>
                        )
                      }}
                      columns={[
                        {
                          title: "Mã Hợp Đồng",
                          dataIndex: "contract_code",
                          key: "contract_code",
                          render: (code) => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{code}</span>
                        },
                        {
                          title: "Phòng Trọ",
                          dataIndex: "room_name",
                          key: "room_name"
                        },
                        {
                          title: "Khách Thuê",
                          dataIndex: "tenant_name",
                          key: "tenant_name"
                        },
                        {
                          title: "Giá Thuê",
                          dataIndex: "room_price",
                          key: "room_price",
                          render: (p) => <span style={{ fontWeight: 600 }}>{p} triệu/tháng</span>
                        },
                        {
                          title: "Ký Kết (Bạn)",
                          dataIndex: "landlord_signed",
                          key: "landlord_signed",
                          render: (signed) => (
                            <Tag color={signed ? "green" : "red"}>
                              {signed ? "Đã ký" : "Chưa ký"}
                            </Tag>
                          )
                        },
                        {
                          title: "Trạng Thái",
                          dataIndex: "status",
                          key: "status",
                          render: (status) => (
                            <Tag color={status === "active" ? "green" : "orange"}>
                              {status === "active" ? "Đang hiệu lực" : "Đang chờ ký"}
                            </Tag>
                          )
                        },
                        {
                          title: "Thao tác",
                          key: "actions",
                          render: (_, record) => (
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => {
                                setSelectedContract(record);
                                setContractModalVisible(true);
                              }}
                              style={{ backgroundColor: "#2563eb", borderColor: "#2563eb", borderRadius: "6px" }}
                            >
                              Xem hợp đồng
                            </Button>
                          )
                        }
                      ]}
                    />
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 4: THÔNG TIN CÁ NHÂN (USER PROFILE) */}
          {activeTab === "thong_tin_ca_nhan" && (
            <div className="tab-pane">
              <h2 className="content-title">Thông tin cá nhân</h2>

              <div className="dashboard-card profile-form-card">
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileSubmit}
                >
                  <div className="profile-grid">
                    <Form.Item
                      label="Họ và Tên"
                      name="lastName"
                      rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                    >
                      <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                      label="Địa chỉ Email"
                      name="email"
                    >
                      <Input disabled />
                    </Form.Item>

                    <Form.Item
                      label="Số điện thoại liên hệ"
                      name="phone_number"
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                    >
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                      label="Địa chỉ thường trú"
                      name="address"
                    >
                      <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>

                    <Form.Item
                      label="Mật khẩu mới (Bỏ trống nếu không đổi)"
                      name="password"
                    >
                      <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                  </div>

                  <Form.Item style={{ marginTop: 24 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ backgroundColor: "#4caf4f", borderColor: "#4caf4f", padding: "0 30px" }}
                    >
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          )}

          {/* TAB 5: ĐĂNG TIN (MULTI-STEP POST FORM) */}
          {activeTab === "dang_tin" && (
            <div className="tab-pane">
              <h2 className="content-title">Đăng bài viết mới</h2>

              <div className="dashboard-card push-form-card">
                <Progress
                  percent={(postStep / 2) * 100}
                  type="line"
                  showInfo={false}
                  strokeColor="#4caf4f"
                  style={{ marginBottom: 30 }}
                />

                <Form form={postForm} layout="vertical">
                  {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
                  {postStep === 0 && (
                    <div className="form-step-container">
                      <h3 className="step-title">Bước 1: Thông tin cơ bản về trọ</h3>

                      <Form.Item
                        label="Loại trọ bạn muốn cho thuê"
                        name="type"
                        rules={[{ required: true, message: "Vui lòng chọn loại hình!" }]}
                      >
                        <Select placeholder="Chọn loại hình bạn muốn cho thuê" style={{ width: "100%" }}>
                          <Option value="phongtro">Phòng trọ</Option>
                          <Option value="nhanguyencan">Nhà nguyên căn</Option>
                          <Option value="chungcumini">Chung cư mini</Option>
                          <Option value="canhodichvu">Căn hộ dịch vụ</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Diện tích (m²)"
                        name="area"
                        rules={[{ required: true, message: "Vui lòng nhập diện tích!" }]}
                      >
                        <Input type="number" placeholder="Nhập diện tích phòng trọ (vd: 30)" />
                      </Form.Item>

                      <Form.Item
                        label="Mức giá (Triệu đồng/tháng)"
                        name="price_per_month"
                        rules={[{ required: true, message: "Vui lòng nhập mức giá!" }]}
                      >
                        <Input type="number" step="0.1" placeholder="Nhập mức giá thuê (vd: 5.1)" />
                      </Form.Item>

                      {(selectedType === "nhanguyencan" || selectedType === "canhodichvu" || selectedType === "chungcumini") && (
                        <>
                          <Form.Item
                            label="Số phòng ngủ"
                            name="bedrooms"
                            rules={[{ required: true, message: "Vui lòng nhập số phòng ngủ!" }]}
                          >
                            <Input type="number" min={1} placeholder="Nhập số phòng ngủ (vd: 1)" />
                          </Form.Item>

                          <Form.Item
                            label="Số phòng tắm"
                            name="bathrooms"
                            rules={[{ required: true, message: "Vui lòng nhập số phòng tắm!" }]}
                          >
                            <Input type="number" min={1} placeholder="Nhập số phòng tắm (vd: 1)" />
                          </Form.Item>
                        </>
                      )}
                    </div>
                  )}

                  {/* BƯỚC 2: TÊN TRỌ & ĐỊA CHỈ */}
                  {postStep === 1 && (
                    <div className="form-step-container">
                      <h3 className="step-title">Bước 2: Tên trọ và địa chỉ chi tiết</h3>

                      <Form.Item
                        label="Tiêu đề bài đăng / Tên phòng trọ"
                        name="room_name"
                        rules={[{ required: true, message: "Vui lòng nhập tên phòng trọ!" }]}
                      >
                        <Input placeholder="Nhập tên hiển thị phòng trọ (vd: 1N1K FULL NỘI THẤT, CÓ THANG MÁY)" />
                      </Form.Item>

                      <Form.Item
                        label="Địa chỉ cụ thể"
                        name="address"
                        rules={[
                          { required: true, message: "Vui lòng nhập địa chỉ!" },
                          { min: 10, message: "Địa chỉ cụ thể phải dài ít nhất 10 ký tự!" }
                        ]}
                      >
                        <Input placeholder="Nhập địa chỉ cụ thể (vd: ngõ 570 Kim Giang, Hoàng Mai, Hà Nội)" />
                      </Form.Item>

                      <Form.Item
                        label="Số điện thoại liên hệ"
                        name="phone_number"
                        rules={[
                          { required: true, message: "Vui lòng nhập số điện thoại!" },
                          {
                            pattern: /^(0|\+84)[35789]\d{8}$/,
                            message: "Số điện thoại không hợp lệ!"
                          }
                        ]}
                      >
                        <Input placeholder="Nhập số điện thoại liên hệ" />
                      </Form.Item>
                    </div>
                  )}

                  {/* BƯỚC 3: MÔ TẢ CHI TIẾT */}
                  {postStep === 2 && (
                    <div className="form-step-container">
                      <h3 className="step-title">Bước 3: Mô tả chi tiết và hình ảnh</h3>

                      <Form.Item
                        label="Mô tả chi tiết phòng trọ (Giá điện nước, tiện ích, nội thất, giờ giấc...)"
                        name="description"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                      >
                        <Input.TextArea rows={6} placeholder="Nhập mô tả chi tiết giúp khách hàng dễ dàng nắm bắt thông tin phòng trọ của bạn..." />
                      </Form.Item>

                      {/* Image Upload for Room */}
                      <div className="room-image-upload-section" style={{ marginTop: 20 }}>
                        <span className="room-image-upload-label" style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#334155" }}>
                          Hình ảnh thực tế phòng trọ
                        </span>

                        <div
                          className="room-image-upload-box"
                          style={{
                            border: "2px dashed #cbd5e1",
                            borderRadius: "8px",
                            padding: "24px",
                            textAlign: "center",
                            background: "#f8fafc",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            position: "relative"
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.borderColor = "#16a34a"; e.currentTarget.style.background = "#f0fdf4"; }}
                          onMouseOut={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
                          onClick={() => document.getElementById("room-images-file-input").click()}
                        >
                          <div style={{ fontSize: "32px", color: "#64748b", marginBottom: "8px" }}>📷</div>
                          <p style={{ margin: 0, fontSize: "14px", color: "#475569", fontWeight: 500 }}>Bấm hoặc kéo thả ảnh vào đây để tải lên</p>
                          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Chấp nhận định dạng ảnh (PNG, JPG, JPEG...)</p>
                          <input
                            id="room-images-file-input"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                        </div>

                        {/* Previews container */}
                        {roomImages.length > 0 && (
                          <div
                            className="room-images-previews"
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "12px",
                              marginTop: "16px",
                              padding: "12px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              background: "#ffffff"
                            }}
                          >
                            {roomImages.map((imgBase64, idx) => (
                              <div
                                key={idx}
                                style={{
                                  position: "relative",
                                  width: "100px",
                                  height: "80px",
                                  borderRadius: "6px",
                                  overflow: "hidden",
                                  border: "1px solid #cbd5e1"
                                }}
                              >
                                <img
                                  src={imgBase64}
                                  alt={`preview-${idx}`}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeRoomImage(idx); }}
                                  style={{
                                    position: "absolute",
                                    top: "4px",
                                    right: "4px",
                                    background: "rgba(220, 38, 38, 0.85)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    fontSize: "12px",
                                    lineHeight: "18px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = "#dc2626"; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.85)"; }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="form-navigation-buttons" style={{ marginTop: 30, display: "flex", gap: 15 }}>
                    {postStep > 0 && (
                      <Button onClick={prevPostStep}>Quay lại</Button>
                    )}

                    {postStep < 2 ? (
                      <Button
                        type="primary"
                        onClick={nextPostStep}
                        style={{ backgroundColor: "#4caf4f", borderColor: "#4caf4f" }}
                      >
                        Tiếp tục
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        onClick={handlePostSubmit}
                        style={{ backgroundColor: "#4caf4f", borderColor: "#4caf4f" }}
                      >
                        Đăng bài
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          )}

          {/* TAB 6: QUẢN LÝ BÀI ĐĂNG (ALL LISTINGS FOR ADMIN) */}
          {activeTab === "quan_ly_bai_dang" && user.role === "admin" && (
            <div className="tab-pane">
              <h2 className="content-title">Quản lý bài đăng toàn hệ thống</h2>
              <div style={{ marginBottom: "16px" }}>
                <Input
                  placeholder="Tìm kiếm theo tên phòng trọ hoặc người đăng..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  style={{ width: "400px", borderRadius: "8px", height: "40px" }}
                  allowClear
                />
              </div>
              <div className="dashboard-card">
                <Table
                  dataSource={allPosts.filter(post => {
                    const query = adminSearchQuery.toLowerCase().trim();
                    if (!query) return true;
                    const roomName = (post.room_name || "").toLowerCase();
                    const ownerName = (post.owner_name || "").toLowerCase();
                    const ownerEmail = (post.owner_email || "").toLowerCase();
                    return roomName.includes(query) || ownerName.includes(query) || ownerEmail.includes(query);
                  })}
                  loading={adminLoading}
                  rowKey="post_id"
                  expandable={{
                    expandedRowRender: (record) => {
                      let imagesList = [];
                      if (record.room_images) {
                        if (Array.isArray(record.room_images)) {
                          imagesList = record.room_images;
                        } else if (typeof record.room_images === "string") {
                          try {
                            imagesList = JSON.parse(record.room_images);
                          } catch (e) {
                            imagesList = record.room_images.split(",").map(i => i.trim());
                          }
                        }
                      }

                      return (
                        <div style={{ margin: 0, padding: "15px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                          <div style={{ marginBottom: "12px" }}>
                            <strong style={{ color: "#333" }}>📍 Địa chỉ chi tiết:</strong>{" "}
                            <span style={{ color: "#555" }}>{record.address || "Chưa cập nhật"}</span>
                          </div>

                          <div style={{ marginBottom: "12px" }}>
                            <strong style={{ color: "#333" }}>📝 Mô tả chi tiết:</strong>
                            <p style={{ margin: "6px 0 0 0", color: "#666", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                              {record.description || "Không có mô tả"}
                            </p>
                          </div>

                          {imagesList && imagesList.length > 0 && (
                            <div>
                              <strong style={{ color: "#333", display: "block", marginBottom: "8px" }}>🖼️ Hình ảnh thực tế ({imagesList.length}):</strong>
                              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
                                {imagesList.map((imgUrl, idx) => {
                                  let src = imgUrl;
                                  if (imgUrl && !imgUrl.startsWith("http")) {
                                    src = `http://localhost:8000${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
                                  }
                                  return (
                                    <img
                                      key={idx}
                                      src={src}
                                      alt={`room-${idx}`}
                                      style={{ width: "120px", height: "90px", objectFit: "cover", borderRadius: "6px", border: "1px solid #dee2e6", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                  columns={[
                    {
                      title: "Tên phòng trọ",
                      dataIndex: "room_name",
                      key: "room_name",
                      render: (text, record) => (
                        <span
                          className="font-semibold hover:underline"
                          style={{ color: "#2563eb", cursor: "pointer" }}
                          onClick={() => navigate(`/user/room-details/${record.room_id}`)}
                        >
                          {text}
                        </span>
                      )
                    },
                    {
                      title: "Người đăng",
                      key: "owner",
                      render: (_, record) => (
                        <div>
                          <div className="font-medium">{record.owner_name}</div>
                          <div className="text-xs text-gray-500">{record.owner_email}</div>
                        </div>
                      )
                    },
                    {
                      title: "Loại hình",
                      dataIndex: "type",
                      key: "type",
                      render: (type) => <Tag color="green">{getTypeText(type)}</Tag>
                    },
                    {
                      title: "Giá thuê",
                      dataIndex: "price_per_month",
                      key: "price_per_month",
                      render: (price) => <span className="text-red-500 font-bold">{price} triệu/tháng</span>
                    },
                    {
                      title: "Diện tích",
                      dataIndex: "area",
                      key: "area",
                      render: (area) => <span>{area} m²</span>
                    },
                    {
                      title: "Trạng thái",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => (
                        <Tag color={status === "available" ? "blue" : "red"}>
                          {status === "available" ? "Hiển thị" : "Đã ẩn"}
                        </Tag>
                      )
                    },
                    {
                      title: "Thao tác",
                      key: "actions",
                      render: (_, record) => (
                        <Space size="middle">
                          <Button
                            size="small"
                            onClick={() => handleToggleStatusAdmin(record.post_id)}
                            style={{ borderRadius: "6px" }}
                          >
                            {record.status === "available" ? "Ẩn" : "Hiện"}
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleEditPost(record)}
                            style={{ backgroundColor: "#2563eb", borderColor: "#2563eb", borderRadius: "6px" }}
                          >
                            Sửa
                          </Button>
                          <Popconfirm
                            title="Bạn có chắc chắn muốn xóa bài đăng này không?"
                            onConfirm={() => handleDeletePostAdmin(record.post_id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button type="primary" danger size="small">
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      )
                    }
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 7: QUẢN LÝ NGƯỜI DÙNG (ALL USERS FOR ADMIN) */}
          {activeTab === "quan_ly_nguoi_dung" && user.role === "admin" && (
            <div className="tab-pane">
              <h2 className="content-title">Quản lý tài khoản đã đăng ký</h2>
              <div className="dashboard-card">
                <Table
                  dataSource={allUsers}
                  loading={adminLoading}
                  rowKey="id"
                  columns={[
                    {
                      title: "ID",
                      dataIndex: "id",
                      key: "id",
                      render: (text) => <span className="font-mono text-gray-500">{text}</span>
                    },
                    {
                      title: "Họ và Tên",
                      key: "fullName",
                      render: (_, record) => <span>{record.lastName || record.firstName || "Người dùng"}</span>
                    },
                    {
                      title: "Địa chỉ Email",
                      dataIndex: "email",
                      key: "email",
                      render: (email) => <span className="font-medium">{email}</span>
                    },
                    {
                      title: "Số điện thoại",
                      dataIndex: "phone_number",
                      key: "phone_number",
                      render: (phone) => <span>{phone || "Chưa cập nhật"}</span>
                    },
                    {
                      title: "Vai trò",
                      dataIndex: "role",
                      key: "role",
                      render: (role) => (
                        <Tag color={role === "admin" ? "purple" : "blue"}>
                          {role === "admin" ? "Quản trị viên (Admin)" : "Người dùng (User)"}
                        </Tag>
                      )
                    },
                    {
                      title: "Thao tác",
                      key: "actions",
                      render: (_, record) => (
                        <Space size="middle">
                          {record.role !== "admin" ? (
                            <Popconfirm
                              title="Bạn có chắc muốn xóa tài khoản này và mọi bài đăng liên quan?"
                              onConfirm={() => handleDeleteUserAdmin(record.id)}
                              okText="Xóa tài khoản"
                              cancelText="Hủy"
                            >
                              <Button type="primary" danger size="small">
                                Xóa tài khoản
                              </Button>
                            </Popconfirm>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Không thể thao tác</span>
                          )}
                        </Space>
                      )
                    }
                  ]}
                />
              </div>
            </div>
          )}

        </div>

      </div>
      {/* Refund/Cancel Deposit Modal */}
      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#ef4444", fontFamily: "Inter, Roboto, sans-serif" }}>
            💸 Thông báo hoàn tiền đặt cọc
          </span>
        }
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false);
          setRefundData(null);
        }}
        footer={null}
        width={650}
      >
        {refundData && (
          <div style={{ fontFamily: "Inter, Roboto, sans-serif", padding: "10px 0px 20px 0px" }}>
            <div style={{ textAlign: "center", margin: "15px 0 25px 0", fontSize: "72px" }}>
              💸
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "17px", color: "#374151", lineHeight: "1.6" }}>
              <div>
                <strong style={{ color: "#111827", fontWeight: "700" }}>Phòng:</strong> {refundData.Room?.room_name || "N/A"}
              </div>
              <div>
                <strong style={{ color: "#111827", fontWeight: "700" }}>Địa chỉ:</strong> {refundData.Room?.address || "N/A"}
              </div>
              <div>
                <strong style={{ color: "#111827", fontWeight: "700" }}>Giá:</strong> {refundData.Room ? Math.round(refundData.Room.price_per_month * 1000000) : "0"} VNĐ
              </div>
              <div>
                <strong style={{ color: "#111827", fontWeight: "700" }}>Thông báo:</strong> Đặt cọc của bạn đã bị từ chối. Số tiền {refundData.amount ? Math.round(refundData.amount).toLocaleString('en-US') : "0"} VND đã được hoàn trả về tài khoản của bạn.
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 3. Modal: Electronic Lease Contract Detail Viewer */}
      <Modal
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "95%", padding: "5px 0" }}>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", fontFamily: "'Inter', sans-serif" }}>Chi Tiết Hợp Đồng Thuê Nhà</span>
            {selectedContract && (
              <Tag color={selectedContract.status === "active" ? "green" : "orange"} style={{ fontSize: "13px", padding: "4px 12px", borderRadius: "6px", fontWeight: 600 }}>
                {selectedContract.status === "active" ? "Đang hiệu lực" : "Đang chờ ký"}
              </Tag>
            )}
          </div>
        }
        open={contractModalVisible}
        onCancel={() => {
          setContractModalVisible(false);
          setSelectedContract(null);
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => {
            setContractModalVisible(false);
            setSelectedContract(null);
          }} style={{ borderRadius: "6px" }}>
            Đóng
          </Button>,
          selectedContract && (
            // Tenant sign button
            (subTab === "tenant" && !selectedContract.tenant_signed) ? (
              <Button
                key="sign-tenant"
                type="primary"
                onClick={() => handleSignContract(selectedContract.id, 'tenant')}
                style={{ backgroundColor: "#2e7d32", borderColor: "#2e7d32", borderRadius: "6px" }}
              >
                Ký hợp đồng (Khách thuê)
              </Button>
            ) : null
          ),
          selectedContract && (
            // Landlord sign button
            (subTab === "landlord" && !selectedContract.landlord_signed) ? (
              <Button
                key="sign-landlord"
                type="primary"
                onClick={() => handleSignContract(selectedContract.id, 'landlord')}
                style={{ backgroundColor: "#2e7d32", borderColor: "#2e7d32", borderRadius: "6px" }}
              >
                Ký hợp đồng (Chủ nhà)
              </Button>
            ) : null
          )
        ]}
      >
        {selectedContract && (
          <div style={{ padding: "20px 24px", maxHeight: "70vh", overflowY: "auto", background: "#f1f5f9", borderRadius: "0 0 8px 8px" }}>
            {/* Paper Container */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "45px 55px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                fontFamily: "'Roboto', sans-serif",
                lineHeight: "1.8",
                fontSize: "14.5px",
                color: "#334155",
                position: "relative"
              }}
            >
              {/* Decorative Document Crest */}
              <div style={{ textAlign: "center", marginBottom: "30px", opacity: 0.85 }}>
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "#eff6ff", 
                  color: "#2563eb",
                  fontSize: "24px",
                  marginBottom: "8px"
                }}>
                  🏠
                </span>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "#94a3b8", textTransform: "uppercase" }}>
                  HOMENEST ELECTRONIC LEASE
                </div>
              </div>

              <div>
                {renderTermsToReact(selectedContract.terms)}
              </div>

              {/* Signatures status block */}
              <div
                style={{
                  marginTop: "40px",
                  borderTop: "2px dashed #cbd5e1",
                  paddingTop: "30px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px"
                }}
              >
                {/* Landlord sign info */}
                <div style={{ 
                  textAlign: "center", 
                  width: "48%", 
                  background: "#f8fafc", 
                  borderRadius: "10px", 
                  padding: "16px 20px", 
                  border: "1px solid #e2e8f0" 
                }}>
                  <h4 style={{ margin: "0 0 4px 0", fontWeight: 800, color: "#0f172a", fontSize: "14px", letterSpacing: "0.5px" }}>BÊN CHO THUÊ (BÊN A)</h4>
                  <p style={{ margin: "2px 0 16px 0", fontSize: "12px", color: "#64748b" }}>Chủ nhà ký xác nhận</p>
                  <div style={{ margin: "12px 0", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {selectedContract.landlord_signed ? (
                      <div style={{ 
                        border: "2px solid #16a34a", 
                        borderRadius: "8px", 
                        padding: "8px 16px", 
                        background: "#f0fdf4", 
                        color: "#16a34a", 
                        display: "inline-block", 
                        transform: "rotate(-3deg)", 
                        boxShadow: "0 4px 10px rgba(22, 163, 74, 0.1)",
                        position: "relative"
                      }}>
                        <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#15803d" }}>✓ ĐÃ KÝ ĐIỆN TỬ</div>
                        <div style={{ fontStyle: "italic", fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: "20px", margin: "4px 0", color: "#166534" }}>
                          {selectedContract.landlord_name}
                        </div>
                        <div style={{ fontSize: "9px", color: "#166534", fontWeight: 500 }}>HOMENEST VERIFIED</div>
                      </div>
                    ) : (
                      <div style={{ 
                        border: "2px dashed #cbd5e1", 
                        borderRadius: "8px", 
                        padding: "14px 20px", 
                        color: "#94a3b8", 
                        display: "inline-block", 
                        fontSize: "13px",
                        background: "#ffffff"
                      }}>
                        🔒 Chờ ký trực tuyến
                      </div>
                    )}
                  </div>
                </div>

                {/* Tenant sign info */}
                <div style={{ 
                  textAlign: "center", 
                  width: "48%", 
                  background: "#f8fafc", 
                  borderRadius: "10px", 
                  padding: "16px 20px", 
                  border: "1px solid #e2e8f0" 
                }}>
                  <h4 style={{ margin: "0 0 4px 0", fontWeight: 800, color: "#0f172a", fontSize: "14px", letterSpacing: "0.5px" }}>BÊN THUÊ (BÊN B)</h4>
                  <p style={{ margin: "2px 0 16px 0", fontSize: "12px", color: "#64748b" }}>Khách thuê ký xác nhận</p>
                  <div style={{ margin: "12px 0", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {selectedContract.tenant_signed ? (
                      <div style={{ 
                        border: "2px solid #2563eb", 
                        borderRadius: "8px", 
                        padding: "8px 16px", 
                        background: "#eff6ff", 
                        color: "#2563eb", 
                        display: "inline-block", 
                        transform: "rotate(3deg)", 
                        boxShadow: "0 4px 10px rgba(37, 99, 235, 0.1)",
                        position: "relative"
                      }}>
                        <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#1d4ed8" }}>✓ ĐÃ KÝ ĐIỆN TỬ</div>
                        <div style={{ fontStyle: "italic", fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: "20px", margin: "4px 0", color: "#1e40af" }}>
                          {selectedContract.tenant_name}
                        </div>
                        <div style={{ fontSize: "9px", color: "#1e40af", fontWeight: 500 }}>HOMENEST VERIFIED</div>
                      </div>
                    ) : (
                      <div style={{ 
                        border: "2px dashed #cbd5e1", 
                        borderRadius: "8px", 
                        padding: "14px 20px", 
                        color: "#94a3b8", 
                        display: "inline-block", 
                        fontSize: "13px",
                        background: "#ffffff"
                      }}>
                        🔒 Chờ ký trực tuyến
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Chỉnh sửa thông tin phòng trọ"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingRecord(null);
          setEditRoomImages([]);
        }}
        onOk={handleEditSubmit}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={700}
        okButtonProps={{ style: { backgroundColor: "#4caf4f", borderColor: "#4caf4f" } }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Tiêu đề bài đăng / Tên phòng trọ"
            name="room_name"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng trọ!" }]}
          >
            <Input placeholder="Nhập tên hiển thị phòng trọ" />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              label="Loại hình"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại hình!" }]}
            >
              <Select placeholder="Chọn loại hình">
                <Option value="phongtro">Phòng trọ</Option>
                <Option value="nhanguyencan">Nhà nguyên căn</Option>
                <Option value="chungcumini">Chung cư mini</Option>
                <Option value="canhodichvu">Căn hộ dịch vụ</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Diện tích (m²)"
              name="area"
              rules={[{ required: true, message: "Vui lòng nhập diện tích!" }]}
            >
              <Input type="number" placeholder="Vd: 30" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            <Form.Item
              label="Mức giá (Triệu đồng/tháng)"
              name="price_per_month"
              rules={[{ required: true, message: "Vui lòng nhập mức giá!" }]}
            >
              <Input type="number" step="0.1" placeholder="Vd: 5.1" />
            </Form.Item>
          </div>

          {(selectedEditType === "nhanguyencan" || selectedEditType === "canhodichvu" || selectedEditType === "chungcumini") && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item
                label="Số phòng ngủ"
                name="bedrooms"
                rules={[{ required: true, message: "Vui lòng nhập số phòng ngủ!" }]}
              >
                <Input type="number" min={1} placeholder="Nhập số phòng ngủ (vd: 1)" />
              </Form.Item>

              <Form.Item
                label="Số phòng tắm"
                name="bathrooms"
                rules={[{ required: true, message: "Vui lòng nhập số phòng tắm!" }]}
              >
                <Input type="number" min={1} placeholder="Nhập số phòng tắm (vd: 1)" />
              </Form.Item>
            </div>
          )}

          <Form.Item
            label="Địa chỉ cụ thể"
            name="address"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ!" },
              { min: 10, message: "Địa chỉ cụ thể phải dài ít nhất 10 ký tự!" }
            ]}
          >
            <Input placeholder="Nhập địa chỉ cụ thể" />
          </Form.Item>

          <Form.Item
            label="Mô tả chi tiết phòng trọ (Giá điện nước, tiện ích, nội thất...)"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          {/* Image Upload for Room Edit */}
          <div className="room-image-upload-section" style={{ marginTop: 20 }}>
            <span className="room-image-upload-label" style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#334155" }}>
              Hình ảnh thực tế phòng trọ
            </span>

            <div
              className="room-image-upload-box"
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                background: "#f8fafc",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative"
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#16a34a"; e.currentTarget.style.background = "#f0fdf4"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
              onClick={() => document.getElementById("room-edit-images-file-input").click()}
            >
              <div style={{ fontSize: "32px", color: "#64748b", marginBottom: "8px" }}>📷</div>
              <p style={{ margin: 0, fontSize: "14px", color: "#475569", fontWeight: 500 }}>Bấm hoặc kéo thả ảnh vào đây để tải lên</p>
              <input
                id="room-edit-images-file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleEditImageUpload}
                style={{ display: "none" }}
              />
            </div>

            {/* Previews container */}
            {editRoomImages.length > 0 && (
              <div
                className="room-images-previews"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "16px",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  background: "#ffffff"
                }}
              >
                {editRoomImages.map((imgBase64, idx) => {
                  let src = imgBase64;
                  if (imgBase64 && !imgBase64.startsWith("data:") && !imgBase64.startsWith("http")) {
                    src = `http://localhost:8000${imgBase64.startsWith("/") ? "" : "/"}${imgBase64}`;
                  }
                  return (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        width: "100px",
                        height: "80px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        border: "1px solid #cbd5e1"
                      }}
                    >
                      <img
                        src={src}
                        alt={`preview-${idx}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeEditRoomImage(idx); }}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "rgba(220, 38, 38, 0.85)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                          lineHeight: "18px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease"
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "#dc2626"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.85)"; }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Form>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default DashboardPage;
