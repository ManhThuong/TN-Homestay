# 🏡 Website Booking Homestay

Website đặt phòng homestay đầy đủ: trang công khai cho khách (trang chủ, danh sách/chi tiết
phòng, form đặt phòng, liên hệ & bản đồ) và khu vực quản trị có đăng nhập để quản lý phòng,
đơn đặt phòng và hình ảnh (banner, gallery, ảnh phòng). Giao diện responsive cho mobile/tablet/desktop.

## Công nghệ sử dụng

- **Frontend**: React 18 + Vite + TailwindCSS + React Router + react-datepicker
- **Backend**: Node.js + Express + JSON file database (lowdb) — không cần cài đặt MySQL/PostgreSQL
- **Xác thực**: JWT (JSON Web Token) cho khu vực quản trị
- **Upload ảnh**: Multer, lưu ảnh trực tiếp trên server (thư mục `backend/uploads`)

## Cấu trúc thư mục

```
homestay-booking/
├── backend/                   # API server
│   ├── data/db.json           # "Database" dạng file JSON (tự tạo khi chạy lần đầu)
│   ├── uploads/                # Ảnh đã upload (banner, gallery, ảnh phòng)
│   ├── middleware/auth.js      # Kiểm tra JWT token
│   ├── routes/
│   │   ├── auth.js             # Đăng nhập, đổi mật khẩu
│   │   ├── rooms.js            # CRUD phòng
│   │   ├── bookings.js         # Đặt phòng, xác nhận/hủy, thống kê
│   │   └── images.js           # Upload/xóa/sắp xếp ảnh
│   ├── db.js                    # Khởi tạo DB + seed dữ liệu mẫu
│   ├── server.js                # Điểm khởi chạy server
│   └── .env.example
│
└── frontend/                   # Giao diện React
    └── src/
        ├── pages/               # Trang công khai (Home, RoomList, RoomDetail, Booking, Contact...)
        ├── pages/admin/         # Trang quản trị (Dashboard, BookingsManager, RoomsManager, ImagesManager, Settings)
        ├── components/          # Navbar, Footer, ProtectedRoute
        ├── context/AuthContext.jsx
        └── api.js                # Cấu hình gọi API
```

---

## 1. Yêu cầu hệ thống

