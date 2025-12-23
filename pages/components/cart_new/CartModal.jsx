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
import { useCart } from "@/shared/layout-components/layout/CartContext";
import CheckoutForm from "@/pages/components/cart_new/CheckOut";


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

    const { cart, refreshCart, eventData, normalCart, slotCart, loadingCart, setEventId } = useCart();

    const [isLoading, setIsLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null); // track which pricing ID is loading
    const [adminFees, setAdminFees] = useState(8);
    const [eventDetails, setEventDetails] = useState(null);

    const [showNextStep, setShowNextStep] = useState(false);

    useEffect(() => {
        setIsLoading(loadingCart);
    }, [loadingCart]);

    useEffect(() => {
        if (eventId) {
            setEventId(eventId);   // store eventId globally
            refreshCart(eventId);  // load cart for that event
        }
    }, []);

    const [addCartParams, setAddCartParams] = useState({
        event_id: eventId,
        count: 1,               // default count
        item_type: "",          // "slot"
        ticket_id: null,        // not needed for slot
        ticket_price_id: null,  // not needed for slot
        package_id: null,       // not needed for slot
    });

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

            await refreshCart(eventId || undefined);

        } catch (err) {

            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err?.response?.data?.message ||
                        "Your cart has products from another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // ➋ SHOW LOADER
                Swal.fire({
                    title: "Clearing Cart...",
                    text: "Please wait",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // ➌ CLEAR CART
                await clearCart();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can add items now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });

                // ➍ RETRY ADDING ITEM AUTOMATICALLY
                try {
                    await addToCart({
                        event_id: eventId,
                        item_type: "ticket_price",
                        ticket_price_id: pricingId,
                        count: 1
                    });

                    await refreshCart(eventId || undefined);

                    Swal.fire({
                        icon: "success",
                        title: "Added Successfully",
                        timer: 1200,
                        showConfirmButton: false
                    });

                } catch (retryError) {
                    console.log("Retry error:", retryError);
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: "Could not add the ticket after clearing cart."
                    });
                }

                setLoadingId(null);
                return;
            }

            console.log("Increase ticket error:", err);

        } finally {
            setLoadingId(null); // ensures loader is removed ALWAYS
        }
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

            await refreshCart(eventId || undefined);

        } catch (err) {
            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err.response.data?.message ||
                        "Your cart belongs to another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // Loader
                Swal.fire({
                    title: "Clearing...",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // Clear cart
                await clearCart();

                Swal.close();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can continue now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });
                await decreaseCart(existing.cartId);
            }
            console.log("Decrease error:", err);
        } finally {
            setLoadingId(null);
        }
    };

    const clearCart = async () => {
        return await api.delete(`/api/v1/cart/clear`);
    };

    const increaseTicket = async (ticket) => {
        const ticketId = ticket?.id;

        try {
            setLoadingId(ticketId);

            const existing = normalCart.find(item => item.uniqueId == ticketId);
            // console.log('normalCart :', normalCart);
            // console.log('existing :', existing);
            // return false

            if (existing) {
                await increaseCart(existing.cartId);
            } else {
                await addToCart({
                    event_id: eventId,
                    item_type: "ticket",
                    ticket_id: ticketId,
                    count: 1
                });
            }

            await refreshCart(eventId);

        } catch (err) {

            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err?.response?.data?.message ||
                        "Your cart has products from another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // ➋ SHOW LOADER
                Swal.fire({
                    title: "Clearing Cart...",
                    text: "Please wait",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // ➌ CLEAR CART
                await clearCart();
                // await refreshCart();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can add items now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });

                // ➍ RETRY ADDING ITEM AUTOMATICALLY
                try {
                    await addToCart({
                        event_id: eventId,
                        item_type: "ticket",
                        ticket_id: ticketId,
                        count: 1
                    });

                    await refreshCart(eventId);

                    Swal.fire({
                        icon: "success",
                        title: "Added Successfully",
                        timer: 1200,
                        showConfirmButton: false
                    });

                } catch (retryError) {
                    console.log("Retry error:", retryError);
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: "Could not add the ticket after clearing cart."
                    });
                }

                setLoadingId(null);
                return;
            }

            console.log("Increase ticket error:", err);

        } finally {
            setLoadingId(null); // ensures loader is removed ALWAYS
        }
    };

    const decreaseTicket = async (ticket) => {
        const ticketId = ticket?.id;

        try {
            setLoadingId(ticketId);

            const existing = normalCart.find(item => item.uniqueId == ticketId);
            if (!existing) return;
            if (existing.count > 1) {
                await decreaseCart(existing.cartId);
            }
            else {
                await deleteCart(existing.cartId);
            }
            await refreshCart(eventId);
        } catch (err) {
            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err.response.data?.message ||
                        "Your cart belongs to another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // Loader
                Swal.fire({
                    title: "Clearing...",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // Clear cart
                await clearCart();

                Swal.close();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can continue now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });
                await decreaseCart(existing.cartId);
                // No retry for decrease (because item doesn't exist anymore)
                // await refreshCart(eventId);
            }

            console.log("Decrease error:", err);

        } finally {
            setLoadingId(null);
        }
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
        // setPayLoading(true);
        setShowNextStep(true);
        return
        try {
            // const res = await api.post("/api/v1/orders/create", {
            //     event_id: eventId,
            //     total_amount: finalTotal,
            //     payment_method: "Online"
            // });
            handleClose(false)

            // SUCCESS POPUP
            Swal.fire({
                icon: "success",
                title: "Order Created!",
                text: res?.data?.message || "Your order has been created successfully.",
                confirmButtonText: "OK",
            });

            // console.log("Order created:", res.data);

            // await refreshCart(eventId || undefined);

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

    const handleDeleteItem = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This item will be removed from your cart.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, remove it",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteCart(id); // your API function
                await refreshCart(eventId || undefined);

                Swal.fire({
                    icon: "success",
                    title: "Removed!",
                    text: "The item has been deleted from your cart."
                });
            }
        });
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={true}
            dialogClassName="cart-modal-size cart-mdl-only"
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

                        {!isLoading && eventData && (
                            <div className="checkout-innr">
                                <Row>
                                    {/* LEFT SIDE */}
                                    <Col lg={8}>
                                        <div className="model-left-content">

                                            <div className="cart-mdl-innercontent">
                                                <Row className="align-items-start">

                                                    {/* EVENT IMAGE BIG SIZE */}
                                                    <Col md={5}>
                                                        <h2 className="cart-mdl-title">{eventData.name}</h2>
                                                        <div className="cartmdl-left-img" style={{ textAlign: "center" }}>
                                                            <Image
                                                                src={eventData.feat_image}
                                                                alt={eventData.name}
                                                                width={380}
                                                                height={380}
                                                                className="firstDayEvent"
                                                                style={{
                                                                    borderRadius: "12px",
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover"
                                                                }}
                                                            />


                                                        </div>
                                                        <div className="event-crt-deta mt-2 text-center">
                                                            <strong className="mdl-event-name">
                                                                {eventData.location}
                                                            </strong>

                                                            <p style={{ color: "#555" }}>
                                                                {formatEventDateRange(
                                                                    eventData.date_from?.local,
                                                                    eventData.date_to?.local
                                                                )}
                                                            </p>
                                                        </div>
                                                    </Col>

                                                    {/* DESCRIPTION WITH SHOW MORE/LESS */}
                                                    <Col md={7}>

                                                        {eventData.tickets?.length > 0 && (
                                                            <div className="ticket-section">
                                                                <h5 className="mb-3">Available Tickets</h5>

                                                                {eventData.tickets.map((ticket, i) => {
                                                                    const pricingId = ticket?.id;
                                                                    const cartItem = normalCart.find(item => item.uniqueId == pricingId);
                                                                    const isLoading = loadingId == pricingId;

                                                                    return (
                                                                        <div key={i} className="ticket-item only-ticket">

                                                                            <div className="d-flex justify-content-between align-items-center ticket-infobox">
                                                                                <div className="ticket-info">
                                                                                    <strong style={{ fontSize: "15px" }}>{ticket.title}</strong>
                                                                                    <p className="mt-2">Base Price: ₹{ticket.price}</p>

                                                                                </div>


                                                                                {/* Counter */}
                                                                                {isLoading ? (
                                                                                    <Spinner size="sm" />
                                                                                ) : (
                                                                                    <div className="d-flex align-items-center counter-btn">

                                                                                        {/* Decrease */}
                                                                                        <button
                                                                                            className="btn btn-sm text-white"
                                                                                            onClick={() => decreaseTicket(ticket)}
                                                                                            disabled={isLoading}
                                                                                        >
                                                                                            –
                                                                                        </button>

                                                                                        {/* Count */}
                                                                                        <span
                                                                                            className="mx-2 text-white"
                                                                                            style={{
                                                                                                fontSize: "11px",
                                                                                                width: "20px",
                                                                                                textAlign: "center",
                                                                                                display: "flex",
                                                                                                justifyContent: "center",
                                                                                                margin: "0px 5px",
                                                                                            }}
                                                                                        >
                                                                                            {cartItem?.count || 0}
                                                                                        </span>

                                                                                        {/* Increase */}
                                                                                        <button
                                                                                            className="btn btn-sm text-white"
                                                                                            onClick={() => increaseTicket(ticket)}
                                                                                            disabled={isLoading}
                                                                                        >
                                                                                            +
                                                                                        </button>

                                                                                    </div>
                                                                                )}
                                                                            </div>




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


                                                                <div className="ticket-item only-ticket ticket-addon">
                                                                    <div className="d-flex justify-content-between align-items-center ticket-infobox">
                                                                        <div className="ticket-info">
                                                                            <strong style={{ fontSize: "15px" }}>Ticket Second</strong><span class="addon-badge">ADDON</span>

                                                                            <p className="mt-2">Base Price: ₹20</p>
                                                                        </div>
                                                                        <div className="d-flex align-items-center counter-btn">
                                                                            <button className="btn btn-sm text-white">–</button>

                                                                            <span
                                                                                className="mx-2 text-white"
                                                                                style={{
                                                                                    fontSize: "11px",
                                                                                    width: "20px",
                                                                                    textAlign: "center",
                                                                                    display: "flex",
                                                                                    justifyContent: "center",
                                                                                    margin: "0px 5px",
                                                                                }}
                                                                            >
                                                                                1
                                                                            </span>

                                                                            <button className="btn btn-sm text-white">+</button>
                                                                        </div>
                                                                    </div>



                                                                </div>


                                                            </div>

                                                        )}





                                                    </Col>
                                                </Row>

                                            </div>

                                            {/* AVAILABLE TICKETS */}



                                            {/* AVAILABLE SLOTS */}
                                            {eventData.slots?.length > 0 && (
                                                <div className="slot-section mt-4">
                                                    <h5 className="mb-3">Event Slots</h5>

                                                    {eventData.slots.map((slot) => {
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
                                                                                className="btn btn-sm"
                                                                                onClick={() => decreaseSlot(slot)}
                                                                                disabled={isLoading}
                                                                            >
                                                                                –
                                                                            </button>

                                                                            {/* Count / Loading */}
                                                                            <span
                                                                                className="mx-2"
                                                                                style={{
                                                                                    fontSize: "11px",
                                                                                    width: "20px",
                                                                                    textAlign: "center",
                                                                                    display: "flex",
                                                                                    justifyContent: "center",
                                                                                    margin: "0px 5px",
                                                                                }}
                                                                            >
                                                                                {cartItem?.count || 0}
                                                                            </span>

                                                                            {/* Increase */}
                                                                            <button
                                                                                className="btn btn-sm "
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
                                                    __html: eventData.desp,
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


                                    {/* RIGHT SIDE (CART SUMMARY) */}
                                    <Col lg={4}>
                                        <div className="chackout-box">
                                            <h2>Checkout</h2>

                                            {cart?.length > 0 ? (
                                                <div className="monte25-tct-purcs">
                                                    <h6>YOUR TICKETS</h6>

                                                    {cart.map((item) => {
                                                        const itemPrice = Number(item.ticket_price || 0);
                                                        const itemTotal = item.count * itemPrice;

                                                        return (
                                                            <div key={item.id} className="chackout-detabox mb-3">
                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                    <strong>{item.display_name}</strong>

                                                                    <button
                                                                        className="btn btn-sm delete-btn"
                                                                        onClick={() => handleDeleteItem(item.id)}
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </div>

                                                                <div className="d-flex justify-content-between">
                                                                    <p className="mb-0">
                                                                        {item.count} × ${itemPrice.toFixed(2)}
                                                                    </p>

                                                                    <p className="mb-0">${itemTotal.toFixed(2)}</p>
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
                                                        style={{ fontSize: "15px", fontWeight: "600" }}
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
                </>
            ) : (
                <CheckoutForm
                    eventId={eventId}
                    handleModalClose={handleClose}
                    showNextStep={setShowNextStep}
                    adminFees={adminFees}
                    couponDetails={null}
                    sub_total={100}
                    tax_total={8}
                    grand_total={108}
                />
            )}
        </Modal>
    );
}