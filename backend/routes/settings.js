// routes/settings.js
// Quản lý cấu hình thương hiệu website: tên homestay, slogan, logo, màu chủ đạo, menu điều hướng.
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
    cb(null, `logo-${Date.now()}-${nanoid(6)}${ext}`);
  },
});

const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB cho logo
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) {
      return cb(new Error("Chỉ chấp nhận file .jpg, .jpeg, .png, .webp, .svg"));
    }
    cb(null, true);
  },
});

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

// GET /api/settings - public, FE dùng để hiển thị tên/logo/màu/menu
router.get("/", (req, res) => {
  res.json(db.get("settings").value());
});

// PUT /api/settings - cập nhật tên, slogan, màu chủ đạo, danh sách menu
router.put("/", requireAuth, (req, res) => {
  const { siteName, slogan, primaryColor, menu, contact } = req.body;
  const updates = {};

  if (siteName !== undefined) {
    if (!siteName.trim()) {
      return res.status(400).json({ message: "Tên homestay không được để trống" });
    }
    updates.siteName = siteName.trim();
  }

  if (slogan !== undefined) updates.slogan = slogan.trim();

  if (primaryColor !== undefined) {
    if (!HEX_COLOR_REGEX.test(primaryColor)) {
      return res.status(400).json({ message: "Mã màu không hợp lệ, phải dạng #RRGGBB" });
    }
    updates.primaryColor = primaryColor;
  }

  if (menu !== undefined) {
    if (!Array.isArray(menu) || menu.length === 0) {
      return res.status(400).json({ message: "Menu phải có ít nhất 1 mục" });
    }
    const invalid = menu.some((m) => !m.label?.trim() || !m.path?.trim());
    if (invalid) {
      return res.status(400).json({ message: "Mỗi mục menu cần có tên và đường dẫn" });
    }
    updates.menu = menu.map((m) => ({
      id: m.id || `menu-${nanoid(6)}`,
      label: m.label.trim(),
      path: m.path.trim().startsWith("/") ? m.path.trim() : `/${m.path.trim()}`,
      visible: m.visible !== false,
    }));
  }

  if (contact !== undefined) {
    if (typeof contact !== "object" || Array.isArray(contact)) {
      return res.status(400).json({ message: "Thông tin liên hệ không hợp lệ" });
    }
    const fields = ["address", "phone", "email", "zalo", "mapUrl", "directions"];
    updates.contact = fields.reduce((result, field) => {
      if (contact[field] !== undefined) result[field] = String(contact[field]).trim();
      return result;
    }, {});
  }

  const current = db.get("settings").value();
  if (updates.contact) updates.contact = { ...(current.contact || {}), ...updates.contact };
  db.set("settings", { ...current, ...updates }).write();
  res.json(db.get("settings").value());
});

// POST /api/settings/logo - upload logo mới (thay logo cũ)
router.post("/logo", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file được tải lên" });

  const current = db.get("settings").value();
  const oldLogoUrl = current.logoUrl;

  const newLogoUrl = `/uploads/${req.file.filename}`;
  db.set("settings", { ...current, logoUrl: newLogoUrl }).write();

  // Xóa file logo cũ nếu có
  if (oldLogoUrl) {
    const oldPath = path.join(UPLOAD_DIR, path.basename(oldLogoUrl));
    fs.unlink(oldPath, (err) => {
      if (err && err.code !== "ENOENT") console.error("Lỗi xóa logo cũ:", err.message);
    });
  }

  res.status(201).json({ logoUrl: newLogoUrl });
});

// DELETE /api/settings/logo - gỡ logo, quay về hiển thị tên chữ
router.delete("/logo", requireAuth, (req, res) => {
  const current = db.get("settings").value();
  if (current.logoUrl) {
    const oldPath = path.join(UPLOAD_DIR, path.basename(current.logoUrl));
    fs.unlink(oldPath, (err) => {
      if (err && err.code !== "ENOENT") console.error("Lỗi xóa logo:", err.message);
    });
  }
  db.set("settings", { ...current, logoUrl: "" }).write();
  res.json({ message: "Đã gỡ logo" });
});

module.exports = router;
