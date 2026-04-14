import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import { formatEventDateTime } from "@/utils/formatDate";
import Swal from "sweetalert2";
export default function MyOrders({ userId }) {
    const [backgroundImage, setIsMobile] = useState(
        "/assets/front-images/about-slider_bg.jpg"
    );
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currencySymbol, setCurrencySymbol] = useState("₹");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/orders`);
            if (res.data.success) {
                setOrderData(res.data.data || []);
                setCurrencySymbol(
                    res.data.data?.[0]?.event?.currencyName?.Currency_symbol
                );
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
        fetchOrders();
    }, [userId]);

    const handleOrderCancelRequest = async (orderId, event) => {
    const { refund_allowed, refund_deadline, date_from, cancellation_policy } = event;
    console.log("event",event)

    // ❌ Refund not allowed
    if (refund_allowed !== "Y") {
        return Swal.fire({
            icon: "error",
            title: "Not Allowed",
            text: "This order cannot be cancelled as per event policy.",
        });
    }

    // ❌ Deadline check
    const today = new Date();
    const eventDate = new Date(date_from);

    const lastCancelDate = new Date(eventDate);
    lastCancelDate.setDate(eventDate.getDate() - Number(refund_deadline));

    if (today > lastCancelDate) {
        return Swal.fire({
            icon: "error",
            title: "Deadline Passed",
            text: `Cancellation allowed only before ${refund_deadline} days of event.`,
        });
    }

    // ✅ Confirmation Modal
    const result = await Swal.fire({
        title: "Cancel Order?",
        icon: "warning",
        html: `
            <div style="text-align:left; max-height:150px; overflow:auto; margin-bottom:10px;">
                <b>Cancellation Policy</b><br/>
                ${cancellation_policy || "No policy available"}<br/><br/>

                <b>Important Info</b><br/>
                • Cancellation allowed before ${refund_deadline} days<br/>
                • Refund allowed: ${refund_allowed === "Y" ? "Yes" : "No"}<br/><br/>

                <b>Terms</b><br/>
                • Admin approval required<br/>
                • Refund as per policy
            </div>

            <div style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="acceptTerms"/>
                <label for="acceptTerms">I agree to Terms</label>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Send Request",
        focusConfirm: false,
        preConfirm: () => {
            const checkbox = document.getElementById("acceptTerms");
            if (!checkbox.checked) {
                Swal.showValidationMessage("Please accept terms");
                return false;
            }
            return true;
        }
    });

    if (!result.isConfirmed) return;

    try {
        // 🔥 LOADER START
        Swal.fire({
            title: "Sending Request...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const response = await api.put(
            `/api/v1/orders/${orderId}/cancel-request`
        );

        if (response.data?.success) {
            Swal.fire({
                icon: "success",
                title: "Request Sent",
                text: "Your order cancellation request has been sent.",
            });

            fetchOrders();
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: response.data?.message || "Request failed",
            });
        }

    } catch (error) {
        console.error("Order cancel error:", error);

        const msg =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong";

        Swal.fire({
            icon: "error",
            title: "Error",
            text: msg,
        });
    }
};









    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="my-order-module">
                <div className="container">
                    <div className="section-heading">
                        <h1 className="my-3 mt-4">My Orders</h1>
                        {/* <h2 className="mt-4"></h2> */}
                        <p className="text-center text-14 mb-4">Here you can manage your Orders</p>
                    </div>

                    <div className="my-ticketcontainer">
                        <div className="row">

                            {/* LOADING */}
                            {loading ? (
                                <div className="col-12 text-center py-5">
                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                    />
                                    <div className="mt-2">
                                        Loading orders...
                                    </div>
                                </div>
                            ) : orderData && orderData.length > 0 ? (
                                orderData.map((order) => {
                                    const event = order?.event;
                                    const eventTimezone =
                                        event?.event_timezone || "UTC";

                                    const eventName = event?.name || "N/A";
                                    const orderUID =
                                        order?.order_uid || "N/A";

                                    const purchaseDate = order?.createdAt
                                        ? formatEventDateTime(
                                            order.createdAt,
                                            eventTimezone
                                        )
                                        : "N/A";

                                    const totalTickets =
                                        order?.orderItems?.reduce(
                                            (sum, item) =>
                                                sum + (item.count || 0),
                                            0
                                        ) || 0;

                                    const eventCurrency = order.event?.currencyName?.Currency_symbol
                                    // console.log('eventCurrency :', eventCurrency);
                                    return (
                                        <div key={order.id} className="col-lg-6 col-md-12 mb-3 mb-sm-4">
                                            {/* ✅ ONLY CHANGE IS HERE (class condition added) */}
                                            <div
                                                className={`up_events position-relative ${order?.orderItems?.[0]
                                                    ?.type ===
                                                    "appointment"
                                                    ? "appointment-card"
                                                    : "ticket-card"
                                                    }`}
                                            >

                                                <div style={{
                                                    position: "absolute",
                                                    top: "10px",
                                                    right: "10px",
                                                    zIndex: 10
                                                }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault(); // link trigger na ho
                                                            handleOrderCancelRequest(order?.id,order.event);
                                                        }}
                                                        disabled={
                                                            order?.cancel_request_status === "pending" ||
                                                            order?.cancel_request_status === "approved" ||
                                                            order?.cancel_request_status === "rejected"
                                                        }
                                                        style={{
                                                            padding: "7px 20px",
                                                            borderRadius: "6px",
                                                            fontSize: "12px",
                                                            fontWeight: "500",
                                                            border: "1px solid",
                                                            backgroundColor: "#fff",
                                                            borderColor:
                                                                order?.cancel_request_status === "pending"
                                                                    ? "#facc15"
                                                                    : order?.cancel_request_status === "approved"
                                                                        ? "#16a34a"
                                                                        : order?.cancel_request_status === "rejected"
                                                                            ? "#dc2626"
                                                                            : "#dc2626",
                                                            color:
                                                                order?.cancel_request_status === "pending"
                                                                    ? "#92400e"
                                                                    : order?.cancel_request_status === "approved"
                                                                        ? "#16a34a"
                                                                        : order?.cancel_request_status === "rejected"
                                                                            ? "#dc2626"
                                                                            : "#dc2626",
                                                            cursor:
                                                                order?.cancel_request_status ? "not-allowed" : "pointer",
                                                            opacity:
                                                                order?.cancel_request_status ? 0.7 : 1,
                                                            background:
                                                                order?.cancel_request_status === "approved"
                                                                    ? "#dcfce7"
                                                                    : order?.cancel_request_status === "pending"
                                                                        ? "#fef9c3"
                                                                        : "#fff"
                                                        }}
                                                    >
                                                        {order?.cancel_request_status === "pending"
                                                            ? "Pending"
                                                            : order?.cancel_request_status === "approved"
                                                                ? "Cancelled"
                                                                : order?.cancel_request_status === "rejected"
                                                                    ? "Rejected"
                                                                    : "Cancel Order"}
                                                    </button>
                                                </div>





                                                <Link
                                                    href={`/orders/${order.id}`}
                                                >
                                                    <div className="inner_box">
                                                        <div className="row d-flex align-items-end justify-content-center g-3 g-sm-0">

                                                            {/* IMAGE + TITLE */}
                                                            <div className="col-sm-5">
                                                                <h3 className="title m-0 fw-bold">
                                                                    {eventName}
                                                                </h3>

                                                                <div className="image_br">
                                                                    <img
                                                                        className="event_img w-100"
                                                                        src={
                                                                            event?.feat_image ||
                                                                            "/assets/front-images/my-tacket-section.jpg"
                                                                        }
                                                                        alt="Event"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* DETAILS */}
                                                            <div className="col-sm-7">
                                                                <div className="event_contant">

                                                                    <p className="time m-0">
                                                                        <strong
                                                                            style={{
                                                                                width: "80px",
                                                                                display:
                                                                                    "inline-block",
                                                                            }}
                                                                        >
                                                                            Order ID :
                                                                        </strong>
                                                                        {orderUID}
                                                                    </p>

                                                                    <p className="time m-0">
                                                                        <strong
                                                                            style={{
                                                                                width: "80px",
                                                                                display:
                                                                                    "inline-block",
                                                                            }}
                                                                        >
                                                                            Purchased :
                                                                        </strong>

                                                                        {purchaseDate}
                                                                    </p>

                                                                    <div className="d-flex mb-1">
                                                                        <p className="time me-4 m-0">
                                                                            <strong
                                                                                style={{
                                                                                    width:
                                                                                        "110px",
                                                                                    display:
                                                                                        "inline-block",
                                                                                }}
                                                                            >
                                                                                {order?.orderItems?.[0]
                                                                                    ?.type ===
                                                                                    "appointment"
                                                                                    ? "Appointments"
                                                                                    : "Total Tickets"} :
                                                                            </strong>

                                                                            {totalTickets}
                                                                        </p>

                                                                        <p className="time m-0 p-0">
                                                                            <strong style={{ width: "70px", display: "inline-block" }}>Amount :</strong>
                                                                            <span style={{ width: "10px", display: "inline-block", fontWeight: "bold" }}></span>{eventCurrency}{order.grand_total}
                                                                        </p>
                                                                    </div>

                                                                    <p className="time m-0">
                                                                        <i className="bi bi-calendar-week me-1"></i>
                                                                        <strong
                                                                            style={{
                                                                                width:
                                                                                    "80px",
                                                                                display:
                                                                                    "inline-block",
                                                                            }}
                                                                        >
                                                                            Start Date :
                                                                        </strong>

                                                                        {formatEventDateTime(
                                                                            event?.date_from,
                                                                            eventTimezone
                                                                        )}
                                                                    </p>

                                                                    <p className="time m-0">
                                                                        <i className="bi bi-calendar-week me-1"></i>
                                                                        <strong
                                                                            style={{
                                                                                width:
                                                                                    "80px",
                                                                                display:
                                                                                    "inline-block",
                                                                            }}
                                                                        >
                                                                            End Date :
                                                                        </strong>

                                                                        {formatEventDateTime(
                                                                            event?.date_to,
                                                                            eventTimezone
                                                                        )}
                                                                    </p>

                                                                    <span className="d-block ticket-location">
                                                                        @{" "}
                                                                        {event?.location ||
                                                                            "--"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <img
                                        src="/assets/front-images/no-data.svg"
                                        alt="No Orders"
                                        style={{
                                            width: "120px",
                                            opacity: 0.6,
                                        }}
                                    />
                                    <div className="mt-2 fw-bold text-muted">
                                        No Orders Found
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
}
