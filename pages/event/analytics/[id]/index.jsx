import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import { Form, Button, Modal } from "react-bootstrap";

import api from "@/utils/api";

const CommitteeTicketsPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [eventDetails, setEventDetails] = useState(null);
    const [ticketsList, setTicketList] = useState([]);
    const [assignedList, setAssignedList] = useState([]);

    const [ticketTypes, setTicketTypes] = useState([]);
    const [groupedData, setGroupedData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [show, setShow] = useState(false);
    const [validateDefault, setValidateDefault] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [ticketCounts, setTicketCounts] = useState({});

    /* ---------------- FETCH EVENT ---------------- */
    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, {
                id: eventId
            });

            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (err) {
            console.error("Event fetch error", err);
        }
    };

    /* ---------------- FETCH ALL TICKETS ---------------- */
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/tickets/list/${id}`);

            if (res.data.success) {
                setTicketList(res.data.data || []);
            } else {
                setTicketList([]);
            }
        } catch (err) {
            console.error("Tickets fetch error", err);
            setTicketList([]);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- FETCH ASSIGNED COMMITTEE TICKETS ---------------- */
    const fetchAssignedTickets = async () => {
        try {
            const res = await api.get(
                `/api/v1/committee/ticket/assign-list/${id}`
            );

            if (res.data.success) {
                setAssignedList(res.data.data || []);
            } else {
                setAssignedList([]);
            }
        } catch (err) {
            console.error("Assigned ticket error", err);
            setAssignedList([]);
        }
    };

    /* ---------------- PROCESS DATA ---------------- */
    useEffect(() => {
        if (!ticketsList.length || !assignedList.length) {
            setTicketTypes([]);
            setGroupedData([]);
            return;
        }

        setProcessing(true);

        // Only committee sales tickets
        const committeeTickets = ticketsList.filter(
            (t) => t.type == "committee_sales"
        );
        setTicketTypes(committeeTickets);

        const formattedData = assignedList.map((item) => {
            const ticketsMap = {};
            item.assignedTickets.forEach((t) => {
                ticketsMap[t.ticket_id] = t.count;
            });
            return {
                user: item.user,
                tickets: ticketsMap
            };
        });
        // console.log('formattedData :', formattedData);

        setGroupedData(formattedData);
        setProcessing(false);
    }, [ticketsList, assignedList]);

    /* ---------------- INITIAL LOAD ---------------- */
    useEffect(() => {
        if (id) {
            fetchEventDetails(id);
            fetchTickets();
            fetchAssignedTickets();
        }
    }, [id]);

    // create / update addon
    const handleUpdateTicketSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await api.post("/api/v1/committee/ticket/update", {
                event_id: id,
                user_id: selectedUser.user.id,
                tickets: ticketCounts
            });

            setShow(false);              // close modal
            fetchAssignedTickets();      // refresh table
        } catch (err) {
            console.error("Ticket update failed", err);
        } finally {
            setIsSubmitting(false);      // stop loader
        }
    };


    const openEditModal = (row) => {
        const counts = {};

        ticketTypes.forEach((t) => {
            counts[t.id] = row.tickets[t.id] || 0;
        });

        setSelectedUser(row);
        setTicketCounts(counts);
        setShow(true);
    };

    const changeCount = (ticketId, type) => {
        setTicketCounts((prev) => ({
            ...prev,
            [ticketId]:
                type === "inc"
                    ? prev[ticketId] + 1
                    : Math.max(0, prev[ticketId] - 1)
        }));
    };

    const showLoader = loading || processing;

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar eventId={id} />
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <div>
                                    <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />

                                </div>
                                <h4 className="text-24">
                                    Dashboard
                                </h4>
                                <hr className="custom-hr" />
                                <div className="d-flex align-items-end justify-content-between ">
                                    <ul className="tabes d-flex ps-0 flex-grow-1 mb-0">
                                        <li>
                                            <Link
                                                href={`/event/analytics/${id}/index`}
                                                className="active text-16"
                                            >
                                                Dashboard
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={`/event/analytics/${id}/sales`}
                                                className=" text-16"
                                            >
                                                Sales

                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={`/event/analytics/${id}/sales-addons`}
                                                className=" text-16"
                                            >
                                                Addons
                                            </Link>
                                        </li>
                                    </ul>
                                    <div className="h-100" style={{ minWidth: "150px" }}>
                                        <button className="d-flex align-items-center gap-2 bg-dark text-white px-4 py-2 rounded text-sm fw-medium">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-file-down h-4 w-4"
                                            >
                                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                                <path d="M12 18v-6" />
                                                <path d="m9 15 3 3 3-3" />
                                            </svg>

                                            Export Ticket
                                        </button>
                                    </div>
                                </div>

                                <div className="contant_bg">
                                    <div className="card p-2">
                                        <div className="d-flex align-items-center gap-2 pb-3 border-bottom ">
                                            <span className="ticket-icon-circle">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" > <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7z" /> <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="2 2" /> </svg>
                                            </span>
                                            <h5 className="mb-0 fw-semibold body-text fw-bold">Sales by Ticket</h5>
                                        </div>

                                        {/* Table */}
                                        <div className="table-responsive">
                                            <table className="table align-middle mb-0">
                                                <thead className="table-light small text-uppercase">
                                                    <tr>
                                                        <th>Ticket Type</th>
                                                        <th className="text-end">Price</th>
                                                        <th className="text-end">Count</th>
                                                        <th className="text-end">Total</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td className="fw-medium">Comps</td>
                                                        <td className="text-end">€0.00</td>
                                                        <td className="text-end">1</td>
                                                        <td className="text-end">€0.00</td>
                                                    </tr>

                                                    {/* Total Row */}
                                                    <tr className="total-row">
                                                        <td className="fw-semibold">Total</td>
                                                        <td></td>
                                                        <td className="text-end fw-semibold">1</td>
                                                        <td className="text-end fw-semibold">€0.00</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="card p-2">
                                        <div className="d-flex align-items-center gap-2 pb-3 border-bottom ">
                                            <span className="ticket-icon-circle">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-credit-card h-4 w-4 text-accent-foreground"
                                                >
                                                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                                                    <line x1="2" x2="22" y1="10" y2="10"></line>
                                                </svg>


                                            </span>
                                            <h5 className="mb-0 fw-semibold body-text fw-bold">Sales by Method</h5>
                                        </div>

                                        {/* Table */}
                                        <div className="table-responsive">
                                            <table className="table align-middle mb-0">
                                                <thead className="table-light small text-uppercase">
                                                    <tr>
                                                        <th>Ticket Type</th>
                                                        <th className="text-end">Price</th>
                                                        <th className="text-end">Count</th>
                                                        <th className="text-end">Total</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td className="fw-medium">Comps</td>
                                                        <td className="text-end">€0.00</td>
                                                        <td className="text-end">1</td>
                                                        <td className="text-end">€0.00</td>
                                                    </tr>

                                                    {/* Total Row */}
                                                    <tr className="total-row">
                                                        <td className="fw-semibold">Total</td>
                                                        <td></td>
                                                        <td className="text-end fw-semibold">1</td>
                                                        <td className="text-end fw-semibold">€0.00</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="card p-2">
                                        <div className="d-flex align-items-center gap-2 pb-3 border-bottom ">
                                            <span className="ticket-icon-circle">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-globe h-4 w-4 text-accent-foreground"
                                                >
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                                                    <path d="M2 12h20"></path>
                                                </svg>
                                            </span>
                                            <h5 className="mb-0 fw-semibold body-text fw-bold">Online Payment Breakdown</h5>
                                        </div>

                                        {/* Table */}
                                        <div className="table-responsive">
                                            <table className="table align-middle mb-0">
                                                <thead className="table-light small text-uppercase">
                                                    <tr>
                                                        <th>Ticket Type</th>
                                                        <th className="text-end">Price</th>
                                                        <th className="text-end">Count</th>
                                                        <th className="text-end">Total</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td className="fw-medium">Comps</td>
                                                        <td className="text-end">€0.00</td>
                                                        <td className="text-end">1</td>
                                                        <td className="text-end">€0.00</td>
                                                    </tr>

                                                    {/* Total Row */}
                                                    <tr className="total-row">
                                                        <td className="fw-semibold">Total</td>
                                                        <td></td>
                                                        <td className="text-end fw-semibold">1</td>
                                                        <td className="text-end fw-semibold">€0.00</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="card p-2">
                                        <div className="d-flex align-items-center gap-2 pb-3 border-bottom ">
                                            <span className="ticket-icon-circle">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5 text-accent-foreground"
                                                >
                                                    <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                                    <circle cx="12" cy="12" r="2"></circle>
                                                </svg>
                                            </span>
                                            <h5 className="mb-0 fw-semibold body-text fw-bold">Cash Sales Breakdown</h5>
                                        </div>

                                        {/* Table */}
                                        <div className="table-responsive">
                                            <table className="table align-middle mb-0">
                                                <thead className="table-light small text-uppercase">
                                                    <tr>
                                                        <th>Ticket Type</th>
                                                        <th className="text-end">Price</th>
                                                        <th className="text-end">Count</th>
                                                        <th className="text-end">Total</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td className="fw-medium">Comps</td>
                                                        <td className="text-end">€0.00</td>
                                                        <td className="text-end">1</td>
                                                        <td className="text-end">€0.00</td>
                                                    </tr>

                                                    {/* Total Row */}
                                                    <tr className="total-row">
                                                        <td className="fw-semibold">Total</td>
                                                        <td></td>
                                                        <td className="text-end fw-semibold">1</td>
                                                        <td className="text-end fw-semibold">€0.00</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />




        </>
    );
};

export default CommitteeTicketsPage;
