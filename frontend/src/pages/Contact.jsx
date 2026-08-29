import { useTheme } from "../context/ThemeContext";

export default function Contact() {
  const { settings } = useTheme();
  const contact = settings.contact || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">Liên hệ & Bản đồ</h1>
        <p className="text-gray-500">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Thông tin liên hệ */}
        <div className="space-y-4">
          <div className="card p-5 flex items-start gap-4">
            <span className="text-2xl">📍</span>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Địa chỉ</h3>
              <p className="text-gray-600 text-sm">
                {contact.address || "Chưa cập nhật địa chỉ"}
              </p>
            </div>
          </div>

          <div className="card p-5 flex items-start gap-4">
            <span className="text-2xl">📞</span>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Hotline / Zalo</h3>
              <a href={`tel:${contact.phone || ""}`} className="text-brand font-medium text-sm block">
                {contact.phone || "Chưa cập nhật"} (Gọi trực tiếp)
              </a>
              <a
                href={`https://zalo.me/${contact.zalo || contact.phone || ""}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand font-medium text-sm block"
              >
                Nhắn Zalo →
              </a>
            </div>
          </div>

          <div className="card p-5 flex items-start gap-4">
            <span className="text-2xl">✉️</span>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
              <p className="text-gray-600 text-sm">{contact.email || "Chưa cập nhật"}</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-2">🚗 Hướng dẫn di chuyển</h3>
            <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-4">
              <li>{contact.directions || "Liên hệ homestay để được hướng dẫn đường đi chi tiết."}</li>
            </ul>
          </div>
        </div>

        {/* Bản đồ */}
        <div className="card overflow-hidden h-[420px] lg:h-auto">
          <iframe
            title={`Google Maps - ${settings.siteName}`}
            src={contact.mapUrl || "https://www.google.com/maps?q=Bu%C3%B4n+Ma+Thu%E1%BB%99t,+%C4%90%E1%BA%AFk+L%E1%BA%AFk&output=embed"}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 420 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
