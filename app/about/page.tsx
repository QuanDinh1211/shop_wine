"use client";
import { Wine, Users, Globe, Heart } from "lucide-react";
import Image from "next/image";

export default function GiớiThiệu() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner */}
      <section className="relative h-64 md:h-96">
        <Image
          src="https://images.pexels.com/photos/970386/pexels-photo-970386.jpeg"
          alt="Về WineVault"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              Về WineVault
            </h1>
            <p className="text-lg md:text-xl max-w-2xl">
              Khám phá câu chuyện, sứ mệnh và đam mê của chúng tôi trong việc
              mang đến những chai rượu vang tuyệt vời nhất đến Việt Nam
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Phần Tiêu đề */}
        <div className="text-center mb-12 mt-8">
          <h2 className="text-3xl font-bold text-red-900 mb-4">
            Giới Thiệu WineVault
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Trong hơn ba thập kỷ, WineVault đã là điểm đến hàng đầu tại Việt Nam
            cho những loại rượu vang xuất sắc, kết nối những người yêu rượu vang
            với những vườn nho tuyệt vời nhất trên thế giới.
          </p>
        </div>

        {/* Phần Câu chuyện */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Câu Chuyện Của Chúng Tôi
              </h3>
              <div className="space-y-3 text-gray-600 leading-relaxed text-sm">
                <p>
                  Được thành lập vào năm 1992 bởi người đam mê rượu vang Nguyễn
                  Minh Đức, WineVault bắt đầu như một doanh nghiệp gia đình nhỏ
                  với một ước mơ đơn giản: chia sẻ niềm vui từ những chai rượu
                  vang xuất sắc với những người yêu rượu vang tại Việt Nam.
                </p>
                <p>
                  Từ một cửa hàng nhỏ tại Thành phố Hồ Chí Minh, chúng tôi đã
                  phát triển thành nhà bán lẻ rượu vang đáng tin cậy nhất tại
                  Việt Nam, phục vụ hàng ngàn khách hàng trên cả nước. Đam mê
                  với rượu vang và cam kết về chất lượng của chúng tôi chưa bao
                  giờ lung lay.
                </p>
                <p>
                  Ngày nay, chúng tôi tiếp tục tôn vinh tầm nhìn của người sáng
                  lập bằng cách lựa chọn kỹ lưỡng từng chai rượu trong bộ sưu
                  tập, đảm bảo mỗi chai rượu đều kể một câu chuyện đáng để chia
                  sẻ.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-6 text-center">
              <Wine className="h-20 w-20 text-red-900 mx-auto mb-3" />
              <h4 className="text-xl font-bold text-red-900 mb-2">
                Từ Năm 1992
              </h4>
              <p className="text-red-800 text-sm">
                Hơn 30 năm kinh nghiệm về rượu vang
              </p>
            </div>
          </div>
        </div>

        {/* Sứ mệnh & Tầm nhìn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-4">Sứ Mệnh Của Chúng Tôi</h3>
            <p className="text-red-100 leading-relaxed text-sm">
              Dân chủ hóa thế giới rượu vang thượng hạng bằng cách làm cho những
              chai rượu xuất sắc trở nên dễ tiếp cận với mọi người, đồng thời
              giáo dục và truyền cảm hứng cho cộng đồng khám phá những hương vị,
              vùng đất và câu chuyện mà mỗi chai rượu mang lại.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tầm Nhìn Của Chúng Tôi
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Trở thành điểm đến rượu vang hàng đầu Đông Nam Á, được công nhận
              nhờ chuyên môn, sự chính trực và cam kết không ngừng nghỉ trong
              việc kết nối mọi người thông qua sự trân trọng chung đối với những
              chai rượu vang xuất sắc.
            </p>
          </div>
        </div>

        {/* Giá trị cốt lõi */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-red-900 mb-8">
            Giá Trị Cốt Lõi Của Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-3 rounded-full w-14 h-14 mx-auto mb-3 group-hover:bg-red-200 transition-colors">
                <Wine className="h-6 w-6 text-red-900 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Xuất Sắc</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Chúng tôi không bao giờ thỏa hiệp về chất lượng. Mỗi chai rượu
                đều được lựa chọn kỹ lưỡng và bảo quản đúng cách.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-3 rounded-full w-14 h-14 mx-auto mb-3 group-hover:bg-red-200 transition-colors">
                <Users className="h-6 w-6 text-red-900 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cộng Đồng
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Chúng tôi xây dựng mối quan hệ lâu dài với khách hàng, nhà cung
                cấp và cộng đồng yêu rượu vang.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-3 rounded-full w-14 h-14 mx-auto mb-3 group-hover:bg-red-200 transition-colors">
                <Globe className="h-6 w-6 text-red-900 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bền Vững</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Chúng tôi ủng hộ các nhà máy rượu vang có ý thức bảo vệ môi
                trường và các thực hành bền vững.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-3 rounded-full w-14 h-14 mx-auto mb-3 group-hover:bg-red-200 transition-colors">
                <Heart className="h-6 w-6 text-red-900 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Đam Mê</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Tình yêu với rượu vang là động lực cho mọi việc chúng tôi làm,
                từ lựa chọn đến dịch vụ khách hàng.
              </p>
            </div>
          </div>
        </div>

        {/* Phần Đội ngũ */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-3xl font-bold text-center text-red-900 mb-8">
            Gặp Gỡ Đội Ngũ Của Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-28 h-28 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-14 w-14 text-red-900" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Nguyễn Minh Đức
              </h3>
              <p className="text-red-800 font-semibold mb-2 text-sm">
                Nhà Sáng Lập & Chuyên Gia Rượu Vang
              </p>
              <p className="text-gray-600 text-sm">
                Với hơn 35 năm kinh nghiệm, Đức dẫn dắt việc lựa chọn rượu vang
                và các chương trình giáo dục của chúng tôi.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-28 h-28 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-14 w-14 text-red-900" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Trần Thu Hà
              </h3>
              <p className="text-red-800 font-semibold mb-2 text-sm">
                Trưởng Bộ Phận Vận Hành
              </p>
              <p className="text-gray-600 text-sm">
                Hà đảm bảo mỗi chai rượu đến tay khách hàng trong tình trạng
                hoàn hảo và đúng thời gian.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-28 h-28 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-14 w-14 text-red-900" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Lê Minh Quân
              </h3>
              <p className="text-red-800 font-semibold mb-2 text-sm">
                Giám Đốc Giáo Dục Rượu Vang
              </p>
              <p className="text-gray-600 text-sm">
                Quân tổ chức các sự kiện nếm thử và giúp khách hàng khám phá
                những chai rượu vang hoàn hảo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
