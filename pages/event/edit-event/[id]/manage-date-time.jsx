"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";

import Calendar from "react-calendar";
import DatePicker from "react-datepicker";
import "react-calendar/dist/Calendar.css";
import "react-datepicker/dist/react-datepicker.css";
// import Modal from "react-bootstrap/Modal";
// import Button from "react-bootstrap/Button";

import { Form, Button, Modal } from "react-bootstrap";


const ManageDateTime = () => {
    const router = useRouter();
    const { id } = router.query;
    const [eventDetails, setEventDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // calendar & data
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null); // Date object opened in modal
    const [slotsByDate, setSlotsByDate] = useState({}); // { '2025-11-06': [ {slot_name,start_time,end_time,desc,saved}, ... ] }

    // modal
    const [showModal, setShowModal] = useState(false);

    // form states for the modal
    const [mode, setMode] = useState("single"); // "single" or "multiple"
    const [slotName, setSlotName] = useState("");
    const [description, setDescription] = useState("");
    const [singleStart, setSingleStart] = useState(null);
    const [singleEnd, setSingleEnd] = useState(null);
    const [interval, setInterval] = useState(30);

    // for "multiple times" generation
    const [multiStartTime, setMultiStartTime] = useState(null);
    const [multiEndTime, setMultiEndTime] = useState(null);
    const [multiIntervalMins, setMultiIntervalMins] = useState(60); // default 60 mins
    const [generatedSlots, setGeneratedSlots] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState("");


    const [manualSlots, setManualSlots] = useState([
        { start: null, end: null, slot_name: "", description: "" }
    ]);

    const addManualSlotRow = () => {
        setAllSlots(prev => [
            ...prev,
            {
                start: null,
                end: null,
                slot_name: "",
                description: "",
                type: "manual"
            }
        ]);
    };

    const updateSlot = (index, key, value) => {
        setAllSlots(prev => {
            const copy = [...prev];
            copy[index][key] = value;
            return copy;
        });
    };

    const removeSlotRow = (index) => {
        setAllSlots(prev => prev.filter((_, i) => i !== index));
    };

    const [allSlots, setAllSlots] = useState([]);
    const generateSlots = () => {
        if (!multiStartTime || !multiEndTime || !multiIntervalMins) return;

        const newSlots = [];
        let start = new Date(multiStartTime);
        const end = new Date(multiEndTime);

        while (start < end) {
            const slotStart = new Date(start);
            const slotEnd = new Date(start.getTime() + multiIntervalMins * 60000);

            if (slotEnd > end) break;

            newSlots.push({
                start: slotStart,
                end: slotEnd,
                slot_name: "",
                description: "",
                type: "generated"
            });

            start = slotEnd;
        }

        setAllSlots(prev => [...prev, ...newSlots]);
    };



    // -------------------------
    // Fetch event details
    // -------------------------
    const fetchEventDetails = async (eventId) => {
        try {
            setLoading(true);
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
                // optionally you could fetch existing slots here if your API provides them
            }
        } catch (err) {
            console.error("Error fetching event:", err);
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // Fetch existing slots from API
    // -------------------------
    const fetchSlots = async (eventId) => {
        try {
            const res = await api.get(`/api/v2/events/${eventId}/slots`);

            if (res.data.success && res.data.data?.slots) {
                const formatted = {};

                res.data.data.slots.forEach((slot) => {
                    const key = slot.slot_date; // already YYYY-MM-DD

                    if (!formatted[key]) formatted[key] = [];

                    formatted[key].push({
                        id: slot.id,
                        slot_name: slot.slot_name,
                        description: slot.description || "",
                        start_time: slot.start_time.slice(0, 5), // 10:00
                        end_time: slot.end_time.slice(0, 5),
                        saved: true, // mark as already saved
                    });
                });

                setSlotsByDate(formatted);
            }
        } catch (err) {
            console.error("Error fetching slots:", err);
        }
    };


    useEffect(() => {
        if (id) fetchEventDetails(id);
        if (id) fetchSlots(id);
    }, [id]);

    // -------------------------
    // Event date range helpers
    // -------------------------
    const eventStart = useMemo(() => {
        if (!eventDetails?.date_from) return null;
        const d = new Date(eventDetails.date_from.local);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [eventDetails]);

    const eventEnd = useMemo(() => {
        if (!eventDetails?.date_to) return null;
        const d = new Date(eventDetails.date_to.local);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [eventDetails]);

    // helper to format date key: YYYY-MM-DD
    const dateKey = (d) => {
        if (!d) return "";
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    // -------------------------
    // Open modal for a date
    // -------------------------
    const openForDate = (d) => {
        // If event range provided, block outside dates
        if (eventStart && eventEnd && (d < eventStart || d > eventEnd)) {
            Swal.fire("Not allowed", "This date is outside the event's date range.", "warning");
            return;
        }
        setSelectedDate(d);
        // reset form
        setMode("single");
        setSlotName("");
        setDescription("");
        setSingleStart(null);
        setSingleEnd(null);
        setMultiStartTime(null);
        setMultiEndTime(null);
        setMultiIntervalMins(60);
        setGeneratedSlots([]);
        setShowModal(true);
    };

    const [validateDefault, setValidateDefault] = useState(false);

    const saveSlotsForDate = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (!form.checkValidity()) {
            event.stopPropagation();
            setValidateDefault(true);
            return;
        }

        setIsSubmitting(true);
        setModalError("");

        const key = dateKey(selectedDate);
        let slotsPayload;

        if (mode == "single") {
            slotsPayload = {
                slot_date: key,
                slot_name: slotName || "General Slot",
                start_time: formatTime(singleStart),
                end_time: formatTime(singleEnd),
                description: description || "",
            };
        } else {
            slotsPayload = allSlots.map((s) => ({
                slot_date: key,
                slot_name: s.slot_name || "General Slot",
                start_time: formatTime(s.start),
                end_time: formatTime(s.end),
                description: s.description || "",
            }));
        }

        try {
            const payload = {
                event_id: parseInt(id, 10),
                slots: slotsPayload,
            };

            await api.post(`/api/v2/events/create-slot`, payload);
            // success → close modal
            setShowModal(false);
            // reset input
            setSlotName("");
            setDescription("");
            setSingleStart(null);
            setSingleEnd(null);
            setAllSlots([]);
            fetchSlots(id);

        } catch (err) {
            console.error("Save error", err);
            setModalError("Failed to save slots. Please try again!");
        }

        setIsSubmitting(false);
    };


    // Utility: format Date object to HH:MM (24h)
    function formatTime(d) {
        if (!d) return "";
        const h = String(d.getHours()).padStart(2, "0");
        const m = String(d.getMinutes()).padStart(2, "0");
        return `${h}:${m}`;
    }

    // Small helper to collect already created dates for calendar tile styling
    const datesWithSlots = useMemo(() => Object.keys(slotsByDate || {}), [slotsByDate]);

    // Render small pill for each slot
    const renderSlotPills = (arr = []) =>
        arr.map((s, idx) => (
            <span
                key={idx}
                className="badge rounded-pill border mx-1 py-1 px-2"
                style={{ background: "#251313ff", borderColor: "#d0d7df", fontSize: 13 }}
            >
                {s.start_time} - {s.end_time}
            </span>
        ));

    // Remove a local slot (by date key and index)
    const removeLocalSlot = async (idx) => {

        if (!idx) {
            return;
        }

        // If slot is saved → ask confirmation then call API
        const confirm = await Swal.fire({
            title: "Delete Slot?",
            text: `Are you sure you want to delete ?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
        });

        if (!confirm.isConfirmed) return;

        try {
            setLoading(true);

            const res = await api.delete(`/api/v2/events/${id}/slots/${idx}`);

            if (res.data.success) {
                Swal.fire("Deleted", "Slot deleted successfully.", "success");
                fetchSlots(id);
            }
        } catch (err) {
            Swal.fire("Error", "Unable to delete slot.", "error");
        } finally {
            setLoading(false);
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const addDateAllowed = !(eventStart && eventEnd && (today < eventStart || today > eventEnd));

    // -------------------------
    // Render
    // -------------------------
    return (
        <>
            <FrontendHeader backgroundImage={"/assets/front-images/about-slider_bg.jpg"} />

            <section id="myevent-deshbord" className="py-4">
                <div className="d-flex">
                    <EventSidebar eventId={id} />

                    <div className="event-righcontent flex-grow-1">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} />

                                <div className="d-flex align-items-start mt-3">
                                    {/* Left: Calendar */}
                                    <div style={{ width: 320 }} className="me-3">
                                        <div className="card p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">Calendar</h6>
                                                <small>{calendarDate.toLocaleString("default", { month: "long", year: "numeric" })}</small>
                                            </div>

                                            <Calendar
                                                onChange={(d) => setCalendarDate(d)}
                                                value={calendarDate}
                                                onClickDay={(d) => openForDate(d)}
                                                minDate={eventStart || undefined}
                                                maxDate={eventEnd || undefined}
                                                tileDisabled={({ date }) => {
                                                    if (eventStart && date < eventStart) return true;
                                                    if (eventEnd && date > eventEnd) return true;
                                                    return false;
                                                }}
                                                tileContent={({ date }) => {
                                                    const key = dateKey(date);
                                                    if (datesWithSlots.includes(key)) {
                                                        return (
                                                            <div style={{ marginTop: 4, textAlign: "center" }}>
                                                                <small className="text-muted">●</small>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />

                                            <div className="mt-3">
                                                <Button variant="secondary" size="sm" onClick={() => openForDate(new Date())} disabled={!addDateAllowed}>
                                                    + Add a date
                                                </Button>
                                                {!addDateAllowed && (
                                                    <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
                                                        Event date range restricted.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: date slots list */}
                                    <div className="flex-grow-1">
                                        <div className="card p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h4 className="text-24 mb-0">Manage dates and times</h4>
                                                <small className="text-muted">Add dates & time slots within the event range</small>
                                            </div>

                                            <div className="mt-4">
                                                {Object.keys(slotsByDate).length == 0 && (
                                                    <div className="p-4 text-muted">No dates yet. Click a date on the calendar or "Add a date".</div>
                                                )}

                                                {Object.keys(slotsByDate)
                                                    .sort()
                                                    .map((dKey) => {
                                                        const arr = slotsByDate[dKey] || [];
                                                        return (
                                                            <div
                                                                key={dKey}
                                                                className="p-3 mb-3 border rounded d-flex align-items-start justify-content-between"
                                                            >
                                                                {/* LEFT: Date Column */}
                                                                <div style={{ width: 70, textAlign: "center" }}>
                                                                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                                                                        {new Date(dKey)
                                                                            .toLocaleString("default", { weekday: "short" })
                                                                            .toUpperCase()}
                                                                    </div>
                                                                    <div style={{ fontSize: 22, fontWeight: 800 }}>
                                                                        {String(new Date(dKey).getDate()).padStart(2, "0")}
                                                                    </div>
                                                                    <div className="text-muted" style={{ fontSize: 14 }}>
                                                                        {new Date(dKey).toLocaleString("default", { month: "long" })}
                                                                    </div>
                                                                </div>

                                                                {/* MIDDLE: Slot Pills */}
                                                                <div className="flex-grow-1 px-3">
                                                                    <div style={{ fontWeight: 600 }}>
                                                                        {arr.length} time slot{arr.length > 1 ? "s" : ""}
                                                                    </div>

                                                                    <div className="mt-2">
                                                                        {arr.map((s, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="p-2 mb-2 rounded"
                                                                                style={{
                                                                                    background: "#f8f9fa",
                                                                                    border: "1px solid #d6d7d8",
                                                                                    color: "#000",
                                                                                    fontSize: 13,
                                                                                }}
                                                                            >
                                                                                <div style={{ fontWeight: 700 }}>{s.slot_name}</div>

                                                                                <div
                                                                                    style={{
                                                                                        fontSize: 13,
                                                                                        fontWeight: 600,
                                                                                        marginTop: 2,
                                                                                    }}
                                                                                >
                                                                                    {s.start_time} - {s.end_time}
                                                                                </div>

                                                                                {s.description && (
                                                                                    <div
                                                                                        className="text-muted"
                                                                                        style={{ fontSize: 12, marginTop: 2 }}
                                                                                    >
                                                                                        {s.description}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* RIGHT: Buttons */}
                                                                <div className="text-end" style={{ minWidth: 120 }}>

                                                                    <div className="text-start">
                                                                        {arr.map((s, idx) => (
                                                                            <div key={idx} className="d-inline-block me-1">

                                                                                <button
                                                                                    className="btn btn-sm btn-light border"
                                                                                    title="Remove slot"
                                                                                    onClick={() => removeLocalSlot(s.id)}
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Modal for adding/editing slots */}
                                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            <div>
                                                <div style={{ fontSize: 18, fontWeight: 700 }}>Date</div>
                                                <div style={{ fontSize: 14, color: "#666" }}>
                                                    {selectedDate ? selectedDate.toLocaleDateString() : ""}
                                                </div>
                                            </div>
                                        </Modal.Title>
                                    </Modal.Header>

                                    <Form
                                        noValidate
                                        onSubmit={saveSlotsForDate}
                                        className={validateDefault ? "was-validated" : ""}
                                    >
                                        <Modal.Body>
                                             {/* ERROR MESSAGE INSIDE MODAL */}
                                            {modalError && (
                                                <div className="text-danger me-auto fw-bold">
                                                    {modalError}
                                                </div>
                                            )}
                                            {/* DATE + TYPE */}
                                            <div className="row mb-3">
                                                <div className="col-md-6 mb-3">
                                                    <Form.Label>Date *</Form.Label>
                                                    <DatePicker
                                                        selected={selectedDate}
                                                        onChange={(d) => {
                                                            if (eventStart && eventEnd && (d < eventStart || d > eventEnd)) {
                                                                setModalError("This date is outside the event's date range.");
                                                                return;
                                                            }else{
                                                                setModalError("");
                                                            }
                                                            setSelectedDate(d);
                                                        }}
                                                        className="form-control"
                                                        dateFormat="dd/MM/yyyy"
                                                        required
                                                    />
                                                    <div className="invalid-feedback">Please select date.</div>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <Form.Label>Type *</Form.Label>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm me-2 ${mode === "single" ? "btn-primary" : "btn-outline-secondary"}`}
                                                            onClick={() => setMode("single")}
                                                        >
                                                            Single time
                                                        </button>

                                                        {/* <button
                                                            type="button"
                                                            className={`btn btn-sm ${mode === "multiple" ? "btn-primary" : "btn-outline-secondary"}`}
                                                            onClick={() => setMode("multiple")}
                                                        >
                                                            Multiple times
                                                        </button> */}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* =================== SINGLE SLOT UI =================== */}
                                            {mode == "single" && (
                                                <>
                                                    <div className="mb-3">
                                                        <Form.Label>Slot name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="e.g., Morning Session"
                                                            value={slotName}
                                                            onChange={(e) => setSlotName(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-6 mb-3">
                                                            <Form.Label>Start time *</Form.Label>
                                                            <DatePicker
                                                                selected={singleStart}
                                                                onChange={(d) => setSingleStart(d)}
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={15}
                                                                dateFormat="HH:mm"
                                                                className="form-control"
                                                                required
                                                            />
                                                            <div className="invalid-feedback">Please select start time.</div>
                                                        </div>

                                                        <div className="col-6 mb-3">
                                                            <Form.Label>End time *</Form.Label>
                                                            <DatePicker
                                                                selected={singleEnd}
                                                                onChange={(d) => setSingleEnd(d)}
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={15}
                                                                dateFormat="HH:mm"
                                                                className="form-control"
                                                                required
                                                            />
                                                            <div className="invalid-feedback">Please select end time.</div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <Form.Label>Description</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Optional"
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* =================== MULTIPLE SLOT UI =================== */}
                                            {mode == "multiple" && (
                                                <>
                                                    {/* Slot Generator Row */}
                                                    <div className="mb-2">
                                                        <Form.Label>Generate time slots</Form.Label>
                                                        <small className="d-block text-muted">Provide a start & end and interval</small>
                                                    </div>

                                                    <div className="row mb-2">
                                                        <div className="col-4">
                                                            <Form.Label>Start time *</Form.Label>
                                                            <DatePicker
                                                                selected={multiStartTime}
                                                                onChange={(d) => setMultiStartTime(d)}
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={15}
                                                                dateFormat="HH:mm"
                                                                className="form-control"
                                                                required
                                                            />
                                                            <div className="invalid-feedback">Select start time.</div>
                                                        </div>

                                                        <div className="col-4">
                                                            <Form.Label>End time *</Form.Label>
                                                            <DatePicker
                                                                selected={multiEndTime}
                                                                onChange={(d) => setMultiEndTime(d)}
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={15}
                                                                dateFormat="HH:mm"
                                                                className="form-control"
                                                                required
                                                            />
                                                            <div className="invalid-feedback">Select end time.</div>
                                                        </div>

                                                    </div>

                                                    {/* === Generated Slots List === */}
                                                    {allSlots.map((slot, index) => (
                                                        <div className="border rounded p-2 mt-2" key={index}>
                                                            <div className="row">
                                                                <div className="col-5 mb-2">
                                                                    <Form.Label>Start *</Form.Label>
                                                                    <DatePicker
                                                                        selected={slot.start}
                                                                        onChange={(d) => updateSlot(index, "start", d)}
                                                                        showTimeSelect
                                                                        showTimeSelectOnly
                                                                        dateFormat="HH:mm"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-5 mb-2">
                                                                    <Form.Label>End *</Form.Label>
                                                                    <DatePicker
                                                                        selected={slot.end}
                                                                        onChange={(d) => updateSlot(index, "end", d)}
                                                                        showTimeSelect
                                                                        showTimeSelectOnly
                                                                        dateFormat="HH:mm"
                                                                        className="form-control"
                                                                    />
                                                                </div>

                                                                <div className="col-2 d-flex align-items-end">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-danger btn-sm w-100"
                                                                        onClick={() => removeSlotRow(index)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}


                                                    {/* Add More Button */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary btn-sm mt-2"
                                                        onClick={addManualSlotRow}
                                                    >
                                                        + Add More Slot
                                                    </button>

                                                </>
                                            )}
                                        </Modal.Body>

                                        <Modal.Footer>                                           

                                            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                                                Close
                                            </Button>

                                            {mode == "single" && (
                                                <Button variant="primary" type="submit" disabled={isSubmitting}>
                                                    {isSubmitting ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        "Save Slot"
                                                    )}
                                                </Button>
                                            )}

                                            {mode == "multiple" && (
                                                <Button variant="primary" type="submit" disabled={isSubmitting}>
                                                    {isSubmitting ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        "Save All Slots"
                                                    )}
                                                </Button>
                                            )}
                                        </Modal.Footer>

                                    </Form>
                                </Modal>

                            </section>
                        </div>
                    </div>
                </div>
            </section >

            <FrontendFooter />
        </>
    );
};

export default ManageDateTime;
