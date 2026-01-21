import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { Button, Col, Row, Modal, Form } from "react-bootstrap";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import CheckoutForm from "./CheckoutForm";
import api from "@/utils/api";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
export default function CheckOutComponents({
    // userId,
    eventId,
    handleModalClose,
    showNextStep,
    adminFees,
    donationFees,
    taxesInfo,
    taxApplied,
    eventImage,
    eventName,
    couponDetails
}) {



    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [clientSecret, setClientSecret] = useState("");
    const [cart, setCart] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState("");
    const [currencyName, setCurrencyName] = useState("");
    const [ticketingFeeDetails, setTicketingFeeDetails] = useState();
    const router = useRouter();
    const roundAmount = (val) => Math.round(Number(val) || 0);


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

    const fetchCartDetails = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data } = await api.get(`/api/v1/cart/appointment-list?event_id=${eventId}`);
            const cartData = data?.data || [];
            setCart(cartData);
            // const event = cartData[0]?.Event;
            // const currency = event?.Currency;
            // if (currency?.Currency_symbol) {
            setCurrencySymbol(cartData[0]?.currency_symbol);
            setCurrencyName(cartData[0]?.currencyName);
            // }
            // Directly use the passed taxesInfo prop
            const {
                ticket_platform_fee_percentage = 0,
                ticket_stripe_fee_percentage = 0,
                ticket_bank_fee_percentage = 0,
                ticket_processing_fee_percentage = 0
            } = taxesInfo || {};

            setTicketingFeeDetails({
                ticket_platform_fee_percentage: parseFloat(ticket_platform_fee_percentage),
                ticket_stripe_fee_percentage: parseFloat(ticket_stripe_fee_percentage),
                ticket_bank_fee_percentage: parseFloat(ticket_bank_fee_percentage),
                ticket_processing_fee_percentage: parseFloat(ticket_processing_fee_percentage),
            });

        } catch (error) {
            console.error("Failed to fetch cart details:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, taxesInfo]);

    function formatSmartPrice(amount) {
        if (isNaN(amount)) return "Invalid amount";

        const isInteger = Number(amount) % 1 == 0;
        const formatted = isInteger
            ? Number(amount).toLocaleString()               // No decimals
            : Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return formatted;
    }

    const roundWithThreshold = (amount, threshold = 0.40) => {
        const floor = Math.floor(amount);
        const decimal = amount - floor;
        return decimal >= threshold ? Math.ceil(amount) : floor;
    };

    const calculateTotalsV1 = ({
        cart = [],
        discountAmount = 0
    }) => {
        const round2 = (num) => Math.round(num * 100) / 100;

        let totalAppointmentPrice = 0;

        // Calculate appointment total
        cart.forEach(item => {
            if (item.item_type == "appointment") {
                const price = item.ticket_price || 0;
                totalAppointmentPrice += price * (item.count || 1);
            }
        });

        // Apply discount
        const discountedTotal = round2(
            Math.max(totalAppointmentPrice - discountAmount, 0)
        );

        // Admin fee (8%)
        const ADMIN_FEE_PERCENT = 8;
        // const adminFee = round2((discountedTotal * ADMIN_FEE_PERCENT) / 100);
        const adminFee = taxApplied == "Y" ? round2((discountedTotal * ADMIN_FEE_PERCENT) / 100) : 0;
        // Final amount
        const finalTotalAmount = round2(discountedTotal + adminFee);
        return {
            breakdown: {
                appointmentTotal: totalAppointmentPrice,
                discountAmount,
                totalAfterDiscount: discountedTotal,
                adminFeePercent: ADMIN_FEE_PERCENT,
                adminFee,
                totalTax: adminFee, // only admin fee is tax
                finalTotalAmount,
                payableAmount: finalTotalAmount
            }
        };
    };

    const {
        breakdown
    } = calculateTotalsV1({
        cart,
        discountAmount: couponDetails?.discountAmt,
        ticketingFeeDetails
    });

    const { ticketTotal, appointmentTotal, addonTotal, totalTicketAndAddonPrice, discountAmount, totalAfterDiscount, totalTax, finalTotalAmount, payableAmount } = breakdown;
    /////////////////////////////////Cart calculation End///////////////////////////////////

    // Fetch Member Profile
    const fetchMemberProfile = useCallback(async () => {
        try {
            const token = Cookies.get("userAuthToken");

            if (!token) {
                router.push("/login");
                return null;
            }
            // Token ke base par profile fetch
            const { data } = await api.get("api/v1/auth/me");
            if (data?.success) {
                setUserId(data.data.id)
                return data.data;
            } else {
                router.push("/login");
                return null;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            router.push("/login");
            return null;
        }
    }, []);


    // Fetch cart details on component mount
    useEffect(() => {
        fetchCartDetails();
    }, [fetchCartDetails]);
    const intentCreatedRef = useRef(false);

    useEffect(() => {
        if (
            intentCreatedRef.current ||   // 🔒 already created
            !cart.length ||
            finalTotalAmount <= 0
        ) {
            return;
        }

        const fetchClientSecret = async () => {
            setIsLoading(true);
            intentCreatedRef.current = true; // 🔒 lock immediately

            try {
                const user = await fetchMemberProfile();
                if (!user?.id) return;

                const payload = {
                    user_id: user.id,
                    event_id: eventId,
                    sub_total: appointmentTotal,
                    tax_total: totalTax,
                    grand_total: finalTotalAmount,
                    currency: currencyName || "usd",
                    discount_amount: discountAmount
                        ? roundAmount(discountAmount || 0)
                        : 0,

                    cartData: cart.map(item => ({
                        id: item.id,
                        ticketId: item.raw.appointments.id,
                        ticketType: item.item_type,
                        quantity: item.count,
                        price: Number(item.ticket_price),
                    })),
                };

                // only attach coupon if valid
                if (couponDetails?.code) {
                    payload.appliedCoupon = {
                        coupon_code: couponDetails.code,
                    };
                }

                const { data } = await api.post(
                    "/api/v1/payment/create-payment-intent",
                    payload
                );


                setClientSecret(data?.data?.clientSecret);
            } catch (error) {
                intentCreatedRef.current = false; // unlock on error
                console.error("❌ Error creating payment intent:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClientSecret();
    }, [finalTotalAmount]); // ❗ cart dependency REMOVED

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
                    className="btn-close ms-auto"
                    variant=""
                >
                    <i className="bi bi-x-lg"></i>
                </Button>
            </Modal.Header>

            <Modal.Body className="px-3 care-new-check-secnd care-accom-scd-flw">
                <>
                    <LoadingComponent isActive={isLoading} />

                    {/* <div className="secon-flw">
                        <Row className="mrgn-ck-x">
                            <Col md={7} className="crt-pdng-x">
                                <div
                                    className="scd-hd-img monte-snd-bnr"
                                    style={{
                                        backgroundImage: `url(${eventImage
                                            ? `${eventImage}`
                                            : `https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png`
                                            })`,
                                    }}

                                > 
                                <img src={`https://eboxtickets.com/images/eboxticket_dark_logo.png`} alt="Logo" />
                                </div>
                            </Col>
                            <Col md={5} className="crt-pdng-x">
                                <div className="scd-hd-cnt">
                                    <div className="text-center">
                                        <h2 className="ck-mn-hd">{eventName}</h2>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div> */}

                    <div className="scnd-flw-amnts">
                        {/* <h3>YOUR APPOINTMENTS</h3> */}

                        <Row className="align-items-end justify-content-between">
                            {/* total ticket price and taxes */}
                            <Col xl={5} md={6}>
                                <div className="amnt-stl-inr d-flex justify-content-between">
                                    <div className="tct-amt gap-2">
                                        <p>APPOINTMENTS: </p>
                                        <span>
                                            {currencySymbol}
                                            {cart
                                                .reduce((total, item) => {
                                                    const price =
                                                        item.item_type == "appointment"
                                                            ? item.ticket_price || 0
                                                            : 0;
                                                    return total + price * item.count;
                                                }, 0)
                                                .toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="tct-amt gap-2">
                                        <p>TAXES & FEES :</p>{" "}
                                        <span>
                                            {currencySymbol}
                                            {formatSmartPrice(totalTax)}
                                        </span>
                                    </div>
                                </div>
                            </Col>
                            <Col xl={5} md={6}>
                                <div className="amnt-stl-inr">
                                    <div className="tct-amt gap-2 d-flex">
                                        <p>TOTAL:</p>{" "}
                                        <span>
                                            {currencySymbol}
                                            {finalTotalAmount}
                                        </span>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Total Price */}
                        {/* <Row className="ttl-amts justify-content-between">
                            <Col xl={5} md={6} />
                            <Col xl={5} md={6}>
                                {couponDetails && (
                                    <div className="tct-amt mb-2">
                                        <p><strong>STAFF ID DISCOUNT:</strong></p>
                                        <span className="text-success">
                                            {couponDetails.discount_type === "percentage" ? (
                                                <>- {Math.floor(couponDetails.discount_value)}% ({currencySymbol}{formatSmartPrice(discountAmount)})</>
                                            ) : (
                                                <>
                                                    -{" "}
                                                    {currencySymbol || ""}
                                                    {formatSmartPrice(discountAmount)}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="tct-amt gap-2">
                                    <p>TOTAL:</p>{" "}
                                    <p>
                                        {currencySymbol}
                                        {finalTotalAmount}
                                    </p>
                                </div>
                            </Col>
                        </Row> */}
                    </div>

                    {clientSecret && (
                        <CheckoutForm
                            clientSecret={clientSecret}
                            // userId={userId}
                            showNextStep={showNextStep}
                            finalPriceAfterDiscount={finalTotalAmount}
                        />
                    )}
                </>
            </Modal.Body>
        </>
    );
}
