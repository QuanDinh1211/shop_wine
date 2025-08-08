"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Award,
  Truck,
  Shield,
  Star,
  RefreshCw,
  Mail,
  Clock,
} from "lucide-react";
import { Wine } from "@/lib/types";
import { toast } from "sonner";

export default function HomePage() {
  const [featuredWines, setFeaturedWines] = useState<Wine[]>([]);
  const [flashSaleWines, setFlashSaleWines] = useState<Wine[]>([]);
  const [wineTypes, setWineTypes] = useState<{ type: string; wines: Wine[] }[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [flashSaleLoading, setFlashSaleLoading] = useState<boolean>(true);
  const [wineTypesLoading, setWineTypesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [flashSaleError, setFlashSaleError] = useState<string | null>(null);
  const [wineTypesError, setWineTypesError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Lấy danh sách sản phẩm nổi bật
  const fetchFeaturedWines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wines/featured", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Không thể lấy danh sách sản phẩm nổi bật");
      }
      const data: Wine[] = await res.json();
      setFeaturedWines(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Lấy danh sách sản phẩm FLASH SALE
  const fetchFlashSaleWines = async () => {
    setFlashSaleLoading(true);
    setFlashSaleError(null);
    try {
      const res = await fetch("/api/wines/flash-sale", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Không thể lấy danh sách sản phẩm FLASH SALE");
      }
      const data: Wine[] = await res.json();
      setFlashSaleWines(data);
      setFlashSaleLoading(false);
    } catch (err: any) {
      setFlashSaleError(err.message);
      setFlashSaleLoading(false);
    }
  };

  // Lấy danh sách sản phẩm theo loại rượu
  const fetchWineTypes = async () => {
    setWineTypesLoading(true);
    setWineTypesError(null);
    try {
      const types = ["red", "white", "rose", "sparkling"];
      const wineTypesData = await Promise.all(
        types.map(async (type) => {
          const res = await fetch(`/api/wines?type=${type}&limit=4`, {
            cache: "no-store",
          });
          if (!res.ok) {
            throw new Error(`Không thể lấy danh sách sản phẩm loại ${type}`);
          }
          const { wines }: { wines: Wine[] } = await res.json();

          return { type, wines };
        })
      );
      setWineTypes(wineTypesData);
      setWineTypesLoading(false);
    } catch (err: any) {
      setWineTypesError(err.message);
      setWineTypesLoading(false);
    }
  };

  // Đồng hồ đếm ngược cho FLASH SALE
  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);

    const updateTimer = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchFeaturedWines();
    fetchFlashSaleWines();
    fetchWineTypes();
  }, []);

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi đăng ký");
      }

      toast.success("Đăng ký nhận thông tin thành công!");
      setEmail("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "red":
        return "Rượu Vang Đỏ";
      case "white":
        return "Rượu Vang Trắng";
      case "rose":
        return "Rượu Vang Hồng";
      case "sparkling":
        return "Rượu Vang Sủi";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-gray-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-red-600 text-white">
                  Chào mừng đến với WineVault
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Khám phá thế giới
                  <span className="text-red-300 block">rượu vang cao cấp</span>
                </h1>
                <p className="text-xl text-gray-200 leading-relaxed">
                  Bộ sưu tập rượu vang tinh tuyển từ những vùng đất nổi tiếng
                  nhất thế giới. Chất lượng đảm bảo, trải nghiệm đẳng cấp.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Khám phá ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-gray-500 hover:bg-white hover:text-gray-900"
                  >
                    Tìm hiểu thêm
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-300">500+</div>
                  <div className="text-sm text-gray-300">Sản phẩm</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-300">50+</div>
                  <div className="text-sm text-gray-300">Quốc gia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-300">10k+</div>
                  <div className="text-sm text-gray-300">Khách hàng</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.pexels.com/photos/1407244/pexels-photo-1407244.jpeg"
                  alt="Premium wine collection"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Chất lượng A+
                    </div>
                    <div className="text-sm text-gray-600">Được chứng nhận</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Những chai rượu vang được lựa chọn kỹ càng từ các nhà sản xuất uy
              tín nhất thế giới
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Skeleton Loader */}
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 animate-pulse"
                >
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="mt-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="mt-4 h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
              <div className="text-red-600 text-2xl font-semibold mb-2">
                Ôi không, có lỗi xảy ra!
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                {error}
              </p>
              <Button
                onClick={fetchFeaturedWines}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {featuredWines.map((wine) => (
                <ProductCard key={wine.id} wine={wine} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Xem tất cả sản phẩm
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tại sao chọn WineVault?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất cho
              khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chất lượng đảm bảo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tất cả sản phẩm đều được kiểm tra chất lượng nghiêm ngặt trước
                khi đến tay khách hàng
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Giao hàng nhanh
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Giao hàng toàn quốc trong 24-48h với hệ thống logistics chuyên
                nghiệp
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Bảo hành chính hãng
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cam kết sản phẩm chính hãng 100% với chính sách bảo hành rõ ràng
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Dịch vụ 5 sao
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Đội ngũ tư vấn chuyên nghiệp, hỗ trợ khách hàng 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FLASH SALE Section */}
      <section className="py-16 lg:py-24 bg-red-50 dark:bg-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              FLASH SALE
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Cơ hội sở hữu những chai rượu vang cao cấp với giá ưu đãi đặc
              biệt! Nhanh tay trước khi hết thời gian!
            </p>
            <div className="flex justify-center items-center mt-4">
              <Clock className="h-6 w-6 text-red-600 mr-2" />
              <span className="text-xl font-semibold text-red-600 dark:text-red-400">
                {timeLeft.hours.toString().padStart(2, "0")}:
                {timeLeft.minutes.toString().padStart(2, "0")}:
                {timeLeft.seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {flashSaleLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 animate-pulse"
                >
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="mt-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="mt-4 h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : flashSaleError ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
              <div className="text-red-600 text-2xl font-semibold mb-2">
                Ôi không, có lỗi xảy ra!
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                {flashSaleError}
              </p>
              <Button
                onClick={fetchFlashSaleWines}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {flashSaleWines.map((wine) => (
                <ProductCard key={wine.id} wine={wine} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/products?flashSale=true">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Xem tất cả FLASH SALE
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products by Wine Type Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sản phẩm theo loại rượu
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Khám phá bộ sưu tập rượu vang theo từng loại, từ đỏ đậm đà đến sủi
              tăm tinh tế
            </p>
          </div>

          {wineTypesLoading ? (
            <div className="space-y-12">
              {[...Array(4)].map((_, index) => (
                <div key={index}>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {[...Array(4)].map((_, subIndex) => (
                      <div
                        key={subIndex}
                        className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 animate-pulse"
                      >
                        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="mt-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="mt-4 h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : wineTypesError ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
              <div className="text-red-600 text-2xl font-semibold mb-2">
                Ôi không, có lỗi xảy ra!
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                {wineTypesError}
              </p>
              <Button
                onClick={fetchWineTypes}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {wineTypes.map(({ type, wines }) => (
                <div key={type}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {getTypeName(type)}
                    </h3>
                    <Link href={`/products?type=${type}`}>
                      <Button
                        variant="link"
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Xem thêm <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {wines.map((wine) => (
                      <ProductCard key={wine.id} wine={wine} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-red-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Đăng ký nhận thông tin
          </h2>
          <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
            Nhận thông tin về sản phẩm mới và các chương trình khuyến mãi đặc
            biệt
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 mr-2" />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : null}
              <span>Đăng ký</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
