"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/utils/api";

const EventHeaderSection = ({ eventDetails }) => {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [eventData, setEventData] = useState([]);
    const [loading, setLoading] = useState(false);

    // console.log('//////////',eventDetails);


    // Fetch Event List
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/api/v1/events/event-list`);
            if (res.data.success) {
                setEventData(res.data.data.events || []);
            } else {
                setEventData([]);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setEventData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // ================================
    // STATIC MENU ORDER (SERIAL BASED)
    // ================================

    let steps = [];

    if (eventDetails?.entry_type && eventDetails.entry_type !== "event") {
        // CASE 1 → entry_type ≠ "event"
        steps = [
            {
                serial: 1,
                label: "Manage Event",
                path: `/event/edit-event/${eventDetails?.id}`,
            },
            {
                serial: 2,
                label: "Manage Tickets",
                path: `/event/edit-event/${eventDetails?.id}/manage-tickets`,
            },
            {
                serial: 3,
                label: "Manage Date & Time",
                path: `/event/edit-event/${eventDetails?.id}/manage-date-time`,
            },
            {
                serial: 4,
                label: "Ticket Pricing",
                path: `/event/edit-event/${eventDetails?.id}/ticket-pricing`,
            },
            {
                serial: 5,
                label: "Publish Event",
                path: `/event/edit-event/${eventDetails?.id}/publish-event`,
            },
        ];
    } else {
        // CASE 2 → entry_type = "event"
        steps = [
            {
                serial: 1,
                label: "Manage Event",
                path: `/event/edit-event/${eventDetails?.id}`,
            },
            {
                serial: 2,
                label: "Manage Tickets",
                path: `/event/edit-event/${eventDetails?.id}/manage-tickets`,
            },
            {
                serial: 3,
                label: "Manage Committee",
                path: `/event/edit-event/${eventDetails?.id}/manage-committee`,
            },
            {
                serial: 4,
                label: "Publish Event",
                path: `/event/edit-event/${eventDetails?.id}/publish-event`,
            },
        ];
    }

    // Highlight Active Step
    const checkActiveStep = (step) => {
        const stepSegment = step.path.split("/event/")[1];

        if (pathname?.includes(stepSegment)) {
            return true;
        }

        if (
            step.label == "Manage Tickets" &&
            (
                pathname?.includes("/manage-tickets") ||
                pathname?.includes("/manage-addons") ||
                pathname?.includes("/manage-questions") ||
                pathname?.includes("/manage-package")
            )
        ) {
            return true;
        }

        return false;
    };

    return (
        <>
            {/* ===== Event Name + Dropdown + View Button ===== */}
            <div className="event_names d-flex justify-content-between align-items-center p-2 px-3 mb-3">

                {/* Dropdown */}
                <div className="dropdown">
                    <button
                        className="btn rounded-md text-sm text-white dropdown-toggle"
                        id="eventDropdownMenu"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ backgroundColor: "#e62d56" }}
                    >
                        {eventDetails?.name || "Select Event"}
                    </button>

                    {isDropdownOpen && (
                        <ul className="dropdown-menu show" aria-labelledby="eventDropdownMenu">
                            {loading && (
                                <li className="dropdown-item text-center">
                                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                                    Loading events...
                                </li>
                            )}

                            {!loading && eventData.length == 0 && (
                                <li className="dropdown-item text-muted text-center">No events found</li>
                            )}

                            {!loading &&
                                eventData.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            className="dropdown-item"
                                            href={`/event/edit-event/${item.id}`}
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}

                            <li>
                                <Link
                                    className="dropdown-item browseall_event text-primary fw-semibold"
                                    href="/event/my-event"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Browse All Events
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>

                {/* Title */}
                <div className="text-center">
                    <h6 className="event_Heading mb-0 fs-5 fw-bold">
                        {eventDetails?.name || ""}
                    </h6>
                </div>

                {/* View Event */}
                <div className="text-right mt-1">
                    <Link
                        href={`/event/${eventDetails?.id}/${eventDetails?.slug}`}
                        className="btn rounded-md text-sm text-white"
                        rel="noopener noreferrer"
                        target="_blank"
                        style={{ backgroundColor: "#00b56a" }}
                    >
                        <i className="bi bi-eye-fill"></i> View Event
                    </Link>
                </div>
            </div>

            {/* ===== Progress Bar ===== */}
            <div className="prosection">
                <div className="table-responsive">
                    <div className="scroll_tab w-auto px-2">
                        <ul id="progressbar">
                            {steps.map((step, index) => {
                                const isActive = checkActiveStep(step);
                                return (
                                    <li key={index} className={isActive ? "active" : ""}>
                                        <Link className="fw-semibold" href={step.path}>
                                            {step.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                    </div>
                </div>
            </div>
        </>
    );
};

export default EventHeaderSection;
