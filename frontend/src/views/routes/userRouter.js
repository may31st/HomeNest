import { Routes, Route , Navigate, useLocation } from "react-router-dom";

import HomePage from "../pages/home/index.jsx";
import RoomListPage from "../pages/room-list/index.jsx";
import DetailRoom from "../pages/detailroom/index.jsx";
import Header from '../../components/header/index.jsx';
import Footer from '../../components/footer/index.jsx';
import Chat from '../../chat/index.js';
import PushInformationPage from '../pages/pushinformationpage/index.jsx';
import DashboardPage from '../pages/dashboard/index.jsx';
import DistanceSearchPage from '../pages/distance-search/index.jsx';
import NewsPage from '../pages/news/index.jsx';
import DepositPage from '../pages/deposit/index.jsx';
import PaymentSuccessPage from '../pages/payment-success/index.jsx';
import MockVnpayPage from '../pages/mock-payment/index.jsx';
import FavoritesPage from '../pages/favorites/index.jsx';
import ChatBotWidget from "../../components/chatbot/index.jsx";

function UserRoute() {
  const location = useLocation();
  const isDashboard = location.pathname.endsWith("/dashboard");
  const isMockPayment = location.pathname.endsWith("/mock-payment");

  return (
    <div>
      {!isDashboard && !isMockPayment && (
        <div>
          <Header />
        </div>
      )}
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/list" element={<RoomListPage />} />
          <Route path="/room-details/:id" element={<DetailRoom />} />
          <Route path="/deposit/:id" element={<DepositPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/mock-payment" element={<MockVnpayPage />} />
          <Route path="/chat" element={<Chat/>} />
          <Route path ="/push-information-page" element ={<PushInformationPage/>}/>
          <Route path="/distance-search" element={<DistanceSearchPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </div>
      {!isDashboard && !isMockPayment && (
        <div>
          <Footer />
        </div>
      )}
      <ChatBotWidget />
    </div>
  );
}

export default UserRoute;