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
        <Container className="my-5 p-4 rounded shadow" style={{ maxWidth: '500px', backgroundColor: '#fffbea' }}>
            <h1 className="text-center mb-4" style={{ color: '#8B0000' }}>QUÊN MẬT KHẨU</h1>
            {message ? (
                <Alert style={{ backgroundColor: '#FFD700', color: '#8B0000', border: 'none' }}>
                    {message}
                </Alert>
            ) : (
                <Form onSubmit={handleSubmit}>
                    <p style={{ color: '#8B0000' }}>
                        Vui lòng nhập email của bạn. Chúng tôi sẽ gửi một đường link để bạn có thể đặt lại mật khẩu.
                    </p>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#8B0000' }}>Email</Form.Label>
                        <Form.Control 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập địa chỉ email của bạn"
                            required 
                            style={{ borderColor: '#8B0000' }}
                        />
                    </Form.Group>
                    <Button 
                        type="submit" 
                        className="d-block mx-auto"
                        disabled={loading}
                        style={{ 
                            backgroundColor: '#8B0000', 
                            borderColor: '#8B0000',
                            color: '#FFD700',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? <Spinner size="sm" animation="border" style={{ color: '#FFD700' }} /> : "Gửi yêu cầu"}
                    </Button>
                </Form>
            )}
        </Container>
    );
};

export default ForgotPassword;
