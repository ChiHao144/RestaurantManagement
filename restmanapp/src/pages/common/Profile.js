import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Image, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { UserContext } from '../../configs/UserContext';
import { authApi, endpoints } from '../../configs/Apis';
import { Navigate } from 'react-router-dom';

const Profile = () => {
    const { user, login } = useContext(UserContext);
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email || ''
            });
            setAvatarPreview(user.avatar);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            const data = new FormData();
            data.append('first_name', formData.first_name);
            data.append('last_name', formData.last_name);
            data.append('email', formData.email); 
            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            const res = await authApi().patch(endpoints['current-user'], data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            login(res.data);

            setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });

        } catch (err) {
            console.error("Lỗi khi cập nhật thông tin:", err);
            setMessage({ type: 'danger', content: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Navigate to="/" />;
    }

    return (
        <Container className="my-5">
            <h1 className="text-center text-success mb-4">THÔNG TIN CÁ NHÂN</h1>
            <Row className="justify-content-center">
                <Col md={8}>
                    <div className="text-center mb-4">
                        <Image src={avatarPreview} alt="Avatar" roundedCircle width="150" height="150" className="shadow"/>
                    </div>

                    {message.content && <Alert variant={message.type}>{message.content}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Tên đăng nhập</Form.Label>
                            <Col sm="9">
                                <Form.Control type="text" value={user.username} readOnly plaintext />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Tên</Form.Label>
                            <Col sm="9">
                                <Form.Control 
                                    type="text" 
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Họ và tên lót</Form.Label>
                            <Col sm="9">
                                <Form.Control 
                                    type="text" 
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Địa chỉ email</Form.Label>
                            <Col sm="9">
                                <Form.Control 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Thay đổi ảnh đại diện</Form.Label>
                            <Col sm="9">
                                <Form.Control 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </Col>
                        </Form.Group>

                        <div className="text-center">
                            <Button variant="success" type="submit" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Cập nhật thông tin"}
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;

