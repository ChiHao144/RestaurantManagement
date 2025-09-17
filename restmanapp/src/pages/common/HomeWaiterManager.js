import React, { useContext } from 'react';
import { Container, Card } from 'react-bootstrap';
import { UserContext } from '../../configs/UserContext';

const DashboardHome = () => {
    const { user } = useContext(UserContext);

    return (
        <Container fluid className="my-5">
            <Card className="p-5 shadow-lg border-0 text-center">
                <Card.Body>
                    <Card.Title as="h1" className="text-primary fw-bold mb-4">
                        Chào mừng trở lại, {user ? user.first_name : 'Quản trị viên'}!
                    </Card.Title>
                    <Card.Text className="text-muted fs-5">
                        Đây là <span className="fw-semibold">trang quản trị</span> của nhà hàng
                        <span className="text-primary fw-bold"> SpicyTown</span>.
                        Hãy sử dụng thanh điều hướng bên trên để bắt đầu công việc của bạn.
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DashboardHome;
