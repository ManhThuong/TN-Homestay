import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api";

const ThemeContext = createContext(null);

const DEFAULT_SETTINGS = {
  siteName: "Tây Nguyên Homestay",
  slogan: "",
  logoUrl: "",
  primaryColor: "#31934a",
  contact: {
    address: "123 Đường Hoa Ban, TP. Buôn Ma Thuột, Đắk Lắk",
    phone: "0900000000",
    email: "contact@example.vn",
    zalo: "0900000000",
    mapUrl: "https://www.google.com/maps?q=Bu%C3%B4n+Ma+Thu%E1%BB%99t,+%C4%90%E1%BA%AFk+L%E1%BA%AFk&output=embed",
    directions: "Có chỗ đậu ô tô/xe máy miễn phí trong khuôn viên.",
  },
  menu: [
    { id: "menu-1", label: "Trang chủ", path: "/", visible: true },
    { id: "menu-2", label: "Danh sách phòng", path: "/phong", visible: true },
    { id: "menu-3", label: "Đặt phòng", path: "/dat-phong", visible: true },
    { id: "menu-4", label: "Liên hệ", path: "/lien-he", visible: true },
  ],
};

// Trộn 1 màu hex với trắng/đen theo tỉ lệ để tạo các sắc độ nhạt/đậm hơn
function mixHex(hex, targetRgb, ratio) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);

  const mix = (channel, target) => Math.round(channel + (target - channel) * ratio);

  const nr = mix(r, targetRgb[0]);
  const ng = mix(g, targetRgb[1]);
  const nb = mix(b, targetRgb[2]);

  return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function tint(hex, ratio) {
  return mixHex(hex, [255, 255, 255], ratio);
}
function shade(hex, ratio) {
  return mixHex(hex, [0, 0, 0], ratio);
}

// Tính độ sáng để quyết định chữ trắng hay chữ tối trên nền màu chủ đạo
function getContrastColor(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1f2937" : "#ffffff";
}

function isValidHex(hex) {
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex || "");
}

function applyColorVariables(primaryColor) {
  const base = isValidHex(primaryColor) ? primaryColor : DEFAULT_SETTINGS.primaryColor;
  const root = document.documentElement.style;

  root.setProperty("--color-primary", base);
  root.setProperty("--color-primary-hover", shade(base, 0.15));
  root.setProperty("--color-primary-dark", shade(base, 0.3));
  root.setProperty("--color-primary-darker", shade(base, 0.55));
  root.setProperty("--color-primary-soft", tint(base, 0.93));
  root.setProperty("--color-primary-soft-2", tint(base, 0.85));
  root.setProperty("--color-primary-contrast", getContrastColor(base));
}

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const loadSettings = useCallback(() => {
    return api
      .get("/settings")
      .then((res) => {
        const data = { ...DEFAULT_SETTINGS, ...res.data };
        setSettings(data);
        applyColorVariables(data.primaryColor);
        if (data.siteName) document.title = data.siteName;
        return data;
      })
      .catch(() => {
        applyColorVariables(DEFAULT_SETTINGS.primaryColor);
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <ThemeContext.Provider value={{ settings, loaded, refreshSettings: loadSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
