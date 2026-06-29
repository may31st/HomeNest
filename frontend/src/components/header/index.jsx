import React from 'react';
import "./index.css";
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { Button, Modal, Badge, Popover } from 'antd';
import { Link, useNavigate } from 'react-router-dom';  
import { HeartOutlined, BellOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';

const Header = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    
    // Header states for About, News, Pricing modals
    const [isAboutOpen, setIsAboutOpen] = React.useState(false);
    const [isNewsOpen, setIsNewsOpen] = React.useState(false);
    const [isPriceOpen, setIsPriceOpen] = React.useState(false);
    
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
      setAnchorEl(null);
    };

    const authData = sessionStorage.getItem("auth");
    const isLoggedIn = !!authData;
    const user = isLoggedIn ? JSON.parse(authData) : {};

    const [notifications, setNotifications] = React.useState([]);
    const [readNotifIds, setReadNotifIds] = React.useState([]);

    React.useEffect(() => {
      if (isLoggedIn && user.email) {
        try {
          const stored = localStorage.getItem(`read_notifications_${user.email}`);
          setReadNotifIds(stored ? JSON.parse(stored) : []);
        } catch (e) {
          console.error(e);
        }
      }
    }, [isLoggedIn, user.email]);

    const unreadNotifications = React.useMemo(() => {
      return notifications.filter(n => !readNotifIds.includes(n.id));
    }, [notifications, readNotifIds]);

    const unreadNotifCount = unreadNotifications.length;

    const sortedNotifications = React.useMemo(() => {
      return [...notifications].sort((a, b) => {
        const aUnread = !readNotifIds.includes(a.id);
        const bUnread = !readNotifIds.includes(b.id);
        if (aUnread && !bUnread) return -1;
        if (!aUnread && bUnread) return 1;
        return 0;
      });
    }, [notifications, readNotifIds]);

    const fetchNotifications = async () => {
      if (!isLoggedIn || !user.email) return;
      try {
        const notifs = [];
        // 1. Fetch deposits
        const resTD = await axios.get(`http://localhost:8000/api/v1/payment/deposits?email=${user.email}&role=tenant`);
        const resLD = await axios.get(`http://localhost:8000/api/v1/payment/deposits?email=${user.email}&role=landlord`);
        
        // 2. Fetch contracts
        const resTC = await axios.get(`http://localhost:8000/api/v1/contract?email=${user.email}&role=tenant`);
        const resLC = await axios.get(`http://localhost:8000/api/v1/contract?email=${user.email}&role=landlord`);

        // Process tenant deposits
        if (resTD.data && resTD.data.success) {
          resTD.data.deposits.forEach(d => {
            if (d.status === "approved") {
              notifs.push({
                id: `td-app-${d.id}`,
                text: `Đặt cọc phòng ${d.Room?.room_name || ""} của bạn đã được CHỦ NHÀ ĐỒNG Ý.`,
                link: "/user/dashboard",
                tab: "hop_dong"
              });
            } else if (d.status === "rejected") {
              notifs.push({
                id: `td-rej-${d.id}`,
                text: `Đặt cọc phòng ${d.Room?.room_name || ""} của bạn đã bị từ chối.`,
                link: "/user/dashboard",
                tab: "hop_dong"
              });
            }
          });
        }

        // Process landlord deposits
        if (resLD.data && resLD.data.success) {
          resLD.data.deposits.forEach(d => {
            if (d.status === "pending" && d.payment_status === "paid") {
              notifs.push({
                id: `ld-pend-${d.id}`,
                text: `Có yêu cầu đặt cọc mới cho phòng ${d.Room?.room_name || ""} đang chờ bạn duyệt.`,
                link: "/user/dashboard",
                tab: "hop_dong"
              });
            }
          });
        }

        // Process tenant contracts
        if (resTC.data && resTC.data.success) {
          resTC.data.contracts.forEach(c => {
            if (!c.tenant_signed) {
              notifs.push({
                id: `tc-sign-${c.id}`,
                text: `Hợp đồng phòng ${c.Room?.room_name || ""} đang chờ bạn ký trực tuyến.`,
                link: "/user/dashboard",
                tab: "hop_dong"
              });
            }
          });
        }

        // Process landlord contracts
        if (resLC.data && resLC.data.success) {
          resLC.data.contracts.forEach(c => {
            if (!c.landlord_signed) {
              notifs.push({
                id: `lc-sign-${c.id}`,
                text: `Hợp đồng phòng ${c.Room?.room_name || ""} đang chờ chủ nhà ký hoàn tất.`,
                link: "/user/dashboard",
                tab: "hop_dong"
              });
            }
          });
        }

        setNotifications(notifs);
      } catch (error) {
        console.error("Error fetching header notifications:", error);
      }
    };

    React.useEffect(() => {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Check every 15s
      return () => clearInterval(interval);
    }, [isLoggedIn, user.email]);

    const handleNotificationClick = (notif) => {
      if (isLoggedIn && user.email) {
        const updated = [...readNotifIds];
        if (!updated.includes(notif.id)) {
          updated.push(notif.id);
          setReadNotifIds(updated);
          localStorage.setItem(`read_notifications_${user.email}`, JSON.stringify(updated));
        }
      }
      navigate(notif.link, { state: { tab: notif.tab } });
    };

    const handleMarkAllAsRead = () => {
      if (isLoggedIn && user.email) {
        const allIds = notifications.map(n => n.id);
        setReadNotifIds(allIds);
        localStorage.setItem(`read_notifications_${user.email}`, JSON.stringify(allIds));
      }
    };

    const notificationContent = (
      <div style={{ width: 320, maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
        {notifications.length > 0 && (
          <div style={{ 
            padding: '8px 12px', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc'
          }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Chưa đọc: {unreadNotifCount}
            </span>
            <span 
              onClick={handleMarkAllAsRead}
              style={{ 
                fontSize: '12px', 
                color: '#2563eb', 
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Đánh dấu tất cả đã đọc
            </span>
          </div>
        )}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '16px 8px', color: '#64748b', textAlign: 'center' }}>
              Không có thông báo mới nào
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sortedNotifications.map((notif) => {
                const isRead = readNotifIds.includes(notif.id);
                return (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                      background: isRead ? '#ffffff' : '#f0fdf4'
                    }}
                    className="notification-item-hover"
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: isRead ? '#475569' : '#1e293b', 
                        fontWeight: isRead ? 400 : 600,
                        lineHeight: '1.4'
                      }}>
                        {notif.text}
                      </div>
                      {!isRead && (
                        <span style={{ 
                          display: 'inline-block', 
                          marginTop: '4px',
                          fontSize: '10px', 
                          color: '#2e7d32', 
                          background: '#dcfce7',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontWeight: 700
                        }}>
                          Mới
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );

    return (
        <div>
            <div className = "header">
                <div className="header-left">
                    <Link to="/user/home" className="logo-link">
                      <div className="imageHeader">
                        <img src={require("../../assets/images/logo.jpg")} alt="Logo" className="logo-Header" />
                      </div>
                    </Link>
                    <div className="headerText">
                 <Box className ="BoxHeader" sx={{ display: 'flex', alignItems: 'center', gap: '45px' }}>
                  <Link to="/user/home" className="link">
                    <Typography sx={{ color:'black', fontWeight: 500, fontSize: '16px', '&:hover': { color: '#2e7d32' } }}>Trang chủ</Typography>
                  </Link>
                  <Link to="/user/list" className="link">
                    <Typography sx={{ color:'black', fontWeight: 500, fontSize: '16px', '&:hover': { color: '#2e7d32' } }}>Danh sách phòng</Typography>
                  </Link>
                  <Link to="/user/distance-search" className="link">
                    <Typography sx={{ color: 'black', fontWeight: 500, fontSize: '16px', '&:hover': { color: '#2e7d32' } }}>Tìm kiếm</Typography>
                  </Link>
                  <Typography onClick={() => setIsAboutOpen(true)} sx={{ color:'black', fontWeight: 500, fontSize: '16px', cursor: 'pointer', '&:hover': { color: '#2e7d32' } }}>Về chúng tôi</Typography>
                  <Link to="/user/news" className="link">
                    <Typography sx={{ color:'black', fontWeight: 500, fontSize: '16px', '&:hover': { color: '#2e7d32' } }}>Tin tức</Typography>
                  </Link>
                  {isLoggedIn && (
                    <Link to="/user/favorites" className="link" style={{ display: 'flex', alignItems: 'center' }} title="Danh sách yêu thích">
                      <HeartOutlined className="heart-icon-hover" style={{ color: 'black', fontSize: '20px', cursor: 'pointer', transition: 'transform 0.2s' }} />
                    </Link>
                  )}
                 </Box>
            <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open && !isLoggedIn}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClose}>
                Profile
            </MenuItem>
            <MenuItem onClick={handleClose}>
              My account
            </MenuItem>
          </Menu>
                </div>
            </div>
            <div className="headerButton">
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Notification Bell */}
                <Popover 
                  content={notificationContent} 
                  title={<span style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>Thông báo</span>}
                  trigger="click"
                  placement="bottomRight"
                >
                  <Badge count={unreadNotifCount} size="small" offset={[2, -2]} style={{ backgroundColor: '#ef4444' }}>
                    <IconButton style={{ padding: 4 }}>
                      <BellOutlined style={{ fontSize: '22px', color: '#1e293b' }} />
                    </IconButton>
                  </Badge>
                </Popover>

                {/* Chat Message Bubble */}
                <Badge count={0} size="small" offset={[2, -2]} style={{ backgroundColor: '#ef4444' }}>
                  <IconButton 
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate("/user/chat");
                    }} 
                    style={{ padding: 4 }}
                  >
                    <MessageOutlined style={{ fontSize: '22px', color: '#1e293b' }} />
                  </IconButton>
                </Badge>

                <Button 
                  className="push" 
                  type="primary" 
                  onClick={() => navigate("/user/dashboard", { state: { tab: "dang_tin" } })}
                >
                  Đăng bài
                </Button>
                <Tooltip title="Tài khoản">
                  <IconButton onClick={handleClick}>
                    <Avatar sx={{ bgcolor: '#2e7d32', width: 36, height: 36, fontSize: '15px', fontWeight: 700 }}>
                      {user.lastName ? user.lastName.charAt(0).toUpperCase() : "U"}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={open && isLoggedIn}
                  onClose={handleClose}
                  onClick={handleClose}
                  slotProps={{
                    paper: {
                      elevation: 3,
                      sx: {
                        overflow: 'visible',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => navigate("/user/dashboard", { state: { tab: "thong_tin_ca_nhan" } })}>
                    Thông tin cá nhân
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/user/dashboard")}>
                    Trang quản lý
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/user/dashboard", { state: { tab: "tin_dang" } })}>
                    Tin đã đăng
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => {
                    sessionStorage.removeItem("authToken");
                    sessionStorage.removeItem("auth");
                    navigate("/landing");
                  }}>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </div>
            ) : (
              <>
                <Button className="signup-header" type="text" onClick={() => navigate("/login")}>Đăng nhập</Button>
                <Button className="login-header" type="primary" onClick={() => navigate("/sign-up")}>Đăng ký</Button>
              </>
            )}
            </div>
            </div>

            {/* Modal Về chúng tôi */}
            <Modal
              title={<span style={{ color: '#2e7d32', fontWeight: 700, fontSize: '18px' }}>Về chúng tôi - HOMENEST</span>}
              open={isAboutOpen}
              onCancel={() => setIsAboutOpen(false)}
              footer={[
                <Button key="close" type="primary" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }} onClick={() => setIsAboutOpen(false)}>Đóng</Button>
              ]}
              destroyOnClose
            >
              <div style={{ padding: '10px 0', fontSize: '14px', lineHeight: '1.6' }}>
                <p><strong>HOMENEST</strong> là nền tảng công nghệ hàng đầu tại Việt Nam trong lĩnh vực tìm kiếm và quản lý phòng trọ, căn hộ cho thuê.</p>
                <p><strong>Sứ mệnh của chúng tôi:</strong> Kết nối trực tiếp giữa chủ nhà và khách thuê, tối ưu hóa thời gian và chi phí, cam kết thông tin minh bạch, xác thực 100%.</p>
                <p><strong>Tầm nhìn:</strong> Trở thành hệ sinh thái bất động sản cho thuê đáng tin cậy nhất, đem lại trải nghiệm "Be Home" hoàn mỹ cho mọi khách hàng.</p>
              </div>
            </Modal>

            {/* Modal Tin tức */}
            <Modal
              title={<span style={{ color: '#2e7d32', fontWeight: 700, fontSize: '18px' }}>Tin tức thị trường nổi bật</span>}
              open={isNewsOpen}
              onCancel={() => setIsNewsOpen(false)}
              footer={[
                <Button key="close" type="primary" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }} onClick={() => setIsNewsOpen(false)}>Đóng</Button>
              ]}
              destroyOnClose
            >
              <div style={{ padding: '10px 0', fontSize: '14px', lineHeight: '1.8' }}>
                <ul style={{ paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}><strong>Xu hướng giá thuê chung cư mini 2026:</strong> Nhu cầu tăng mạnh từ sinh viên và người trẻ tuổi khiến phân khúc này trở thành tâm điểm thị trường.</li>
                  <li style={{ marginBottom: '10px' }}><strong>Kinh nghiệm làm hợp đồng thuê nhà:</strong> Những điều khoản cốt lõi cần làm rõ về giá điện nước, tiền cọc và thời hạn hoàn cọc để bảo vệ quyền lợi cá nhân.</li>
                  <li><strong>Cách phòng tránh lừa đảo tiền cọc trọ:</strong> Hãy luôn đi xem trực tiếp, kiểm tra giấy tờ pháp lý của chủ nhà trước khi chuyển bất kỳ khoản cọc nào!</li>
                </ul>
              </div>
            </Modal>

            {/* Modal Bảng giá */}
            <Modal
              title={<span style={{ color: '#2e7d32', fontWeight: 700, fontSize: '18px' }}>Bảng giá dịch vụ đăng tin Rent Space</span>}
              open={isPriceOpen}
              onCancel={() => setIsPriceOpen(false)}
              footer={[
                <Button key="close" type="primary" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }} onClick={() => setIsPriceOpen(false)}>Đóng</Button>
              ]}
              destroyOnClose
            >
              <div style={{ padding: '10px 0', fontSize: '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', lineHeight: '1.6' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #2e7d32', fontWeight: 'bold' }}>
                      <th style={{ padding: '8px' }}>Gói dịch vụ</th>
                      <th style={{ padding: '8px' }}>Mức phí</th>
                      <th style={{ padding: '8px' }}>Đặc quyền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>Gói Miễn phí</td>
                      <td style={{ padding: '8px', color: '#666' }}>Miễn phí</td>
                      <td style={{ padding: '8px' }}>Đăng tối đa 2 tin, hiển thị trong 7 ngày</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', fontWeight: 600, color: '#4caf4f' }}>Gói Tiêu chuẩn</td>
                      <td style={{ padding: '8px', color: '#d32f2f', fontWeight: 600 }}>50.000đ/tin</td>
                      <td style={{ padding: '8px' }}>Ưu tiên hiển thị trung bình, hỗ trợ đẩy tin tự động</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#d32f2f' }}>Gói VIP nổi bật</td>
                      <td style={{ padding: '8px', color: '#d32f2f', fontWeight: 700 }}>150.000đ/tin</td>
                      <td style={{ padding: '8px' }}>Hiển thị vị trí Top trang chủ, gắn nhãn VIP, hỗ trợ 24/7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Modal>
        </div>
    );
};

export default Header;