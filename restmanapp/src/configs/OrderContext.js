import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import { authApi, endpoints } from "./Apis";
import { UserContext } from "./UserContext";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(UserContext);
  const hasLoaded = useRef(false); // ✅ Ngăn load lại nhiều lần

  const loadOrders = useCallback(async (forceReload = false) => {
  if (!user || !['WAITER', 'MANAGER', 'ADMIN'].includes(user.role)) return;

  try {
    const res = await authApi().get(endpoints["orders"], {
      params: { t: Date.now() } // ✅ tránh cache
    });
    const data = res.data.results || res.data;
    if (Array.isArray(data)) {
      setOrders(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    }
    if (forceReload) console.log("🔄 Dữ liệu đã được reload mới nhất từ API!");
  } catch (err) {
    console.error("Lỗi khi tải danh sách hóa đơn:", err);
  }
}, [user]);

  useEffect(() => {
  if (user) {
    loadOrders();
  }
}, [user, loadOrders]);



  useEffect(() => {
    if (user && !hasLoaded.current) {
      hasLoaded.current = true; // ✅ Đảm bảo chỉ gọi một lần
      loadOrders();
    }
  }, [user, loadOrders]);

  const addOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrder = (id, updatedData) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updatedData } : order))
    );
  };

  return (
    <OrderContext.Provider value={{ orders, setOrders, addOrder, updateOrder, loadOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
