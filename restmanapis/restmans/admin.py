from datetime import datetime
from django.contrib import admin
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncMonth
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.safestring import mark_safe
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
import json
from .models import Category, Dish, Order, OrderDetail, Review, Table, Booking, User, BookingDetail, ReviewReply
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html


class DishForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget, required=False)

    class Meta:
        model = Dish
        fields = '__all__'

class OrderDetailInline(admin.TabularInline):
    model = OrderDetail
    extra = 1
    readonly_fields = ['unit_price']

    def get_extra(self, request, obj=None, **kwargs):
        return 0 if obj else 1

class BookingDetailInline(admin.TabularInline):
    model = BookingDetail
    extra = 1

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'is_active', 'dish_count']
    search_fields = ['name']

    def dish_count(self, category):
        return category.dishes.count()
    dish_count.short_description = "Số lượng món ăn"

class DishAdmin(admin.ModelAdmin):
    list_display = ['id', "thumbnail", 'name', 'price', 'category', 'is_active', 'created_date']
    search_fields = ['name', 'category__name']
    list_filter = ['category', 'created_date', 'is_active']
    list_editable = ['price', 'is_active']
    readonly_fields = ['image_preview']
    form = DishForm

    def thumbnail(self, obj):
        if obj.image:
            return mark_safe(f"<img src='{obj.image.url}' width='60' style='border-radius:5px'/>")
        return "—"

    thumbnail.short_description = "Ảnh"

    def image_preview(self, dish):
        if dish and dish.image:
            return mark_safe(f"<img src='{dish.image.url}' width='200' alt='{dish.name}' />")
        return "Không có ảnh"
    image_preview.short_description = "Xem trước ảnh"

    class Media:
        css = {
            'all': ('/static/css/admin_style.css',)
        }

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'payment_method', 'status', 'created_date']
    search_fields = ['user__username', 'id']
    list_filter = ['status', 'payment_method', 'created_date']
    readonly_fields = ['total_amount', 'user']
    inlines = [OrderDetailInline]

class ReviewReplyInline(admin.TabularInline):
    model = ReviewReply
    extra = 1
    readonly_fields = ['user', 'created_date', 'updated_date']

class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'dish', 'rating', 'created_date']
    search_fields = ['user__username', 'dish__name']
    list_filter = ['rating', 'created_date']
    inlines = [ReviewReplyInline]

class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ["id", "review_link", "user", "short_content", "created_date"]
    search_fields = ["content", "user__username", "review__id"]
    list_filter = ["created_date", "user"]
    ordering = ["-created_date"]

    def short_content(self, obj):
        return obj.content[:50] + ("..." if len(obj.content) > 50 else "")
    short_content.short_description = "Nội dung phản hồi"

    def review_link(self, obj):
        return f"Đánh giá #{obj.review.id}"
    review_link.short_description = "Đánh giá gốc"

class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'get_booked_tables', 'booking_time', 'number_of_guests', 'status']
    search_fields = ['user__username', 'id']
    list_filter = ['status', 'booking_time']
    inlines = [BookingDetailInline]

    def get_booked_tables(self, booking_obj):
        tables = ", ".join([detail.table.table_number for detail in booking_obj.details.all()])
        return tables if tables else "Chưa có bàn"
    get_booked_tables.short_description = "Các bàn đã đặt"

