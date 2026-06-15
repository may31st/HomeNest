import React from "react"
import ProgressComponent from "../../../components/progress/progress"
import "./index.css"
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, message, Space } from 'antd';
import { Input } from 'antd';

const PushInformationPage = () => {
  const onClick = ({ key }) => {
    message.info(`Click on item ${key}`);
  };
  const items = [
    {
      label: '1st menu item',
      key: '1',
    },
    {
      label: '2nd menu item',
      key: '2',
    },
    {
      label: '3rd menu item',
      key: '3',
    },
  ];

  const steps = [
    <div>
      <h2 className ="mb-6 font-semibold text-base">Bước 1: Thông tin về trọ</h2>
      <div className ="h-auto rounded-[20px] bg-[#E8F5E9]  p-6">
        <h1 className ="text-left text-lg font-semibold "> Thông tin chính</h1>
        <span className ="text-gray-600 mt-8 block">Loại trọ bạn muốn cho thuê</span>
        <div className ="mt-1 border border-gray-300 rounded-3xl p-[10px] h-auto bg-white">
        <Dropdown 
         menu={{
         items,
          onClick
         }}
         >
       <a onClick={(e) => e.preventDefault()}>
         <Space>
        Chọn loại hình bạn muốn cho thuê
        <DownOutlined />
       </Space>
       </a>
       </Dropdown>
       </div>
       <span className ="text-gray-600 mt-5 block">Diện tích</span>
        {/* <div className ="mt-2 border border-gray-300 rounded-3xl p-[12px] h-auto bg-white"> */}
        <Input  
        className ="mt-1 rounded-3xl p-[10px]"
        placeholder="Basic usage" />
       {/* </div> */}
       <span className ="text-gray-600 mt-5 block">Mức giá</span>
        <Input  
        className ="mt-1 rounded-3xl p-[10px]"
        placeholder="Basic usage" />
      </div> 
    </div>,
    <div>
      <h2>Bước 2: Giá thuê</h2>
      <p>Nhập mức giá mong muốn cho bất động sản của bạn.</p>
    </div>,
    <div>
      <h2>Bước 3: Mô tả chi tiết</h2>
      <p>Thêm mô tả chi tiết giúp khách hàng hiểu rõ hơn.</p>
    </div>,
  ];

  return (
    <div className ="push-paper-information">
      <h1 className ="push-paper-information-title">Tạo tin đăng bài</h1>
      <ProgressComponent steps={steps} />
    </div>
  );
};

export default PushInformationPage;

