import React, { useState, useEffect } from "react";
import "./index.css";
import { EnvironmentOutlined, ClockCircleOutlined, UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import coursImage from "../../../assets/images/cours.jpg";

const ARTICLES = [
  {
    id: 1,
    title: "Giá chung cư Hà Nội sau Tết nguyên đán",
    summary: "Giá bán và thuê chung cư tại khu vực Hà Nội đồng loạt tăng mạnh ngay sau dịp Tết Nguyên Đán do nhu cầu tăng cao và nguồn cung khan hiếm.",
    author: "HOMENEST Analytics",
    date: "2 ngày trước",
    image: coursImage,
    content: [
      "Ngay sau kỳ nghỉ Tết Nguyên Đán, thị trường bất động sản căn hộ chung cư tại Hà Nội ghi nhận mức độ quan tâm tăng vọt. Theo khảo sát từ HOMENEST, lượng tin đăng tìm kiếm và giao dịch thuê căn hộ đã tăng hơn 35% so với thời điểm trước Tết. Mức giá thuê căn hộ trung cấp dao động từ 10 - 15 triệu đồng/tháng đã nhanh chóng bị lấp đầy, đặc biệt là các quận nội thành như Cầu Giấy, Thanh Xuân, Đống Đa và Nam Từ Liêm.",
      "Lý giải cho hiện tượng tăng trưởng mạnh mẽ này, các chuyên gia nhận định nguồn cung căn hộ mới tại Hà Nội trong 2 năm trở lại đây vô cùng hạn chế do các vướng mắc về pháp lý. Trong khi đó, dòng người quay trở lại thủ đô học tập và làm việc sau Tết tăng đột biến tạo áp lực cực lớn lên thị trường cho thuê. Đặc biệt, phân khúc chung cư mini và căn hộ dịch vụ giá rẻ dưới 6 triệu đồng luôn trong tình trạng 'cháy hàng'.",
      "Lời khuyên từ HOMENEST dành cho khách thuê nhà trong thời điểm này: Bạn nên lên kế hoạch tìm phòng trước ít nhất 2 tuần, tận dụng các công cụ tìm kiếm theo bán kính để tìm kiếm các khu vực lân cận trung tâm nhằm tối ưu chi phí. Đừng ngần ngại đặt cọc nhanh chóng khi tìm thấy căn phòng ưng ý và đảm bảo hợp đồng thuê có điều khoản cam kết giữ giá rõ ràng trong thời gian tối thiểu 1 năm."
    ]
  },
  {
    id: 2,
    title: "Xu hướng thuê chung cư mini 2026",
    summary: "Phân tích xu hướng lựa chọn chung cư mini của giới trẻ và các tiêu chuẩn sống mới trong năm 2026.",
    author: "HOMENEST Market Report",
    date: "3 ngày trước",
    image: coursImage,
    content: [
      "Thị trường mua bán và cho thuê căn hộ chung cư sau Tết Nguyên Đán đang bước vào giai đoạn thiết lập mặt bằng giá mới. Giá trị thực tế của các căn hộ chung cư không chỉ dừng lại ở giá bán mà nằm ở tỷ suất lợi nhuận cho thuê ổn định hàng tháng (đạt mức từ 5.5% đến 6.8%/năm) - một kênh giữ tiền cực kỳ an toàn trong bối cảnh các kênh đầu tư khác biến động.",
      "Đối với phân khúc chung cư mini và phòng trọ phổ thông, giá trị gia tăng dịch vụ đi kèm như hệ thống phòng cháy chữa cháy tự động, khóa vân tay an ninh và quản lý vận hành chuyên nghiệp chính là yếu tố then chốt giúp các chủ nhà duy trì tỷ lệ lấp đầy phòng lên đến 98%. Người đi thuê hiện nay sẵn sàng chi trả thêm từ 500.000 đến 1.000.000 đồng mỗi tháng để đổi lấy môi trường sống an toàn và văn minh hơn.",
      "Dự báo trong quý II/2026, giá trị chung cư và căn hộ cho thuê tại các đô thị lớn như Hà Nội và TP.HCM sẽ tiếp tục giữ vững đà tăng nhẹ từ 3 - 5%. Việc chủ động nắm bắt xu hướng thị trường và lựa chọn các đơn vị môi giới/quản lý vận hành uy tín sẽ giúp cả người cho thuê lẫn người đi thuê đạt được thỏa thuận tối ưu nhất."
    ]
  },
  {
    id: 3,
    title: "Kinh nghiệm tìm phòng trọ giá rẻ",
    summary: "Những bí quyết thực tế giúp sinh viên và người đi làm tìm kiếm phòng trọ giá rẻ, an toàn và tối ưu chi phí sinh hoạt.",
    author: "HOMENEST Advisor",
    date: "5 ngày trước",
    image: coursImage,
    content: [
      "Tìm kiếm một phòng trọ giá rẻ nhưng vẫn đảm bảo chất lượng cuộc sống luôn là một bài toán nan giải đối với các bạn sinh viên và người mới đi làm. Để tìm được phòng ưng ý, bước đầu tiên và quan trọng nhất là bạn cần khảo sát kỹ lưỡng giá cả khu vực xung quanh và tận dụng các ứng dụng tìm kiếm phòng trực quan.",
      "Thứ hai, bạn nên chú ý đến chi phí dịch vụ đi kèm như tiền điện, tiền nước, phí dịch vụ vệ sinh và internet. Đôi khi tiền phòng rẻ nhưng chi phí phụ thu lại quá cao khiến tổng chi phí hàng tháng vượt quá ngân sách. Hãy luôn hỏi rõ và thương lượng chi tiết các khoản phí này trước khi đặt bút ký hợp đồng.",
      "Cuối cùng, hãy kiểm tra kỹ hệ thống an ninh, phòng cháy chữa cháy và các tiện ích xung quanh phòng trọ. Việc lựa chọn một nơi ở an toàn, gần các tuyến xe buýt hoặc ga tàu điện sẽ giúp bạn tiết kiệm được rất nhiều thời gian di chuyển và an tâm hơn trong sinh hoạt hàng ngày."
    ]
  }
];

const NewsPage = () => {
  const location = useLocation();
  const articleId = location.state?.articleId;
  const [activeArticle, setActiveArticle] = useState(ARTICLES[0]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (articleId) {
      const selected = ARTICLES.find(a => a.id === articleId);
      if (selected) {
        setActiveArticle(selected);
      }
    } else {
      setActiveArticle(ARTICLES[0]);
    }
  }, [articleId]);

  return (
    <div className="news-page-container">
      {/* Breadcrumb / Back button */}
      <div className="news-breadcrumb">
        <Link to="/user/home" className="back-link">
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Quay lại Trang chủ
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="news-grid">
        {/* Left column: Active article details */}
        <div className="news-main-content">
          <article className="main-article">
            <h1 className="article-title">{activeArticle.title}</h1>

            <div className="article-meta">
              <span>
                <UserOutlined style={{ marginRight: 6 }} /> {activeArticle.author}
              </span>
              <span>
                <ClockCircleOutlined style={{ marginRight: 6 }} /> {activeArticle.date}
              </span>
            </div>

            <div className="article-image-wrapper">
              <img src={activeArticle.image} alt={activeArticle.title} className="article-large-image" />
            </div>

            <div className="article-body">
              <p className="article-summary">{activeArticle.summary}</p>
              {activeArticle.content.map((paragraph, index) => (
                <p key={index} className="article-paragraph">{paragraph}</p>
              ))}
            </div>
          </article>
        </div>

        {/* Right column: Related news articles */}
        <div className="news-sidebar">
          <h2 className="sidebar-title">Các tin tức liên quan</h2>
          <div className="related-articles-list">
            {ARTICLES.map((article) => (
              <div
                key={article.id}
                className={`sidebar-article-card ${activeArticle.id === article.id ? "active" : ""}`}
                onClick={() => {
                  setActiveArticle(article);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div className="sidebar-card-image-box">
                  <img src={article.image} alt={article.title} />
                </div>
                <div className="sidebar-card-info">
                  <h3 className="sidebar-card-title">{article.title}</h3>
                  <div className="sidebar-card-meta">
                    <ClockCircleOutlined style={{ marginRight: 4 }} /> {article.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Real Estate Tips Card */}
          <div className="quick-tips-card">
            <h3>💡 Mẹo từ HOMENEST</h3>
            <p>
              Sử dụng tính năng <strong>Tìm kiếm theo bán kính</strong> tại thanh Header để quét tìm tất cả phòng trọ xung quanh trường học hoặc nơi làm việc của bạn trong phạm vi từ 1km đến 5km một cách nhanh chóng nhất!
            </p>
            <Link to="/user/distance-search" className="tips-cta-btn">
              Trải nghiệm ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