class RestaurantAdminSite(admin.AdminSite):
    site_header = 'Hệ Thống Quản Lý Nhà Hàng'
    site_title = 'Trang quản trị'
    index_title = 'Chào mừng đến với trang quản trị nhà hàng'

    def get_urls(self):
        return [
            path('statistics/', self.statistics_view, name='statistics'),
        ] + super().get_urls()

    def statistics_view(self, request):

        current_year = datetime.now().year
        current_month = datetime.now().month

        year = int(request.GET.get('year', current_year))
        month = int(request.GET.get('month', current_month))

        total_revenue = Order.objects.filter(status='COMPLETED').aggregate(total=Sum('total_amount'))['total'] or 0
        total_completed_orders = Order.objects.filter(status='COMPLETED').count()
        total_guests_served = Booking.objects.filter(status='COMPLETED').aggregate(total=Sum('number_of_guests'))[
                                  'total'] or 0

        revenue_by_month = Order.objects.filter(
            created_date__year=year,
            status='COMPLETED'
        ).annotate(
            month=TruncMonth('created_date')
        ).values('month').annotate(
            total=Sum('total_amount')
        ).order_by('month')

        dish_popularity = Dish.objects.annotate(
            order_count=Count('order_details')
        ).filter(order_count__gt=0).values('name', 'order_count').order_by('-order_count')[:10]

        review_counts = Dish.objects.annotate(
            review_count=Count('reviews')
        ).filter(review_count__gt=0).values('name', 'review_count').order_by('-review_count')

        average_ratings = Dish.objects.annotate(
            avg_rating=Avg('reviews__rating')
        ).filter(avg_rating__isnull=False).values('name', 'avg_rating').order_by('-avg_rating')

        context = {
            'title': f'Thống kê Kinh doanh - {month}/{year}',
            'total_revenue': total_revenue,
            'total_completed_orders': total_completed_orders,
            'total_guests_served': total_guests_served,
            'revenue_by_month': list(revenue_by_month),
            'dish_popularity': list(dish_popularity),
            'current_year': year,
            'current_month': month,
            'year_options': range(current_year, current_year - 5, -1),
            'review_counts': list(review_counts),
            'average_ratings': list(average_ratings),
        }
        return TemplateResponse(request, 'admin/statistics.html', context)

class TableAdmin(admin.ModelAdmin):
    list_display = ["id", "table_number", "capacity", "status_badge"]
    search_fields = ["table_number"]
    list_filter = ["status", "capacity"]
    ordering = ["table_number"]

    # Hiển thị status dưới dạng badge màu
    def status_badge(self, obj):
        colors = {
            obj.TableStatus.AVAILABLE: "green",
            obj.TableStatus.OCCUPIED: "orange",
            obj.TableStatus.CLEANING: "red",
        }
        color = colors.get(obj.status, "gray")
        return format_html(
            '<span style="padding:3px 8px;border-radius:4px;background-color:{};color:white;font-size:12px;">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Trạng thái"

class UserAdmin(BaseUserAdmin):
    list_display = ["id", "avatar_thumb", "username", "email", "full_name", "is_active", "is_staff", "role_badge"]
    search_fields = ["username", "email", "first_name", "last_name"]
    list_filter = ["is_active", "is_staff", "is_superuser", "role"]
    ordering = ["-date_joined"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Thông tin bổ sung", {
            "fields": ("avatar", "role"),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Thông tin bổ sung", {
            "fields": ("avatar", "role"),
        }),
    )

    def avatar_thumb(self, obj):
        if obj.avatar:
            return format_html(
                "<img src='{}' width='40' height='40' style='border-radius:50%;object-fit:cover'/>",
                obj.avatar.url
            )
        return "—"
    avatar_thumb.short_description = "Ảnh"

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or "—"
    full_name.short_description = "Họ và Tên"

    def role_badge(self, obj):
        colors = {
            obj.Role.ADMIN: "red",
            obj.Role.MANAGER: "blue",
            obj.Role.WAITER: "green",
            obj.Role.CUSTOMER: "gray",
        }
        color = colors.get(obj.role, "black")
        return format_html(
            '<span style="padding:3px 8px;border-radius:4px;background-color:{};color:white;font-size:12px;">{}</span>',
            color,
            obj.get_role_display(),
        )
    role_badge.short_description = "Vai trò"

    # CHẶN ADMIN PHỤ CHỈNH QUYỀN ADMIN CHỦ NHÀ HÀNG
    def has_change_permission(self, request, obj=None):
        if obj and obj.username == "admin":
            if request.user.username != "admin":
                return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if obj and obj.username == "admin":
            if request.user.username != "admin":
                return False
        return super().has_delete_permission(request, obj)

    def get_readonly_fields(self, request, obj=None):
        readonly = list(super().get_readonly_fields(request, obj))
        if obj and obj.username == "admin" and request.user.username != "admin":
            readonly += ["role", "is_superuser", "is_staff", "username"]
        return readonly


admin_site = RestaurantAdminSite(name='RestaurantAdmin')

admin_site.register(Category, CategoryAdmin)
admin_site.register(Dish, DishAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(Review, ReviewAdmin)
admin_site.register(ReviewReply, ReviewReplyAdmin)
admin_site.register(Table, TableAdmin)
admin_site.register(Booking, BookingAdmin)
admin_site.register(User, UserAdmin)
