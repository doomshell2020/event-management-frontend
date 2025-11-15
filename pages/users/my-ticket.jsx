import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";



const Cart = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            <FrontendFooter />
        </>
    );
};

export default Cart;