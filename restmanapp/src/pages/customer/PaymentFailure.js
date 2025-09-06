import React from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PaymentFailure = () => {
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: '500px' }}>
                <Card.Body className="p-5">
                    <div className="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-x-circle-fill text-danger" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                        </svg>
                    </div>
                    <Card.Title as="h2" className="text-danger mb-3">Thanh toán Thất bại!</Card.Title>
                    <Card.Text>
                        Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.
                    </Card.Text>
                    <div className="d-grid gap-2 mt-4">
                        <Button as={Link} to="/cart" variant="danger">Thử lại thanh toán</Button>
                        <Button as={Link} to="/" variant="outline-secondary">Quay về trang chủ</Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PaymentFailure;
