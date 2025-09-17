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
        <Container 
            className="my-5 p-4 rounded shadow" 
            style={{ maxWidth: '550px', backgroundColor: '#fffbea' }}
        >
            <h1 className="text-center mb-4" style={{ color: '#8B0000' }}>
                ĐẶT LẠI MẬT KHẨU MỚI
            </h1>
            
            {message.content && (
                <Alert 
                    style={{ 
                        backgroundColor: message.type === 'success' ? '#FFD700' : '#8B0000',
                        color: message.type === 'success' ? '#8B0000' : '#FFD700',
                        border: 'none',
                        fontWeight: '500'
                    }}
                >
                    {message.content}
                </Alert>
            )}

            {!message.content.includes('thành công') && (
                 <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#8B0000' }}>Mật khẩu mới</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={{ borderColor: '#8B0000' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#8B0000' }}>Xác nhận mật khẩu mới</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
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
                            fontWeight: 'bold',
                        }}
                    >
                        {loading ? <Spinner size="sm" animation="border" style={{ color: '#FFD700' }} /> : "Xác nhận"}
                    </Button>
                </Form>
            )}
        </Container>
    );
};

export default ResetPassword;
