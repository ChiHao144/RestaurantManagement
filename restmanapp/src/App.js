import { BrowserRouter, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import { UserProvider } from "./configs/UserContext";
import { CartProvider } from "./configs/CartContext";

// Layouts
import CustomerLayout from "./components/layout/CustomerLayout";
import ManagerLayout from "./components/layout/ManagerLayout";

// Pages khách
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Booking from "./pages/customer/Booking";
import BookingHistory from "./pages/customer/BookingHistory";
import Cart from "./pages/customer/Cart";
import OrderHistory from "./pages/customer/OrderHistory";

// Pages manager
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AssignTable from "./pages/manager/AssignTable";
import Register from "./pages/auth/Register";
import AllBookings from "./pages/manager/AllBooking";
import TableStatusDashboard from "./pages/waiter/TableStatusDashboard";
import OrderManagement from "./pages/manager/OrderManager";
import OrderDetail from "./pages/manager/OrderDetail";
import PrintableInvoice from "./pages/manager/PrintableInvoice";
import DishDetail from "./pages/customer/DishDetail";
import Profile from "./pages/common/Profile";
import { TableProvider } from "./configs/TableContext";
import ReviewManagement from "./pages/manager/ReviewManager";
import PaymentSuccess from "./pages/customer/PaymentSuccess";
import PaymentFailure from "./pages/customer/PaymentFailure";

const App = () => {
  return (
    <UserProvider>
      <CartProvider>
        <TableProvider>
          <BrowserRouter>
            <Routes>
              {/* ---- Layout cho khách hàng ---- */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<Home />} />
                <Route path="categories/:categoryName" element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="booking" element={<Booking />} />
                <Route path="history-booking" element={<BookingHistory />} />
                <Route path="cart" element={<Cart />} />
                <Route path="order-history" element={<OrderHistory />} />
                <Route path="dishes/:dishId" element={<DishDetail />} />
                <Route path="profile" element={<Profile />} />
                <Route path="payment-success" element={<PaymentSuccess />} />
                <Route path="payment-failure" element={<PaymentFailure />} />
              </Route>

              {/* ---- Layout cho manager ---- */}
              <Route path="/manager" element={<ManagerLayout />}>
                <Route index element={<ManagerDashboard />} />
                <Route path="all-bookings" element={<AllBookings />} />
                <Route path="assign/:bookingId" element={<AssignTable />} />
                <Route path="table-management" element={<TableStatusDashboard />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="orderdetails/:orderId" element={<OrderDetail />} />
                <Route path="print-invoice" element={<PrintableInvoice />} />
                <Route path="profile" element={<Profile />} />
                <Route path="allreviews" element={<ReviewManagement />} />
              </Route>

              {/* ---- Layout cho waiter ---- */}
              {/* <Route path="/waiter" element={<ManagerLayout />}>
              <Route path="table-management" element={<TableStatusDashboard />} />
            </Route> */}

              {/* 404 fallback */}
              <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
            </Routes>
          </BrowserRouter>
        </TableProvider>
      </CartProvider>
    </UserProvider>
  );
};

export default App;
