import axios from "axios";
import cookie from 'react-cookies';

const BASE_URL = "http://192.168.1.103:8000/";

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
    'place-order-at-table': '/orders/place-order-at-table/',
    'initiate-payment': (orderId) => `/orders/${orderId}/initiate-payment/`,
    'momo-ipn': '/momo/',
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
