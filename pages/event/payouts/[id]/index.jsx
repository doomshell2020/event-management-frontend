import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import EventSidebar from "@/pages/components/Event/EventSidebar";

const ManagePayouts = () => {
    const router = useRouter();
    const { id } = router.query;

    const [eventDetails, setEventDetails] = useState(null);
    const [orderData, setOrderData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [limit] = useState(5);
    const [loading, setLoading] = useState(true);
    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    // Fetch Event Details Only Once
    const fetchEventDetails = async (id) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: id });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        }
    };

    // Fetch Orders with Pagination
    const fetchOrders = async (id, page) => {
        setLoading(true);
        try {
            const res = await api.get(
                `/api/v1/orders/payouts?eventId=${id}&page=${page}&limit=${limit}`
            );

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
        if (id) {
            fetchEventDetails(id); // only once
            fetchOrders(id, currentPage); // only orders refresh
        }
    }, [id, currentPage]);

    // Pagination
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
                    <EventSidebar eventId={id}  eventDetails={eventDetails}/>

                    <div className="event-righcontent">
                        <div className="dsa_contant">

                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />

                                <h4 className="text-24">Payouts</h4>
                                <hr className="custom-hr" />

                                <div className="stripe-table mt-4">                                    

                                    {/* TABLE */}
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle table-width-992">
                                            <thead className="bg-dark text-white">
                                                <tr >
                                                    <th>Sr No.</th>
                                                    <th>Ticket Type</th>
                                                    <th>Price</th>
                                                    <th>Payment Type</th>
                                                    <th>Count</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {/* Loader ONLY inside tbody */}
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-5">
                                                            <div className="spinner-border text-primary" role="status"></div>
                                                            <p className="mt-3 text-muted">Loading Payments...</p>
                                                        </td>
                                                    </tr>
                                                ) : orderData.length == 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-4 text-muted">
                                                            No Sales.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    orderData.map((item, index) => {
                                                        const srNo = index + 1 + (currentPage - 1) * limit;

                                                        return (
                                                            <tr key={index}>
                                                                {/* SR NO */}
                                                                <td className="fw-bold">{srNo}</td>

                                                                {/* Customer */}
                                                                <td>
                                                                    <div className="fw-bold">
                                                                        {item.user.first_name} {item.user.last_name}
                                                                    </div>
                                                                    <div className="fw-bold">{item.user.mobile}</div>
                                                                    <div className="text-muted">Order : {item.order_uid}</div>
                                                                </td>

                                                                {/* Tickets */}
                                                                <td className="fw-bold">{item.orderItems.length}</td>

                                                                {/* Amount */}
                                                                <td className="fw-bold">${item.total_amount}</td>

                                                                {/* Paid/Unpaid */}
                                                                <td>
                                                                    {item.status == "Y" ? (
                                                                        <span className="badge bg-success">Paid</span>
                                                                    ) : (
                                                                        <span className="badge bg-secondary">Unpaid</span>
                                                                    )}
                                                                </td>

                                                                {/* Date */}
                                                                <td>
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

                                        <div className="fw-bold">Page {currentPage} / {totalPages}</div>

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

export default ManagePayouts;
