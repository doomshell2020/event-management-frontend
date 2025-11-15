import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";

const UpdateProfile = () => {
    return (
        <>
            <FrontendHeader />
            <section id="profile" style={{
                margin: "35px 0px 50px",
            }} >
                <div className="container" style={
                    {
                        "max-width": "100%",
                        "margin": "0 auto",
                        "padding": "0 20px",
                    }
                }>
                    <div className="heading">
                        <h1>Profile</h1>
                        <h2>Edit Profile</h2>
                        <p className="mb-4">Your profile information is displayed below.</p>
                    </div>
                </div>
            </section>
            <FrontendFooter />

        </>
    )
}

export default UpdateProfile