import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import { Form, Button } from "react-bootstrap";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";

const ManageTicketPricing = () => {
    const router = useRouter();
    const { id } = router.query;

    const [eventDetails, setEventDetails] = useState(null);
    const [ticketsList, setTicketsList] = useState([]);
    const [slotsList, setSlotsList] = useState([]);
    const [pricingList, setPricingList] = useState([]);
    const [loading, setLoading] = useState(false);

    // form fields
    const [selectedTicket, setSelectedTicket] = useState("");
    const [price, setPrice] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");

    /* ----------------------------------------------------
        FETCH TICKETS
    ---------------------------------------------------- */
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/tickets/list/${id}`);

            if (res.data.success) {
                setTicketsList(res.data.data || []);
            } else {
                setTicketsList([]);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    console.log('>>>>>>>>>>>>>', pricingList);


    /* ----------------------------------------------------
        FETCH EVENT DETAILS
    ---------------------------------------------------- */
    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });

            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        }
    };

    /* ----------------------------------------------------
        FETCH SLOTS
    ---------------------------------------------------- */
    const fetchSlots = async () => {
        try {
            const res = await api.get(`/api/v2/events/${id}/slots`);

            if (res.data.success && res.data.data?.slots) {
                setSlotsList(res.data.data.slots);
            }
        } catch (err) {
            console.error("Error fetching slots:", err);
        }
    };

    /* ----------------------------------------------------
        FETCH PRICING LIST
    ---------------------------------------------------- */
    const fetchPricingList = async (eventId) => {
        try {
            const res = await api.get(`/api/v2/tickets/ticket-pricing/${eventId}`);

            if (res.data.success) {
                setPricingList(res.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching pricing list:", err);
        }
    };

    /* ----------------------------------------------------
        USE EFFECT
    ---------------------------------------------------- */
    useEffect(() => {
        if (id) {
            fetchTickets();
            fetchEventDetails(id);
            fetchSlots();
            fetchPricingList(id);
        }
    }, [id]);

    /* ----------------------------------------------------
        SAVE PRICING
    ---------------------------------------------------- */
    const handleSavePricing = async () => {
        if (!selectedTicket) {
            return Swal.fire("Required!", "Please select a ticket.", "warning");
        }

        if (!price || price <= 0) {
            return Swal.fire("Required!", "Please enter a valid price.", "warning");
        }

        const ticket = ticketsList.find((t) => t.id == selectedTicket);

        // ----------------------------------------------------
        // RULE 1: Day Type Ticket → Date Required
        // ----------------------------------------------------
        if (ticket?.ticket_type === "Day") {
            if (!selectedSlot && !selectedDate) {
                return Swal.fire(
                    "Required!",
                    "For day-type tickets, date is required if no slot is selected.",
                    "warning"
                );
            }
        }

        // ----------------------------------------------------
        // RULE 2: If slot NOT selected → date required
        // ----------------------------------------------------
        if (!selectedSlot && !selectedDate) {
            return Swal.fire(
                "Required!",
                "Please select a date when no slot is chosen.",
                "warning"
            );
        }

        const payload = {
            event_id: Number(id),
            ticket_type_id: Number(selectedTicket),
            price: Number(price)
        };

        if (selectedDate) payload.date = selectedDate;
        if (selectedSlot) payload.event_slot_id = Number(selectedSlot);

        try {
            const res = await api.post(`/api/v2/tickets/ticket-pricing/set`, payload);

            if (res.data.success) {
                Swal.fire("Success!", "Ticket pricing saved successfully!", "success");

                // reset
                setPrice("");
                setSelectedSlot("");
                setSelectedDate("");
                fetchPricingList(id);
            } else {
                Swal.fire("Error", res.data.message || "Failed to save pricing", "error");
            }
        } catch (err) {
            Swal.fire("Error", "Something went wrong", "error");
        }
    };


    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar />

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg edit-event-page">

                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Manage Ticket Pricing</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">
                                    You can manage all your ticket pricing here.
                                </p>

                                {/* ----------------------------------------------------
                                    PRICING FORM
                                ---------------------------------------------------- */}
                                <div className="card p-3 mt-4 shadow-sm">
                                    <div className="mb-3">
                                        <Form.Label className="fw-semibold">Select Ticket Type:</Form.Label>
                                        <Form.Select
                                            value={selectedTicket}
                                            onChange={(e) => setSelectedTicket(e.target.value)}
                                        >
                                            <option value="">-- Select Ticket --</option>
                                            {ticketsList.map((ticket) => (
                                                <option key={ticket.id} value={ticket.id}>
                                                    {ticket.title} ({ticket.access_type})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>

                                    <div className="mb-3">
                                        <Form.Label className="fw-semibold">Price:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter price"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />
                                    </div>

                                    {ticketsList.find((t) => t.id == selectedTicket)?.ticket_type == "Day" && (
                                        <div className="mb-3">
                                            <Form.Label className="fw-semibold">Select Date:</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <Form.Label className="fw-semibold">Select Slot (Optional):</Form.Label>
                                        <Form.Select
                                            value={selectedSlot}
                                            onChange={(e) => setSelectedSlot(e.target.value)}
                                        >
                                            <option value="">-- No Slot --</option>
                                            {slotsList.map((slot) => (
                                                <option key={slot.id} value={slot.id}>
                                                    {slot.slot_name} ({slot.start_time} - {slot.end_time})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>

                                    <Button
                                        className="btn btn-primary mt-2"
                                        style={{ background: "#e62d56", border: 0 }}
                                        onClick={handleSavePricing}
                                    >
                                        Save Ticket Pricing
                                    </Button>
                                </div>

                                {/* ----------------------------------------------------
                                    PRICING LIST TABLE
                                ---------------------------------------------------- */}
                                <div className="card p-3 mt-4 shadow-sm">
                                    <h5 className="fw-bold mb-3">Existing Ticket Pricing</h5>

                                    {pricingList.length === 0 ? (
                                        <p className="text-muted">No pricing added yet.</p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Ticket</th>
                                                        <th>Price</th>
                                                        <th>Date</th>
                                                        <th>Slot</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pricingList.map((row, index) => (
                                                        <tr key={index}>
                                                            {/* ✅ Ticket Name */}
                                                            <td>{row?.ticket?.title || "-"}</td>

                                                            {/* ✅ Price */}
                                                            <td>
                                                                {row.currency === "INR" ? "₹" : "$"}
                                                                {row.price}
                                                            </td>

                                                            {/* ✅ Date */}
                                                            <td>{row.date || "-"}</td>

                                                            {/* ✅ Slot Info */}
                                                            <td>
                                                                {row.slot
                                                                    ? `${row.slot.slot_name} (${row.slot.start_time.slice(0, 5)} - ${row.slot.end_time.slice(0, 5)})`
                                                                    : "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
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

export default ManageTicketPricing;
