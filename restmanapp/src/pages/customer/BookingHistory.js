import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Alert, Spinner, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import moment from 'moment';
import { UserContext } from '../../configs/UserContext';
import { authApi, endpoints } from '../../configs/Apis';

moment.locale('vi');

const BookingHistory = () => {
    const { user } = useContext(UserContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBookings = async () => {
            if (user) {
                try {
                    setLoading(true);
                    setError(null);
                    const res = await authApi().get(endpoints['bookings']);
                    const bookingsData = res.data.results || (Array.isArray(res.data) ? res.data : []);
                    setBookings(bookingsData);
                } catch (err) {
                    console.error("Lỗi khi tải lịch sử đặt bàn:", err);
                    setError("Không thể tải được dữ liệu. Vui lòng thử lại.");
                } finally {
                    setLoading(false);
                }
            }
        };
        loadBookings();
    }, [user]);

    const cancelBooking = async (bookingId) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy yêu cầu đặt bàn này không?")) {
            try {
                const res = await authApi().patch(endpoints['cancel-booking'](bookingId));
                setBookings(currentBookings => currentBookings.map(b => {
                    if (b.id === bookingId) {
                        return res.data; 
                    }
                    return b;
                }));
                alert("Hủy yêu cầu thành công!");
            } catch (err) {
                console.error("Lỗi khi hủy đơn:", err);
                alert("Đã xảy ra lỗi khi hủy yêu cầu. Vui lòng thử lại.");
            }
        }
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="dark" />
                <p className="mt-2">Đang tải lịch sử đặt bàn...</p>
            </Container>
        );
    }

    if (error) {
        return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
    }
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return { bg: 'warning', text: 'dark', label: 'Đang chờ' };
            case 'CONFIRMED':
                return { bg: 'primary', text: 'white', label: 'Đã xác nhận' };
            case 'COMPLETED':
                return { bg: 'success', text: 'white', label: 'Đã hoàn thành' };
            case 'CANCELLED':
                return { bg: 'secondary', text: 'white', label: 'Đã hủy' };
            default:
                return { bg: 'light', text: 'dark', label: status };
        }
    };

    return (
        <Container className="my-5">
            <h1 className="text-center text-dark mb-4">LỊCH SỬ ĐẶT BÀN</h1>
            
            {bookings.length === 0 ? (
                <Alert variant="info">
                    Bạn chưa có lịch sử đặt bàn nào. 
                    <Link to="/booking" className="alert-link ms-2">Đặt bàn ngay!</Link>
                </Alert>
            ) : (
                <Row>
                    {bookings.map(booking => {
                        const statusBadge = getStatusBadge(booking.status);
                        const isCancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

                        return (
                            <Col md={6} lg={4} key={booking.id} className="mb-4">
                                <Card className="h-100 shadow-sm">
                                    <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                                        <span>Yêu cầu #{booking.id}</span>
                                        <Badge bg={statusBadge.bg} text={statusBadge.text}>{statusBadge.label}</Badge>
                                    </Card.Header>
                                    <Card.Body>
                                        <Card.Text><strong>Thời gian:</strong> {moment(booking.booking_time).format('HH:mm [ngày] DD/MM/YYYY')}</Card.Text>
                                        <Card.Text><strong>Số lượng khách:</strong> {booking.number_of_guests}</Card.Text>
                                        <Card.Text><strong>Ghi chú của bạn:</strong> {booking.note || 'Không có'}</Card.Text>
                                        {booking.status === 'CONFIRMED' && booking.details && booking.details.length > 0 && (
                                            <>
                                                <hr />
                                                <p className="fw-bold">Thông tin bàn đã xếp:</p>
                                                <ListGroup variant="flush">
                                                    {booking.details.map(detail => (
                                                        <ListGroup.Item key={detail.table.id}>
                                                            <strong>{`Bàn ${detail.table.table_number}`}</strong>
                                                            <br/>
                                                            <small className="text-muted">{detail.note || 'Không có ghi chú từ nhân viên.'}</small>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            </>
                                        )}
                                    </Card.Body>
                                    {isCancellable && (
                                        <Card.Footer className="text-end">
                                            <Button variant="danger" size="sm" onClick={() => cancelBooking(booking.id)}>
                                                Hủy yêu cầu
                                            </Button>
                                        </Card.Footer>
                                    )}
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            )}
        </Container>
    );
};

export default BookingHistory;
