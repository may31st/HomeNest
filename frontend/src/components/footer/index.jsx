import React from 'react';
import "./index.css";
import TextField from '@mui/material/TextField';
import { DownOutlined} from '@ant-design/icons';
import { Button, Dropdown, message, Space, Tooltip } from 'antd';
import { FlagOutlined } from "@ant-design/icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  const handleMenuClick = (e) => {
    message.info('Click on menu item.');
    console.log('click', e);
  };
  const items = [
    {
      label: 'Tiếng Anh',
      key: '1',
      icon:  <FlagOutlined />,
    }
  ];
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
const Footer = () => {
    return (
        <div>
            <div className = "footer">
                <div className="imagefooter">
                <div className = "footerText1">
                <img src={require("../../assets/images/logo.jpg")} alt="Logo" className="logo" />
                </div>
                <div className = "footerText1">
                <p className="footer1">Hotline</p>
                <b  className="footerunder1">1900 1881</b>
                </div>
                <div className = "footerText1">
                <p className="footer1">Hỗ trợ khách hàng</p>
                <b  className="footerunder1">renthousehotro@gmail.com</b>
                </div>
                <div className = "footerText1">
                <p className="footer1">Chăm sóc khách hàng</p>
                <b  className="footerunder1">renthousechamsoc@gmail.com</b>
                </div>
                </div>
                <div className="footerSide1">
                <div>
                <span className="footerTexth1">Công ty TNHH cho thuê BDS</span>
                <p className ="footerText1-2">Địa chỉ:  Quang Trung, Quận Hoàn Kiếm, TP.Hà Nội</p>
                <p className ="footerText1-2">Hotline:(024) 3562 55667 - (024) 3562 6666</p>
                <FontAwesomeIcon icon="fa-brands fa-facebook" />
                </div>
                <div>
                <ul className="footerText2">
                <h1 className ="listfooter">Hướng dẫn</h1>
                 <li><a href="/ve-chung-toi">Về chúng tôi</a></li>
                <li><a href="/tin-tuc">Tin tức</a></li>
                <li><a href="/tin-tuc">Góp ý báo lỗi</a></li>
               </ul>
                </div>
                <div>
                <ul className="footerText2">
                <h1 className ="listfooter">Quy định</h1>
                <li><a href="/nha-dat-cho-thue">Quy định đăng tin</a></li>
                 <li><a href="/ve-chung-toi">Quy chế hoạt động</a></li>
                <li><a href="/tin-tuc">Chính sách bảo mật</a></li>
                <li><a href="/tin-tuc">Giải quyết khiếu nại</a></li>
               </ul>
                </div>
                <div>
                <h3 className="footerText2">Đăng ký nhận tin</h3>
                <TextField
               label="Email"
               id="outlined-size-small"
              size="small"
              sx={{ width: "350px" }} // Điều chỉnh độ rộng
              />
                <h3 className="footerText2">Quốc gia & Ngôn ngữ</h3>
                <Dropdown menu={menuProps}>
                <Button>
                <Space>
                   Tiếng Việt
                <DownOutlined />
                </Space>
              </Button>
             </Dropdown>
                </div>
                </div>
                
            </div>
        </div>

    )
}
export default Footer;
