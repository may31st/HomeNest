import React from 'react';
import MediaCard from '../../../components/card/card.jsx';
import { Flex, Button } from 'antd';
import './index.css';

const RoomListPage = () => {
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="room-list-page">
            {/* Banner Section */}
            <div className="list-banner">
                <div className="list-banner-content">
                    <h1>Danh sách phòng</h1>
                    <p>Khám phá các loại hình lưu trú đa dạng, thông tin minh bạch, hình ảnh xác thực </p>
                </div>
            </div>

            {/* Quick Navigation Anchor Bar */}
            <div className="anchor-nav-container">
                <div className="anchor-nav-title">Phân loại phòng:</div>
                <Flex wrap gap={20} className="anchor-nav-flex" justify="center">
                    <Button type="default" size="large" onClick={() => scrollToSection("sec-phongtro")} className="anchor-btn">
                        Phòng trọ
                    </Button>
                    <Button type="default" size="large" onClick={() => scrollToSection("sec-nhanguyencan")} className="anchor-btn">
                        Nhà nguyên căn
                    </Button>
                    <Button type="default" size="large" onClick={() => scrollToSection("sec-canhodichvu")} className="anchor-btn">
                        Căn hộ dịch vụ
                    </Button>
                    <Button type="default" size="large" onClick={() => scrollToSection("sec-chungcumini")} className="anchor-btn">
                        Chung cư mini
                    </Button>
                </Flex>
            </div>

            {/* Categorized Listings Sections */}
            <div className="categories-container">
                <div id="sec-phongtro" className="list-category-section">
                    <div className="category-header">
                        <h2>Danh sách Phòng trọ</h2>
                    </div>
                    <div className="card-list-home-container-Homepage">
                        <MediaCard typeFilter="phongtro" />
                    </div>
                </div>

                <div id="sec-nhanguyencan" className="list-category-section">
                    <div className="category-header">
                        <h2>Danh sách Nhà nguyên căn</h2>
                    </div>
                    <div className="card-list-home-container-Homepage">
                        <MediaCard typeFilter="nhanguyencan" />
                    </div>
                </div>

                <div id="sec-canhodichvu" className="list-category-section">
                    <div className="category-header">
                        <h2>Danh sách Căn hộ dịch vụ</h2>
                    </div>
                    <div className="card-list-home-container-Homepage">
                        <MediaCard typeFilter="canhodichvu" />
                    </div>
                </div>

                <div id="sec-chungcumini" className="list-category-section">
                    <div className="category-header">
                        <h2>Danh sách Chung cư mini</h2>
                    </div>
                    <div className="card-list-home-container-Homepage">
                        <MediaCard typeFilter="chungcumini" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomListPage;
