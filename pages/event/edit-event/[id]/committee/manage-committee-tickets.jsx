import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import { Form, Button, Modal } from "react-bootstrap";
import { Dropdown } from "react-bootstrap";

import api from "@/utils/api";

const CommitteeTicketsPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [eventDetails, setEventDetails] = useState(null);
    const [ticketsList, setTicketList] = useState([]);
    // console.log('ticketsList :', ticketsList);
    const [assignedList, setAssignedList] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState('$'); //Currency_symbol

    const [ticketTypes, setTicketTypes] = useState([]);
    const [groupedData, setGroupedData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [show, setShow] = useState(false);
    const [validateDefault, setValidateDefault] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [ticketCounts, setTicketCounts] = useState({});

    const [totalAssigned, setTotalAssigned] = useState({});

    useEffect(() => {
        if (!ticketTypes.length || !groupedData.length) {
            setTotalAssigned({});
            return;
        }

        const totals = {};
        let grandTotal = 0;

        ticketTypes.forEach((t) => {
            totals[t.id] = 0;
        });

        groupedData.forEach((row) => {
            ticketTypes.forEach((t) => {
                const count = row.tickets[t.id] || 0;
                totals[t.id] += count;
                grandTotal += count;
            });
        });

        totals.grandTotal = grandTotal;

        setTotalAssigned(totals);
    }, [ticketTypes, groupedData]);


    /* ---------------- FETCH EVENT ---------------- */
    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, {
                id: eventId
            });

            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
                setCurrencySymbol(res.data.data.events[0]?.currencyName?.Currency_symbol)
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

        // ✅ Allow committee_sales & comps tickets
        const allowedTypes = ["committee_sales", "comps"];

        const committeeTickets = ticketsList.filter(
            (t) => allowedTypes.includes(t.type)
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
                            <section id="post-eventpg edit-event-page">
                                <EventHeaderSection
                                    eventDetails={eventDetails}
                                />

                                <h4 className="text-24">
                                    Committee Ticket Distribution
                                </h4>
                                <hr className="custom-hr" />

                                <p className="text-14 text-dark">
                                    You can add users to manage your events here. 'Add' adds the number to the total ticket count for the user. 'Replace' replaces the amount of tickets the user has available for purchase and will not affect tickets sold so far.
                                </p>

                                {/* TABS */}
                                <ul className="tabes d-flex ps-0">
                                    <li>
                                        <Link
                                            href={`/event/edit-event/${id}/committee/manage-committee`}
                                            className="text-16"
                                        >
                                            Manage
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={`/event/edit-event/${id}/committee/manage-committee-tickets`}
                                            className="active text-16"
                                        >
                                            Tickets
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/event/edit-event/${id}/committee/manage-committee-groups`} className="text-16">
                                            Groups
                                        </Link>
                                    </li>
                                </ul>

                                <div className="contant_bg">
                                    {/* LOADER */}
                                    {showLoader && (
                                        <div className="text-center py-5">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            />
                                            <div className="mt-2 fw-semibold">
                                                Loading ticket distribution...
                                            </div>
                                        </div>
                                    )}

                                    {/* TABLE */}
                                    {!showLoader && (

                                        <div className="card">
                                            <div className="table-container-box shadow-sm mb-2 p-3">
                                                {/* first table start*/}
                                                <div className="card-header card-header fw-bold px-0 fs-6 pt-1 text-dark">
                                                    Total Tickets Alotted
                                                </div>
                                                {/* TABLE */}
                                                <div className="table-responsive">
                                                    <table className="table table-bordered text-center align-middle mb-2 table-border-dark-soft">
                                                        <thead className="table-primary">
                                                            <tr>
                                                                {ticketTypes.map((t) => (
                                                                    <th key={t.id}>
                                                                        {t.title} {currencySymbol}({t.price})
                                                                    </th>
                                                                ))}
                                                                <th>Total</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            <tr>
                                                                {ticketTypes.map((t) => (
                                                                    <td key={t.id}>
                                                                        {totalAssigned[t.id] || 0}
                                                                    </td>
                                                                ))}
                                                                <td className="fw-bold">
                                                                    {totalAssigned.grandTotal || 0}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                            </div>

                                            <div className="table-container-box shadow-sm p-3">
                                                <div className="card-header fw-semibold fw-bold  fs-6 text-dark px-0 pt-0 mb-3">
                                                    Ungrouped
                                                </div>

                                                <div className="table-responsive">
                                                    <table className="table table-bordered mb-0">
                                                        <thead className="table-primary">
                                                            <tr>
                                                                <th>Sr.no</th>
                                                                <th>Action</th>
                                                                <th>User</th>

                                                                {ticketTypes.map((t) => (
                                                                    <th key={t.id} className="text-center">
                                                                        {t.title}
                                                                        <br />
                                                                        <small>({currencySymbol}{t.price})</small>
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>


                                                        <tbody>
                                                            {groupedData.map((row, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-center">{idx + 1}</td>

                                                                    {/* ACTION DROPDOWN */}
                                                                    <td className="text-center">
                                                                        <Dropdown align="end">
                                                                            <Dropdown.Toggle
                                                                                variant="danger"
                                                                                size="sm"
                                                                                id={`dropdown-${row.id}`}
                                                                            >
                                                                                ⚙
                                                                            </Dropdown.Toggle>

                                                                            <Dropdown.Menu>
                                                                                <Dropdown.Item onClick={() => openEditModal(row)}>
                                                                                    Assigned Tickets
                                                                                </Dropdown.Item>
                                                                                <Dropdown.Divider className="m-0" />

                                                                                <Dropdown.Item
                                                                                    onClick={() => router.push(`/event/analytics/${id}/sales/${row.user.id}`)}
                                                                                >
                                                                                    Sale Summary
                                                                                </Dropdown.Item>
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                    </td>




                                                                    {/* USER INFO */}
                                                                    <td>
                                                                        <div className="fw-semibold">
                                                                            {row.user.first_name} {row.user.last_name}
                                                                        </div>
                                                                        <div className="text-muted text-12">
                                                                            {row.user.email}
                                                                        </div>
                                                                        <div className="text-muted text-12">
                                                                            {row.user.mobile || "N/A"}
                                                                        </div>
                                                                    </td>

                                                                    {ticketTypes.map((t) => (
                                                                        <td key={t.id} className="text-center fw-semibold">
                                                                            {row.tickets[t.id] || 0}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>

                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                    )}

                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

            <Modal
                show={show}
                onHide={() => !isSubmitting && setShow(false)}
                centered
                backdrop={isSubmitting ? "static" : true}
                keyboard={!isSubmitting}
            >

                <Modal.Header closeButton>
                    <Modal.Title>
                        Edit {selectedUser?.user?.first_name}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {ticketTypes.map((t) => (
                        <div
                            key={t.id}
                            className="d-flex justify-content-between align-items-center mb-3"
                        >
                            {/* Ticket Info */}
                            <div>
                                <div className="fw-semibold">{t.title}</div>
                                <div className="text-muted text-12">
                                    {currencySymbol}{t.price}
                                </div>
                            </div>

                            {/* Counter */}
                            <div className="d-flex align-items-center gap-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={isSubmitting}
                                    onClick={() => changeCount(t.id, "dec")}
                                >
                                    −
                                </Button>

                                <Form.Control
                                    type="text"
                                    value={ticketCounts[t.id] || 0}
                                    readOnly
                                    className="text-center"
                                    style={{ width: "50px" }}
                                />

                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={isSubmitting}
                                    onClick={() => changeCount(t.id, "inc")}
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    ))}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Close
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleUpdateTicketSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Updating...
                            </>
                        ) : (
                            "Update Ticket"
                        )}
                    </Button>

                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CommitteeTicketsPage;
