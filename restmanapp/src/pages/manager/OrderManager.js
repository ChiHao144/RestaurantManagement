import {React, useState, useEffect, useContext, useCallback} from 'react';
import { Container, Table, Spinner, Alert, Badge, Form, InputGroup, FormControl, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authApi, endpoints } from '../../configs/Apis';
import { UserContext } from '../../configs/UserContext';
import moment from 'moment';
import 'moment/locale/vi';

const StatusBadge = ({ status }) => {
    let variant;
    let text = status;

    switch (status) {
        case 'PENDING':
            variant = 'warning';
            text = 'Đang chờ';
            break;
        case 'COMPLETED':
            variant = 'success';
            text = 'Hoàn thành';
            break;
        case 'CANCELLED':
            variant = 'secondary';
            text = 'Đã hủy';
            break;
        default:
            variant = 'light';
    }

    return <Badge bg={variant}>{text}</Badge>;
};

const OrderManagement = () => {
    const { user } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newPaymentMethod, setNewPaymentMethod] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchId, setSearchId] = useState('');

    const loadOrders = useCallback(async () => {
        if (!user || !['WAITER', 'MANAGER', 'ADMIN'].includes(user.role)) {
            setError("Bạn không có quyền truy cập trang này.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await authApi().get(endpoints['orders']);
            const data = res.data.results || res.data;
            if (Array.isArray(data)) {
                setOrders(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
            } else {
                throw new Error("Dữ liệu trả về không hợp lệ.");
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách hóa đơn:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        moment.locale('vi');
        loadOrders();
    }, [loadOrders]);

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setNewPaymentMethod(order.payment_method);
        setShowUpdateModal(true);
    };

    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setSelectedOrder(null);
    };

    const handleSaveChanges = async () => {
        if (!selectedOrder) return;

        setIsUpdating(true);
        try {
            const res = await authApi().patch(endpoints['update-order'](selectedOrder.id), {
                status: newStatus,
                payment_method: newPaymentMethod
            });
            setOrders(currentOrders =>
                currentOrders.map(o => (o.id === selectedOrder.id ? res.data : o))
            );
            handleCloseModal();
        } catch (err) {
            console.error(`Lỗi khi cập nhật hóa đơn #${selectedOrder.id}:`, err);
            alert("Cập nhật thất bại. Vui lòng thử lại.");
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        const matchesId = searchId === '' || order.id.toString().includes(searchId);
        return matchesStatus && matchesId;
    });

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <>
            <Container className="my-4" style={{ backgroundColor: '#e7f0fd', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <h1 className="text-center mb-4" style={{ color: '#1a73e8', fontWeight: '700', letterSpacing: '1px' }}>QUẢN LÝ HÓA ĐƠN</h1>

                <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-3">
                    <Form.Group style={{ maxWidth: '300px' }}>
                        <Form.Label className="fw-bold" style={{ color: '#1a73e8' }}>Lọc theo trạng thái:</Form.Label>
                        <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="ALL">Tất cả</option>
                            <option value="PENDING">Đang chờ</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group style={{ maxWidth: '300px' }}>
                        <Form.Label className="fw-bold" style={{ color: '#1a73e8' }}>Tìm theo mã hóa đơn:</Form.Label>
                        <InputGroup>
                            <FormControl
                                placeholder="Nhập ID..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>
                </div>

                <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <thead className="table-primary" style={{ backgroundColor: '#1a73e8', color: '#fff' }}>
                        <tr>
                            <th>#ID</th>
                            <th>Khách hàng / Bàn</th>
                            <th>Tổng tiền</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? filteredOrders.map(o => (
                            <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{o.user ? `${o.user.last_name} ${o.user.first_name}` : (o.table ? `Bàn ${o.table.table_number}` : 'Khách vãng lai')}</td>
                                <td>{parseInt(o.total_amount).toLocaleString('vi-VN')} VNĐ</td>
                                <td>{o.payment_method}</td>
                                <td><StatusBadge status={o.status} /></td>
                                <td>{moment(o.created_date).format('HH:mm DD/MM/YYYY')}</td>
                                <td>
                                    <div className="d-flex gap-2 flex-column flex-sm-row">
                                        <Button as={Link} to={`/manager/orderdetails/${o.id}`} style={{ backgroundColor: '#1a73e8', border: 'none' }} size="sm">
                                            Chi tiết
                                        </Button>
                                        <Button style={{ backgroundColor: '#1a73e8', border: 'none' }} size="sm" onClick={() => handleOpenModal(o)}>
                                            Cập nhật
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="text-center" style={{ color: '#1a73e8' }}>Không có hóa đơn nào phù hợp.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Container>

            <Modal show={showUpdateModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#1a73e8', color: '#fff' }}>
                    <Modal.Title>Cập nhật Hóa đơn #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Trạng thái mới:</Form.Label>
                        <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            <option value="PENDING">Đang chờ</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Phương thức thanh toán mới:</Form.Label>
                        <Form.Select value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)}>
                            <option value="CASH">Tiền mặt</option>
                            <option value="MOMO">Ví MoMo</option>
                            <option value="VNPAY">Ví VNPAY</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleSaveChanges} disabled={isUpdating}>
                        {isUpdating ? <Spinner size="sm" /> : "Lưu thay đổi"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default OrderManagement;
