import { useEffect, useRef, useState } from "react";
import api, { getRoomThumbnail, resolveImageUrl } from "../../api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  salePrice: "",
  priceWeekend: "",
  maxAdults: 2,
  maxChildren: 0,
  amenities: "",
  status: "active",
  area: "",
  bedType: "",
  view: "",
};

export default function RoomsManager() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [uploadingRoomId, setUploadingRoomId] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    setLoading(true);
    api.get("/rooms/admin/all").then((res) => setRooms(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEditForm(room) {
    setForm({
      name: room.name,
      description: room.description,
      price: room.price,
      salePrice: room.salePrice || "",
      priceWeekend: room.priceWeekend,
      maxAdults: room.maxAdults,
      maxChildren: room.maxChildren,
      amenities: (room.amenities || []).join(", "),
      status: room.status,
      area: room.area || "",
      bedType: room.bedType || "",
      view: room.view || "",
    });
    setEditingId(room.id);
    setError("");
    setShowForm(true);
  }

  function updateField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      priceWeekend: Number(form.priceWeekend) || Number(form.price),
      maxAdults: Number(form.maxAdults),
      maxChildren: Number(form.maxChildren),
      area: form.area ? Number(form.area) : null,
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
      } else {
        await api.post("/rooms", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
  }

  async function removeRoom(id) {
    if (!confirm("Xóa phòng này? Toàn bộ ảnh của phòng cũng sẽ mất.")) return;
    await api.delete(`/rooms/${id}`);
    load();
  }

  async function toggleStatus(room) {
    const newStatus = room.status === "active" ? "hidden" : "active";
    await api.put(`/rooms/${room.id}`, { status: newStatus });
    load();
  }

  function triggerUpload(roomId) {
    setUploadingRoomId(roomId);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file || !uploadingRoomId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/images/upload-room/${uploadingRoomId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Tải ảnh thất bại");
    } finally {
      e.target.value = "";
      setUploadingRoomId(null);
    }
  }

  async function removeRoomImage(roomId, url) {
    await api.delete(`/images/room/${roomId}`, { data: { url } });
    load();
  }

  async function setCoverImage(roomId, url) {
    await api.put(`/rooms/${roomId}`, { coverImage: url });
    load();
  }

  return (
    <div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý phòng</h1>
        <button onClick={openCreateForm} className="btn-primary !py-2 !px-4 text-sm">
          + Thêm phòng mới
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Đang tải...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rooms.map((room) => (
          <div key={room.id} className="card p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-brand-soft-2 shrink-0">
                <img
                  src={getRoomThumbnail(room, "")}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{room.name}</h3>
                    <p className="text-xs text-gray-400 truncate">/{room.slug}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                      room.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {room.status === "active" ? "Đang hiển thị" : "Đang ẩn"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{room.description}</p>
            <p className="text-brand font-bold mb-1">
              {room.salePrice ? <><span className="text-red-600">{room.salePrice?.toLocaleString("vi-VN")}đ</span> <span className="text-xs text-gray-400 line-through font-normal">{room.price?.toLocaleString("vi-VN")}đ</span></> : `${room.price?.toLocaleString("vi-VN")}đ`} / đêm
              <span className="text-xs font-normal text-gray-400"> (cuối tuần: {room.priceWeekend?.toLocaleString("vi-VN")}đ)</span>
            </p>
            <p className="text-xs text-gray-500 mb-1">
              👥 Tối đa {room.maxAdults} người lớn{room.maxChildren ? ` + ${room.maxChildren} trẻ em` : ""}
            </p>
            {(room.area || room.bedType || room.view) && (
              <p className="text-xs text-gray-500 mb-3">
                {room.area ? `📐 ${room.area}m² ` : ""}
                {room.bedType ? `· 🛏️ ${room.bedType} ` : ""}
                {room.view ? `· 🌄 ${room.view}` : ""}
              </p>
            )}

            {/* Ảnh phòng - bấm chọn làm ảnh đại diện */}
            <p className="text-xs text-gray-400 mb-1.5 mt-3">
              Ảnh phòng <span className="text-gray-300">(bấm ⭐ để đặt làm ảnh đại diện)</span>
            </p>
            <div className="flex gap-2 flex-wrap mb-3">
              {(room.images || []).map((img) => {
                const isCover = room.coverImage === img;
                return (
                  <div
                    key={img}
                    className={`relative group w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      isCover ? "border-brand" : "border-gray-200"
                    }`}
                  >
                    <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setCoverImage(room.id, img)}
                        className="text-white text-xs"
                        title="Đặt làm ảnh đại diện"
                      >
                        ⭐
                      </button>
                      <button
                        onClick={() => removeRoomImage(room.id, img)}
                        className="text-white text-xs"
                        title="Xóa ảnh"
                      >
                        🗑️
                      </button>
                    </div>
                    {isCover && (
                      <span className="absolute top-0.5 left-0.5 text-[10px] bg-brand text-white px-1 rounded">
                        ⭐
                      </span>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => triggerUpload(room.id)}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-xs flex items-center justify-center hover:border-brand hover:text-brand"
              >
                + Ảnh
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => openEditForm(room)} className="badge-brand">
                Sửa
              </button>
              <button onClick={() => toggleStatus(room)} className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                {room.status === "active" ? "Ẩn phòng" : "Hiện phòng"}
              </button>
              <button onClick={() => removeRoom(room.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal thêm/sửa phòng */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? "Sửa phòng" : "Thêm phòng mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Tên phòng *</label>
                <input name="name" value={form.name} onChange={updateField} className="input-field" required />
              </div>
              <div>
                <label className="label-field">Mô tả</label>
                <textarea name="description" value={form.description} onChange={updateField} className="input-field" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Giá ngày thường (đ) *</label>
                  <input name="price" value={form.price} onChange={updateField} className="input-field" type="number" required />
                </div>
                <div>
                  <label className="label-field">Giá cuối tuần (đ)</label>
                  <input name="priceWeekend" value={form.priceWeekend} onChange={updateField} className="input-field" type="number" />
                </div>
              </div>
              <div>
                <label className="label-field">Giá khuyến mãi (đ)</label>
                <input name="salePrice" value={form.salePrice} onChange={updateField} className="input-field" type="number" min={0} placeholder="Để trống nếu không khuyến mãi" />
                <p className="text-xs text-gray-400 mt-1">Giá này sẽ hiển thị nổi bật, giá ngày thường sẽ được gạch ngang.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Tối đa người lớn</label>
                  <input name="maxAdults" value={form.maxAdults} onChange={updateField} className="input-field" type="number" min={1} />
                </div>
                <div>
                  <label className="label-field">Tối đa trẻ em</label>
                  <input name="maxChildren" value={form.maxChildren} onChange={updateField} className="input-field" type="number" min={0} />
                </div>
              </div>

              {/* Chi tiết bổ sung */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label-field">Diện tích (m²)</label>
                  <input name="area" value={form.area} onChange={updateField} className="input-field" type="number" min={0} placeholder="25" />
                </div>
                <div>
                  <label className="label-field">Loại giường</label>
                  <input name="bedType" value={form.bedType} onChange={updateField} className="input-field" placeholder="1 giường đôi" />
                </div>
                <div>
                  <label className="label-field">Hướng nhìn</label>
                  <input name="view" value={form.view} onChange={updateField} className="input-field" placeholder="View vườn" />
                </div>
              </div>

              <div>
                <label className="label-field">Tiện ích (cách nhau bằng dấu phẩy)</label>
                <input
                  name="amenities"
                  value={form.amenities}
                  onChange={updateField}
                  className="input-field"
                  placeholder="Điều hòa, Wifi, Bếp mini"
                />
              </div>
              <div>
                <label className="label-field">Trạng thái</label>
                <select name="status" value={form.status} onChange={updateField} className="input-field">
                  <option value="active">Đang hiển thị</option>
                  <option value="hidden">Đang ẩn</option>
                </select>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">
                  Hủy
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? "Lưu thay đổi" : "Tạo phòng"}
                </button>
              </div>
            </form>

            {editingId && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Để thêm/xóa/đặt ảnh đại diện cho phòng, đóng cửa sổ này và thao tác trực tiếp trên ảnh của thẻ phòng.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
