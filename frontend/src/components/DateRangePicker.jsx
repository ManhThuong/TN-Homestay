import { useEffect, useMemo, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import { differenceInCalendarDays, format, isAfter, isBefore, isEqual } from "date-fns";
import { getVietnameseLunarDate } from "../utils/lunarCalendar";

registerLocale("vi", vi);
const shortDate = (date) => date ? format(date, "dd/MM/yyyy") : "— / — / —";
const longDate = (date) => date ? format(date, "EEEE, dd/MM/yyyy", { locale: vi }) : "Chưa chọn";

export default function DateRangePicker({ startDate, endDate, onChange, excludeDateIntervals = [], minDate }) {
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState("checkin");
  const [tempRange, setTempRange] = useState([startDate, endDate]);
  const [hint, setHint] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(startDate || minDate || new Date());
  const [tempStart, tempEnd] = tempRange;

  useEffect(() => { setTempRange([startDate, endDate]); }, [startDate, endDate]);
  const blockedDays = useMemo(() => excludeDateIntervals.flatMap(({ start, end }) => {
    const days = []; const cursor = new Date(start); while (cursor <= end) { days.push(format(cursor, "yyyy-MM-dd")); cursor.setDate(cursor.getDate() + 1); } return days;
  }), [excludeDateIntervals]);
  const isBlocked = (date) => blockedDays.includes(format(date, "yyyy-MM-dd"));
  const hasBlockedNight = (from, to) => { const cursor = new Date(from); cursor.setDate(cursor.getDate() + 1); while (isBefore(cursor, to)) { if (isBlocked(cursor)) return true; cursor.setDate(cursor.getDate() + 1); } return false; };
  const inRange = (date) => tempStart && tempEnd && isAfter(date, tempStart) && isBefore(date, tempEnd);

  function openPicker(field) { setTempRange([startDate, endDate]); setActiveField(field); setHint(""); setVisibleMonth(field === "checkout" && endDate ? endDate : startDate || minDate || new Date()); setOpen(true); }
  function chooseDate(date) {
    setHint("");
    if (activeField === "checkin") { setTempRange([date, tempEnd && isAfter(tempEnd, date) ? tempEnd : null]); setActiveField("checkout"); return; }
    if (!tempStart || !isAfter(date, tempStart)) { setTempRange([date, null]); setActiveField("checkout"); setHint("Ngày trả phòng cần sau ngày nhận. Vui lòng chọn lại ngày trả phòng."); return; }
    if (hasBlockedNight(tempStart, date)) { setHint("Khoảng thời gian này có ngày đã được đặt. Vui lòng chọn ngày trả phòng khác."); return; }
    setTempRange([tempStart, date]); setHint("");
  }
  function confirm() { if (tempStart && tempEnd) { onChange(tempRange); setOpen(false); } else setHint(activeField === "checkout" ? "Hãy chọn ngày trả phòng để tiếp tục." : "Hãy chọn ngày nhận phòng để tiếp tục."); }
  function reset() { setTempRange([null, null]); setActiveField("checkin"); setHint(""); }
  function renderDay(day, date) { const lunar = getVietnameseLunarDate(date); return <span className="calendar-day-content"><span>{day}</span><small>{lunar.day === 1 ? `1/${lunar.month}` : lunar.day}</small></span>; }

  const nights = tempStart && tempEnd ? differenceInCalendarDays(tempEnd, tempStart) : 0;
  return <div className="date-range-picker">
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={() => openPicker("checkin")} className={`date-field ${activeField === "checkin" && open ? "date-field-active" : ""}`}>
        <span className="date-field-label">Nhận phòng · Check-in</span><b>{shortDate(startDate)}</b><small>{startDate ? `Âm lịch: ${getVietnameseLunarDate(startDate).day}/${getVietnameseLunarDate(startDate).month}` : "Chọn ngày"}</small>
      </button>
      <button type="button" onClick={() => openPicker("checkout")} className={`date-field ${activeField === "checkout" && open ? "date-field-active" : ""}`}>
        <span className="date-field-label">Trả phòng · Check-out</span><b>{shortDate(endDate)}</b><small>{endDate ? `Âm lịch: ${getVietnameseLunarDate(endDate).day}/${getVietnameseLunarDate(endDate).month}` : "Chọn ngày"}</small>
      </button>
    </div>
    {startDate && endDate && <p className="text-sm mt-2 text-brand-dark font-medium">{longDate(startDate)} → {longDate(endDate)} · {differenceInCalendarDays(endDate, startDate)} đêm</p>}
    {open && <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-0 sm:p-5" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <section className="calendar-modal bg-white w-full sm:max-w-[540px] rounded-t-[1.6rem] sm:rounded-2xl max-h-[94vh] overflow-y-auto shadow-2xl">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between"><div><p className="calendar-modal-eyebrow">ĐẶT PHÒNG</p><h3>Chọn ngày nhận & trả phòng</h3></div><button type="button" onClick={() => setOpen(false)} className="calendar-close" aria-label="Đóng">×</button></header>
        <div className="grid grid-cols-2 gap-3 p-5 sm:px-7 sm:pt-6"><button type="button" onClick={() => setActiveField("checkin")} className={`calendar-summary ${activeField === "checkin" ? "calendar-summary-active" : ""}`}><span>CHECK-IN</span><b>{shortDate(tempStart)}</b><small>{tempStart ? `Âm ${getVietnameseLunarDate(tempStart).day}/${getVietnameseLunarDate(tempStart).month}` : "Chọn ngày nhận"}</small></button><button type="button" onClick={() => setActiveField("checkout")} className={`calendar-summary ${activeField === "checkout" ? "calendar-summary-active" : ""}`}><span>CHECK-OUT</span><b>{shortDate(tempEnd)}</b><small>{tempEnd ? `Âm ${getVietnameseLunarDate(tempEnd).day}/${getVietnameseLunarDate(tempEnd).month}` : "Chọn ngày trả"}</small></button></div>
        <p className="calendar-instruction px-5 sm:px-7">{activeField === "checkin" ? "① Chọn ngày nhận phòng" : "② Chọn ngày trả phòng"}</p>
        <div className="calendar-wrap px-3 sm:px-5 pb-2"><DatePicker inline locale="vi" selected={activeField === "checkin" ? tempStart : tempEnd} onChange={chooseDate} minDate={activeField === "checkout" && tempStart ? tempStart : (minDate || new Date())} excludeDateIntervals={excludeDateIntervals} onMonthChange={setVisibleMonth} renderDayContents={renderDay} dayClassName={(date) => `${inRange(date) ? "calendar-in-range" : ""} ${tempStart && isEqual(date, tempStart) ? "calendar-range-start" : ""} ${tempEnd && isEqual(date, tempEnd) ? "calendar-range-end" : ""}`} /></div>
        <div className="calendar-legend px-5 sm:px-7"><span><i className="calendar-legend-lunar" />Số nhỏ là ngày âm lịch</span><span><i className="calendar-legend-booked" />Ngày đã có khách đặt</span></div>
        {hint && <p className="calendar-hint mx-5 sm:mx-7">{hint}</p>}
        <footer className="sticky bottom-0 bg-white border-t border-slate-100 px-5 sm:px-7 py-4 flex items-center justify-between gap-3 mt-4"><div className="text-sm">{nights > 0 ? <><b className="text-brand-dark">{nights} đêm</b><span className="block text-xs text-slate-400 mt-0.5">{shortDate(tempStart)} – {shortDate(tempEnd)}</span></> : <span className="text-slate-400">Chọn đủ ngày để tiếp tục</span>}</div><div className="flex items-center gap-2"><button type="button" onClick={reset} className="text-sm text-slate-500 px-3 py-2">Đặt lại</button><button type="button" onClick={confirm} disabled={!tempStart || !tempEnd} className="btn-primary !px-5 !py-2.5 text-sm disabled:opacity-50">Xác nhận</button></div></footer>
      </section>
    </div>}
  </div>;
}
