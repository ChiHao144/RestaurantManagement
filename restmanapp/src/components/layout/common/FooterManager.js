import { Container, Row, Col } from "react-bootstrap";
import { Facebook, Instagram, Twitter, Telephone, Envelope, GeoAlt } from "react-bootstrap-icons";

const FooterManager = () => {
  return (
    <footer className="pt-5 pb-3 mt-5" style={{ backgroundColor: "#0d6efd", color: "#ffffffff" }}>
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Restaurant Management - Admin</h5>
            <p>Trang quản trị giúp bạn dễ dàng quản lý thực đơn, đơn đặt bàn và khách hàng.</p>
          </Col>

          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Liên kết nhanh</h5>
            <ul className="list-unstyled">
              <li><a href="#" style={{ color: "#ffffffff", textDecoration: "none" }}>Dashboard</a></li>
              <li><a href="#" style={{ color: "#ffffffff", textDecoration: "none" }}>Quản lý món ăn</a></li>
              <li><a href="#" style={{ color: "#ffffffff", textDecoration: "none" }}>Quản lý đơn hàng</a></li>
              <li><a href="#" style={{ color: "#ffffffff", textDecoration: "none" }}>Người dùng</a></li>
            </ul>
          </Col>

          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Liên hệ</h5>
            <p><GeoAlt size={18} className="me-2" /> Phường Sài Gòn, TP. Hồ Chí Minh</p>
            <p><Telephone size={18} className="me-2" /> (+84) 123-456-789</p>
            <p><Envelope size={18} className="me-2" /> admin@restaurant.com</p>
          </Col>
        </Row>

        <Row className="pt-3 border-top" style={{ borderColor: "#ffffffff" }}>
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">© 2025 Restaurant Management Admin | All Rights Reserved</p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <a
              href="#"
              className="me-3"
              style={{ color: "#ffffffff", transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#FFA500")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#ffffffff")}
            >
              <Facebook size={24} />
            </a>
            <a
              href="#"
              className="me-3"
              style={{ color: "#ffffffff", transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#FFA500")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#ffffffff")}
            >
              <Instagram size={24} />
            </a>
            <a
              href="#"
              style={{ color: "#ffffffff", transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#FFA500")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#ffffffff")}
            >
              <Twitter size={24} />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default FooterManager;
