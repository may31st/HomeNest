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
import { Button, Modal } from 'antd';
import { Link, useNavigate } from 'react-router-dom';  

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
                <Button className="push" type="primary" onClick={() => navigate("/login")}>Đăng bài</Button>
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