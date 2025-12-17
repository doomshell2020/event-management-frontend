import { loadStripe } from "@stripe/stripe-js";
import { Button, Col, Row, Modal } from "react-bootstrap";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import CheckoutForm from "./CheckoutForm";
import api from "@/utils/api";
import { useCart } from "@/shared/layout-components/layout/CartContext";

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
  const { cart, eventData } = useCart();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const intentCreatedRef = useRef(false);

  /* Event & Currency */
  const currencySymbol = eventData?.currencyName?.Currency_symbol || "₹";
  const currencyName =
    (eventData?.currencyName?.Currency || "INR").toLowerCase();
  const eventName = eventData?.name || "Unknown Event";
  const eventImage = eventData?.feat_image || "";

  /* Cart Data */
  const cartData = useMemo(() => {
    return cart.map((item) => {
      const idMap = {
        ticket: item.ticket_id,
        addon: item.addon_id,
        package: item.package_id,
      };

      return {
        ticketType: item.item_type,
        ticketId: idMap[item.item_type] || item.id,
        quantity: item.count || 1,
        price: roundAmount(item.ticket_price),
      };
    });
  }, [cart]);

  /* Fetch User */
  const fetchMemberProfile = useCallback(async () => {
    const token = Cookies.get("userAuthToken");
    if (!token) {
      router.push("/login");
      return null;
    }

    try {
      const { data } = await api.get("/api/v1/auth/me");
      return data?.success ? data.data : null;
    } catch {
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

        const user = await fetchMemberProfile();
        if (!user?.id) throw new Error("User not found");

        await api.post("/api/v1/payment/create-payment-intent", {
          user_id: user.id,
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
        <Button onClick={() => showNextStep(false)}>
          <i className="bi bi-arrow-left fs-4"></i>
        </Button>

        <Button
          onClick={handleModalClose}
          className="btn-close ms-auto"
          variant=""
        >
          <i className="bi bi-x-lg"></i>
        </Button>
      </Modal.Header>

      <Modal.Body className="px-3 care-new-check-secnd care-accom-scd-flw">
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

        <div className="secon-flw">
          <Row className="mrgn-ck-x">
            <Col md={7} className="crt-pdng-x">
              <div
                className="scd-hd-img monte-snd-bnr"
                style={{ backgroundImage: `url(${eventImage})` }}
              >
                <img
                  src="https://eboxtickets.com/images/eboxticket_dark_logo.png"
                  alt="Logo"
                />
              </div>
            </Col>

            <Col md={5} className="crt-pdng-x">
              <div className="scd-hd-cnt text-center">
                <h2 className="ck-mn-hd">{eventName}</h2>
              </div>
            </Col>
          </Row>
        </div>

        <div className="scnd-flw-amnts">
          <h3>YOUR TICKETS</h3>

          <Row className="align-items-end justify-content-between">
            <Col xl={5} md={6}>
              <div className="amnt-stl-inr">
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

            <Col xl={5} md={6}>
              <div className="amnt-stl-inr">
                <div className="tct-amt">
                  <p>TOTAL :</p>
                  <span>
                    {currencySymbol}
                    {roundAmount(sub_total).toLocaleString()}
                  </span>
                </div>

                <div className="tct-amt">
                  <p>TAXES & FEES :</p>
                  <span>
                    {currencySymbol}
                    {roundAmount(tax_total).toLocaleString()}
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="ttl-amts justify-content-between">
            <Col xl={5} md={6} />
            <Col xl={5} md={6}>
              <div className="tct-amt">
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
