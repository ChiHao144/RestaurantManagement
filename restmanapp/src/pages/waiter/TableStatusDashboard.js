import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Dropdown } from 'react-bootstrap';
import { authApi, endpoints } from '../../configs/Apis';
import { UserContext } from '../../configs/UserContext';

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

    useEffect(() => {
        if (user && ['WAITER', 'MANAGER', 'ADMIN'].includes(user.role)) {
            loadTables();
        } else {
            setError("Bạn không có quyền truy cập trang này.");
            setLoading(false);
        }
    }, [user]);

    const handleStatusChange = async (tableId, newStatus) => {
        try {
            setTables(currentTables => 
                currentTables.map(t => t.id === tableId ? { ...t, status: newStatus } : t)
            );

            await authApi().patch(endpoints['update-table-status'](tableId), {
                status: newStatus
            });
        } catch (err) {
            console.error(`Lỗi khi cập nhật bàn ${tableId}:`, err);
            alert("Cập nhật thất bại. Dữ liệu sẽ được hoàn tác.");
            loadTables();
        }
    };

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <Container className="my-4" style={{ backgroundColor: '#e7f0fd', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h1 className="text-center mb-4" style={{ color: '#1a73e8', fontWeight: '700', letterSpacing: '1px' }}>QUẢN LÝ TRẠNG THÁI BÀN ĂN</h1>
            <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                {tables.map(table => {
                    const statusProps = getStatusProps(table.status);
                    const statusColor = statusProps.variant === 'success' ? '#28a745'
                        : statusProps.variant === 'danger' ? '#dc3545'
                        : statusProps.variant === 'warning' ? '#ffc107'
                        : '#6c757d';
                    return (
                        <Col key={table.id}>
                            <Card className="shadow-sm h-100" style={{ borderRadius: '12px', border: `2px solid ${statusColor}`, transition: 'transform 0.2s' }}>
                                <Card.Header as="h5" className="text-white text-center" style={{ backgroundColor: '#1a73e8', borderRadius: '12px 12px 0 0' }}>
                                    Bàn {table.table_number}
                                </Card.Header>
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <div className="text-center mb-3">
                                        <Card.Text>Sức chứa: {table.capacity} người</Card.Text>
                                        <p>Trạng thái: <Badge bg={statusProps.variant}>{statusProps.text}</Badge></p>
                                    </div>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="primary" id={`dropdown-table-${table.id}`} size="sm" className="w-100">
                                            Đổi trạng thái
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="w-100">
                                            <Dropdown.Item onClick={() => handleStatusChange(table.id, 'AVAILABLE')} disabled={table.status === 'AVAILABLE'}>
                                                Trống
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleStatusChange(table.id, 'OCCUPIED')} disabled={table.status === 'OCCUPIED'}>
                                                Đang phục vụ
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleStatusChange(table.id, 'CLEANING')} disabled={table.status === 'CLEANING'}>
                                                Cần dọn dẹp
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
