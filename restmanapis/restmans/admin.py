from datetime import datetime

from django.contrib import admin
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.safestring import mark_safe
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
import json
from .models import Category, Dish, Order, OrderDetail, Review, Table, Booking, User, BookingDetail, ReviewReply


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

class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'get_booked_tables', 'booking_time', 'number_of_guests', 'status']
    search_fields = ['user__username', 'id']
    list_filter = ['status', 'booking_time']
    inlines = [BookingDetailInline]

    def get_booked_tables(self, booking_obj):
        tables = ", ".join([detail.table.table_number for detail in booking_obj.details.all()])
        return tables if tables else "Chưa có bàn"
    get_booked_tables.short_description = "Các bàn đã đặt" # Tên cột trong admin

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
        ).filter(order_count__gt=0).values('name', 'order_count').order_by('-order_count')[:10]  # Lấy top 10

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
        }
        return TemplateResponse(request, 'admin/statistics.html', context)

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "avatar_thumb", "username", "email", "full_name", "is_active", "is_staff"]
    search_fields = ["username", "email", "first_name", "last_name"]
    list_filter = ["is_active", "is_staff", "is_superuser"]
    ordering = ["-date_joined"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Thông tin bổ sung", {
            "fields": ("avatar",),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Thông tin bổ sung", {
            "fields": ("avatar",),
        }),
    )

    def avatar_thumb(self, obj):
        if obj.avatar:
            return format_html("<img src='{}' width='40' height='40' style='border-radius:50%;object-fit:cover'/>", obj.avatar.url)
        return "—"
    avatar_thumb.short_description = "Ảnh"

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or "—"
    full_name.short_description = "Họ và Tên"


admin_site = RestaurantAdminSite(name='RestaurantAdmin')

admin_site.register(Category, CategoryAdmin)
admin_site.register(Dish, DishAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(Review, ReviewAdmin)
admin_site.register(ReviewReply)
admin_site.register(Table)
admin_site.register(Booking, BookingAdmin)
admin_site.register(User, UserAdmin)
