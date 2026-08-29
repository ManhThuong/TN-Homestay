// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu" });
  }

  const admin = db.get("admins").find({ username }).value();
  if (!admin) {
    return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
  }

  const isValid = bcrypt.compareSync(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.json({
    token,
    admin: { id: admin.id, username: admin.username, name: admin.name },
  });
});

// GET /api/auth/me - kiểm tra token còn hợp lệ + lấy thông tin admin
router.get("/me", requireAuth, (req, res) => {
  const admin = db.get("admins").find({ id: req.admin.id }).value();
  if (!admin) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  res.json({ id: admin.id, username: admin.username, name: admin.name });
});

// PUT /api/auth/change-password
router.put("/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Thiếu mật khẩu hiện tại hoặc mật khẩu mới" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải từ 6 ký tự trở lên" });
  }

  const admin = db.get("admins").find({ id: req.admin.id }).value();
  const isValid = bcrypt.compareSync(currentPassword, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.get("admins").find({ id: req.admin.id }).assign({ passwordHash: newHash }).write();

  res.json({ message: "Đổi mật khẩu thành công" });
});

module.exports = router;
