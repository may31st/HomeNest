const vnpay = require("../middlewares/vnpayMiddleware");
const { ProductCode, VnpLocale } = require("vnpay");
const db = require("../models");
const { getLandlord } = require("../queries/roomQuery");

// ============================================================
// ORIGINAL: Tạo URL thanh toán VNPay thông thường
// ============================================================
const paymentByVnPay = (req, res) => {
  const returnUrl =
    req.body?.returnUrl || "http://localhost:8000/api/v1/payment/vnpay-return";

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: req.body.amount,
    vnp_IpAddr:
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip,
    vnp_TxnRef: Date.now().toString(),
    vnp_OrderInfo: req.body.orderInfo,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: returnUrl,
    vnp_Locale: VnpLocale.VN,
  });

  return res.json({ paymentUrl });
};

// ============================================================
// MỚI: Tạo đơn đặt cọc và khởi tạo thanh toán
// ============================================================
const createDeposit = async (req, res) => {
  try {
    const {
      roomId,
      tenantEmail,
      tenantName,
      tenantCccd,
      tenantDob,
      tenantAddress,
      tenantCccdImage,
      tenantPhone,
      amount,
      paymentMethod
    } = req.body;

    if (!roomId || !tenantEmail || !tenantName || !tenantCccd || !tenantDob || !tenantAddress || !tenantPhone || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, error: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }

    // 1. Lấy thông tin phòng
    const room = await db.Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: "Không tìm thấy phòng trọ này!" });
    }

    // 2. Tìm hoặc tạo tài khoản Tenant
    let tenantUser = await db.User.findOne({ where: { email: tenantEmail } });
    if (!tenantUser) {
      tenantUser = await db.User.create({
        email: tenantEmail,
        password: "123",
        firstName: tenantName,
        lastName: "",
        role: "user",
        phone_number: parseInt(String(tenantPhone).replace(/\D/g, '')) || 0,
        address: tenantAddress
      });
    }

    // 3. Tìm hoặc tạo tài khoản Landlord dựa theo roomQuery
    const landlordInfo = getLandlord(roomId);
    let landlordUser = await db.User.findOne({ where: { email: landlordInfo.email } });
    if (!landlordUser) {
      landlordUser = await db.User.create({
        email: landlordInfo.email,
        password: "123",
        firstName: landlordInfo.name,
        lastName: "",
        role: "user",
        phone_number: parseInt(String(landlordInfo.phone).replace(/\D/g, '')) || 0,
        address: "Hà Nội"
      });
    }

    // 4. Tạo bản ghi Deposit
    const deposit = await db.Deposit.create({
      room_id: roomId,
      tenant_id: tenantUser.id,
      landlord_id: landlordUser.id,
      tenant_name: tenantName,
      tenant_cccd: tenantCccd,
      tenant_dob: tenantDob,
      tenant_address: tenantAddress,
      tenant_cccd_image: tenantCccdImage || "",
      tenant_phone: tenantPhone,
      tenant_email: tenantEmail,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      payment_status: 'pending',
      status: 'pending'
    });

    // 5. Xử lý thanh toán theo phương thức
    if (paymentMethod === 'vnpay') {
      const returnUrl = `http://localhost:8000/api/v1/payment/vnpay-return`;
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount * 100,
        vnp_IpAddr:
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.ip,
        vnp_TxnRef: deposit.id.toString(),
        vnp_OrderInfo: `Dat coc phong ${room.room_name}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl,
        vnp_Locale: VnpLocale.VN,
      });
      return res.json({ success: true, paymentMethod: 'vnpay', paymentUrl });
    } else {
      // Momo: giả lập thanh toán thành công ngay lập tức
      deposit.payment_status = 'paid';
      await deposit.save();
      const mockSuccessUrl = `http://localhost:3000/user/payment-success?method=momo&deposit_id=${deposit.id}&status=success`;
      return res.json({ success: true, paymentMethod: 'momo', paymentUrl: mockSuccessUrl });
    }

  } catch (error) {
    console.error("Error creating deposit: ", error);
    res.status(500).json({ success: false, error: "Lỗi server", details: error.message });
  }
};

// ============================================================
// Xử lý callback VNPay trả về
// ============================================================
const paymentReturn = async (req, res) => {
  try {
    const txnRef = req.query.vnp_TxnRef;
    const responseCode = req.query.vnp_ResponseCode;
    const verify = vnpay.verifyReturnUrl(req.query);

    if (verify.isVerified && responseCode === "00") {
      const deposit = await db.Deposit.findByPk(txnRef);
      if (deposit) {
        deposit.payment_status = 'paid';
        await deposit.save();
        return res.redirect(`http://localhost:3000/user/payment-success?method=vnpay&deposit_id=${txnRef}&status=success`);
      }
    }
    return res.redirect(`http://localhost:3000/user/payment-success?status=failed`);
  } catch (error) {
    console.error("VNPay return error:", error);
    return res.redirect(`http://localhost:3000/user/payment-success?status=failed`);
  }
};

// ============================================================
// Lấy danh sách đặt cọc theo email người dùng
// ============================================================
const getDeposits = async (req, res) => {
  try {
    const { email, role } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, error: "Thiếu email người dùng!" });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: "Người dùng không tồn tại!" });
    }

    let whereClause = role === 'landlord'
      ? { landlord_id: user.id }
      : { tenant_id: user.id };

    const deposits = await db.Deposit.findAll({
      where: whereClause,
      include: [{ model: db.Room, as: 'Room' }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, deposits });
  } catch (error) {
    console.error("Error fetching deposits: ", error);
    res.status(500).json({ success: false, error: "Lỗi server", details: error.message });
  }
};

