import { useEffect, useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Apis, { endpoints } from "../../configs/Apis";

const Header = () => {
    const [categories, setCategories] = useState([]);

    const loadCates = async () => {
    try {
        let res = await Apis.get(endpoints['categories']);
        console.log("Categories API response:", res.data);
        setCategories(res.data); 
    } catch (err) {
        console.error("Lỗi load categories:", err);
    }
}
    useEffect(() => {
        loadCates();
    }, []);

    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="#link">Link</Nav.Link>
                            <NavDropdown title="Danh mục" id="basic-nav-dropdown">
                                {categories.map(c => <NavDropdown.Item key={c.id} href="#action/3.1">{c.name}</NavDropdown.Item>)}
                
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}
export default Header;