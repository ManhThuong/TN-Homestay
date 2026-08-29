import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Gắn token admin vào mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Nếu token hết hạn -> tự đăng xuất và về trang login admin
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith("/admin")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_info");
      window.location.href = "/admin/dang-nhap";
    }
    return Promise.reject(err);
  }
);

// URL gốc của backend (không có /api) - dùng để ghép với đường dẫn ảnh /uploads/...
export const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function resolveImageUrl(url, fallback = "") {
  if (!url) return fallback;
  return /^https?:\/\//i.test(url) ? url : `${BACKEND_ORIGIN}${url}`;
}

// Lấy ảnh đại diện của phòng: ưu tiên coverImage do admin chọn, nếu chưa có thì lấy ảnh đầu tiên
export function getRoomThumbnail(room, fallback) {
  const url = room?.coverImage || room?.images?.[0];
  return resolveImageUrl(url, fallback);
}

export function getCurrentRoomPrice(room) {
  return Number(room?.salePrice) > 0 && Number(room.salePrice) < Number(room.price)
    ? Number(room.salePrice)
    : Number(room?.price) || 0;
}

export default api;
