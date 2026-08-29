import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { BACKEND_ORIGIN, getCurrentRoomPrice, getRoomThumbnail } from "../api";
import { useTheme } from "../context/ThemeContext";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1600&auto=format&fit=crop";

const highlights = [
  { icon: "🌿", title: "Không gian xanh mát", desc: "Giữa vườn cây, xa khói bụi phố thị" },
  { icon: "🍳", title: "Bữa sáng miễn phí", desc: "Món địa phương tươi ngon mỗi sáng" },
  { icon: "🛵", title: "Gần trung tâm", desc: "Chỉ 5 phút di chuyển đến các điểm tham quan" },
  { icon: "💬", title: "Hỗ trợ 24/7", desc: "Đội ngũ luôn sẵn sàng qua Hotline/Zalo" },
];

export default function Home() {
  const { settings } = useTheme();
  const [banners, setBanners] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get("/images", { params: { category: "banner" } }).then((res) => setBanners(res.data)).catch(() => {});
    api.get("/rooms").then((res) => setRooms(res.data.slice(0, 3))).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 4500);
    return () => clearInterval(id);
  }, [banners]);

  const bannerUrl =
    banners.length > 0 ? `${BACKEND_ORIGIN}${banners[current]?.url}` : FALLBACK_BANNER;

  return (
    <div>
      {/* Banner */}
      <section className="relative h-[60vh] sm:h-[75vh] w-full overflow-hidden">
        <img
          src={bannerUrl}
          alt={settings.siteName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 text-white">
          <p className="uppercase tracking-widest text-sm sm:text-base text-white/80 mb-3">
            Chào mừng đến với
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold mb-4 max-w-2xl">
            {settings.siteName}
          </h1>
          <p className="max-w-xl text-sm sm:text-base text-gray-100 mb-8">
            {settings.slogan ||
              "Không gian nghỉ dưỡng ấm cúng, gần gũi thiên nhiên, dành cho kỳ nghỉ trọn vẹn của bạn."}
          </p>
          <Link to="/dat-phong" className="btn-primary text-base px-8 py-3.5">
            Đặt phòng ngay
          </Link>
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Chuyển đến ảnh ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Giới thiệu ngắn */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark mb-4">
          Về {settings.siteName}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {settings.slogan ? `${settings.slogan}. ` : ""}
          Chúng tôi mang đến không gian nghỉ dưỡng ấm cúng, gần gũi thiên nhiên nhưng vẫn đầy
          đủ tiện nghi hiện đại. Đây là điểm dừng chân lý tưởng cho các cặp đôi, gia
          đình và nhóm bạn muốn tận hưởng kỳ nghỉ trọn vẹn.
        </p>
      </section>

      {/* Điểm nổi bật */}
      <section className="bg-brand-soft py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-serif font-bold text-center text-brand-dark mb-10">
            Điểm nổi bật
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="card p-6 text-center">
                <div className="text-3xl mb-3">{h.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{h.title}</h3>
                <p className="text-xs text-gray-500">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phòng tiêu biểu */}
      {rooms.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-serif font-bold text-center text-brand-dark mb-10">
            Phòng tiêu biểu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link
                to={`/phong/${room.slug}`}
                key={room.id}
                className="card overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="h-48 bg-brand-soft-2 overflow-hidden">
                  <img
                    src={getRoomThumbnail(room, FALLBACK_BANNER)}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{room.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Tối đa {room.maxAdults} người lớn{room.maxChildren ? `, ${room.maxChildren} trẻ em` : ""}
                  </p>
                  <p className="text-brand font-bold">
                    {room.salePrice && <del className="text-xs text-gray-400 font-normal mr-1">{room.price?.toLocaleString("vi-VN")}đ</del>}
                    Từ {getCurrentRoomPrice(room).toLocaleString("vi-VN")}đ / đêm
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/phong" className="btn-outline">Xem tất cả phòng</Link>
          </div>
        </section>
      )}

      {/* CTA cuối trang */}
      <section className="bg-brand-dark py-14 text-center px-4">
        <h2 className="text-2xl font-serif font-bold mb-3">Sẵn sàng cho kỳ nghỉ của bạn?</h2>
        <p className="mb-6 opacity-90">Đặt phòng ngay hôm nay để nhận ưu đãi tốt nhất.</p>
        <Link
          to="/dat-phong"
          className="inline-block bg-white text-brand-dark font-semibold px-8 py-3.5 rounded-lg hover:bg-brand-soft transition-colors"
        >
          Đặt phòng ngay
        </Link>
      </section>
    </div>
  );
}
