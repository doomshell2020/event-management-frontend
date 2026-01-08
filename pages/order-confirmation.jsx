import React from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";

const OrderConfirmationPage = () => {
  const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section
        id="order-confirmation"
        style={{
        //   padding: "90px 0",
          background:
            "linear-gradient(180deg, #f9fafb 0%, #eef2ff 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center"
        }}
      >
        <div className="container" style={{ maxWidth: "1100px" }}>
          <div
            style={{
              maxWidth: "620px",
              margin: "0 auto",
              backgroundColor: "#ffffff",
              padding: "48px 36px",
              borderRadius: "18px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
              textAlign: "center",
              position: "relative"
            }}
          >
            {/* Success Icon */}
            <div
              style={{
                width: "72px",
                height: "72px",
                margin: "0 auto 24px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "34px",
                fontWeight: "700",
                boxShadow: "0 10px 25px rgba(22,163,74,0.4)"
              }}
            >
              ✓
            </div>

            <h1
              style={{
                fontSize: "30px",
                fontWeight: "800",
                marginBottom: "10px",
                color: "#0f172a"
              }}
            >
              Order Confirmed!
            </h1>

            <h2
              style={{
                fontSize: "18px",
                fontWeight: "500",
                marginBottom: "18px",
                color: "#16a34a"
              }}
            >
              Payment Successful 🎉
            </h2>

            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "#475569",
                marginBottom: "30px"
              }}
            >
              Thank you for your purchase. We’ve emailed your ticket and
              order details. You can access your tickets anytime from
              your dashboard.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                justifyContent: "center",
                flexWrap: "wrap"
              }}
            >
              <a
                href="/orders"
                style={{
                  padding: "14px 26px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
                  transition: "all 0.3s ease"
                }}
              >
                🎟 View My Orders
              </a>

              <a
                href="/"
                style={{
                  padding: "14px 26px",
                  borderRadius: "10px",
                  backgroundColor: "#ffffff",
                  color: "#2563eb",
                  border: "1px solid #2563eb",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
              >
                ⬅ Back to Home
              </a>
            </div>

            {/* Footer note */}
            <p
              style={{
                marginTop: "28px",
                fontSize: "13px",
                color: "#94a3b8"
              }}
            >
              Need help? Contact our support team anytime.
            </p>
          </div>
        </div>
      </section>

      <FrontendFooter />
    </>
  );
};

export default OrderConfirmationPage;
