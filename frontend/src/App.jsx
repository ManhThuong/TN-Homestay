import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import RoomList from "./pages/RoomList";
import RoomDetail from "./pages/RoomDetail";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BookingsManager from "./pages/admin/BookingsManager";
import RoomsManager from "./pages/admin/RoomsManager";
import ImagesManager from "./pages/admin/ImagesManager";
import BrandingSettings from "./pages/admin/BrandingSettings";
import Settings from "./pages/admin/Settings";

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ---------- Khu vực công khai ---------- */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/phong" element={<PublicLayout><RoomList /></PublicLayout>} />
      <Route path="/phong/:slug" element={<PublicLayout><RoomDetail /></PublicLayout>} />
      <Route path="/dat-phong" element={<PublicLayout><Booking /></PublicLayout>} />
      <Route path="/lien-he" element={<PublicLayout><Contact /></PublicLayout>} />

      {/* ---------- Đăng nhập quản trị ---------- */}
      <Route path="/admin/dang-nhap" element={<AdminLogin />} />

      {/* ---------- Khu vực quản trị (yêu cầu đăng nhập) ---------- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dat-phong" element={<BookingsManager />} />
        <Route path="phong" element={<RoomsManager />} />
        <Route path="hinh-anh" element={<ImagesManager />} />
        <Route path="giao-dien" element={<BrandingSettings />} />
        <Route path="cai-dat" element={<Settings />} />
      </Route>

      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
}
