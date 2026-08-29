import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import api, { getCurrentRoomPrice, resolveImageUrl } from "../api";

registerLocale("vi", vi);

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop";

export default function RoomDetail() {
  const { slug } = useParams();
  const [room, setRoom] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/rooms/${slug}`)
      .then((res) => {
        setRoom(res.data);
        return api.get("/bookings/availability", { params: { roomId: res.data.id } });
      })
      .then((res) => {
        if (res) {
          const ranges = res.data.map((b) => ({
            start: new Date(b.checkIn),
            end: new Date(new Date(b.checkOut).getTime() - 86400000), // checkout không tính là ngày kín
          }));
          setBookedRanges(ranges);
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Không tìm thấy phòng này.</p>
        <Link to="/phong" className="btn-primary">Xem danh sách phòng</Link>
      </div>
    );
  }

  if (!room) {
    return <p className="text-center py-24 text-gray-400">Đang tải...</p>;
  }

  // Ảnh đại diện (nếu admin đã chọn) luôn hiện đầu tiên trong gallery
  const orderedImages = room.coverImage
    ? [room.coverImage, ...(room.images || []).filter((i) => i !== room.coverImage)]
    : room.images || [];
  const images = orderedImages.length ? orderedImages.map((i) => resolveImageUrl(i)) : [FALLBACK_IMG];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Gallery */}
      <div className="mb-8">
        <button type="button" onClick={() => setLightboxOpen(true)} className="room-detail-main-image h-64 sm:h-96 rounded-xl overflow-hidden bg-brand-soft-2" aria-label="Phóng to ảnh phòng">
          <img src={images[activeImg]} alt={room.name} className="w-full h-full object-cover" /><span>⌕ Phóng to ảnh</span>
        </button>
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                  i === activeImg ? "border-brand" : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Thông tin phòng */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 mb-3">
            {room.name}
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">{room.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-4">
              <p className="text-xs text-gray-400 mb-1">Sức chứa</p>
              <p className="font-semibold text-gray-700">
                👥 {room.maxAdults} người lớn{room.maxChildren ? ` + ${room.maxChildren} trẻ em` : ""}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-400 mb-1">Giá cuối tuần</p>
              <p className="font-semibold text-gray-700">
                {room.priceWeekend?.toLocaleString("vi-VN")}đ / đêm
              </p>
            </div>
            {room.area && (
              <div className="card p-4">
                <p className="text-xs text-gray-400 mb-1">Diện tích</p>
                <p className="font-semibold text-gray-700">📐 {room.area} m²</p>
              </div>
            )}
            {room.bedType && (
              <div className="card p-4">
                <p className="text-xs text-gray-400 mb-1">Loại giường</p>
                <p className="font-semibold text-gray-700">🛏️ {room.bedType}</p>
              </div>
            )}
            {room.view && (
              <div className="card p-4 col-span-2">
                <p className="text-xs text-gray-400 mb-1">Hướng nhìn</p>
                <p className="font-semibold text-gray-700">🌄 {room.view}</p>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-gray-800 mb-3">Tiện ích</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {(room.amenities || []).map((a) => (
              <span key={a} className="badge-brand">
                ✓ {a}
              </span>
            ))}
          </div>

          <h3 className="font-semibold text-gray-800 mb-3">Lịch trống tham khảo</h3>
          <div className="card p-4 inline-block datepicker-large">
            <DatePicker
              inline
              locale="vi"
              minDate={new Date()}
              excludeDateIntervals={bookedRanges}
              disabledKeyboardNavigation
            />
            <p className="text-xs text-gray-400 mt-2">Ngày gạch ngang là đã có khách đặt</p>
          </div>
        </div>

        {/* Sidebar giá + CTA */}
        <div>
          <div className="card p-6 sticky top-24">
            <p className="text-sm text-gray-400 mb-1">Giá chỉ từ</p>
            <p className="room-detail-price mb-4">
              {room.salePrice && <del>{room.price?.toLocaleString("vi-VN")}đ</del>}
              <b>{getCurrentRoomPrice(room).toLocaleString("vi-VN")}đ</b>
              <span className="text-sm font-normal text-gray-400"> / đêm</span>
            </p>
            <Link to={`/dat-phong?roomId=${room.id}`} className="btn-primary w-full">
              Đặt phòng này
            </Link>
            <p className="text-xs text-gray-400 text-center mt-3">
              Không mất phí đặt trước — chúng tôi sẽ gọi xác nhận trong 30 phút
            </p>
          </div>
        </div>
      </div>
      {lightboxOpen && <div className="room-lightbox" onClick={(event) => event.target === event.currentTarget && setLightboxOpen(false)} role="dialog" aria-modal="true"><button type="button" onClick={() => setLightboxOpen(false)} className="room-lightbox-close" aria-label="Đóng">×</button><button type="button" className="room-lightbox-image" onClick={() => setLightboxOpen(false)}><img src={images[activeImg]} alt={room.name} /></button><p>{activeImg + 1} / {images.length} · {room.name}</p></div>}
    </div>
  );
}
