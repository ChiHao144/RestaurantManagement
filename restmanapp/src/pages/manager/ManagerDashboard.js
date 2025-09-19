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
            if (user && ['WAITER', 'MANAGER', 'ADMIN'].includes(user.role)) {
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
                <Spinner animation="border" variant="primary" />
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
        <Container 
            className="my-5" 
            style={{ backgroundColor: '#e7f0fd', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
            <h1 className="text-center mb-4" style={{ color: '#1a73e8', fontWeight: '700', letterSpacing: '1px' }}>
                QUẢN LÝ ĐẶT BÀN
            </h1>
            <h2 className="h5 mb-4" style={{ color: '#1a73e8', fontWeight: '600' }}>Yêu cầu đang chờ xác nhận</h2>

            {pendingBookings.length === 0 ? (
                <Alert variant="info" style={{ borderRadius: '8px', backgroundColor: '#d0e4ff', color: '#084298', border: '1px solid #b6d4fe' }}>
                    Không có yêu cầu đặt bàn nào đang chờ.
                </Alert>
            ) : (
                <Row>
                    {pendingBookings.map(booking => (
                        <Col md={6} lg={4} key={booking.id} className="mb-4">
                            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: 'none', transition: 'transform 0.2s' }} className="h-100 hover-card">
                                <Card.Header style={{ backgroundColor: '#1a73e8', color: '#fff', fontWeight: '600', borderRadius: '12px 12px 0 0' }}>
                                    Yêu cầu #{booking.id}
                                    <Badge bg="info" text="dark" className="ms-2">Đang chờ</Badge>
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
                                <Card.Footer className="text-end" style={{ backgroundColor: 'transparent', borderTop: '1px solid #b6d4fe' }}>
                                    <Button 
                                        as={Link} 
                                        to={`/manager/assign/${booking.id}`} 
                                        style={{ backgroundColor: '#1a73e8', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', transition: 'all 0.2s' }}
                                    >
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
