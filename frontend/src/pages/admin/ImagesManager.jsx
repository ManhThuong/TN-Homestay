import { useEffect, useRef, useState } from "react";
import api, { BACKEND_ORIGIN } from "../../api";

const categories = [
  { value: "banner", label: "Banner trang chủ", desc: "Ảnh lớn hiển thị dạng slider ở đầu trang chủ" },
  { value: "highlight", label: "Ảnh giới thiệu / điểm nổi bật", desc: "Ảnh minh họa cho phần giới thiệu homestay" },
  { value: "gallery", label: "Thư viện ảnh chung", desc: "Bộ sưu tập ảnh chung của homestay" },
];

export default function ImagesManager() {
  const [activeTab, setActiveTab] = useState("banner");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragId, setDragId] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    setLoading(true);
    api
      .get("/images", { params: { category: activeTab } })
      .then((res) => setImages(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [activeTab]);

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError("");
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          setError(`Ảnh "${file.name}" vượt quá 5MB, đã bỏ qua`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", activeTab);
        await api.post("/images/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removeImage(id) {
    if (!confirm("Xóa ảnh này?")) return;
    await api.delete(`/images/${id}`);
    load();
  }

  // Kéo thả sắp xếp thứ tự ảnh
  function handleDragStart(id) {
    setDragId(id);
  }
  function handleDragOver(e) {
    e.preventDefault();
  }
  async function handleDrop(targetId) {
    if (dragId === targetId) return;
    const dragIndex = images.findIndex((i) => i.id === dragId);
    const targetIndex = images.findIndex((i) => i.id === targetId);
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setImages(reordered);
    setDragId(null);
    await api.put("/images/reorder", { ids: reordered.map((i) => i.id) });
  }

  const activeMeta = categories.find((c) => c.value === activeTab);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý hình ảnh</h1>

      {/* Tabs danh mục */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setActiveTab(c.value)}
            className={`shrink-0 text-sm px-4 py-2 rounded-lg font-medium ${
              activeTab === c.value
                ? "bg-brand text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-5">{activeMeta.desc}</p>

      {/* Upload */}
      <div className="card p-5 mb-6">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-outline w-full sm:w-auto disabled:opacity-60"
        >
          {uploading ? "Đang tải lên..." : "📤 Tải ảnh lên"}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Định dạng: .jpg, .png, .webp — tối đa 5MB/ảnh. Có thể chọn nhiều ảnh cùng lúc.
        </p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Danh sách ảnh - kéo thả để sắp xếp */}
      {loading && <p className="text-gray-400 text-sm">Đang tải...</p>}
      {!loading && images.length === 0 && (
        <p className="text-gray-400 text-sm">Chưa có ảnh nào trong mục này.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => handleDragStart(img.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(img.id)}
            className="card overflow-hidden cursor-move group relative"
          >
            <div className="aspect-video bg-gray-100">
              <img src={`${BACKEND_ORIGIN}${img.url}`} alt={img.altText} className="w-full h-full object-cover" />
            </div>
            <button
              onClick={() => removeImage(img.id)}
              className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Xóa
            </button>
            <div className="px-2 py-1.5 text-xs text-gray-400 flex items-center justify-between">
              <span>⠿ Kéo để sắp xếp</span>
              <span>#{img.order}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
