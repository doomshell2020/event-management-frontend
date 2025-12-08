import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import EventSidebar from "@/pages/components/Event/EventSidebar";

const ExportTickets = () => {
    const router = useRouter();
    const { eventId } = router.query;

    const [qrBasePath, setQrBasePath] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [ticketData, setTicketData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [limit] = useState(5);
    const [loading, setLoading] = useState(true);
    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    // Fetch Event Details
    const fetchEventDetails = async (eventId) => {
        setLoading(true);
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
            setLoading(false);

        } catch (error) {
            console.error("Error fetching event:", error);
            setLoading(false);
        }
    };

    // Fetch Orders with Pagination
    const fetchTickets = async (eventId, page) => {
        setLoading(true);
        try {
            const res = await api.get(
                `/api/v1/orders/organizer/ticket-exports?eventId=${eventId}&page=${page}&limit=${limit}`
            );

            if (res.data.success) {
                const { records, totalPages, currentPage, totalRecords, qr_base_path } = res.data.data;

                setTicketData(records);
                setTotalPages(totalPages);
                setCurrentPage(currentPage);
                setTotalRecords(totalRecords);
                setQrBasePath(qr_base_path);
            }
        } catch (err) {
            console.error(err);
            setTicketData([]);
        } finally {
            setLoading(false);
        }
    };


    // ✅ Fetch Event Details ONLY once when eventId becomes available
    useEffect(() => {
        if (!eventId) return;
        fetchEventDetails(eventId);   // ✔ ONLY ONE TIME
    }, [eventId]);

    // ✅ Fetch Tickets ONLY when page changes
    useEffect(() => {
        if (!eventId) return;
        fetchTickets(eventId, currentPage);  // ✔ runs every time page changes
    }, [currentPage]);  // ❗ remove eventId to avoid re-calling event details


    // Pagination Button Handler
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">

                    {/* Sidebar */}
                    <EventSidebar eventId={eventId} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">

                            <section id="post-eventpg edit-event-page">

                                <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />

                                <h4 className="text-24">Payments</h4>
                                <hr className="custom-hr" />

                                <div className="stripe-table mt-4">

                                    <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                                        <h6 className="fw-bold">Total Records: {totalRecords}</h6>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle shadow-sm rounded">
                                            <thead className="bg-dark text-white">
                                                <tr>
                                                    <th style={{ width: "80px" }}>Sr No.</th>
                                                    <th style={{ width: "150px" }}>QR Code</th>
                                                    <th>Email</th>
                                                    <th>Name</th>
                                                    <th>Amount</th>
                                                    <th>Type</th>
                                                    <th>Purchased Date</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {/* LOADING */}
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-5">
                                                            <div className="spinner-border text-primary" role="status"></div>
                                                            <p className="mt-3 fw-semibold text-muted">Loading Payments...</p>
                                                        </td>
                                                    </tr>
                                                ) : ticketData && ticketData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4 text-muted">
                                                            <i className="bi bi-ticket-perforated fs-3 d-block"></i>
                                                            No Ticket Records Found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    ticketData.map((item, index) => {
                                                        const srNo = index + 1 + (currentPage - 1) * limit;

                                                        return (
                                                            <tr key={index}>
                                                                <td className="fw-semibold">{srNo}</td>

                                                                {/* QR Code – Larger */}
                                                                <td>
                                                                    <img
                                                                        src={`${qrBasePath}${item.qr_image}`}
                                                                        alt="QR Code"
                                                                        style={{
                                                                            width: "80px",
                                                                            height: "80px",
                                                                            objectFit: "contain",
                                                                            borderRadius: "8px",
                                                                            border: "1px solid #ddd",
                                                                            padding: "5px",
                                                                            background: "#fff"
                                                                        }}
                                                                    />
                                                                </td>

                                                                {/* Email */}
                                                                <td className="fw-semibold">{item?.order?.user?.email || 'No Email'}</td>

                                                                {/* Name */}
                                                                <td className="fw-semibold">
                                                                    {item?.order?.user?.first_name} {item?.order?.user?.last_name || 'No Name'}
                                                                </td>

                                                                {/* Amount */}
                                                                <td className="fw-bold text-success">
                                                                    ${item?.order?.total_amount}
                                                                </td>

                                                                {/* Paid/Unpaid */}
                                                                <td>
                                                                    <span
                                                                        className={`badge px-3 py-2 ${item.type == "paid"
                                                                            ? "bg-success"
                                                                            : "bg-secondary"
                                                                            }`}
                                                                        style={{ fontSize: "0.85rem" }}
                                                                    >
                                                                        {item.type?.toUpperCase()}
                                                                    </span>
                                                                </td>

                                                                {/* Purchased Date */}
                                                                <td className="text-muted">
                                                                    {new Date(item.createdAt).toLocaleDateString("en-GB", {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    })}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>

                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-between align-items-center mt-3">

                                        <button
                                            className="btn btn-outline-primary"
                                            disabled={currentPage == 1}
                                            onClick={() => goToPage(currentPage - 1)}
                                        >
                                            ⬅ Previous
                                        </button>

                                        <div className="fw-bold">
                                            Page {currentPage} / {totalPages}
                                        </div>

                                        <button
                                            className="btn btn-outline-primary"
                                            disabled={currentPage == totalPages}
                                            onClick={() => goToPage(currentPage + 1)}
                                        >
                                            Next ➜
                                        </button>
                                    </div>
                                )}

                            </section>


                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
};

export default ExportTickets;
