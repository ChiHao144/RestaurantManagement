import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import moment from 'moment';
import { UserContext } from '../../configs/UserContext';
import { authApi, endpoints } from '../../configs/Apis';

const ManagerDashboard = () => {
    const { user } = useContext(UserContext);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const loadPendingBookings = async () => {
            if (user && (user.role === 'WAITER' || user.role === 'MANAGER' || user.role === 'ADMIN')) {
                try {
                    setLoading(true);
                    setError(null);
                     const res = await authApi().get(endpoints['pending-bookings']);
                    setPendingBookings(res.data);
                } catch (err) {
                    console.error("Lỗi khi tải danh sách đặt bàn:", err);
                    setError("Không thể tải dữ liệu. Vui lòng thử lại.");
                } finally {
                    setLoading(false);
                }
            }
        };

        loadPendingBookings();
    }, [user]);

    if (!user || !['WAITER', 'MANAGER', 'ADMIN'].includes(user.role)) {
        return <Navigate to="/" />;
    }

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="dark" />
                <p className="mt-2">Đang tải danh sách yêu cầu...</p>
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
        <Container className="my-5">
            <h1 className="text-center text-dark mb-4">QUẢN LÝ ĐẶT BÀN</h1>
            <h2 className="h4 mb-3">Yêu cầu đang chờ xác nhận</h2>

            {pendingBookings.length === 0 ? (
                <Alert variant="info">Không có yêu cầu đặt bàn nào đang chờ.</Alert>
            ) : (
                <Row>
                    {pendingBookings.map(booking => (
                        <Col md={6} lg={4} key={booking.id} className="mb-4">
                            <Card className="h-100">
                                <Card.Header as="h5">
                                    Yêu cầu #{booking.id}
                                    <Badge bg="warning" text="dark" className="ms-2">Đang chờ</Badge>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <strong>Khách hàng:</strong> {booking.user.first_name} {booking.user.last_name}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Thời gian:</strong> {moment(booking.booking_time).format('HH:mm [ngày] DD/MM/YYYY')}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Số lượng khách:</strong> {booking.number_of_guests}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Ghi chú:</strong> {booking.note || 'Không có'}
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer className="text-end">
                                    <Button as={Link} to={`/manager/assign/${booking.id}`} variant="dark">
                                        Xem & Gán bàn
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default ManagerDashboard;
