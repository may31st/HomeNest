import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Result, Card, Descriptions, Tag, Spin } from "antd";
import { CheckCircleFilled, CloseCircleFilled, DashboardOutlined, HomeOutlined } from "@ant-design/icons";
import axios from "axios";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deposit, setDeposit] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Parse query params
  const query = new URLSearchParams(location.search);
  const status = query.get("status");
  const depositId = query.get("deposit_id");
  const method = query.get("method");

  useEffect(() => {
    if (status === "success" && depositId) {
      // Fetch details of deposit log to render nicely
      const fetchDepositDetails = async () => {
        try {
          // We can fetch deposits using our API
          const authData = sessionStorage.getItem("auth");
          if (!authData) return;
          const user = JSON.parse(authData);

          const res = await axios.get(`http://localhost:8000/api/v1/payment/deposits?email=${user.email}`);
          if (res.data && res.data.success) {
            const found = res.data.deposits.find(d => String(d.id) === String(depositId));
            if (found) {
              setDeposit(found);
            }
          }
        } catch (error) {
          console.error("Failed to fetch success deposit details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDepositDetails();
    } else {
      setLoading(false);
    }
  }, [status, depositId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", flexDirection: "column", gap: 15 }}>
        <Spin size="large" />
        <p style={{ color: "#64748b" }}>Đang đối soát thông tin giao dịch...</p>
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div style={{ background: "#f8fafc", minHeight: "90vh", padding: "60px 20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card 
        style={{ 
          maxWidth: 600, 
          width: "100%", 
          borderRadius: 20, 
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0"
        }}
      >
        {isSuccess ? (
          <div>
            <Result
              icon={<CheckCircleFilled style={{ color: "#2e7d32", fontSize: 72 }} />}
              status="success"
              title={<span style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>Thanh toán đặt cọc thành công!</span>}
              subTitle="Giao dịch của bạn đã được ghi nhận trên hệ thống."
            />

            {deposit && (
              <Descriptions 
                bordered 
                column={1} 
                size="small" 
                style={{ marginTop: 10, marginBottom: 25 }}
                labelStyle={{ fontWeight: 600, color: "#475569", width: "40%" }}
                contentStyle={{ color: "#1e293b" }}
              >
                <Descriptions.Item label="Mã đặt cọc">
                  <span style={{ fontFamily: "monospace", fontWeight: 700 }}>DEP-{deposit.id}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Phòng trọ">
                  {deposit.Room?.room_name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền cọc">
                  <span style={{ color: "#2e7d32", fontWeight: 700 }}>
                    {deposit.amount.toLocaleString("vi-VN")} VND
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Cổng thanh toán">
                  <Tag color="blue">{deposit.payment_method?.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái phê duyệt">
                  <Tag color="orange">Đang chờ chủ trọ duyệt</Tag>
                </Descriptions.Item>
              </Descriptions>
            )}

            <div style={{ background: "#f1fbf2", border: "1px solid #c8e6c9", borderRadius: 12, padding: 15, marginBottom: 30 }}>
              <p style={{ margin: 0, color: "#2e7d32", fontSize: 13, lineHeight: "1.6" }}>
                💡 <strong>Lưu ý:</strong> Yêu cầu đặt cọc đã được chuyển đến chủ nhà. Sau khi chủ nhà nhấn nút <strong>Đồng ý</strong>, hệ thống sẽ tự động lập <strong>Mẫu hợp đồng thuê nhà điện tử</strong> dựa trên thông tin CMND/CCCD bạn đã cung cấp để 2 bên ký trực tuyến.
              </p>
            </div>

            <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
              <Button 
                type="primary" 
                icon={<DashboardOutlined />}
                onClick={() => navigate("/user/dashboard", { state: { tab: "hop_dong" } })}
                style={{ height: 44, borderRadius: 10, backgroundColor: "#2e7d32", borderColor: "#2e7d32", fontWeight: 600 }}
              >
                Vào quản lý hợp đồng
              </Button>
              <Button 
                icon={<HomeOutlined />}
                onClick={() => navigate("/user/home")}
                style={{ height: 44, borderRadius: 10, fontWeight: 600 }}
              >
                Trang chủ
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Result
              icon={<CloseCircleFilled style={{ color: "#ef4444", fontSize: 72 }} />}
              status="error"
              title={<span style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>Thanh toán thất bại</span>}
              subTitle="Giao dịch đặt cọc giữ chỗ không thể hoàn tất."
            />

            <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 12, padding: 15, marginBottom: 30 }}>
              <p style={{ margin: 0, color: "#b91c1c", fontSize: 14, textAlign: "center" }}>
                Tài khoản của bạn chưa bị trừ tiền. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại bằng phương thức thanh toán khác.
              </p>
            </div>

            <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
              <Button 
                type="primary" 
                danger
                onClick={() => navigate("/user/home")}
                style={{ height: 44, borderRadius: 10, fontWeight: 600 }}
              >
                Quay lại Trang chủ
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
