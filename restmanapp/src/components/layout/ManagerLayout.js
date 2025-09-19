import React from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import ManagerHeader from "../../pages/manager/ManagerHeader";
import FooterManager from "./common/FooterManager";

const ManagerLayout = () => {
  return (
    <>
      <ManagerHeader />
      <Container className="my-4">
        <Outlet />
      </Container>
      <FooterManager />
    </>
  );
};

export default ManagerLayout;
