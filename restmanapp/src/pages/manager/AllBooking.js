import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Spinner, Alert, Badge, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authApi, endpoints } from '../../configs/Apis';
import { UserContext } from '../../configs/UserContext';
import moment from 'moment';
import 'moment/locale/vi';

// Component để hiển thị huy hiệu trạng thái với màu sắc tương ứng
const StatusBadge = ({ status }) => {
    let variant;
    let text = status;

    switch (status) {
        case 'PENDING':
            variant = 'warning';
            text = 'Đang chờ';
            break;
        case 'CONFIRMED':
            variant = 'success';
            text = 'Đã xác nhận';
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

const AllBookings = () => {
    const { user } = useContext(UserContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'

    useEffect(() => {
        moment.locale('vi');
        const loadAllBookings = async () => {
            if (!user || !['STAFF', 'MANAGER', 'ADMIN'].includes(user.role)) {
                setError("Bạn không có quyền truy cập trang này.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await authApi().get(endpoints['bookings'], {
                });
                
                const data = res.data.results || res.data;
                if (Array.isArray(data)) {
                    setBookings(data);
                } else {
                    throw new Error("Dữ liệu trả về không hợp lệ.");
                }

            } catch (err) {
                console.error("Lỗi khi tải tất cả đơn đặt bàn:", err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        loadAllBookings();
    }, [user]);

    // Lọc danh sách booking dựa trên filterStatus
    const filteredBookings = bookings.filter(booking => {
        if (filterStatus === 'ALL') {
            return true;
        }
        return booking.status === filterStatus;
    });

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <Container className="my-4">
            <h1 className="text-center text-success mb-4">Quản Lý Tất Cả Đơn Đặt Bàn</h1>

            <Form.Group className="mb-3" style={{ maxWidth: '300px' }}>
                <Form.Label className="fw-bold">Lọc theo trạng thái:</Form.Label>
                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    <option value="PENDING">Đang chờ</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="CANCELLED">Đã hủy</option>
                </Form.Select>
            </Form.Group>

            <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>#ID</th>
                        <th>Khách hàng</th>
                        <th>Thời gian đặt</th>
                        <th>Số khách</th>
                        <th>Trạng thái</th>
                        <th>Bàn đã xếp</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length > 0 ? filteredBookings.map(b => (
                        <tr key={b.id}>
                            <td>{b.id}</td>
                            <td>{b.user ? `${b.user.last_name} ${b.user.first_name}` : 'N/A'}</td>
                            <td>{moment(b.booking_time).format('HH:mm [ngày] DD/MM/YYYY')}</td>
                            <td>{b.number_of_guests}</td>
                            <td><StatusBadge status={b.status} /></td>
                            <td>
                                {b.details && b.details.length > 0 
                                    ? b.details.map(d => `Bàn ${d.table.table_number}`).join(', ')
                                    : 'Chưa xếp'}
                            </td>
                            <td>
                                {b.status === 'PENDING' && (
                                    <Button as={Link} to={`/dashboard/assign-table/${b.id}`} variant="dark" size="sm">
                                        Gán bàn
                                    </Button>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="7" className="text-center">Không có đơn đặt bàn nào.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default AllBookings;