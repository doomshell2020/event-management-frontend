import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs"


const CommitteeCompleted = () => {
    const [activeTab, setMyActiveTab] = useState("completed");
    const router = useRouter()

    const setActiveTab = (tab) => {
        setMyActiveTab(tab);
        router.push(`/committee/${tab}`);
    }

    const pendingRequests = [
        {
            id: 1,
            userName: "lokesh saini",
            eventName: "Yuli Dejesus",
            price: "€0.00 EUR",
            image: "/assets/front-images/no-image.png",
        },
    ];

    return (
        <>
            <FrontendHeader backgroundImage="/assets/front-images/about-slider_bg.jpg" />

            <section className="mt-5 mb-5">
                <div className="container">
                    <div className="section-heading">
                        <h1>Committee</h1>
                        <h2 className="mt-4">Committee</h2>
                        <p className="mb-4 text-center">
                            Manage your committee ticket requests easily.
                        </p>
                    </div>

                    <div className="profil_deaile mx-auto">
                        <TicketCountTabs
                            active={activeTab}
                            onChange={setActiveTab}
                            counts={{
                                pending: 0,
                                approved: 0,
                                ignored: 0,
                                completed: 0,
                            }}
                        />

                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Ticket</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pendingRequests.length > 0 ? (
                                        pendingRequests.map((item, index) => (
                                            <tr key={item.id}>
                                                {/* SR NO */}
                                                <td>{index + 1}</td>

                                                {/* IMAGE */}
                                                <td>
                                                    <img
                                                        src={item.image}
                                                        alt="User"
                                                        style={{
                                                            width: "60px",
                                                            height: "60px",
                                                            objectFit: "cover",
                                                            borderRadius: "6px",
                                                            border: "1px solid #ddd",
                                                        }}
                                                    />
                                                </td>

                                                {/* NAME */}
                                                <td>
                                                    <div style={{ fontWeight: "600" }}>{item.userName}</div>
                                                    <div style={{ fontSize: "13px", color: "#6c757d" }}>
                                                        {item.eventName}
                                                    </div>
                                                </td>

                                                {/* TICKET */}
                                                <td>
                                                    <div>{item.price}</div>
                                                    <button
                                                        className="btn btn-success btn-sm mt-1"
                                                        title="Send Email"
                                                    >
                                                        ✉
                                                    </button>
                                                </td>

                                                {/* ACTION */}
                                                <td>
                                                    <button className="btn btn-primary btn-sm me-2">
                                                        Approve
                                                    </button>
                                                    <button className="btn btn-danger btn-sm">
                                                        Ignore
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4">
                                                No pending requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>

                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
};

export default CommitteeCompleted;