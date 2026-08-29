import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { BACKEND_ORIGIN } from "../../api";

const menu = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/dat-phong", label: "Quản lý đặt phòng", icon: "🗓️" },
  { to: "/admin/phong", label: "Quản lý phòng", icon: "🛏️" },
  { to: "/admin/hinh-anh", label: "Quản lý hình ảnh", icon: "🖼️" },
  { to: "/admin/giao-dien", label: "Cài đặt giao diện", icon: "🎨" },
  { to: "/admin/cai-dat", label: "Cài đặt tài khoản", icon: "⚙️" },
];

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { admin, logout } = useAuth();
  const { settings } = useTheme();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Overlay mobile khi mở drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full w-64 text-white shadow-xl shadow-black/10
          transform transition-transform duration-200
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="absolute inset-0 bg-brand-dark -z-10" />
        <div className="px-5 h-20 flex items-center gap-2 border-b border-white/10">
          <Link to="/" className="font-serif font-bold text-lg flex items-center gap-2 min-w-0">
            {settings.logoUrl ? (
              <img
                src={`${BACKEND_ORIGIN}${settings.logoUrl}`}
                alt={settings.siteName}
                className="h-8 w-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <span className="w-9 h-9 rounded-xl bg-white/10 grid place-items-center">🏡</span>
            )}
            <span className="truncate">{settings.siteName} Admin</span>
          </Link>
        </div>
        <p className="px-5 pt-6 pb-2 text-[10px] font-bold tracking-[.16em] text-white/45">QUẢN TRỊ HOMESTAY</p>
        <nav className="px-3 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-white text-brand-dark font-semibold shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 sm:px-7 sticky top-0 z-20">
          <button
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setDrawerOpen(true)}
            aria-label="Mở menu quản trị"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Xin chào, <b>{admin?.name || admin?.username}</b>
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg px-3 py-1.5"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-7 max-w-[1600px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
