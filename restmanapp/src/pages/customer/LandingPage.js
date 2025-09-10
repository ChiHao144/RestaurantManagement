import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Apis, { endpoints } from '../../configs/Apis';

const styles = {
    hero: {
        backgroundImage: `url('https://res.cloudinary.com/dbitlfhjx/image/upload/v1757497262/main_vtylbc.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    },
    heroContent: {
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '30px',
        borderRadius: '15px',
    },
    section: {
        padding: '60px 0',
    },
    sectionTitle: {
        color: '#8B0000',
        marginBottom: '40px',
        textAlign: 'center',
    }
};

const LandingPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await Apis.get(endpoints['categories']);
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi khi tải danh mục:", err);
                setError("Không thể tải danh mục.");
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    return (
        <>
            <div style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 className="display-3 fw-bold">Chào mừng đến với SpicyTown</h1>
                    <p className="lead">Nơi hội tụ tinh hoa ẩm thực, mang đến những trải nghiệm khó quên.</p>
                    <Button
                        as={Link}
                        to="/menu"
                        size="lg"
                        style={{
                            backgroundColor: "#FFD700",
                            color: "#ffffffff",
                            borderColor: "#ffffffff",
                            fontWeight: "bold"
                        }}
                    >
                        Khám phá Thực đơn
                    </Button>

                </div>
            </div>

            <Container style={styles.section}>
                <h2 className="fw-bold" style={styles.sectionTitle}>Khám phá theo danh mục</h2>
                {loading && (
                    <div className="text-center">
                        <Spinner animation="border" style={{ color: "#8B0000" }} />
                    </div>
                )}
                {error && <Alert variant="warning">{error}</Alert>}
                {categories && (
                    <Row className="justify-content-center text-center">
                        {categories.map(c => (
                            <Col key={c.id} md={3} xs={6} className="mb-3">
                                <Link to={`/categories/${c.name}`} className="text-decoration-none">
                                    <Button
                                        size="lg"
                                        className="w-100 py-3"
                                        style={{
                                            backgroundColor: "#FFD700",
                                            color: "#8B0000",
                                            border: "2px solid #8B0000", 
                                            fontWeight: "bold",
                                            transition: "all 0.3s ease",
                                        }}
                                        onMouseOver={e => {
                                            e.target.style.backgroundColor = "#8B0000";
                                            e.target.style.color = "#FFD700";
                                            e.target.style.borderColor = "#FFD700";
                                        }}
                                        onMouseOut={e => {
                                            e.target.style.backgroundColor = "#FFD700";
                                            e.target.style.color = "#8B0000";
                                            e.target.style.borderColor = "#8B0000";
                                        }}
                                    >
                                        {c.name}
                                    </Button>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            <Container style={{ ...styles.section, paddingTop: 0 }}>
                <Row className="align-items-center">
                    <Col md={6}>
                        <h2 className="fw-bold" style={{ ...styles.sectionTitle, textAlign: 'left' }}>Câu chuyện của SpicyTown</h2>
                        <p>
                            SpicyTown không chỉ là một nhà hàng, mà là một hành trình khám phá hương vị. Chúng tôi tự hào mang đến những món ăn được chế biến từ nguyên liệu tươi ngon nhất, kết hợp giữa công thức truyền thống và sự sáng tạo hiện đại, tạo nên một bản giao hưởng ẩm thực độc đáo.
                        </p>
                    </Col>
                    <Col md={6}>
                        <img
                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                            alt="Không gian nhà hàng"
                            className="img-fluid rounded shadow-lg"
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default LandingPage;

