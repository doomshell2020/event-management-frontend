import React, { useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
const OrderConfirmationPage = () => {
    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section
                id="order-confirmation"
                style={{
                    padding: "80px 0",
                    backgroundColor: "#f9fafb",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center"
                }}
            >
                <div
                    className="container"
                    style={{
                        width: "100%",
                        maxWidth: "1100px",
                        margin: "0 auto",
                        padding: "0 16px"
                    }}
                >
                    <div
                        style={{
                            maxWidth: "600px",
                            margin: "0 auto",
                            backgroundColor: "#ffffff",
                            padding: "40px 30px",
                            borderRadius: "12px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                            textAlign: "center"
                        }}
                    >
                        {/* Success Icon */}
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                margin: "0 auto 20px",
                                borderRadius: "50%",
                                backgroundColor: "#16a34a",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "32px",
                                fontWeight: "bold"
                            }}
                        >
                            ✓
                        </div>

                        <h1
                            style={{
                                fontSize: "28px",
                                fontWeight: "700",
                                marginBottom: "8px",
                                color: "#111827"
                            }}
                        >
                            Thank You for Your Order!
                        </h1>

                        <h2
                            style={{
                                fontSize: "18px",
                                fontWeight: "500",
                                marginBottom: "16px",
                                color: "#16a34a"
                            }}
                        >
                            Your payment was successful 🎉
                        </h2>

                        <p
                            style={{
                                fontSize: "15px",
                                lineHeight: "1.6",
                                color: "#6b7280",
                                marginBottom: "24px"
                            }}
                        >
                            We’ve received your order and sent a confirmation email with all the
                            details. Please keep it for your records.
                        </p>

                        <div
                            style={{
                                backgroundColor: "#f3f4f6",
                                padding: "16px",
                                borderRadius: "8px",
                                marginBottom: "28px",
                                fontSize: "14px",
                                color: "#374151"
                            }}
                        >
                            <p style={{ margin: "4px 0" }}>
                                <strong>Order ID:</strong> #ORD-123456
                            </p>
                            <p style={{ margin: "4px 0" }}>
                                <strong>Payment Status:</strong> Paid
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "center",
                                flexWrap: "wrap"
                            }}
                        >
                            <a
                                href="/orders"
                                style={{
                                    padding: "12px 22px",
                                    borderRadius: "8px",
                                    backgroundColor: "#2563eb",
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    fontWeight: "500"
                                }}
                            >
                                View My Tickets
                            </a>

                            <a
                                href="/"
                                style={{
                                    padding: "12px 22px",
                                    borderRadius: "8px",
                                    backgroundColor: "#ffffff",
                                    color: "#2563eb",
                                    border: "1px solid #2563eb",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    fontWeight: "500"
                                }}
                            >
                                Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </section>


            <FrontendFooter />
        </>
    );
};

export default OrderConfirmationPage;
