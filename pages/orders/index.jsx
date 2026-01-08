import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import { formatEventDateTime } from "@/utils/formatDate";

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
                                                className={`up_events position-relative ${
                                                    order?.orderItems?.[0]
                                                        ?.type ===
                                                    "appointment"
                                                        ? "appointment-card"
                                                        : "ticket-card"
                                                }`}
                                            >
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
                                                                            Order ID
                                                                        </strong>
                                                                        :
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
                                                                            Purchased
                                                                        </strong>
                                                                        :
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
                                                                                    : "Total Tickets"}
                                                                            </strong>
                                                                            :
                                                                            {totalTickets}
                                                                        </p>

                                                                        <p className="time m-0 p-0">
                                                                            <strong style={{ width: "70px", display: "inline-block" }}>Amount</strong>
                                                                            <span style={{ width: "10px", display: "inline-block", fontWeight: "bold" }}>:</span>{eventCurrency}{order.grand_total}
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
                                                                            Start Date
                                                                        </strong>
                                                                        :
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
                                                                            End Date
                                                                        </strong>
                                                                        :
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
