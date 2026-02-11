# Phát triển ứng dụng quản lý nhà hàng - SpicyTown Restaurant
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770782506/logo_scou2k.png" width="300" height="300"/>
</p>

# Giới thiệu đồ án
Tên đề tài "Phát triển ứng dụng quản lý nhà hàng". 

Đồ án đã xây dựng và hoàn thiện một số chức năng quan trọng hướng đến cả khách hàng và hệ thống quản trị. Mục tiêu nghiên cứu tập trung vào việc đề xuất một giải pháp phần mềm tối ưu, nhằm hỗ trợ quy trình quản lý nhà hàng nói riêng và đóng góp cho ngành dịch vụ ăn uống nói chung.

Hệ thống được thiết kế lấy người dùng làm trung tâm, cho phép khách hàng thực hiện các thao tác đặt bàn, gọi món trực tuyến mà không cần thông qua nhân viên phục vụ, từ đó nâng cao trải nghiệm và tạo sự tiện lợi trong quá trình sử dụng dịch vụ. Ngoài ra, ứng dụng còn hỗ trợ thanh toán hóa đơn điện tử, đánh giá chất lượng món ăn, tìm kiếm sản phẩm nhanh chóng, góp phần hiện đại hóa mô hình phục vụ truyền thống. Ở phía quản trị, hệ thống cung cấp các chức năng quản lý người dùng, món ăn, bàn ăn, hóa đơn, cùng với báo cáo và thống kê trực quan, giúp nhà hàng dễ dàng kiểm soát hoạt động kinh doanh, tiết kiệm thời gian và nguồn lực. Hệ thống bước đầu tích hợp trí tuệ nhân tạo (AI) nhằm gợi ý và tư vấn món ăn phù hợp cho khách hàng, góp phần nâng cao trải nghiệm sử dụng dịch vụ.

Hệ thống được phát triển bằng ngôn ngữ lập trình Python, sử dụng Django Framework theo mô hình kiến trúc MVC (Model – View – Controller) nhằm đảm bảo tính tổ chức, dễ bảo trì và mở rộng.
Phần backend được xây dựng với Django kết hợp Django REST Framework để thiết kế và triển khai các RESTful API.
Phần frontend được phát triển bằng ReactJS, sử dụng JavaScript làm ngôn ngữ chính, kết hợp với Bootstrap để xây dựng giao diện thân thiện người dùng. 
Hệ thống sử dụng MySQL làm hệ quản trị cơ sở dữ liệu để lưu trữ và quản lý dữ liệu.

# Kiến trúc hệ thống

Hệ thống được xây dựng trên mô hình kiến trúc Client – Server, trong đó hai thành phần chính là back-end và front-end được tách biệt rõ ràng. Cách tổ chức này vừa nâng cao hiệu năng, vừa giúp việc bảo trì và mở rộng trong tương lai thuận lợi hơn.

<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770795101/kientruhethong_rod5r8.png" width="60%" />
  <em>Kiến trúc hệ thống</em>
</p>

# Cơ sở dữ liệu

<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770795444/cosodulieu_fhgwi1.png" width="60%"/><br>
  <em>Lược đồ cơ sở dữ liệu quan hệ</em>
</p>

# Các chức năng trong ứng dụng
***

## Chức năng người dùng

> - Đăng nhập và đăng ký
> - Quên mật khẩu
> - Đặt bàn ăn
> - Tìm kiếm và lọc theo danh mục
> - Xem chi tiết và đánh giá món ăn
> - Quản lý thông tin cá nhân
> - Chatbot AI
> - Thanh toán trực tuyến qua Momo và VNPay
> - Xem lịch sử đặt bàn, lịch sử đặt món trực tuyến
> - Gọi món ăn qua mã QR

## Chức năng quản trị (bao gồm quản trị viên, nhân viên quản lý và nhân viên phục vụ)

> - Đăng nhập
> - Thống kê báo cáo
> - Quản lý bàn ăn
> - Quản lý hóa đơn
> - Quản lý loại món ăn và món ăn
> - Quản lý trả lời đánh giá và đánh giá
> - Quản lý đơn đặt bàn
> - Quản lý người dùng

# Demo các chức năng nổi bật
> ## Đăng ký và đăng nhập
***
> - Đăng ký
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770800765/dangky_o1drmx.png" width="100%" />
</p>

> - Đăng nhập
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770800188/dangnhap_vbkwiw.png" width="100%" />
</p>

> ## Quên mật khẩu
***
> - Bấm quên mật khẩu nhập email xác thực
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770801516/Screenshot_2026-02-11_161518_qiqmf5.png" width="100%" />
</p>

> - Nhận email đổi mật khẩu
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770801516/traemailquenmk_pqrjaw.png" width="100%" />
</p>

> - Nhập mật khẩu mới
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770801516/Screenshot_2026-02-11_161635_jhw4af.png" width="100%" width="100%" />
</p>

> ## Đặt bàn ăn
***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805642/dat-ban_vekezz.png" width="100%" />
</p>

> ## Xem chi tiết và đánh giá món ăn
***
> - Xem chi tiết món ăn
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805646/chi-tiet--mon_yujjj6.png" width="100%" />
</p>

> - Đánh giá món ăn
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805642/danh-gia-nd_asvxzg.png" width="100%" />
</p>

> ## Quản lý thông tin cá nhân
***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805687/thong-tin-cn_mypffz.png" width="100%" />
</p>

> ## Chatbot AI
***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805643/chatbot_kfzym0.png" width="100%" />
</p>

> ## Thanh toán trực tuyến qua Momo và VNPay
***
> - Thanh toán Momo
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805642/momo_eekod3.png" width="100%" />
</p>

> - Thanh toán VNPay
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805687/vnpay_sbhjn5.png" width="100%" />
</p>

> ## Xem lịch sử đặt bàn, lịch sử đặt món trực tuyến
***
> - Lịch sử đặt bàn
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805643/ls-dat-ban_m24bud.png" width="100%" />
</p>

> - Lịch sử gọi món
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805644/ls-goi-mon_xbmhxd.png" width="100%" />
</p>

> ## Gọi món ăn qua mã QR
***
> Khách hàng có thể quét mã QR trên bàn ăn để gọi món qua thiết bị di động, đường dẫn sẽ truyền thêm mã bàn vào tham số, ví dụ như 192.168.1.104:3000/cart?table=1. Sau khi quét mã QR, khách hàng sẽ được truy cập vào trang giỏ hàng của hệ thống. Từ đó, khách hàng có thể quay về trang thực đơn, chọn món ăn và thêm vào giỏ hàng. Khi hoàn tất, khách hàng trở lại trang giỏ hàng và nhấn chọn gọi món để gửi đơn hàng.
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805642/goi-mon-qr_dr037e.png" width="100%" />
</p>

> ## Thống kê
***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805677/thong-ke_so4m94.png" width="100%" />
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805645/ql-thong-ke_seqhhk.png" width="100%" />
</p>

> ## Quản lý bàn ăn
***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805643/ql-ban-an_bxblo8.png" width="100%" />
</p>

> ## Quản lý hóa đơn
***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805644/ql-hoa-don_pgatsm.png" width="100%" />
</p>

> ## Quản lý món ăn
***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805645/ql-mon_ywxgsu.png" width="100%" />
</p>

> ## Quản lý đơn đặt bàn
***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805644/ql-don-dat-ban_ddrsac.png" width="100%" />
</p>

> ## Quản lý người dùng
> ***
<p align="center">
  <img src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1770805645/ql-user_rqmofl.png" width="100%" />
</p>