- **Node.js** phiên bản 18 trở lên ([tải tại đây](https://nodejs.org))
- **npm** (đi kèm sẵn với Node.js)

Kiểm tra đã cài đặt chưa bằng lệnh:
```bash
node -v
npm -v
```

---

## 2. Cài đặt Backend (API server)

### Bước 1 — Di chuyển vào thư mục backend
```bash
cd homestay-booking/backend
```

### Bước 2 — Cài đặt các gói phụ thuộc
```bash
npm install
```

### Bước 3 — Tạo file cấu hình môi trường
```bash
cp .env.example .env
```
Mở file `.env` vừa tạo, có thể để nguyên khi chạy thử ở máy local. **Khi triển khai thật (production),
bắt buộc phải đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên, phức tạp.**

### Bước 4 — Khởi chạy server
```bash
npm start
```
Hoặc chạy ở chế độ tự động tải lại khi sửa code (cần cài `nodemon`, đã có sẵn trong devDependencies):
```bash
npm run dev
```

Nếu thành công, terminal sẽ hiện:
```
[seed] Đã tạo tài khoản admin mặc định -> username: admin | password: admin123
✅ Backend homestay đang chạy tại http://localhost:4000
```

> Lần chạy đầu tiên, hệ thống tự tạo file `data/db.json` với 1 tài khoản admin mặc định và
> 2 phòng mẫu để bạn xem thử giao diện có dữ liệu ngay.

**Tài khoản đăng nhập quản trị mặc định:**
| Tài khoản | Mật khẩu |
|---|---|
| `admin` | `admin123` |

⚠️ **Hãy đổi mật khẩu này ngay sau khi đăng nhập lần đầu**, tại trang *Cài đặt tài khoản* trong khu quản trị.

---

## 3. Cài đặt Frontend (Giao diện website)

Mở một **terminal mới** (giữ nguyên terminal backend đang chạy):

### Bước 1 — Di chuyển vào thư mục frontend
```bash
cd homestay-booking/frontend
```

### Bước 2 — Cài đặt các gói phụ thuộc
```bash
npm install
```

### Bước 3 — Tạo file cấu hình môi trường
```bash
cp .env.example .env
```
Mặc định file `.env` đã trỏ đến `http://localhost:4000/api` — đúng với backend chạy ở bước 2, không cần sửa gì khi chạy local.

### Bước 4 — Khởi chạy giao diện
```bash
npm run dev
```

Terminal sẽ hiện đường dẫn dạng:
```
➜  Local:   http://localhost:5173/
```

Mở trình duyệt và truy cập **http://localhost:5173** để xem website.

---

## 4. Các đường dẫn quan trọng

| Trang | Đường dẫn |
|---|---|
| Trang chủ | `/` |
| Danh sách phòng | `/phong` |
| Chi tiết phòng | `/phong/:slug` |
| Đặt phòng | `/dat-phong` |
| Liên hệ & bản đồ | `/lien-he` |
| Đăng nhập quản trị | `/admin/dang-nhap` |
| Dashboard quản trị | `/admin` |
| Quản lý đặt phòng | `/admin/dat-phong` |
| Quản lý phòng | `/admin/phong` |
| **Quản lý hình ảnh** (banner/gallery) | `/admin/hinh-anh` |
| Cài đặt tài khoản | `/admin/cai-dat` |

---

## 5. Hướng dẫn sử dụng nhanh khu vực quản trị

1. Truy cập `/admin/dang-nhap`, đăng nhập bằng tài khoản mặc định ở trên.
2. Vào **Quản lý phòng** → "Thêm phòng mới" để tạo các loại phòng thực tế, xóa 2 phòng mẫu nếu không cần.
3. Trong mỗi thẻ phòng, bấm **"+ Ảnh"** để tải ảnh cho phòng đó (hiển thị ở trang chi tiết phòng).
4. Vào **Quản lý hình ảnh** để tải **Banner trang chủ** (ảnh slider lớn ở đầu trang), **ảnh giới thiệu**,
   và **thư viện ảnh chung**. Có thể **kéo-thả** để sắp xếp lại thứ tự ảnh.
5. Khi khách đặt phòng qua form, đơn sẽ xuất hiện trong **Quản lý đặt phòng** với trạng thái
   "Chờ xác nhận" — bấm **Xác nhận** hoặc **Hủy** tương ứng.
6. Vào **Cài đặt tài khoản** để đổi mật khẩu đăng nhập.

---

## 6. Responsive

Giao diện đã được tối ưu cho 3 kích thước màn hình:
- **Mobile** (< 768px): menu ẩn dạng hamburger, banner full-width, danh sách phòng xếp 1 cột,
  bảng đặt phòng trong admin chuyển thành dạng card, sidebar admin thu vào dạng drawer trượt.
- **Tablet** (768px–1024px): danh sách phòng xếp 2 cột.
- **Desktop** (> 1024px): đầy đủ menu ngang, danh sách phòng 3 cột, sidebar admin cố định.

Bạn có thể test responsive bằng cách mở DevTools trình duyệt (F12) → bật chế độ xem thiết bị di động (Toggle device toolbar).

---

## 7. Build cho môi trường Production

### Backend
Chạy trực tiếp bằng `npm start`, nên dùng thêm công cụ quản lý tiến trình như **PM2** để backend
tự khởi động lại nếu bị lỗi:
```bash
npm install -g pm2
cd homestay-booking/backend
pm2 start server.js --name homestay-api
```

### Frontend
Build ra file tĩnh để deploy lên hosting (Vercel, Netlify, Nginx...):
```bash
cd homestay-booking/frontend
npm run build
```
Kết quả nằm trong thư mục `frontend/dist` — upload toàn bộ thư mục này lên hosting tĩnh.

**Lưu ý quan trọng khi deploy thật:**
- Sửa `VITE_API_URL` trong `frontend/.env` thành địa chỉ backend thật (VD: `https://api.suongmaihomestay.vn/api`) **trước khi build**.
- Sửa `FRONTEND_URL` trong `backend/.env` thành địa chỉ frontend thật để CORS hoạt động đúng.
- Đổi `JWT_SECRET` thành chuỗi ngẫu nhiên, không dùng giá trị mẫu.
- Nên cấu hình HTTPS (SSL) cho cả 2 domain.
- Cân nhắc dùng dịch vụ lưu trữ ảnh ngoài (Cloudinary, AWS S3) thay vì lưu trên ổ đĩa server nếu
  lượng ảnh lớn hoặc deploy trên nền tảng serverless (ổ đĩa không lưu trữ lâu dài).

---

## 8. Câu hỏi thường gặp

**Q: Backend báo lỗi "port 4000 already in use"?**
A: Đổi `PORT` trong file `backend/.env` sang số khác (VD: 4001), rồi cập nhật lại `VITE_API_URL`
trong `frontend/.env` cho khớp.

**Q: Ảnh upload không hiển thị?**
A: Kiểm tra backend có đang chạy không, và `VITE_API_URL` trong frontend có trỏ đúng địa chỉ backend không.

**Q: Muốn xóa hết dữ liệu để làm lại từ đầu?**
A: Dừng backend, xóa file `backend/data/db.json` và các ảnh trong `backend/uploads/`, sau đó chạy lại `npm start` — hệ thống sẽ tự tạo lại admin mặc định và phòng mẫu.

**Q: Muốn thêm nhân viên quản lý khác ngoài admin?**
A: Hiện bản này chỉ có 1 tài khoản admin. Có thể mở rộng thêm bằng cách thêm bản ghi mới vào mảng
`admins` trong `db.js`/`data/db.json` (đã hash sẵn mật khẩu bằng bcrypt), hoặc nhắn cho mình để làm
thêm tính năng phân quyền nhiều tài khoản.

---

Chúc bạn triển khai thành công! Nếu cần bổ sung tính năng (thanh toán online, gửi email tự động
xác nhận, đa ngôn ngữ...) cứ yêu cầu thêm.
