import { useContext, useEffect, useState } from "react";
import { Container, Nav, Navbar, NavDropdown, Image, Badge, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Apis, { endpoints } from "../../configs/Apis";
import { UserContext } from "../../configs/UserContext";
import { CartContext } from "../../configs/CartContext";

const CustomerHeader = () => {
    const [categories, setCategories] = useState([]);
    const { user, logout } = useContext(UserContext);
    const { cart } = useContext(CartContext);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    useEffect(() => {
        const loadCates = async () => {
            try {
                let res = await Apis.get(endpoints["categories"]);
                setCategories(res.data.results || res.data);
            } catch (err) {
                console.error("Lỗi khi tải danh mục:", err);
            }
        };
        loadCates();
    }, []);

    return (
        <Navbar expand="lg" sticky="top" className="shadow-sm" style={{ backgroundColor: "#8B0000" }}>
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand className="fw-bold fs-4 text-light">
                        <Image
                            src="https://res.cloudinary.com/dbitlfhjx/image/upload/v1755265003/w1ecbqfhmihqbs5xisqa.jpg"
                            width="45"
                            height="45"
                            roundedCircle
                            className="me-2 border border-2 border-warning"
                            alt="Logo"
                        />
                        <span style={{ color: "#FFD700" }}>Nhà Hàng</span> Tâm An
                    </Navbar.Brand>
                </LinkContainer>

                <Navbar.Toggle aria-controls="responsive-navbar-nav" className="bg-light" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <LinkContainer to="/">
                            <Nav.Link className="text-light fw-semibold">Trang chủ</Nav.Link>
                        </LinkContainer>

                        <NavDropdown
                            title={<span className="text-light">Danh mục</span>}
                            id="category-nav-dropdown"
                            menuVariant="dark"
                        >
                            {categories?.map((c) => (
                                <LinkContainer key={c.name} to={`/categories/${c.name}`}>
                                    <NavDropdown.Item className="fw-medium">{c.name}</NavDropdown.Item>
                                </LinkContainer>
                            ))}
                        </NavDropdown>

                        <LinkContainer to="/booking">
                            <Nav.Link className="text-light fw-semibold">Đặt bàn</Nav.Link>
                        </LinkContainer>

                        <LinkContainer to="/cart">
                            <Nav.Link className="text-light fw-semibold position-relative">
                                Giỏ hàng{" "}
                                <Badge
                                    pill
                                    bg="warning"
                                    text="dark"
                                    className="ms-1"
                                    style={{ fontSize: "0.8rem" }}
                                >
                                    {cartItemCount}
                                </Badge>
                            </Nav.Link>
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
                                            width="32"
                                            height="32"
                                            roundedCircle
                                            className="me-2 border border-1 border-warning"
                                        />
                                        <span className="text-light">Chào, {user.first_name}!</span>
                                    </>
                                }
                                id="user-nav-dropdown"
                                menuVariant="dark"
                            >
                                <LinkContainer to="/profile">
                                    <NavDropdown.Item>Thông tin cá nhân</NavDropdown.Item>
                                </LinkContainer>
                                <NavDropdown.Divider />
                                <LinkContainer to="/history-booking">
                                    <NavDropdown.Item>Lịch sử đặt bàn</NavDropdown.Item>
                                </LinkContainer>
                                <LinkContainer to="/order-history">
                                    <NavDropdown.Item>Lịch sử gọi món</NavDropdown.Item>
                                </LinkContainer>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logout} className="text-danger fw-bold">
                                    Đăng xuất
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <>
                                <LinkContainer to="/login">
                                    <Button variant="warning" className="me-2 fw-semibold text-dark">
                                        Đăng nhập
                                    </Button>
                                </LinkContainer>
                                <LinkContainer to="/register">
                                    <Button variant="outline-light" className="fw-semibold">
                                        Đăng ký
                                    </Button>
                                </LinkContainer>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default CustomerHeader;
