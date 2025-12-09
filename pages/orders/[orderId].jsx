import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import { format } from "date-fns"; // helps format dates
import Swal from "sweetalert2";

export default function MyOrdersDetails({ userId }) {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const router = useRouter();
    const { orderId } = router.query;
    const [orderData, setOrderData] = useState({});
    const [loading, setLoading] = useState(true); // ✅ Added loading state
    const fetchOrders = async () => {
        setLoading(true); // start loading
        try {
            const res = await api.get(`/api/v1/orders/details/${orderId}`);
            if (res.data.success) {
                setOrderData(res.data.data || {});
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
        if (!orderId) return;
        fetchOrders();
    }, [orderId]);



    const handleCancelAppointment = async (order_id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently cancel the appointment.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, cancel it!",
        });
        if (!result.isConfirmed) return;
        try {
            Swal.fire({
                title: "Canceling...",
                text: "Please wait while the appointment is being cancelled.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            const response = await api.put(`/api/v1/orders/cancel-appointment/${order_id}`);
            const resData = response.data;
            if (resData?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Cancelled!",
                    text: "The appointment has been cancelled successfully.",
                    // timer: 1500,
                    // showConfirmButton: false,
                });

                // ✅ Refresh your event list
                fetchOrders();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: resData?.message || "Failed to cancel the appointment.",
                });
            }
        } catch (error) {
            console.error("Cancel error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again later.",
            });
        }
    };

    // date format AM-PM
    function formatTime(timeString) {
        if (!timeString) return "";
        const [hour, minute] = timeString.split(":");
        const date = new Date();
        date.setHours(hour, minute);

        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }




    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            <section id="my-ticket-module">
                <div className="container">
                    <div className="section-heading">
                        <h1>Orders</h1>
                        <h2 className="mt-4">Order Details</h2>
                        {/* <p className="text-center text-14">Here you can manage your Orders</p> */}
                    </div>
                    {loading ? (
                        <div className="col-12 text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <div className="mt-2">Loading orders...</div>
                        </div>
                    ) : (
                        <div className="my-ticketcontainer py-4">
                            <div className="row g-4">

                                {/* LEFT IMAGE SECTION */}
                                <div className="col-lg-4 col-md-5">
                                    <div className="border rounded overflow-hidden">
                                        <img
                                            src={
                                                orderData?.event?.feat_image_url
                                                    ? orderData.event.feat_image_url
                                                    : "/assets/front-images/my-tacket-section.jpg"
                                            }
                                            alt="Event"
                                            className="w-100"
                                            style={{ height: "280px", objectFit: "cover" }}
                                        />
                                    </div>
                                </div>

                                {/* RIGHT DETAILS SECTION */}
                                <div className="col-lg-8 col-md-7">
                                    <h2 className="fw-bold m-0">{orderData?.event?.name}</h2>
                                    <div className="text-muted mb-3">Hosted By <a href="#"> #{orderData?.event?.companyInfo?.name || 'Company'}</a></div>
                                    {/* BLUE TOP BAR */}
                                    <div className="row text-white p-3 rounded mb-4" style={{ background: "#3d6db5" }}>
                                        <div className="col-md-4 border-end">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-calendar-week me-2"></i>
                                                <div>
                                                    <strong>Start Date</strong>
                                                    <div> {orderData?.event?.date_from
                                                        ? format(new Date(orderData?.event.date_from), "EEE, dd MMM yyyy | hh:mm a")
                                                        : "N/A"}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 border-end">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-calendar-week me-2"></i>
                                                <div>
                                                    <strong>End Date</strong>
                                                    {/* <div>Wed 01st Jan, 2025 | 05:00 PM</div> */}
                                                    <div> {orderData?.event?.date_to
                                                        ? format(new Date(orderData?.event.date_to), "EEE, dd MMM yyyy | hh:mm a")
                                                        : "N/A"}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-geo-alt me-2"></i>
                                                <div>
                                                    <strong>Location</strong>
                                                    <div>{orderData?.event?.location}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TICKETS SECTION */}
                                    <h5 className="fw-bold">Tickets</h5>
                                    <div className="text-muted mb-3" style={{ fontSize: "14px" }}>
                                        You have to name all your tickets below before you can print or download them.
                                    </div>

                                    {orderData?.orderItems?.map((item, index) => {
                                        // Detect Type
                                        const isTicket = item.type === "ticket_price";
                                        const isAppointment = item.type === "appointment";

                                        // Ticket Type Text
                                        const ticketType = isTicket
                                            ? item.slot?.slot_name || "Ticket"
                                            : isAppointment
                                                ? item.appointment?.wellnessList?.name || "Appointment"
                                                : "N/A";

                                        // Purchase Date
                                        const purchaseDate = orderData?.createdAt
                                            ? format(new Date(orderData.createdAt), "EEE, dd MMM yyyy | hh:mm a")
                                            : "N/A";

                                        // Location
                                        const location = isTicket
                                            ? orderData?.event?.location
                                            : item.appointment?.wellnessList?.location || "N/A";

                                        // Date & Time
                                        const dateInfo = isTicket
                                            ? `${item.slot?.slot_date} | ${formatTime(item.slot?.start_time)} - ${formatTime(item.slot?.end_time)}`
                                            : `${item.appointment?.date} | ${formatTime(item.appointment?.slot_start_time)} - ${formatTime(item.appointment?.slot_end_time)}`;


                                        return (
                                            <div key={item.id} className="border rounded p-3 bg-light mb-4">

                                                {/* Ticket Type */}
                                                <div className="row mb-2">
                                                    <div className="col-4 fw-bold">Order ID :</div>
                                                    <div className="col-8">{orderData.order_uid}</div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-4 fw-bold">Ticket Type :</div>
                                                    <div className="col-8">{ticketType}</div>
                                                </div>

                                                {/* Purchase Date */}
                                                <div className="row mb-2">
                                                    <div className="col-4 fw-bold">Purchase Date :</div>
                                                    <div className="col-8">{purchaseDate}</div>
                                                </div>

                                                {/* Slot / Appointment Date */}
                                                <div className="row mb-2">
                                                    <div className="col-4 fw-bold">Date & Time :</div>
                                                    <div className="col-8">{dateInfo}</div>
                                                </div>

                                                {/* Location */}
                                                <div className="row mb-2">
                                                    <div className="col-4 fw-bold">Location :</div>
                                                    <div className="col-8">{location}</div>
                                                </div>

                                                {/* QR Image */}
                                                {item.qr_image_url && (
                                                    <div className="row mb-3">
                                                        <div className="col-4 fw-bold">QR Code :</div>
                                                        <div className="col-8">
                                                            <img
                                                                src={item.qr_image_url}
                                                                alt="QR"
                                                                style={{ width: "120px", border: "1px solid #ccc", padding: "4px", borderRadius: "6px" }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Ticket Holder Name */}
                                                <div className="row mb-3">
                                                    <div className="col-4 fw-bold">Ticket Holder Name :</div>
                                                    <div className="col-8">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            defaultValue={item.holder_name || ""}
                                                            placeholder="Enter Ticket Holder Name"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Buttons */}
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button className="btn btn-success" disabled>Print Ticket</button>
                                                    <button className="btn btn-primary" disabled>Save Name</button>
                                                    {item?.type === "appointment" && (
                                                        <button
                                                            className="btn btn-danger"
                                                            disabled={item.cancel_status === "cancel"} // If already cancelled → disable
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (item.cancel_status !== "cancel") {
                                                                    handleCancelAppointment(item.id);
                                                                }
                                                            }}
                                                        >
                                                            {item.cancel_status === "cancel"
                                                                ? "Cancelled"
                                                                : "Cancel Appointment"}
                                                        </button>
                                                    )}

                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <FrontendFooter />
        </>
    )
}