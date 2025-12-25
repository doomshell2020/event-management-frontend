import { loadStripe } from "@stripe/stripe-js";
import { Button, Col, Row, Modal } from "react-bootstrap";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import CheckoutForm from "./CheckoutForm";
import api from "@/utils/api";
import { useCart } from "@/shared/layout-components/layout/CartContext";
import { useAuth } from "@/shared/layout-components/layout/AuthContext";

/* Stripe Init */
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

/* Round Helper */
const roundAmount = (val) => Math.round(Number(val) || 0);

export default function CheckOutComponents({
  eventId,
  handleModalClose,
  showNextStep,
  couponDetails,
  tax_total,
  grand_total,
  sub_total,
}) {
  const { cart, eventData, loginUserId } = useCart();

  const router = useRouter();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const intentCreatedRef = useRef(false);

  /* Event & Currency */
  const currencySymbol = eventData?.currencyName?.Currency_symbol || "₹";
  const currencyName = (eventData?.currencyName?.Currency || "INR").toLowerCase();
  const eventName = eventData?.name || "Unknown Event";
  const eventImage = eventData?.feat_image || "";

  /* Cart Data */
  const cartData = useMemo(() => {
    return cart.map((item) => ({
      id: item.id,                 // cart row id
      uniqueId: item.uniqueId,     // actual ticket/package/addon id
      ticketType: item.item_type,  // ticket | addon | package
      ticketId: item.uniqueId,     // backend expects this as real item id
      quantity: item.count || 1,
      price: roundAmount(item.ticket_price),
    }));
  }, [cart]);


  /* Fetch User */
  const fetchMemberProfile = useCallback(async () => {
    const token = Cookies.get("userAuthToken");
    if (!token || !loginUserId) {
      router.push("/login");
      return null;
    }
  }, [router]);

  /* Create Payment Intent (ONE TIME) */
  useEffect(() => {
    if (
      intentCreatedRef.current ||
      !cart.length ||
      roundAmount(grand_total) <= 0 ||
      !eventId
    ) {
      return;
    }

    const createIntent = async () => {
      try {
        setIsLoading(true);
        intentCreatedRef.current = true;

        await fetchMemberProfile();
        if (!loginUserId) throw new Error("User not found");

        await api.post("/api/v1/payment/create-payment-intent", {
          user_id: loginUserId,
          event_id: eventId,
          sub_total: roundAmount(sub_total),
          tax_total: roundAmount(tax_total),
          grand_total: roundAmount(grand_total),
          currency: currencyName,
          discount_amount: 0,
          cartData,
        }).then(res => {
          setClientSecret(res?.data?.data?.clientSecret);
        });
      } catch (err) {
        intentCreatedRef.current = false;
        console.error("Payment intent error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [eventId]);

  return (
    <>
      <Modal.Header>
        {/* BACK BUTTON (ICON) */}
        <Button
          className="p-0 paynow-back"
          onClick={() => showNextStep(false)}
        >
          <i className="bi bi-arrow-left fs-4"></i>
        </Button>

        <Button
          onClick={handleModalClose}
          className="btn-close ms-auto py-0 ps-0 paynow-close d-flex justify-content-center align-items-center"
          variant=""
        >
          <i className="bi bi-x-lg"></i>
        </Button>
      </Modal.Header>

      <Modal.Body className="py-3 px-0 care-new-check-secnd care-accom-scd-flw paynow-mdl-container mb-0">
        {isLoading && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(255,255,255,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <span className="fas fa-spinner fa-3x fa-spin" />
          </div>
        )}

        <div className="secon-flw paynow-mdl-rowbox rounded-0">
          <Row className="g-0">
            <Col md={6}>
              <div
                className="scd-hd-img pay-now-leftimg rounded-0"
                style={{ backgroundImage: `url(${eventImage})` }}
              >
                <img
                  src="https://eboxtickets.com/images/eboxticket_dark_logo.png"
                  alt="Logo"
                />
              </div>
            </Col>

            <Col md={6}>
              <div className="scd-hd-cnt text-center paynow-titlesec">
                <h2 className="ck-mn-hd">{eventName}</h2>
              </div>
            </Col>
          </Row>
        </div>

        <div className="scnd-flw-amnts paynow-amout-flow mb-0">
          <h3>YOUR TICKETS</h3>

          <Row className="align-items-end justify-content-between">
            <Col md={12}>
              <div className="amnt-stl-inr amout-first-row">
                {cart.map((el, i) => (
                  <div className="tct-amt" key={i}>
                    <p>
                      {el.count}x{" "}
                      <span className="stp2-monte25-nm">
                        {el.display_name || "Unknown Item"}
                      </span>
                    </p>
                    <span className="stp2-monte25-nm">
                      {currencySymbol}
                      {roundAmount(el.ticket_price * el.count).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Col>

            <Col md={12}>
              <div className="amnt-stl-inr pt-4">
                <div className="tct-amt">
                  <p>TOTAL :</p>
                  <span>
                    {currencySymbol}
                    {roundAmount(sub_total).toLocaleString()}
                  </span>
                </div>

                <div className="tct-amt mb-2">
                  <p>TAXES & FEES :</p>
                  <span>
                    {currencySymbol}
                    {roundAmount(tax_total).toLocaleString()}
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="ttl-amts justify-content-between border-0">
            <Col md={12}>
              <div className="tct-amt amount-last-row">
                <p>TOTAL:</p>
                <p>
                  {currencySymbol}
                  {roundAmount(grand_total).toLocaleString()}
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {clientSecret && (
          <CheckoutForm
            clientSecret={clientSecret}
            showNextStep={showNextStep}
            finalPriceAfterDiscount={roundAmount(grand_total)}
          />
        )}
      </Modal.Body>
    </>
  );
}
