import React, { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Col,
    Row,
    Spinner,
    InputGroup,
} from "react-bootstrap";
import Image from "next/image";
import api from "@/utils/api";
import Swal from "sweetalert2";


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

export default function CartModal({ show, handleClose, eventId }) {

    const [isLoading, setIsLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null); // track which pricing ID is loading

    const [cart, setCart] = useState([]);
    const [adminFees, setAdminFees] = useState(8);
    const [eventDetails, setEventDetails] = useState(null);
    // console.log('eventDetails :', eventDetails);

    // CART API FUNCTIONS
    const fetchCart = async (eventId) => {
        return await api.get(`/api/v1/cart/list?event_id=${eventId}`);
    };

    const increaseCart = async (cartId) => {
        return await api.put(`/api/v1/cart/increase/${cartId}`);
    };

    const decreaseCart = async (cartId) => {
        return await api.put(`/api/v1/cart/decrease/${cartId}`);
    };

    const deleteCart = async (cartId) => {
        return await api.delete(`/api/v1/cart/remove/${cartId}`);
    };

    const addToCart = async (params) => {
        return await api.post(`/api/v1/cart/add`, params)
    }

    const [addCartParams, setAddCartParams] = useState({
        event_id: eventId,
        count: 1,               // default count
        item_type: "",          // "slot"
        ticket_id: null,        // not needed for slot
        ticket_price_id: null,  // not needed for slot
        package_id: null,       // not needed for slot
    });

    const [slotCart, setSlotCart] = useState([]);
    const [normalCart, setNormalCart] = useState([]);
    // console.log('normalCart :', normalCart);

    // Fetch Event + Cart Details
    useEffect(() => {
        if (!show) return;
        setCartLoading(true);
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/api/v2/events/public-event-detail/${eventId}`);
                setEventDetails(res.data.data.event);
                await refreshSlotCart();

            } catch (error) {
                console.error("Error loading cart/event:", error);
            }
            setCartLoading(false);
            setIsLoading(false);
        };

        fetchDetails();
    }, [show, eventId]);

    const increaseSlot = async (slot) => {
        const pricingId = slot.pricings[0]?.id;

        try {
            setLoadingId(pricingId);

            const existing = slotCart.find(item => item.uniqueId == pricingId);

            if (existing) {
                await increaseCart(existing.cartId);
            } else {
                await addToCart({
                    event_id: eventId,
                    item_type: "ticket_price",
                    ticket_price_id: pricingId,
                    count: 1
                });
            }

            await refreshSlotCart();

        } catch (err) {
            console.log("Increase slot error:", err);
        }

        setLoadingId(null);
    };

    const decreaseSlot = async (slot) => {
        const pricingId = slot.pricings[0]?.id;

        try {
            setLoadingId(pricingId);

            const existing = slotCart.find(item => item.uniqueId == pricingId);
            if (!existing) return;

            if (existing.count > 1) {
                await decreaseCart(existing.cartId);
            } else {
                await deleteCart(existing.cartId);
            }

            await refreshSlotCart();

        } catch (err) {
            console.log("Decrease slot error:", err);
        }

        setLoadingId(null);
    };

    const refreshSlotCart = async () => {
        try {
            const cartRes = await fetchCart(eventId);

            const list = cartRes?.data?.data || [];
            setCart(list);
            const slotCartList = list
                .filter((c) => c.item_type == "ticket_price")
                .map((c) => ({
                    cartId: c.id,
                    uniqueId: c.uniqueId,
                    count: c.count
                }));

            setSlotCart(slotCartList);

            const normalCartList = list
                .filter((c) => c.item_type == "ticket")
                .map((c) => ({
                    cartId: c.id,
                    uniqueId: c.uniqueId,
                    count: c.count
                }));

            setNormalCart(normalCartList);

        } catch (err) {
            // If API fails → Reset slotCart to empty
            setSlotCart([]);
            setNormalCart([]);
        }
    };

    const increaseTicket = (ticket) => {
        increaseCart({ uniqueId: ticket.uniqueId, type: "ticket" });
    };

    const decreaseTicket = (ticket) => {
        decreaseCart({ uniqueId: ticket.uniqueId, type: "ticket" });
    };


    // Calculate Totals
    const totalTickets = cart.reduce((n, item) => n + item.count, 0);
    const priceTotal = cart.reduce(
        (n, item) => n + item.count * item.ticket_price,
        0
    );
    const feeTotal = (priceTotal * adminFees) / 100;
    const finalTotal = priceTotal + feeTotal;

    const formatEventDateRange = (start, end) => {
        if (!start || !end) return "";

        const startDate = new Date(start);
        const endDate = new Date(end);

        const options = { day: "2-digit", month: "short" };

        const startFormatted = startDate.toLocaleDateString("en-GB", options);
        const endFormatted = endDate.toLocaleDateString("en-GB", {
            ...options,
            year: "numeric",
        });

        return `${startFormatted} – ${endFormatted}`;
    };

    const [showFullDesc, setShowFullDesc] = useState(false);
    const [payLoading, setPayLoading] = useState(false);

    const handlePayNow = async () => {
        if (payLoading) return; // Prevent double click
        setPayLoading(true);
        try {
            const res = await api.post("/api/v1/orders/create", {
                event_id: eventId,
                total_amount: finalTotal,
                payment_method: "Online"
            });
            handleClose(false)

            // SUCCESS POPUP
            Swal.fire({
                icon: "success",
                title: "Order Created!",
                text: res?.data?.message || "Your order has been created successfully.",
                confirmButtonText: "OK",
            });

            // console.log("Order created:", res.data);

            await refreshSlotCart();

            // OPTIONAL: redirect to payment page
            // navigate("/payment");
        } catch (error) {
            handleClose(false)

            // ERROR POPUP
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Something went wrong while creating the order.",
                confirmButtonText: "Close",
            });

            console.error("Order create error:", error);

        } finally {
            setPayLoading(false);
            handleClose(false)

        }
    };

    const formatReadableDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={true}
            dialogClassName="cart-modal-size"
            className="careyes-chekout-new oxmonten2025EvntSec"
        >
            <Modal.Header>
                <Button onClick={handleClose} className="btn-close ms-auto">
                    ×
                </Button>
            </Modal.Header>

            <Modal.Body className="px-3 care-new-check">
                <LoadingComponent isActive={isLoading} />

                {!isLoading && eventDetails && (
                    <div className="checkout-innr">
                        <Row className="gy-4">
                            {/* LEFT SIDE */}
                            <Col lg={8}>
                                <div className="checkot-lft">
                                    <h2 className="ck-mn-hd">{eventDetails.name}</h2>

                                    <div className="ck-event-dtl">
                                        <div className="eventsBxSec">
                                            <Row className="gy-3 align-items-start">

                                                {/* EVENT IMAGE BIG SIZE */}
                                                <Col md={5}>
                                                    <div className="evt-innr-dtl" style={{ textAlign: "center" }}>
                                                        <Image
                                                            src={eventDetails.feat_image}
                                                            alt={eventDetails.name}
                                                            width={380}
                                                            height={380}
                                                            className="firstDayEvent"
                                                            style={{
                                                                borderRadius: "12px",
                                                                width: "100%",
                                                                height: "auto",
                                                                objectFit: "cover"
                                                            }}
                                                        />

                                                        <div className="monte-evntcnts mt-3">
                                                            <strong style={{ fontSize: "18px" }}>
                                                                {eventDetails.location}
                                                            </strong>

                                                            <p style={{ marginTop: "6px", fontSize: "15px", color: "#555" }}>
                                                                {formatEventDateRange(
                                                                    eventDetails.date_from?.local,
                                                                    eventDetails.date_to?.local
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Col>

                                                {/* DESCRIPTION WITH SHOW MORE/LESS */}
                                                <Col md={7}>
                                                    <div className="event-description mt-2">
                                                        <div
                                                            style={{
                                                                maxHeight: showFullDesc ? "none" : "90px",
                                                                overflow: "hidden",
                                                                position: "relative",
                                                                fontSize: "15px",
                                                                lineHeight: "22px"
                                                            }}
                                                            dangerouslySetInnerHTML={{
                                                                __html: eventDetails.desp,
                                                            }}
                                                        />

                                                        {/* SHOW MORE / LESS BUTTON */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowFullDesc(!showFullDesc)}
                                                            style={{
                                                                marginTop: "10px",
                                                                background: "none",
                                                                border: "none",
                                                                color: "#007bff",
                                                                cursor: "pointer",
                                                                fontWeight: "600",
                                                                padding: 0
                                                            }}
                                                        >
                                                            {showFullDesc ? "Show Less ▲" : "Show More ▼"}
                                                        </button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>

                                    {/* AVAILABLE TICKETS */}
                                    {eventDetails.tickets?.length > 0 && (
                                        <div className="ticket-section mt-4">
                                            <h5 className="mb-3">Available Tickets</h5>

                                            {eventDetails.tickets.map((ticket, i) => {
                                                const pricingId = ticket?.id;
                                                const cartItem = normalCart.find(item => item.uniqueId == pricingId);
                                                const isLoading = loadingId == pricingId;
                                                return (
                                                    <div key={i} className="ticket-box mb-3 p-3 border rounded shadow-sm">

                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <strong style={{ fontSize: "17px" }}>{ticket.title}</strong>

                                                            {/* Counter */}
                                                            {isLoading ? (
                                                                <Spinner size="sm" />
                                                            ) : (
                                                                <div className="d-flex align-items-center">

                                                                    {/* Decrease */}
                                                                    <button
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        onClick={() => decreaseTicket(ticket)}
                                                                        disabled={isLoading}
                                                                    >
                                                                        –
                                                                    </button>

                                                                    {/* Count */}
                                                                    <span
                                                                        className="mx-2"
                                                                        style={{
                                                                            fontSize: "16px",
                                                                            width: "25px",
                                                                            textAlign: "center",
                                                                            display: "flex",
                                                                            justifyContent: "center"
                                                                        }}
                                                                    >
                                                                        {cartItem?.count || 0}
                                                                    </span>

                                                                    {/* Increase */}
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => increaseTicket(ticket)}
                                                                        disabled={isLoading}
                                                                    >
                                                                        +
                                                                    </button>

                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Pricing Display */}
                                                        <p className="mt-2">Base Price: ₹{ticket.price}</p>

                                                        {ticket.pricings?.length > 0 && (
                                                            <div className="pricing-tier mt-2">
                                                                {ticket.pricings.map((p, idx) => (
                                                                    <div key={idx} className="d-flex justify-content-between">
                                                                        <span>{p.date}</span>
                                                                        <span>₹{p.price}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}


                                    {/* AVAILABLE SLOTS */}
                                    {eventDetails.slots?.length > 0 && (
                                        <div className="slot-section mt-4">
                                            <h5 className="mb-3">Event Slots</h5>

                                            {eventDetails.slots.map((slot) => {
                                                const pricingId = slot.pricings?.[0]?.id;

                                                // Find matching slot count from cart
                                                const cartItem = slotCart.find(item => item.uniqueId == pricingId);

                                                const isLoading = loadingId == pricingId;

                                                return (
                                                    <div key={slot.id} className="slot-box p-3 border rounded mb-3 shadow-sm">

                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <strong style={{ fontSize: "17px" }}>
                                                                {slot.slot_name}
                                                            </strong>

                                                            {/* Counter */}
                                                            {isLoading ? <Spinner size="sm" /> :
                                                                <div className="d-flex align-items-center">

                                                                    {/* Decrease */}
                                                                    <button
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        onClick={() => decreaseSlot(slot)}
                                                                        disabled={isLoading}
                                                                    >
                                                                        –
                                                                    </button>

                                                                    {/* Count / Loading */}
                                                                    <span
                                                                        className="mx-2"
                                                                        style={{
                                                                            fontSize: "16px",
                                                                            width: "25px",
                                                                            textAlign: "center",
                                                                            display: "flex",
                                                                            justifyContent: "center"
                                                                        }}
                                                                    >
                                                                        {cartItem?.count || 0}
                                                                    </span>

                                                                    {/* Increase */}
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => increaseSlot(slot)}
                                                                        disabled={isLoading}
                                                                    >
                                                                        +
                                                                    </button>

                                                                </div>
                                                            }

                                                        </div>

                                                        {/* Slot Time */}
                                                        <p className="mt-2">
                                                            {formatReadableDate(slot.slot_date)} — {slot.start_time} to {slot.end_time}
                                                        </p>

                                                        <p className="text-muted">{slot.description}</p>

                                                        {/* Pricing List */}
                                                        {slot.pricings?.length > 0 && (
                                                            <div className="pricing-tier">
                                                                {slot.pricings.map((p, idx) => (
                                                                    <div key={idx} className="d-flex justify-content-between">
                                                                        <span>{p.date}</span>
                                                                        <span>₹{p.price}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                        </div>
                                    )}


                                </div>
                            </Col>


                            {/* RIGHT SIDE (CART SUMMARY) */}
                            <Col lg={4}>
                                <div className="checkot-rgt">
                                    <h2>Checkout</h2>

                                    {cart?.length > 0 ? (
                                        <div className="monte25-tct-purcs">
                                            <h6>YOUR TICKETS</h6>

                                            {cart.map((item) => {
                                                const itemPrice = Number(item.ticket_price || 0);
                                                const itemTotal = item.count * itemPrice;

                                                return (
                                                    <div key={item.id} className="ticket-item mb-3">
                                                        <strong>{item.display_name}</strong>

                                                        <div className="d-flex justify-content-between">
                                                            <p className="mb-0">
                                                                {item.count} × ${itemPrice.toFixed(2)}
                                                            </p>

                                                            <p className="mb-0">
                                                                ${itemTotal.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <h6 className="mt-4">
                                                TOTAL {totalTickets} ITEM{totalTickets > 1 ? "S" : ""}
                                            </h6>

                                            <div className="apply-cd my-3">
                                                <InputGroup>
                                                    <input
                                                        type="text"
                                                        placeholder="Promo code"
                                                        className="form-control"
                                                    />
                                                </InputGroup>
                                            </div>

                                            <div className="tickt-ttl-prs">
                                                <div className="d-flex justify-content-between">
                                                    <p>PRICE</p>
                                                    <span>${priceTotal.toFixed(2)}</span>
                                                </div>

                                                <div className="d-flex justify-content-between">
                                                    <p>FEES ({adminFees}%)</p>
                                                    <span>${feeTotal.toFixed(2)}</span>
                                                </div>

                                                <div className="d-flex justify-content-between total">
                                                    <p>TOTAL</p>
                                                    <p>${finalTotal.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            {/* PAY NOW BUTTON */}
                                            <Button
                                                variant="primary"
                                                className="w-100 py-2"
                                                style={{ fontSize: "18px", fontWeight: "600" }}
                                                onClick={handlePayNow}
                                                disabled={payLoading}
                                            >
                                                {payLoading ? "Processing..." : "PAY NOW"}
                                            </Button>



                                        </div>
                                    ) : (
                                        <h3 className="text-center mt-5">Cart is Empty</h3>
                                    )}
                                </div>
                            </Col>


                        </Row>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}
