import {React, useState, useEffect, useContext, useCallback} from 'react';
import { Container, Table, Spinner, Alert, Badge, Form, InputGroup, FormControl, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authApi, endpoints } from '../../configs/Apis';
import { UserContext } from '../../configs/UserContext';
import moment from 'moment';
import 'moment/locale/vi';

// Component để hiển thị huy hiệu trạng thái
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
    
    // State cho Modal cập nhật
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newPaymentMethod, setNewPaymentMethod] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // State cho các bộ lọc
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchId, setSearchId] = useState('');

    const loadOrders = useCallback(async () => {
        if (!user || !['STAFF', 'MANAGER', 'ADMIN'].includes(user.role)) {
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

    // Hàm mở Modal
    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setNewPaymentMethod(order.payment_method);
        setShowUpdateModal(true);
    };

    // Hàm đóng Modal
    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setSelectedOrder(null);
    };

    // Hàm lưu thay đổi từ Modal
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

    // Lọc và tìm kiếm hóa đơn
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        const matchesId = searchId === '' || order.id.toString().includes(searchId);
        return matchesStatus && matchesId;
    });

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <>
            <Container className="my-4">
                <h1 className="text-center text-success mb-4">Quản Lý Hóa Đơn</h1>

                <div className="d-flex justify-content-between mb-3">
                    <Form.Group style={{ maxWidth: '300px' }}>
                        <Form.Label className="fw-bold">Lọc theo trạng thái:</Form.Label>
                        <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="ALL">Tất cả</option>
                            <option value="PENDING">Đang chờ</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group style={{ maxWidth: '300px' }}>
                        <Form.Label className="fw-bold">Tìm theo mã hóa đơn:</Form.Label>
                        <InputGroup>
                            <FormControl
                                placeholder="Nhập ID..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>
                </div>

                <Table striped bordered hover responsive className="shadow-sm">
                    <thead className="table-dark">
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
                                    <div className="d-flex gap-2">
                                        <Button as={Link} to={`/manager/orderdetails/${o.id}`} variant="outline-dark" size="sm">
                                            Chi tiết
                                        </Button>
                                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(o)}>
                                            Cập nhật
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="text-center">Không có hóa đơn nào phù hợp.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Container>

            <Modal show={showUpdateModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
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

