import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    api.get("/bookings/stats/summary").then((res) => setStats(res.data));
    api.get("/bookings").then((res) => setRecentBookings(res.data.slice(0, 5)));
  }, []);

  const cards = stats
    ? [
        { label: "Tổng số phòng", value: stats.totalRooms, icon: "🛏️", color: "bg-blue-50 text-blue-700" },
        { label: "Tổng đơn đặt phòng", value: stats.totalBookings, icon: "🗓️", color: "bg-brand-soft text-brand-dark" },
        { label: "Chờ xác nhận", value: stats.pending, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
        { label: "Đã xác nhận", value: stats.confirmed, icon: "✅", color: "bg-green-50 text-green-700" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Đặt phòng gần đây</h2>
          <Link to="/admin/dat-phong" className="text-sm text-brand font-medium">
            Xem tất cả →
          </Link>
        </div>

        {recentBookings.length === 0 && (
          <p className="text-sm text-gray-400">Chưa có đơn đặt phòng nào.</p>
        )}

        <div className="space-y-3">
          {recentBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
              <div>
                <p className="font-medium text-gray-700 text-sm">{b.customerName} — {b.roomName}</p>
                <p className="text-xs text-gray-400">{b.checkIn} → {b.checkOut}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: { label: "Chờ xác nhận", cls: "bg-yellow-50 text-yellow-700" },
    confirmed: { label: "Đã xác nhận", cls: "bg-green-50 text-green-700" },
    cancelled: { label: "Đã hủy", cls: "bg-red-50 text-red-700" },
  };
  const s = map[status] || map.pending;
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}
