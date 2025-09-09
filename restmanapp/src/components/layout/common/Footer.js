import { Container, Row, Col } from "react-bootstrap";
import { Facebook, Instagram, Twitter, Telephone, Envelope, GeoAlt } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <footer
      className="pt-5 pb-3 mt-5"
      style={{ backgroundColor: "#8B0000", color: "#FFD700" }}
    >
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Restaurant Management</h5>
            <p>
              Chúng tôi mang đến trải nghiệm ẩm thực tuyệt vời với không gian sang trọng và dịch vụ tận tâm.
            </p>
          </Col>

          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Liên kết nhanh</h5>
            <ul className="list-unstyled">
              <li><a href="#" style={{ color: "#FFD700", textDecoration: "none" }}>Trang chủ</a></li>
              <li><a href="#" style={{ color: "#FFD700", textDecoration: "none" }}>Thực đơn</a></li>
              <li><a href="#" style={{ color: "#FFD700", textDecoration: "none" }}>Đặt bàn</a></li>
              <li><a href="#" style={{ color: "#FFD700", textDecoration: "none" }}>Liên hệ</a></li>
            </ul>
          </Col>

          <Col md={4} className="mb-3">
            <h5 className="fw-bold">Liên hệ</h5>
            <p><GeoAlt size={18} className="me-2" /> Phường Sài Gòn, TP. Hồ Chí Minh</p>
            <p><Telephone size={18} className="me-2" /> (+84) 123-456-789</p>
            <p><Envelope size={18} className="me-2" /> support@restaurant.com</p>
          </Col>
        </Row>

        <Row className="pt-3 border-top" style={{ borderColor: "#FFD700" }}>
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">© 2025 Restaurant Management | All Rights Reserved</p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <a
              href="#"
              className="me-3"
              style={{ color: "#FFD700", transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#FFA500")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#FFD700")}
            >
              <Facebook size={24} />
            </a>
            <a
              href="#"
              className="me-3"
              style={{ color: "#FFD700", transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#FFA500")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#FFD700")}
            >
              <Instagram size={24} />
            </a>
            <a
              href="#"
              style={{ color: "#FFD700", transition: "0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#FFA500")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#FFD700")}
            >
              <Twitter size={24} />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
