import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import CustomerHeader from "../../pages/customer/CustomerHeader";
import Footer from "./common/Footer";
import ChatbotWidget from "../../pages/customer/ChatBox";

const CustomerLayout = () => {
  return (
    <>
      <CustomerHeader />
      <Container className="my-4">
        <Outlet />
      </Container>
      <Footer />
      <ChatbotWidget />
    </>
  );
};

export default CustomerLayout;
