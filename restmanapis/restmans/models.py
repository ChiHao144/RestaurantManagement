from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from django.core.validators import MinValueValidator, MaxValueValidator
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Quản trị viên'
        MANAGER = 'MANAGER', 'Quản lý'
        WAITER = 'WAITER', 'Phục vụ'
        CUSTOMER = 'CUSTOMER', 'Khách hàng'

    avatar = CloudinaryField(null=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CUSTOMER, verbose_name="Vai trò")


class BaseModel(models.Model):
    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")
    created_date = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_date = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        abstract = True


class Category(BaseModel):
    name = models.CharField(max_length=100, unique=True, verbose_name="Tên loại món ăn")
    description = models.TextField(null=True, blank=True, verbose_name="Mô tả")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Loại Món Ăn"
        verbose_name_plural = "Các Loại Món Ăn"


class Dish(BaseModel):
    name = models.CharField(max_length=255, verbose_name="Tên món ăn")
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)],
                                verbose_name="Giá tiền")
    image = CloudinaryField(verbose_name="Ảnh món ăn")
    description = RichTextField(null=True, verbose_name="Mô tả")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='dishes',
                                 verbose_name="Loại món ăn")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Món Ăn"
        verbose_name_plural = "Các Món Ăn"
        ordering = ['-id']


class Order(BaseModel):
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Tiền mặt'
        VNPAY = 'VNPAY', 'Ví VNPAY'
        MOMO = 'MOMO', 'Ví MoMo'

    class OrderStatus(models.TextChoices):
        PENDING = 'PENDING', 'Đang chờ'
        PAID = 'PAID', 'Đã thanh toán'
        SHIPPING = 'SHIPPING', 'Đang giao'
        COMPLETED = 'COMPLETED', 'Hoàn thành'
        CANCELLED = 'CANCELLED', 'Đã hủy'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name="Người dùng",
                             null=True, blank=True)
    table = models.ForeignKey('Table', on_delete=models.SET_NULL, related_name='orders', verbose_name="Bàn ăn",
                              null=True, blank=True)

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Tổng tiền")
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices, default=PaymentMethod.CASH,
                                      verbose_name="Hình thức thanh toán")
    status = models.CharField(max_length=10, choices=OrderStatus.choices, default=OrderStatus.PENDING,
                              verbose_name="Trạng thái")
    note = models.TextField(null=True, blank=True, verbose_name="Ghi chú hóa đơn")
    shipping_address = models.CharField(max_length=255, null=True, blank=True, verbose_name="Địa chỉ giao hàng")

    def __str__(self):
        if self.user:
            return f"Hóa đơn #{self.id} của {self.user.username}"
        if self.table:
            return f"Hóa đơn #{self.id} tại {self.table}"
        return f"Hóa đơn #{self.id}"


    class Meta:
        verbose_name = "Hóa Đơn"
        verbose_name_plural = "Các Hóa Đơn"
        ordering = ['-created_date']


class OrderDetail(BaseModel):
    """Model Chi Tiết Hóa Đơn"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='details', verbose_name="Hóa đơn")
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, related_name='order_details', verbose_name="Món ăn")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Số lượng")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2,
                                     verbose_name="Đơn giá")  # Lưu lại giá tại thời điểm đặt

    def __str__(self):
        return f"{self.quantity} x {self.dish.name} trong Hóa đơn #{self.order.id}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.unit_price = self.dish.price
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Chi Tiết Hóa Đơn"
        verbose_name_plural = "Các Chi Tiết Hóa Đơn"
        unique_together = ('order', 'dish')


class Review(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', verbose_name="Người dùng")
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, related_name='reviews', verbose_name="Món ăn")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)],
                                              verbose_name="Số sao")
    content = models.TextField(verbose_name="Nội dung đánh giá")

    def __str__(self):
        return f"Đánh giá {self.rating} sao cho {self.dish.name} bởi {self.user.username}"

    class Meta:
        verbose_name = "Đánh Giá"
        verbose_name_plural = "Các Đánh Giá"
        unique_together = ('user', 'dish')

class ReviewReply(BaseModel):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='replies', verbose_name="Đánh giá gốc")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Nhân viên phản hồi")
    content = models.TextField(verbose_name="Nội dung phản hồi")

    def __str__(self):
        return f"Phản hồi của {self.user.username} cho đánh giá #{self.review.id}"

    class Meta:
        verbose_name = "Phản hồi Đánh giá"
        verbose_name_plural = "Các Phản hồi Đánh giá"
        ordering = ['created_date']


class Table(BaseModel):
    class TableStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Trống'
        OCCUPIED = 'OCCUPIED', 'Đang phục vụ'
        CLEANING = 'CLEANING', 'Cần dọn dẹp'
    table_number = models.CharField(max_length=10, unique=True, verbose_name="Số bàn")
    capacity = models.PositiveIntegerField(verbose_name="Sức chứa")
    status = models.CharField(max_length=10, choices=TableStatus.choices, default=TableStatus.AVAILABLE,
                              verbose_name="Trạng thái bàn")

    def __str__(self):
        return f"Bàn {self.table_number} (Sức chứa: {self.capacity} người)"

    class Meta:
        verbose_name = "Bàn Ăn"
        verbose_name_plural = "Các Bàn Ăn"
        ordering = ['table_number']


class Booking(BaseModel):
    class BookingStatus(models.TextChoices):
        CONFIRMED = 'CONFIRMED', 'Đã xác nhận'
        PENDING = 'PENDING', 'Đang chờ'
        CANCELLED = 'CANCELLED', 'Đã hủy'
        COMPLETED = 'COMPLETED', 'Đã hoàn thành'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings', verbose_name="Người dùng")
    booking_time = models.DateTimeField(verbose_name="Thời gian tạo đơn")  # Thời gian khách hàng tạo đơn
    number_of_guests = models.PositiveIntegerField(verbose_name="Số lượng khách")
    note = models.TextField(null=True, blank=True, verbose_name="Ghi chú chung")
    status = models.CharField(max_length=10, choices=BookingStatus.choices, default=BookingStatus.PENDING,
                              verbose_name="Trạng thái")

    def __str__(self):
        return f"Đơn đặt bàn #{self.id} của {self.user.username}"

    class Meta:
        verbose_name = "Đơn Đặt Bàn"
        verbose_name_plural = "Các Đơn Đặt Bàn"
        ordering = ['-booking_time']


class BookingDetail(BaseModel):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='details', verbose_name="Đơn đặt bàn")
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='booking_details', verbose_name="Bàn ăn")
    start_time = models.DateTimeField(verbose_name="Thời gian bắt đầu")
    end_time = models.DateTimeField(verbose_name="Thời gian kết thúc")
    note = models.TextField(null=True, blank=True, verbose_name="Ghi chú chi tiết")

    def __str__(self):
        return f"Bàn {self.table.table_number} cho Đơn #{self.booking.id}"

    class Meta:
        verbose_name = "Chi Tiết Đặt Bàn"
        verbose_name_plural = "Các Chi Tiết Đặt Bàn"
