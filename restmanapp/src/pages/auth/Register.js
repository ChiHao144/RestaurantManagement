import React, { useState } from 'react';
import { Container, Form, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Apis, { endpoints } from '../../configs/Apis';

const Register = () => {
    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const change = (evt, field) => {
        setUser(current => ({ ...current, [field]: evt.target.value }));
    };

    const handleAvatarChange = (evt) => {
        setAvatar(evt.target.files[0]);
    };

    const register = async (evt) => {
        evt.preventDefault();
        setError(null);

        if (user.password !== user.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("first_name", user.first_name);
            formData.append("last_name", user.last_name);
            formData.append("username", user.username);
            formData.append("password", user.password);
            if (avatar) formData.append("avatar", avatar);

            await Apis.post(endpoints['register'], formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate("/login");
        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                setError(Object.values(errorData).join(' ') || "Đã có lỗi xảy ra.");
            } else {
                setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5" style={{ maxWidth: '500px' }}>
            <Card className="shadow-lg p-4" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #ff4d4d, #ffd11a)' }}>
                <h2 className="text-center text-white mb-4" style={{ textShadow: '1px 1px 3px #000' }}>ĐĂNG KÝ TÀI KHOẢN</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={register}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Nhập tên" 
                            value={user.first_name}
                            onChange={(e) => change(e, "first_name")}
                            required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Họ và tên lót</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Nhập họ và tên lót" 
                            value={user.last_name}
                            onChange={(e) => change(e, "last_name")}
                            required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Tên đăng nhập</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Nhập tên đăng nhập" 
                            value={user.username}
                            onChange={(e) => change(e, "username")}
                            required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Địa chỉ email</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Nhập địa chỉ email" 
                            value={user.email}
                            onChange={(e) => change(e, "email")}
                            required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Nhập mật khẩu" 
                            value={user.password}
                            onChange={(e) => change(e, "password")}
                            required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Xác nhận mật khẩu</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Nhập lại mật khẩu" 
                            value={user.confirmPassword}
                            onChange={(e) => change(e, "confirmPassword")}
                            required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Ảnh đại diện</Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </Form.Group>

                    <Button 
                        variant="danger" 
                        type="submit" 
                        className="w-100 fw-bold" 
                        style={{ background: 'linear-gradient(90deg, #ff4d4d, #ffd11a)', border: 'none', color: '#000' }}
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : "Đăng Ký"}
                    </Button>
                </Form>

                <p className="text-center mt-3 text-white" style={{ textShadow: '1px 1px 2px #000' }}>
                    Đã có tài khoản? <a href="/login" style={{ color: '#000', fontWeight: 'bold' }}>Đăng nhập ngay</a>
                </p>
            </Card>
        </Container>
    );
};

export default Register;
