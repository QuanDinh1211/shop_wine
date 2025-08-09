"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function LiênHệ() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Vui lòng nhập email hợp lệ");
      return false;
    }
    const validSubjects = [
      "general",
      "order",
      "wine-advice",
      "events",
      "corporate",
      "other",
    ];
    if (!validSubjects.includes(formData.subject)) {
      toast.error("Vui lòng chọn chủ đề hợp lệ");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi gửi tin nhắn");
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast.success("Tin nhắn của bạn đã được gửi thành công!");
    } catch (error: any) {
      setSubmitStatus("error");
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  return (
    <div className="min-h-screen  bg-gray-50 dark:bg-gray-900">
      {/* Banner */}
      <section className="relative h-64 md:h-96">
        <Image
          src="https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg"
          alt="Liên hệ với Vino Cellar"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-lg md:text-xl max-w-2xl">
              Kết nối với Vino Cellar để nhận tư vấn, hỗ trợ hoặc chia sẻ trải
              nghiệm về rượu vang
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <div className="text-center mb-12 mt-8">
          <h2 className="text-3xl font-bold text-red-900 mb-4">
            Chúng Tôi Luôn Sẵn Sàng Hỗ Trợ
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Gửi tin nhắn cho chúng tôi hoặc liên hệ trực tiếp qua thông tin bên
            dưới. Đội ngũ của chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Thông tin liên hệ */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-red-900 mb-6">
                Kết Nối Với Chúng Tôi
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-900" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      Địa Chỉ
                    </h4>
                    <p className="text-gray-600 text-sm">
                      123 Phố Rượu, Quận 1, Thành phố Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-red-900" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      Điện Thoại
                    </h4>
                    <p className="text-gray-600 text-sm">+84 123 456 789</p>
                    <p className="text-gray-600 text-sm">+84 987 654 321</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-red-900" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      Email
                    </h4>
                    <p className="text-gray-600 text-sm">info@vinocellar.com</p>
                    <p className="text-gray-600 text-sm">
                      support@vinocellar.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-red-900" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      Giờ Làm Việc
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Thứ Hai - Thứ Bảy: 9:00 Sáng - 8:00 Tối
                      <br />
                      Chủ Nhật: 10:00 Sáng - 6:00 Tối
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phần giữ chỗ cho bản đồ */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-red-900 mb-4">
                Ghé Thăm Cửa Hàng Của Chúng Tôi
              </h3>
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg h-56 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-red-900 mx-auto mb-3" />
                  <p className="text-red-800 font-semibold text-sm">
                    Bản Đồ Tương Tác
                  </p>
                  <p className="text-red-700 text-xs">
                    123 Phố Rượu, Quận 1, TP.HCM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Biểu mẫu liên hệ */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-red-900 mb-6">
              Gửi Tin Nhắn Cho Chúng Tôi
            </h3>

            {submitStatus === "success" && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công.
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  Xin lỗi, có lỗi xảy ra khi gửi tin nhắn của bạn. Vui lòng thử
                  lại.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Họ và Tên *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all text-sm"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Địa Chỉ Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all text-sm"
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Chủ Đề *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all text-sm"
                >
                  <option value="">Chọn một chủ đề</option>
                  <option value="general">Thắc Mắc Chung</option>
                  <option value="order">Hỗ Trợ Đơn Hàng</option>
                  <option value="wine-advice">Gợi Ý Rượu</option>
                  <option value="events">Sự Kiện & Nếm Thử</option>
                  <option value="corporate">Đơn Hàng Doanh Nghiệp</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Tin Nhắn *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all resize-none text-sm"
                  placeholder="Hãy cho chúng tôi biết chúng tôi có thể giúp gì cho bạn..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-red-900 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                  isSubmitting
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:bg-red-800 transform hover:scale-105"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang Gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Gửi Tin Nhắn</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
