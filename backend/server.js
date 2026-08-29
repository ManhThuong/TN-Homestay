// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const bookingRoutes = require("./routes/bookings");
const imageRoutes = require("./routes/images");
const settingsRoutes = require("./routes/settings");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// Cho phép truy cập ảnh đã upload qua URL tĩnh, VD: http://localhost:4000/uploads/xxx.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Xử lý lỗi upload (VD: quá dung lượng, sai định dạng)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("Chỉ chấp nhận")) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: "Đã có lỗi xảy ra ở server" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend homestay đang chạy tại http://localhost:${PORT}`);
});