// ============================================================
// Chủ trọ phê duyệt đặt cọc → Tự động tạo hợp đồng
// ============================================================
const approveDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const deposit = await db.Deposit.findByPk(id, {
      include: [{ model: db.Room, as: 'Room' }]
    });

    if (!deposit) {
      return res.status(404).json({ success: false, error: "Không tìm thấy thông tin đặt cọc!" });
    }

    deposit.status = 'approved';
    await deposit.save();

    const landlordUser = await db.User.findByPk(deposit.landlord_id);
    const contractCode = `HD-${deposit.id}-${Math.floor(1000 + Math.random() * 9000)}`;

    const terms = `
### CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
#### Độc lập - Tự do - Hạnh phúc
---
## HỢP ĐỒNG THUÊ PHÒNG TRỌ / NHÀ Ở
**Mã Hợp Đồng: ${contractCode}**

Căn cứ Bộ luật Dân sự và Luật Nhà ở hiện hành.

Hôm nay, ngày ${new Date().toLocaleDateString("vi-VN")}, chúng tôi gồm có:

### BÊN CHO THUÊ (BÊN A):
- **Họ và tên:** ${landlordUser ? (landlordUser.firstName || "Chủ trọ") : "Chủ trọ"}
- **Số điện thoại:** ${landlordUser ? (landlordUser.phone_number || "Chưa cập nhật") : "Chưa cập nhật"}
- **Email:** ${landlordUser ? landlordUser.email : "Chưa cập nhật"}

### BÊN THUÊ (BÊN B):
- **Họ và tên:** ${deposit.tenant_name}
- **Số CMND/CCCD:** ${deposit.tenant_cccd}
- **Ngày sinh:** ${deposit.tenant_dob}
- **Địa chỉ thường trú:** ${deposit.tenant_address}
- **Số điện thoại:** ${deposit.tenant_phone}
- **Email:** ${deposit.tenant_email}

---

### ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG
Bên A đồng ý cho Bên B thuê phòng: **${deposit.Room?.room_name || "Phòng trọ"}**
Địa chỉ: **${deposit.Room?.address || "Hà Nội"}**
Diện tích: **${deposit.Room?.area || "N/A"} m²**

### ĐIỀU 2: GIÁ THUÊ & THANH TOÁN
- Giá thuê: **${deposit.Room?.price_per_month || 0} triệu đồng/tháng**
- Tiền đặt cọc đã thanh toán: **${Number(deposit.amount).toLocaleString('vi-VN')} VND** qua **${deposit.payment_method?.toUpperCase()}**
- Thanh toán tiền thuê trước ngày 05 hàng tháng.

### ĐIỀU 3: THỜI HẠN THUÊ
Thời hạn thuê: **12 tháng**, tính từ ngày ký hợp đồng.

### ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CÁC BÊN
- Bên A giao phòng đúng hiện trạng, bảo đảm quyền sử dụng hợp pháp.
- Bên B sử dụng phòng đúng mục đích, thanh toán đầy đủ đúng hạn, chấp hành quy định an ninh trật tự.

### ĐIỀU 5: CHẤM DỨT HỢP ĐỒNG
- Đơn phương chấm dứt phải báo trước 30 ngày.
- Bên B tự ý chấm dứt không có lý do chính đáng sẽ mất tiền đặt cọc.

---
Hợp đồng được ký điện tử trên nền tảng RENTHOUSE, có giá trị pháp lý.
    `.trim();

    const contract = await db.Contract.create({
      deposit_id: deposit.id,
      room_id: deposit.room_id,
      tenant_id: deposit.tenant_id,
      landlord_id: deposit.landlord_id,
      contract_code: contractCode,
      room_name: deposit.Room?.room_name || "Phòng trọ",
      room_address: deposit.Room?.address || "",
      room_price: deposit.Room?.price_per_month || 0,
      deposit_amount: deposit.amount,
      landlord_name: landlordUser ? (landlordUser.firstName || "Chủ trọ") : "Chủ trọ",
      landlord_phone: landlordUser ? String(landlordUser.phone_number || "") : "",
      landlord_email: landlordUser ? landlordUser.email : "",
      tenant_name: deposit.tenant_name,
      tenant_cccd: deposit.tenant_cccd,
      tenant_dob: deposit.tenant_dob,
      tenant_address: deposit.tenant_address,
      tenant_phone: deposit.tenant_phone,
      tenant_email: deposit.tenant_email,
      terms,
      tenant_signed: false,
      landlord_signed: false,
      status: 'pending'
    });

    res.json({ success: true, message: "Phê duyệt thành công, đã tạo hợp đồng điện tử!", contract });
  } catch (error) {
    console.error("Error approving deposit: ", error);
    res.status(500).json({ success: false, error: "Lỗi server", details: error.message });
  }
};

// ============================================================
// Chủ trọ từ chối đặt cọc
// ============================================================
const rejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const deposit = await db.Deposit.findByPk(id);
    if (!deposit) {
      return res.status(404).json({ success: false, error: "Không tìm thấy thông tin đặt cọc!" });
    }
    deposit.status = 'rejected';
    await deposit.save();
    res.json({ success: true, message: "Đã từ chối yêu cầu đặt cọc này!" });
  } catch (error) {
    console.error("Error rejecting deposit: ", error);
    res.status(500).json({ success: false, error: "Lỗi server", details: error.message });
  }
};

module.exports = {
  paymentByVnPay,
  paymentReturn,
  createDeposit,
  getDeposits,
  approveDeposit,
  rejectDeposit
};