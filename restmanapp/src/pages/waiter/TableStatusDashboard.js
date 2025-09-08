import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Dropdown } from 'react-bootstrap';
import { authApi, endpoints } from '../../configs/Apis';
import { UserContext } from '../../configs/UserContext';

// Hàm hỗ trợ để lấy màu sắc và văn bản cho từng trạng thái
const getStatusProps = (status) => {
    switch (status) {
        case 'AVAILABLE':
            return { variant: 'success', text: 'Trống' };
        case 'OCCUPIED':
            return { variant: 'danger', text: 'Đang phục vụ' };
        case 'CLEANING':
            return { variant: 'warning', text: 'Cần dọn dẹp' };
        default:
            return { variant: 'secondary', text: 'Không xác định' };
    }
};

const TableStatusDashboard = () => {
    const { user } = useContext(UserContext);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm tải danh sách bàn và trạng thái từ API
    const loadTables = async () => {
        try {
            setLoading(true);
            const res = await authApi().get(endpoints['table-statuses']);
            setTables(res.data);
        } catch (err) {
            console.error("Lỗi khi tải trạng thái bàn:", err);
            setError("Không thể tải dữ liệu bàn. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component được mount
    useEffect(() => {
        if (user && ['WAITER', 'MANAGER', 'ADMIN'].includes(user.role)) {
            loadTables();
        } else {
            setError("Bạn không có quyền truy cập trang này.");
            setLoading(false);
        }
    }, [user]);

    // Hàm xử lý khi nhân viên thay đổi trạng thái bàn
    const handleStatusChange = async (tableId, newStatus) => {
        try {
            // Cập nhật giao diện ngay lập tức để người dùng thấy thay đổi
            setTables(currentTables => 
                currentTables.map(t => t.id === tableId ? { ...t, status: newStatus } : t)
            );

            // Gửi yêu cầu cập nhật lên server
            await authApi().patch(endpoints['update-table-status'](tableId), {
                status: newStatus
            });
        } catch (err) {
            console.error(`Lỗi khi cập nhật bàn ${tableId}:`, err);
            alert("Cập nhật thất bại. Dữ liệu sẽ được hoàn tác.");
            // Tải lại dữ liệu từ server nếu có lỗi để đảm bảo tính nhất quán
            loadTables();
        }
    };

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <Container className="my-4">
            <h1 className="text-center text-success mb-4">Quản Lý Trạng Thái Bàn</h1>
            <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                {tables.map(table => {
                    const statusProps = getStatusProps(table.status);
                    return (
                        <Col key={table.id}>
                            <Card className={`shadow-sm h-100 border-${statusProps.variant}`}>
                                <Card.Header as="h5" className={`bg-${statusProps.variant} text-white text-center`}>
                                    Bàn {table.table_number}
                                </Card.Header>
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <div className="text-center">
                                        <Card.Text>Sức chứa: {table.capacity} người</Card.Text>
                                        <p>Trạng thái: <Badge bg={statusProps.variant}>{statusProps.text}</Badge></p>
                                    </div>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="outline-dark" id={`dropdown-table-${table.id}`} size="sm" className="w-100">
                                            Đổi trạng thái
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="w-100">
                                            <Dropdown.Item onClick={() => handleStatusChange(table.id, 'AVAILABLE')} disabled={table.status === 'AVAILABLE'}>
                                                ✅ Trống
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleStatusChange(table.id, 'OCCUPIED')} disabled={table.status === 'OCCUPIED'}>
                                                🔴 Đang phục vụ
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleStatusChange(table.id, 'CLEANING')} disabled={table.status === 'CLEANING'}>
                                                🟡 Cần dọn dẹp
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </Container>
    );
};

export default TableStatusDashboard;