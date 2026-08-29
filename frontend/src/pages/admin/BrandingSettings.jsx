import { useRef, useState } from "react";
import api, { BACKEND_ORIGIN } from "../../api";
import { useTheme } from "../../context/ThemeContext";

const TABS = [
  { key: "brand", label: "Thương hiệu" },
  { key: "contact", label: "Liên hệ" },
  { key: "menu", label: "Menu điều hướng" },
];

export default function BrandingSettings() {
  const { settings, refreshSettings } = useTheme();
  const [tab, setTab] = useState("brand");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt giao diện</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2 rounded-lg font-medium ${
              tab === t.key ? "bg-brand text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "brand" && <BrandTab settings={settings} refreshSettings={refreshSettings} />}
      {tab === "contact" && <ContactTab settings={settings} refreshSettings={refreshSettings} />}
      {tab === "menu" && <MenuTab settings={settings} refreshSettings={refreshSettings} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TAB 1: Thương hiệu - logo, tên homestay, slogan, màu chủ đạo
// ---------------------------------------------------------------------------
function BrandTab({ settings, refreshSettings }) {
  const [form, setForm] = useState({
    siteName: settings.siteName || "",
    slogan: settings.slogan || "",
    primaryColor: settings.primaryColor || "#c37936",
  });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef(null);

  function updateField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });
    try {
      await api.put("/settings", form);
      await refreshSettings();
      setStatus({ loading: false, error: "", success: "Đã lưu thay đổi thương hiệu" });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || "Có lỗi xảy ra", success: "" });
    }
  }

  async function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/settings/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshSettings();
    } catch (err) {
      alert(err.response?.data?.message || "Tải logo thất bại");
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveLogo() {
    if (!confirm("Gỡ logo hiện tại và quay về hiển thị tên chữ?")) return;
    await api.delete("/settings/logo");
    await refreshSettings();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2 card p-6">
        {/* Logo */}
        <div className="mb-6">
          <label className="label-field">Logo homestay</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
              {settings.logoUrl ? (
                <img src={`${BACKEND_ORIGIN}${settings.logoUrl}`} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🏡</span>
              )}
            </div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="btn-outline !py-2 !px-4 text-sm disabled:opacity-60"
            >
              {logoUploading ? "Đang tải..." : "Tải logo mới"}
            </button>
            {settings.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Gỡ logo
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Định dạng .jpg, .png, .webp, .svg — tối đa 3MB. Nếu không có logo, hệ thống sẽ hiện icon 🏡 mặc định.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Tên homestay *</label>
            <input
              name="siteName"
              value={form.siteName}
              onChange={updateField}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Slogan / khẩu hiệu</label>
            <input
              name="slogan"
              value={form.slogan}
              onChange={updateField}
              className="input-field"
              placeholder="VD: Trốn phố ồn ào, tìm về không gian yên bình"
            />
            <p className="text-xs text-gray-400 mt-1">
              Hiển thị ở banner trang chủ và mô tả ngắn ở chân trang.
            </p>
          </div>

          <div>
            <label className="label-field">Màu chủ đạo</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primaryColor"
                value={form.primaryColor}
                onChange={updateField}
                className="w-14 h-11 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                name="primaryColor"
                value={form.primaryColor}
                onChange={updateField}
                className="input-field font-mono uppercase"
                pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$"
                placeholder="#c37936"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Áp dụng cho nút bấm, tiêu đề, sidebar quản trị và các điểm nhấn trên toàn website.
            </p>
          </div>

          {status.error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{status.error}</p>}
          {status.success && <p className="text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-lg">{status.success}</p>}

          <button type="submit" disabled={status.loading} className="btn-primary disabled:opacity-60">
            {status.loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>

      {/* Xem trước */}
      <div className="card p-6 h-fit sticky top-24">
        <p className="text-sm font-semibold text-gray-700 mb-3">Xem trước nhanh</p>
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <div className="h-12 bg-white border-b border-gray-100 flex items-center px-3 gap-2">
            {settings.logoUrl ? (
              <img src={`${BACKEND_ORIGIN}${settings.logoUrl}`} className="w-6 h-6 object-contain" alt="" />
            ) : (
              <span>🏡</span>
            )}
            <span className="text-sm font-bold truncate" style={{ color: "var(--color-primary-dark)" }}>
              {form.siteName || "Tên homestay"}
            </span>
          </div>
          <div className="p-3 space-y-2">
            <button
              type="button"
              className="w-full text-xs py-2 rounded-lg font-semibold"
              style={{ backgroundColor: form.primaryColor, color: "#fff" }}
            >
              Nút chính (btn-primary)
            </button>
            <button
              type="button"
              className="w-full text-xs py-2 rounded-lg font-semibold border-2"
              style={{ borderColor: form.primaryColor, color: form.primaryColor }}
            >
              Nút viền (btn-outline)
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Bấm "Lưu thay đổi" để áp dụng thật lên toàn bộ website.
        </p>
      </div>
    </div>
  );
}

function ContactTab({ settings, refreshSettings }) {
  const [form, setForm] = useState({
    address: settings.contact?.address || "",
    phone: settings.contact?.phone || "",
    email: settings.contact?.email || "",
    zalo: settings.contact?.zalo || "",
    mapUrl: settings.contact?.mapUrl || "",
    directions: settings.contact?.directions || "",
  });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  async function handleSubmit(event) {
    event.preventDefault(); setStatus({ loading: true, error: "", success: "" });
    try { await api.put("/settings", { contact: form }); await refreshSettings(); setStatus({ loading: false, error: "", success: "Đã lưu thông tin liên hệ" }); }
    catch (err) { setStatus({ loading: false, error: err.response?.data?.message || "Có lỗi xảy ra", success: "" }); }
  }
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><form onSubmit={handleSubmit} className="lg:col-span-2 card p-6 space-y-5"><div><h2 className="font-semibold text-gray-800">Thông tin liên hệ</h2><p className="text-sm text-gray-500 mt-1">Hiển thị ở trang Liên hệ và chân trang website.</p></div><div><label className="label-field">Địa chỉ</label><input name="address" value={form.address} onChange={updateField} className="input-field" placeholder="Số nhà, đường, phường/xã, tỉnh/thành" /></div><div className="grid sm:grid-cols-2 gap-4"><div><label className="label-field">Hotline</label><input name="phone" value={form.phone} onChange={updateField} className="input-field" type="tel" placeholder="0900 000 000" /></div><div><label className="label-field">Số Zalo</label><input name="zalo" value={form.zalo} onChange={updateField} className="input-field" type="tel" placeholder="0900 000 000" /></div></div><div><label className="label-field">Email</label><input name="email" value={form.email} onChange={updateField} className="input-field" type="email" placeholder="contact@homestay.vn" /></div><div><label className="label-field">Link nhúng Google Maps</label><textarea name="mapUrl" value={form.mapUrl} onChange={updateField} className="input-field resize-none" rows={3} placeholder="https://www.google.com/maps?...&output=embed" /><p className="text-xs text-gray-400 mt-1">Dán URL trong thuộc tính src của iframe Google Maps, có chứa <code>output=embed</code>.</p></div><div><label className="label-field">Hướng dẫn di chuyển / ghi chú</label><textarea name="directions" value={form.directions} onChange={updateField} className="input-field resize-none" rows={3} placeholder="Ví dụ: Có chỗ đậu xe miễn phí..." /></div>{status.error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{status.error}</p>}{status.success && <p className="text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-lg">{status.success}</p>}<button type="submit" disabled={status.loading} className="btn-primary disabled:opacity-60">{status.loading ? "Đang lưu..." : "Lưu thông tin liên hệ"}</button></form><aside className="card p-6 h-fit"><p className="text-sm font-semibold text-gray-700 mb-4">Xem trước</p><div className="space-y-4 text-sm"><p><b className="block text-gray-500 text-xs mb-1">ĐỊA CHỈ</b>{form.address || "Chưa cập nhật"}</p><p><b className="block text-gray-500 text-xs mb-1">HOTLINE / ZALO</b>{form.phone || "—"}{form.zalo && ` · Zalo ${form.zalo}`}</p><p><b className="block text-gray-500 text-xs mb-1">EMAIL</b>{form.email || "—"}</p></div></aside></div>;
}

// ---------------------------------------------------------------------------
// TAB 2: Menu điều hướng - thêm/sửa/xóa/ẩn-hiện/kéo-thả sắp xếp
// ---------------------------------------------------------------------------
function MenuTab({ settings, refreshSettings }) {
  const [menu, setMenu] = useState(settings.menu || []);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [dragIndex, setDragIndex] = useState(null);

  function updateItem(index, field, value) {
    setMenu((m) => m.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setMenu((m) => [...m, { id: `menu-new-${Date.now()}`, label: "", path: "/", visible: true }]);
  }

  function removeItem(index) {
    setMenu((m) => m.filter((_, i) => i !== index));
  }

  function handleDragStart(index) {
    setDragIndex(index);
  }
  function handleDragOver(e) {
    e.preventDefault();
  }
  function handleDrop(index) {
    if (dragIndex === null || dragIndex === index) return;
    setMenu((m) => {
      const copy = [...m];
      const [moved] = copy.splice(dragIndex, 1);
      copy.splice(index, 0, moved);
      return copy;
    });
    setDragIndex(null);
  }

  async function handleSave() {
    setStatus({ loading: true, error: "", success: "" });
    if (menu.length === 0) {
      setStatus({ loading: false, error: "Cần có ít nhất 1 mục menu", success: "" });
      return;
    }
    const invalid = menu.some((m) => !m.label.trim() || !m.path.trim());
    if (invalid) {
      setStatus({ loading: false, error: "Mỗi mục menu cần có tên hiển thị và đường dẫn", success: "" });
      return;
    }
    try {
      await api.put("/settings", { menu });
      await refreshSettings();
      setStatus({ loading: false, error: "", success: "Đã lưu menu điều hướng" });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || "Có lỗi xảy ra", success: "" });
    }
  }

  return (
    <div className="card p-6">
      <p className="text-sm text-gray-500 mb-4">
        Đây là các mục hiển thị trên thanh menu và chân trang website. Kéo-thả biểu tượng ⠿ để sắp xếp lại thứ tự.
      </p>

      <div className="space-y-3 mb-5">
        {menu.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className="flex items-center gap-2 border border-gray-200 rounded-lg p-3"
          >
            <span className="cursor-move text-gray-300 select-none px-1">⠿</span>
            <input
              value={item.label}
              onChange={(e) => updateItem(index, "label", e.target.value)}
              placeholder="Tên hiển thị"
              className="input-field flex-1"
            />
            <input
              value={item.path}
              onChange={(e) => updateItem(index, "path", e.target.value)}
              placeholder="/duong-dan"
              className="input-field flex-1 font-mono text-xs"
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0 px-1">
              <input
                type="checkbox"
                checked={item.visible !== false}
                onChange={(e) => updateItem(index, "visible", e.target.checked)}
              />
              Hiện
            </label>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700 text-sm px-2 shrink-0"
              aria-label="Xóa mục menu"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={addItem} className="btn-outline !py-2 !px-4 text-sm mb-5">
        + Thêm mục menu
      </button>

      {status.error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg mb-4">{status.error}</p>}
      {status.success && <p className="text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-lg mb-4">{status.success}</p>}

      <button onClick={handleSave} disabled={status.loading} className="btn-primary disabled:opacity-60">
        {status.loading ? "Đang lưu..." : "Lưu menu"}
      </button>
    </div>
  );
}
