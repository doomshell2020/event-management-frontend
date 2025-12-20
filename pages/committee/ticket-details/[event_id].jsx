import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";

const TicketDetails = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");


  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />
      <section id="profile" className="mt-5 mb-5">
        <div className="container">
          <div className="section-heading">
            <h1>Committee</h1>
            <h2 className="mt-4">Committee</h2>
            <p className="mb-4 body-text text-center">
              If you belong to any committees for events on eboxtickets, you can manage ticket requests here.
            </p>
          </div>

          <div className="profil_deaile mx-auto">
            <div className="row">

            </div>
          </div>
        </div>
      </section>
      <FrontendFooter />
    </>
  );
};

export default TicketDetails;
