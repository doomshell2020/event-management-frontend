import React, { useMemo, useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import {
    CForm,
    CCol,
    CFormLabel,
    CFormFeedback,
    CFormInput,
    CInputGroupText,
    CButton,
    CFormCheck,
    CFormTextarea,
} from "@coreui/react";
import { Breadcrumb, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import moment from "moment-timezone";
import Swal from "sweetalert2";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import { format } from "date-fns"; // helps format dates
import api from "@/utils/api";
import EventSidebar from "../components/Event/EventSidebar";

export default function OrganizerEvents({ userId }) {
    const [eventData, setEventData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLeftRight, setIsLeftRight] = useState(false);
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const [loading, setLoading] = useState(true); // ✅ Added loading state

    // ✅ Fetch events by organizer
    const fetchEvents = async () => {
        setLoading(true); // start loading
        try {
            const res = await api.post(`/api/v1/events/event-list`);
            if (res.data.success) {
                setEventData(res.data.data.events || []);
            } else {
                setEventData([]);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setEventData([]);
        } finally {
            setLoading(false); // stop loading after API call
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [userId]);

    const handleStatusChange = async (eventId, newStatus) => {
        const status = newStatus;
        const actionText = newStatus == "Y" ? "enable" : "disable";

        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Do you want to ${actionText} this event?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${actionText} it!`,
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Processing...",
                text: "Please wait while we update the status.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // 🔥 Create FormData instead of JSON
            const formData = new FormData();
            formData.append("status", status);

            // 🔥 Send FormData
            const response = await api.put(
                `/api/v1/events/update/${eventId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const resData = response.data;

            Swal.close();

            if (resData?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: `Event has been ${actionText}d successfully.`,
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchEvents();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: resData?.message || "Failed to update event status.",
                });
            }
        } catch (error) {
            Swal.close();
            console.error("Status update error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again later.",
            });
        }
    };

    const handleDelete = async (eventId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the event.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Deleting...",
                text: "Please wait while the event is being deleted.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await api.delete(`/api/v1/events/delete/${eventId}`);
            const resData = response.data;

            if (resData?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "The event has been deleted successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                // ✅ Refresh your event list
                fetchEvents();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: resData?.message || "Failed to delete the event.",
                });
            }
        } catch (error) {
            console.error("Delete error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again later.",
            });
        }
    };


    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">

                <div className="d-flex">

                    {/* Left Menu */}
                    <EventSidebar />

                    <div className="event-righcontent">
                        <h4>My Events</h4>
                        <hr
                            style={{
                                borderColor: "currentColor",
                            }}
                        />

                        <div className="search_sec">
                            <form className="d-flex align-items-center">
                                <input
                                    className="form-control me-2 text-14"
                                    style={{ height: "34px" }}
                                    type="text"
                                    placeholder="Search My Events"
                                    aria-label="Search"
                                />
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 17 18"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g fill="#2874F1" fillRule="evenodd">
                                        <path d="M11.618 9.897l4.225 4.212c.092.092.101.232.02.313l-1.465 1.46c-.081.081-.221.072-.314-.02l-4.216-4.203" />
                                        <path d="M6.486 10.901c-2.42 0-4.381-1.956-4.381-4.368 0-2.413 1.961-4.369 4.381-4.369 2.42 0 4.381 1.956 4.381 4.369 0 2.413-1.961 4.368-4.381 4.368m0-10.835c-3.582 0-6.486 2.895-6.486 6.467 0 3.572 2.904 6.467 6.486 6.467 3.582 0 6.486-2.895 6.486-6.467 0-3.572-2.904-6.467-6.486-6.467" />
                                    </g>
                                </svg>
                            </form>
                        </div>

                        <div className="desbord-content">
                            <div className="my-ticket-box">
                                <div className="event-list">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-dark table_bg">
                                                <tr>
                                                    <th style={{ width: "2%" }} scope="col">#</th>
                                                    <th style={{ width: "14%" }} scope="col">Name</th>
                                                    {/* <th style={{ width: "17%" }} scope="col">Date and Time</th> */}
                                                    <th style={{ width: "8%" }} scope="col">Venue</th>
                                                    <th style={{ width: "18%" }} scope="col">Ticket Sale</th>
                                                    {/* <th style={{ width: "16%" }} scope="col">Ticket Types</th> */}
                                                    <th style={{ width: "15%" }} scope="col">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* ✅ Show Loader when fetching */}
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <div className="spinner-border text-primary" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                            <div className="mt-2">Loading events...</div>
                                                        </td>
                                                    </tr>
                                                ) : eventData && eventData.length > 0 ? (
                                                    eventData.map((event, index) => {
                                                        const startDate = event?.date_from?.local
                                                            ? new Date(event.date_from.local.replace(" ", "T"))
                                                            : new Date(event?.date_from?.utc);

                                                        const endDate = event?.date_to?.local
                                                            ? new Date(event.date_to.local.replace(" ", "T"))
                                                            : new Date(event?.date_to?.utc);

                                                        const ticketTypes = Array.isArray(event?.EventTicketTypes)
                                                            ? event.EventTicketTypes
                                                            : [];
                                                        const currencySymbol = event?.Currency?.Currency_symbol || "";
                                                        const imgUrl = event?.feat_image || "";

                                                        return (
                                                            <tr key={event.id}>
                                                                <th scope="row">{index + 1}</th>
                                                                <td>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <img
                                                                            src={imgUrl}
                                                                            alt="Event"
                                                                            style={{
                                                                                objectFit: "cover",
                                                                                borderRadius: "8px",
                                                                                border: "1px solid #ddd",
                                                                                width: "70px",
                                                                                height: "70px",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </td>

                                                                {/* ✅ Venue + Location combined */}
                                                                <td>
                                                                    {event ? (
                                                                        <>
                                                                            <Link
                                                                                href={`/event/${event.id}/${event.slug}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                style={{

                                                                                    fontWeight: "600",
                                                                                    textDecoration: "none",
                                                                                }}
                                                                            >
                                                                                {event.name || "Untitled Event"}
                                                                            </Link>
                                                                            <br />
                                                                            <span className="text-muted">
                                                                                {event.location || "Location not added"}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        "N/A"
                                                                    )}
                                                                </td>

                                                                {/* ✅ Dates */}
                                                                <td>
                                                                    <b>From:</b>{" "}
                                                                    {startDate ? format(startDate, "EEE, dd MMM yyyy") : "N/A"}
                                                                    <br />
                                                                    <b>To:</b>{" "}
                                                                    {endDate ? format(endDate, "EEE, dd MMM yyyy") : "N/A"}
                                                                </td>

                                                                {/* ✅ Ticket Types */}
                                                                {/* <td className="ticket_types">
                                                                    {ticketTypes.length > 0 ? (
                                                                        ticketTypes.map((ticketType) => (
                                                                            <div
                                                                                key={ticketType.id}
                                                                                className="mb-3 p-2 border rounded bg-light"
                                                                            >
                                                                                <p className="mb-1 fw-bold">
                                                                                    {ticketType.title} –{" "}
                                                                                    <span className="text-primary">
                                                                                        {currencySymbol}
                                                                                        {ticketType.price}
                                                                                    </span>
                                                                                </p>
                                                                                <div
                                                                                    className="text-muted"
                                                                                    style={{ fontSize: "0.9rem" }}
                                                                                >
                                                                                    <div>
                                                                                        <b>Sale From:</b>{" "}
                                                                                        {ticketType.sale_start_date
                                                                                            ? format(
                                                                                                new Date(ticketType.sale_start_date),
                                                                                                "dd MMM yyyy"
                                                                                            )
                                                                                            : "N/A"}
                                                                                    </div>
                                                                                    <div>
                                                                                        <b>To:</b>{" "}
                                                                                        {ticketType.sale_end_date
                                                                                            ? format(
                                                                                                new Date(ticketType.sale_end_date),
                                                                                                "dd MMM yyyy"
                                                                                            )
                                                                                            : "N/A"}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p>Tickets not created</p>
                                                                    )}
                                                                </td> */}

                                                                {/* ✅ Action Buttons */}
                                                                <td className="Con_center">
                                                                    <div className="editIcos d-flex justify-content-between"
                                                                        style={{ gap: "1px" }}
                                                                    >
                                                                        <Link
                                                                            className="edit viewIcos"
                                                                            href={`/event/${event.id}/${event.slug}`}
                                                                            target="_blank"
                                                                        >
                                                                            <i className="bi bi-eye-fill"></i> View
                                                                        </Link>

                                                                        <Link
                                                                            href={`/event/edit-event/${event.id}`}
                                                                            className="edit viewIcos"
                                                                        >
                                                                            <i className="fas fa-edit"></i> Edit
                                                                        </Link>

                                                                    </div>

                                                                    <Link
                                                                        href="#"
                                                                        className="edit deleteIcos"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleDelete(event.id);
                                                                        }}
                                                                    >
                                                                        <button type="button" className="edit p-0 m-0">
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="18"
                                                                                height="18"
                                                                                fill="#fff"
                                                                                className="bi bi-trash"
                                                                                viewBox="0 0 16 16"
                                                                            >
                                                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                                                                ></path>
                                                                            </svg>{" "}
                                                                            Delete
                                                                        </button>
                                                                    </Link>


                                                                    <div className="d-flex justify-content-between"
                                                                        style={{ gap: "1px" }}
                                                                    >
                                                                        <Link
                                                                            href="#"
                                                                            className={`action_btn edit ${event.status == "Y" ? "disable_btn" : "enable_btn"
                                                                                }`}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                handleStatusChange(
                                                                                    event.id,
                                                                                    event.status == "Y" ? "N" : "Y"
                                                                                );
                                                                            }}
                                                                            title={
                                                                                event.status == "Y"
                                                                                    ? "Disable Event"
                                                                                    : "Enable Event"
                                                                            }
                                                                        >
                                                                            {event.status == "Y" ? (
                                                                                <i className="bi bi-x-circle-fill"></i>
                                                                            ) : (
                                                                                <i className="bi bi-check-circle-fill text-success"></i>
                                                                            )}
                                                                        </Link>

                                                                        <Link className="action_btn excel_btn edit" href={`/appointments/${event.id}`} title="My Appointment">
                                                                            <img
                                                                                className="del-icon"
                                                                                style={{ width: "16px" }}
                                                                                src="/assets/front-images/export-icon.png"
                                                                                alt=""
                                                                            />
                                                                        </Link>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    // ✅ No Data Found
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <img
                                                                src="/assets/front-images/no-data.svg"
                                                                alt="No data"
                                                                style={{ width: "120px", opacity: 0.6 }}
                                                            />
                                                            <div className="mt-2 fw-bold text-muted">No Events Found</div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>

                                        </table>
                                    </div>

                                    <div className="paginator col-sm-12">
                                        {/* <ul className="pagination justify-content-center">
                                            <li className="prev disabled">
                                                <Link href="/"><i className="bi bi-chevron-left"></i> Previous</Link>
                                            </li>
                                            <li className="next disabled">
                                                <Link href="/">Next <i className="bi bi-chevron-right"></i></Link>
                                            </li>
                                        </ul>
                                        <div className="text-center">
                                            <p className="paginate_p text-14">
                                                Page 1 of 1, showing {eventData?.length || 0} record(s)
                                            </p>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

        </>
    )
}