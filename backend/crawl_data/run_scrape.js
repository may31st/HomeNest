const startBrowser = require('./browser');
const scrapeController = require('./scrapeController');

(async () => {
    try {
        console.log("🚀 Bắt đầu khởi chạy trình duyệt để crawl data...");
        const browser = await startBrowser();
        if (!browser) {
            console.error("❌ Không thể khởi tạo trình duyệt Puppeteer!");
            process.exit(1);
        }
        await scrapeController(browser);
        console.log("✅ Quá trình crawl data hoàn tất!");
        await browser.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi khi chạy crawl data:", error);
        process.exit(1);
    }
})();
