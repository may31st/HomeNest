// scrapeController.js
const scrapers = require('./scraper'); 
const fs = require('fs');
const path = require('path');

const scrapeController = async (browserInstance) => {
  const url = 'https://phongtro123.com/';
  const urlHanoi = 'https://phongtro123.com/tinh-thanh/ha-noi';
  const urlHanoi2 = 'https://phongtro123.com/cho-thue-nha-nguyen-can-ha-noi';
  const urlHanoi3 = 'https://phongtro123.com/cho-thue-can-ho-chung-cu-ha-noi';
  const urlHanoi4 = 'https://phongtro123.com/cho-thue-can-ho-chung-cu-mini-ha-noi';
  const urlHanoi5 = 'https://phongtro123.com/cho-thue-can-ho-dich-vu-ha-noi';

  try {
    let browser = await browserInstance;
    
    console.log("1. Đang lấy danh mục...");
    const categories = await scrapers.scrapeCategory(browser, url);
    console.log("Đã lấy xong danh mục.");

    console.log("2. Đang crawl dữ liệu Phòng Trọ Hà Nội...");
    let result1 = await scrapers.scraper(browser, urlHanoi);
    fs.writeFileSync(path.join(__dirname, 'dataphongtro.json'), JSON.stringify(result1, null, 2));
    console.log("✅ Đã lưu dataphongtro.json");

    console.log("3. Đang crawl dữ liệu Nhà Nguyên Căn Hà Nội...");
    let result2 = await scrapers.scraper(browser, urlHanoi2);
    fs.writeFileSync(path.join(__dirname, 'datanhanguyencan.json'), JSON.stringify(result2, null, 2));
    console.log("✅ Đã lưu datanhanguyencan.json");

    console.log("4. Đang crawl dữ liệu Căn Hộ Chung Cư Hà Nội...");
    let result3 = await scrapers.scraper(browser, urlHanoi3);
    fs.writeFileSync(path.join(__dirname, 'datachungcu.json'), JSON.stringify(result3, null, 2));
    console.log("✅ Đã lưu datachungcu.json");

    console.log("5. Đang crawl dữ liệu Chung Cư Mini Hà Nội...");
    let result4 = await scrapers.scraper(browser, urlHanoi4);
    fs.writeFileSync(path.join(__dirname, 'datachungcumini.json'), JSON.stringify(result4, null, 2));
    console.log("✅ Đã lưu datachungcumini.json");

    console.log("6. Đang crawl dữ liệu Căn Hộ Dịch Vụ Hà Nội...");
    let result5 = await scrapers.scraper(browser, urlHanoi5);
    fs.writeFileSync(path.join(__dirname, 'datacanhodichvu.json'), JSON.stringify(result5, null, 2));
    console.log("✅ Đã lưu datacanhodichvu.json");

  } catch (err) {
    console.error('❌ Lỗi ở scrape controller:', err);
  }
};

module.exports = scrapeController;
