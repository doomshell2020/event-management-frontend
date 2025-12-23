import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs";

const CommitteeEventCard = ({ event, assets }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/committee/ticket-details/${event.id}`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "--";
        return new Date(dateStr).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const eventImage = event.feat_image
        ? `${assets.event_image_path}/${event.feat_image}`
        : "/assets/front-images/event-demo.jpg";

    return (
        <div
            onClick={handleClick}
            className="d-flex gap-3 p-3 rounded bg-white border shadow-sm cursor-pointer"
        >
            <img
                src={eventImage}
                alt={event.name}
                style={{
                    width: "140px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                }}
            />

            <div style={{ flex: 1 }}>
                <h5 className="mb-1">{event.name}</h5>

                <p className="text-muted mb-2">
                    @{event.location}
                </p>

                <p className="mb-1 fs-14">
                    📅 <strong>Start:</strong> {formatDate(event.date_from)}
                </p>

                <p className="mb-2 fs-14">
                    📅 <strong>End:</strong> {formatDate(event.date_to)}
                </p>

                <span className="badge bg-danger px-3 py-2">
                    View Requests →
                </span>
            </div>
        </div>
    );
};

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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/committee/requests/T`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const json = await res.json();
        const apiData = json?.data?.list || [];
        const eventsList = json?.data?.events || [];
        const assets = json?.data?.assets || {};

        // ✅ counts
        const counts = { pending: 0, approved: 0, ignored: 0 };

        apiData.forEach(item => {
            if (item.status == "N") counts.pending++;
            if (item.status == "Y") counts.approved++;
            if (item.status == "I") counts.ignored++;
        });

        return {
            props: {
                counts,
                eventsList,
                assets
            },
        };

    } catch (error) {
        console.error("SSR Error:", error);

        return {
            props: {
                counts: { pending: 0, approved: 0, ignored: 0 },
                eventsList: [],
                assets: {}
            },
        };
    }
}

const CommitteePage = ({ counts, eventsList, assets }) => {
    // console.log('eventsList :', eventsList);

    const [activeTab, setMyActiveTab] = useState("ticket");
    const router = useRouter()

    const setActiveTab = (tab) => {
        setMyActiveTab(tab);
        router.push(`/committee/${tab}`);
    }

    // 🔥 Static event list (can be API later)
    const events = [
        {
            id: 108,
            title: "Yuli Dejesus",
            subtitle: "Voluptates cupiditat",
            start: "Fri, 19 Dec 2025 | 03:00 PM",
            end: "Wed, 31 Dec 2025 | 12:00 AM",
            image: "/assets/front-images/event-demo.jpg",
        },
        {
            id: 109,
            title: "Careyes Festival",
            subtitle: "Music & Culture",
            start: "Mon, 22 Dec 2025 | 05:00 PM",
            end: "Thu, 25 Dec 2025 | 01:00 AM",
            image: "/assets/front-images/event-demo.jpg",
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
                            counts={counts}
                        />

                        {/* EVENTS GRID (6-6) */}
                        <div className="row mt-4">
                            {eventsList.length > 0 ? (
                                eventsList.map(event => (
                                    <div key={event.id} className="col-md-6 mb-4">
                                        <CommitteeEventCard
                                            event={event}
                                            assets={assets}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted mt-4">
                                    No committee events found
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
};

export default CommitteePage;