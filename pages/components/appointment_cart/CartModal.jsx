import React, { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Col,
    Row,
    Spinner,
    InputGroup,
    Form,
} from "react-bootstrap";
import CheckOut from "./CheckOut";
import Image from "next/image";
import api from "@/utils/api";
import Swal from "sweetalert2"; // Import SweetAlert

// Loader Component
const LoadingComponent = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div
            style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.7)",
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "27px",
            }}
        >
            <span
                className="fas fa-spinner fa-3x fa-spin"
                style={{ color: "black" }}
            ></span>
        </div>
    );
};

export default function CartModal({ show, handleClose, eventId, slotIds }) {
    const [isLoading, setIsLoading] = useState(true);
    const [eventDetails, setEventDetails] = useState({});
    const [currency, setCurrency] = useState('');
    const [taxAppliedStatus, setTaxAppliedStatus] = useState('');
    const [eventName, setEventName] = useState('');
    const [eventImage, setEventImage] = useState('');

    const [cart, setCart] = useState([]);
    const [couponDetails, setCouponDetails] = useState("");
    const [ticketingFeeDetails, setTicketingFeeDetails] = useState();
    const [coupon, setCoupon] = useState("");
    const [adminFees, setAdminFees] = useState(8);
    const [showNextStep, setShowNextStep] = useState(false);
    // CART API FUNCTIONS
    const fetchCart = async (eventId) => {
        return await api.get(`/api/v1/cart/appointment-list?event_id=${eventId}`);
    };

    const addToCart = async (params) => {
        return await api.post(`/api/v1/cart/add`, params)
    }

    const clearCart = async () => {
        return await api.delete(`/api/v1/cart/clear`);
    };

    const [slotCart, setSlotCart] = useState({});

    useEffect(() => {
        if (!show) return;

        setIsLoading(true);

        const fetchDetails = async () => {
            try {
                // ⭐ STEP 1: Clear old cart first
                await clearCart();

                // STEP 2: Load event wellness appointments
                const res = await api.post(
                    `api/v2/events/${eventId}/wellness-appointments`,
                    { slotIds: slotIds }
                );
                const currencySymbol = res?.data?.data?.currencyName?.Currency_symbol || "$";
                // console.log("---res.data.data", currencySymbol);
                setCurrency(currencySymbol)
                setEventDetails(res.data.data);
                setTaxAppliedStatus(res.data?.data?.wellness?.[0].tax_applied);
                setEventName(res?.data?.data?.name)
                setEventImage(res?.data?.data?.feat_image)
                // STEP 3: Load fresh empty cart
                const cartRes = await fetchCart(eventId);
                const list = cartRes?.data?.data || [];
                setCart(list);

                // STEP 4: Build slotCart map (empty because cart cleared)
                let map = {};
                list.forEach((c) => {
                    if (c.item_type === "appointment") {
                        map[c.raw?.appointment_id] = {
                            cartId: c.id,
                            count: c.count
                        };
                    }
                });
                setSlotCart(map);

                // ⭐ STEP 5: Auto add all slotIds to cart now
                for (const id of slotIds) {
                    await addToCart({
                        event_id: eventId,
                        item_type: "appointment",
                        appointment_id: id,
                        count: 1
                    });
                }

                // STEP 6: Fetch updated cart after adding all slots
                const updated = await fetchCart(eventId);
                const updatedList = updated?.data?.data || [];
                setCart(updatedList);

                let updatedMap = {};
                updatedList.forEach((c) => {
                    if (c.item_type === "appointment") {
                        updatedMap[c.raw?.appointment_id] = {
                            cartId: c.id,
                            count: c.count
                        };
                    }
                });
                setSlotCart(updatedMap);

            } catch (error) {
                console.error("Error:", error);
            }

            setIsLoading(false);
        };

        fetchDetails();
    }, [show, eventId]);


    const currencySymbol = cart?.[0]?.currency_symbol || "";
    // tax_applied status
    const taxApplied = eventDetails?.wellness?.[0].tax_applied
    // Calculate Totals
    const totalTickets = cart.reduce((n, item) => n + item.count, 0);
    const priceTotal = cart.reduce(
        (n, item) => n + item.count * item.ticket_price,
        0
    );
    // const feeTotal = (priceTotal * adminFees) / 100;
    // If taxApplied = "Y" → apply admin fee  
    // If taxApplied = "N" → admin fee = 0
    const feeTotal = taxApplied === "Y" ? (priceTotal * adminFees) / 100 : 0;

    const finalTotal = priceTotal + feeTotal;


    const formatReadableDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };


    const formatTime = (timeString) => {
        if (!timeString) return "";

        let [hours, minutes] = timeString.split(":");

        hours = parseInt(hours);
        const suffix = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12; // Convert 0 -> 12, 13 -> 1

        return `${hours}:${minutes} ${suffix}`;
    };

    const handleFreeTicket = async () => {
        try {
            const data = {
                cart,
                couponDetails,
                adminFees,
            };
            // Encrypt the data
            const storedToken = localStorage.getItem("accessToken");
            const secretKey = process.env.DATA_ENCODE_SECRET_KEY;
            const encryptedData = CryptoJS.AES.encrypt(
                JSON.stringify(data),
                secretKey
            ).toString();

            Swal.fire({
                title: "Processing...",
                text: "Please wait while we create your ticket.",
                icon: "info",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await axios.post(
                `/api/v1/create-order`,
                { key: "free_ticket", data: encryptedData },
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // If the API response is successful
            if (response.data.success) {
                setShow(false);
                Swal.fire({
                    title: "Success!",
                    text: "Your free ticket has been created successfully!",
                    icon: "success",
                    showCancelButton: true,
                    confirmButtonText: "Okay",
                    cancelButtonText: "Go to My Ticket",
                    reverseButtons: true,
                }).then((result) => {
                    if (result.isConfirmed) {
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        navigate.push("/user/my-event");
                    }
                });
            } else {
                Swal.fire({
                    title: "Error!",
                    text: response.data.message || "Failed to create free ticket!",
                    icon: "error",
                    confirmButtonText: "Try Again",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error.message || "An unexpected error occurred!",
                icon: "error",
                confirmButtonText: "Try Again",
            });
        }
    };

    const [isBtnLoading, setIsBtnLoading] = useState(false);

    // purchase ticket button....._.
    const handlePurchase = async (event) => {
        event.preventDefault();
        setIsBtnLoading(true);
        setTimeout(() => {
            setShowNextStep(true);
            setIsBtnLoading(false);
        }, 1000);
    };


    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={true}
            dialogClassName="cart-modal-size appointment-model"
            className="careyes-chekout-new oxmonten2025EvntSec"
        >
            {!showNextStep ? (
                <>
                    <Modal.Header>
                        <Button onClick={handleClose} className="btn-close ms-auto">
                            ×
                        </Button>
                    </Modal.Header>
                    <Modal.Body className="px-3 care-new-check">
                        <LoadingComponent isActive={isLoading} />
                        {!isLoading && eventDetails && (
                            <form onSubmit={handlePurchase}>
                                <div className="checkout-innr">
                                    <Row className="gy-4">
                                        {/* LEFT SIDE */}
                                        <Col lg={8} className="men-innr-sec">
                                            <div className="checkot-lft">
                                                <div className="ck-event-dtl">
                                                    <div className="eventsBxSec">
                                                        <Row className="align-items-center gy-3 marginTpMinus4">
                                                            {eventDetails.wellness?.length > 0 && (
                                                                <div className="ticket-section">
                                                                    {eventDetails.wellness.map((w) => (
                                                                        <div key={w.id}>
                                                                            <h5
                                                                                style={{
                                                                                    fontSize: "18px",
                                                                                    fontWeight: 600,
                                                                                    marginBottom: "12px",
                                                                                }}
                                                                            >
                                                                                {w.name}
                                                                            </h5>

                                                                            {/* Card */}
                                                                            <div className="ticket-box p-3 border rounded shadow-sm">
                                                                                {w.wellnessSlots?.length > 0 ? (
                                                                                    w.wellnessSlots.map((slot) => (
                                                                                        <div
                                                                                            key={slot.id}
                                                                                            style={{
                                                                                                display: "flex",
                                                                                                alignItems: "center",
                                                                                                justifyContent: "space-between",
                                                                                                padding: "14px 16px",
                                                                                                marginBottom: "12px",
                                                                                                borderRadius: "8px",
                                                                                                border: "2px solid #198754",
                                                                                                backgroundColor: "rgba(25, 135, 84, 0.12)",
                                                                                            }}
                                                                                        >
                                                                                            {/* Left Side */}
                                                                                            <div
                                                                                                style={{
                                                                                                    display: "flex",
                                                                                                    alignItems: "center",
                                                                                                    gap: "14px",
                                                                                                }}
                                                                                            >
                                                                                                <span
                                                                                                    style={{
                                                                                                        width: "18px",
                                                                                                        height: "18px",
                                                                                                        borderRadius: "4px",
                                                                                                        backgroundColor: "#198754",
                                                                                                        display: "flex",
                                                                                                        alignItems: "center",
                                                                                                        justifyContent: "center",
                                                                                                        color: "#fff",
                                                                                                        fontSize: "12px",
                                                                                                        fontWeight: "bold",
                                                                                                    }}
                                                                                                >
                                                                                                    ✓
                                                                                                </span>

                                                                                                <span style={{ fontWeight: 600, fontSize: "15px" }}>
                                                                                                    <i className="bi bi-calendar me-1"></i>
                                                                                                    {formatReadableDate(slot.date)}
                                                                                                </span>

                                                                                                <span style={{ color: "#6c757d", fontSize: "14px" }}>
                                                                                                    <i className="bi bi-clock me-1"></i>
                                                                                                    {formatTime(slot.slot_start_time)} –{" "}
                                                                                                    {formatTime(slot.slot_end_time)}
                                                                                                </span>
                                                                                            </div>

                                                                                            {/* Price */}
                                                                                            <div style={{ fontWeight: 600, fontSize: "16px" }}>
                                                                                                {currency} {slot.price}
                                                                                            </div>
                                                                                        </div>
                                                                                    ))
                                                                                ) : (
                                                                                    <p style={{ color: "#6c757d" }}>No slots available</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </Row>
                                                    </div>
                                                </div>

                                                {/* --------------------------------------------WELLNESS APPOINTMENTS + SLOTS (Grouped)----------------------------------------------- */}

                                            </div>
                                        </Col>

                                        {/* RIGHT SIDE (CART SUMMARY) */}
                                        <Col lg={4} className="crys-accomo-rgt men-innr-sec monten25-rgt-pnl">
                                            <div className="checkot-rgt">
                                                {cart.length > 0 ? (
                                                    <div className="checkot-tct-purcs monte25-tct-purcs">
                                                        <div className="apply-cd mt-1">
                                                            <InputGroup className="input-group">
                                                                <Form.Control
                                                                    className="form-control"
                                                                    placeholder="COUPON CODE"
                                                                    type="text"
                                                                    value={coupon}
                                                                    onChange={(e) =>
                                                                        setCoupon(e.target.value.toUpperCase())
                                                                    }
                                                                />
                                                                {/* Conditional rendering of the button */}
                                                                {couponDetails ? (
                                                                    <Button
                                                                        variant=""
                                                                        className="btn"
                                                                        type="button"
                                                                    // onClick={handleRemoveCoupon} // Function to remove the coupon
                                                                    >
                                                                        REMOVE
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant=""
                                                                        className="btn"
                                                                        type="button"
                                                                    // onClick={handleApplyCoupon} // Function to apply the coupon
                                                                    >
                                                                        APPLY
                                                                    </Button>
                                                                )}
                                                            </InputGroup>
                                                        </div>

                                                        <div className="tickt-ttl-prs my-3">
                                                            <div className="tct-ttl-innr">
                                                                <p>SUBTOTAL</p>
                                                                <span>
                                                                    {currencySymbol}{" "}
                                                                    {priceTotal.toFixed(2)} {" "}
                                                                </span>
                                                            </div>

                                                            {couponDetails && (
                                                                <div className="tct-ttl-innr">
                                                                    <p>STAFF ID</p>
                                                                    <span>
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

                                                            <div className="tct-ttl-innr">
                                                                <p>TICKETS FEES & TAXES</p>
                                                                <span>
                                                                    {currencySymbol}{" "}
                                                                    {feeTotal.toFixed(2)}
                                                                </span>
                                                            </div>

                                                            <div className="tct-ttl-innr">
                                                                <p>TOTAL</p>
                                                                <p>
                                                                    {currencySymbol}{" "}
                                                                    {finalTotal.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <h3 className="text-center mt-5">Cart is Empty</h3>
                                                )}
                                            </div>
                                            {cart.length > 0 && (
                                                <div className="by-nw-btn accomofl-ck-bt">
                                                    <Button
                                                        variant=""
                                                        className="btn"
                                                        type="submit"
                                                        style={{
                                                            backgroundColor: "#df3b67ff",
                                                            color: "white",
                                                            borderRadius: "30px",
                                                            padding: "10px 24px",
                                                            fontWeight: "600",
                                                            border: "none",
                                                            width: "50%",          // full width hat gaya
                                                            display: "block",
                                                            margin: "20px auto 0",      // button center me aa jayega
                                                            opacity: isBtnLoading ? 0.7 : 1,
                                                            cursor: isBtnLoading ? "not-allowed" : "pointer"
                                                        }}
                                                        onClick={(e) => {
                                                            if (finalTotal == 0) {
                                                                e.preventDefault();
                                                                handleFreeTicket();
                                                            }
                                                        }}
                                                    >
                                                        {finalTotal == 0
                                                            ? "FREE TICKET"
                                                            : "PURCHASE"}

                                                    </Button>
                                                </div>
                                            )}

                                        </Col>
                                    </Row>
                                </div>
                            </form>
                        )}
                    </Modal.Body>
                </>
            ) : (
                <CheckOut
                    // userId={userId}
                    eventId={eventId}
                    handleModalClose={handleClose}
                    showNextStep={setShowNextStep}
                    couponDetails={couponDetails}
                    adminFees={adminFees}
                    taxesInfo={ticketingFeeDetails}
                    taxApplied={taxAppliedStatus}
                    eventName={eventName}
                    eventImage={eventImage}
                />
            )}
        </Modal>
    );
}
