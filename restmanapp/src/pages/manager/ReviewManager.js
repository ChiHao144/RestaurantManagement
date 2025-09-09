import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, ListGroup, Spinner, Alert, Image, Button, Form, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authApi, endpoints } from '../../configs/Apis';
import { UserContext } from '../../configs/UserContext';
import moment from 'moment';
import 'moment/locale/vi';

const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className={`star ${i <= rating ? 'text-warning' : 'text-secondary'}`}>
                &#9733;
            </span>
        );
    }
    return <div>{stars}</div>;
};

const ReviewManagement = () => {
    const { user } = useContext(UserContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [replyingTo, setReplyingTo] = useState(null); 
    const [replyContent, setReplyContent] = useState('');

    const loadReviews = useCallback(async () => {
        if (!user || !['WAITER', 'MANAGER', 'ADMIN'].includes(user.role)) {
            setError("Bạn không có quyền truy cập trang này.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await authApi().get(endpoints['all-reviews']);
            const data = res.data.results || res.data;
            if (Array.isArray(data)) {
                setReviews(data);
            } else {
                throw new Error("Dữ liệu trả về không hợp lệ.");
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách đánh giá:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        moment.locale('vi');
        loadReviews();
    }, [loadReviews]);

    const handleReplySubmit = async (e, reviewId) => {
        e.preventDefault();
        try {
            const res = await authApi().post(endpoints['add-reply'](reviewId), { content: replyContent });
            setReviews(currentReviews =>
                currentReviews.map(r => 
                    r.id === reviewId 
                        ? { ...r, replies: [...(r.replies || []), res.data] } 
                        : r
                )
            );
            setReplyingTo(null);
            setReplyContent('');
        } catch (err) {
            console.error("Lỗi khi gửi phản hồi:", err);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <Container className="my-4">
            <h1 className="text-center text-success mb-4">Quản Lý Đánh Giá Khách Hàng</h1>
            <ListGroup>
                {reviews.length > 0 ? reviews.map(r => (
                    <ListGroup.Item key={r.id} className="mb-3 shadow-sm">
                        <Card>
                            <Card.Header className="d-flex justify-content-between">
                                <span>
                                    Đánh giá cho món: <Link to={`/dishes/${r.dish.id}`} className="fw-bold">{r.dish.name}</Link>
                                </span>
                                <small className="text-muted">{moment(r.created_date).format('HH:mm DD/MM/YYYY')}</small>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex">
                                    <Image src={r.user.avatar} alt={r.user.username} roundedCircle width="50" height="50" className="me-3" />
                                    <div className="flex-grow-1">
                                        <strong>{r.user.first_name} {r.user.last_name}</strong>
                                        <StarRating rating={r.rating} />
                                        <p className="mt-2 mb-0">{r.content}</p>

                                        {r.replies && r.replies.length > 0 && (
                                            <div className="mt-3 ms-4 border-start ps-3">
                                                <h6 className="fw-bold">Phản hồi từ nhà hàng:</h6>
                                                {r.replies.map(reply => (
                                                    <div key={reply.id} className="d-flex mb-2">
                                                        <Image src={reply.user.avatar} alt={reply.user.username} roundedCircle width="40" height="40" className="me-2" />
                                                        <div>
                                                            <strong>{reply.user.first_name} (Nhân viên)</strong>
                                                            <p className="mb-0">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-2">
                                            {replyingTo === r.id ? (
                                                <Form onSubmit={(e) => handleReplySubmit(e, r.id)}>
                                                    <Form.Control 
                                                        as="textarea" rows={2} value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder="Nhập phản hồi của bạn..." required className="mb-2"
                                                    />
                                                    <Button type="submit" size="sm" variant="success">Gửi</Button>
                                                    <Button size="sm" variant="secondary" className="ms-2" onClick={() => setReplyingTo(null)}>Hủy</Button>
                                                </Form>
                                            ) : (
                                                 (!r.replies || r.replies.length === 0) && (
                                                    <Button variant="outline-success" size="sm" onClick={() => setReplyingTo(r.id)}>
                                                        Phản hồi
                                                    </Button>
                                                 )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </ListGroup.Item>
                )) : (
                    <Alert variant="info">Chưa có đánh giá nào từ khách hàng.</Alert>
                )}
            </ListGroup>
        </Container>
    );
};

export default ReviewManagement;