import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getCurrentRoomPrice, getRoomThumbnail } from "../api";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/rooms")
      .then((res) => setRooms(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">
          Danh sách phòng
        </h1>
        <p className="text-gray-500">Chọn phòng phù hợp cho kỳ nghỉ của bạn</p>
      </div>

      {loading && <p className="text-center text-gray-400">Đang tải danh sách phòng...</p>}

      {!loading && rooms.length === 0 && (
        <p className="text-center text-gray-400">Hiện chưa có phòng nào được đăng.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="room-list-card card overflow-hidden flex flex-col">
            <Link to={`/phong/${room.slug}`} className="room-list-image h-52 bg-brand-soft-2 overflow-hidden" aria-label={`Xem chi tiết ${room.name}`}>
              <img
                src={getRoomThumbnail(room, FALLBACK_IMG)}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              {room.salePrice && <span className="room-sale-badge">Ưu đãi</span>}<span className="room-image-overlay">Xem chi tiết <b>→</b></span>
            </Link>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{room.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{room.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {(room.amenities || []).slice(0, 3).map((a) => (
                  <span key={a} className="badge-brand !text-xs !px-2 !py-1">
                    {a}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-500 mb-1">
                👥 Tối đa {room.maxAdults} người lớn
                {room.maxChildren ? ` + ${room.maxChildren} trẻ em` : ""}
              </p>
              <p className="room-list-price mb-4">
                {room.salePrice && <del>{room.price?.toLocaleString("vi-VN")}đ</del>}
                <b>{getCurrentRoomPrice(room).toLocaleString("vi-VN")}đ</b> <span>/ đêm</span>
              </p>

              <div className="mt-auto flex gap-2">
                <Link to={`/phong/${room.slug}`} className="btn-outline flex-1 !py-2 text-sm">
                  Xem chi tiết
                </Link>
                <Link
                  to={`/dat-phong?roomId=${room.id}`}
                  className="btn-primary flex-1 !py-2 text-sm"
                >
                  Đặt ngay
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
