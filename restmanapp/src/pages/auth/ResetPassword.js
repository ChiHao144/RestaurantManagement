import React, { useState } from 'react';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Apis, { endpoints } from '../../configs/Apis';

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'danger', content: 'Mật khẩu xác nhận không khớp!' });
            return;
        }

        setLoading(true);
        try {
            await Apis.post(endpoints['confirm-password-reset'], {
                uid,
                token,
                password
            });
            setMessage({ type: 'success', content: 'Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMessage({ type: 'danger', content: err.response?.data?.error || 'Đã có lỗi xảy ra.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5" style={{ maxWidth: '500px' }}>
            <h1 className="text-center text-success mb-4">ĐẶT LẠI MẬT KHẨU MỚI</h1>
            
            {message.content && <Alert variant={message.type}>{message.content}</Alert>}

            {!message.content.includes('thành công') && (
                 <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu mới</Form.Label>
                        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                        <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </Form.Group>
                    <Button variant="success" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : "Xác nhận"}
                    </Button>
                </Form>
            )}
        </Container>
    );
};

export default ResetPassword;
