import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./index.css";

const BANKS = [
  { id: "vcb", name: "Vietcombank", color: "#006400", abbr: "VCB" },
  { id: "tcb", name: "Techcombank", color: "#cc0000", abbr: "TCB" },
  { id: "mb", name: "MBBank", color: "#003087", abbr: "MB" },
  { id: "acb", name: "ACB", color: "#003087", abbr: "ACB" },
  { id: "bido", name: "BIDV", color: "#005baa", abbr: "BIDV" },
  { id: "vtb", name: "Vietinbank", color: "#005baa", abbr: "VTB" },
];

// VNPAY QR - colored position markers (TL/TR=blue, BL=blue border + red inner)
// Defined at module level to avoid hoisting issues in production builds
function getVnpayQrCell(idx, size) {
  const row = Math.floor(idx / size);
  const col = idx % size;
  const ms = size - 7;

  function checkMarker(r0, c0) {
    const lr = row - r0, lc = col - c0;
    if (lr < 0 || lr > 6 || lc < 0 || lc > 6) return null;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return 'border';
    if (lr === 1 || lr === 5 || lc === 1 || lc === 5) return 'gap';
    return 'inner';
  }

  // Top-left: blue
  const tl = checkMarker(0, 0);
  if (tl) return { bg: tl === 'gap' ? '#fff' : '#1a5fb4' };

  // Top-right: blue
  const tr = checkMarker(0, ms);
  if (tr) return { bg: tr === 'gap' ? '#fff' : '#1a5fb4' };

  // Bottom-left: blue border, red inner 3x3
  const bl = checkMarker(ms, 0);
  if (bl) {
    if (bl === 'gap') return { bg: '#fff' };
    if (bl === 'inner') return { bg: '#e01b24' };
    return { bg: '#1a5fb4' };
  }

  // Separator quiet zones
  if (row === 7 && col <= 8) return { bg: '#fff' };
  if (col === 7 && row <= 8) return { bg: '#fff' };
  if (row === 7 && col >= ms - 1) return { bg: '#fff' };
  if (col === 7 && row >= ms - 1) return { bg: '#fff' };
  if (col === ms - 1 && row >= ms - 1) return { bg: '#fff' };
  if (row === ms - 1 && col <= 8) return { bg: '#fff' };

  // Timing pattern
  if (row === 6 || col === 6) {
    return { bg: (row + col) % 2 === 0 ? '#111' : '#fff' };
  }

  // Data area pseudo-random
  const v = (row * 7 + col * 13 + (row ^ col) * 3 + row * col) % 11;
  return { bg: v < 6 ? '#111' : '#fff' };
}

// Pre-compute QR grid at module level (runs once, not on every render)
const QR_SIZE = 29;
const QR_CELLS = Array.from({ length: QR_SIZE * QR_SIZE }, (_, i) => getVnpayQrCell(i, QR_SIZE));

const MockVnpayPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const depositId = searchParams.get("depositId");
  const amount = parseInt(searchParams.get("amount") || "0");
  const roomName = searchParams.get("roomName") || "Phòng trọ";

  const [activeTab, setActiveTab] = useState("qr");
  const [selectedBank, setSelectedBank] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form"); // form | otp | success
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/user/payment-success?status=failed&reason=timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatAmount = (amt) =>
    amt.toLocaleString("vi-VN") + " VNĐ";

  const handleQrPay = async () => {
    setProcessing(true);
    try {
      await axios.post("http://localhost:8000/api/v1/payment/confirm-mock-payment", {
        depositId,
        status: "success",
      });
      setTimeout(() => {
        navigate(`/user/payment-success?method=vnpay&deposit_id=${depositId}&status=success`);
      }, 1500);
    } catch (err) {
      navigate("/user/payment-success?status=failed");
    }
  };

  const handleAtmNext = () => {
    if (!selectedBank || !cardNumber.trim() || !cardName.trim()) return;
    setStep("otp");
  };

  const handleOtpConfirm = async () => {
    if (otp.length < 6) return;
    setProcessing(true);
    try {
      await axios.post("http://localhost:8000/api/v1/payment/confirm-mock-payment", {
        depositId,
        status: "success",
      });
      setStep("success");
      setTimeout(() => {
        navigate(`/user/payment-success?method=vnpay&deposit_id=${depositId}&status=success`);
      }, 2000);
    } catch (err) {
      navigate("/user/payment-success?status=failed");
    }
  };

  const handleCancel = () => {
    navigate("/user/payment-success?status=failed&reason=cancelled");
  };

  return (
    <div className="vnpay-wrapper">
      <div className="vnpay-body">
        {/* Left: Order Info - styled like real VNPAY */}
        <div className="vnpay-order-panel">
          <h2 className="order-panel-title">Thông tin đơn hàng</h2>
          <div className="order-divider" />

          {/* Big amount section */}
          <div className="order-amount-section">
            <div className="oas-label">Số tiền thanh toán</div>
            <div className="oas-amount">
              {amount.toLocaleString("vi-VN")}
              <sup className="oas-currency">VND</sup>
            </div>
          </div>

          <div className="order-divider" />

          <div className="order-info-row">
            <span className="oir-label">Giá trị đơn hàng</span>
            <span className="oir-value">{amount.toLocaleString("vi-VN")} VND</span>
          </div>
          <div className="order-info-row">
            <span className="oir-label">Phí giao dịch</span>
            <span className="oir-value">0<sup style={{fontSize:10, marginLeft:1}}>VND</sup></span>
          </div>
          <div className="order-info-row">
            <span className="oir-label">Mã đơn hàng</span>
            <span className="oir-value oir-mono">RTH{depositId?.padStart(6, "0") || "000001"}</span>
          </div>
          <div className="order-info-row">
            <span className="oir-label">Nội dung</span>
            <span className="oir-value">{`Đặt cọc: ${roomName}`}</span>
          </div>
          <div className="order-info-row">
            <span className="oir-label">Nhà cung cấp</span>
            <span className="oir-value oir-bold">RENTHOUSE</span>
          </div>

          <div className="order-divider" style={{marginTop: 16}} />

          <div className="order-timer-row">
            <span>⏱ Hết hạn sau: </span>
            <span className={`timer ${timeLeft < 60 ? "danger" : ""}`}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Right: Payment Methods */}
        <div className="vnpay-payment-panel">
          {/* Tabs */}
          <div className="payment-tabs">
            <button
              className={`payment-tab ${activeTab === "qr" ? "active" : ""}`}
              onClick={() => setActiveTab("qr")}
            >
              <span className="tab-icon">📱</span>
              QR Code
            </button>
            <button
              className={`payment-tab ${activeTab === "atm" ? "active" : ""}`}
              onClick={() => { setActiveTab("atm"); setStep("form"); }}
            >
              <span className="tab-icon">🏧</span>
              Thẻ ATM
            </button>
            <button
              className={`payment-tab ${activeTab === "card" ? "active" : ""}`}
              onClick={() => { setActiveTab("card"); setStep("form"); }}
            >
              <span className="tab-icon">💳</span>
              Thẻ Quốc tế
            </button>
          </div>

          {/* QR Tab */}
          {activeTab === "qr" && (
            <div className="qr-panel">
              <h3 className="qr-panel-title">Quét mã qua ứng dụng Ví VNPAY</h3>

              <div className="vnpayqr-wrapper">
                {/* VNPAY QR Brand Header */}
                <div className="vnpayqr-brand">
                  <span className="brand-vn">VN</span>
                  <span className="brand-pay">PAY</span>
                  <sup className="brand-qr">QR</sup>
                </div>

                {/* QR Frame with Scanner Brackets */}
                <div className="vnpayqr-frame">
                  <div className="scan-corner tl" />
                  <div className="scan-corner tr" />
                  <div className="scan-corner bl" />
                  <div className="scan-corner br" />

                  <div className="vnpayqr-grid">
                    {QR_CELLS.map((cell, i) => (
                      <div
                        key={i}
                        className="vqr-cell"
                        style={{ backgroundColor: cell.bg }}
                      />
                    ))}
                  </div>
                </div>

                {/* Scan to Pay */}
                <div className="vnpayqr-scan-text">Scan to Pay</div>
              </div>

              <button
                className="btn-simulate-pay"
                onClick={handleQrPay}
                disabled={processing}
              >
                {processing ? "Đang xử lý..." : "Thanh toán"}
              </button>
              <button className="btn-cancel-vnpay" onClick={handleCancel}>
                Hủy thanh toán
              </button>
            </div>
          )}

          {/* ATM Tab */}
          {activeTab === "atm" && (
            <div className="atm-panel">
              {step === "form" && (
                <>
                  <p className="atm-instruction">Chọn ngân hàng của bạn</p>
                  <div className="bank-grid">
                    {BANKS.map((bank) => (
                      <div
                        key={bank.id}
                        className={`bank-item ${selectedBank === bank.id ? "selected" : ""}`}
                        onClick={() => setSelectedBank(bank.id)}
                      >
                        <div
                          className="bank-icon"
                          style={{ backgroundColor: bank.color }}
                        >
                          {bank.abbr}
                        </div>
                        <span>{bank.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card-form">
                    <div className="cf-field">
                      <label>Số thẻ / Số tài khoản</label>
                      <input
                        type="text"
                        placeholder="Nhập số thẻ hoặc số tài khoản"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        maxLength={16}
                      />
                    </div>
                    <div className="cf-field">
                      <label>Tên chủ thẻ</label>
                      <input
                        type="text"
                        placeholder="Nhập tên in hoa theo thẻ"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  <button
                    className="btn-pay"
                    onClick={handleAtmNext}
                    disabled={!selectedBank || !cardNumber || !cardName}
                  >
                    Tiếp tục
                  </button>
                </>
              )}

              {step === "otp" && (
                <div className="otp-panel">
                  <div className="otp-icon">📲</div>
                  <h3>Xác thực OTP</h3>
                  <p>
                    Mã OTP đã được gửi đến số điện thoại đã đăng ký với ngân hàng.
                    Mã có hiệu lực trong <strong>3 phút</strong>.
                  </p>
                  <div className="cf-field">
                    <label>Nhập mã OTP</label>
                    <input
                      type="text"
                      placeholder="Nhập 6 chữ số OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="otp-input"
                    />
                  </div>

                  <button
                    className="btn-pay"
                    onClick={handleOtpConfirm}
                    disabled={otp.length < 6 || processing}
                  >
                    {processing ? "Đang xác thực..." : "Xác nhận thanh toán"}
                  </button>
                  <button
                    className="btn-back"
                    onClick={() => setStep("form")}
                  >
                    ← Quay lại
                  </button>
                </div>
              )}

              {step === "success" && (
                <div className="success-mini">
                  <div className="success-check">✓</div>
                  <p>Thanh toán thành công! Đang chuyển hướng...</p>
                </div>
              )}
            </div>
          )}

          {/* International Card Tab */}
          {activeTab === "card" && (
            <div className="atm-panel">
              {step === "form" && (
                <>
                  <div className="card-brands">
                    {["VISA", "Mastercard", "JCB", "AMEX"].map((b) => (
                      <div key={b} className="card-brand-badge">{b}</div>
                    ))}
                  </div>
                  <div className="card-form">
                    <div className="cf-field">
                      <label>Số thẻ</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                          setCardNumber(raw.replace(/(.{4})/g, "$1 ").trim());
                        }}
                      />
                    </div>
                    <div className="cf-row">
                      <div className="cf-field">
                        <label>MM/YY</label>
                        <input type="text" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="cf-field">
                        <label>CVV</label>
                        <input type="password" placeholder="•••" maxLength={3} />
                      </div>
                    </div>
                    <div className="cf-field">
                      <label>Tên chủ thẻ</label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                  <button
                    className="btn-pay"
                    onClick={() => { if (cardNumber && cardName) setStep("otp"); }}
                    disabled={!cardNumber || !cardName}
                  >
                    Thanh toán {formatAmount(amount)}
                  </button>
                </>
              )}

              {step === "otp" && (
                <div className="otp-panel">
                  <div className="otp-icon">📲</div>
                  <h3>Xác thực 3D Secure</h3>
                  <p>Nhập mã OTP được gửi đến số điện thoại đăng ký với ngân hàng.</p>
                  <div className="cf-field">
                    <label>Mã OTP</label>
                    <input
                      type="text"
                      placeholder="Nhập 6 chữ số OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="otp-input"
                    />
                  </div>

                  <button
                    className="btn-pay"
                    onClick={handleOtpConfirm}
                    disabled={otp.length < 6 || processing}
                  >
                    {processing ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                  <button className="btn-back" onClick={() => setStep("form")}>← Quay lại</button>
                </div>
              )}

              {step === "success" && (
                <div className="success-mini">
                  <div className="success-check">✓</div>
                  <p>Thanh toán thành công! Đang chuyển hướng...</p>
                </div>
              )}
            </div>
          )}

          <div className="payment-footer">
            <span>🔒 Giao dịch được bảo mật bởi</span>
            <strong>VNPAY</strong>
            <span>SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockVnpayPage;

