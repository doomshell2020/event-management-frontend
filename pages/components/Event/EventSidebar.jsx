"use client";
import Link from "next/link";
import { useState } from "react";

const EventSidebar = () => {
    const [isLeftRight, setIsLeftRight] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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
                <li className="mb-3">
                    <Link
                        className="text-white fw-bold"
                        href="/event/post-event"
                        style={{ backgroundColor: "#ff9800" }}
                    >
                        <i className="bi bi-calendar2-event"></i>
                        <span className="fw-bold"> Create Event </span>
                    </Link>
                </li>
                <li className="mb-3">
                    <Link
                        className="text-white fw-bold"
                        href="/event/my-event"
                        style={{ backgroundColor: "#00ad00" }}
                    >
                        <i className="bi bi-eye-fill"></i>
                        <span className="fw-bold"> View Event </span>
                    </Link>
                </li>
            </ul>

            {/* Main Menu */}
            <ul className="listunstyl components">
                {[
                    { href: "/event/my-event", icon: "bi bi-speedometer2", label: "Dashboard" },
                    { href: "/event/my-event", icon: "bi bi-sliders", label: "Settings" },
                    { href: "/event/my-event", icon: "bi bi-credit-card", label: "Payments" },
                    { href: "/event/my-event", icon: "bi bi-bar-chart", label: "Analytics" },
                    { href: "/event/my-event", icon: "bi bi-wallet2", label: "Payouts" },
                    { href: "/event/my-event", icon: "bi bi-wallet2", label: "Export Tickets" },
                    { href: "/event/my-event", icon: "bi bi-people", label: "Committee" },
                    { href: "/event/my-event", icon: "fas fa-ticket-alt", label: "Tickets" },
                    { href: "/event/my-event", icon: "fas fa-chart-bar", label: "Ticket Reports" },
                ].map((item, idx) => (
                    <li key={idx}>
                        <Link href={item.href}>
                            <i className={item.icon}></i>
                            <span> {item.label} </span>
                        </Link>
                    </li>
                ))}

                <li className="menu_line"></li>

                {/* Account Dropdown */}
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
                                        <Link className="dropdown-item" href="/event/my-ticket">
                                            <i className="fas fa-ticket-alt"></i>
                                            <span> My Tickets </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" href="/">
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
