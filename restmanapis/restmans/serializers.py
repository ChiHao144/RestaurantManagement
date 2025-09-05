from restmans.models import Category, Dish, Order, BookingDetail, Booking, OrderDetail, Table, Review, User
from rest_framework import serializers


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = instance.image.url
        return data


class DishSerializer(ItemSerializer):
    class Meta:
        model = Dish
        fields = ['id', 'name', 'price', 'image', 'category_id']


class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data
    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()
        return u

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password', 'avatar', 'role', 'email']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class ReviewSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data =  super().to_representation(instance)
        data['user'] = UserSerializer(instance.user).data
        return data

    class Meta:
        model = Review
        fields = ['id', 'content', 'rating', 'user', 'created_date', 'dish']
        read_only_fields = ['user', 'dish']

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'table_number', 'capacity', 'status']

class BookingDetailSerializer(serializers.ModelSerializer):
    """Serializer cho Chi tiết Đặt bàn."""
    # Thêm table serializer để trả về thông tin bàn đầy đủ hơn
    table = TableSerializer(read_only=True)
    # Thêm trường table_id để nhận ID bàn khi ghi dữ liệu
    table_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = BookingDetail
        fields = ['table', 'table_id', 'start_time', 'end_time', 'note']

class BookingSerializer(serializers.ModelSerializer):
    """Serializer cho Đơn Đặt Bàn."""
    # [THAY ĐỔI] details giờ là read_only.
    # Nó chỉ dùng để hiển thị kết quả, không thể dùng để tạo/sửa trực tiếp.
    details = BookingDetailSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        # [THAY ĐỔI] Xóa 'details' khỏi danh sách các trường có thể ghi.
        fields = ['id', 'user', 'booking_time', 'number_of_guests', 'note', 'status', 'details']
        read_only_fields = ['status']

    # [THAY ĐỔI] Không cần ghi đè phương thức create nữa vì logic đã được đơn giản hóa.

class OrderDetailDishSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)
    class Meta:
        model = Dish
        fields = ['id', 'name', 'price', 'image']

class OrderDetailSerializer(serializers.ModelSerializer):
    dish = OrderDetailDishSerializer(read_only=True)
    class Meta:
        model = OrderDetail
        fields = ['id', 'dish', 'quantity', 'unit_price']

class OrderSerializer(serializers.ModelSerializer):
    details = OrderDetailSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    table = TableSerializer(read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'user', 'table', 'total_amount', 'payment_method', 'status', 'note', 'created_date', 'details']
