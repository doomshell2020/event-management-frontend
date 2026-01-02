import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs";

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

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/committee/requests/C`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const json = await res.json();

        const list = Array.isArray(json?.data?.list) ? json.data.list : [];
        const completedData = Array.isArray(json?.data?.completedData)
            ? json.data.completedData
            : [];
        const assets = json?.data?.assets || {};

        const counts = {
            pending: 0,
            approved: 0,
            ignored: 0,
            completed: 0,
        };

        // ✅ Set completed count safely
        counts.completed = completedData.length;

        // ✅ Count statuses from list
        list.forEach(item => {
            if (!item?.status) return;

            if (item.status == "N") counts.pending++;
            else if (item.status == "Y") counts.approved++;
            else if (item.status == "I") counts.ignored++;
        });

        return {
            props: {
                completedRequests: list,
                counts,
                assets,
                completedData,
            },
        };


    } catch (error) {
        console.error("SSR Error:", error);

        return {
            props: {
                completedRequests: [],
                counts: { pending: 0, approved: 0, ignored: 0, completed: 0 },
                assets: {},
            },
        };
    }
}

const CommitteeCompleted = ({ counts, assets, completedData }) => {

    const [activeTab, setMyActiveTab] = useState("completed");
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

                        <div className="table-responsive mt-4">
                            <table className="table table-hover align-middle">
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Ticket</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {completedData?.length > 0 ? (
                                        completedData.map((item, index) => {

                                            const profileImage = item["user.profile_image"]
                                                ? `${assets.profile_image_path}/${item["user.profile_image"]}`
                                                : "/assets/front-images/no-image.png";

                                            return (
                                                <tr key={item.order_id || index}>
                                                    <td>{index + 1}</td>

                                                    {/* IMAGE */}
                                                    <td>
                                                        <img
                                                            src={profileImage}
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

                                                    {/* USER */}
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>
                                                            {item["user.first_name"]} {item["user.last_name"]}
                                                        </div>
                                                        <div className="text-muted fs-13">
                                                            {item["user.email"]}
                                                        </div>
                                                    </td>

                                                    {/* TICKET */}
                                                    <td>
                                                        <div>{item["ticketType.title"]}</div>
                                                        <div className="text-muted fs-13">
                                                            ₹{item["ticketType.price"]}
                                                        </div>
                                                    </td>

                                                    {/* STATUS */}
                                                    <td>
                                                        <span className="badge bg-success">
                                                            Completed
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4">
                                                No completed requests found
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
