import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs"

const CommitteeEventCard = ({ event }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/committee/ticket-details/${event.id}`);
    };

    return (
        <div
            onClick={handleClick}
            style={{
                display: "flex",
                gap: "16px",
                padding: "16px",
                borderRadius: "10px",
                background: "#ffffff",
                border: "1px solid #e6e6e6",
                boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "all 0.25s ease",
                height: "100%",
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
            }
        >
            {/* IMAGE */}
            <img
                src={event.image}
                alt="Event"
                style={{
                    width: "140px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                }}
            />

            {/* DETAILS */}
            <div style={{ flex: 1 }}>
                <h5 style={{ marginBottom: "6px" }}>{event.title}</h5>
                <p style={{ color: "#6c757d", marginBottom: "10px" }}>
                    @{event.subtitle}
                </p>

                <p style={{ fontSize: "14px", marginBottom: "4px" }}>
                    📅 <strong>Start:</strong> {event.start}
                </p>
                <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                    📅 <strong>End:</strong> {event.end}
                </p>

                <span
                    style={{
                        display: "inline-block",
                        marginTop: "6px",
                        fontSize: "12px",
                        padding: "4px 12px",
                        background: "#dc3545",
                        color: "#fff",
                        borderRadius: "20px",
                    }}
                >
                    View Requests →
                </span>
            </div>
        </div>
    );
};

const CommitteePage = () => {
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
                            counts={{
                                pending: 0,
                                approved: 0,
                                ignored: 0,
                                completed: 0,
                            }}
                        />

                        {/* EVENTS GRID (6-6) */}
                        <div className="row mt-4">
                            {events.map((event) => (
                                <div key={event.id} className="col-md-6 mb-4">
                                    <CommitteeEventCard event={event} />
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