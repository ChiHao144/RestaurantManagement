from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

from .views import MomoIPNViewSet

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('dishes', views.DishViewSet, basename='dish')
router.register('users', views.UserViewSet, basename='user')
router.register('reviews', views.ReviewViewSet, basename='review')
router.register('tables', views.TableViewSet, basename='table')
router.register('bookings', views.BookingViewSet, basename='booking')
router.register('orders', views.OrderViewSet, basename='order')



urlpatterns = [
    path('', include(router.urls)),
    path('momo/ipn', MomoIPNViewSet.as_view({'post': 'create'}), name='momo_ipn'),
]