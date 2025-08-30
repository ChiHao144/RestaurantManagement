import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Apis, { endpoints } from "../../configs/Apis";
import { CartContext } from "../../configs/CartContext";

const Home = () => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const loadDishes = async () => {
            try {
                setLoading(true);
                setError(null);
                let res = await Apis.get(endpoints['dishes']);
                setDishes(res.data.results);
            } catch (err) {
                console.error("Lỗi khi tải danh sách món ăn:", err);
                setError("Không thể tải được dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        }

        loadDishes();
    }, []);

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="danger" />
                <p className="mt-2 text-dark">Đang tải...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="text-center mb-4 fw-bold" style={{ color: "#8B0000" }}>
                🍽️ THỰC ĐƠN NHÀ HÀNG TÂM AN 🍷
            </h1>
            <Row>
                {dishes.map(dish => (
                    <Col key={dish.id} md={4} lg={3} xs={12} className="mb-4">
                        <Card 
                            className="h-100 border-0 shadow-lg rounded-4"
                            style={{ transition: "transform 0.3s, box-shadow 0.3s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            <Card.Img
                                variant="top"
                                src={dish.image}
                                alt={dish.name}
                                style={{ 
                                    height: '200px', 
                                    objectFit: 'cover', 
                                    borderTopLeftRadius: "1rem", 
                                    borderTopRightRadius: "1rem",
                                    transition: "transform 0.3s ease-in-out"
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                            />
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="fw-bold" style={{ color: "#8B0000" }}>
                                    {dish.name}
                                </Card.Title>
                                <Card.Text className="text-muted">
                                    {dish.description 
                                        ? dish.description.substring(0, 50) + '...' 
                                        : 'Món ăn đặc sắc từ nhà hàng Tâm An.'}
                                </Card.Text>
                                <div className="mt-auto">
                                    <p className="fw-bold fs-5" style={{ color: "#D32F2F" }}>
                                        {parseInt(dish.price).toLocaleString('vi-VN')} VNĐ
                                    </p>
                                    <div className="d-grid gap-2">
                                        <Button 
                                            as={Link} 
                                            to={`/dishes/${dish.id}`} 
                                            style={{ backgroundColor: "#FFD700", border: "none", color: "#8B0000" }}
                                        >
                                            Xem chi tiết
                                        </Button>
                                        <Button 
                                            style={{ backgroundColor: "#8B0000", border: "none" }}
                                            onClick={() => addToCart(dish)}
                                        >
                                            Thêm vào giỏ 🛒
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Home;
