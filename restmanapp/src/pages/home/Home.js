import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, FormControl, } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Apis, { endpoints } from "../../configs/Apis";
import { CartContext } from "../../configs/CartContext";
import { Search } from "react-bootstrap-icons";

const Home = () => {
    const { categoryName } = useParams();
    const { addToCart } = useContext(CartContext);
    const [dishes, setDishes] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");


    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await Apis.get(endpoints["categories"]);
                setAllCategories(res.data.results || res.data);
            } catch (err) {
                console.error("Lỗi khi tải danh mục:", err);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchQuery]);

    useEffect(() => {
        const loadDishes = async () => {
            if (!allCategories.length && categoryName) return;

            setError(null);
            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {
                const params = new URLSearchParams();
                params.append("page", page);

                if (categoryName) {
                    const category = allCategories.find((c) => c.name === categoryName);
                    if (category) {
                        params.append("category_id", category.id);
                    } else {
                        setError(`Không tìm thấy danh mục "${categoryName}"`);
                        setDishes([]);
                        setLoading(false);
                        setLoadingMore(false);
                        return;
                    }
                }

                if (debouncedQuery) {
                    params.append("q", debouncedQuery);
                }

                const url = `${endpoints["dishes"]}?${params.toString()}`;
                const res = await Apis.get(url);

                const results = res.data.results || res.data;
                if (page === 1) {
                    setDishes(results);
                } else {
                    setDishes((prev) => [...prev, ...results]);
                }

                setHasMore(!!res.data.next);
            } catch (err) {
                console.error("Lỗi khi tải món ăn:", err);
                if (page === 1) {
                    setError("Không thể tải dữ liệu món ăn. Vui lòng thử lại.");
                }
                setHasMore(false);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        loadDishes();
    }, [categoryName, allCategories, debouncedQuery, page]);

    const loadMore = () => {
        if (hasMore) setPage((prev) => prev + 1);
    };

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <Container className="my-4">
            <h1
                className="text-center mb-4 fw-bold"
                style={{ color: "#8B0000" }}
            >
                Thực Đơn Nhà Hàng SpicyTown
            </h1>

            <Form className="mb-4" onSubmit={(e) => e.preventDefault()}>
                <div
                    style={{
                        position: "relative",
                        maxWidth: "100%",
                        margin: "0 auto",
                    }}
                >
                    <FormControl
                        type="text"
                        placeholder="Tìm kiếm món ăn..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: "12px 20px 12px 40px",
                            borderRadius: "25px",
                            border: "2px solid #ccc",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        }}
                        onFocus={(e) => (e.target.style.border = "2px solid #8B0000")}
                        onBlur={(e) => (e.target.style.border = "2px solid #ccc")}
                    />
                    <Search
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "15px",
                            transform: "translateY(-50%)",
                            color: "#8B0000",
                            fontSize: "18px",
                            pointerEvents: "none",
                        }}
                    />
                </div>
            </Form>

            {loading && (
                <div className="text-center my-3">
                    <Spinner animation="border" variant="danger" />
                </div>
            )}

            {!loading && dishes.length === 0 ? (
                <Alert variant="info" className="text-center">
                    Không tìm thấy món ăn nào phù hợp với yêu cầu của bạn.
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={4} className="g-4">
                    {dishes.map((dish) => (
                        <Col key={dish.id}>
                            <Card
                                className="h-100 border-0 shadow-lg rounded-4"
                                style={{ transition: "transform 0.3s, box-shadow 0.3s" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = "translateY(-5px)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = "translateY(0)")
                                }
                            >
                                <Card.Img
                                    variant="top"
                                    src={dish.image}
                                    alt={dish.name}
                                    style={{
                                        height: "200px",
                                        objectFit: "cover",
                                        borderTopLeftRadius: "1rem",
                                        borderTopRightRadius: "1rem",
                                    }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fw-bold" style={{ color: "#8B0000" }}>
                                        {dish.name}
                                    </Card.Title>
                                    <div className="mt-auto">
                                        <p
                                            className="fw-bold fs-5"
                                            style={{ color: "#D32F2F" }}
                                        >
                                            {parseInt(dish.price).toLocaleString("vi-VN")} VNĐ
                                        </p>
                                        <div className="d-grid gap-2">
                                            <Button
                                                as={Link}
                                                to={`/dishes/${dish.id}`}
                                                style={{
                                                    backgroundColor: "#FFD700",
                                                    border: "none",
                                                    color: "#8B0000",
                                                }}
                                            >
                                                Xem chi tiết
                                            </Button>
                                            <Button
                                                style={{ backgroundColor: "#8B0000", border: "none" }}
                                                onClick={() => addToCart(dish)}
                                            >
                                                Thêm vào giỏ
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {hasMore && !loading && (
                <div className="text-center my-4">
                    <Button
                        variant="outline-danger"
                        onClick={loadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore ? "Đang tải..." : "Xem thêm..."}
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default Home;
