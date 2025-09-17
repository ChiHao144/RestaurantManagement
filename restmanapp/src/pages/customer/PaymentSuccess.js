import React from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: '500px' }}>
                <Card.Body className="p-5">
                    <div className="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-check-circle-fill text-success" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                    </div>
                    <Card.Title as="h2" className="text-success mb-3">Thanh toán Thành công!</Card.Title>
                    <Card.Text>
                        Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của nhà hàng chúng tôi. Hóa đơn của bạn đã được thanh toán.
                    </Card.Text>
                    <div className="d-grid gap-2 mt-4">
                        <Button as={Link} to="/order-history" variant="success">Xem lịch sử đơn hàng</Button>
                        <Button as={Link} to="/" variant="outline-secondary">Quay về trang chủ</Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PaymentSuccess;
