import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import Apis, { authApi, endpoints } from '../../configs/Apis';
import cookie from "react-cookies";
import { UserContext } from '../../configs/UserContext';

const Login = () => {
    const { user, login } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let res = await Apis.post(endpoints['login'], {
                username,
                password,
                "client_id": "iQnD8RzJ1ECAqR9IH4FoyDJW7p8T9R40n2IEQrHz",
                "client_secret": "VSmBl2VTdylEm6ts68nQkRPHtXgIGnNAJsQPIDempHG4EYpWhjbfq5HRIRWQRqt7njdc1rE2Gbtu5HBk7pc4zYpUmWZmKWYx9x4jb08Rb1jgVRP2XciMurzHN9qvHbe2",
                "grant_type": "password"
            });

            cookie.save("token", res.data.access_token);
            let userRes = await authApi().get(endpoints['current-user']);
            login(userRes.data);

        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        if (["WAITER", "MANAGER", "ADMIN"].includes(user.role)) {
            return <Navigate to="/manager" />;
        }
        return <Navigate to="/" />;
    }

    return (
        <Container className="d-flex justify-content-center align-items-center my-5">
            <Card className="p-4 shadow-lg" style={{
                maxWidth: '500px',
                width: '100%',
                borderRadius: '15px',
                background: 'linear-gradient(135deg, #ff4d4d, #ffd11a)'
            }}>
                <h2 className="text-center mb-4 fw-bold" style={{ textShadow: '1px 1px 3px #000', color: '#fff' }}>
                    ĐĂNG NHẬP
                </h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicUsername">
                        <Form.Label className="fw-bold">Tên đăng nhập</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label className="fw-bold">Mật khẩu</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="fw-bold"
                            style={{
                                background: 'linear-gradient(90deg, #ff4d4d, #ffd11a)',
                                border: 'none',
                                color: '#000'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : "Đăng nhập"}
                        </Button>
                    </div>
                </Form>

                <div className="text-end mt-2">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>

                <p className="text-center mt-3 fw-bold" style={{ color: '#fff', textShadow: '1px 1px 2px #000' }}>
                    Chưa có tài khoản? <a href="/register" style={{ color: '#000', fontWeight: 'bold' }}>Đăng ký ngay</a>
                </p>
            </Card>
        </Container>
    );
};

export default Login;
