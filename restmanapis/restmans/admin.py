from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.safestring import mark_safe
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget

from .models import Category, Dish, Order, OrderDetail, Review, Table, Booking, User, BookingDetail

# --- Custom Forms ---
class DishForm(forms.ModelForm):
    """Sử dụng CKEditor cho trường mô tả của Món Ăn."""
    description = forms.CharField(widget=CKEditorUploadingWidget, required=False)

    class Meta:
        model = Dish
        fields = '__all__'

# --- Inline Admins ---
class OrderDetailInline(admin.TabularInline):
    """Hiển thị chi tiết hóa đơn ngay trong trang hóa đơn (dạng bảng)."""
    model = OrderDetail
    extra = 1 # Số lượng dòng trống để thêm mới
    readonly_fields = ['unit_price'] # Không cho sửa đơn giá đã lưu

class BookingDetailInline(admin.TabularInline):
    """Hiển thị chi tiết đặt bàn ngay trong trang đặt bàn."""
    model = BookingDetail
    extra = 1 # Số lượng dòng trống để thêm mới

# --- Model Admins ---
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'is_active', 'dish_count']
    search_fields = ['name']

    def dish_count(self, category):
        """Thêm cột hiển thị số lượng món ăn trong mỗi loại."""
        return category.dishes.count()
    dish_count.short_description = "Số lượng món ăn"

class DishAdmin(admin.ModelAdmin):
    """Tùy chỉnh admin cho Món Ăn, tương tự như MyLessonAdmin."""
    list_display = ['id', 'name', 'price', 'category', 'is_active', 'created_date']
    search_fields = ['name', 'category__name']
    list_filter = ['category', 'created_date', 'is_active']
    list_editable = ['price', 'is_active']
    readonly_fields = ['image_preview']
    form = DishForm

    def image_preview(self, dish):
        """Hiển thị ảnh món ăn trong trang chi tiết."""
        if dish and dish.image:
            return mark_safe(f"<img src='{dish.image.url}' width='200' alt='{dish.name}' />")
        return "Không có ảnh"
    image_preview.short_description = "Xem trước ảnh"

    # Thêm CSS tùy chỉnh vào trang admin của Dish
    class Media:
        css = {
            'all': ('/static/css/admin_style.css',)
        }

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'payment_method', 'status', 'created_date']
    search_fields = ['user__username', 'id']
    list_filter = ['status', 'payment_method', 'created_date']
    readonly_fields = ['total_amount', 'user']
    inlines = [OrderDetailInline] # Thêm chi tiết hóa đơn vào trang hóa đơn

class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'dish', 'rating', 'created_date']
    search_fields = ['user__username', 'dish__name']
    list_filter = ['rating', 'created_date']

class BookingAdmin(admin.ModelAdmin):
    """Tùy chỉnh admin cho Đơn Đặt Bàn."""
    list_display = ['id', 'user', 'get_booked_tables', 'booking_time', 'number_of_guests', 'status']
    search_fields = ['user__username', 'id']
    list_filter = ['status', 'booking_time']
    inlines = [BookingDetailInline]

    def get_booked_tables(self, booking_obj):
        """Lấy và hiển thị danh sách các số bàn đã đặt trong đơn."""
        tables = ", ".join([detail.table.table_number for detail in booking_obj.details.all()])
        return tables if tables else "Chưa có bàn"
    get_booked_tables.short_description = "Các bàn đã đặt" # Tên cột trong admin

# --- Custom Admin Site ---
class RestaurantAdminSite(admin.AdminSite):
    """Tạo một trang admin tùy chỉnh."""
    site_header = 'Hệ Thống Quản Lý Nhà Hàng'
    site_title = 'Trang quản trị'
    index_title = 'Chào mừng đến với trang quản trị nhà hàng'

    def get_urls(self):
        """Thêm URL tùy chỉnh cho trang thống kê."""
        return [
            path('dish-stats/', self.dish_stats, name='dish-stats'),
        ] + super().get_urls()

    def dish_stats(self, request):
        """View để hiển thị thống kê."""
        stats = Category.objects.annotate(dish_count=Count('dishes__id')).values('id', 'name', 'dish_count')

        return TemplateResponse(request, 'admin/stats.html', {
            'stats': stats,
            'title': 'Thống kê số lượng món ăn'
        })

# Khởi tạo admin site
admin_site = RestaurantAdminSite(name='RestaurantAdmin')

# Đăng ký các model với admin site tùy chỉnh
admin_site.register(Category, CategoryAdmin)
admin_site.register(Dish, DishAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Table)
admin_site.register(Booking, BookingAdmin)
admin_site.register(User) # Đăng ký cả model User
