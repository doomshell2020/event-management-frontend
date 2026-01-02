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
            className="committee-event-sec bg-white border shadow-sm rounded-3 p-3 cursor-pointer"
        >
            <div className="row align-items-stretch">
                <div className="col-4 d-flex">
                    <div className="event-img-wrap w-100 d-flex align-items-center justify-content-center">
                        <img
                            src={eventImage}
                            alt={event.name}
                            className="img-fluid rounded-3"
                        />
                    </div>
                </div>
                <div className="col-8 d-flex">
                    <div className="w-100 d-flex flex-column justify-content-center">
                        <h6 className="fw-semibold mb-1">
                            {event.name}
                        </h6>

                        <p className="text-muted mb-2">
                            @{event.location}
                        </p>
                        <p className="mb-1">
                            📅 <strong>Start:</strong> {formatDate(event.date_from)}
                        </p>

                        <p className="mb-2">
                            📅 <strong>End:</strong> {formatDate(event.date_to)}
                        </p>

                        <span className="btn text-white btn-sm rounded-pill align-self-start px-3">
                            View Requests →
                        </span>
                    </div>
                </div>

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
        const completedData = Array.isArray(json?.data?.completedData)
            ? json.data.completedData
            : [];

        // ✅ counts
        const counts = {
            pending: 0,
            approved: 0,
            ignored: 0,
            completed: 0,
        };

        apiData.forEach(item => {
            if (item.status == "N") counts.pending++;
            if (item.status == "Y") counts.approved++;
            if (item.status == "I") counts.ignored++;
        });

        // ✅ Set completed count safely
        counts.completed = completedData.length;


        return {
            props: {
                counts,
                eventsList,
                assets,
                completedData,
            },
        };

    } catch (error) {
        console.error("SSR Error:", error);

        return {
            props: {
                counts: { pending: 0, approved: 0, ignored: 0, completed: 0 },
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
                            {eventsList.map((event) => (
                                <div key={event.id} className="col-md-6 mb-3">
                                    <CommitteeEventCard event={event} assets={assets} />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
};

export default CommitteePage;