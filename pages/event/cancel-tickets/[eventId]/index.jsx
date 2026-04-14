import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import { formatDate } from "@/utils/formatDate";


const ManageCancelTickets = () => {
    const router = useRouter();
    const { eventId } = router.query;

    const [eventDetails, setEventDetails] = useState(null);
    const [cancelRequests, setOrderData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [activeTab, setActiveTab] = useState("tickets");
    const [limit] = useState(20);
    const [loading, setLoading] = useState(true);
    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    // Fetch Event Details Only Once
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

    // Fetch Orders with Pagination
    const fetchOrders = async (eventId, page, tab) => {
        setLoading(true);
        try {
            // const res = await api.get(
            //     `/api/v1/orders/organizer/cancel-tickets-request?eventId=${eventId}&page=${page}&limit=${limit}`
            // );
            let url = "";

            if (tab === "tickets") {
                url = `/api/v1/orders/organizer/cancel-tickets-request?eventId=${eventId}&page=${page}&limit=${limit}`;
            } else {
                url = `/api/v1/orders/organizer/cancel-orders-request?eventId=${eventId}&page=${page}&limit=${limit}`;
            }
            const res = await api.get(url);
            if (res.data.success) {
                const { records, totalPages, currentPage, totalRecords } = res.data.data;

                setOrderData(records);
                setTotalPages(totalPages);
                setCurrentPage(currentPage);
                setTotalRecords(totalRecords);
            } else {
                setOrderData([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrderData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchEventDetails(eventId); // only once
        }
    }, [eventId]);

    useEffect(() => {
        if (eventId) {
            fetchOrders(eventId, currentPage, activeTab); // only orders refresh
        }
    }, [eventId, currentPage, activeTab]);

    // Pagination
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    const handleApprove = async (id) => {
        const result = await Swal.fire({
            title: "Approve Cancellation?",
            text: "This will cancel the ticket and process refund.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, approve",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#16a34a",
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Processing Refund...",
                text: "Please wait while we process the refund.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            // const response = await api.put(
            //     `/api/v1/orders/${id}/approve-cancel-request`
            // );
            const url =
                activeTab === "tickets"
                    ? `/api/v1/orders/${id}/approve-cancel-request`
                    : `/api/v1/orders/${id}/approve-cancel-order`;

            const response = await api.put(url);

            if (response.data?.success) {
                const refundAmount = response.data?.refund?.amount
                    ? response.data.refund.amount / 100
                    : null;

                Swal.fire({
                    icon: "success",
                    title: "Approved & Refunded",
                    text: refundAmount
                        ? `Cancellation approved. ₹${refundAmount} refunded successfully.`
                        : "Cancellation approved successfully.",
                });

                fetchOrders(eventId, currentPage, activeTab);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data?.message || "Something went wrong.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Refund failed or server error.",
            });
        }
    };


    const handleReject = async (id) => {
        const { value: reason } = await Swal.fire({
            title: "Reject Cancellation Request",
            input: "textarea",
            inputLabel: "Reason for rejection",
            inputPlaceholder: "Enter reason...",
            inputAttributes: {
                'aria-label': 'Type your reason here'
            },
            showCancelButton: true,
            confirmButtonText: "Reject",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            inputValidator: (value) => {
                if (!value) {
                    return "Rejection reason is required!";
                }
            }
        });

        if (!reason) return;

        try {
            Swal.fire({
                title: "Processing...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            // const response = await api.put(`/api/v1/orders/${id}/reject-cancel-request`, {
            //     reason: reason
            // });
            const url =
                activeTab === "tickets"
                    ? `/api/v1/orders/${id}/reject-cancel-request`
                    : `/api/v1/orders/${id}/reject-cancel-order`;

            const response = await api.put(url, { reason });
            if (response.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Rejected",
                    text: response.data?.message,
                });
                fetchOrders(eventId, currentPage, activeTab);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data?.message || "Something went wrong.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Server error. Please try again.",
            });
        }
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">

                    {/* Sidebar */}
                    <EventSidebar eventId={eventId} eventDetails={eventDetails} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">

                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />

                                <h4 className="text-24">Cancel Tickets</h4>
                                <hr className="custom-hr" />
                                <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                                    <h6 className="fw-bold">Total Records: {totalRecords}</h6>
                                </div>
                                <div className="stripe-table mt-4 payment-table">


                                    <div className="d-flex mb-3">
                                        <button
                                            className={`btn ${activeTab === "tickets" ? "btn-primary" : "btn-light"} me-2`}
                                            onClick={() => {
                                                setActiveTab("tickets");
                                                setCurrentPage(1);
                                            }}
                                        >
                                            🎟 Ticket Requests
                                        </button>

                                        <button
                                            className={`btn ${activeTab === "orders" ? "btn-primary" : "btn-light"}`}
                                            onClick={() => {
                                                setActiveTab("orders");
                                                setCurrentPage(1);
                                            }}
                                        >
                                            📦 Order Requests
                                        </button>
                                    </div>












                                    {/* TABLE */}
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="bg-dark text-white">
                                                <tr>
                                                    <th>Sr No.</th>
                                                    <th>Customer</th>
                                                    <th>{activeTab === "tickets" ? "Item" : "Order ID"}</th>
                                                    <th>Amount</th>
                                                    <th>Request Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-5">
                                                            <div className="spinner-border text-primary"></div>
                                                        </td>
                                                    </tr>
                                                ) : cancelRequests.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center">
                                                            No cancel requests found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    cancelRequests.map((item, index) => {
                                                        const srNo = index + 1;

                                                        // ✅ CUSTOMER FIX
                                                        const user =
                                                            activeTab === "tickets"
                                                                ? item?.order?.user
                                                                : item?.user;

                                                        // ✅ CURRENCY FIX
                                                        const currencyName =
                                                            item?.event?.currencyName?.Currency_symbol || "₹";

                                                        // ✅ ITEM NAME (tickets only)
                                                        const getItemName = (item) => {
                                                            if (item?.type === "ticket") return item?.ticketType?.title;
                                                            if (item?.type === "committesale") return item?.ticketType?.title;
                                                            if (item?.type === "ticket_price") return item?.ticketPricing?.ticket?.title;
                                                            if (item?.type === "comps") return item?.ticketType?.title;
                                                            if (item?.type === "addon") return item?.addonType?.name;
                                                            if (item?.type === "package") return item?.package?.name;
                                                            if (item?.type === "appointment") return item?.appointment?.wellnessList?.name;
                                                            return "-";
                                                        };

                                                        return (
                                                            <tr key={item.id}>
                                                                <td>{srNo}</td>

                                                                {/* ✅ CUSTOMER */}
                                                                <td>
                                                                    <div className="fw-bold">
                                                                        {user?.first_name} {user?.last_name}
                                                                    </div>
                                                                    <div>{user?.email || "-"}</div>
                                                                </td>

                                                                {/* ✅ ITEM / ORDER */}
                                                                <td>
                                                                    {activeTab === "tickets"
                                                                        ? getItemName(item) || "-"
                                                                        : item?.order_uid || "-"}
                                                                </td>

                                                                {/* ✅ AMOUNT */}
                                                                <td>
                                                                    {currencyName}{" "}
                                                                    {activeTab === "tickets"
                                                                        ? item?.price_breakdown?.total_amount ?? 0
                                                                        : item?.grand_total ?? 0}
                                                                </td>

                                                                {/* ✅ DATE */}
                                                                <td>
                                                                    {formatDate(item?.cancel_request_date)}
                                                                </td>

                                                                {/* ✅ ACTIONS */}
                                                                <td>
                                                                    {/* APPROVE */}
                                                                    {item?.cancel_request_status !== "rejected" && (
                                                                        <button
                                                                            className="btn btn-sm btn-success me-2"
                                                                            onClick={() => handleApprove(item.id)}
                                                                            disabled={item?.cancel_request_status === "approved"}
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                    )}

                                                                    {/* REJECT */}
                                                                    {item?.cancel_request_status !== "approved" && (
                                                                        <button
                                                                            className="btn btn-sm btn-danger"
                                                                            onClick={() => handleReject(item.id)}
                                                                            disabled={item?.cancel_request_status === "rejected"}
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    )}
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
                                            disabled={currentPage === 1}
                                            onClick={() => goToPage(currentPage - 1)}
                                        >
                                            ⬅ Previous
                                        </button>

                                        <div className="fw-bold">Page {currentPage} / {totalPages}</div>

                                        <button
                                            className="btn btn-outline-primary"
                                            disabled={currentPage === totalPages}
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

export default ManageCancelTickets;
