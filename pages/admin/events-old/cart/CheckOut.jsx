import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { Button, Col, Row, Modal, Form } from "react-bootstrap";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import CheckoutForm from "./CheckoutForm";

export default function CheckOutComponents({
    userId,
    eventId,
    handleModalClose,
    showNextStep,
    couponDetails,
    adminFees,
}) {
    let stripePromise;
    if (userId == 10272) {
        stripePromise = loadStripe(process.env.STRIPE_DEV_PUBLIC_KEY);
    } else {
        stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);
    }

    const [isLoading, setIsLoading] = useState(true);
    const [clientSecret, setClientSecret] = useState("");
    const [cart, setCart] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState("");
    const [currencyName, setCurrencyName] = useState("");
    const [eventImage, setEventImage] = useState(null);
    // console.log(">>>>>>>>>", eventImage);

    // Loading Component
    const LoadingComponent = ({ isActive }) =>
        isActive && (
            <div
                style={{
                    display: "flex",
                    background: "rgba(255, 255, 255, 0.7)",
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    top: 0,
                    zIndex: 9998,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span
                    className="fas fa-spinner fa-3x fa-spin"
                    style={{ color: "black" }}
                />
            </div>
        );

    // Fetch Cart Details
    const fetchCartDetails = useCallback(async () => {
        try {
            setIsLoading(false);
            true;
            const { data } = await axios.get(`/api/v1/front/cart?userId=${userId}`);
            setCart(data?.data || []);

            // Check if cart data is available and set currency symbol
            if (data?.data && data?.data[0]?.Event?.Currency?.Currency_symbol) {
                setCurrencySymbol(data.data[0].Event.Currency.Currency_symbol);
                setCurrencyName(data.data[0].Event.Currency.Currency);
                setEventImage(data.data[0].Event.ImageURL);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Failed to fetch cart details:", error);
        }
    }, [userId]);

    // Calculate totals
    const calculateTotals = useCallback(
        (cartItems, discountAmt) => {
            const totalPrice = cartItems.reduce((total, item) => {
                const price =
                    item.ticket_type === "ticket"
                        ? item.EventTicketType?.price || 0
                        : item.Addon?.price || 0;
                return total + price * item.no_tickets;
            }, 0);

            const finalPriceAfterDiscount = totalPrice - (discountAmt || 0);
            const taxes = finalPriceAfterDiscount * (adminFees / 100);
            const finalPrice = Math.round(finalPriceAfterDiscount + taxes);

            return {
                totalPrice,
                finalPriceAfterDiscount,
                taxes,
                finalPrice,
            };
        },
        [adminFees]
    );

    const { finalPriceAfterDiscount, taxes, finalPrice } = calculateTotals(
        cart,
        couponDetails?.discountAmt
    );

    // Fetch Member Profile
    const fetchMemberProfile = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/v1/front/users?id=${userId}`);
            return data?.data || null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    }, [userId]);

    // Fetch Client Secret
    useEffect(() => {
        if (finalPriceAfterDiscount > 0) {
            const fetchClientSecret = async () => {
                setIsLoading(true);
                try {
                    const user = await fetchMemberProfile();
                    if (!user) return;
                    // console.log("payment intent");
                    const { data } = await axios.post("/api/v1/create-payment-intent", {
                        userId,
                        eventId,
                        amount: finalPrice,
                        currency: currencyName, // Change currency to USD
                        name: `${user.FirstName} ${user.LastName}`,
                        email: user.Email,
                        couponDetails,
                        adminFees,
                        cart
                    });

                    setClientSecret(data.clientSecret);
                } catch (error) {
                    console.error("Error creating payment intent:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchClientSecret();
        }
    }, [
        finalPriceAfterDiscount,
        userId,
        eventId,
        finalPrice,
        couponDetails,
        adminFees,
        fetchMemberProfile,
    ]);

    // Fetch cart details on component mount
    useEffect(() => {
        fetchCartDetails();
    }, [fetchCartDetails]);

    return (
        <>
            <Modal.Header>
                <Button onClick={() => showNextStep(false)}>
                    <img
                        alt=""
                        className="wd-25"
                        src={`/assets/img/front-images/caryes-ticket-lft-arow.png`}
                    />
                </Button>

                <Button
                    onClick={handleModalClose}
                    className="btn-close ms-auto"
                    variant=""
                >
                    x
                </Button>
            </Modal.Header>

            <Modal.Body className="px-3 care-new-check-secnd">
                <>
                    <LoadingComponent isActive={isLoading} />

                    <div className="secon-flw">
                        <Row>
                            <Col md={4}>
                                <div
                                    className="scd-hd-img monte-snd-bnr"
                                    style={{
                                        background: `url(/uploads/profiles/${eventImage && eventImage ? eventImage : "no-image-1.png"
                                            })`,
                                    }}
                                >
                                    <h2>
                                        O<span>x</span>MONTENEGRO
                                    </h2>
                                </div>
                            </Col>
                            <Col md={8}>
                                <div className="scd-hd-cnt">
                                    <div>
                                        <h2 className="ck-mn-hd">
                                            eboxtickets <span className="pk-clr">x </span>
                                            <span className="ddt">MONTENEGRO 2025</span>
                                        </h2>

                                        <p>JULY 3 - 6, 2025</p>
                                        {/* <h5>
                      THE COLLECTIVE SYMPHONY, a journey of sounds, waves and
                      frequencies.
                    </h5> */}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div className="scnd-flw-amnts">
                        <h3>YOUR TICKETS</h3>

                        <Row className="align-items-end justify-content-between">
                            {/* tickets name with price  */}
                            <Col xl={5} md={6}>
                                <div className="amnt-stl-inr">
                                    {cart &&
                                        cart.map((element, index) => {
                                            return (
                                                <div className="tct-amt" key={index}>
                                                    <p>
                                                        {element.no_tickets}x{" "}
                                                        <span className="stp2-monte25-nm">
                                                            {element.ticket_type == "ticket" &&
                                                                element.EventTicketType
                                                                ? element.EventTicketType.title
                                                                : element.Addon
                                                                    ? element.Addon.name
                                                                    : "Unknown"}
                                                        </span>
                                                    </p>
                                                    <span className="stp2-monte25-nm">
                                                        {" "}
                                                        {currencySymbol}
                                                        {element.ticket_type == "ticket" &&
                                                            element.EventTicketType
                                                            ? (
                                                                element.EventTicketType.price *
                                                                element.no_tickets
                                                            ).toLocaleString()
                                                            : element.ticket_type == "addon" && element.Addon
                                                                ? (
                                                                    element.Addon.price * element.no_tickets
                                                                ).toLocaleString()
                                                                : 0}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </Col>

                            {/* total ticket price and taxes */}
                            <Col xl={5} md={6}>
                                <div className="amnt-stl-inr">
                                    <div className="tct-amt">
                                        <p>TICKETS: </p>
                                        <span>
                                            {currencySymbol}
                                            {cart
                                                .reduce((total, item) => {
                                                    const price =
                                                        item.ticket_type === "ticket"
                                                            ? item.EventTicketType?.price || 0
                                                            : item.Addon?.price || 0;
                                                    return total + price * item.no_tickets;
                                                }, 0)
                                                .toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="tct-amt">
                                        <p>TAXES & FEES ({adminFees}%):</p>{" "}
                                        <span>
                                            {currencySymbol}
                                            {Math.round(taxes).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Total Price */}
                        <Row className="ttl-amts justify-content-between">
                            <Col xl={5} md={6} />
                            <Col xl={5} md={6}>
                                {couponDetails && (
                                    <div className="tct-amt">
                                        <p>STAFF ID:</p>{" "}
                                        <span>
                                            {couponDetails.discount_type === "percentage"
                                                ? `- ${Math.floor(couponDetails.discount_value)}%`
                                                : `- ${currencySymbol}${couponDetails.discountAmt}`}
                                        </span>
                                    </div>
                                )}
                                <div className="tct-amt">
                                    <p>TOTAL:</p>{" "}
                                    <p>
                                        {currencySymbol}
                                        {finalPrice}
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {clientSecret && (
                        <CheckoutForm
                            clientSecret={clientSecret}
                            stripePromise={stripePromise}
                            userId={userId}
                            showNextStep={showNextStep}
                            finalPriceAfterDiscount={finalPriceAfterDiscount}
                        />
                    )}
                </>
            </Modal.Body>
        </>
    );
}
