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
    const currencyName = eventDetails?.currencyName?.Currency_symbol || null;
    const eventTypes = eventDetails?.entry_type || null;
    // console.log('eventDetails :', eventDetails);

    const [accessTypeLabels, setAccessTypeLabels] = useState({
        event: "Full Event Access",
        slot: "Specific Slot Access",
        day: "Single Day Access",
    })

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

    // console.log('ticketForm :', ticketForm);
    useEffect(() => {
        if (eventTypes == "multi") {
            setTicketForm((prev) => ({
                ...prev,
                type: "open_sales",
            }));
        }

        if (eventTypes == "event") {
            setTicketForm((prev) => ({
                ...prev,
                access_type: "event",
            }));
        }

        if (eventTypes == "multi") {
            setTicketForm((prev) => ({
                ...prev,
                price: 0, // set to zero
            }));
        }


    }, [eventTypes]);

    // console.log('ticketForm :', ticketForm);
    const [ticketId, setTicketId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setTicketForm({
            ...ticketForm,
            [name]: files && files.length > 0 ? files[0] : value,
        });
    };

    const handleImagePreview = () => {
        const imageUrl = ticketForm?.ticketImage || ticketForm?.ticketImage;

        if (!imageUrl) {
            Swal.fire({
                icon: "info",
                title: "No Image Found",
                text: "This event does not have an image yet.",
            });
            return;
        }

        Swal.fire({
            imageUrl: imageUrl.startsWith("http")
                ? imageUrl
                : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/uploads/tickets/${imageUrl}`,
            imageWidth: 400,
            imageHeight: 400,
            imageAlt: "Ticket Image",
            showConfirmButton: false,  // ✅ hides the "Close" button
            showCloseButton: true,     // ✅ shows the "X" icon at the top-right
            customClass: {
                popup: "rounded-lg shadow-lg p-0",
                closeButton: "text-white bg-transparent position-absolute top-2 right-2 fs-5",
            },
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
    // console.log('ticketsList :', ticketsList);

    const handleGetTicketsList = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/tickets/list/${id}`);
            if (res.data.success) {
                // console.log('res.data.data :', res.data.data);
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

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketQty, setTicketQty] = useState("");
    const [error, setError] = useState("");

    const openComplimentaryModal = (tickets) => {
        setTicketList(tickets);
        setSelectedTicket(tickets[0] || null); // default select first
        setTicketQty("");
        setError("");
        setComplimentary(true);
    };

    const handlePrintTickets = (ticketId) => {
        window.open(
            `/event/edit-event/${id}/print-tickets/${ticketId}`,
            "_blank"
        );
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    {/* Sidebar */}
                    <EventSidebar eventId={id} eventDetails={eventDetails} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Manage Tickets</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">
                                    You can manage all your tickets here.
                                </p>

                                <div className="row align-items-baseline">
                                    <div className="col-md-6">
                                        <ul className="tabes d-flex ps-0">
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-tickets`} className="active text-16">
                                                    Settings
                                                </Link>
                                            </li>
                                            {eventDetails?.is_free == 'N' ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <>
                                                    <li>
                                                        <Link href={`/event/edit-event/${id}/assign-ticket`} className="text-16">
                                                            Assign Ticket
                                                        </Link>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="col-md-6 text-end buttons-row">
                                        {eventDetails?.is_free == 'N' && (
                                            <button
                                                className="primery-button fw-normal px-2 text-white button-mobile-fullwidth"
                                                style={{ backgroundColor: "#00ad00" }}
                                                onClick={() => setShow(true)}
                                            >
                                                <i className="bi bi-plus"></i> Add Ticket
                                            </button>
                                        )}

                                        <button
                                            className="primery-button fw-normal px-2 ms-1 text-white button-mobile-fullwidth"
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
                                        <div
                                            key={ticket.id}
                                            className="row item_bg m-0 p-2 mb-3 align-items-center manage-ticket-type"
                                        >
                                            {/* LEFT CONTENT */}
                                            <div className="col-sm-6 col-md-9">
                                                <p className="body-text mb-3">
                                                    <strong>{ticket.title}</strong> ({currencyName}{ticket.price})
                                                    <br />
                                                    {ticket.type !== "comps" ? (
                                                        `Sold: ${ticket.sold_count || 0} / ${ticket.count}`
                                                    ) : (
                                                        `Generated: ${ticket.sold_count || 0}`
                                                    )}
                                                </p>

                                                <div className="row manage-ticket-rows">
                                                    {/* TYPE */}
                                                    <div className="col-md-3">
                                                        <p className="body-text mb-0 d-flex align-items-center manage-ticket-table">
                                                            <Ticket size={16} className="me-2 text-primary" />
                                                            {ticket.type == "open_sales"
                                                                ? "Open Sale"
                                                                : ticket.type == "committee_sales"
                                                                    ? "Committee Sales"
                                                                    : "Complimentary"}
                                                        </p>
                                                    </div>

                                                    {/* ACCESS TYPE */}
                                                    <div className="col-md-3">
                                                        <p className="body-text mb-0 d-flex align-items-center manage-ticket-table">
                                                            {accessTypeLabels[ticket.access_type] || "N/A"}
                                                        </p>
                                                    </div>


                                                    {/* NON-COMPS STATUS */}
                                                    {ticket.type !== "comps" ? (
                                                        <>
                                                            <div className="col-md-3">
                                                                <p className="body-text mb-0 d-flex align-items-center manage-ticket-table">
                                                                    {ticket.hidden == "Y" ? (
                                                                        <>
                                                                            <EyeOff
                                                                                size={16}
                                                                                className="me-2 text-danger"
                                                                            />
                                                                            Hidden
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Eye
                                                                                size={16}
                                                                                className="me-2 text-success"
                                                                            />
                                                                            Visible
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div className="col-md-3">
                                                                <p className="body-text mb-0 d-flex align-items-center manage-ticket-table">
                                                                    {ticket.sold_out == "Y" ? (
                                                                        <>
                                                                            <XCircle
                                                                                size={16}
                                                                                className="me-2 text-danger"
                                                                            />
                                                                            Sold Out
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle
                                                                                size={16}
                                                                                className="me-2 text-success"
                                                                            />
                                                                            On Sale
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        /* COMPS ONLY */
                                                        <div className="col-md-6">
                                                            <p className="body-text mb-0 d-flex align-items-center manage-ticket-table text-success fw-semibold">
                                                                🎁 Complimentary Ticket
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* RIGHT ACTIONS */}
                                            <div className="col-sm-6 col-md-3 text-end">
                                                {/* Committee badge */}
                                                {ticket.type == "committee_sales" && (
                                                    <button
                                                        className="btn btn-warning btn-sm rounded-pill fw-bold px-3 me-2"
                                                        style={{ backgroundColor: "#ff9800", color: "#fff" }}
                                                    >
                                                        Committee
                                                    </button>
                                                )}

                                                {/* ACTIONS ONLY FOR NON-COMPS */}
                                                {ticket.type !== "comps" && (
                                                    <div className="dropdown d-inline position-relative">
                                                        <button
                                                            className="btn btn-primary btn-sm setting-dropdown"
                                                            type="button"
                                                            onClick={() =>
                                                                setOpenDropdown(
                                                                    openDropdown == ticket.id
                                                                        ? null
                                                                        : ticket.id
                                                                )
                                                            }
                                                        >
                                                            <Settings size={16} />
                                                        </button>

                                                        {openDropdown == ticket.id && (
                                                            <ul
                                                                className="dropdown-menu show position-absolute"
                                                                style={{
                                                                    display: "block",
                                                                    zIndex: 999,
                                                                    left: "-120px",
                                                                    top: "24px",
                                                                }}
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
                                                                                ticketImage: ticket.ticket_image,
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
                                                                            const newHidden =
                                                                                ticket.hidden == "Y" ? "N" : "Y";
                                                                            api
                                                                                .put(
                                                                                    `/api/v1/tickets/update/${ticket.id}`,
                                                                                    { hidden: newHidden }
                                                                                )
                                                                                .then(handleGetTicketsList);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                    >
                                                                        {ticket.hidden == "Y"
                                                                            ? "Show Ticket"
                                                                            : "Hide Ticket"}
                                                                    </button>
                                                                </li>

                                                                {/* Sold Out / On Sale */}
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => {
                                                                            const newStatus =
                                                                                ticket.sold_out == "Y"
                                                                                    ? "N"
                                                                                    : "Y";
                                                                            api
                                                                                .put(
                                                                                    `/api/v1/tickets/update/${ticket.id}`,
                                                                                    { sold_out: newStatus }
                                                                                )
                                                                                .then(handleGetTicketsList);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                    >
                                                                        {ticket.sold_out == "Y"
                                                                            ? "Mark as On Sale"
                                                                            : "Mark as Sold Out"}
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
                                                                                    // Show loading Swal
                                                                                    Swal.fire({
                                                                                        title: "Deleting ticket...",
                                                                                        allowOutsideClick: false,
                                                                                        didOpen: () => {
                                                                                            Swal.showLoading();
                                                                                        },
                                                                                    });

                                                                                    api
                                                                                        .delete(`/api/v1/tickets/delete/${ticket.id}`)
                                                                                        .then((res) => {
                                                                                            if (res.data.success) {
                                                                                                Swal.fire("Deleted!", "Ticket has been deleted.", "success");
                                                                                                handleGetTicketsList();
                                                                                            } else {
                                                                                                Swal.fire("Error", res.data.error?.message || "Failed to delete ticket", "error");
                                                                                            }
                                                                                        })
                                                                                        .catch((err) => {
                                                                                            // console.error("Delete Ticket Error:", err);
                                                                                            const errorMessage =
                                                                                                err.response?.data?.error?.message || "Something went wrong while deleting the ticket.";
                                                                                            Swal.fire("Error", errorMessage, "error");
                                                                                        });
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
                                                )}

                                                {ticket.type == "comps" && ticket.sold_count != 0 && (
                                                    <div className="d-flex flex-column align-items-end gap-2">
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => handlePrintTickets(ticket.id)}
                                                        >
                                                            🖨️ Print Tickets
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    ))


                                    )}

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
                                    disabled={eventTypes == "multi"}
                                >
                                    <option value="">Choose Type</option>
                                    <option value="open_sales">Open Sales</option>
                                    <option value="committee_sales">Committee Sales</option>
                                </select>

                                <div className="invalid-feedback">
                                    Please select ticket type.
                                </div>
                            </div>


                            <div className="col-md-6">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={ticketForm.price}
                                    onChange={(e) => {
                                        // only allow changes if not multi
                                        if (eventTypes != "multi") {
                                            e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                            handleInputChange(e);
                                        }
                                    }}
                                    placeholder="Price"
                                    className="form-control"
                                    readOnly={eventTypes == "multi"} // readonly for multi
                                    required={eventTypes != "multi"} // required only if editable
                                />
                                {eventTypes !== "multi" && (
                                    <div className="invalid-feedback">Please enter price.</div>
                                )}
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
                                    onChange={(e) => {
                                        e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
                                        handleInputChange(e);
                                    }} />
                                <div className="invalid-feedback">Please enter count.</div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Access Type <span className="text-danger">*</span>
                                </label>

                                <select
                                    name="access_type"
                                    className="form-select"
                                    value={ticketForm.access_type || ""}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!!ticketId} 
                                >
                                    <option value="" disabled>
                                        Select Access Type
                                    </option>

                                    <option value="event">
                                        Full Event Access
                                    </option>

                                    {eventTypes == "multi" && (
                                        <>
                                            <option value="slot">Specific Slot Access</option>
                                            <option value="day">Single Day Access</option>
                                        </>
                                    )}
                                </select>

                                <div className="invalid-feedback">
                                    Please select an access type.
                                </div>
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
                                    <option value="N">Visible</option>
                                    <option value="Y">Hidden</option>
                                </select>
                                <div className="invalid-feedback">Please select visibility.</div>
                            </div>

                            <div className="col-md-12">
                                <label className="form-label d-flex align-items-center gap-2">
                                    Ticket Image (Optional)

                                    {(ticketForm?.ticketImage) && (
                                        <span
                                            className="preview_img fw-normal text-primary"
                                            role="button"
                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                            onClick={handleImagePreview}
                                        >
                                            Preview Image
                                        </span>
                                    )}
                                </label>

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

            <Modal
                className="addticket"
                show={complimentary}
                onHide={() => setComplimentary(false)}
                centered
            >
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>Generate Ticket</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Ticket Selection */}
                    <Form.Group className="mb-3">
                        <Form.Label>Select Ticket Type</Form.Label>
                        <Form.Select
                            value={selectedTicket?.id || ""}
                            onChange={(e) => {
                                const ticket = ticketsList.find(t => t.id == e.target.value);
                                setSelectedTicket(ticket);
                                setTicketQty("");
                                setError("");
                            }}
                        >
                            <option value="">Select Ticket</option>
                            {ticketsList
                                .filter(ticket => ticket.type == "comps")
                                .map(ticket => (
                                    <option key={ticket.id} value={ticket.id}>
                                        {ticket.title} (Unlimited)
                                    </option>
                                ))}

                        </Form.Select>
                    </Form.Group>

                    {/* Availability */}
                    {selectedTicket && (
                        <div className="mb-2">
                            {selectedTicket.type == "comps" ? (
                                <span className="badge bg-success">Unlimited Tickets</span>
                            ) : (
                                <span className="badge bg-warning text-dark">
                                    Available: {selectedTicket.count - selectedTicket.sold_count}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    <Form.Group>
                        <Form.Label>Number of Tickets (Max 50)</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            max={50}
                            value={ticketQty}
                            onChange={(e) => {
                                setError("");
                                setTicketQty(e.target.value.replace(/\D/g, ""));
                            }}
                        />
                        {error && <small className="text-danger">{error}</small>}
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setComplimentary(false)}
                        disabled={loading}
                    >
                        Close
                    </Button>

                    <Button
                        variant="primary"
                        disabled={loading}
                        onClick={async () => {
                            if (!selectedTicket) {
                                setError("Please select ticket");
                                return;
                            }

                            if (!ticketQty || Number(ticketQty) <= 0) {
                                setError("Enter valid quantity");
                                return;
                            }

                            // ❌ Limit validation (except complimentary)
                            if (
                                selectedTicket.type !== "comps" &&
                                Number(ticketQty) >
                                (selectedTicket.count - selectedTicket.sold_count)
                            ) {
                                setError("Quantity exceeds available tickets");
                                return;
                            }

                            try {
                                setLoading(true);

                                await api.post("/api/v1/tickets/generate", {
                                    ticket_id: selectedTicket.id,
                                    quantity: Number(ticketQty),
                                    event_id: Number(id)
                                });

                                Swal.fire("Success", "Tickets generated", "success");
                                setComplimentary(false);
                            } catch (err) {
                                Swal.fire(
                                    "Error",
                                    err.response?.data?.message || "Failed to generate",
                                    "error"
                                );
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        {loading ? "Generating..." : "Generate"}
                    </Button>
                </Modal.Footer>
            </Modal>


        </>
    );
};

export default ManageTickets;
