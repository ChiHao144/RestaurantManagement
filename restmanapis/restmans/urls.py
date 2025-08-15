from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('dishes', views.DishViewSet, basename='dish')
router.register('users', views.UserViewSet, basename='user')
router.register('reviews', views.ReviewViewSet, basename='review')



urlpatterns = [
    path('', include(router.urls)),
]