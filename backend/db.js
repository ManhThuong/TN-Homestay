// db.js
// Cơ sở dữ liệu đơn giản dùng file JSON (lowdb) - phù hợp cho homestay quy mô nhỏ.
// Nếu sau này cần mở rộng, có thể thay bằng MySQL/PostgreSQL mà không đổi cấu trúc route nhiều.

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const bcrypt = require("bcryptjs");

const adapter = new FileSync(path.join(__dirname, "data", "db.json"));
const db = low(adapter);

// Dữ liệu mặc định khi khởi tạo lần đầu
db.defaults({
  admins: [],
  rooms: [],
  bookings: [],
  images: [], // banner / gallery chung (ảnh phòng lưu trong rooms[].images)
  settings: null, // thông tin thương hiệu + menu website, khởi tạo bên dưới
}).write();

// Tạo tài khoản admin mặc định nếu chưa có admin nào
function ensureDefaultAdmin() {
  const hasAdmin = db.get("admins").size().value() > 0;
  if (!hasAdmin) {
    const passwordHash = bcrypt.hashSync("admin123", 10);
    db.get("admins")
      .push({
        id: "admin-1",
        username: "admin",
        passwordHash,
        name: "Quản trị viên",
        createdAt: new Date().toISOString(),
      })
      .write();
    console.log(
      "[seed] Đã tạo tài khoản admin mặc định -> username: admin | password: admin123"
    );
  }
}

// Seed vài phòng mẫu nếu DB rỗng, để bạn xem giao diện có dữ liệu ngay
function ensureSampleRooms() {
  const hasRooms = db.get("rooms").size().value() > 0;
  if (hasRooms) return;
  const photos = {
    garden: ["photo-1611892440504-42a792e24d32", "photo-1600210492486-724fe5c67fb0", "photo-1600566753190-17f0baa2a6c3", "photo-1600607687939-ce8a6c25118c", "photo-1615874694520-474822394e73"],
    mountain: ["photo-1540518614846-7eded433c457", "photo-1616486338812-3dadae4b4ace", "photo-1590490360182-c33d57733427", "photo-1595576508898-0ad5c879a061", "photo-1618221195710-dd6b41faaea6"],
    family: ["photo-1522708323590-d24dbb6b0267", "photo-1566665797739-1674de7a421a", "photo-1600585154340-be6161a56a0c", "photo-1600585154526-990dced4db0d", "photo-1600607688969-a5bfcd646154"],
  };
  const imageUrls = (group) => photos[group].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`);
  const createdAt = new Date().toISOString();
  const samples = [
    { id: "room-1", name: "Garden Retreat", slug: "garden-retreat", description: "Không gian ấm cúng hướng vườn xanh, lý tưởng cho cặp đôi tìm một kỳ nghỉ thật yên tĩnh.", price: 650000, salePrice: 520000, priceWeekend: 750000, maxAdults: 2, maxChildren: 1, area: 28, bedType: "01 giường Queen", view: "Vườn nhiệt đới", amenities: ["Điều hòa", "Wifi tốc độ cao", "Bồn tắm", "Ban công riêng", "Bữa sáng"], images: imageUrls("garden") },
    { id: "room-2", name: "Mountain View Suite", slug: "mountain-view-suite", description: "Suite rộng rãi với cửa kính lớn đón bình minh và tầm nhìn thoáng đãng về phía núi rừng.", price: 980000, salePrice: 790000, priceWeekend: 1150000, maxAdults: 3, maxChildren: 1, area: 42, bedType: "01 King + sofa bed", view: "Núi rừng", amenities: ["Điều hòa", "Wifi tốc độ cao", "Bồn tắm", "Minibar", "Bữa sáng"], images: imageUrls("mountain") },
    { id: "room-3", name: "Family Nest", slug: "family-nest", description: "Căn phòng gia đình thoải mái, nhiều ánh sáng, phù hợp cho cả nhà cùng tận hưởng những ngày quây quần.", price: 1250000, salePrice: null, priceWeekend: 1450000, maxAdults: 4, maxChildren: 2, area: 55, bedType: "02 giường Queen", view: "Sân vườn", amenities: ["Điều hòa", "Wifi tốc độ cao", "Bếp mini", "Máy giặt", "Bữa sáng"], images: imageUrls("family") },
  ].map((room) => ({ ...room, coverImage: room.images[0], status: "active", createdAt }));
  db.get("rooms").push(...samples).write();
}

// Cấu hình thương hiệu + menu mặc định (tên homestay, slogan, logo, màu chủ đạo, menu điều hướng)
function ensureDefaultSettings() {
  const hasSettings = !!db.get("settings").value();
  if (!hasSettings) {
    db.set("settings", {
      siteName: "Tây Nguyên Homestay",
      slogan: "Trốn phố ồn ào, tìm về không gian yên bình",
      logoUrl: "",
      primaryColor: "#31934a",
      contact: {
        address: "123 Đường Hoa Ban, TP. Buôn Ma Thuột, Đắk Lắk",
        phone: "0900000000",
        email: "contact@example.vn",
        zalo: "0900000000",
        mapUrl: "https://www.google.com/maps?q=Bu%C3%B4n+Ma+Thu%E1%BB%99t,+%C4%90%E1%BA%AFk+L%E1%BA%AFk&output=embed",
        directions: "Có chỗ đậu ô tô/xe máy miễn phí trong khuôn viên.",
      },
      menu: [
        { id: "menu-1", label: "Trang chủ", path: "/", visible: true },
        { id: "menu-2", label: "Danh sách phòng", path: "/phong", visible: true },
        { id: "menu-3", label: "Đặt phòng", path: "/dat-phong", visible: true },
        { id: "menu-4", label: "Liên hệ", path: "/lien-he", visible: true },
      ],
    }).write();
  }
}

ensureDefaultAdmin();
ensureSampleRooms();
ensureDefaultSettings();

module.exports = db;
