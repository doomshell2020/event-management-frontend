import React, { useState } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs";

export async function getServerSideProps(context) {
    try {
        const token = context.req.cookies?.userAuthToken || null;
        // console.log('token :', token);

        if (!token) {
            return {
                redirect: {
                    destination: "/login",
                    permanent: false,
                },
            };
        }

        // 🔥 Call your backend API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/committee/requests?status=pending`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await res.json();

        return {
            props: {
                pendingRequests: data.requests || [],
                counts: {
                    pending: data.counts?.pending || 0,
                    approved: data.counts?.approved || 0,
                    ignored: data.counts?.ignored || 0,
                    completed: data.counts?.completed || 0,
                },
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


const CommitteePending = ({ pendingRequests, counts }) => {
    const [activeTab, setMyActiveTab] = useState("pending");
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
                        {/* TABS */}
                        <TicketCountTabs
                            active={activeTab}
                            onChange={setActiveTab}
                            counts={counts}
                        />

                        {/* TABLE */}
                        <div className="table-responsive mt-4">
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
                                                <td>{index + 1}</td>

                                                <td>
                                                    <img
                                                        src={item.image || "/assets/front-images/no-image.png"}
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

                                                <td>
                                                    <div style={{ fontWeight: "600" }}>{item.userName}</div>
                                                    <div style={{ fontSize: "13px", color: "#6c757d" }}>
                                                        {item.eventName}
                                                    </div>
                                                </td>

                                                <td>
                                                    <div>{item.price}</div>
                                                    <button className="btn btn-success btn-sm mt-1">
                                                        ✉
                                                    </button>
                                                </td>

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

export default CommitteePending;
