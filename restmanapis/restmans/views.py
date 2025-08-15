from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from restmans.models import Category, Dish, User, Review
from restmans import serializers, paginators


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = serializers.CategorySerializer

class DishViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Dish.objects.filter(is_active=True)
    serializer_class = serializers.DishSerializer
    pagination_class = paginators.DishPagination

    def get_queryset(self):
        queryset = self.queryset

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(name__icontains=q)

        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            queryset = queryset.filter(category_id=cate_id)

        return queryset

    @action(methods=['get'], detail=True, url_path='reviews')
    def get_reviews(self, request, pk):
        dish = self.get_object()
        reviews = dish.reviews.select_related('user').filter(is_active=True)
        return Response(serializers.ReviewSerializer(reviews, many=True).data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        if request.method.__eq__('PATCH'):
            u = request.user

            for key in request.data:
                if key in ['first_name', 'last_name']:
                    setattr(u, key, request.data[key])
                elif key.__eq__('password'):
                    u.set_password(request.data[key])

            u.save()
            return Response(serializers.UserSerializer(u).data)
        else:
             return Response(serializers.UserSerializer(request.user).data)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_active=True)
    serializer_class = serializers.ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]