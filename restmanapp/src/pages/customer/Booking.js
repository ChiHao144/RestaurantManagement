import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { UserContext } from '../../configs/UserContext';
import { authApi, endpoints } from '../../configs/Apis';

const Booking = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState({
        bookingTime: '',
        numberOfGuests: 1,
        note: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const payload = {
                booking_time: bookingDetails.bookingTime,
                number_of_guests: bookingDetails.numberOfGuests,
                note: bookingDetails.note
            };
            await authApi().post(endpoints['bookings'], payload);
            setSubmitSuccess(true);
        } catch (err) {
            console.error("Lỗi khi đặt bàn:", err);
            setSubmitError("❌ Không thể gửi yêu cầu đặt bàn. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (submitSuccess) {
        return (
            <Container className="my-5 text-center">
                <Alert variant="success" className="shadow-sm rounded-4 p-4">
                    <h4 className="fw-bold text-success">🎉 Yêu cầu đặt bàn thành công!</h4>
                    <p>Yêu cầu của bạn đã được gửi đi và đang chờ xác nhận.  
                    Nhân viên của chúng tôi sẽ sớm liên hệ với bạn. Cảm ơn bạn!</p>
                    <Button
                        className="mt-3 fw-semibold"
                        style={{ border: "none", backgroundColor: "#8B0000" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FFD700"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B0000"}
                        onClick={() => navigate('/')}
                    >
                        Về trang chủ
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center my-5">
            <Card className="p-4 shadow-lg rounded-4" style={{ maxWidth: '600px', width: '100%' }}>
                <h2 className="text-center mb-4 fw-bold" style={{ color: "#8B0000" }}>
                    📅 ĐẶT BÀN TRƯỚC
                </h2>

                {submitError && <Alert variant="danger" className="fw-semibold">{submitError}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="bookingTime">
                        <Form.Label className="fw-semibold">Chọn ngày và giờ</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="bookingTime"
                            value={bookingDetails.bookingTime}
                            onChange={handleChange}
                            min={getMinDateTime()}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="numberOfGuests">
                        <Form.Label className="fw-semibold">Số lượng khách</Form.Label>
                        <Form.Control
                            type="number"
                            name="numberOfGuests"
                            value={bookingDetails.numberOfGuests}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="note">
                        <Form.Label className="fw-semibold">Ghi chú (tùy chọn)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="note"
                            placeholder="Ví dụ: Bàn gần cửa sổ, cần ghế cho trẻ em..."
                            value={bookingDetails.note}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="fw-semibold"
                            style={{ backgroundColor: "#8B0000", border: "none" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FFD700"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B0000"}
                        >
                            {submitting ? (
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    style={{ color: "#FFD700" }}
                                />
                            ) : (
                                "Gửi yêu cầu đặt bàn"
                            )}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default Booking;
