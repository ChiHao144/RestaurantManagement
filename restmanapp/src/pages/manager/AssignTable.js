import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Alert, Spinner, Row, Col, Form, ListGroup } from 'react-bootstrap';
import { UserContext } from '../../configs/UserContext';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { authApi, endpoints } from '../../configs/Apis';

moment.locale('vi');

const AssignTable = () => {
    const { user } = useContext(UserContext);
    const { bookingId } = useParams(); // Lấy ID của đơn đặt bàn từ URL
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [availableTables, setAvailableTables] = useState([]);
    const [selectedTables, setSelectedTables] = useState([]);
    const [staffNotes, setStaffNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Bước 1: Lấy thông tin chi tiết của đơn đặt bàn
                const bookingRes = await authApi().get(endpoints['booking-detail'](bookingId));
                const bookingData = bookingRes.data;
                setBooking(bookingData);

                // Bước 2: Dùng thông tin đó để tìm bàn trống
                // Giả sử mỗi lượt khách ngồi 2 tiếng
                const startTime = moment(bookingData.booking_time);
                const endTime = moment(bookingData.booking_time).add(2, 'hours');

                const params = {
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    guests: bookingData.number_of_guests
                };

                const tablesRes = await authApi().get(endpoints['available-tables'], { params });
                setAvailableTables(tablesRes.data);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu gán bàn:", err);
                setError("Không thể tải được thông tin. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [bookingId]);

    const handleTableSelect = (tableId) => {
        setSelectedTables(prev => {
            if (prev.includes(tableId)) {
                // Nếu bỏ chọn, xóa luôn ghi chú của bàn đó
                const newNotes = { ...staffNotes };
                delete newNotes[tableId];
                setStaffNotes(newNotes);
                return prev.filter(id => id !== tableId);
            } else {
                return [...prev, tableId];
            }
        });
    };

    // [MỚI] Hàm cập nhật ghi chú cho một bàn cụ thể
    const handleNoteChange = (tableId, note) => {
        setStaffNotes(prev => ({
            ...prev,
            [tableId]: note
        }));
    };


    const handleSubmit = async () => {
        if (selectedTables.length === 0) {
            alert("Vui lòng chọn ít nhất một bàn.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const startTime = moment(booking.booking_time);
            const endTime = moment(booking.booking_time).add(2, 'hours');

            // [MỚI] Thêm ghi chú vào payload gửi đi
            const detailsPayload = selectedTables.map(tableId => ({
                table_id: tableId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                note: staffNotes[tableId] || '' // Lấy ghi chú của bàn, nếu không có thì gửi chuỗi rỗng
            }));

            await authApi().post(endpoints['assign-details'](bookingId), {
                details: detailsPayload
            });

            

            alert("Gán bàn và xác nhận đơn thành công!");
            navigate("/manager"); // Chuyển về trang quản lý

        } catch (err) {
            console.error("Lỗi khi gán bàn:", err);
            setError("Đã xảy ra lỗi. Không thể gán bàn.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Container className="text-center my-5"><Spinner animation="border" /></Container>;
    }

    if (error) {
        return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!booking) {
        return <Container className="my-5"><Alert variant="warning">Không tìm thấy thông tin đặt bàn.</Alert></Container>;
    }

    return (
        <Container className="my-5">
            <h1 className="text-center text-dark mb-4">XÁC NHẬN VÀ GÁN BÀN</h1>
            <Row>
                {/* Cột thông tin đơn đặt bàn */}
                <Col md={5}>
                    <h2 className="h4 mb-3">Thông tin yêu cầu</h2>
                    <Card>
                        <Card.Header as="h5">Yêu cầu #{booking.id}</Card.Header>
                        <Card.Body>
                            <p><strong>Khách hàng:</strong> {booking.user.first_name} {booking.user.last_name}</p>
                            <p><strong>Thời gian:</strong> {moment(booking.booking_time).format('HH:mm [ngày] DD/MM/YYYY')}</p>
                            <p><strong>Số lượng khách:</strong> {booking.number_of_guests}</p>
                            <p><strong>Ghi chú:</strong> {booking.note || 'Không có'}</p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Cột chọn bàn */}
                <Col md={7}>
                    <h2 className="h4 mb-3">Chọn bàn trống phù hợp</h2>
                    {availableTables.length > 0 ? (
                        <Form>
                            <ListGroup>
                                {availableTables.map(table => (
                                    <ListGroup.Item key={table.id}>
                                        <Form.Check 
                                            type="checkbox"
                                            id={`table-${table.id}`}
                                            label={`Bàn ${table.table_number} (Sức chứa: ${table.capacity} người)`}
                                            checked={selectedTables.includes(table.id)}
                                            onChange={() => handleTableSelect(table.id)}
                                        />
                                        {/* [MỚI] Ô ghi chú chỉ hiện ra khi bàn được chọn */}
                                        {selectedTables.includes(table.id) && (
                                            <Form.Control
                                                as="textarea"
                                                rows={1}
                                                placeholder={`Thêm ghi chú cho bàn ${table.table_number}...`}
                                                className="mt-2"
                                                value={staffNotes[table.id] || ''}
                                                onChange={(e) => handleNoteChange(table.id, e.target.value)}
                                            />
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Form>
                    ) : (
                        <Alert variant="warning">Không tìm thấy bàn nào trống phù hợp với yêu cầu này.</Alert>
                    )}

                    <div className="d-grid mt-4">
                        <Button 
                            variant="dark" 
                            size="lg"
                            onClick={handleSubmit}
                            disabled={submitting || selectedTables.length === 0}
                        >
                            {submitting ? <Spinner size="sm" /> : 'Xác nhận và Gán bàn'}
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default AssignTable;
