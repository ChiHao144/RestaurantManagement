import React, { useState, useEffect, useContext } from 'react';
import {
    Container,
    Row,
    Col,
    Image,
    Card,
    Spinner,
    Alert,
    Form,
    Button,
    ListGroup
} from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import Apis, { authApi, endpoints } from "../../configs/Apis";
import moment from 'moment';
import 'moment/locale/vi';
import { UserContext } from '../../configs/UserContext';
import { CartContext } from '../../configs/CartContext';

// ⭐ Component hiển thị số sao
const StarRating = ({ rating, size = 'md' }) => {
    const stars = [];
    const starSize = size === 'sm' ? '1rem' : '1.5rem';
    const numericRating = parseFloat(rating) || 0;

    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span
                key={i}
                className={`star ${i <= numericRating ? 'text-warning' : 'text-secondary'}`}
                style={{ fontSize: starSize }}
            >
                &#9733;
            </span>
        );
    }
    return <div>{stars}</div>;
};

const DishDetail = () => {
    const { dishId } = useParams();
    const { user } = useContext(UserContext);
    const { addToCart } = useContext(CartContext);

    const [dish, setDish] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho review
    const [newReviewContent, setNewReviewContent] = useState('');
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    useEffect(() => {
        moment.locale('vi');
        const loadData = async () => {
            setLoading(true);
            try {
                const [dishRes, reviewsRes] = await Promise.all([
                    Apis.get(endpoints['dish-detail'](dishId)),
                    Apis.get(endpoints['dish-reviews'](dishId))
                ]);
                setDish(dishRes.data);
                setReviews(reviewsRes.data);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError("Không thể tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [dishId]);

    // ➕ Thêm review mới
    const handleAddReview = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await authApi().post(endpoints['add-review'](dishId), {
                content: newReviewContent,
                rating: newReviewRating
            });
            setReviews([res.data, ...reviews]);
            setNewReviewContent('');
            setNewReviewRating(5);
        } catch (err) {
            alert("Bạn chỉ có thể đánh giá món ăn này một lần.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🗑️ Xóa review
    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
            try {
                await authApi().delete(endpoints['delete-review'](reviewId));
                setReviews(current => current.filter(r => r.id !== reviewId));
            } catch (err) {
                alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        }
    };

    // ✏️ Cập nhật review
    const handleUpdateReview = async (e) => {
        e.preventDefault();
        try {
            const res = await authApi().patch(
                endpoints['update-review'](editingReview.id),
                {
                    content: editingReview.content,
                    rating: editingReview.rating
                }
            );
            setReviews(current =>
                current.map(r => r.id === editingReview.id ? res.data : r)
            );
            setEditingReview(null);
        } catch (err) {
            alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return (total / reviews.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    if (!dish) {
        return null;
    }

    return (
        <Container className="my-4">
            {/* Chi tiết món ăn */}
            <Row>
                <Col md={5}>
                    <Image src={dish.image} alt={dish.name} fluid rounded className="shadow" />
                </Col>
                <Col md={7}>
                    <h1 className="fw-bold" style={{ color: "#8B0000" }}>{dish.name}</h1>
                    <p className="text-muted">{dish.category?.name}</p>
                    <div dangerouslySetInnerHTML={{ __html: dish.description }} />
                    <p className="display-4 fw-bold text-danger">
                        {parseInt(dish.price).toLocaleString('vi-VN')} VNĐ
                    </p>
                    <Button variant="dark" size="lg" onClick={() => addToCart(dish)}>
                        Thêm vào giỏ 
                    </Button>
                </Col>
            </Row>

            <hr className="my-5" />

            {/* Đánh giá */}
            <Row>
                <Col md={7}>
                    <h3 className="mb-3">Đánh giá từ khách hàng</h3>

                    {/* Điểm trung bình */}
                    <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                        <span className="display-4 me-3">{calculateAverageRating()}</span>
                        <div>
                            <StarRating rating={calculateAverageRating()} />
                            <span className="text-muted">({reviews.length} đánh giá)</span>
                        </div>
                    </div>

                    <ListGroup variant="flush">
                        {reviews.map(r => (
                            <ListGroup.Item key={r.id} className="mb-3 border-bottom pb-3 ps-0">
                                <div className="d-flex">
                                    <Image
                                        src={r.user.avatar}
                                        alt={r.user.username}
                                        roundedCircle
                                        width="50"
                                        height="50"
                                        className="me-3"
                                    />
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between">
                                            <strong>{r.user.first_name} {r.user.last_name}</strong>
                                            <small className="text-muted">
                                                {moment(r.created_date).fromNow()}
                                            </small>
                                        </div>

                                        {/* Nếu đang edit */}
                                        {editingReview && editingReview.id === r.id ? (
                                            <Form onSubmit={handleUpdateReview} className="mt-2">
                                                <Form.Group className="mb-2">
                                                    <Form.Select
                                                        value={editingReview.rating}
                                                        onChange={(e) =>
                                                            setEditingReview({
                                                                ...editingReview,
                                                                rating: parseInt(e.target.value)
                                                            })
                                                        }
                                                        size="sm"
                                                    >
                                                        <option value={5}>5 sao</option>
                                                        <option value={4}>4 sao</option>
                                                        <option value={3}>3 sao</option>
                                                        <option value={2}>2 sao</option>
                                                        <option value={1}>1 sao</option>
                                                    </Form.Select>
                                                </Form.Group>
                                                <Form.Group className="mb-2">
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={editingReview.content}
                                                        onChange={(e) =>
                                                            setEditingReview({
                                                                ...editingReview,
                                                                content: e.target.value
                                                            })
                                                        }
                                                        required
                                                    />
                                                </Form.Group>
                                                <Button type="submit" variant="success" size="sm">Lưu</Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="ms-2"
                                                    onClick={() => setEditingReview(null)}
                                                >
                                                    Hủy
                                                </Button>
                                            </Form>
                                        ) : (
                                            <>
                                                <StarRating rating={r.rating} />
                                                <p className="mt-2 mb-0">{r.content}</p>
                                            </>
                                        )}

                                        {/* Nút sửa/xóa */}
                                        {user && user.username === r.user.username && !editingReview && (
                                            <div className="mt-2">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditingReview({
                                                            id: r.id,
                                                            content: r.content,
                                                            rating: r.rating
                                                        })
                                                    }
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="ms-2"
                                                    onClick={() => handleDeleteReview(r.id)}
                                                >
                                                    Xóa
                                                </Button>
                                            </div>
                                        )}


                                        {/* Hiển thị phản hồi nhân viên */}
                                        {r.replies && r.replies.length > 0 && (
                                            <div className="mt-3 ms-4 border-start ps-3">
                                                {r.replies.map(reply => (
                                                    <div key={reply.id} className="d-flex mb-2">
                                                        <Image
                                                            src={reply.user.avatar}
                                                            alt={reply.user.username}
                                                            roundedCircle
                                                            width="40"
                                                            height="40"
                                                            className="me-2"
                                                        />
                                                        <div>
                                                            <strong>{reply.user.first_name} (Nhân viên)</strong>
                                                            <small className="d-block text-muted">
                                                                {moment(reply.created_date).fromNow()}
                                                            </small>
                                                            <p className="mb-0">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>

                {/* Form thêm đánh giá */}
                <Col md={5}>
                    <h3 className="mb-3">Để lại đánh giá của bạn</h3>
                    {user ? (
                        <Card className="p-3">
                            <Form onSubmit={handleAddReview}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Đánh giá (số sao)</Form.Label>
                                    <Form.Select
                                        value={newReviewRating}
                                        onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                                    >
                                        <option value={5}>5 sao (Tuyệt vời)</option>
                                        <option value={4}>4 sao (Tốt)</option>
                                        <option value={3}>3 sao (Bình thường)</option>
                                        <option value={2}>2 sao (Tệ)</option>
                                        <option value={1}>1 sao (Rất tệ)</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nội dung bình luận</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={newReviewContent}
                                        onChange={(e) => setNewReviewContent(e.target.value)}
                                        placeholder="Chia sẻ cảm nhận của bạn..."
                                        required
                                    />
                                </Form.Group>
                                <Button type="submit" variant="success" disabled={isSubmitting}>
                                    {isSubmitting ? <Spinner size="sm" /> : "Gửi đánh giá"}
                                </Button>
                            </Form>
                        </Card>
                    ) : (
                        <Alert variant="info">
                            Vui lòng <Link to="/login">đăng nhập</Link> để để lại đánh giá của bạn.
                        </Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default DishDetail;
