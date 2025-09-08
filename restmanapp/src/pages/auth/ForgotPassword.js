import React, { useState } from 'react';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import Apis, { endpoints } from '../../configs/Apis';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await Apis.post(endpoints['request-password-reset'], { email });
            setMessage(res.data.message);
        } catch (err) {
            setMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5" style={{ maxWidth: '500px' }}>
            <h1 className="text-center text-success mb-4">QUÊN MẬT KHẨU</h1>
            {message ? (
                <Alert variant="info">{message}</Alert>
            ) : (
                <Form onSubmit={handleSubmit}>
                    <p>Vui lòng nhập email của bạn. Chúng tôi sẽ gửi một đường link để bạn có thể đặt lại mật khẩu.</p>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập địa chỉ email của bạn"
                            required 
                        />
                    </Form.Group>
                    <Button variant="success" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : "Gửi yêu cầu"}
                    </Button>
                </Form>
            )}
        </Container>
    );
};

export default ForgotPassword;
