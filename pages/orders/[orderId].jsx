import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Swal from "sweetalert2";
import OrderDetails from "../components/OrderDetails/OrderDetails";

export default function MyOrdersDetails() {
    const router = useRouter();
    const { orderId } = router.query;

    const [backgroundImage] = useState(
        "/assets/front-images/about-slider_bg.jpg"
    );

    const [orderData, setOrderData] = useState(null);
    // console.log("orderData---",orderData)
    const [baseUrls, setBaseUrls] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        if (!orderId) return;

        setLoading(true);
        try {
            const res = await api.get(`/api/v1/orders/details/${orderId}`);
            if (res.data?.success) {
                setBaseUrls(res.data.base_urls);
                setOrderData(res.data.data);
            } else {
                setOrderData(null);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            setOrderData(null);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrders();
    }, [orderId]);

    const handleCancelAppointment = async (order_item_id) => {
        // console.log("order_item_id",order_item_id)
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently cancel the appointment.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, cancel it!",
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Canceling...",
                text: "Please wait",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await api.put(
                `/api/v1/orders/cancel-appointment/${order_item_id}`
            );

            if (response.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Cancelled",
                    text: "Appointment cancelled successfully.",
                });

                fetchOrders(); // 🔄 refresh
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data?.message || "Cancellation failed.",
                });
            }
        } catch (error) {
            console.error("Cancel error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again.",
            });
        }
    };

    const handleSendCancelRequest = async (order_item_id, event) => {
        const { refund_allowed, refund_deadline, date_from, cancellation_policy } = event;
        if (refund_allowed !== "Y") {
            return Swal.fire({
                icon: "error",
                title: "Not Allowed",
                text: "You cannot cancel this ticket. This event does not allow cancellations.",
            });
        }

        // 🛑 شرط 2: Deadline check
        const today = new Date();
        const eventDate = new Date(date_from);

        // last allowed cancel date = eventDate - refund_deadline days
        const lastCancelDate = new Date(eventDate);
        lastCancelDate.setDate(eventDate.getDate() - Number(refund_deadline));

        if (today > lastCancelDate) {
            return Swal.fire({
                icon: "error",
                title: "Deadline Passed",
                text: `Cancellation was allowed only before ${refund_deadline} days of the event.`,
            });
        }

        // ✅ Swal with policy + checkbox
        const result = await Swal.fire({
            title: "Send Cancellation Request?",
            icon: "warning",
            html: `
            <div style="text-align:left; max-height:150px; overflow:auto; margin-bottom:10px;">
                <b>Cancellation Policy</b><br/>
                ${cancellation_policy || "No policy available"}<br/><br/>

                <b>Important Info</b><br/>
                • Cancellation allowed before ${refund_deadline} days of event.<br/>
                • Refund allowed: ${refund_allowed === "Y" ? "Yes" : "No"}<br/><br/>

                <b>Terms & Conditions</b><br/>
                • Cancellation request will be reviewed by admin.<br/>
                • Refund will be processed as per policy.<br/>
                • Once approved, ticket will be cancelled permanently.
            </div>

            <div style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="acceptTerms"/>
                <label for="acceptTerms">I agree to the Terms & Conditions</label>
            </div>
        `,
            showCancelButton: true,
            confirmButtonText: "Send Request",
            focusConfirm: false,
            preConfirm: () => {
                const checkbox = document.getElementById("acceptTerms");
                if (!checkbox.checked) {
                    Swal.showValidationMessage("You must accept the Terms & Conditions");
                    return false;
                }
                return true;
            }
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Sending Request...",
                text: "Please wait",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await api.put(
                `/api/v1/orders/cancel-request/${order_item_id}`
            );

            if (response.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Request Sent",
                    text: "Your cancellation request has been sent successfully.",
                });

                fetchOrders();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data?.message || "Cancellation failed.",
                });
            }

        } catch (error) {
            console.error("Cancel error:", error);
            const apiErrorMsg =
                error.response?.data?.error?.message ||
                error.response?.data?.message ||
                error.message ||
                "Something went wrong. Try again.";
            Swal.fire("Error", apiErrorMsg, "error");
            // Swal.fire({
            //     icon: "error",
            //     title: "Error",
            //     text: "Something went wrong. Please try again.",
            // });
        }
    };


    const handleShowRejectReason = (reason) => {
        Swal.fire({
            icon: "info",
            title: "Request Not Approved",
            html: `
            <div style="font-size:14px; color:#374151;">
                <p>Your cancel request couldn’t be approved.</p>
                <p><strong>Reason:</strong> ${reason || "No specific reason provided."}</p>
            </div>
        `,
            confirmButtonText: "Got it",
            confirmButtonColor: "#2563eb"
        });
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="event-detail-page" className="pt-4 pt-lg-5">
                <div className="container">
                    <div className="section-heading">
                        <h1 className="mb-3 order-detail-title">Order Details</h1>
                        {/* <h2 className="mt-4"></h2> */}
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="col-12 text-center py-5">
                            <div className="spinner-border text-primary" />
                            <div className="mt-2">Loading Orders...</div>
                        </div>
                    )}

                    {/* NO DATA */}
                    {!loading && !orderData && (
                        <div className="text-center py-5">
                            <h5>No order details found.</h5>
                        </div>
                    )}

                    {/* DATA */}
                    {!loading && orderData && (
                        <div className="my-ticketcontainer py-4">
                            <div className="row g-4">

                                {/* LEFT IMAGE */}
                                <div className="col-md-5">
                                    <div className="ticker_img fadeInLeft position-sticky top-0">
                                        <div className="ticker_imgmn">
                                            <img
                                                src={
                                                    orderData?.event?.feat_image
                                                        ? `${baseUrls?.event_image_url}${orderData.event.feat_image}`
                                                        : "/assets/front-images/my-tacket-section.jpg"
                                                }
                                                alt="Event"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT DETAILS */}
                                <OrderDetails
                                    orderData={orderData}
                                    handleCancelAppointment={handleCancelAppointment}
                                    handleSendCancelRequest={handleSendCancelRequest}
                                    handleShowRejectReason={handleShowRejectReason}

                                    baseUrls={baseUrls}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <FrontendFooter />
        </>
    );
}
