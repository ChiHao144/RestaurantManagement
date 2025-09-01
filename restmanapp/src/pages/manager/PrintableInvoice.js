import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import moment from 'moment';

const PrintableInvoice = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderData } = location.state || {}; // Lấy dữ liệu từ location.state

    // Tự động mở hộp thoại in khi component được tải
    useEffect(() => {
        if (orderData) {
            window.print();
        }
    }, [orderData]);

    if (!orderData) {
        return (
            <Container className="text-center my-5">
                <p>Không có dữ liệu hóa đơn để in.</p>
                <button onClick={() => navigate(-1)}>Quay lại</button>
            </Container>
        );
    }

    return (
        <Container className="my-4 invoice-container">
            <div className="text-center mb-4">
                <h2>NHÀ HÀNG ABC</h2>
                <p>123 Đường XYZ, Quận 1, TP. Hồ Chí Minh</p>
                <p>Hotline: 0123 456 789</p>
                <hr />
                <h3 className="my-3">HÓA ĐƠN THANH TOÁN</h3>
            </div>
            
            <div className="d-flex justify-content-between">
                <p><strong>Mã HĐ:</strong> #{orderData.id}</p>
                <p><strong>Ngày:</strong> {moment(orderData.created_date).format('HH:mm DD/MM/YYYY')}</p>
            </div>
            <p><strong>Khách hàng/Bàn:</strong> {orderData.user ? `${orderData.user.last_name} ${orderData.user.first_name}` : (orderData.table ? `Bàn ${orderData.table.table_number}` : 'Khách vãng lai')}</p>
            
            <Table striped className="mt-3">
                <thead>
                    <tr>
                        <th>Tên món</th>
                        <th className="text-center">SL</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {orderData.details.map(detail => (
                        <tr key={detail.id}>
                            <td>{detail.dish.name}</td>
                            <td className="text-center">{detail.quantity}</td>
                            <td className="text-end">{parseInt(detail.unit_price).toLocaleString('vi-VN')}</td>
                            <td className="text-end">{parseInt(detail.quantity * detail.unit_price).toLocaleString('vi-VN')}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="fw-bold">
                        <td colSpan="3" className="text-end">TỔNG CỘNG</td>
                        <td className="text-end fs-5">{parseInt(orderData.total_amount).toLocaleString('vi-VN')} VNĐ</td>
                    </tr>
                </tfoot>
            </Table>

            <div className="text-center mt-5">
                <p>Cảm ơn quý khách và hẹn gặp lại!</p>
            </div>
        </Container>
    );
};

export default PrintableInvoice;