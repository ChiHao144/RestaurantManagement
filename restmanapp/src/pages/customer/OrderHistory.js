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
            <h1 className="text-center text-dark mb-4">LỊCH SỬ GỌI MÓN</h1>

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
                                <Card className="shadow-sm">
                                    <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                                        <span>Hóa đơn #{order.id} - {moment(order.created_date).format('HH:mm DD/MM/YYYY')}</span>
                                        <Badge bg={statusBadge.bg} text={statusBadge.text}>{statusBadge.label}</Badge>
                                    </Card.Header>
                                    <Card.Body>
                                        <ListGroup variant="flush">
                                            {order.details.map(detail => (
                                                <ListGroup.Item key={detail.id} className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <Image src={detail.dish.image} width="50" rounded className="me-3" />
                                                        <span>{detail.dish.name} (x{detail.quantity})</span>
                                                    </div>
                                                    <span className="fw-bold">{parseInt(detail.unit_price * detail.quantity).toLocaleString('vi-VN')} VNĐ</span>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>
                                    <Card.Footer className="text-end">
                                        <span className="fs-5 me-3"><strong>Tổng cộng:</strong> <span className="text-danger">{parseInt(order.total_amount).toLocaleString('vi-VN')} VNĐ</span></span>
                                        {order.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    variant="danger"
                                                    className="me-2"
                                                    onClick={() => handleCancelOrder(order.id)}
                                                >
                                                    <Trash className="me-1" />
                                                    Hủy đơn hàng
                                                </Button>

                                                <Button
                                                    variant="success"
                                                    className="me-2"
                                                    onClick={() => handlePayment(order.id, 'MOMO')}
                                                >
                                                    <Wallet className="me-1" />
                                                    Thanh toán MoMo
                                                </Button>

                                                <Button
                                                    variant="info"
                                                    onClick={() => handlePayment(order.id, 'VNPAY')}
                                                >
                                                    <Bank className="me-1" />
                                                    Thanh toán VNPay
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
