import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Alert, Spinner, Row, Col, Badge, ListGroup, Image } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import moment from 'moment';
import { UserContext } from '../../configs/UserContext';
import { authApi, endpoints } from '../../configs/Apis';
import { Bank, Trash, Wallet } from 'react-bootstrap-icons';

moment.locale('vi');

const OrderHistory = () => {
    const { user } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            if (user) {
                try {
                    setLoading(true);
                    setError(null);
                    const res = await authApi().get(endpoints['orders']);
                    const ordersData = res.data.results || (Array.isArray(res.data) ? res.data : []);
                    setOrders(ordersData);
                } catch (err) {
                    console.error("Lỗi khi tải lịch sử đặt món:", err);
                    setError("Không thể tải được dữ liệu. Vui lòng thử lại.");
                } finally {
                    setLoading(false);
                }
            }
        };

        loadOrders();
    }, [user]);


    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Thao tác này không thể hoàn tác.")) {
            try {
                const res = await authApi().patch(endpoints['cancel-order'](orderId));
                setOrders(currentOrders =>
                    currentOrders.map(o => (o.id === orderId ? res.data : o))
                );
                alert("Hủy đơn hàng thành công!");
            } catch (err) {
                console.error(`Lỗi khi hủy đơn #${orderId}:`, err);
                const errorMessage = err.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.";
                alert(errorMessage);
            }
        }
    };
    const handlePayment = async (orderId, paymentType) => {
        try {
            let endpoint;
            if (paymentType === 'MOMO') {
                endpoint = endpoints['initiate-payment'](orderId);
            }
            else if (paymentType === 'VNPAY') {
                endpoint = endpoints['initiate-vnpay-payment'](orderId);
            }
            else {
                return;
            }

            const res = await authApi().post(endpoint);
            window.location.href = res.data.payUrl || res.data.paymentUrl;
        } catch (err) {
            console.error(`Lỗi khi tạo thanh toán ${paymentType}:`, err);
            alert("Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
        }
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="dark" />
                <p className="mt-2">Đang tải lịch sử...</p>
            </Container>
        );
    }

    if (error) {
        return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return { bg: 'warning', text: 'dark', label: 'Chưa thanh toán' };
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
            <h1 className="text-center mb-4" style={{ color: '#8B0000', fontWeight: 'bold' }}>LỊCH SỬ GỌI MÓN</h1>

            {orders.length === 0 ? (
                <Alert variant="info">
                    Bạn chưa có lịch sử gọi món nào.
                    <Link to="/" className="alert-link ms-2">Bắt đầu gọi món!</Link>
                </Alert>
            ) : (
                <Row>
                    {orders.map(order => {
                        const statusBadge = getStatusBadge(order.status);
                        return (
                            <Col md={12} key={order.id} className="mb-4">
                                <Card
                                    className="shadow-sm border-0"
                                    style={{
                                        borderRadius: '15px',
                                        backgroundColor: '#FFFDF7',
                                        border: '2px solid #FFD700',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Card.Header
                                        as="h5"
                                        className="d-flex justify-content-between align-items-center"
                                        style={{
                                            backgroundColor: '#ffe6a8ff',
                                            color: '#8B0000',
                                            fontWeight: '600',
                                            borderBottom: '2px solid #FFD700',
                                            fontSize: '1rem',
                                            borderTopLeftRadius: '13px',
                                            borderTopRightRadius: '13px'
                                        }}
                                    >
                                        <span>Hóa đơn #{order.id} - {moment(order.created_date).format('HH:mm DD/MM/YYYY')}</span>
                                        <Badge style={{

                                            fontWeight: '500',
                                            padding: '0.4em 0.8em',
                                            borderRadius: '50px',
                                            fontSize: '0.85rem'
                                        }} bg={statusBadge.bg} text={statusBadge.text}>{statusBadge.label}</Badge>
                                    </Card.Header>

                                    <Card.Body style={{ backgroundColor: '#FFFDF7' }}>
                                        <ListGroup variant="flush">
                                            {order.details.map(detail => (
                                                <ListGroup.Item
                                                    key={detail.id}
                                                    className="d-flex justify-content-between align-items-center mb-2 shadow-sm"
                                                    style={{
                                                        backgroundColor: '#FFFDF7',
                                                        border: '1px solid #8B0000',
                                                        borderRadius: '10px',
                                                        padding: '0.75rem 1rem',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <Image src={detail.dish.image} width="50" rounded className="me-3 shadow-sm" />
                                                        <span style={{ color: '#4B4B4B', fontWeight: '500' }}>{detail.dish.name} (x{detail.quantity})</span>
                                                    </div>
                                                    <span className="fw-semibold" style={{ color: '#8B0000' }}>
                                                        {parseInt(detail.unit_price * detail.quantity).toLocaleString('vi-VN')} VNĐ
                                                    </span>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>

                                    <Card.Footer className="text-end" style={{ backgroundColor: '#FFFDF7', borderTop: '2px solid #FFD700', padding: '0.75rem 1rem' }}>
                                        <div className="text-end">
                                            <span className="fs-5 me-3" style={{ color: '#4B4B4B', fontWeight: '600' }}>
                                                Tổng cộng:
                                                <span style={{ color: '#8B0000', fontWeight: '700', marginLeft: '0.3rem' }}>
                                                    {parseInt(order.total_amount).toLocaleString('vi-VN')} VNĐ
                                                </span>
                                            </span>

                                            {order.status === 'COMPLETED' && order.payment_method && (
                                                <div style={{ marginTop: '0.5rem', fontWeight: '700', marginLeft: '0.3rem', fontWeight: '500' }}>
                                                    Phương thức thanh toán: <span style={{ color: '#8B0000', fontWeight: '600' }}>{order.payment_method}</span>
                                                </div>
                                            )}
                                        </div>
                                        {order.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    style={{
                                                        backgroundColor: '#B33A3A', border: 'none',
                                                        fontWeight: '500',
                                                        padding: '0.4em 0.8em',
                                                        borderRadius: '50px',
                                                    }}
                                                    className="me-2"
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    onClick={() => handleCancelOrder(order.id)}
                                                >
                                                    <Trash className="me-1" /> Hủy đơn
                                                </Button>

                                                <Button
                                                    style={{
                                                        backgroundColor: '#ff00a2ff', 
                                                        border: 'none',
                                                        color: '#333',
                                                        fontWeight: '500',
                                                        padding: '0.4em 0.8em',
                                                        borderRadius: '50px',
                                                    }}
                                                    className="me-2"
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    onClick={() => handlePayment(order.id, 'MOMO')}
                                                >
                                                    <Wallet className="me-1" /> Thanh toán MoMo
                                                </Button>

                                                <Button
                                                    style={{
                                                        backgroundColor: '#1976D2', 
                                                        border: 'none',
                                                        color: '#FFF',
                                                        fontWeight: '500',
                                                        padding: '0.4em 0.8em',
                                                        borderRadius: '50px',
                                                    }}
                                                    className="me-2"
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    onClick={() => handlePayment(order.id, 'VNPAY')}
                                                >
                                                    <Bank className="me-1" /> Thanh toán VNPay
                                                </Button>
                                            </>
                                        )}
                                    </Card.Footer>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            )}
        </Container>
    );
};

export default OrderHistory;
