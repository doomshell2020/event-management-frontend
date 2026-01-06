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
    // console.log('orderData :', orderData);
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

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="my-ticket-module">
                <div className="container">
                    <div className="section-heading">
                        <h1>Orders</h1>
                        <h2 className="mt-4">Order Details</h2>
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
                                <div className="col-lg-4 col-md-5">
                                    <div className="border rounded overflow-hidden">
                                        <img
                                            src={
                                                orderData?.event?.feat_image_url ||
                                                "/assets/front-images/my-tacket-section.jpg"
                                            }
                                            alt="Event"
                                            className="w-100"
                                            style={{
                                                height: "280px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* RIGHT DETAILS */}
                                <OrderDetails
                                    orderData={orderData}
                                    handleCancelAppointment={handleCancelAppointment}
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
