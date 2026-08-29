import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-brand mb-4">404</h1>
      <p className="text-gray-600 mb-6">Trang bạn tìm không tồn tại.</p>
      <Link to="/" className="btn-primary">Về trang chủ</Link>
    </div>
  );
}
