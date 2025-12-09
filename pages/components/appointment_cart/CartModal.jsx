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

export default function CartModal({ show, handleClose, eventId }) {
    const [isLoading, setIsLoading] = useState(true);

    const [eventDetails, setEventDetails] = useState({});
    const [cart, setCart] = useState([]);
    const [couponDetails, setCouponDetails] = useState("");
    const [coupon, setCoupon] = useState("");
    const [adminFees, setAdminFees] = useState(8);


    const [increaseLoadingId, setIncreaseLoadingId] = useState(null);
    const [decreaseLoadingId, setDecreaseLoadingId] = useState(null);
    // console.log("--------eventId",eventId)
    // CART API FUNCTIONS
    const fetchCart = async (eventId) => {
        return await api.get(`/api/v1/cart/appointment-list?event_id=${eventId}`);
    };

    const increaseCart = async (cartId) => {
        return await api.put(`/api/v1/cart/increase/${cartId}`);
    };

    const decreaseCart = async (cartId) => {
        return await api.put(`/api/v1/cart/decrease/${cartId}`);
    };

    const deleteCart = async (cartId) => {
        return await api.delete(`/api/v1/cart/delete/${cartId}`);
    };

    const addToCart = async (params) => {
        return await api.post(`/api/v1/cart/add`, params)
    }

    const [slotCart, setSlotCart] = useState({});

    // Fetch Event + Cart Details
    useEffect(() => {
        if (!show) return;
        setIsLoading(true);
        const fetchDetails = async () => {
            try {
                const res = await api.get(`api/v2/events/${eventId}/appointments`);
                setEventDetails(res.data.data);
                // setAdminFees(res.data.fees || 8);

                // Load cart
                const cartRes = await fetchCart(eventId);
                const list = cartRes?.data?.data || [];
                setCart(list);
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
            } catch (error) {
                console.error("Error loading cart/event:", error);
            }
            setIsLoading(false);
        };

        fetchDetails();
    }, [show, eventId]);

    // Calculate Totals
    const totalTickets = cart.reduce((n, item) => n + item.count, 0);
    const priceTotal = cart.reduce(
        (n, item) => n + item.count * item.ticket_price,
        0
    );
    const feeTotal = (priceTotal * adminFees) / 100;
    const finalTotal = priceTotal + feeTotal;

    const [showFullDesc, setShowFullDesc] = useState(false);

    const formatReadableDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };



    // const handleDeleteCartItem = async (slot) => {
    //     console.log("-----------slot",slot)
    //     try {
    //         // const existing = slotCart[slot.id];
    //         // if (!existing) return;
    //         const result = await Swal.fire({
    //             title: "Are you sure?",
    //             text: "You won't be able to revert this!",
    //             icon: "warning",
    //             showCancelButton: true,
    //             confirmButtonColor: "#3085d6",
    //             cancelButtonColor: "#d33",
    //             confirmButtonText: "Yes, delete it!",
    //             customClass: {
    //                 popup: "add-tckt-dtlpop",
    //             }
    //         });

    //         if (result.isConfirmed) {
    //             setIsLoading(true);
    //             await decreaseCart(existing.cartId);
    //             const cartRes = await fetchCart(eventId);
    //             const list = cartRes.data.data || [];
    //             setCart(list);
    //             // Build slot cart map again
    //             let map = {};
    //             list.forEach((c) => {
    //                 if (c.item_type === "appointment") {
    //                     map[c.raw?.appointment_id] = {
    //                         cartId: c.id,
    //                         count: c.count
    //                     };
    //                 }
    //             });
    //             setSlotCart(map);
    //             setIsLoading(false);
    //         }
    //     } catch (error) {
    //         console.error("Error calling API:", error);
    //         setErrorMessage(error.message);
    //         setSuccessMessage(""); // Clear success message if any
    //         Swal.fire({
    //             icon: "error",
    //             title: "Error",
    //             text: error.message,
    //         });
    //         await fetchCartDetails();
    //         setIsLoading(false);
    //     }
    // };



    const increaseSlot = async (slot) => {
        try {
            setIncreaseLoadingId(slot.id);
            // Check existing slot cart
            const existing = slotCart[slot.id];
            if (existing) {
                // Already in cart → increase
                await increaseCart(existing.cartId);
                // Fetch updated cart
                // Load cart
                const cartRes = await fetchCart(eventId);
                const list = cartRes?.data?.data || [];
                setCart(list);
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
            } else {
                // First time add
                await addToCart({
                    event_id: eventId,
                    item_type: "appointment",
                    appointment_id: slot.id,
                    count: 1
                });
            }
            // Fetch updated cart
            const cartRes = await fetchCart(eventId);
            const list = cartRes.data.data || [];
            setCart(list);
            // Build slot cart map
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

        } catch (e) {
            console.log("Increase slot error:", e);
        }

        setIncreaseLoadingId(null);
    };

    const decreaseSlot = async (slot) => {
        try {
            const existing = slotCart[slot.id];
            if (!existing) return;
            setDecreaseLoadingId(slot.id);
            await decreaseCart(existing.cartId);
            // Fetch updated cart
            const cartRes = await fetchCart(eventId);
            const list = cartRes.data.data || [];
            setCart(list);
            // Build slot cart map again
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
        } catch (e) {
            console.log("Decrease slot error:", e);
        }
        setDecreaseLoadingId(null);
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
    const handlePurchase = async () => {
        try {
            setIsBtnLoading(true);  // 🔥 START LOADER
            const data = {
                event_id: eventId,
                payment_method: "Online",
                total_amount: finalTotal
            };
            handleClose();
            Swal.fire({
                title: "Booking Appointment...",
                text: "Please wait while we confirm your appointment.",
                icon: "info",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });
            const response = await api.post(`/api/v1/orders/create-appointment`, data);
            if (response.data.success) {
                Swal.fire({
                    title: "Appointment Confirmed!",
                    text: "Your appointment has been successfully booked.",
                    icon: "success",
                    confirmButtonText: "Okay",
                }).then(() => {
                    handleClose();
                    setIsBtnLoading(false); // 🔥 STOP LOADER
                });

            } else {
                setIsBtnLoading(false);
                Swal.fire({
                    title: "Error!",
                    text: response.data.message || "Unable to book your appointment.",
                    icon: "error"
                });
            }
        } catch (error) {
            setIsBtnLoading(false); // 🔥 STOP LOADER
            Swal.fire({
                title: "Error!",
                text: error.message || "An unexpected error occurred!",
                icon: "error"
            });
        }
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
                            <Col lg={8} className="men-innr-sec">
                                <div className="checkot-lft">
                                    {/* EVENT NAME */}
                                    <h2 className="ck-mn-hd">{eventDetails.name}</h2>

                                    <span
                                        className="check-25-lft-pra"
                                        dangerouslySetInnerHTML={{
                                            __html: eventDetails.desp,
                                        }}
                                    />
                                    {/* EVENT IMAGE + DETAILS */}
                                    <div className="ck-event-dtl">
                                        <div className="eventsBxSec">
                                            {/* <Row className="gy-3 align-items-start">
                                               
                                                <Col md={5}>
                                                    <div className="evt-innr-dtl" style={{ textAlign: "center" }}>
                                                        <Image
                                                            src={eventDetails.feat_image}
                                                            alt={eventDetails.name}
                                                            width={380}
                                                            height={380}
                                                            style={{
                                                                borderRadius: "12px",
                                                                width: "100%",
                                                                height: "auto",
                                                                objectFit: "cover",
                                                            }}
                                                        />

                                                        <div className="monte-evntcnts mt-3">
                                                            <strong style={{ fontSize: "18px" }}>
                                                                {eventDetails.location}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={7}>
                                                    <div className="event-description mt-2">
                                                        <div
                                                            style={{
                                                                maxHeight: showFullDesc ? "none" : "90px",
                                                                overflow: "hidden",
                                                                fontSize: "15px",
                                                                lineHeight: "22px",
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: eventDetails.desp }}
                                                        />
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
                                                            }}
                                                        >
                                                            {showFullDesc ? "Show Less ▲" : "Show More ▼"}
                                                        </button>
                                                    </div>
                                                </Col>

                                            </Row> */}

                                            <Row className="align-items-center gy-3 marginTpMinus4">
                                                {eventDetails.wellness?.length > 0 && (
                                                    <div className="ticket-section mt-4">
                                                        <h5 className="mb-3">Available Appointments</h5>
                                                        {eventDetails.wellness.map((w) => (
                                                            <div
                                                                key={w.id}
                                                                className="ticket-box mb-4 p-3 border rounded shadow-sm"
                                                            >

                                                                {/* Appointment Name */}
                                                                <strong style={{ fontSize: "17px" }}>{w.name}</strong>

                                                                {/* Appointment Image (only if exists) */}
                                                                {w.Image && (
                                                                    <div className="w-50 my-3">
                                                                        <Image
                                                                            src={w.Image}
                                                                            alt={w.name}
                                                                            width={500}
                                                                            height={300}
                                                                            style={{
                                                                                borderRadius: "10px",
                                                                                width: "50%",
                                                                                height: "auto",
                                                                                objectFit: "cover",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Appointment Description */}
                                                                <div
                                                                    className="mt-2"
                                                                    dangerouslySetInnerHTML={{ __html: w.description }}
                                                                />

                                                                {/* Slots */}
                                                                {w.wellnessSlots?.length > 0 ? (
                                                                    w.wellnessSlots.map((slot) => (
                                                                        <div
                                                                            key={slot.id}
                                                                            className="slot-box p-3 border rounded mb-3 shadow-sm"
                                                                        >
                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                <strong style={{ fontSize: "17px" }}>
                                                                                    {formatReadableDate(slot.date)}
                                                                                </strong>
                                                                                <Col sm={3} xs={6} className="mt-0">
                                                                                    <div className="evnt-dtl-rgt monte-ticy-butn">

                                                                                        {/* Decrease Button */}
                                                                                        <Button
                                                                                            variant=""
                                                                                            onClick={() => decreaseSlot(slot)}
                                                                                            disabled={decreaseLoadingId === slot.id}
                                                                                        >
                                                                                            {decreaseLoadingId === slot.id ? (
                                                                                                <span className="spinner-border spinner-border-sm"></span>
                                                                                            ) : (
                                                                                                "-"
                                                                                            )}
                                                                                        </Button>

                                                                                        <span>{slotCart[slot.id]?.count || 0}</span>

                                                                                        {/* Increase Button */}
                                                                                        <Button
                                                                                            variant=""
                                                                                            onClick={() => increaseSlot(slot)}
                                                                                            disabled={increaseLoadingId === slot.id}
                                                                                        >
                                                                                            {increaseLoadingId === slot.id ? (
                                                                                                <span className="spinner-border spinner-border-sm"></span>
                                                                                            ) : (
                                                                                                "+"
                                                                                            )}
                                                                                        </Button>

                                                                                    </div>
                                                                                </Col>

                                                                                {/* <div className="d-flex align-items-center">
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-secondary"
                                                                                        onClick={() => decreaseSlot(slot)}
                                                                                    >
                                                                                        –
                                                                                    </button>

                                                                                    <span
                                                                                        className="mx-2"
                                                                                        style={{
                                                                                            fontSize: "16px",
                                                                                            width: "25px",
                                                                                            textAlign: "center",
                                                                                        }}
                                                                                    >
                                                                                        {slotCart[slot.id]?.count || 0}
                                                                                    </span>

                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-primary"
                                                                                        onClick={() => increaseSlot(slot)}
                                                                                    >
                                                                                        +
                                                                                    </button>
                                                                                </div> */}
                                                                            </div>

                                                                            <p className="mt-2">
                                                                                {formatTime(slot.slot_start_time)} to {formatTime(slot.slot_end_time)}
                                                                            </p>

                                                                            <p><strong>Location: {slot.slot_location}</strong></p>

                                                                            <p><strong>Price: ₹{slot.price}</strong></p>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-muted">No slots available</p>
                                                                )}
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
                                    {/* <h2>Checkout</h2> */}
                                    <div
                                        className="checkot-rgt-bnr mont25rgt-bnt "
                                        style={{
                                            backgroundImage: `url(${eventDetails.feat_image
                                                ? `${eventDetails.feat_image}`
                                                : `https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png`
                                                })`,
                                        }}
                                    > <img
                                            src={`https://eboxtickets.com/images/eboxticket_dark_logo.png`}
                                            alt="Logo"
                                        />
                                    </div>
                                    {cart.length > 0 ? (
                                        <div className="checkot-tct-purcs monte25-tct-purcs">
                                            <h6>YOUR APPOINTMENTS</h6>

                                            {cart.map((item, index) => (
                                                <div key={index + Math.random(100)} className="yr-tct-dtl">
                                                    <p className="yr-tct-dtl-para">
                                                        {item.count}x{" "}
                                                        <span>
                                                            {item.item_type == "appointment" &&
                                                                item.display_name
                                                                ? item.display_name
                                                                : "Unknown"}
                                                        </span>
                                                    </p>
                                                    <p
                                                        style={{ cursor: "pointer" }}
                                                        title="Delete Item"
                                                    >
                                                        {/* {currencySymbol} */}
                                                        $
                                                        {item.item_type == "appointment" &&
                                                            item.display_name
                                                            ? (
                                                                item?.ticket_price *
                                                                item.count
                                                            ).toLocaleString()
                                                            : 0}
                                                        {/* <img
                                                            src={`/assets/img/caryes-ticket-dlt.png`}
                                                            alt="delete-icon"
                                                            onClick={() =>
                                                                handleDeleteCartItem(item.id)
                                                            } // Assuming you implement this function
                                                        /> */}
                                                    </p>
                                                </div>
                                            ))}


                                            <div className="apply-cd mt-5">
                                                <InputGroup className="input-group">
                                                    <Form.Control
                                                        className="form-control"
                                                        placeholder="ENTER STAFF ID"
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


                                            {/* <h6 className="mt-5">
                                                TOTAL {totalTickets} ITEM
                                                {totalTickets > 1 ? "S" : ""}
                                            </h6> */}

                                            {/* <div className="apply-cd my-3">
                                                <InputGroup>
                                                    <input
                                                        type="text"
                                                        placeholder="Promo code"
                                                        className="form-control"
                                                    />
                                                </InputGroup>
                                            </div> */}

                                            <div className="tickt-ttl-prs">
                                                <div className="tct-ttl-innr">
                                                    <p>SUBTOTAL</p>
                                                    <span>
                                                        {/* {currencySymbol} */}$
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
                                                        $
                                                        {feeTotal.toFixed(2)}
                                                    </span>
                                                </div>

                                                <div className="tct-ttl-innr">
                                                    <p>TOTAL</p>
                                                    <p>
                                                        $
                                                        {finalTotal.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* <div className="tickt-ttl-prs">
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
                                            </div> */}
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
                                                backgroundColor: "#fca3bb",
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
                                            onClick={() => {
                                                if (finalTotal == 0) {
                                                    handleFreeTicket();
                                                } else {
                                                    handlePurchase();
                                                }
                                            }}
                                        >
                                            {finalTotal == 0 ? "FREE TICKET" : "PURCHASE"}
                                        </Button>

                                    </div>



                                    // <Button
                                    //     type="submit"
                                    //     disabled={isBtnLoading}   // 🔥 Prevent double click
                                    // style={{
                                    //     backgroundColor: "#ff4da6",
                                    //     color: "white",
                                    //     borderRadius: "8px",
                                    //     padding: "10px 16px",
                                    //     fontWeight: "600",
                                    //     border: "none",
                                    //     width: "100%",
                                    //     opacity: isBtnLoading ? 0.7 : 1, // loader look
                                    //     cursor: isBtnLoading ? "not-allowed" : "pointer"
                                    // }}
                                    //     onClick={() => {
                                    //         if (finalTotal == 0) {
                                    //             handleFreeTicket();
                                    //         } else {
                                    //             handlePurchase();
                                    //         }
                                    //     }}
                                    // >
                                    //     {isBtnLoading ? (
                                    //         <span
                                    //             className="spinner-border spinner-border-sm"
                                    //             role="status"
                                    //             style={{ marginRight: "8px" }}
                                    //         ></span>
                                    //     ) : null}

                                    //     {isBtnLoading
                                    //         ? "Processing..."
                                    //         : finalTotal == 0
                                    //             ? "FREE TICKET"
                                    //             : "PURCHASE"}
                                    // </Button>

                                )}

                            </Col>
                        </Row>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}
