import { useContext } from "react";
import { Container, Nav, Navbar, NavDropdown, Image, Badge } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { UserContext } from "../../configs/UserContext";
import { useNavigate } from "react-router-dom";
import { BookingContext } from "../../configs/BookingContext";

const ManagerHeader = () => {
  const { user, logout } = useContext(UserContext);
  const { booking } = useContext(BookingContext);
  const bookingItemCount = booking.filter(item => !item.table).reduce((count, item) => count + (item.quantity || 1), 0);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar expand="lg" bg="primary" variant="dark" sticky="top" className="shadow-sm">
      <Container>
        <LinkContainer to="/manager">
          <Navbar.Brand className="fw-bold fs-4">
            Quản lý Nhà Hàng
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="manager-navbar-nav" />
        <Navbar.Collapse id="manager-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/manager/pending-bookings">
              <Nav.Link className="text-light fw-semibold position-relative">
                Danh sách đơn đặt bàn{" "}
                <Badge pill
                  bg="warning"
                  text="dark"
                  className="ms-1"
                  style={{ fontSize: "0.8rem" }}>
                  {isNaN(bookingItemCount) ? 0 : bookingItemCount}
                </Badge>
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manager/all-bookings">
              <Nav.Link>Tất cả đơn đặt bàn</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manager/table-management">
              <Nav.Link>Quản lý bàn ăn</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manager/orders">
              <Nav.Link>Quản lý hóa đơn</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manager/allreviews">
              <Nav.Link>Quản lý đánh giá</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manager/statistics">
              <Nav.Link>Thống kê</Nav.Link>
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
                <LinkContainer to="/manager/profile">
                  <NavDropdown.Item>Thông tin cá nhân</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ManagerHeader;
