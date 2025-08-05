"use client";
import { Wine, Users, Globe, Heart } from "lucide-react";

export default function GiớiThiệu() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Phần Tiêu đề */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-red-900 mb-6">Về WineVault</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Trong hơn ba thập kỷ, WineVault đã là điểm đến hàng đầu tại Việt Nam
            cho những loại rượu vang xuất sắc, kết nối những người yêu rượu vang
            với những vườn nho tuyệt vời nhất trên thế giới.
          </p>
        </div>

        {/* Phần Câu chuyện */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Câu Chuyện Của Chúng Tôi
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
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
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-8 text-center">
              <Wine className="h-24 w-24 text-red-900 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-red-900 mb-2">
                Từ Năm 1992
              </h3>
              <p className="text-red-800">
                Hơn 30 năm kinh nghiệm về rượu vang
              </p>
            </div>
          </div>
        </div>

        {/* Sứ mệnh & Tầm nhìn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">Sứ Mệnh Của Chúng Tôi</h2>
            <p className="text-red-100 leading-relaxed text-lg">
              Dân chủ hóa thế giới rượu vang thượng hạng bằng cách làm cho những
              chai rượu xuất sắc trở nên dễ tiếp cận với mọi người, đồng thời
              giáo dục và truyền cảm hứng cho cộng đồng khám phá những hương vị,
              vùng đất và câu chuyện mà mỗi chai rượu mang lại.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Tầm Nhìn Của Chúng Tôi
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Trở thành điểm đến rượu vang hàng đầu Đông Nam Á, được công nhận
              nhờ chuyên môn, sự chính trực và cam kết không ngừng nghỉ trong
              việc kết nối mọi người thông qua sự trân trọng chung đối với những
              chai rượu vang xuất sắc.
            </p>
          </div>
        </div>

        {/* Giá trị cốt lõi */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-red-900 mb-12">
            Giá Trị Cốt Lõi Của Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Wine className="h-8 w-8 text-red-900 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Xuất Sắc</h3>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi không bao giờ thỏa hiệp về chất lượng. Mỗi chai rượu
                đều được lựa chọn kỹ lưỡng và bảo quản đúng cách.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Users className="h-8 w-8 text-red-900 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Cộng Đồng
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi xây dựng mối quan hệ lâu dài với khách hàng, nhà cung
                cấp và cộng đồng yêu rượu vang.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Globe className="h-8 w-8 text-red-900 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bền Vững</h3>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi ủng hộ các nhà máy rượu vang có ý thức bảo vệ môi
                trường và các thực hành bền vững.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Heart className="h-8 w-8 text-red-900 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Đam Mê</h3>
              <p className="text-gray-600 leading-relaxed">
                Tình yêu với rượu vang là động lực cho mọi việc chúng tôi làm,
                từ lựa chọn đến dịch vụ khách hàng.
              </p>
            </div>
          </div>
        </div>

        {/* Phần Đội ngũ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-4xl font-bold text-center text-red-900 mb-12">
            Gặp Gỡ Đội Ngũ Của Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nguyễn Minh Đức
              </h3>
              <p className="text-red-800 font-semibold mb-2">
                Nhà Sáng Lập & Chuyên Gia Rượu Vang
              </p>
              <p className="text-gray-600 text-sm">
                Với hơn 35 năm kinh nghiệm, Đức dẫn dắt việc lựa chọn rượu vang
                và các chương trình giáo dục của chúng tôi.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Trần Thu Hà
              </h3>
              <p className="text-red-800 font-semibold mb-2">
                Trưởng Bộ Phận Vận Hành
              </p>
              <p className="text-gray-600 text-sm">
                Hà đảm bảo mỗi chai rượu đến tay khách hàng trong tình trạng
                hoàn hảo và đúng thời gian.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Lê Minh Quân
              </h3>
              <p className="text-red-800 font-semibold mb-2">
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
