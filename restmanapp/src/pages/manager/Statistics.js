import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap'; // [MỚI] Thêm Button
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { authApi, endpoints } from '../../configs/Apis';
import moment from 'moment';
import { CSVLink } from 'react-csv'; // [MỚI] Import thư viện xuất CSV

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Statistics = () => {
    const [revenueStats, setRevenueStats] = useState(null);
    const [dishStats, setDishStats] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                // Tải đồng thời cả hai loại thống kê
                const [revenueRes, dishRes] = await Promise.all([
                    authApi().get(`${endpoints['stats-revenue']}?year=${year}`),
                    authApi().get(endpoints['stats-dishes'])
                ]);
                setRevenueStats(revenueRes.data);
                setDishStats(dishRes.data);
            } catch (err) {
                console.error("Lỗi khi tải thống kê:", err);
                setError("Không thể tải dữ liệu thống kê.");
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [year]); // Tải lại khi năm thay đổi

    // Chuẩn bị dữ liệu cho biểu đồ doanh thu
    const revenueChartData = {
        labels: revenueStats?.map(s => moment(s.month).format('MM/YYYY')) || [],
        datasets: [{
            label: `Doanh thu năm ${year} (VNĐ)`,
            data: revenueStats?.map(s => s.total) || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    };

    // Chuẩn bị dữ liệu cho biểu đồ món ăn
    const dishChartData = {
        labels: dishStats?.map(d => d.name) || [],
        datasets: [{
            label: 'Lượt gọi',
            data: dishStats?.map(d => d.order_count) || [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
            ],
        }],
    };
    
    // [MỚI] Chuẩn bị dữ liệu để xuất file CSV cho Doanh thu
    const revenueCsvData = revenueStats?.map(s => ({
        month: moment(s.month).format('MM/YYYY'),
        total: s.total
    })) || [];
    const revenueCsvHeaders = [
        { label: "Tháng", key: "month" },
        { label: "Doanh thu (VNĐ)", key: "total" }
    ];

    // [MỚI] Chuẩn bị dữ liệu để xuất file CSV cho Món ăn
    const dishCsvData = dishStats || [];
    const dishCsvHeaders = [
        { label: "Tên món ăn", key: "name" },
        { label: "Số lượt gọi", key: "order_count" }
    ];
    
    // Tạo danh sách các năm để lựa chọn
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 10; i--) {
            years.push(<option key={i} value={i}>{i}</option>);
        }
        return years;
    };

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="success" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <Container fluid className="my-4">
            <h1 className="text-center text-success mb-4">Thống kê & Báo cáo</h1>
            
            <Form.Group className="mb-4" style={{ maxWidth: '200px' }}>
                <Form.Label className="fw-bold">Chọn năm xem báo cáo:</Form.Label>
                <Form.Select value={year} onChange={(e) => setYear(e.target.value)}>
                    {generateYearOptions()}
                </Form.Select>
            </Form.Group>

            <Row>
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                            Biểu đồ doanh thu hàng tháng
                            {/* [MỚI] Nút xuất báo cáo doanh thu */}
                            <CSVLink
                                data={revenueCsvData}
                                headers={revenueCsvHeaders}
                                filename={`BaoCaoDoanhThu_${year}.csv`}
                                className="btn btn-success btn-sm"
                            >
                                Xuất báo cáo
                            </CSVLink>
                        </Card.Header>
                        <Card.Body>
                            <Bar data={revenueChartData} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                            Món ăn được gọi nhiều nhất
                             {/* [MỚI] Nút xuất báo cáo món ăn */}
                            <CSVLink
                                data={dishCsvData}
                                headers={dishCsvHeaders}
                                filename={`BaoCaoMonAn.csv`}
                                className="btn btn-success btn-sm"
                            >
                                Xuất báo cáo
                            </CSVLink>
                        </Card.Header>
                        <Card.Body>
                            <Pie data={dishChartData} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Statistics;