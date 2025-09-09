from restmans.models import Category, Dish, Order, BookingDetail, Booking, OrderDetail, Table, Review, User, ReviewReply
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
        fields = ['id', 'name', 'price', 'image', 'category_id', 'description']


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


class ReviewReplySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Hiển thị thông tin nhân viên phản hồi

    class Meta:
        model = ReviewReply
        fields = ['id', 'content', 'user', 'created_date']
        read_only_fields = ['user']

class ReviewSerializer(serializers.ModelSerializer):
    replies = ReviewReplySerializer(many=True, read_only=True)
    def to_representation(self, instance):
        data =  super().to_representation(instance)
        data['user'] = UserSerializer(instance.user).data
        return data

    class Meta:
        model = Review
        fields = ['id', 'content', 'rating', 'user', 'created_date', 'dish', 'replies']
        read_only_fields = ['user', 'dish']

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'table_number', 'capacity', 'status']

class BookingDetailSerializer(serializers.ModelSerializer):
    table = TableSerializer(read_only=True)
    table_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = BookingDetail
        fields = ['table', 'table_id', 'start_time', 'end_time', 'note']

class BookingSerializer(serializers.ModelSerializer):
    details = BookingDetailSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'booking_time', 'number_of_guests', 'note', 'status', 'details']
        read_only_fields = ['status']

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
