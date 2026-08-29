import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { BACKEND_ORIGIN } from "../api";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { settings } = useTheme();
  const menu = (settings.menu || []).filter((m) => m.visible !== false);
  const logoSrc = settings.logoUrl ? `${BACKEND_ORIGIN}${settings.logoUrl}` : "/tay-nguyen-homestay-logo.png";

  return (
    <header className="site-navbar sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[4.75rem]">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <img src={logoSrc} alt={settings.siteName} className="h-11 w-11 object-contain" />
          <span className="text-xl sm:text-2xl font-serif font-bold text-brand-dark truncate">
            {settings.siteName}
          </span>
        </Link>

        {/* Menu desktop */}
        <ul className="hidden md:flex items-center gap-2 site-navbar-links">
          {menu.map((link) => (
            <li key={link.id}>
              <NavLink
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  isActive ? "site-navbar-link site-navbar-link-active" : "site-navbar-link"
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link to="/dat-phong" className="hidden lg:!inline-block btn-primary !py-2.5 !px-5 text-sm shadow-md">
          Đặt phòng ngay
        </Link>

        {/* Nút hamburger - mobile */}
        <button
          className="md:hidden p-2 text-gray-700"
          aria-label="Mở menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Menu drawer - mobile */}
      {open && (
        <div className="md:hidden site-mobile-menu">
          <ul className="flex flex-col px-4 py-3 gap-1">
            {menu.map((link) => (
              <li key={link.id}>
                <NavLink
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block py-3 px-2 rounded-lg text-base ${
                      isActive ? "text-brand font-semibold bg-brand-soft" : "text-gray-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
