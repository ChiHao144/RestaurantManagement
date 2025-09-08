import axios from "axios";
import cookie from 'react-cookies';

const BASE_URL = "http://192.168.1.102:8000/";

export const endpoints = {
    'categories': '/categories/',
    'dishes': '/dishes/',
    'current-user': '/users/current-user/',
    'login': '/o/token/',
    'register': '/users/',
    'bookings': '/bookings/',
    'booking-detail': (bookingId) => `/bookings/${bookingId}/`,
    'available-tables': '/tables/available/',
    'assign-details': (bookingId) => `/bookings/${bookingId}/assign-details/`,
    'pending-bookings': '/bookings/pending/',
    'cancel-booking': (bookingId) => `/bookings/${bookingId}/cancel/`,
    'orders': '/orders/',
    'order-detail': (orderId) => `/orders/${orderId}/`,
    'place-order-at-table': '/orders/place-order-at-table/',
    'initiate-payment': (orderId) => `/orders/${orderId}/initiate-payment/`,
    'momo-ipn': '/momo/',
    'table-statuses': '/tables/statuses/',
    'update-table-status': (tableId) => `/tables/${tableId}/update-status/`,
    'dish-detail': (dishId) => `/dishes/${dishId}/`,
    'dish-reviews': (dishId) => `/dishes/${dishId}/reviews/`,
    'add-review': (dishId) => `/dishes/${dishId}/add-review/`,
    'add-reply': (reviewId) => `/reviews/${reviewId}/reply/`,
    'all-reviews': '/allreviews/',
    'update-review': (reviewId) => `/reviews/${reviewId}/`,
    'delete-review': (reviewId) => `/reviews/${reviewId}/`,
    'update-order': (orderId) => `/orders/${orderId}/update-order/`,
    'initiate-vnpay-payment': (orderId) => `/orders/${orderId}/initiate-vnpay-payment/`,
    'stats-revenue': '/stats/revenue/',
    'stats-dishes': '/stats/dish-popularity/',
    'chatbot-ask': '/chatbot/ask/',
    'request-password-reset': '/password-reset/request-reset/',
    'confirm-password-reset': '/password-reset/confirm/',
    'complete-booking': (bookingId) => `/bookings/${bookingId}/complete/`,
}

export const authApi = () => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            "Authorization": `Bearer ${cookie.load("token")}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
})
