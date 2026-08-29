// routes/bookings.js
const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Mã gửi cho khách: TNS + mã phòng + ngày check-in, ví dụ TNSR120260829.
// Phòng hiện chưa có trường code riêng nên dùng id phòng, chuẩn hóa room-1 thành R1.
function createBookingCode(roomId, checkIn) {
  const roomCode = String(roomId).replace(/^room-/i, "R").replace(/[^a-z0-9]/gi, "").toUpperCase();
  return `TNS${roomCode}${String(checkIn).replace(/-/g, "")}`;
}

// Kiểm tra 2 khoảng ngày có chồng lấn không
function isOverlapping(startA, endA, startB, endB) {
  return new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA);
}

// GET /api/bookings/availability?roomId=xxx
// Trả về danh sách các khoảng ngày đã được đặt (trạng thái confirmed/pending) để FE disable trên date picker
router.get("/availability", (req, res) => {
  const { roomId } = req.query;
  if (!roomId) return res.status(400).json({ message: "Thiếu roomId" });

  const bookings = db
    .get("bookings")
    .filter(
      (b) =>
        b.roomId === roomId && (b.status === "confirmed" || b.status === "pending")
    )
    .map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut }))
    .value();

  res.json(bookings);
});

// POST /api/bookings - khách đặt phòng (public)
router.post("/", (req, res) => {
  const {
    roomId,
    customerName,
    phone,
    email,
    checkIn,
    checkOut,
    adults,
    children,
    note,
  } = req.body;

  // Validate các trường bắt buộc
  const required = { roomId, customerName, phone, checkIn, checkOut };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    return res.status(400).json({
      message: `Thiếu thông tin bắt buộc: ${missing.join(", ")}`,
    });
  }

  if (new Date(checkIn) >= new Date(checkOut)) {
    return res
      .status(400)
      .json({ message: "Ngày trả phòng phải sau ngày nhận phòng" });
  }
  if (new Date(checkIn) < new Date(new Date().toDateString())) {
    return res.status(400).json({ message: "Ngày nhận phòng không được ở quá khứ" });
  }

  const room = db.get("rooms").find({ id: roomId }).value();
  if (!room) return res.status(404).json({ message: "Phòng không tồn tại" });

  // Kiểm tra trùng lịch
  const existingBookings = db
    .get("bookings")
    .filter(
      (b) =>
        b.roomId === roomId && (b.status === "confirmed" || b.status === "pending")
    )
    .value();

  const conflict = existingBookings.some((b) =>
    isOverlapping(checkIn, checkOut, b.checkIn, b.checkOut)
  );
  if (conflict) {
    return res.status(409).json({
      message: "Phòng đã có người đặt trong khoảng ngày này, vui lòng chọn ngày khác",
    });
  }

  const newBooking = {
    id: `bk-${nanoid(8)}`,
    bookingCode: createBookingCode(roomId, checkIn),
    roomId,
    roomName: room.name,
    customerName,
    phone,
    email: email || "",
    checkIn,
    checkOut,
    adults: Number(adults) || 1,
    children: Number(children) || 0,
    note: note || "",
    status: "pending", // pending | confirmed | cancelled
    createdAt: new Date().toISOString(),
  };

  db.get("bookings").push(newBooking).write();
  res.status(201).json({
    message: "Đặt phòng thành công! Chúng tôi sẽ liên hệ xác nhận sớm nhất.",
    booking: newBooking,
  });
});

// ---------- ADMIN ----------

// GET /api/bookings - danh sách tất cả booking (lọc theo status nếu có)
router.get("/", requireAuth, (req, res) => {
  const { status } = req.query;
  let query = db.get("bookings");
  if (status) query = query.filter({ status });
  const bookings = query.sortBy("createdAt").value().reverse();
  res.json(bookings);
});

// PUT /api/bookings/:id/status - đổi trạng thái (confirm/cancel)
router.put("/:id/status", requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "confirmed", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  const booking = db.get("bookings").find({ id: req.params.id });
  if (!booking.value()) return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng" });

  booking.assign({ status }).write();
  res.json(booking.value());
});

// DELETE /api/bookings/:id
router.delete("/:id", requireAuth, (req, res) => {
  const booking = db.get("bookings").find({ id: req.params.id }).value();
  if (!booking) return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng" });

  db.get("bookings").remove({ id: req.params.id }).write();
  res.json({ message: "Đã xóa đơn đặt phòng" });
});

// GET /api/bookings/stats/summary - thống kê nhanh cho dashboard
router.get("/stats/summary", requireAuth, (req, res) => {
  const bookings = db.get("bookings").value();
  const rooms = db.get("rooms").value();

  const now = new Date();
  const thisMonth = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  res.json({
    totalRooms: rooms.length,
    totalBookings: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    bookingsThisMonth: thisMonth.length,
  });
});

module.exports = router;
