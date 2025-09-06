import json
import time
import urllib
import uuid

import pytz
import requests
import hmac
import hashlib
import logging
from datetime import datetime

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Q, Count, Sum
from django.db.models.functions import TruncMonth, TruncDay
from django.shortcuts import redirect
from django.template.loader import render_to_string
from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from .models import Category, Dish, User, Review, Table, Booking, Order, OrderDetail, BookingDetail, ReviewReply
from . import serializers, paginators, perms
from .vnpay_utils import Vnpay


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = serializers.CategorySerializer


class DishViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
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
        if self.action == 'add_review':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get'], detail=True, url_path='reviews')
    def get_reviews(self, request, pk):
        dish = self.get_object()
        reviews = dish.reviews.select_related('user').filter(is_active=True)
        return Response(serializers.ReviewSerializer(reviews, many=True).data)

    @action(methods=['post'], detail=True, url_path='add-review')
    def add_review(self, request, pk):
        if Review.objects.filter(user=request.user, dish_id=pk).exists():
            return Response({"error": "Bạn đã đánh giá món ăn này rồi."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializers.ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, dish=self.get_object())
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        user = request.user
        if request.method == 'PATCH':
            serializer = serializers.UserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        return Response(serializers.UserSerializer(user).data)


class ReviewViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Review.objects.filter(is_active=True)
    serializer_class = serializers.ReviewSerializer
    permission_classes = [perms.IsReviewOwner]

    @action(methods=['post'], detail=True, url_path='reply', permission_classes=[perms.IsManagerUser])
    def reply(self, request, pk=None):
        """
        API cho phép nhân viên (STAFF, MANAGER, ADMIN) phản hồi lại một đánh giá.
        Input: { "content": "Cảm ơn bạn đã góp ý..." }
        """
        try:
            review = self.get_object()
            content = request.data.get('content')
            if not content:
                return Response({'error': 'Nội dung phản hồi không được để trống.'}, status=status.HTTP_400_BAD_REQUEST)

            # Tạo phản hồi mới, tự động gán nhân viên đang đăng nhập
            reply = ReviewReply.objects.create(
                review=review,
                user=request.user,
                content=content
            )

            # Dùng ReviewReplySerializer để trả về dữ liệu phản hồi
            return Response(serializers.ReviewReplySerializer(reply).data, status=status.HTTP_201_CREATED)
        except Review.DoesNotExist:
            return Response({'error': 'Đánh giá không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)


class AllReviewsViewSet(viewsets.ViewSet, generics.ListAPIView):
    """
    [MỚI] API để lấy tất cả các đánh giá cho trang quản lý.
    """
    # Lấy tất cả đánh giá, sắp xếp mới nhất lên đầu
    queryset = Review.objects.select_related('user', 'dish').prefetch_related('replies__user').order_by('-created_date')
    serializer_class = serializers.ReviewSerializer
    permission_classes = [perms.IsManagerUser]


class TableViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Table.objects.filter(is_active=True)
    serializer_class = serializers.TableSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['get'], detail=False, url_path='available')
    def available(self, request):
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

        overlapping_bookings = BookingDetail.objects.filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        )
        booked_table_ids = overlapping_bookings.values_list('table_id', flat=True)
        available_tables = Table.objects.filter(capacity__gte=guests).exclude(id__in=booked_table_ids)
        return Response(self.get_serializer(available_tables, many=True).data)

    @action(methods=['get'], detail=False, url_path='statuses', permission_classes=[perms.IsManagerUser])
    def statuses(self, request):
        """
        API để lấy danh sách tất cả các bàn và TRẠNG THÁI HIỆN TẠI của chúng.
        """
        tables = Table.objects.all().order_by('table_number')
        return Response(self.get_serializer(tables, many=True).data)

    @action(methods=['patch'], detail=True, url_path='update-status', permission_classes=[perms.IsManagerUser])
    def update_status(self, request, pk=None):
        """
        API để nhân viên CẬP NHẬT TRẠNG THÁI của một bàn cụ thể.
        Input: { "status": "OCCUPIED" }
        """
        try:
            table = self.get_object()
            new_status = request.data.get('status')

            # Kiểm tra xem trạng thái mới có hợp lệ không
            if new_status not in [s[0] for s in Table.TableStatus.choices]:
                return Response({'error': 'Trạng thái không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

            table.status = new_status
            table.save()
            return Response(self.get_serializer(table).data, status=status.HTTP_200_OK)
        except Table.DoesNotExist:
            return Response({'error': 'Bàn không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)


class BookingViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = serializers.BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Giả sử WAITER là một vai trò hợp lệ trong model User của bạn
        if user.role in [User.Role.MANAGER]:
            return self.queryset
        return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(methods=['post'], detail=True, url_path='assign-details', permission_classes=[perms.IsManagerUser])
    def assign_details(self, request, pk):
        try:
            booking = self.get_object()
            if booking.status != 'PENDING':
                return Response({'error': 'Chỉ có thể gán bàn cho đơn đặt bàn đang chờ.'},
                                status=status.HTTP_400_BAD_REQUEST)

            details_data = request.data.get('details')
            if not isinstance(details_data, list) or not details_data:
                return Response({'error': 'Dữ liệu "details" phải là một mảng và không được rỗng.'},
                                status=status.HTTP_400_BAD_REQUEST)

            assigned_tables_info = []  # Biến để lưu thông tin bàn cho email

            with transaction.atomic():
                booking.details.all().delete()
                for detail in details_data:
                    table = Table.objects.get(pk=detail.get('table_id'))
                    BookingDetail.objects.create(booking=booking, table=table, **detail)
                    assigned_tables_info.append(table)

            booking.status = booking.BookingStatus.CONFIRMED
            booking.save()

            # === BẮT ĐẦU LOGIC GỬI EMAIL ===
            try:
                customer_email = booking.user.email
                if customer_email:
                    subject = f"Xác nhận đặt bàn thành công tại Nhà hàng Tâm An - Mã #{booking.id}"

                    context = {
                        'user': booking.user,
                        'booking': booking,
                        'tables': assigned_tables_info,
                    }

                    # Render email từ một file template HTML để email đẹp hơn
                    html_message = render_to_string('emails/booking_confirmation.html', context)

                    # Tạo phiên bản văn bản thuần túy dự phòng
                    plain_message = f"Chào {booking.user.first_name}, đơn đặt bàn #{booking.id} của bạn đã được xác nhận thành công."

                    send_mail(
                        subject=subject,
                        message=plain_message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[customer_email],
                        html_message=html_message,
                        fail_silently=False,
                    )
            except Exception as e:
                # Ghi lại lỗi nếu gửi mail thất bại, nhưng không làm hỏng cả quy trình
                logging.error(f"Lỗi gửi email xác nhận cho đơn #{booking.id}: {e}")
            # === KẾT THÚC LOGIC GỬI EMAIL ===

            return Response(self.get_serializer(booking).data)
        except (Booking.DoesNotExist, Table.DoesNotExist):
            return Response({'error': 'Đơn đặt bàn hoặc bàn không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=False, url_path='pending', permission_classes=[perms.IsManagerUser])
    def pending_bookings(self, request):
        bookings = self.get_queryset().filter(status=Booking.BookingStatus.PENDING)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=True, url_path='cancel', permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk):
        try:
            booking = self.get_object()
            user = request.user

            # Chỉ chủ đơn hoặc nhân viên mới có quyền hủy
            if booking.user != user and not user.is_staff:
                return Response({'error': 'Bạn không có quyền thực hiện hành động này.'},
                                status=status.HTTP_403_FORBIDDEN)

            if booking.status in ['PENDING', 'CONFIRMED']:
                booking.status = 'CANCELLED'
                booking.save()
                return Response(self.get_serializer(booking).data, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Không thể hủy đơn đặt bàn đã hoàn thành hoặc đã bị hủy.'},
                                status=status.HTTP_400_BAD_REQUEST)
        except Booking.DoesNotExist:
            return Response({'error': 'Đơn đặt bàn không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)


class OrderViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = serializers.OrderSerializer

    def get_permissions(self):
        if self.action in ['place_order_at_table', 'initiate_payment']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        return get_object_or_404(Order, pk=self.kwargs["pk"])

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        if user.role in [User.Role.MANAGER]:
            return self.queryset
        return self.queryset.filter(user=user)

    def create(self, request, *args, **kwargs):
        """[ĐÃ MỞ LẠI] Hành động này dành cho người dùng đã đăng nhập (đặt hàng online)."""
        cart = request.data.get('cart')
        if not cart:
            return Response({"error": "Giỏ hàng không được để trống."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    payment_method=request.data.get('payment_method', 'CASH'),
                    note=request.data.get('note')
                )
                total_amount = 0
                for item in cart:
                    dish = Dish.objects.get(pk=item['dish_id'], is_active=True)
                    quantity = int(item['quantity'])
                    OrderDetail.objects.create(order=order, dish=dish, quantity=quantity, unit_price=dish.price)
                    total_amount += dish.price * quantity
                order.total_amount = total_amount
                order.save()
                return Response(serializers.OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Dish.DoesNotExist:
            return Response({"error": "Món ăn không tồn tại hoặc đã bị ẩn."}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError) as e:
            return Response({"error": f"Dữ liệu giỏ hàng không hợp lệ: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False, url_path='place-order-at-table')
    def place_order_at_table(self, request):
        table_id = request.data.get('table_id')
        cart = request.data.get('cart')
        if not all([table_id, cart]):
            return Response({"error": "Vui lòng cung cấp table_id và cart."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            table = Table.objects.get(pk=table_id)
            with transaction.atomic():
                order, created = Order.objects.get_or_create(
                    table=table, status=Order.OrderStatus.PENDING, defaults={'table': table}
                )
                total_amount = order.total_amount or 0
                for item in cart:
                    dish = Dish.objects.get(pk=item['dish_id'], is_active=True)
                    quantity = int(item['quantity'])
                    order_detail, created_detail = OrderDetail.objects.get_or_create(
                        order=order, dish=dish, defaults={'quantity': quantity, 'unit_price': dish.price}
                    )
                    if not created_detail:
                        order_detail.quantity += quantity
                        order_detail.save()
                    total_amount += dish.price * quantity
                order.total_amount = total_amount
                order.save()
                return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)
        except Table.DoesNotExist:
            return Response({"error": "Bàn không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True, url_path='initiate-payment')
    def initiate_payment(self, request, pk):
        try:
            order = self.get_object()
            if order.status != 'PENDING':
                return Response({'error': 'Chỉ có thể thanh toán cho hóa đơn đang chờ.'},
                                status=status.HTTP_400_BAD_REQUEST)

            order_info = f"Thanh toan don hang #{order.id}"
            amount = str(int(order.total_amount))
            order_id = f"{order.id}_{uuid.uuid4()}"
            request_id = str(uuid.uuid4())
            raw_signature_str = (
                f"accessKey={settings.MOMO_ACCESS_KEY}&amount={amount}&extraData=&ipnUrl={settings.MOMO_IPN_URL}"
                f"&orderId={order_id}&orderInfo={order_info}&partnerCode={settings.MOMO_PARTNER_CODE}"
                f"&redirectUrl={settings.MOMO_REDIRECT_URL}&requestId={request_id}&requestType=payWithATM"
            )
            signature = hmac.new(bytes(settings.MOMO_SECRET_KEY, 'ascii'), bytes(raw_signature_str, 'ascii'),
                                 hashlib.sha256).hexdigest()
            payload = {
                'partnerCode': settings.MOMO_PARTNER_CODE, 'requestId': request_id, 'amount': amount,
                'orderId': order_id, 'orderInfo': order_info, 'redirectUrl': settings.MOMO_REDIRECT_URL,
                'ipnUrl': settings.MOMO_IPN_URL, 'lang': "vi", 'extraData': "",
                'requestType': "payWithATM", 'signature': signature
            }
            response = requests.post(settings.MOMO_ENDPOINT, data=json.dumps(payload),
                                     headers={'Content-Type': 'application/json'})
            response_data = response.json()
            if response_data.get("resultCode") == 0:
                return Response({'payUrl': response_data.get('payUrl')})
            else:
                return Response({'error': 'Không thể tạo yêu cầu thanh toán.', 'momo_response': response_data},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Order.DoesNotExist:
            return Response({'error': 'Đơn hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['patch'], detail=True, url_path='update-order')
    def update_order(self, request, pk=None):
        """
        [PHIÊN BẢN SỬA LỖI] API để nhân viên cập nhật hóa đơn.
        """
        try:
            order = self.get_object()

            # Sử dụng serializer để xác thực và cập nhật dữ liệu
            # partial=True cho phép cập nhật một phần (chỉ những trường được gửi lên)
            serializer = self.get_serializer(order, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()  # Lưu các thay đổi vào database

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({'error': 'Hóa đơn không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Bắt các lỗi validation từ serializer
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True, url_path='initiate-vnpay-payment')
    def initiate_vnpay_payment(self, request, pk=None):
        """
        Tạo URL thanh toán VNPay bằng cách sử dụng Vnpay utility class.
        """
        try:
            order = self.get_object()
            if order.status != 'PENDING':
                return Response({'error': 'Chỉ có thể thanh toán cho hóa đơn đang chờ.'},
                                status=status.HTTP_400_BAD_REQUEST)

            # 1. Khởi tạo đối tượng Vnpay
            vnp = Vnpay()

            ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')
            vietnam_tz = pytz.timezone('Asia/Ho_Chi_Minh')
            create_date = datetime.now(vietnam_tz)

            # 2. Gán dữ liệu vào request_data của đối tượng Vnpay
            vnp.request_data = {
                "vnp_Version": "2.1.0",
                "vnp_Command": "pay",
                "vnp_TmnCode": settings.VNPAY_TMNCODE,
                "vnp_Amount": str(int(order.total_amount) * 100),
                "vnp_CreateDate": create_date.strftime('%Y%m%d%H%M%S'),
                "vnp_CurrCode": "VND",
                "vnp_IpAddr": ip_addr,
                "vnp_Locale": "vn",
                "vnp_OrderInfo": f"Thanh toan don hang {order.id}",
                "vnp_OrderType": "other",
                "vnp_ReturnUrl": settings.VNPAY_RETURN_URL,
                "vnp_TxnRef": f"{order.id}_{uuid.uuid4()}"
            }

            print("CHECK IPN URL:", settings.VNPAY_IPN_URL)
            # Và cả Return URL nữa
            print("CHECK RETURN URL:", settings.VNPAY_RETURN_URL)

            # 3. Gọi hàm để lấy URL thanh toán
            payment_url = vnp.get_payment_url()

            return Response({'paymentUrl': payment_url}, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({'error': 'Đơn hàng không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logging.error(f"Lỗi khi tạo thanh toán VNPay: {e}")
            return Response({'error': 'Đã có lỗi xảy ra phía server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VNPayIPNViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        input_data = request.query_params.dict()
        if not input_data:
            return Response({"RspCode": "99", "Message": "Invalid request"})

        vnp = Vnpay()

        # 1. Xác thực chữ ký bằng hàm validate_response từ trợ lý
        if vnp.validate_response(input_data):
            response_code = input_data.get("vnp_ResponseCode")
            txn_ref = input_data.get("vnp_TxnRef")
            order_id = txn_ref.split("_")[0]

            try:
                order = Order.objects.get(id=order_id)
                if order.status == 'PENDING':
                    if response_code == "00":  # Thanh toán thành công
                        order.status = "COMPLETED"
                        order.payment_method = "VNPAY"
                        order.save()
                    else:  # Thanh toán thất bại
                        order.status = "CANCELLED"
                        order.save()

                return Response({"RspCode": "00", "Message": "Confirm Success"})
            except Order.DoesNotExist:
                return Response({"RspCode": "01", "Message": "Order not found"})
        else:
            logging.warning("VNPay IPN: Invalid signature.")
            return Response({"RspCode": "97", "Message": "Invalid signature"})


# [MỚI] ViewSet để xử lý khi khách hàng được chuyển hướng về (Return URL)
class VNPayReturnViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        input_data = request.query_params.dict()
        if not input_data:
            return redirect("http://localhost:3000/payment-failure")  # Chuyển về trang lỗi

        vnp_secure_hash = input_data.pop("vnp_SecureHash", None)
        if "vnp_SecureHashType" in input_data:
            input_data.pop("vnp_SecureHashType")

        sorted_data = sorted(input_data.items())

        query_string = ""
        i = 0
        for key, val in sorted_data:
            if i == 1:
                query_string += "&" + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                i = 1
                query_string = key + '=' + urllib.parse.quote_plus(str(val))

        secret_key_bytes = settings.VNPAY_HASH_SECRET_KEY.encode()
        query_string_bytes = query_string.encode()
        generated_hash = hmac.new(secret_key_bytes, query_string_bytes, hashlib.sha512).hexdigest()

        if generated_hash == vnp_secure_hash:
            # Chữ ký hợp lệ, kiểm tra kết quả giao dịch
            if input_data.get("vnp_ResponseCode") == "00":
                # Chuyển hướng đến trang thành công ở frontend
                return redirect("http://localhost:3000/payment-success")
            else:
                # Chuyển hướng đến trang thất bại ở frontend
                return redirect("http://localhost:3000/payment-failure")
        else:
            # Chữ ký không hợp lệ, chuyển hướng đến trang lỗi
            logging.warning("VNPay Return URL: Invalid signature.")
            return redirect("http://localhost:3000/payment-failure")

class MomoIPNViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        data = request.data
        result_code = data.get('resultCode')
        try:
            result_code = int(result_code)
        except (TypeError, ValueError):
            result_code = -1  # giá trị mặc định nếu parse lỗi
        original_order_id = data.get('orderId', '').split('_')[0]
        if result_code == 0:
            try:
                order = Order.objects.get(pk=original_order_id)
                if order.status == 'PENDING':
                    order.status = 'COMPLETED'
                    order.payment_method = 'MOMO'
                    order.save()
                    logging.info(f"Order {original_order_id} updated to COMPLETED via MoMo IPN.")
            except Order.DoesNotExist:
                logging.error(f"Order {original_order_id} not found for MoMo IPN.")
        else:
            logging.warning(f"MoMo IPN received failed status for order {original_order_id}: {data.get('message')}")
        return Response(status=status.HTTP_204_NO_CONTENT)
