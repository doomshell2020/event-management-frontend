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

// ----------------------------------
// Loader Component
// ----------------------------------
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
    const [eventDetails, setEventDetails] = useState(null);
    // console.log('eventDetails :', eventDetails);
    const [cart, setCart] = useState([]);
    const [adminFees, setAdminFees] = useState(8);

    // ----------------------------------
    // Fetch Event + Cart Details
    // ----------------------------------
    useEffect(() => {
        if (!show) return;
        setIsLoading(true);

        const fetchDetails = async () => {
            try {
                const res = await api.get(`/api/v2/events/public-event-detail/${eventId}`);

                setEventDetails(res.data.data.event);
                setCart(res.data.cart || []);
                setAdminFees(res.data.fees || 8);
            } catch (error) {
                console.error("Error loading cart/event:", error);
            }

            setIsLoading(false);
        };

        fetchDetails();
    }, [show, eventId]);

    // ----------------------------------
    // Calculate Totals
    // ----------------------------------
    const totalTickets = cart.reduce((n, item) => n + item.no_tickets, 0);
    const priceTotal = cart.reduce(
        (n, item) => n + item.no_tickets * item.price,
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
    const [cartItems, setCartItems] = useState({});
    const increaseQty = (id) => {
        setCartItems(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
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

    const decreaseQty = (id) => {
        setCartItems(prev => ({
            ...prev,
            [id]: prev[id] > 0 ? prev[id] - 1 : 0
        }));
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

                                            {eventDetails.tickets.map((ticket, i) => (
                                                <div key={i} className="ticket-box mb-3 p-2 border rounded">
                                                    <strong>{ticket.title}</strong>
                                                    <p>Base Price: ₹{ticket.price}</p>

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
                                            ))}
                                        </div>
                                    )}

                                    {/* AVAILABLE SLOTS */}
                                    {eventDetails.slots?.length > 0 && (
                                        <div className="slot-section mt-4">
                                            <h5 className="mb-3">Event Slots</h5>

                                            {eventDetails.slots.map((slot, i) => (
                                                <div key={i} className="slot-box p-3 border rounded mb-3 shadow-sm">

                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <strong style={{ fontSize: "17px" }}>{slot.slot_name}</strong>

                                                        {/* Counter Buttons */}
                                                        <div className="d-flex align-items-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => decreaseQty(`slot_${slot.id}`)}
                                                            >
                                                                –
                                                            </button>

                                                            <span className="mx-2" style={{ fontSize: "16px", width: "25px", textAlign: "center" }}>
                                                                {cartItems[`slot_${slot.id}`] || 0}
                                                            </span>

                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => increaseQty(`slot_${slot.id}`)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="mt-2">
                                                        {formatReadableDate(slot.slot_date)} — {slot.start_time} to {slot.end_time}
                                                    </p>


                                                    <p className="text-muted">{slot.description}</p>

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

                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Col>


                            {/* RIGHT SIDE (CART SUMMARY) */}
                            <Col lg={4}>
                                <div className="checkot-rgt">
                                    <h2>Checkout</h2>

                                    {cart.length > 0 ? (
                                        <div className="monte25-tct-purcs">
                                            <h6>YOUR TICKETS</h6>

                                            {cart.map((item, i) => (
                                                <div key={i} className="ticket-item mb-2">
                                                    <strong>
                                                        {item.ticketName}
                                                        {item.tickettype && ` (${item.tickettype})`}
                                                    </strong>
                                                    <p>
                                                        {item.no_tickets} × ${item.price}
                                                    </p>
                                                </div>
                                            ))}

                                            <h6 className="mt-5">
                                                TOTAL {totalTickets} ITEM
                                                {totalTickets > 1 ? "S" : ""}
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
