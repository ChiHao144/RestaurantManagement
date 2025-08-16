from datetime import datetime

from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from restmans.models import Category, Dish, User, Review, Table, Booking, BookingDetail, OrderDetail, Order
from restmans import serializers, paginators, perms


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

    def get_permissions(self):
        if self.action in ['get_reviews', 'rating'] and self.request.method.__eq__('POST'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'post'], detail=True, url_path='reviews')
    def get_reviews(self, request, pk):
        if request.method.__eq__('POST'):
            u = serializers.ReviewSerializer(data={
                'content': request.data.get('content'),
                'rating': request.data.get('rating'),
                'user': request.user.pk,
                'dish': pk
            })

            u.is_valid(raise_exception=True)
            r = u.save()
            return Response(serializers.ReviewSerializer(r).data, status=status.HTTP_201_CREATED)
        else:
            dish = self.get_object()
            reviews = dish.reviews.select_related('user').filter(is_active=True)
            return Response(serializers.ReviewSerializer(reviews, many=True).data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
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


class ReviewViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Review.objects.filter(is_active=True)
    serializer_class = serializers.ReviewSerializer
    permission_classes = [perms.IsReviewOwner]


class TableViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset =  Table.objects.filter(is_active=True)
    serializer_class = serializers.TableSerializer
    permission_classes = [permissions.AllowAny]

    @action(methods=['get'], detail=False, url_path='available')
    def available(self, request):
        """
        [MỚI] API để tìm các bàn trống.
        Params: ?start_time=...&end_time=...&guests=...
        Ví dụ: /tables/available/?start_time=2025-12-24T19:00:00&end_time=2025-12-24T21:00:00&guests=4
        """
        start_time_str = request.query_params.get('start_time')
        end_time_str = request.query_params.get('end_time')
        guests = request.query_params.get('guests')

        if not all([start_time_str, end_time_str, guests]):
            return Response({'error': 'Vui lòng cung cấp đủ start_time, end_time, và guests.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
            guests = int(guests)
        except (ValueError, TypeError):
            return Response({'error': 'Định dạng thời gian hoặc số lượng khách không hợp lệ.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Logic tìm các bàn đã bị đặt và có khung giờ chồng chéo
        # Một khung giờ bị chồng chéo nếu: (start1 < end2) and (end1 > start2)
        overlapping_bookings = BookingDetail.objects.filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        )

        # Lấy ID của các bàn đã bị chiếm dụng trong khung giờ đó
        booked_table_ids = overlapping_bookings.values_list('table_id', flat=True)

        # Lấy tất cả các bàn thỏa mãn sức chứa và không nằm trong danh sách đã bị chiếm dụng
        available_tables = Table.objects.filter(capacity__gte=guests).exclude(id__in=booked_table_ids)

        return Response(self.get_serializer(available_tables, many=True).data, status=status.HTTP_200_OK)

class BookingViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    """API để tạo và xem lịch sử đặt bàn của người dùng."""
    queryset = Booking.objects.all()
    serializer_class = serializers.BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [User.Role.MANAGER, User.Role.ADMIN, User.Role.WAITER]:
            return self.queryset
        return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        """Tự động gán người dùng hiện tại khi tạo đơn."""
        serializer.save(user=self.request.user)

    @action(methods=['post'], detail=True, url_path='assign-details', permission_classes=[perms.IsManagerUser])
    def assign_details(self, request, pk):
        """
        Action để Nhân viên/Quản lý gán bàn cụ thể cho một đơn đặt bàn.
        Input: { "details": [ { "table_id": 1, "start_time": "...", "end_time": "..." } ] }
        """
        try:
            booking = self.get_object()
            if booking.status != 'PENDING':
                return Response({'error': 'Chỉ có thể gán bàn cho đơn đặt bàn đang chờ.'},
                                status=status.HTTP_400_BAD_REQUEST)

            details_data = request.data.get('details')
            if not isinstance(details_data, list):
                return Response({'error': 'Dữ liệu "details" phải là một mảng.'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                booking.details.all().delete()  # Xóa các chi tiết cũ để gán lại từ đầu
                for detail in details_data:
                    table_id = detail.get('table_id')
                    table = Table.objects.get(pk=table_id)
                    BookingDetail.objects.create(
                        booking=booking,
                        table=table,
                        start_time=detail.get('start_time'),
                        end_time=detail.get('end_time'),
                        note=detail.get('note')
                    )

            # Sau khi gán bàn, tự động xác nhận đơn
            booking.status = Booking.BookingStatus.CONFIRMED
            booking.save()

            return Response(self.get_serializer(booking).data, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({'error': 'Đơn đặt bàn không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        except Table.DoesNotExist:
            return Response({'error': 'Bàn được chỉ định không tồn tại.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
