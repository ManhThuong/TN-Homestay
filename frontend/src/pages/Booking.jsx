import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import DateRangePicker from "../components/DateRangePicker";
import api, { getCurrentRoomPrice, getRoomThumbnail } from "../api";

const steps = ["Chọn phòng", "Thông tin liên hệ", "Xác nhận yêu cầu"];

export default function Booking() {
  const [searchParams] = useSearchParams();
  const preselectedRoomId = searchParams.get("roomId") || "";
  const [rooms, setRooms] = useState([]);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [form, setForm] = useState({ roomId: preselectedRoomId, customerName: "", phone: "", email: "", adults: 2, children: 0, note: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);
  const roomSliderRef = useRef(null);
  const [startDate, endDate] = dateRange;

  useEffect(() => { api.get("/rooms").then((res) => setRooms(res.data)).catch(() => setStatus((s) => ({ ...s, error: "Không thể tải danh sách phòng. Vui lòng thử lại." }))); }, []);
  useEffect(() => {
    if (!form.roomId) return setBookedRanges([]);
    api.get("/bookings/availability", { params: { roomId: form.roomId } }).then((res) => setBookedRanges(res.data.map((b) => ({ start: new Date(b.checkIn), end: new Date(new Date(b.checkOut).getTime() - 86400000) }))));
  }, [form.roomId]);

  const nights = startDate && endDate ? Math.round((endDate - startDate) / 86400000) : 0;
  const selectedRoom = rooms.find((room) => room.id === form.roomId);
  const estimatedTotal = selectedRoom && nights > 0 ? getCurrentRoomPrice(selectedRoom) * nights : 0;
  const updateField = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  const slideRooms = (direction) => roomSliderRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.roomId || !startDate || !endDate) return setStatus({ loading: false, error: !form.roomId ? "Vui lòng chọn loại phòng." : "Vui lòng chọn ngày nhận và trả phòng.", success: "" });
    setStatus({ loading: false, error: "", success: "" });
    setConfirmOpen(true);
  }

  async function submitBooking() {
    setStatus({ loading: true, error: "", success: "" });
    try {
      const res = await api.post("/bookings", { ...form, checkIn: format(startDate, "yyyy-MM-dd"), checkOut: format(endDate, "yyyy-MM-dd") });
      setCompletedBooking(res.data.booking);
      setConfirmOpen(false);
      setStatus({ loading: false, error: "", success: res.data.message || "Yêu cầu đặt phòng đã được gửi." });
      setForm({ roomId: "", customerName: "", phone: "", email: "", adults: 2, children: 0, note: "" }); setDateRange([null, null]);
    } catch (err) { setStatus({ loading: false, error: err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.", success: "" }); }
  }

  return <div className="booking-page">
    <section className="booking-hero"><div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
      <p className="booking-eyebrow">KỲ NGHỈ CỦA BẠN BẮT ĐẦU TỪ ĐÂY</p><h1>Đặt một chốn bình yên</h1><p>Chọn phòng, chọn ngày và để chúng tôi chuẩn bị một trải nghiệm thật trọn vẹn cho bạn.</p>
      <div className="booking-steps">{steps.map((step, index) => <div key={step}><span>{index + 1}</span>{step}</div>)}</div>
    </div></section>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"><div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
      <form onSubmit={handleSubmit} className="booking-form card p-5 sm:p-8 space-y-7">
        <div><p className="booking-section-label">01 · LƯU TRÚ</p><h2>Chọn phòng và thời gian</h2></div>
        <div><div className="booking-room-heading"><div><label className="label-field">Chọn không gian lưu trú <span className="text-red-500">*</span></label><p className="booking-room-helper">Vuốt hoặc dùng nút mũi tên để xem các loại phòng.</p></div><div className="booking-slider-controls"><button type="button" onClick={() => slideRooms(-1)} aria-label="Phòng trước">←</button><button type="button" onClick={() => slideRooms(1)} aria-label="Phòng tiếp theo">→</button></div></div><div ref={roomSliderRef} className="booking-room-options">{rooms.map((room) => <button key={room.id} type="button" onClick={() => setForm((current) => ({ ...current, roomId: room.id }))} className={`booking-room-option ${form.roomId === room.id ? "booking-room-option-selected" : ""}`}><img src={getRoomThumbnail(room, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80")} alt={room.name} /><span className="booking-room-content"><span className="booking-room-name-row"><b>{room.name}</b>{form.roomId === room.id && <i>✓ Đã chọn</i>}</span><span className="booking-room-meta">👥 Tối đa {room.maxAdults} người lớn{room.maxChildren ? ` + ${room.maxChildren} trẻ em` : ""}</span><span className="booking-room-amenities">{(room.amenities || []).slice(0, 3).map((amenity) => <em key={amenity}>{amenity}</em>)}</span><strong>{room.salePrice ? <><span className="text-red-600">{getCurrentRoomPrice(room).toLocaleString("vi-VN")}đ</span> <del>{room.price.toLocaleString("vi-VN")}đ</del></> : `${room.price.toLocaleString("vi-VN")}đ`} <small>/ đêm</small></strong></span></button>)}</div>{rooms.length === 0 && <p className="text-sm text-slate-400 mt-3">Đang tải các loại phòng…</p>}</div>
        <div><label className="label-field">Thời gian lưu trú <span className="text-red-500">*</span></label><DateRangePicker startDate={startDate} endDate={endDate} onChange={setDateRange} minDate={new Date()} excludeDateIntervals={bookedRanges} /></div>
        <div className="booking-divider" /><div><p className="booking-section-label">02 · LIÊN HỆ</p><h2>Thông tin của bạn</h2></div>
        <div><label className="label-field">Họ và tên <span className="text-red-500">*</span></label><input name="customerName" value={form.customerName} onChange={updateField} className="input-field" placeholder="Nguyễn Văn A" required /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><div><label className="label-field">Số điện thoại / Zalo <span className="text-red-500">*</span></label><input name="phone" value={form.phone} onChange={updateField} className="input-field" placeholder="09xx xxx xxx" type="tel" required /></div><div><label className="label-field">Email</label><input name="email" value={form.email} onChange={updateField} className="input-field" placeholder="ban@email.com" type="email" /></div></div>
        <div className="grid grid-cols-2 gap-5"><div><label className="label-field">Người lớn</label><input name="adults" value={form.adults} onChange={updateField} className="input-field" type="number" min={1} required /></div><div><label className="label-field">Trẻ em</label><input name="children" value={form.children} onChange={updateField} className="input-field" type="number" min={0} /></div></div>
        <div><label className="label-field">Yêu cầu đặc biệt <span className="font-normal text-gray-400">(không bắt buộc)</span></label><textarea name="note" value={form.note} onChange={updateField} className="input-field resize-none" rows={3} placeholder="Ví dụ: cần thêm giường phụ, nhận phòng sớm..." /></div>
        {status.error && <p className="booking-alert booking-alert-error">{status.error}</p>}
        <button type="submit" disabled={status.loading} className="btn-primary w-full !py-3.5 disabled:opacity-60">Xem lại & đặt phòng</button><p className="text-center text-xs text-gray-400">Chưa cần thanh toán · Bạn sẽ xem lại thông tin trước khi gửi yêu cầu</p>
      </form>
      <aside className="booking-summary card p-5 sm:p-6 lg:sticky lg:top-24"><p className="booking-section-label">TÓM TẮT ĐẶT PHÒNG</p><h2>{selectedRoom ? selectedRoom.name : "Chưa chọn phòng"}</h2><div className="booking-summary-line"><span>Thời gian</span><strong>{nights ? `${nights} đêm` : "Chọn ngày lưu trú"}</strong></div><div className="booking-summary-line"><span>Khách</span><strong>{form.adults} người lớn{Number(form.children) ? ` · ${form.children} trẻ em` : ""}</strong></div><div className="booking-total"><span>Tạm tính</span><strong>{estimatedTotal ? `${estimatedTotal.toLocaleString("vi-VN")}đ` : "—"}</strong><small>{estimatedTotal ? `${getCurrentRoomPrice(selectedRoom).toLocaleString("vi-VN")}đ × ${nights} đêm` : "Giá chính xác sẽ được xác nhận bởi homestay"}</small></div><div className="booking-support"><span>✦</span><p><b>Cần hỗ trợ?</b><br />Liên hệ chúng tôi để được tư vấn nhanh nhất.</p></div></aside>
    </div></div>
    {confirmOpen && <div className="booking-modal-backdrop" onClick={(event) => event.target === event.currentTarget && !status.loading && setConfirmOpen(false)}><section className="booking-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="booking-confirm-title"><button type="button" onClick={() => setConfirmOpen(false)} disabled={status.loading} className="booking-modal-close" aria-label="Đóng">×</button><p className="booking-section-label">BƯỚC CUỐI CÙNG</p><h2 id="booking-confirm-title">Xác nhận yêu cầu đặt phòng</h2><p className="booking-confirm-intro">Hãy kiểm tra lại thông tin trước khi chúng tôi giữ chỗ cho bạn.</p><div className="booking-confirm-room"><span>✦</span><div><small>LOẠI PHÒNG</small><b>{selectedRoom?.name}</b></div><strong>{estimatedTotal.toLocaleString("vi-VN")}đ</strong></div><dl className="booking-confirm-details"><div><dt>Khách lưu trú</dt><dd>{form.customerName}</dd></div><div><dt>Điện thoại</dt><dd>{form.phone}</dd></div>{form.email && <div><dt>Email</dt><dd>{form.email}</dd></div>}<div><dt>Nhận phòng</dt><dd>{format(startDate, "dd/MM/yyyy")}</dd></div><div><dt>Trả phòng</dt><dd>{format(endDate, "dd/MM/yyyy")}</dd></div><div><dt>Số khách</dt><dd>{form.adults} người lớn{Number(form.children) ? ` · ${form.children} trẻ em` : ""}</dd></div></dl>{form.note && <p className="booking-confirm-note"><b>Yêu cầu thêm:</b> {form.note}</p>}<div className="booking-confirm-total"><span>Tạm tính · {nights} đêm</span><b>{estimatedTotal.toLocaleString("vi-VN")}đ</b></div>{status.error && <p className="booking-alert booking-alert-error">{status.error}</p>}<div className="booking-modal-actions"><button type="button" onClick={() => setConfirmOpen(false)} disabled={status.loading} className="btn-outline !px-4 !py-2.5 text-sm">Chỉnh sửa</button><button type="button" onClick={submitBooking} disabled={status.loading} className="btn-primary !px-5 !py-2.5 text-sm">{status.loading ? "Đang gửi..." : "Xác nhận đặt phòng"}</button></div></section></div>}
    {completedBooking && <div className="booking-modal-backdrop"><section className="booking-success-modal" role="dialog" aria-modal="true"><div className="booking-success-icon">✓</div><p className="booking-section-label">YÊU CẦU ĐÃ ĐƯỢC GỬI</p><h2>Cảm ơn bạn, {completedBooking.customerName}!</h2><p>Chúng tôi đã nhận yêu cầu đặt phòng và sẽ sớm liên hệ qua số <b>{completedBooking.phone}</b> để xác nhận.</p><div className="booking-code"><span>MÃ ĐẶT PHÒNG CỦA BẠN</span><b>{completedBooking.bookingCode}</b><small>Vui lòng lưu mã này để tiện trao đổi với homestay.</small></div><p className="booking-success-status">Trạng thái: <b>Chờ xác nhận</b></p><button type="button" onClick={() => setCompletedBooking(null)} className="btn-primary w-full !py-3">Hoàn tất</button></section></div>}
  </div>;
}
