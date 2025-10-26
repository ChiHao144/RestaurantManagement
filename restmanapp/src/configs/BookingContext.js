import React, { createContext, useState, useEffect, useContext } from "react";
import { authApi, endpoints } from "./Apis";
import { UserContext } from './UserContext';

// Tạo context
export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    // booking: danh sách đơn đặt bàn
    const [booking, setBooking] = useState([]);
    const { user } = useContext(UserContext);

    // Ví dụ: fetch dữ liệu từ API (tuỳ bạn thay URL)
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if (!user) return;
                const res = await authApi().get(endpoints['pending-bookings']);
                setBooking(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách đặt bàn:", err);
            }
        };

        fetchBookings();
    }, [user]);

    // Hàm thêm booking mới
    const addBooking = (newBooking) => {
        setBooking((prev) => [...prev, newBooking]);
    };

    // Hàm cập nhật tình trạng xếp bàn
    const assignTable = (id, tableNumber) => {
        setBooking((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, table: tableNumber } : item
            )
        );
    };

    return (
        <BookingContext.Provider
            value={{ booking, setBooking, addBooking, assignTable }}
        >
            {children}
        </BookingContext.Provider>
    );
};
