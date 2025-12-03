import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import { Eye, EyeOff, Lock, Settings, CheckCircle, XCircle, Ticket } from "lucide-react";
import { Form, Button, Modal } from "react-bootstrap";

const ManageTickets = () => {
    const router = useRouter();
    const { id } = router.query;
    const [eventDetails, setEventDetails] = useState(null);
    const [isOpenWiggins, setIsOpenWiggins] = useState(false);
    const [show, setShow] = useState(false);
    const [complimentary, setComplimentary] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Ticket form state
    const [ticketForm, setTicketForm] = useState({
        title: "",
        type: "open_sales",
        price: "",
        count: "",
        hidden: "Y",
        access_type: "",
        ticketImage: null,
    });

    const [ticketId, setTicketId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setTicketForm({
            ...ticketForm,
            [name]: files && files.length > 0 ? files[0] : value,
        });
    };

    // For file input only
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTicketForm((prev) => ({
                ...prev,
                ticketImage: file,
            }));
        }
    };

    const [ticketsList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleGetTicketsList = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/tickets/list/${id}`);
            if (res.data.success) {
                setTicketList(res.data.data || []);
            } else {
                setTicketList([]);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });

            if (res.data.success && res.data.data.events.length > 0) {
                const event = res.data.data.events[0];
                setEventDetails(event);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) handleGetTicketsList();
        if (id) fetchEventDetails(id);
    }, [id]);

    // console.log('>>>>>>>', eventDetails?.entry_type);

    const [validateDefault, setValidateDefault] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ new state

    const handleCreateTicket = async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (!form.checkValidity()) {
            event.stopPropagation();
            setValidateDefault(true);
            return;
        }

        setIsSubmitting(true); // ✅ start loading

        try {
            const formData = new FormData();
            formData.append("title", ticketForm.title);
            formData.append("type", ticketForm.type);
            formData.append("price", ticketForm.price);
            formData.append("count", ticketForm.count);
            formData.append("hidden", ticketForm.hidden);
            formData.append("access_type", ticketForm.access_type);
            formData.append("event_id", id);
            if (ticketForm.ticketImage) {
                formData.append("ticketImage", ticketForm.ticketImage);
            }

            const res = ticketId
                ? await api.put(`/api/v2/tickets/update/${ticketId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                : await api.post("/api/v2/tickets/create", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

            if (res.data.success) {
                Swal.fire({
                    icon: "success",
                    title: `Ticket ${ticketId ? "updated" : "created"} successfully!`,
                    confirmButtonColor: "#00ad00",
                });
                setTicketForm({
                    title: "",
                    type: "open_sales",
                    price: "",
                    count: "",
                    hidden: "Y",
                    access_type: "",
                    ticketImage: null,
                });
                setShow(false);
                setTicketId(null);
                handleGetTicketsList();
            } else {
                Swal.fire({
                    icon: "error",
                    title: res.data.message || "Something went wrong!",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error creating ticket!",
                text: err.message,
            });
        } finally {
            setIsSubmitting(false); // ✅ stop loading
        }
    };

    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    {/* Sidebar */}
                    <EventSidebar eventId={id} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg edit-event-page">
                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Manage Tickets</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">
                                    You can manage all your tickets here.
                                </p>

                                <div className="row align-items-baseline">
                                    <div className="col-md-7">
                                        <ul className="tabes d-flex ps-0">
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-tickets`} className="active text-16">
                                                    Settings
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-addons`} className="text-16">
                                                    Addons
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-questions`} className="text-16">
                                                    Questions
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-packages`} className="text-16">
                                                    Package
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-md-5 text-end">
                                        <button
                                            className="primery-button fw-normal px-2 text-white"
                                            style={{ backgroundColor: "#00ad00" }}
                                            onClick={() => setShow(true)}
                                        >
                                            <i className="bi bi-plus"></i> Add Ticket
                                        </button>

                                        <button
                                            className="primery-button fw-normal px-2 ms-1 text-white"
                                            style={{ backgroundColor: "#ff9800" }}
                                            onClick={() => setComplimentary(true)}
                                        >
                                            <i className="bi bi-plus"></i> Generate Complimentary
                                            Ticket
                                        </button>
                                    </div>
                                </div>

                                <div className="contant_bg mt-4">
                                    <h6>Tickets Types</h6>
                                    <hr className="custom-hr" />

                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 mb-0">Fetching tickets...</p>
                                        </div>
                                    ) : ticketsList.length == 0 ? (
                                        <p className="text-muted">No tickets found for this event.</p>
                                    ) : (ticketsList.map((ticket) => (
                                        <div key={ticket.id} className="row item_bg m-0 p-2 px-3 mb-2 align-items-center">
                                            <div className="col-sm-8">
                                                <p className="body-text mb-1">
                                                    <strong>{ticket.title}</strong> (₹{ticket.price})
                                                    <br /> Sold: {ticket.sold_count || 0} / {ticket.count}
                                                </p>
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <p className="body-text mb-0 d-flex align-items-center">
                                                            <Ticket size={16} className="me-2 text-primary" />
                                                            {ticket.type == "open_sales" ? "Open Sale" : "Committee Sales"}
                                                        </p>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <p className="body-text mb-0 d-flex align-items-center">
                                                            {ticket.access_type}
                                                        </p>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <p className="body-text mb-0 d-flex align-items-center">
                                                            {ticket.hidden == "Y" ? (
                                                                <>
                                                                    <EyeOff size={16} className="me-2 text-danger" /> Hidden
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye size={16} className="me-2 text-success" /> Visible
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <p className="body-text mb-0 d-flex align-items-center">
                                                            {ticket.sold_out == "Y" ? (
                                                                <>
                                                                    <XCircle size={16} className="me-2 text-danger" /> Sold Out
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle size={16} className="me-2 text-success" /> On Sale
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-sm-4 text-end">
                                                {ticket.type == "committee_sales" && (
                                                    <button
                                                        className="btn btn-warning btn-sm rounded-pill fw-bold px-3 me-2"
                                                        style={{ backgroundColor: "#ff9800", color: "#fff" }}
                                                    >
                                                        Committee
                                                    </button>
                                                )}

                                                <div className="dropdown d-inline position-relative">
                                                    <button
                                                        className="btn btn-primary btn-sm rounded-pill"
                                                        type="button"
                                                        onClick={() => setOpenDropdown(openDropdown == ticket.id ? null : ticket.id)}
                                                    >
                                                        <Settings size={16} />
                                                    </button>

                                                    {openDropdown == ticket.id && (
                                                        <ul
                                                            className="dropdown-menu show position-absolute end-0"
                                                            style={{ display: "block", zIndex: 999 }}
                                                        >
                                                            {/* Edit */}
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                        setTicketId(ticket.id);
                                                                        setTicketForm({
                                                                            title: ticket.title,
                                                                            type: ticket.type,
                                                                            price: ticket.price,
                                                                            count: ticket.count,
                                                                            hidden: ticket.hidden,
                                                                            access_type: ticket.access_type,
                                                                            ticketImage: null,
                                                                        });
                                                                        setShow(true);
                                                                        setOpenDropdown(null);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </li>

                                                            {/* Hide / Show */}
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                        const newHidden = ticket.hidden == "Y" ? "N" : "Y";
                                                                        api.put(`/api/v1/tickets/update/${ticket.id}`, {
                                                                            hidden: newHidden,
                                                                        })
                                                                            .then(() => {
                                                                                Swal.fire({
                                                                                    icon: "success",
                                                                                    title: newHidden === "Y" ? "Ticket Hidden" : "Ticket Visible",
                                                                                    timer: 1200,
                                                                                    showConfirmButton: false,
                                                                                });
                                                                                handleGetTicketsList();
                                                                            })
                                                                            .catch(() => Swal.fire("Error", "Failed to update ticket.", "error"));
                                                                        setOpenDropdown(null);
                                                                    }}
                                                                >
                                                                    {ticket.hidden === "Y" ? "Show Ticket" : "Hide Ticket"}
                                                                </button>
                                                            </li>

                                                            {/* Sold Out / On Sale */}
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                        const newStatus = ticket.sold_out == "Y" ? "N" : "Y";

                                                                        api.put(`/api/v1/tickets/update/${ticket.id}`, {
                                                                            sold_out: newStatus,
                                                                        })
                                                                            .then(() => {
                                                                                Swal.fire({
                                                                                    icon: "success",
                                                                                    title:
                                                                                        newStatus == "Y"
                                                                                            ? "Marked as Sold Out"
                                                                                            : "Marked as On Sale",
                                                                                    timer: 1200,
                                                                                    showConfirmButton: false,
                                                                                });
                                                                                handleGetTicketsList();
                                                                            })
                                                                            .catch(() =>
                                                                                Swal.fire("Error", "Failed to update ticket status.", "error")
                                                                            );

                                                                        setOpenDropdown(null);
                                                                    }}
                                                                >
                                                                    {ticket.sold_out === "Y" ? "Mark as On Sale" : "Mark as Sold Out"}
                                                                </button>
                                                            </li>

                                                            {/* Delete */}
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() => {
                                                                        Swal.fire({
                                                                            icon: "warning",
                                                                            title: "Are you sure?",
                                                                            text: "This ticket will be deleted.",
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: "#e62d56",
                                                                            confirmButtonText: "Delete",
                                                                        }).then((result) => {
                                                                            if (result.isConfirmed) {
                                                                                api.delete(`/api/v1/tickets/delete/${ticket.id}`)
                                                                                    .then(() => {
                                                                                        Swal.fire({
                                                                                            icon: "success",
                                                                                            title: "Ticket Deleted",
                                                                                            timer: 1000,
                                                                                            showConfirmButton: false,
                                                                                        });
                                                                                        handleGetTicketsList();
                                                                                    })
                                                                                    .catch(() =>
                                                                                        Swal.fire("Error", "Failed to delete ticket.", "error")
                                                                                    );
                                                                            }
                                                                        });
                                                                        setOpenDropdown(null);
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>



                                            </div>
                                        </div>
                                    ))

                                    )}

                                    {/* <div className="next_prew_btn d-flex justify-content-between mt-4">
                                        <a
                                            className="prew primery-button fw-normal"
                                            href="https://eboxtickets.com/event/settings/287"
                                        >
                                            Previous
                                        </a>
                                        <a
                                            className="next primery-button fw-normal"
                                            href="https://eboxtickets.com/event/committee/287"
                                        >
                                            Next
                                        </a>
                                    </div> */}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

            {/* Add Ticket Modal */}
            <Modal className="addticket" show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-dark">
                        {ticketId ? "Edit Ticket" : "Add Ticket"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <form
                        onSubmit={handleCreateTicket}
                        noValidate
                        className={validateDefault ? "was-validated" : ""}
                    >
                        <div className="row g-3 text-start">
                            <div className="col-md-12">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={ticketForm.title}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter Ticket Name"
                                />
                                <div className="invalid-feedback">Please enter ticket name.</div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Type</label>
                                <select
                                    name="type"
                                    className="form-select"
                                    required
                                    value={ticketForm.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Choose Type</option>
                                    <option value="open_sales">Open Sales</option>
                                    <option value="committee_sales">Committee Sales</option>
                                </select>
                                <div className="invalid-feedback">Please select ticket type.</div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    value={ticketForm.price}
                                    onChange={handleInputChange}
                                    placeholder="Price"
                                    className="form-control"
                                />
                                <div className="invalid-feedback">Please enter price.</div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Count</label>
                                <input
                                    type="number"
                                    name="count"
                                    required
                                    className="form-control"
                                    placeholder="Enter Count"
                                    value={ticketForm.count}
                                    onChange={handleInputChange}
                                />
                                <div className="invalid-feedback">Please enter count.</div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Access Type</label>
                                <select
                                    name="access_type"
                                    required
                                    className="form-select"
                                    value={ticketForm.access_type}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Choose One</option>
                                    <option value="event">Event</option>
                                    <option value="slot">Slot</option>
                                    <option value="day">Day</option>
                                </select>

                                <div className="invalid-feedback">Please select access type.</div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Visibility</label>
                                <select
                                    name="hidden"
                                    required
                                    className="form-select"
                                    value={ticketForm.hidden}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Choose One</option>
                                    <option value="Y">Visible</option>
                                    <option value="N">Hidden</option>
                                </select>
                                <div className="invalid-feedback">Please select visibility.</div>
                            </div>

                            <div className="col-md-12">
                                <label className="form-label">Ticket Image (Optional)</label>
                                <input
                                    type="file"
                                    name="ticketImage"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShow(false)}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting} // ✅ disable while loading
                            >
                                {isSubmitting ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Complimentary Ticket Modal */}
            <Modal
                className="addticket"
                show={complimentary}
                onHide={() => setComplimentary(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title className="text-dark">
                        Generate Complimentary Ticket
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Woohoo, you are reading this text in a modal!
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setComplimentary(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => setComplimentary(false)}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ManageTickets;
