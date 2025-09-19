import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Spinner, Alert, Table, Button, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { authApi, endpoints } from '../../configs/Apis';
import { UserContext } from '../../configs/UserContext';
import moment from 'moment';
import 'moment/locale/vi';

const OrderDetail = () => {
    const { orderId } = useParams();
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        moment.locale('vi');
        const loadOrderDetail = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const res = await authApi().get(endpoints['order-detail'](orderId));
                setOrder(res.data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết hóa đơn:", err);
                setError("Không thể tải dữ liệu hóa đơn.");
            } finally {
                setLoading(false);
            }
        };
        loadOrderDetail();
    }, [orderId, user]);

    const handlePrint = () => {
        navigate('/manager/print-invoice', { state: { orderData: order } });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <Badge bg="warning">Đang chờ</Badge>;
            case 'COMPLETED': return <Badge bg="success">Hoàn thành</Badge>;
            case 'CANCELLED': return <Badge bg="secondary">Đã hủy</Badge>;
            default: return <Badge bg="light">{status}</Badge>;
        }
    };

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    if (!order) {
        return <Alert variant="warning" className="mt-4">Không tìm thấy thông tin hóa đơn.</Alert>;
    }

    return (
        <Container className="my-4" style={{ backgroundColor: '#e7f0fd', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h1 className="text-center mb-4" style={{ color: '#1a73e8', fontWeight: '700' }}>
                CHI TIẾT HÓA ĐƠN #{order.id}
            </h1>

            <Card className="shadow-sm mb-4">
                <Card.Header as="h5" style={{ backgroundColor: '#1a73e8', color: '#fff' }}>Thông tin chung</Card.Header>
                <Card.Body>
                    <p><strong>Khách hàng:</strong> {order.user ? `${order.user.last_name} ${order.user.first_name}` : (order.table ? `Bàn ${order.table.table_number}` : 'Khách vãng lai')}</p>
                    <p><strong>Ngày tạo:</strong> {moment(order.created_date).format('HH:mm DD/MM/YYYY')}</p>
                    <p><strong>Trạng thái:</strong> {getStatusBadge(order.status)}</p>
                    <p><strong>Phương thức thanh toán:</strong> {order.payment_method}</p>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Header as="h5" style={{ backgroundColor: '#1a73e8', color: '#fff' }}>Chi tiết các món ăn</Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <thead style={{ backgroundColor: '#1a73e8', color: '#fff' }}>
                            <tr>
                                <th>#</th>
                                <th>Tên món ăn</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.details.map((detail, index) => (
                                <tr key={detail.id}>
                                    <td>{index + 1}</td>
                                    <td>{detail.dish.name}</td>
                                    <td>{detail.quantity}</td>
                                    <td>{parseInt(detail.unit_price).toLocaleString('vi-VN')} VNĐ</td>
                                    <td>{parseInt(detail.quantity * detail.unit_price).toLocaleString('vi-VN')} VNĐ</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="table-light">
                                <td colSpan="4" className="text-end fw-bold">TỔNG CỘNG</td>
                                <td className="fw-bold text-danger">{parseInt(order.total_amount).toLocaleString('vi-VN')} VNĐ</td>
                            </tr>
                        </tfoot>
                    </Table>
                </Card.Body>
            </Card>

            <div className="text-center mt-4">
                <Button style={{ backgroundColor: '#1a73e8', border: 'none' }} size="lg" onClick={handlePrint}>
                    In Hóa Đơn
                </Button>
            </div>
        </Container>
    );
};

export default OrderDetail;
