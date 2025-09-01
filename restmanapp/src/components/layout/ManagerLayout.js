import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import ManagerHeader from "../../pages/manager/ManagerHeader";

const ManagerLayout = () => {
  return (
    <>
      {/* Header riêng cho quản lý */}
      <ManagerHeader />

      <Container fluid>
        <Row>
          {/* Sidebar */}
          <Col md={2} className="bg-dark text-white min-vh-100 p-3">
            <h4 className="mb-4">Quản lý</h4>
            <nav className="d-flex flex-column gap-2">
              <a href="/manager" className="text-white text-decoration-none">Danh sách đơn đặt bàn</a>
              <a href="/manager/all-bookings" className="text-white text-decoration-none">Tất cả đơn đặt bàn</a>
              <a href="/manager/assign" className="text-white text-decoration-none">🪑 Gán bàn</a>
              <a href="/manager/menu" className="text-white text-decoration-none">🍽️ Quản lý menu</a>
              <a href="/manager/staff" className="text-white text-decoration-none">👨‍🍳 Nhân viên</a>
            </nav>
          </Col>

          {/* Nội dung chính */}
          <Col md={10} className="p-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ManagerLayout;
