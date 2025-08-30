import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import CustomerHeader from "../../pages/customer/CustomerHeader";
import Footer from "./common/Footer";

const CustomerLayout = () => {
  return (
    <>
      <CustomerHeader />
      <Container className="my-4">
        <Outlet />
      </Container>
      <Footer />
    </>
  );
};

export default CustomerLayout;
