from rest_framework.pagination import PageNumberPagination

class DishPagination(PageNumberPagination):
    page_size = 8
