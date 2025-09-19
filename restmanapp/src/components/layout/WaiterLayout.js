import React from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import WaiterHeader from "../../pages/waiter/WaiterHeader";
import FooterManager from "./common/FooterManager";


const WaiterLayout = () => {
  return (
    <>
      <WaiterHeader />
      <Container className="my-4">
        <Outlet />
      </Container>
      <FooterManager/>
    </>
  );
};

export default WaiterLayout;
