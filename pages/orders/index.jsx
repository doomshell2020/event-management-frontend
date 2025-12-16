import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import { format } from "date-fns"; // helps format dates

export default function MyOrders({ userId }) {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const [orderData, setOrderData] = useState([]);
    console.log("---orderData", orderData)
    const [loading, setLoading] = useState(true); // ✅ Added loading state
    const fetchOrders = async () => {
        setLoading(true); // start loading
        try {
            const res = await api.get(`/api/v1/orders`);
            if (res.data.success) {
                setOrderData(res.data.data || []);
            } else {
                setOrderData([]);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setOrderData([]);
        } finally {
            setLoading(false); // stop loading after API call
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            <section id="my-ticket-module">
                <div className="container">
                    <div className="section-heading">
                        <h1>Orders</h1>
                        <h2 className="mt-4">My Orders</h2>
                        <p className="text-center text-14">Here you can manage your Orders</p>
                    </div>
                    <div className="my-ticketcontainer">
                        <div className="row">

                            {loading ? (
                                <div className="col-12 text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                    <div className="mt-2">Loading orders...</div>
                                </div>
                            ) : orderData && orderData.length > 0 ? (
                                orderData.map((order, index) => {
                                    const eventName = order?.event?.name || "N/A";
                                    const orderUID = order?.order_uid || "N/A";
                                    const purchaseDate = order?.createdAt
                                        ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")
                                        : "N/A";
                                    // Total Tickets Count
                                    const totalTickets = order?.orderItems?.reduce(
                                        (sum, item) => sum + (item.count || 0),
                                        0
                                    );

                                    const currencySymbol = order?.orderItems?.[0]?.appointment?.wellnessList?.currencyName?.Currency_symbol || "";
                                    // console.log("--------currencySymbol",currencySymbol)

                                    return (
                                        <div key={order.id} className="col-lg-6 col-md-12">
                                            <div className="up_events position-relative">
                                                {order?.orderItems[0]?.type === "appointment" && (
                                                    <span
                                                        className="position-absolute d-flex align-items-center gap-1"
                                                        style={{
                                                            top: "10px",
                                                            right: "10px",
                                                            padding: "6px 12px",
                                                            fontSize: "12px",
                                                            borderRadius: "8px",
                                                            zIndex: 10,
                                                            background: "#1e40af",
                                                            color: "#fff",
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-calendar-check"></i>
                                                        Appointment
                                                    </span>

                                                )}



                                                <Link href={`/orders/${order.id}`}>
                                                    <div className="inner_box">
                                                        <div className="row d-flex align-items-center justify-content-center g-0">
                                                            <div className="col-sm-5">
                                                                <div className="image_br d-flex align-items-center w-100 overflow-hidden" style={{ height: "220px" }}>
                                                                    <img
                                                                        className="event_img w-100"
                                                                        src={
                                                                            order?.event?.feat_image
                                                                                ? order.event.feat_image
                                                                                : "/assets/front-images/my-tacket-section.jpg"
                                                                        }
                                                                        // src="/assets/front-images/my-tacket-section.jpg"
                                                                        alt="IMG"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-sm-7">
                                                                <div className="event_contant">
                                                                    <h3 className="title m-0 fw-bold">{eventName}</h3>

                                                                    <p className="time d-inline-block m-0 p-0">
                                                                        <strong style={{ width: "70px", display: "inline-block" }}>Order ID</strong>
                                                                        <span style={{ width: "10px", display: "inline-block", fontWeight: "bold" }}>:</span>
                                                                        {orderUID}
                                                                    </p>

                                                                    <p className="time d-inline-block m-0 p-0">
                                                                        <strong style={{ width: "70px", display: "inline-block" }}>Purchased</strong>
                                                                        <span style={{ width: "10px", display: "inline-block", fontWeight: "bold" }}>:</span>
                                                                        {purchaseDate}
                                                                    </p>

                                                                    <div className="d-flex justify-content-start align-items-center mb-1">

                                                                        <p className="time m-0 p-0 me-4">
                                                                            <strong style={{ width: "100px", display: "inline-block" }}> {order?.orderItems?.[0]?.type == "appointment"
                                                                                ? "Appointments"
                                                                                : "Total Tickets"}</strong>
                                                                            <span style={{ width: "10px", display: "inline-block", fontWeight: "bold" }}>:</span>
                                                                            {totalTickets}
                                                                        </p>

                                                                        <p className="time m-0 p-0">
                                                                            <strong style={{ width: "70px", display: "inline-block" }}> Amount</strong>
                                                                            <span style={{ width: "10px", display: "inline-block", fontWeight: "bold" }}>:</span>
                                                                            {currencySymbol}{" "}{order.grand_total}
                                                                        </p>

                                                                    </div>


                                                                    <p className="time d-inline-block m-0 p-0">
                                                                        <i className="bi bi-calendar-week me-1"></i>
                                                                        <strong style={{ width: "70px", display: "inline-block" }}>Start Date</strong>
                                                                        <span style={{ width: "10px", display: "inline-block", fontWeight: "bold" }}>:</span>
                                                                        {order?.event?.date_from
                                                                            ? format(new Date(order.event.date_from), "EEE, dd MMM yyyy | hh:mm a")
                                                                            : "N/A"}
                                                                        {/* Wed, 17 Sep 2025 | 12:00 AM */}
                                                                    </p>

                                                                    <p className="time m-0">
                                                                        <i className="bi bi-calendar-week me-1"></i>
                                                                        <strong style={{ width: "70px", display: "inline-block" }}>End Date</strong>
                                                                        <span style={{ width: "10px", display: "inline-block", fontWeight: "bold" }}>:</span>
                                                                        {order?.event?.date_to
                                                                            ? format(new Date(order.event.date_to), "EEE, dd MMM yyyy | hh:mm a")
                                                                            : "N/A"}
                                                                        {/* Thu, 18 Sep 2025 | 11:00 PM */}
                                                                    </p>

                                                                    <span className="d-block">@ {order?.event?.location}</span>
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
                                        alt=""
                                        style={{ width: "120px", opacity: 0.6 }}
                                    />
                                    <div className="mt-2 fw-bold text-muted">No Orders Found</div>
                                </div>

                            )}

                        </div>

                        <div className="paginator col-sm-12">
                            <ul className="pagination justify-content-center">
                                <li className="prev disabled">
                                    <Link href="/"><i className="bi bi-chevron-left"></i> Previous</Link>
                                </li>
                                <li className="next disabled">
                                    <Link href="/">Next <i className="bi bi-chevron-right"></i></Link>
                                </li>
                            </ul>
                            <div className="text-center">
                                <p className="paginate_p text-14">
                                    Page 1 of 1, showing 2 record(s) out of 2 total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <FrontendFooter />
        </>
    )
}