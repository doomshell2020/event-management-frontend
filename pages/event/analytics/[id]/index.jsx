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
                                   
                              

                                <div className="contant_bg">
                                    h6
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
