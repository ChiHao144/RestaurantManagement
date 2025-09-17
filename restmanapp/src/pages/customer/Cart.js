import React, { useContext, useEffect, useState } from 'react';
import { Container, Button, Alert, Form, Col, Card, Row, Image, InputGroup, FormControl } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Apis, { authApi, endpoints } from '../../configs/Apis';
import { UserContext } from '../../configs/UserContext';
import { CartContext } from '../../configs/CartContext';
import { TableContext } from '../../configs/TableContext'; 

const Cart = () => {
  const { cart, updateQuantity, clearCart } = useContext(CartContext);
  const { user } = useContext(UserContext);
  const { tableId, setCurrentTable } = useContext(TableContext); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [searchParams] = useSearchParams();

  
  useEffect(() => {
    const tableIdFromUrl = searchParams.get('table');
    if (tableIdFromUrl) {
      setCurrentTable(tableIdFromUrl);
    }
  }, [searchParams, setCurrentTable]);


  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const cartData = cart.map((item) => ({
        dish_id: item.id,
        quantity: item.quantity,
      }));

    
      if (tableId) {
        await Apis.post(endpoints['place-order-at-table'], {
          table_id: tableId,
          cart: cartData,
        });
        alert(`Gọi món thành công cho Bàn ${tableId}!`);
        clearCart();
        setCurrentTable(null);
        navigate('/');
      } else {
        const orderData = {
          payment_method: paymentMethod,
          cart: cartData,
        };
        const res = await authApi().post(endpoints['orders'], orderData);
        const newOrder = res.data;

        if (paymentMethod === 'MOMO') {
          const paymentRes = await authApi().post(
            endpoints['initiate-payment'](newOrder.id)
          );
          window.location.href = paymentRes.data.payUrl;
        }
        else if (paymentMethod === 'VNPAY') {
          const paymentRes = await authApi().post(endpoints['initiate-vnpay-payment'](newOrder.id));
          window.location.href = paymentRes.data.paymentUrl;
        }
        else {
          alert('Đặt hàng thành công! Cảm ơn bạn.');
          clearCart();
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Lỗi khi xử lý đơn hàng:', err);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="info">
          <h4>Giỏ hàng của bạn đang trống</h4>
          <p>Hãy khám phá thực đơn và chọn cho mình những món ăn ngon nhất nhé!</p>
          <Link to="/menu">
            <Button variant="info">Quay lại thực đơn</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  const renderOrderButton = () => {
    if (tableId) {
      return (
        <div className="d-grid">
          <Button
            variant="danger"
            size="lg"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : `Gọi món cho Bàn ${tableId}`}
          </Button>
        </div>
      );
    }

    if (user) {
      return (
        <div className="d-grid">
          <Button
            variant="danger"
            size="lg"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Tiến hành đặt hàng'}
          </Button>
        </div>
      );
    }

    return (
      <Alert variant="warning">
        Vui lòng <Link to="/login?next=/cart">đăng nhập</Link> để tiến hành đặt hàng.
      </Alert>
    );
  };

  return (
    <Container className="my-5">
      <h1 className="text-center text-danger mb-4 fw-bold">
        {tableId ? `GỌI MÓN TẠI BÀN ${tableId}` : 'GIỎ HÀNG CỦA BẠN'}
      </h1>

      <Row>
        <Col md={8}>
          {cart.map((item, index) => (
            <Card key={item.id} className="mb-3 shadow-sm border-0">
              <Row className="g-0 align-items-center">
                <Col md={3} className="text-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fluid
                    rounded
                    style={{ maxHeight: '120px', objectFit: 'cover' }}
                  />
                </Col>
                <Col md={9}>
                  <Card.Body>
                    <Card.Title className="fw-bold">{item.name}</Card.Title>
                    <Card.Text>
                      Giá: {parseInt(item.price).toLocaleString('vi-VN')} VNĐ
                    </Card.Text>
                    <InputGroup style={{ width: '150px' }}>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <FormControl
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                        className="text-center"
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </InputGroup>
                    <p className="mt-2 fw-bold text-danger">
                      Thành tiền:{' '}
                      {parseInt(item.quantity * item.price).toLocaleString(
                        'vi-VN'
                      )}{' '}
                      VNĐ
                    </p>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          ))}
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow-sm border-0">
            <h4 className="fw-bold text-danger">Tóm tắt đơn hàng</h4>
            <p>
              Tổng cộng:{' '}
              <span className="fw-bold text-danger">
                {calculateTotal().toLocaleString('vi-VN')} VNĐ
              </span>
            </p>

            {!tableId && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  Chọn phương thức thanh toán
                </Form.Label>
                <Form.Check
                  type="radio"
                  label="Thanh toán khi nhận hàng (COD)"
                  name="paymentMethod"
                  id="paymentCash"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="Thanh toán bằng Ví MoMo"
                  name="paymentMethod"
                  id="paymentMomo"
                  value="MOMO"
                  checked={paymentMethod === 'MOMO'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="Thanh toán bằng VNPay"
                  name="paymentMethod"
                  value="VNPAY"
                  checked={paymentMethod === 'VNPAY'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </Form.Group>
            )}

            {renderOrderButton()}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
