import Head from "next/head";
import { Inter } from "next/font/google";
import favicon from "@/public/assets/img/brand/favicon-icon.svg";
import CryptoJS from "crypto-js";
import {
    Alert,
    Button,
    Col,
    Navbar,
    Container,
    Nav,
    NavDropdown,
    Form,
    FormGroup,
    InputGroup,
    Row,
    Tab,
    Tabs,
    Modal,
    Spinner,
} from "react-bootstrap";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Seo from "@/shared/layout-components/seo/seo";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert
// import Moment from "react-moment";
import moment from "moment-timezone";
import Image from "next/image";
import Checkout from '@/pages/components/cart/checkout';

const LoadingComponent = ({ isActive }) => {
    return (
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
                    borderRadius: "27px",
                }}
            >
                <span
                    className="fas fa-spinner fa-3x fa-spin"
                    style={{ color: "black" }}
                ></span>
            </div>
        )
    );
};

export default function Cart({ isActiveNow, makeModalOff, loginUserId = 10315, profile = {} }) {

    let navigate = useRouter();
    const [show, setShow] = useState(isActiveNow);
    const [eventId, setEventId] = useState(111);
    const [userId, setUserId] = useState(profile?.id || loginUserId)
    const [isLoading, setIsLoading] = useState(false); // State to control loading spinner
    const [cartModalShow, setCartModalShow] = useState(false);
    const [cart, setCart] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [coupon, setCoupon] = useState("");
    const [couponError, setCouponError] = useState("");
    const [couponSuccessMessage, setCouponSuccessMessage] = useState("");
    const [couponDetails, setCouponDetails] = useState("");
    const [adminFees, setAdminFees] = useState(0);
    const [donationFees, setdonationFees] = useState(0);
    const [eventDetails, setEventDetails] = useState({});
    const [addonsDetailsArray, setAddonsDetailsArray] = useState([]);
    const [activeTicketType, setActiveTicketType] = useState([]);
    // console.log('>>>>>>>>>>>',eventDetails);

    // Function to clear messages after 5 seconds
    const clearMessages = () => {
        setTimeout(() => {
            setErrorMessage("");
            setSuccessMessage("");
            // setCouponError("");
            // setCouponSuccessMessage("");
        }, 10000); // Clear after 5 seconds
    };

    const isSaleActive = (saleStartDate, saleEndDate) => {

        if (!saleStartDate || !saleEndDate) {
            console.log("Invalid input: Missing sale start date, end date, or event time zone");
            return false;
        }
        // Validate the timezone
        if (!moment.tz.zone(eventDetails.EventTimeZone)) {
            console.log("Invalid timezone:", eventDetails.EventTimeZone);
            return false;
        }
        const currentDate = moment().tz(eventDetails.EventTimeZone);
        const startDate = moment.tz(saleStartDate, eventDetails.EventTimeZone);
        const endDate = moment.tz(saleEndDate, eventDetails.EventTimeZone);
        if (!startDate.isValid() || !endDate.isValid()) {
            console.log("Invalid date format for sale start or end date");
            return false;
        }

        const testing = eventDetails.EventTicketTypes.filter(
            (ticketType) =>
                ticketType.type == "open_sales" &&
                ticketType.hidden == "N"
        );

        const formatStr = "DD-MM-YYYY hh:mm A z";
        const formatted = {
            currentTime: currentDate.format(formatStr),
            saleStart: startDate.format(formatStr),
            saleEnd: endDate.format(formatStr),
        };



        console.log("🕒 TimeZone:", eventDetails.EventTimeZone);
        console.log("🕒 Current:", formatted.currentTime);
        console.log("📅 Sale Start:", formatted.saleStart);
        console.log("📅 Sale End:", formatted.saleEnd);


        // const eventTimeZone = "America/Los_Angeles";

        // // Suppose user selects only "31-08-2025"
        // const selectedDate = "2025-08-31";

        // // Force 12:00 PM in that timezone
        // const endDateInTZ = moment.tz(`${selectedDate} 12:00:00`, eventTimeZone);

        // // Convert to UTC before saving in DB
        // const endDateUTC = endDateInTZ.clone().utc().format("YYYY-MM-DD HH:mm:ss");

        // console.log("🕒 Local End:", endDateInTZ.format("DD-MM-YYYY hh:mm A z"));
        // console.log("🕒 UTC Saved:", endDateUTC);

        return (
            currentDate.isSameOrAfter(startDate) &&
            currentDate.isSameOrBefore(endDate)
        );
    };

    const forTicketIsSaleActive = (saleStartDate, saleEndDate, ticketId) => {
        if (!saleStartDate || !saleEndDate) {
            console.log("❌ Invalid input: Missing sale start or end date");
            return false;
        }

        // ✅ Validate timezone
        if (!moment.tz.zone(eventDetails.EventTimeZone)) {
            console.log("❌ Invalid timezone:", eventDetails.EventTimeZone);
            return false;
        }

        const tz = eventDetails.EventTimeZone;

        // ✅ Current time in event timezone
        const currentDate = moment().tz(tz);

        // ✅ Normalize startDate → 00:00:00 (start of the day in that timezone)
        const startDate = moment.tz(saleStartDate, tz).startOf("day");

        // ✅ Normalize endDate → 23:59:59 (end of the day in that timezone)
        const endDate = moment.tz(saleEndDate, tz).endOf("day");

        if (!startDate.isValid() || !endDate.isValid()) {
            console.log("❌ Invalid date format for sale start or end date");
            return false;
        }

        // ✅ For debugging
        // const formatStr = "DD-MMM-YYYY hh:mm:ss A z";
        // console.log("🆔 Ticket:", ticketId);
        // console.log("🕒 TZ:", tz);
        // console.log("⏳ Current:", currentDate.format(formatStr));
        // console.log("📅 Sale Start (normalized):", startDate.format(formatStr));
        // console.log("📅 Sale End (normalized):", endDate.format(formatStr));

        // ✅ Final check
        return (
            currentDate.isSameOrAfter(startDate) &&
            currentDate.isSameOrBefore(endDate)
        );
    };

    // const EventsURL = `/api/v1/events?key=event_details&id=${eventId}`;
    const fetchEventDetailsV1 = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/v3/events/111", {
                headers: {
                    "x-api-key": "28a27307756ad7d153cb2ea460f3559befd868f8ced421be2c744f1278f75f2a",
                },
            });
            // Extract the inner data directly
            const eventDetails = response.data?.data;
            // console.log('>>>>>>>>>>>',eventDetails);
            setEventDetails(eventDetails);
            setActiveTicketType(eventDetails.EventTicketTypes)
            setAddonsDetailsArray(eventDetails.Addons);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching event details:", error);
            throw error;
        }
    };

    const fetchCartDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/v3/front/cart?userId=${userId}`,
                {
                    headers: {
                        "x-api-key": "28a27307756ad7d153cb2ea460f3559befd868f8ced421be2c744f1278f75f2a",
                    }
                }
            );
            const { data } = response;
            // console.log('>>>>>>>',userId);

            if (data && data.data) {
                setCart(data.data);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Failed to fetch event details:", error);
        }
    };

    const fetchAdminFees = async () => {
        try {
            const response = await axios.get("/api/v1/users/?key=admin_fee");
            const { data } = response;
            setIsLoading(true);
            if (data && data.data) {
                setAdminFees(data.data.admin_fees);
                setdonationFees(data.data.donation_fees);
                setIsLoading(false);
            }
        } catch {
            setIsLoading(false);

            console.error("Failed to fetch admin fees:", error);
        }
    };

    useEffect(() => {

        if (document.body) {
            document.querySelector("body").classList.add("front-design");
        }
        // fetchEventDetails();
        fetchEventDetailsV1()
        fetchCartDetails();
        fetchAdminFees();
        return () => {
            document.body.classList.remove("front-design");
        };
    }, []);

    const handleApiCall = async (ticketId, type, symbol) => {
        try {
            // console.log({
            //     userId: userId,
            //     eventId,
            //     ticketId: ticketId,
            //     ticket_type: type,
            //     symbol,
            // });

            const response = await axios.post(
                "/api/v3/front/cart",
                {
                    userId: userId,
                    eventId,
                    ticketId: ticketId,
                    ticket_type: type,
                    symbol,
                },
                {
                    headers: {
                        "x-api-key": "28a27307756ad7d153cb2ea460f3559befd868f8ced421be2c744f1278f75f2a",
                    },
                }
            );


            if (!response.data.success) {
                setErrorMessage(response.data.message || "Something went wrong");
                setSuccessMessage("");
            } else {
                setSuccessMessage(response.data.message);
                setErrorMessage(""); // Clear error message if any
            }

            if (response.data.data.length == 0) {
                // if cart is empty then we reset coupon
                setCoupon("");
                setCouponError("");
                setCouponSuccessMessage("");
                setCouponDetails("");
            }

            setCart(response.data.data);
            clearMessages(); // Start timer to clear message
        } catch (error) {
            console.error("Error calling API:", error);
            setErrorMessage(error.message);
            setSuccessMessage(""); // Clear success message if any
            clearMessages(); // Start timer to clear message
        }
    };

    const handleDeleteCartItem = async (cartId) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
            });

            if (result.isConfirmed) {
                setIsLoading(true);
                const response = await axios.get("/api/v3/front/cart?action=delete_cart_item", {
                    params: { cartId },
                    headers: {
                        "x-api-key": "28a27307756ad7d153cb2ea460f3559befd868f8ced421be2c744f1278f75f2a",
                    },
                });

                if (!response.data.success) {
                    setErrorMessage(response.data.message || "Something went wrong");
                    setSuccessMessage("");
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: response.data.message,
                    });
                } else {
                    setSuccessMessage(response.data.message);
                    setErrorMessage("");
                    Swal.close();
                }
                await fetchCartDetails();
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error calling API:", error);
            setErrorMessage(error.message);
            setSuccessMessage(""); // Clear success message if any
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
            });
            await fetchCartDetails();
            setIsLoading(false);
        }
    };

    const handleIncrement = async (ticketId, type) => {
        setIsLoading(true); // Start loading spinner
        await handleApiCall(ticketId, type, "+");
        setIsLoading(false);
    };

    const handleDecrement = async (ticketId, type) => {
        setIsLoading(true);
        await handleApiCall(ticketId, type, "-");
        setIsLoading(false);
    };

    const handleApplyCoupon = async () => {
        setIsLoading(true);
        if (!coupon) {
            // setCouponError("Please enter a staff ID.");
            // setCouponSuccessMessage("");
            // clearMessages();
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get("/api/v3/front/validate-coupon", {
                params: {
                    couponCode: coupon,
                    action: "is_valid",
                    userId,
                    eventId,
                },

                headers: {
                    "x-api-key": "28a27307756ad7d153cb2ea460f3559befd868f8ced421be2c744f1278f75f2a",
                },

            });
            if (response.data.success) {
                setCouponDetails(response.data.data);
                setCouponSuccessMessage(response.data.message);
                setCouponError("");
                localStorage.setItem("couponCode", coupon);
            } else {
                setCouponError(response.data.message || "Invalid coupon code.");
                setCouponSuccessMessage("");
            }
            // clearMessages();
            setIsLoading(false);
        } catch (error) {
            console.error("Error applying coupon:", error.message);
            const errorMessage =
                error.response?.data?.message ||
                "An error occurred while applying the coupon.";
            setCouponError(errorMessage);
            setCouponSuccessMessage("");
            // clearMessages();
            setIsLoading(false);
        }
    };

    const handleRemoveCoupon = async () => {
        setCouponDetails("");
        setCoupon("");
        setCouponError("");
        setCouponSuccessMessage("");
        // localStorage.removeItem("couponCode");
    };

    const calculateTotals = (cart, discountAmt) => {
        // Calculate total price before discount
        const totalPrice = cart.reduce((total, item) => {
            const price =
                item.ticket_type == "ticket"
                    ? item.EventTicketType?.price || 0
                    : item.Addon?.price || 0;
            return total + price * item.no_tickets;
        }, 0);

        // Apply discount if it exists
        const finalPriceAfterDiscount = totalPrice - (discountAmt || 0);

        // Calculate taxes
        const taxes = finalPriceAfterDiscount * (adminFees / 100); // 17.5

        // Return totals
        return {
            totalPrice,
            finalPriceAfterDiscount,
            taxes,
        };
    };

    const { totalPrice, finalPriceAfterDiscount, taxes } = calculateTotals(
        cart,
        couponDetails?.discountAmt
    );

    const [showNextStep, setShowNextStep] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setShowNextStep(true);
            setIsLoading(false);
        }, 1000);
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
                        navigate.push("/user/my-ticket");
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

    return (
        <>
            <Modal
                show={isActiveNow}
                onHide={makeModalOff}
                aria-labelledby="example-modal-sizes-title-sm"
                className="careyes-chekout-new oxmonten2025EvntSec"
            >
                <Modal.Header>
                    <Button
                        onClick={makeModalOff}
                        className="btn-close ms-auto"
                        variant=""
                    >
                        x
                    </Button>
                </Modal.Header>

                {eventDetails && eventDetails.Name ? (
                    <Modal.Body className="px-3 care-new-check">
                        <LoadingComponent isActive={isLoading} />
                        <form onSubmit={handleSubmit}>
                            <div className="checkout-innr">
                                <Row className="gy-4">
                                    <Col lg={8} className="men-innr-sec">
                                        <div className="checkot-lft">
                                            <h2
                                                className="ck-mn-hd"
                                                dangerouslySetInnerHTML={{
                                                    __html: eventDetails.EventName,
                                                }}
                                            />
                                            {/* <span
                                                className="check-25-lft-pra"
                                                dangerouslySetInnerHTML={{
                                                    __html: eventDetails.Summary,
                                                }}
                                            /> */}

                                            <div className="ck-event-dtl">
                                                <h3>MAIN EVENT I NOVEMBER  6-9, 2025</h3>
                                                <p className="mnt-pr">
                                                    Your main event ticket includes access to the Thursday night, Friday day, and Saturday night celebrations. The welcome dinner on Thursday has limited capacity and can be purchased separately in the ADD-ON section below. Please note that tickets are non-refundable but can be transferred to another Ondalinda member. Locations and themes are subject to change. Final program will be announced closer to event date.
                                                </p>

                                                <div className="eventsBxSec">
                                                    {/* <h5>Events</h5> */}
                                                    <Row className=" gy-3">
                                                        <Col md={4}>
                                                            <div className="evt-innr-dtl">
                                                                <div className="monte-evntimgs">
                                                                    {/* <img
                                                                        src={`/assets/img/front-images/monte25-check-1img.jpg`}
                                                                        className="firstDayEvent"
                                                                    /> */}
                                                                    <Image
                                                                        src={
                                                                            eventDetails?.ImageURL
                                                                                ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${eventDetails.ImageURL}`
                                                                                : `${process.env.NEXT_PUBLIC_S3_URL}/profiles/dummy-user.png`
                                                                        }
                                                                        alt="Event"
                                                                        width={100}
                                                                        height={100}
                                                                        className="firstDayEvent"
                                                                    />
                                                                </div>

                                                                <div className="monte-evntcnts">
                                                                    <hgroup>
                                                                        <h6>SAT, NOV 6, 2025</h6>
                                                                        <p>The Explorer's Quest</p>
                                                                    </hgroup>
                                                                    <p>
                                                                        <span>Time:</span> 10pm to 4am
                                                                    </p>

                                                                    <p>
                                                                        <span>Location:</span> Movida
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Col>

                                                        <Col md={4}>
                                                            <div className="evt-innr-dtl">
                                                                <div className="monte-evntimgs">
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_S3_URL}/profiles/monte25-check-2imgNew.jpg`}
                                                                        className="firstDayEvent"
                                                                    />
                                                                </div>

                                                                <div className="monte-evntcnts">
                                                                    <hgroup>
                                                                        <h6>SAT, NOV 6, 2025</h6>
                                                                        <p>Azure Riviera</p>
                                                                    </hgroup>
                                                                    <p>
                                                                        <span>Time:</span> 2pm to 9pm
                                                                    </p>

                                                                    <p>
                                                                        <span>Location:</span> Ribarsko Selo
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Col>

                                                    </Row>
                                                </div>

                                                <Row className="align-items-center gy-3 marginTpMinus4">
                                                    {activeTicketType &&
                                                        activeTicketType
                                                            .filter((ticketType) => ticketType.type == "open_sales" && ticketType.hidden == "N" && forTicketIsSaleActive(ticketType.sale_start_date, ticketType.sale_end_date, ticketType.id))
                                                            .map((ticketType, index) => (
                                                                <React.Fragment key={ticketType.id}>
                                                                    <Col
                                                                        key={index + Math.random(100)}
                                                                        sm={4}
                                                                        className="mt-0"
                                                                    >
                                                                        <div className="evnt-dtl-lft">

                                                                        </div>
                                                                    </Col>

                                                                    <Col sm={5} xs={6} className="mt-0 PrcRes1">
                                                                        <p className="amountCrt text-end">
                                                                            {/* <span className="me-2">EARLY BIRD</span> */}
                                                                            <span className="me-2">
                                                                                THE ONDALINDA EXPERIENCE
                                                                            </span>
                                                                            {eventDetails &&
                                                                                eventDetails.Currency &&
                                                                                eventDetails.Currency.Currency_symbol
                                                                                ? eventDetails.Currency
                                                                                    .Currency_symbol
                                                                                : null}
                                                                            {parseFloat(
                                                                                ticketType.price
                                                                            ).toLocaleString("en-US", {
                                                                                minimumFractionDigits: 0,
                                                                                maximumFractionDigits: 0,
                                                                            })}{" "}
                                                                            / pers.
                                                                        </p>
                                                                    </Col>

                                                                    <Col sm={3} xs={6} className="mt-0 ">
                                                                        <div className="evnt-dtl-rgt monte-ticy-butn">
                                                                            <Button
                                                                                variant=""
                                                                                onClick={() =>
                                                                                    handleDecrement(
                                                                                        ticketType.id,
                                                                                        "ticket"
                                                                                    )
                                                                                }
                                                                            >
                                                                                -
                                                                            </Button>

                                                                            <span>
                                                                                {cart.find(
                                                                                    (item) =>
                                                                                        (item.ticket_id ==
                                                                                            ticketType.id &&
                                                                                            item.ticket_type == "ticket") ||
                                                                                        (item.addons_id ==
                                                                                            ticketType.id &&
                                                                                            item.ticket_type == "addon")
                                                                                )?.no_tickets || 0}
                                                                            </span>

                                                                            <Button
                                                                                variant=""
                                                                                onClick={() =>
                                                                                    handleIncrement(
                                                                                        ticketType.id,
                                                                                        "ticket"
                                                                                    )
                                                                                }
                                                                            >
                                                                                +
                                                                            </Button>
                                                                        </div>
                                                                    </Col>
                                                                </React.Fragment>
                                                            ))
                                                    }

                                                </Row>

                                            </div>

                                            <div className="ck-event-dtl ck-adon-event">
                                                <h3>ADD-ONS</h3>
                                                <p className="mnt-pr">
                                                    Our add-on events have limited availability and
                                                    space, so they are sold separately and cannot be
                                                    purchased without a main event ticket. These
                                                    events are highly popular experiences, and we
                                                    recommend securing your spot early. Please note
                                                    that all tickets are non-refundable but may be
                                                    transferred to other Ondalinda members. Locations
                                                    and themes are subject to change. Final program
                                                    will be announced closer to event date.
                                                </p>

                                                <Row className=" mt-3 gy-3">
                                                    {eventDetails &&
                                                        eventDetails.Addons &&
                                                        eventDetails.Addons.filter(
                                                            (addonType) =>
                                                                addonType.hidden == "N" &&
                                                                addonType.addon_type == "Normal" &&
                                                                forTicketIsSaleActive(
                                                                    addonType.sale_start_date,
                                                                    addonType.sale_end_date,
                                                                    addonType.id
                                                                )
                                                        ).map((addonType, index) => {

                                                            const availableCount = addonType?.count || 0;

                                                            return (
                                                                <>
                                                                    <Col
                                                                        md={7}
                                                                        key={index + Math.random(100)}
                                                                    >
                                                                        <div className="adon-inr mon25-add-inr">
                                                                            <div className="montenAddOnImgDv">
                                                                                <img
                                                                                    src={
                                                                                        addonType.addon_image
                                                                                            ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${addonType.addon_image}`
                                                                                            : `/imagenot/no-image-icon-1.png`
                                                                                    }
                                                                                    className="MontenAddOnImg"
                                                                                />
                                                                            </div>

                                                                            <div className="mnto-add-cnt">
                                                                                <hgroup>
                                                                                    <h6>{addonType.addon_day}</h6>
                                                                                    <p>
                                                                                        {addonType.name}
                                                                                    </p>
                                                                                </hgroup>

                                                                                {/* <Col md={7}> */}
                                                                                <div className="adon-desc">
                                                                                    <p>{addonType.description}</p>
                                                                                </div>
                                                                                {/* </Col> */}

                                                                                <div className="adon-time">
                                                                                    {addonType.addon_time && (
                                                                                        <p>
                                                                                            <span>Time: </span>
                                                                                            {addonType.addon_time}{" "}
                                                                                        </p>
                                                                                    )}

                                                                                    {addonType.addon_location && (
                                                                                        <p>
                                                                                            <span>Location: </span>
                                                                                            {
                                                                                                addonType.addon_location
                                                                                            }{" "}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Col>

                                                                    <Col
                                                                        md={5}
                                                                        className="d-flex justify-content-between align-items-end"
                                                                    >
                                                                        <div className="adon-inr-rgt monten-ason-inr-rgt">
                                                                            <p className="montenPriceDv">
                                                                                {eventDetails &&
                                                                                    eventDetails.Currency &&
                                                                                    eventDetails.Currency
                                                                                        .Currency_symbol
                                                                                    ? eventDetails.Currency
                                                                                        .Currency_symbol
                                                                                    : null}
                                                                                {parseFloat(
                                                                                    addonType.price
                                                                                ).toLocaleString("en-US", {
                                                                                    minimumFractionDigits: 0,
                                                                                    maximumFractionDigits: 0,
                                                                                })}{" "}
                                                                                / pers.{" "}
                                                                            </p>

                                                                            {availableCount > 0 ? (
                                                                                <div className="evnt-dtl-rgt">
                                                                                    <Button
                                                                                        variant=""
                                                                                        onClick={() =>
                                                                                            handleDecrement(
                                                                                                addonType.id,
                                                                                                "addon"
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        -
                                                                                    </Button>

                                                                                    <span>
                                                                                        {cart.find(
                                                                                            (item) =>
                                                                                                (item.addons_id ==
                                                                                                    addonType.id &&
                                                                                                    item.ticket_type ==
                                                                                                    "ticket") ||
                                                                                                (item.addons_id ==
                                                                                                    addonType.id &&
                                                                                                    item.ticket_type ==
                                                                                                    "addon")
                                                                                        )?.no_tickets || 0}
                                                                                    </span>

                                                                                    <Button
                                                                                        variant=""
                                                                                        onClick={() =>
                                                                                            handleIncrement(
                                                                                                addonType.id,
                                                                                                "addon"
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        +
                                                                                    </Button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="evnt-dtl-rgt">
                                                                                    <span className="">Sold Out</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                    </Col>
                                                                </>
                                                            );
                                                        })}
                                                </Row>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* Checkout Calculation Start */}

                                    <Col lg={4} className="men-innr-sec monten25-rgt-pnl">
                                        <div className="checkot-rgt">
                                            <div
                                                className="checkot-rgt-bnr mont25rgt-bnt "
                                                style={{
                                                    background: `url(${eventDetails && eventDetails.ImageURL
                                                        ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${eventDetails.ImageURL}`
                                                        : "no-image-1.png"
                                                        })`,
                                                }}

                                            >
                                                <h2
                                                    className=""
                                                    dangerouslySetInnerHTML={{
                                                        __html: eventDetails.ShortName,
                                                    }}
                                                />
                                            </div>
                                            {cart.length > 0 ? (
                                                <div className="checkot-tct-purcs monte25-tct-purcs">
                                                    <h6>YOUR TICKETS</h6>
                                                    {cart.length > 0 &&
                                                        cart.map((item, index) => (
                                                            <div
                                                                key={index + Math.random(100)}
                                                                className="yr-tct-dtl"
                                                            >
                                                                <p className="yr-tct-dtl-para">
                                                                    {item.no_tickets}x{" "}
                                                                    <span>
                                                                        {item.ticket_type == "ticket" &&
                                                                            item.EventTicketType
                                                                            ? item.EventTicketType.title
                                                                            : item.Addon
                                                                                ? item.Addon.name
                                                                                : "Unknown"}
                                                                    </span>
                                                                </p>
                                                                <p
                                                                    style={{ cursor: "pointer" }}
                                                                    title="Delete Item"
                                                                >
                                                                    {eventDetails &&
                                                                        eventDetails.Currency &&
                                                                        eventDetails.Currency.Currency_symbol
                                                                        ? eventDetails.Currency.Currency_symbol
                                                                        : null}

                                                                    {item.ticket_type == "ticket" &&
                                                                        item.EventTicketType
                                                                        ? (
                                                                            item.EventTicketType.price *
                                                                            item.no_tickets
                                                                        ).toLocaleString()
                                                                        : item.ticket_type == "addon" &&
                                                                            item.Addon
                                                                            ? (
                                                                                item.Addon.price * item.no_tickets
                                                                            ).toLocaleString()
                                                                            : 0}
                                                                    <img
                                                                        src={`/assets/img/front-images/caryes-ticket-dlt.png`}
                                                                        alt="delete-icon"
                                                                        onClick={() =>
                                                                            handleDeleteCartItem(item.id)
                                                                        } // Assuming you implement this function
                                                                    />
                                                                </p>
                                                            </div>
                                                        ))}

                                                    {errorMessage && (
                                                        <p
                                                            className="error-message"
                                                            style={{
                                                                color: "red",
                                                                textTransform: "uppercase",
                                                            }}
                                                        >
                                                            {errorMessage}
                                                        </p>
                                                    )}

                                                    {successMessage && (
                                                        <p
                                                            className="success-message"
                                                            style={{
                                                                color: "#ff6d94",
                                                                textTransform: "uppercase",
                                                            }}
                                                        >
                                                            {successMessage}
                                                        </p>
                                                    )}

                                                    <h6 className="mt-5 rgt-ttl-txt">
                                                        TOTAL{" "}
                                                        {cart.reduce(
                                                            (total, item) => total + item.no_tickets,
                                                            0
                                                        )}{" "}
                                                        ITEM
                                                        {cart.reduce(
                                                            (total, item) => total + item.no_tickets,
                                                            0
                                                        ) > 1
                                                            ? "S"
                                                            : ""}
                                                    </h6>

                                                    <div className="apply-cd">
                                                        {couponError && (
                                                            <p
                                                                style={{
                                                                    color: "red",
                                                                    textTransform: "uppercase",
                                                                }}
                                                            >
                                                                {couponError}
                                                            </p>
                                                        )}
                                                        {couponSuccessMessage && (
                                                            <p
                                                                style={{
                                                                    color: "#ff6d94",
                                                                    textTransform: "uppercase",
                                                                }}
                                                            >
                                                                {couponSuccessMessage}
                                                            </p>
                                                        )}
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
                                                                    onClick={handleRemoveCoupon} // Function to remove the coupon
                                                                >
                                                                    REMOVE
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant=""
                                                                    className="btn"
                                                                    type="button"
                                                                    onClick={handleApplyCoupon} // Function to apply the coupon
                                                                >
                                                                    APPLY
                                                                </Button>
                                                            )}
                                                        </InputGroup>
                                                    </div>

                                                    <div className="tickt-ttl-prs">
                                                        <div className="tct-ttl-innr">
                                                            <p>PRICE</p>
                                                            <span>
                                                                {eventDetails &&
                                                                    eventDetails.Currency &&
                                                                    eventDetails.Currency.Currency_symbol
                                                                    ? eventDetails.Currency.Currency_symbol
                                                                    : null}

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

                                                        {couponDetails && (
                                                            <div className="tct-ttl-innr">
                                                                <p>STAFF ID</p>
                                                                <span>
                                                                    {couponDetails.discount_type ===
                                                                        "percentage" ? (
                                                                        <>
                                                                            -{" "}
                                                                            {Math.floor(
                                                                                couponDetails.discount_value
                                                                            )}
                                                                            %
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            -{" "}
                                                                            {eventDetails &&
                                                                                eventDetails.Currency &&
                                                                                eventDetails.Currency.Currency_symbol
                                                                                ? eventDetails.Currency
                                                                                    .Currency_symbol
                                                                                : null}
                                                                            {couponDetails.discountAmt?.toLocaleString()}
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="tct-ttl-innr">
                                                            <p>FEES & TAXES ({adminFees}%)</p>
                                                            <span>
                                                                {eventDetails &&
                                                                    eventDetails.Currency &&
                                                                    eventDetails.Currency.Currency_symbol
                                                                    ? eventDetails.Currency.Currency_symbol
                                                                    : null}
                                                                {Math.round(taxes).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        <div className="tct-ttl-innr">
                                                            <p>TOTAL</p>
                                                            <p>
                                                                {eventDetails &&
                                                                    eventDetails.Currency &&
                                                                    eventDetails.Currency.Currency_symbol
                                                                    ? eventDetails.Currency.Currency_symbol
                                                                    : null}

                                                                {Math.round(
                                                                    finalPriceAfterDiscount + taxes
                                                                ).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {eventDetails.isSaleStart === "N" ? (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                backgroundColor:
                                                                    "#f8d7da" /* Soft red background */,
                                                                padding: "20px",
                                                                borderRadius: "8px",
                                                                boxShadow:
                                                                    "0px 0px 15px rgba(0, 0, 0, 0.1)",
                                                            }}
                                                        >
                                                            <p
                                                                style={{
                                                                    margin: 0,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    fontSize: "16px",
                                                                    color: "#721c24" /* Dark red text */,
                                                                    fontWeight: "bold",
                                                                    animation: "blink 1.5s infinite",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        fontSize: "24px",
                                                                        color: "#dc3545" /* Red icon */,
                                                                        marginRight: "10px",
                                                                    }}
                                                                >
                                                                    <i className="fa fa-lock" />
                                                                </span>
                                                                <span>
                                                                    The ticket sale is temporarily closed.
                                                                    We're working to start it shortly. Please
                                                                    check back soon!
                                                                </span>
                                                            </p>
                                                        </div>
                                                    ) : (

                                                        <div className="by-nw-btn">
                                                            <Button
                                                                variant=""
                                                                className="btn"
                                                                type="submit"
                                                                onClick={(e) => {
                                                                    const totalAmount = Math.round(
                                                                        finalPriceAfterDiscount + taxes
                                                                    );
                                                                    if (totalAmount == 0) {
                                                                        e.preventDefault();
                                                                        handleFreeTicket();
                                                                    }
                                                                }}
                                                            >
                                                                {Math.round(
                                                                    finalPriceAfterDiscount + taxes
                                                                ) == 0
                                                                    ? "FREE TICKET"
                                                                    : "BUY TICKETS"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {/* <p className="dntin-nt">Ondalinda donates 10% of the proceeds to local charity projects.</p> */}

                                                </div>


                                            ) : (
                                                <div className="cart-wrapper">
                                                    <h3 className="cart-emty">Cart is Empty</h3>
                                                </div>
                                            )}
                                        </div>
                                    </Col>

                                    {/* Checkout Calculation End */}
                                </Row>
                            </div>
                        </form>
                    </Modal.Body>
                ) : (
                    <LoadingComponent isActive={isLoading} />
                )}
            </Modal>
        </>
    );
}
