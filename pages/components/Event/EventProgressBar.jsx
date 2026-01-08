"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/utils/api";

const EventHeaderSection = ({ eventDetails, isProgressBarShow }) => {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [eventData, setEventData] = useState([]);
    const [loading, setLoading] = useState(false);
    const showProgress = isProgressBarShow != false;

    // Fetch Event List
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/api/v1/events/event-list`);
            if (res.data.success) setEventData(res.data.data.events || []);
            else setEventData([]);
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

    // Only define steps when eventDetails exists
    const steps = React.useMemo(() => {
        if (!eventDetails) return [];

        const isFree = eventDetails.is_free == 'Y';
        const isNonEventType = eventDetails.entry_type && eventDetails.entry_type != "event";

        if (isFree) {
            // Free events: only three tabs
            return [
                { serial: 1, label: "Manage Event", path: `/event/edit-event/${eventDetails.id}`, subPaths: [] },
                {
                    serial: 2,
                    label: "Manage Tickets",
                    path: `/event/edit-event/${eventDetails.id}/manage-tickets`,
                    subPaths: [
                        `/event/edit-event/${eventDetails.id}/manage-addons`,
                        `/event/edit-event/${eventDetails.id}/manage-questions`,
                        `/event/edit-event/${eventDetails.id}/manage-packages`,
                        `/event/edit-event/${eventDetails.id}/assign-ticket`,
                    ]
                },
                { serial: 3, label: "Publish Event", path: `/event/edit-event/${eventDetails.id}/publish-event`, subPaths: [] },
            ];
        } else if (isNonEventType) {
            // Paid / Non-event type events: full steps
            return [
                { serial: 1, label: "Manage Event", path: `/event/edit-event/${eventDetails.id}`, subPaths: [] },
                {
                    serial: 2,
                    label: "Manage Tickets",
                    path: `/event/edit-event/${eventDetails.id}/manage-tickets`,
                    subPaths: [
                        `/event/edit-event/${eventDetails.id}/manage-addons`,
                        `/event/edit-event/${eventDetails.id}/manage-questions`,
                        `/event/edit-event/${eventDetails.id}/manage-packages`,
                    ]
                },
                { serial: 3, label: "Manage Date & Time", path: `/event/edit-event/${eventDetails.id}/manage-date-time`, subPaths: [] },
                { serial: 4, label: "Ticket Pricing", path: `/event/edit-event/${eventDetails.id}/ticket-pricing`, subPaths: [] },
                { serial: 5, label: "Publish Event", path: `/event/edit-event/${eventDetails.id}/publish-event`, subPaths: [] },
            ];
        } else {
            // Paid / Normal event type
            return [
                { serial: 1, label: "Manage Event", path: `/event/edit-event/${eventDetails.id}`, subPaths: [] },
                {
                    serial: 2,
                    label: "Manage Tickets",
                    path: `/event/edit-event/${eventDetails.id}/manage-tickets`,
                    subPaths: [
                        `/event/edit-event/${eventDetails.id}/manage-addons`,
                        `/event/edit-event/${eventDetails.id}/manage-questions`,
                        `/event/edit-event/${eventDetails.id}/manage-packages`,
                    ]
                },
                {
                    serial: 3,
                    label: "Manage Committee",
                    path: `/event/edit-event/${eventDetails.id}/committee/manage-committee`,
                    subPaths: [
                        `/event/edit-event/${eventDetails.id}/committee/manage-committee-tickets`,
                        `/event/edit-event/${eventDetails.id}/committee/manage-committee-groups`,
                    ]
                },
                { serial: 4, label: "Publish Event", path: `/event/edit-event/${eventDetails.id}/publish-event`, subPaths: [] },
            ];
        }
    }, [eventDetails]);

    // 🔹 ACTIVE STEP LOGIC
    const normalizePath = (path) => path?.replace(/\/$/, "");

    const activeIndex = React.useMemo(() => {
        if (!pathname || steps.length == 0) return 0;

        const currentPath = normalizePath(pathname);

        const index = steps.findIndex(step => {
            const stepPath = normalizePath(step.path);
            // Check main path OR any subPath
            return stepPath == currentPath || (step.subPaths && step.subPaths.some(sub => normalizePath(sub) == currentPath));
        });

        return index >= 0 ? index : 0;
    }, [pathname, steps]);


    return (
        <>
            <div className="event_names d-flex justify-content-between align-items-center p-2 px-3 mb-3">
                {/* Dropdown */}
                <div className="dropdown edit-event-dropdown">
                    <button
                        className="btn rounded-md text-sm text-white dropdown-toggle"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ backgroundColor: "#e62d56" }}
                    >
                        {eventDetails?.name || "Select Event"}
                        {" "}
                        🧩 {eventDetails?.entry_type?.toUpperCase()}
                        {" | "}
                        💰 {eventDetails?.is_free == "Y" ? "Free" : "Paid"}
                    </button>

                    {isDropdownOpen && (
                        <ul className="dropdown-menu show">
                            {loading && (
                                <li className="dropdown-item text-center">
                                    <div className="spinner-border spinner-border-sm text-primary me-2" />
                                    Loading events...
                                </li>
                            )}
                            {!loading && eventData.length == 0 && (
                                <li className="dropdown-item text-muted text-center">
                                    No events found
                                </li>
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
                                            {" "}
                                            <small className="text-muted">
                                                🧩 <b>{item.entry_type?.toUpperCase()}</b>
                                                {" | "}
                                                💰 <b>{item.is_free == "Y" ? "Free" : "Paid"}</b>
                                            </small>
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
                <div className="text-center edit-event-header-title">
                    <h6 className="event_Heading mb-0 fs-5 fw-bold">{eventDetails?.name || ""}</h6>
                </div>

                {/* View Event */}
                <div className="text-right mt-0 edit-view-event">
                    <Link
                        href={`/event/${eventDetails?.id}/${eventDetails?.slug}`}
                        className="btn rounded-md text-sm text-white"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ backgroundColor: "#00b56a" }}
                    >
                        <i className="bi bi-eye-fill"></i> View Event
                    </Link>
                </div>
            </div>

            {/* Progress Bar */}
            {showProgress && steps.length > 0 && (
                <div className="prosection">
                    <div className="table-responsive">
                        <div className="scroll_tab w-auto px-2">
                            <ul id="progressbar">
                                {steps.map((step, index) => (
                                    <li key={index} className={index <= activeIndex ? "active" : ""}>
                                        <Link className="fw-semibold" href={step.path}>
                                            {step.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventHeaderSection;
