import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert, Button, Table } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { authApi, endpoints } from '../../configs/Apis';
import moment from 'moment';
import { CSVLink } from 'react-csv';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Statistics = () => {
    const [revenueStats, setRevenueStats] = useState(null);
    const [dishStats, setDishStats] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [topRated, setTopRated] = useState([]);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                const [revenueRes, dishRes, topRatedRes] = await Promise.all([
                    authApi().get(`${endpoints['stats-revenue']}?year=${year}`),
                    authApi().get(endpoints['stats-dishes']),
                    authApi().get(`${endpoints['stats-reviews']}`)
                ]);
                setRevenueStats(revenueRes.data);
                setDishStats(dishRes.data);
                setTopRated(topRatedRes.data);
            } catch (err) {
                console.error("Lỗi khi tải thống kê:", err);
                setError("Không thể tải dữ liệu thống kê.");
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [year]);

    const revenueChartData = {
        labels: revenueStats?.map(s => moment(s.month).format('MM/YYYY')) || [],
        datasets: [{
            label: `Doanh thu năm ${year} (VNĐ)`,
            data: revenueStats?.map(s => s.total) || [],
            backgroundColor: 'rgba(26, 115, 232, 0.7)',
        }],
    };

    const dishChartData = {
        labels: dishStats?.map(d => d.name) || [],
        datasets: [{
            label: 'Số lượt gọi',
            data: dishStats?.map(d => d.order_count) || [],
            backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 205, 86, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(102, 255, 178, 0.7)',
                'rgba(255, 102, 204, 0.7)',
                'rgba(102, 178, 255, 0.7)',
                'rgba(255, 255, 102, 0.7)'
            ],
        }],
    };

    const revenueCsvData = revenueStats?.map(s => ({
        month: moment(s.month).format('MM/YYYY'),
        total: s.total
    })) || [];
    const revenueCsvHeaders = [
        { label: "Tháng", key: "month" },
        { label: "Doanh thu (VNĐ)", key: "total" }
    ];

    const dishCsvData = dishStats || [];
    const dishCsvHeaders = [
        { label: "Tên món ăn", key: "name" },
        { label: "Số lượt gọi", key: "order_count" }
    ];
    const topRatedChartData = {
        labels: topRated.map(d => d.name),
        datasets: [{
            label: 'Điểm trung bình',
            data: topRated.map(d => parseFloat(d.avg_rating).toFixed(1)),
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
        }],
    };
   
    const topRatedCsvData = topRated.map((d, index) => ({
        "#": index + 1,
        "Tên món": d.name,
        "Số lượt đánh giá": d.review_count,
        "Điểm trung bình": parseFloat(d.avg_rating).toFixed(1)
    }));

    const topRatedCsvHeaders = [
        { label: "#", key: "#" },
        { label: "Tên món", key: "Tên món" },
        { label: "Số lượt đánh giá", key: "Số lượt đánh giá" },
        { label: "Điểm trung bình", key: "Điểm trung bình" }
    ];


    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 10; i--) {
            years.push(<option key={i} value={i}>{i}</option>);
        }
        return years;
    };

    if (loading) {
        return <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-4">{error}</Alert>;
    }

    return (
        <Container fluid className="my-4" style={{ backgroundColor: '#e7f0fd', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h1 className="text-center mb-4" style={{ color: '#1a73e8', fontWeight: '700' }}>Thống kê & Báo cáo</h1>

            <Form.Group className="mb-4" style={{ maxWidth: '200px' }}>
                <Form.Label className="fw-bold">Chọn năm:</Form.Label>
                <Form.Select value={year} onChange={(e) => setYear(e.target.value)}>
                    {generateYearOptions()}
                </Form.Select>
            </Form.Group>

            <Row className="g-4">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1a73e8', color: '#fff', borderRadius: '8px 8px 0 0' }}>
                            Biểu đồ doanh thu hàng tháng
                            <CSVLink
                                data={revenueCsvData}
                                headers={revenueCsvHeaders}
                                filename={`BaoCaoDoanhThu_${year}.csv`}
                                className="btn btn-light btn-sm"
                            >
                                Xuất CSV
                            </CSVLink>
                        </Card.Header>
                        <Card.Body>
                            <Bar data={revenueChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1a73e8', color: '#fff', borderRadius: '8px 8px 0 0' }}>
                            Món ăn được gọi nhiều nhất
                            <CSVLink
                                data={dishCsvData}
                                headers={dishCsvHeaders}
                                filename={`BaoCaoMonAn.csv`}
                                className="btn btn-light btn-sm"
                            >
                                Xuất CSV
                            </CSVLink>
                        </Card.Header>
                        <Card.Body>
                            <Pie data={dishChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={12} className="mt-4">
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1a73e8', color: '#fff', borderRadius: '8px 8px 0 0' }}>
                            Top 10 món ăn được đánh giá cao nhất
                            <CSVLink
                                data={topRatedCsvData}
                                headers={topRatedCsvHeaders}
                                filename={`BaoCaoDanhGia_${year}.csv`}
                                className="btn btn-light btn-sm"
                            >
                                Xuất CSV
                            </CSVLink>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ height: '250px' }}> 
                                <Bar
                                    data={topRatedChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { beginAtZero: true, max: 5 }
                                        },
                                        plugins: {
                                            legend: { position: 'top' }
                                        }
                                    }}
                                />
                            </div>
                            <hr />
                            <Table striped bordered hover responsive className="mt-3">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Tên món</th>
                                        <th>Số lượt đánh giá</th>
                                        <th>Điểm trung bình</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topRated.map((d, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{d.name}</td>
                                            <td>{d.review_count}</td>
                                            <td>{parseFloat(d.avg_rating).toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Statistics;
