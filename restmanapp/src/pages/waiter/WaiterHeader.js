import { useContext } from "react";
import { Container, Nav, Navbar, NavDropdown, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { UserContext } from "../../configs/UserContext";
import { useNavigate } from "react-router-dom";

const WaiterHeader = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();        
    navigate("/");  
  };

  return (
    <Navbar expand="lg" bg="primary" variant="dark" sticky="top" className="shadow-sm">
      <Container>
        <LinkContainer to="/waiter">
          <Navbar.Brand className="fw-bold fs-4">
            Quản lý Nhà Hàng
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="waiter-navbar-nav" />
        <Navbar.Collapse id="waiter-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/waiter/table-management">
              <Nav.Link>Quản lý bàn ăn</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/waiter/orders">
              <Nav.Link>Quản lý hóa đơn</Nav.Link>
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
                id="waiter-user-dropdown"
              >
                <LinkContainer to="/waiter/profile">
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

export default WaiterHeader;
