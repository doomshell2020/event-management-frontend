"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const EventSidebar = ({ eventId, eventDetails }) => {

    const { is_free } = eventDetails || {};

    const [isLeftRight, setIsLeftRight] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const normalizePath = (p = "") => p.replace(/\/+$/, "");

    const isActive = (href) => {
        const np = normalizePath(pathname || "");
        const nh = normalizePath(href || "");
        return np == nh;
    };


    return (
        <div className={`event-sidebar ${isLeftRight ? "sideBarRightLeftClosed" : ""}`}>
            <div className="side_menu_icon">
                <i
                    className={`bi bi-arrow-${isLeftRight ? "right" : "left"}-short`}
                    onClick={() => setIsLeftRight(!isLeftRight)}
                ></i>
            </div>

            {/* Top Buttons */}
            <ul className="listunstyl components2">
                <li>
                    <Link
                        className="text-white fw-bold"
                        href="/event/post-event"
                        style={{ backgroundColor: "#ff9800" }}
                    >
                        <i className="bi bi-calendar2-event"></i>
                        <span className="fw-bold"> Create Event </span>
                    </Link>
                </li>

                {/* View Event only if eventId exists */}
                {eventId && (
                    <li className="mt-2">
                        <Link
                            className="text-white fw-bold"
                            href="/event/my-event"
                            style={{ backgroundColor: "#00ad00" }}
                        >
                            <i className="bi bi-eye-fill"></i>
                            <span className="fw-bold"> View Event </span>
                        </Link>
                    </li>
                )}
            </ul>

            {/* MAIN MENU — show only if eventId exists */}
            {eventId ? (
                <ul className="listunstyl components">
                    {[
                        { href: `/event/my-event/`, icon: "bi bi-speedometer2", label: "Dashboard" },
                        { href: `/event/edit-event/${eventId}`, icon: "bi bi-sliders", label: "Settings" },
                        { href: `/event/payments/${eventId}`, icon: "bi bi-credit-card", label: "Payments" },
                        { href: `/event/export-tickets/${eventId}`, icon: "bi bi-wallet2", label: "Export Tickets" },
                        { href: `/event/analytics/${eventId}`, icon: "bi bi-bar-chart", label: "Analytics" },
                        // { href: `/event/payouts/${eventId}`, icon: "bi bi-wallet2", label: "Payouts" },

                        // show Committee ONLY if event is NOT free
                        is_free=='N' && {
                            href: `/event/edit-event/${eventId}/committee/manage-committee`,
                            icon: "bi bi-people",
                            label: "Committee",
                        },

                        { href: `/event/edit-event/${eventId}/manage-tickets`, icon: "fas fa-ticket-alt", label: "Tickets" },
                    ]
                        .filter(Boolean)
                        .map((item, idx) => (
                            <li key={idx} className={isActive(item.href) ? "active" : ""}>
                                <Link href={item.href}>
                                    <i className={item.icon}></i>
                                    <span> {item.label} </span>
                                </Link>
                            </li>
                        ))}

                </ul>
            ) : (
                <hr />
            )}

            {/* ACCOUNT MENU - Always Visible */}
            <ul className="listunstyl components">
                <li>
                    <ul className="dropdown-box ps-0">
                        <li className="dropdown">
                            <button
                                className="dropdown-toggle w-100 bg-transparent border-0 shadow-none d-flex justify-content-between align-items-center"
                                role="button"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <span> Account </span>
                            </button>

                            {isOpen && (
                                <ul className="dropdown-munubox p-0 w-100 border-0">
                                    <li>
                                        <Link className="dropdown-item" href="/orders">
                                            <i className="fas fa-ticket-alt"></i>
                                            <span> My Orders </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" href="/users/view-profile">
                                            <i className="bi bi-person"></i>
                                            <span> Profile </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" href="/">
                                            <i className="bi bi-box-arrow-right"></i>
                                            <span> Logout </span>
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    );
};

export default EventSidebar;
