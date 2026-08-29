// routes/images.js
// Quản lý hình ảnh: banner trang chủ, gallery chung, và ảnh gắn với từng phòng.
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { nanoid } = require("nanoid");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${nanoid(6)}${ext}`);
  },
});

const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB / ảnh
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) {
      return cb(new Error("Chỉ chấp nhận file .jpg, .jpeg, .png, .webp"));
    }
    cb(null, true);
  },
});

// ---------- PUBLIC ----------

// GET /api/images?category=banner  (category: banner | gallery | highlight)
router.get("/", (req, res) => {
  const { category } = req.query;
  let query = db.get("images");
  if (category) query = query.filter({ category });
  const images = query.sortBy("order").value();
  res.json(images);
});

// ---------- ADMIN ----------

// POST /api/images/upload  (field name: "file", body: category)
// Upload ảnh chung (banner / gallery / highlight) - KHÔNG dùng cho ảnh phòng
router.post("/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file được tải lên" });

  const category = req.body.category || "gallery";
  const maxOrder = db
    .get("images")
    .filter({ category })
    .map("order")
    .value()
    .reduce((max, o) => Math.max(max, o || 0), 0);

  const newImage = {
    id: `img-${nanoid(8)}`,
    category, // banner | gallery | highlight
    url: `/uploads/${req.file.filename}`,
    altText: req.body.altText || "",
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  db.get("images").push(newImage).write();
  res.status(201).json(newImage);
});

// POST /api/images/upload-room/:roomId - upload ảnh gắn thẳng vào 1 phòng
router.post("/upload-room/:roomId", requireAuth, upload.single("file"), (req, res) => {
  const room = db.get("rooms").find({ id: req.params.roomId });
  if (!room.value()) return res.status(404).json({ message: "Không tìm thấy phòng" });
  if (!req.file) return res.status(400).json({ message: "Không có file được tải lên" });

  const imageUrl = `/uploads/${req.file.filename}`;
  const currentImages = room.value().images || [];
  const updates = { images: [...currentImages, imageUrl] };

  // Nếu phòng chưa có ảnh đại diện, tự động đặt ảnh đầu tiên làm ảnh đại diện
  if (!room.value().coverImage) {
    updates.coverImage = imageUrl;
  }

  room.assign(updates).write();
  res.status(201).json({ url: imageUrl, images: room.value().images, coverImage: room.value().coverImage });
});

// DELETE /api/images/room/:roomId - xóa 1 ảnh khỏi phòng (body: { url })
router.delete("/room/:roomId", requireAuth, (req, res) => {
  const { url } = req.body;
  const room = db.get("rooms").find({ id: req.params.roomId });
  if (!room.value()) return res.status(404).json({ message: "Không tìm thấy phòng" });

  const updatedImages = (room.value().images || []).filter((img) => img !== url);
  const updates = { images: updatedImages };

  // Nếu ảnh vừa xóa đang là ảnh đại diện, tự động gán lại ảnh khác (hoặc bỏ trống nếu hết ảnh)
  if (room.value().coverImage === url) {
    updates.coverImage = updatedImages[0] || "";
  }

  room.assign(updates).write();
  deletePhysicalFile(url);
  res.json({ images: room.value().images, coverImage: room.value().coverImage });
});

// PUT /api/images/room/:roomId/cover - đặt 1 ảnh làm ảnh đại diện phòng (body: { url })
router.put("/room/:roomId/cover", requireAuth, (req, res) => {
  const { url } = req.body;
  const room = db.get("rooms").find({ id: req.params.roomId });
  if (!room.value()) return res.status(404).json({ message: "Không tìm thấy phòng" });

  if (!(room.value().images || []).includes(url)) {
    return res.status(400).json({ message: "Ảnh này không thuộc phòng đã chọn" });
  }

  room.assign({ coverImage: url }).write();
  res.json({ coverImage: url });
});

// PUT /api/images/reorder - sắp xếp lại thứ tự ảnh trong 1 category (body: { ids: [...] theo thứ tự mới })
router.put("/reorder", requireAuth, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ message: "Thiếu danh sách ids" });

  ids.forEach((id, index) => {
    db.get("images").find({ id }).assign({ order: index + 1 }).write();
  });

  res.json({ message: "Đã cập nhật thứ tự" });
});

// DELETE /api/images/:id - xóa ảnh banner/gallery
router.delete("/:id", requireAuth, (req, res) => {
  const image = db.get("images").find({ id: req.params.id }).value();
  if (!image) return res.status(404).json({ message: "Không tìm thấy ảnh" });

  db.get("images").remove({ id: req.params.id }).write();
  deletePhysicalFile(image.url);

  res.json({ message: "Đã xóa ảnh" });
});

function deletePhysicalFile(url) {
  if (!url) return;
  const filename = path.basename(url);
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") console.error("Lỗi xóa file:", err.message);
  });
}

module.exports = router;
