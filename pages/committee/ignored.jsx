import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs"

export async function getServerSideProps(context) {
    try {
        const token = context.req.cookies?.userAuthToken || null;

        if (!token) {
            return {
                redirect: {
                    destination: "/login",
                    permanent: false,
                },
            };
        }

        // 🔥 Call your backend API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/committee/requests/I`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await res.json();
        const apiData = data?.data?.list || [];

        // calculate counts
        const counts = {
            pending: 0,
            approved: 0,
            ignored: 0,
        };

        apiData.forEach(item => {
            if (item.status == 'N') counts.pending++;
            if (item.status == 'Y') counts.approved++;
            if (item.status == 'I') counts.ignored++;
        });

        console.log('counts :', counts);
        return {
            props: {
                pendingRequests: apiData,
                counts,
            },
        };

    } catch (error) {
        console.error("SSR Error:", error);

        return {
            props: {
                pendingRequests: [],
                counts: {
                    pending: 0,
                    approved: 0,
                    ignored: 0,
                    completed: 0,
                },
            },
        };
    }
}

const CommitteeIgnored = ({ pendingRequests, counts }) => {
    const [activeTab, setMyActiveTab] = useState("ignored");

    const router = useRouter();

    const setActiveTab = (tab) => {
        setMyActiveTab(tab);
        router.push(`/committee/${tab}`);
    };

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
                            counts={counts}
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
                                    {pendingRequests.filter(item => item.status == "I").length > 0 ? (
                                        pendingRequests
                                            .filter(item => item.status == "I")
                                            .map((item, index) => {
                                                const user = item.user || {};
                                                const ticket = item.TicketType || {};

                                                return (
                                                    <tr key={item.id}>
                                                        <td>{index + 1}</td>

                                                        {/* USER IMAGE */}
                                                        <td>
                                                            <img
                                                                src={
                                                                    user.profile_image
                                                                        ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${user.profile_image}`
                                                                        : "/assets/front-images/no-image.png"
                                                                }
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

                                                        {/* USER DETAILS */}
                                                        <td>
                                                            <div style={{ fontWeight: "600" }}>
                                                                {user.first_name} {user.last_name}
                                                            </div>
                                                            <div style={{ fontSize: "13px", color: "#6c757d" }}>
                                                                {user.email}
                                                            </div>
                                                        </td>

                                                        {/* TICKET DETAILS */}
                                                        <td>
                                                            <div>{ticket.title}</div>
                                                            <div style={{ fontSize: "13px", color: "#6c757d" }}>
                                                                ₹{ticket.price} × {item.no_tickets}
                                                            </div>
                                                        </td>

                                                        {/* ACTIONS */}
                                                        <td>

                                                            <button className="btn btn-danger btn-sm">
                                                                Ignore
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
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

export default CommitteeIgnored;