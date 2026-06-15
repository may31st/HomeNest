const importRooms = require('./importRoom');

(async () => {
    try {
        console.log("🚀 Bắt đầu import dữ liệu phòng từ các file JSON vào Database...");
        await importRooms();
        console.log("✅ Quá trình import hoàn tất!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi khi chạy import:", error);
        process.exit(1);
    }
})();
