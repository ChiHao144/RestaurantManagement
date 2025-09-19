import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Table, Spinner, Alert, Badge, Button, Form } from 'react-bootstrap';
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
        case 'CONFIRMED':
            variant = 'primary';
            text = 'Đã xác nhận';
            break;
        case 'COMPLETED': 
            variant = 'success';
            text = 'Đã hoàn thành';
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
    const [filterStatus, setFilterStatus] = useState('ALL');

    const loadBookings = useCallback(async () => {
        if (!user) return;
        try {
            const res = await authApi().get(endpoints['bookings']);
            setBookings(res.data.results || res.data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách đặt bàn:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        moment.locale('vi');
        loadBookings();
    }, [loadBookings]);

    const handleCompleteBooking = async (bookingId) => {
        if (window.confirm(`Bạn có chắc chắn muốn đánh dấu đơn đặt bàn #${bookingId} là đã hoàn thành không?`)) {
            try {
                const res = await authApi().patch(endpoints['complete-booking'](bookingId));
                setBookings(currentBookings =>
                    currentBookings.map(b => (b.id === bookingId ? res.data : b))
                );
            } catch (err) {
                console.error(`Lỗi khi hoàn thành đơn #${bookingId}:`, err);
                alert("Thao tác thất bại. Vui lòng thử lại.");
            }
        }
    };

    const filteredBookings = bookings.filter(b => filterStatus === 'ALL' || b.status === filterStatus);

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>;
    }
    
    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Container className="my-4" style={{ backgroundColor: '#e7f0fd', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h1 className="text-center mb-4" style={{ color: '#1a73e8', fontWeight: '700', letterSpacing: '1px' }}>Quản Lý Tất Cả Đơn Đặt Bàn</h1>
            
            <Form.Group className="mb-3" style={{ maxWidth: '300px' }}>
                <Form.Label className="fw-bold" style={{ color: '#1a73e8' }}>Lọc theo trạng thái:</Form.Label>
                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    <option value="PENDING">Đang chờ</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                </Form.Select>
            </Form.Group>

            <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <thead className="table-primary" style={{ backgroundColor: '#1a73e8', color: '#fff' }}>
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
                                <div className="d-flex flex-column flex-sm-row gap-2">
                                    {b.status === 'PENDING' && (
                                        <Button as={Link} to={`/manager/assign/${b.id}`} style={{ backgroundColor: '#1a73e8', border: 'none' }} size="sm">
                                            Gán bàn
                                        </Button>
                                    )}
                                    {b.status === 'CONFIRMED' && (
                                        <Button variant="success" size="sm" onClick={() => handleCompleteBooking(b.id)}>
                                            Hoàn thành
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="7" className="text-center" style={{ color: '#1a73e8' }}>Không có đơn đặt bàn nào.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default AllBookings;
