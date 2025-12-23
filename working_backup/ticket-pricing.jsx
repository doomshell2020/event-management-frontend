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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const ManageTicketPricing = () => {
    const router = useRouter();
    const { id } = router.query;

    const [eventDetails, setEventDetails] = useState(null);
    const [ticketsList, setTicketsList] = useState([]);
    const [slotsList, setSlotsList] = useState([]);
    const [pricingList, setPricingList] = useState([]);
    const [loading, setLoading] = useState(false);


    const eventStart = eventDetails?.date_from?.local
        ? new Date(eventDetails.date_from.local)
        : null;

    const eventEnd = eventDetails?.date_to?.local
        ? new Date(eventDetails.date_to.local)
        : null;


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
    const [formValidated, setFormValidated] = useState(false);
    const [price, setPrice] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");

    function toDateInputFormat(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const normalize = (d) => {
        const dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() == false) {
            e.stopPropagation();
            setFormValidated(true);
            return;
        }

        setFormValidated(true);

        if (!selectedTicket) {
            return Swal.fire("Required!", "Please select a ticket.", "warning");
        }

        // Ensure price is a number
        const numericPrice = parseFloat(price);
        if (!numericPrice || numericPrice <= 0) {
            return Swal.fire("Required!", "Please enter a valid price.", "warning");
        }

        const ticketType = selectedTicket.access_type?.toLowerCase();
        if (ticketType == "day") {
            if (!selectedDate) {
                return Swal.fire("Required!", "Please select a date for day-type ticket.", "warning");
            }

            // Normalize all dates to strip time
            const normalize = (d) => {
                const dt = new Date(d);
                return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
            };

            const chosenDate = normalize(selectedDate);
            const eventStart = normalize(eventDetails.date_from.local);
            const eventEnd = normalize(eventDetails.date_to.local);

            if (chosenDate < eventStart || chosenDate > eventEnd) {
                return Swal.fire("Invalid Date!", "Date must be within the event duration.", "warning");
            }
        }

        if (ticketType == "slot") {
            if (!selectedSlot) {
                return Swal.fire("Required!", "Please select a slot for slot-type ticket.", "warning");
            }
        }

        const payload = {
            event_id: Number(id),
            ticket_type_id: Number(selectedTicket.id),
            price: numericPrice,
        };

        if (selectedDate) payload.date = selectedDate;
        if (selectedSlot) payload.event_slot_id = Number(selectedSlot);

        try {
            const res = await api.post(`/api/v2/tickets/ticket-pricing/set`, payload);

            if (res.data.success) {
                Swal.fire("Success!", "Ticket pricing saved successfully!", "success");

                // Reset form
                setPrice("");
                setSelectedSlot("");
                setSelectedDate("");
                setSelectedTicket(null);
                setFormValidated(false);
                // Refresh pricing list
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
                    <EventSidebar eventId={id} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">

                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Manage Ticket Pricing</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">
                                    You can manage all your ticket pricing here.
                                </p>

                                {/* PRICING FORM */}
                                <div className="card p-3 mt-4 shadow-sm">
                                    <h5 className="fw-bold mb-3">Add Ticket Pricing</h5>
                                    <Form
                                        id="ticketPricingForm"
                                        noValidate
                                        validated={formValidated}
                                        onSubmit={handleFormSubmit}
                                    >
                                        <div className="row g-3">
                                            {/* Ticket Type */}
                                            <div className="col-md-4">
                                                <Form.Label className="fw-semibold">Select Ticket Type:</Form.Label>
                                                <Form.Select
                                                    required
                                                    value={selectedTicket?.id || ""}
                                                    onChange={(e) => {
                                                        const ticket = ticketsList.find(t => t.id == e.target.value);
                                                        setSelectedTicket(ticket || null);
                                                        setSelectedDate("");
                                                        setSelectedSlot("");
                                                    }}
                                                >
                                                    <option value="">-- Select Ticket --</option>
                                                    {ticketsList.map((ticket) => (
                                                        <option key={ticket.id} value={ticket.id}>
                                                            {ticket.title} ({ticket.access_type})
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    Please select a ticket type.
                                                </Form.Control.Feedback>
                                            </div>

                                            {/* Price */}
                                            <div className="col-md-4">
                                                <Form.Label className="fw-semibold">Price:</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Enter price"
                                                    value={price}
                                                    required
                                                    onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : "")}
                                                />
                                            </div>

                                            {/* Date / Slot */}
                                            <div className="col-md-4">
                                                {selectedTicket?.access_type?.toLowerCase() == "day" && eventDetails && (
                                                    <>
                                                        <Form.Label className="fw-semibold">
                                                            Select Date <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={selectedDate}
                                                            required
                                                            min={toDateInputFormat(eventDetails?.date_from?.local)}
                                                            max={toDateInputFormat(eventDetails?.date_to?.local)}
                                                            onChange={(e) => {
                                                                const value = e.target.value; // YYYY-MM-DD
                                                                setSelectedDate(value);
                                                                const realDate = new Date(`${value}T00:00:00Z`);
                                                                console.log("Converted Date:", realDate);
                                                            }}
                                                        />


                                                        <Form.Control.Feedback type="invalid">
                                                            Please select a valid date within event duration.
                                                        </Form.Control.Feedback>
                                                    </>
                                                )}

                                                {selectedTicket?.access_type?.toLowerCase() == "slot" && (
                                                    <>
                                                        <Form.Label className="fw-semibold">
                                                            Select Slot <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Select
                                                            required
                                                            value={selectedSlot}
                                                            onChange={(e) => setSelectedSlot(e.target.value)}
                                                        >
                                                            <option value="">-- Select Slot --</option>
                                                            {slotsList.map((slot) => (
                                                                <option key={slot.id} value={slot.id}>
                                                                    {slot.slot_name} ({slot.start_time} - {slot.end_time})
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                        <Form.Control.Feedback type="invalid">
                                                            Please select a slot.
                                                        </Form.Control.Feedback>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            className="btn btn-primary mt-3"
                                            style={{ background: "#e62d56", border: 0 }}
                                            type="submit"
                                        >
                                            Save Ticket Pricing
                                        </Button>
                                    </Form>
                                </div>


                                {/* PRICING LIST TABLE */}
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
                                                            <td>{row?.ticket?.title || "-"}</td>
                                                            <td>{row.currency === "INR" ? "₹" : "$"}{row.price}</td>
                                                            <td>{row.date || "-"}</td>
                                                            <td>{row.slot ? `${row.slot.slot_name} (${row.slot.start_time.slice(0, 5)} - ${row.slot.end_time.slice(0, 5)})` : "-"}</td>
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
