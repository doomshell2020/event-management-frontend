import Head from "next/head";
import { Inter } from "next/font/google";
 
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
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Seo from "@/shared/layout-components/seo/seo";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert
import CheckOut from "./CheckOut";
// import Moment from "react-moment";
import moment from "moment-timezone";

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

export default function Cart({ isActiveNow, makeModalOff, profile = {}, event_id }) {
    const [show, setShow] = useState(isActiveNow);
    const handleShow = () => setShow(true);
    let navigate = useRouter();
    const userId = 11493;
    // const eventId = 110;
    // const eventId = 153;
    const eventId = event_id;
    const [isLoading, setIsLoading] = useState(false); // State to control loading spinner
    const [eventDetails, setEventDetails] = useState({}); // console.log(UserID);
    const [addonsDetailsArray, setAddonsDetailsArray] = useState([]); // console.log(UserID);
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
    useEffect(() => {
        setShow(isActiveNow);
    }, [isActiveNow]);

    // Ensure profile.id is available before proceeding
    // useEffect(() => {
    //   if (profile && profile.id) {
    //     // console.log("Profile ID:", profile.id);
    //     // Perform actions that require profile.id
    //   } else {
    //     console.warn("Profile or Profile ID is undefined");
    //   }
    // }, [profile]);

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
            console.error(
                "Invalid input: Missing sale start date, end date, or event time zone"
            );
            return false;
        }
        // Validate the timezone
        if (!moment.tz.zone(eventDetails.EventTimeZone)) {
            console.error("Invalid timezone:", eventDetails.EventTimeZone);
            return false;
        }
        const currentDate = moment().tz(eventDetails.EventTimeZone);
        const startDate = moment.tz(saleStartDate, eventDetails.EventTimeZone);
        const endDate = moment.tz(saleEndDate, eventDetails.EventTimeZone);
        if (!startDate.isValid() || !endDate.isValid()) {
            console.error("Invalid date format for sale start or end date");
            return false;
        }
        return (
            currentDate.isSameOrAfter(startDate) &&
            currentDate.isSameOrBefore(endDate)
        );
    };

    const EventsURL = `/api/v1/events?key=event_detailsAdminPreview&id=${eventId}`;
    const fetchEventDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(EventsURL);
            const { data } = response;

            if (data && data.data) {
                setEventDetails(data.data.eventDetails);
                setAddonsDetailsArray(data.data.addonCountResults);
                // console.log('data.data.eventDetails',data.data.eventDetails);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);

            console.error("Failed to fetch event details:", error);
        }
    };

    const fetchCartDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/v1/front/cart?userId=${userId}`);
            const { data } = response;
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
        fetchEventDetails();
        fetchCartDetails();
        fetchAdminFees();
        return () => {
            document.body.classList.remove("front-design");
        };
    }, []);

    const handleModalClose = () => {
        makeModalOff(false);
        setShow(false);
    };

    const handleApiCall = async (ticketId, type, symbol) => {
        try {
            const response = await axios.post("/api/v1/front/cart", {
                userId: userId,
                eventId,
                ticketId: ticketId,
                ticket_type: type,
                symbol,
            });

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
                const response = await axios.get(
                    "/api/v1/front/cart?action=delete_cart_item",
                    {
                        params: { cartId },
                    }
                );

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
            const response = await axios.get("/api/v1/validate-coupon", {
                params: {
                    couponCode: coupon,
                    action: "is_valid",
                    userId,
                    eventId,
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
                item.ticket_type === "ticket"
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
                show={show && !cartModalShow}
                aria-labelledby="example-modal-sizes-title-sm"
                className="careyes-chekout-new oxmonten2025EvntSec"
                onHide={handleModalClose}
            >
                {!showNextStep ? (
                    <>
                        <Modal.Header>
                            <Button
                                onClick={handleModalClose}
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
                                                    <span
                                                        className="check-25-lft-pra"
                                                        dangerouslySetInnerHTML={{
                                                            __html: eventDetails.Summary,
                                                        }}
                                                    />

                                                    <div className="ck-event-dtl">
                                                        {/* {eventDetails.EventTicketTypes.filter((value) => value.status === "Y")
                                                            .map((value) => {
                                                                return (
                                                                    <div key={value.id}>
                                                                        {value.description ? (
                                                                            <div dangerouslySetInnerHTML={{ __html: value.description }} />
                                                                        ) : (
                                                                            "N/A"
                                                                        )} */}
                                                        <Row className="align-items-center gy-3 marginTpMinus4">
                                                            <div dangerouslySetInnerHTML={{ __html: eventDetails.ticket_description }} />
                                                            {eventDetails &&
                                                                eventDetails.EventTicketTypes &&
                                                                eventDetails.EventTicketTypes.filter(
                                                                    (ticketType) =>
                                                                        ticketType.status === "Y"
                                                                    // ticketType.type == "open_sales" &&
                                                                    // ticketType.hidden == "N" &&
                                                                    // isSaleActive(
                                                                    //     ticketType.sale_start_date,
                                                                    //     ticketType.sale_end_date
                                                                    // )
                                                                ).map((ticketType, index) => (
                                                                    <>
                                                                        {/* <div dangerouslySetInnerHTML={{ __html: eventDetails.ticket_description }} /> */}
                                                                        <Col
                                                                            key={index + Math.random(100)}
                                                                            sm={4}
                                                                            className="mt-0"
                                                                        >
                                                                            <div className="evnt-dtl-lft">
                                                                            </div>
                                                                        </Col>
                                                                        <Col sm={5} xs={6} className="mt-0">
                                                                            <p className="amountCrt text-end">
                                                                                <span className="me-2">
                                                                                    {/* THE ONDALINDA EXPERIENCE */}
                                                                                    {ticketType.title ? ticketType.title : "N/A"}
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

                                                                        <Col sm={3} xs={6} className="mt-0">
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
                                                                    </>
                                                                ))}
                                                        </Row>
                                                        {/* </div> */}
                                                        {/* )
                                                            })} */}
                                                    </div>


                                                    {/* <div className="ck-event-dtl">
                                                        <h3>MAIN EVENT I JULY 3-6, 2025</h3>
                                                        <p className="mnt-pr">
                                                            Your main event ticket includes access to the
                                                            Thursday, Friday, and Saturday night celebrations.
                                                            The welcome dinner on Thursday has limited
                                                            capacity and can be purchased separately in the
                                                            ADD-ON section below. Please note that tickets are
                                                            non-refundable but can be transferred to another
                                                            Ondalinda member. Locations and themes are subject
                                                            to change. Final program will be announced closer
                                                            to event date.
                                                        </p>

                                                        <div className="eventsBxSec">
                                                            <Row className=" gy-3">
                                                                <Col md={4}>
                                                                    <div className="evt-innr-dtl">
                                                                        <div className="monte-evntimgs">
                                                                            <img
                                                                                src={`/assets/img/front-images/monte25-check-1img.jpg`}
                                                                                className="firstDayEvent"
                                                                            />
                                                                        </div>

                                                                        <div className="monte-evntcnts">
                                                                            <hgroup>
                                                                                <h6>THU, JULY 3, 2025</h6>
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
                                                                                src={`/assets/img/front-images/monte25-check-2img.jpg`}
                                                                                className="firstDayEvent"
                                                                            />
                                                                        </div>

                                                                        <div className="monte-evntcnts">
                                                                            <hgroup>
                                                                                <h6>FRI, JULY 4, 2025</h6>
                                                                                <p>Queen Teuta's Vessel</p>
                                                                            </hgroup>
                                                                            <p>
                                                                                <span>Time:</span> 10pm to 4am
                                                                            </p>

                                                                            <p>
                                                                                <span>Location:</span> Kanli Kula
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Col>

                                                                <Col md={4}>
                                                                    <div className="evt-innr-dtl">
                                                                        <div className="monte-evntimgs">
                                                                            <img
                                                                                src={`/assets/img/front-images/monte25-check-3img.jpg`}
                                                                                className="firstDayEvent"
                                                                            />
                                                                        </div>

                                                                        <div className="monte-evntcnts">
                                                                            <hgroup>
                                                                                <h6>SAT, JULY 5, 2025</h6>
                                                                                <p>Treasures of the Sea</p>
                                                                            </hgroup>
                                                                            <p>
                                                                                <span>Time:</span> 10pm to 6am
                                                                            </p>

                                                                            <p>
                                                                                <span>Location:</span> Arza Fortress
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                        <Row className="align-items-center gy-3 marginTpMinus4">
                                                            {eventDetails &&
                                                                eventDetails.EventTicketTypes &&
                                                                eventDetails.EventTicketTypes.filter(
                                                                    (ticketType) =>
                                                                        ticketType.type == "open_sales" &&
                                                                        ticketType.hidden == "N" &&
                                                                        isSaleActive(
                                                                            ticketType.sale_start_date,
                                                                            ticketType.sale_end_date
                                                                        )
                                                                ).map((ticketType, index) => (
                                                                    <>
                                                                        <Col
                                                                            key={index + Math.random(100)}
                                                                            sm={4}
                                                                            className="mt-0"
                                                                        >
                                                                            <div className="evnt-dtl-lft">


                                                                            </div>
                                                                        </Col>

                                                                        <Col sm={5} xs={6} className="mt-0">
                                                                            <p className="amountCrt text-end">
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

                                                                        <Col sm={3} xs={6} className="mt-0">
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
                                                                    </>
                                                                ))}
                                                        </Row>
                                                    </div> */}

                                                    <div className="ck-event-dtl ck-adon-event">
                                                        {/* <h3>ADD-ON</h3> */}
                                                        <p className="mnt-pr">
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: eventDetails.addon_description
                                                                }}
                                                            />
                                                        </p>
                                                        {eventDetails.Addons.filter(
                                                            (addonType) =>
                                                                // addonType.hidden == "N" &&
                                                                addonType.status === "Y" &&
                                                                addonType.addon_type == "Normal"
                                                            // isSaleActive(addonType.sale_start_date, addonType.sale_end_date)
                                                        ).map((addonType) => {
                                                            const addonDetails = addonsDetailsArray.find(
                                                                (addon) => addon.addonId == addonType.id
                                                            );
                                                            const totalAvailability = addonDetails?.total_addon || 0;
                                                            const bookedCount = addonDetails ? addonDetails.count : 0;
                                                            const availableCount = totalAvailability - bookedCount;

                                                            return (
                                                                <div key={addonType.id}>
                                                                    {/* Sort Name and Description */}
                                                                    {/* <h3>{addonType.sortName || "N/A"}</h3>
                                                                    <p className="mnt-pr">{addonType.description || " "}</p> */}

                                                                    <Row className="mt-3 gy-3">
                                                                        <Col md={7}>
                                                                            <div className="adon-inr mon25-add-inr">
                                                                                <div className="montenAddOnImgDv">
                                                                                    <img
                                                                                        src={
                                                                                            addonType.addon_image
                                                                                                ? `/uploads/profiles/${addonType.addon_image}`
                                                                                                : `/imagenot/no-image-icon-1.png`
                                                                                        }
                                                                                        className="MontenAddOnImg"
                                                                                    />
                                                                                </div>

                                                                                <div className="mnto-add-cnt">
                                                                                    <hgroup>
                                                                                        <h6>{addonType.addon_day}</h6>
                                                                                        <p>{addonType.name}</p>
                                                                                    </hgroup>

                                                                                    {/* <div className="adon-desc">
                                                                                        <p>{addonType.description}</p>
                                                                                    </div> */}

                                                                                    <div className="adon-time">
                                                                                        {addonType.addon_time && (
                                                                                            <p>
                                                                                                <span>Time: </span>
                                                                                                {addonType.addon_time}
                                                                                            </p>
                                                                                        )}
                                                                                        {addonType.addon_location && (
                                                                                            <p>
                                                                                                <span>Location: </span>
                                                                                                {addonType.addon_location}
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
                                                                                    {eventDetails?.Currency?.Currency_symbol || ""}
                                                                                    {parseFloat(addonType.price).toLocaleString("en-US", {
                                                                                        minimumFractionDigits: 0,
                                                                                        maximumFractionDigits: 0,
                                                                                    })}{" "}
                                                                                    / pers.
                                                                                </p>

                                                                                {availableCount > 0 ? (
                                                                                    <div className="evnt-dtl-rgt">
                                                                                        <Button
                                                                                            variant=""
                                                                                            onClick={() =>
                                                                                                handleDecrement(addonType.id, "addon")
                                                                                            }
                                                                                        >
                                                                                            -
                                                                                        </Button>

                                                                                        <span>
                                                                                            {cart.find(
                                                                                                (item) =>
                                                                                                    (item.addons_id == addonType.id &&
                                                                                                        item.ticket_type == "ticket") ||
                                                                                                    (item.addons_id == addonType.id &&
                                                                                                        item.ticket_type == "addon")
                                                                                            )?.no_tickets || 0}
                                                                                        </span>

                                                                                        <Button
                                                                                            variant=""
                                                                                            onClick={() =>
                                                                                                handleIncrement(addonType.id, "addon")
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
                                                                    </Row>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>


                                                    <div className="ck-event-dtl ck-adon-event">
                                                        {/* <h3 className="text-uppercase">
                                                            Speed Boat Transportation
                                                        </h3> */}
                                                        <p className="mnt-pr">
                                                            {eventDetails.other_description ? (
                                                                <div dangerouslySetInnerHTML={{ __html: eventDetails.other_description }} />
                                                            ) : (
                                                                "N/A"
                                                            )}
                                                        </p>


                                                        {eventDetails &&
                                                            eventDetails.Addons &&
                                                            eventDetails.Addons.filter(
                                                                (addonType) =>
                                                                    // addonType.hidden == "N" &&
                                                                    addonType.status === "Y" &&
                                                                    addonType.addon_type == "Special"
                                                            ).map((addonType, index) => {

                                                                const addonDetails = addonsDetailsArray.find(
                                                                    (addon) => addon.addonId === addonType.id
                                                                );
                                                                const totalAvailability =
                                                                    addonDetails?.total_addon || 0;
                                                                const bookedCount = addonDetails
                                                                    ? addonDetails.count
                                                                    : 0;
                                                                const availableCount =
                                                                    totalAvailability - bookedCount;

                                                                return (
                                                                    <>
                                                                        {/* <h3 className="text-uppercase">
                                                                            {addonType.name ? addonType.name : "N/A"}
                                                                        </h3>
                                                                        <p className="mnt-pr">
                                                                           
                                                                            {addonType.description ? (
                                                                                <div dangerouslySetInnerHTML={{ __html: addonType.description }} />
                                                                            ) : (
                                                                                "N/A"
                                                                            )}
                                                                        </p> */}
                                                                        <Row className=" mt-3 gy-3">
                                                                            <Col
                                                                                md={8}
                                                                                key={index + Math.random(100)}
                                                                            >
                                                                                <div className="adon-inr special-addon-inr  mon25-add-inr">
                                                                                    <div className="montenAddOnImgDv">
                                                                                        <img
                                                                                            src={
                                                                                                addonType.addon_image
                                                                                                    ? `/uploads/profiles/${addonType.addon_image}`
                                                                                                    : `/imagenot/no-image-icon-1.png`
                                                                                            }
                                                                                            className="MontenAddOnImg"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="mnto-add-cnt">
                                                                                        <hgroup>
                                                                                            <h6>{addonType.addon_day}</h6>
                                                                                        </hgroup>
                                                                                        <div className="adon-desc">
                                                                                            <p>
                                                                                                {/* {addonType.description} */}
                                                                                                {addonType.description ? (
                                                                                                    <div dangerouslySetInnerHTML={{ __html: addonType.description }} />
                                                                                                ) : (
                                                                                                    "N/A"
                                                                                                )}

                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="adon-time">
                                                                                            {addonType.addon_time && (
                                                                                                <p>
                                                                                                    <span>Time: </span>
                                                                                                    {addonType.addon_time}{" "}
                                                                                                </p>
                                                                                            )}
                                                                                            {addonType.addon_location && (
                                                                                                <p>
                                                                                                    <span>
                                                                                                        Transfer Locations:{" "}
                                                                                                    </span>
                                                                                                    {addonType.addon_location}{" "}
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </Col>

                                                                            <Col
                                                                                md={4}
                                                                                className="d-flex justify-content-between align-items-end"
                                                                            >
                                                                                <div className="specil-adon-btn">
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
                                                                                                <span className="">
                                                                                                    Sold Out
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                    </>
                                                                );
                                                            })}

                                                    </div>


                                                    {/* <div className="ck-event-dtl ck-adon-event">
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
                                                                        isSaleActive(
                                                                            addonType.sale_start_date,
                                                                            addonType.sale_end_date
                                                                        )
                                                                ).map((addonType, index) => {

                                                                    const addonDetails = addonsDetailsArray.find(
                                                                        (addon) => addon.addonId == addonType.id
                                                                    );
                                                                    const totalAvailability =
                                                                        addonDetails?.total_addon || 0;
                                                                    const bookedCount = addonDetails
                                                                        ? addonDetails.count
                                                                        : 0;
                                                                    const availableCount =
                                                                        totalAvailability - bookedCount;

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
                                                                                                    ? `/uploads/profiles/${addonType.addon_image}`
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


                                                                                        <div className="adon-desc">
                                                                                            <p>{addonType.description}</p>
                                                                                        </div>


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



                                                    <div className="ck-event-dtl ck-adon-event">
                                                        <h3 className="text-uppercase">
                                                            Speed Boat Transportation
                                                        </h3>
                                                        <p className="mnt-pr">
                                                            You have the option to purchase a speedboat pass,
                                                            granting access to Ondalinda's exclusive
                                                            transportation service within pre-specified
                                                            transfer windows. This pass comes in the form of a
                                                            bracelet, which is required to board the
                                                            speedboats. Alternatively, you may arrange your
                                                            own transportation through one of our preferred
                                                            partners. For full details and pricing, please
                                                            visit the transportation page.
                                                        </p>
                                                        <Row className=" mt-3 gy-3">
                                                            {eventDetails &&
                                                                eventDetails.Addons &&
                                                                eventDetails.Addons.filter(
                                                                    (addonType) =>
                                                                        addonType.hidden == "N" &&
                                                                        addonType.addon_type == "Special"
                                                                ).map((addonType, index) => {
                                                                    
                                                                    const addonDetails = addonsDetailsArray.find(
                                                                        (addon) => addon.addonId === addonType.id
                                                                    );
                                                                    const totalAvailability =
                                                                        addonDetails?.total_addon || 0;
                                                                    const bookedCount = addonDetails
                                                                        ? addonDetails.count
                                                                        : 0;
                                                                    const availableCount =
                                                                        totalAvailability - bookedCount;

                                                                    return (
                                                                        <>
                                                                            <Col
                                                                                md={8}
                                                                                key={index + Math.random(100)}
                                                                            >
                                                                                <div className="adon-inr special-addon-inr  mon25-add-inr">
                                                                                    <div className="montenAddOnImgDv">
                                                                                        <img
                                                                                            src={
                                                                                                addonType.addon_image
                                                                                                    ? `/uploads/profiles/${addonType.addon_image}`
                                                                                                    : `/imagenot/no-image-icon-1.png`
                                                                                            }
                                                                                            className="MontenAddOnImg"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="mnto-add-cnt">
                                                                                        <hgroup>
                                                                                            <h6>{addonType.addon_day}</h6>         
                                                                                        </hgroup>
                                                                                        <div className="adon-desc">
                                                                                            <p>{addonType.description}</p>
                                                                                        </div>
                                                                                        <div className="adon-time">
                                                                                            {addonType.addon_time && (
                                                                                                <p>
                                                                                                    <span>Time: </span>
                                                                                                    {addonType.addon_time}{" "}
                                                                                                </p>
                                                                                            )}
                                                                                            {addonType.addon_location && (
                                                                                                <p>
                                                                                                    <span>
                                                                                                        Transfer Locations:{" "}
                                                                                                    </span>
                                                                                                    {addonType.addon_location}{" "}
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </Col>

                                                                            <Col
                                                                                md={4}
                                                                                className="d-flex justify-content-between align-items-end"
                                                                            >
                                                                                <div className="specil-adon-btn">
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
                                                                                                <span className="">
                                                                                                    Sold Out
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Col>
                                                                        </>
                                                                    );
                                                                })}
                                                        </Row>
                                                    </div> */}

                                                </div>
                                            </Col>

                                            {/* Checkout Calculation Start */}

                                            <Col lg={4} className="men-innr-sec monten25-rgt-pnl">
                                                <div className="checkot-rgt">
                                                    <div
                                                        className="checkot-rgt-bnr mont25rgt-bnt "
                                                        style={{
                                                            background: `url(/uploads/profiles/${eventDetails && eventDetails.ImageURL
                                                                ? eventDetails.ImageURL
                                                                : "no-image-1.png"
                                                                })`,
                                                        }}
                                                    >
                                                        {/* <h2>
                              O<span className="grn-clr">x</span>MONTENEGRO
                            </h2> */}
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
                                                                TOTAL:{" "}
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
                                                                    <p>TAXES & FEES ({adminFees}%)</p>
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
                                                                            if (totalAmount === 0) {
                                                                                e.preventDefault();
                                                                                handleFreeTicket();
                                                                            }
                                                                        }}
                                                                    >
                                                                        {Math.round(
                                                                            finalPriceAfterDiscount + taxes
                                                                        ) === 0
                                                                            ? "FREE TICKET"
                                                                            : "BUY TICKETS"}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            <p className="dntin-nt">Ondalinda donates 10% of the proceeds to local charity projects.</p>

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
                    </>
                ) : (
                    <CheckOut
                        userId={userId}
                        eventId={eventId}
                        handleModalClose={handleModalClose}
                        showNextStep={setShowNextStep}
                        couponDetails={couponDetails}
                        adminFees={adminFees}
                        donationFees={donationFees}
                    />
                )}
            </Modal >
        </>
    );
}
