from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('dishes', views.DishViewSet, basename='dish')
router.register('users', views.UserViewSet, basename='user')
router.register('reviews', views.ReviewViewSet, basename='review')
router.register('allreviews', views.AllReviewsViewSet, basename='allreviews')
router.register('tables', views.TableViewSet, basename='table')
router.register('bookings', views.BookingViewSet, basename='booking')
router.register('orders', views.OrderViewSet, basename='order')
router.register('momo', views.MomoIPNViewSet, basename='momo')
router.register('vnpay', views.VNPayIPNViewSet, basename='vnpay')
router.register('vnpay/return', views.VNPayReturnViewSet, basename='vnpay-return')
router.register('momo/return', views.MomoReturnViewSet, basename='momo-return')
router.register('stats', views.StatsViewSet, basename='stats')
router.register('chatbot', views.ChatbotViewSet, basename='chatbot')
router.register('password-reset', views.PasswordResetViewSet, basename='password-reset')




urlpatterns = [
    path('', include(router.urls)),
]