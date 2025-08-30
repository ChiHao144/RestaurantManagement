import { useContext } from "react";
import { Container, Nav, Navbar, NavDropdown, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { UserContext } from "../../configs/UserContext";
import { useNavigate } from "react-router-dom";

const ManagerHeader = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();        // xóa token và reset user
    navigate("/");   // chuyển hướng về trang Home
  };

  return (
    <Navbar expand="lg" bg="primary" variant="dark" sticky="top" className="shadow-sm">
      <Container>
        <LinkContainer to="/manager">
          <Navbar.Brand className="fw-bold fs-4">
            🏨 Quản lý Nhà Hàng
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="manager-navbar-nav" />
        <Navbar.Collapse id="manager-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/manager">
              <Nav.Link>📑 Danh sách đặt bàn</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manager/all-bookings">
              <Nav.Link>Tất cả đơn đặt bàn</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manager/menu">
              <Nav.Link>🍽️ Quản lý menu</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manager/staff">
              <Nav.Link>👨‍🍳 Nhân viên</Nav.Link>
            </LinkContainer>
          </Nav>

          <Nav>
            {user ? (
              <NavDropdown
                align="end"
                title={
                  <>
                    <Image
                      src={user.avatar}
                      alt={user.last_name}
                      width="30"
                      height="30"
                      roundedCircle
                      className="me-2"
                    />
                    {user.first_name}
                  </>
                }
                id="manager-user-dropdown"
              >
                <LinkContainer to="/profile">
                  <NavDropdown.Item>👤 Thông tin cá nhân</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>🚪 Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ManagerHeader;
