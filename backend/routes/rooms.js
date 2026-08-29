// routes/rooms.js
const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function slugify(str) {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ---------- PUBLIC ----------

// GET /api/rooms - danh sách phòng (chỉ phòng active cho khách xem)
router.get("/", (req, res) => {
  const rooms = db.get("rooms").filter({ status: "active" }).value();
  res.json(rooms);
});

// GET /api/rooms/:slug - chi tiết 1 phòng theo slug
router.get("/:slug", (req, res) => {
  const room = db.get("rooms").find({ slug: req.params.slug }).value();
  if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
  res.json(room);
});

// ---------- ADMIN (cần đăng nhập) ----------

// GET /api/rooms/admin/all - lấy tất cả phòng kể cả ẩn (dùng cho trang quản lý)
router.get("/admin/all", requireAuth, (req, res) => {
  res.json(db.get("rooms").value());
});

// POST /api/rooms - tạo phòng mới
router.post("/", requireAuth, (req, res) => {
  const {
    name,
    description,
    price,
    salePrice,
    priceWeekend,
    maxAdults,
    maxChildren,
    amenities,
    status,
    area,
    bedType,
    view,
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Thiếu tên phòng hoặc giá phòng" });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  while (db.get("rooms").find({ slug }).value()) {
    slug = `${baseSlug}-${counter++}`;
  }

  const newRoom = {
    id: `room-${nanoid(8)}`,
    name,
    slug,
    description: description || "",
    price: Number(price),
    salePrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : null,
    priceWeekend: priceWeekend ? Number(priceWeekend) : Number(price),
    maxAdults: Number(maxAdults) || 2,
    maxChildren: Number(maxChildren) || 0,
    amenities: Array.isArray(amenities) ? amenities : [],
    area: area ? Number(area) : null,
    bedType: bedType || "",
    view: view || "",
    images: [],
    coverImage: "",
    status: status || "active",
    createdAt: new Date().toISOString(),
  };

  db.get("rooms").push(newRoom).write();
  res.status(201).json(newRoom);
});

// PUT /api/rooms/:id - cập nhật phòng
router.put("/:id", requireAuth, (req, res) => {
  const room = db.get("rooms").find({ id: req.params.id });
  if (!room.value()) return res.status(404).json({ message: "Không tìm thấy phòng" });

  const allowedFields = [
    "name",
    "description",
    "price",
    "salePrice",
    "priceWeekend",
    "maxAdults",
    "maxChildren",
    "amenities",
    "status",
    "coverImage",
    "area",
    "bedType",
    "view",
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  if (updates.area !== undefined) updates.area = updates.area ? Number(updates.area) : null;

  room.assign(updates).write();
  res.json(room.value());
});

// DELETE /api/rooms/:id
router.delete("/:id", requireAuth, (req, res) => {
  const room = db.get("rooms").find({ id: req.params.id }).value();
  if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });

  db.get("rooms").remove({ id: req.params.id }).write();
  res.json({ message: "Đã xóa phòng" });
});

module.exports = router;
