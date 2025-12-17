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
    const [taxAppliedStatus, setTaxAppliedStatus] = useState('');
    const [eventName, setEventName] = useState('');
    const [eventImage, setEventImage] = useState('');

    const [cart, setCart] = useState([]);
    const [couponDetails, setCouponDetails] = useState("");
    const [ticketingFeeDetails, setTicketingFeeDetails] = useState();
    const [coupon, setCoupon] = useState("");
    const [adminFees, setAdminFees] = useState(8);
    const [showNextStep, setShowNextStep] = useState(false);

    const [increaseLoadingId, setIncreaseLoadingId] = useState(null);
    const [decreaseLoadingId, setDecreaseLoadingId] = useState(null);
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

        } catch (err) {
            if (err?.response?.status == 409) {
                const result = await Swal.fire({
                    title: "Appointment Conflict!",
                    text: err?.response?.data?.message ||
                        "You have already selected appointments from another event. Do you want to clear them and continue?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setIncreaseLoadingId(null);
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
                        item_type: "appointment",
                        appointment_id: slot.id,
                        count: 1
                    });

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

                setIncreaseLoadingId(null);
                return;
            }
            console.log("Increase slot error:", err);
        }

        setIncreaseLoadingId(null);
    };

    // const decreaseSlot = async (slot) => {
    //     try {
    //         const existing = slotCart[slot.id];
    //         if (!existing) return;
    //         setDecreaseLoadingId(slot.id);
    //         await decreaseCart(existing.cartId);
    //         // Fetch updated cart
    //         const cartRes = await fetchCart(eventId);
    //         const list = cartRes.data.data || [];
    //         setCart(list);
    //         // Build slot cart map again
    //         let map = {};
    //         list.forEach((c) => {
    //             if (c.item_type === "appointment") {
    //                 map[c.raw?.appointment_id] = {
    //                     cartId: c.id,
    //                     count: c.count
    //                 };
    //             }
    //         });
    //         setSlotCart(map);
    //     } catch (e) {
    //         console.log("Decrease slot error:", e);
    //     }
    //     setDecreaseLoadingId(null);
    // };


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
    // const handlePurchase = async () => {
    //     return false
    //     try {
    //         setIsBtnLoading(true);  // 🔥 START LOADER
    //         const data = {
    //             event_id: eventId,
    //             payment_method: "Online",
    //             total_amount: finalTotal
    //         };
    //         handleClose();
    //         Swal.fire({
    //             title: "Booking Appointment...",
    //             text: "Please wait while we confirm your appointment.",
    //             icon: "info",
    //             allowOutsideClick: false,
    //             allowEscapeKey: false,
    //             didOpen: () => Swal.showLoading()
    //         });
    //         const response = await api.post(`/api/v1/orders/create-appointment`, data);
    //         if (response.data.success) {
    //             Swal.fire({
    //                 title: "Appointment Confirmed!",
    //                 text: "Your appointment has been successfully booked.",
    //                 icon: "success",
    //                 confirmButtonText: "Okay",
    //             }).then(() => {
    //                 handleClose();
    //                 setIsBtnLoading(false); // 🔥 STOP LOADER
    //             });

    //         } else {
    //             setIsBtnLoading(false);
    //             Swal.fire({
    //                 title: "Error!",
    //                 text: response.data.message || "Unable to book your appointment.",
    //                 icon: "error"
    //             });
    //         }
    //     } catch (error) {
    //         setIsBtnLoading(false); // 🔥 STOP LOADER
    //         Swal.fire({
    //             title: "Error!",
    //             text: error.message || "An unexpected error occurred!",
    //             icon: "error"
    //         });
    //     }
    // };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={true}
            dialogClassName="cart-modal-size"
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
                                                                                                Date:  {formatReadableDate(slot.date)}
                                                                                            </strong>
                                                                                            {/* <Col sm={3} xs={6} className="mt-0">
                                                                                    <div className="evnt-dtl-rgt monte-ticy-butn">

                                                                                      
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
                                                                                </Col> */}
                                                                                        </div>
                                                                                        <p className="mt-2">
                                                                                            Time: {formatTime(slot.slot_start_time)} to {formatTime(slot.slot_end_time)}
                                                                                        </p>
                                                                                        <p><strong>Location: {w?.location}</strong></p>

                                                                                        <p><strong>Price: {w?.currencyName?.Currency_symbol}{" "}{slot.price}</strong></p>
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
                                                                    {item.item_type == "appointment" &&
                                                                        item.currency_symbol
                                                                        ? item.currency_symbol
                                                                        : "Unknown"}{' '}
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

                                                        <div className="tickt-ttl-prs">
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
                                                        {/* //     onClick={() => {
                                                //         if (finalTotal == 0) {
                                                //             handleFreeTicket();
                                                //         } else {
                                                //             handlePurchase();
                                                //         }
                                                //     }}
                                                // >
                                                //     {finalTotal == 0 ? "FREE TICKET" : "PURCHASE"} */}
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
