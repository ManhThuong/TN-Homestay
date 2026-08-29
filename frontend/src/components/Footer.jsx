import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { BACKEND_ORIGIN } from "../api";

export default function Footer() {
  const { settings } = useTheme();
  const menu = (settings.menu || []).filter((m) => m.visible !== false);
  const logoSrc = settings.logoUrl ? `${BACKEND_ORIGIN}${settings.logoUrl}` : "/tay-nguyen-homestay-logo.png";
  const contact = settings.contact || {};

  return (
    <footer className="bg-brand-dark mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logoSrc} alt={settings.siteName} className="h-9 w-9 object-contain" />
            <h3 className="text-lg font-serif font-bold">{settings.siteName}</h3>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            {settings.slogan ||
              "Không gian nghỉ dưỡng ấm cúng giữa thiên nhiên, mang đến trải nghiệm thư giãn trọn vẹn cho bạn và gia đình."}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Liên kết nhanh</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {menu.map((link) => (
              <li key={link.id}>
                <Link to={link.path} className="hover:opacity-100 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
            <li><Link to="/admin/dang-nhap" className="hover:opacity-100 hover:underline">Quản trị viên</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Liên hệ</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>📍 {contact.address || "Chưa cập nhật địa chỉ"}</li>
            <li>📞 <a href={`tel:${contact.phone || ""}`} className="hover:opacity-100 hover:underline">{contact.phone || "Chưa cập nhật"}</a>{contact.zalo && " (Hotline / Zalo)"}</li>
            <li>✉️ {contact.email || "Chưa cập nhật"}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs opacity-70 py-4">
        © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
      </div>
    </footer>
  );
}
