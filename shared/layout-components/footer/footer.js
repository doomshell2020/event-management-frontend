import React from 'react';
import { Col } from 'react-bootstrap';
import Link from "next/link";

export default function Footer() {
  return (
    <div className="main-footer">
      <Col md={12} sm={12} className=" text-center">
        <div className="container-fluid pt-0 ht-100p">
          Copyright © 2025{" "}
          <Link href="#!" className="text-primary">
            eboxtickets.com
          </Link>
          <Link href="#!">  </Link> All rights reserved
        </div>
      </Col>
    </div>
  );
}




