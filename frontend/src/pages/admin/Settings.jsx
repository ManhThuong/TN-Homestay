import { useState } from "react";
import api from "../../api";

export default function Settings() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  function updateField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: false, error: "", success: "" });

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ loading: false, error: "Mật khẩu mới nhập lại không khớp", success: "" });
      return;
    }

    setStatus({ loading: true, error: "", success: "" });
    try {
      const res = await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus({ loading: false, error: "", success: res.data.message });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || "Có lỗi xảy ra",
        success: "",
      });
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h1>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Đổi mật khẩu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Mật khẩu hiện tại</label>
            <input
              name="currentPassword"
              value={form.currentPassword}
              onChange={updateField}
              type="password"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-field">Mật khẩu mới</label>
            <input
              name="newPassword"
              value={form.newPassword}
              onChange={updateField}
              type="password"
              className="input-field"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="label-field">Nhập lại mật khẩu mới</label>
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
              type="password"
              className="input-field"
              minLength={6}
              required
            />
          </div>

          {status.error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{status.error}</p>
          )}
          {status.success && (
            <p className="text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-lg">{status.success}</p>
          )}

          <button type="submit" disabled={status.loading} className="btn-primary w-full disabled:opacity-60">
            {status.loading ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
