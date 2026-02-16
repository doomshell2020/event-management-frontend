import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import api from "@/utils/api";
import Swal from "sweetalert2";
import { useRouter } from 'next/router';
const CreatePromotionCode = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const router = useRouter();
    const EventId = router.query.event_id || "";
    const [validityPeriod, setValidityPeriod] = useState("");
    const [validFromDate, setValidFromDate] = useState("");
    const [validToDate, setValidToDate] = useState("");
    const [applicableFor, setApplicableFor] = useState("");
    const [eventName, setEventName] = useState("");
    const [discountType, setDiscountType] = useState(""); // Default to 'percentage'
    const [couponPrefix, setCouponPrefix] = useState("");
    const [couponCount, setCouponCount] = useState("");
    const [discountValue, setDiscountValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [eventDetails, setEventDetails] = useState({});
    // console.log("eventDetails", eventDetails);
    const [selectedEvent, setSelectedEvent] = useState("");


    const handlePrefixChange = (e) => {
        let value = e.target.value;
        // Allow only letters and numbers (A-Z, a-z, 0-9)
        const regex = /^[a-zA-Z0-9]*$/;
        if (regex.test(value)) {
            // Convert to uppercase
            setCouponPrefix(value.toUpperCase());
        }
    };

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        setIsLoading(true);
        event.preventDefault();
        // Form is valid, gather data
        const data = {
            event_id: selectedEvent,
            discountType,
            discountValue,
            validityPeriod,
            validFromDate,
            validToDate,
            applicableFor,
            couponCount,
            couponPrefix,
        };

        try {
            // Make a POST request to the API using Axios
            const response = await api.post("/api/v1/coupons/create", data);
            Swal.fire({
                icon: "success",
                title: "Coupon Code Created!",
                text: response.data.message,
                confirmButtonText: "OK",
            });

            // Reset form (optional)
            setSelectedEvent("");
            setDiscountType("percentage");
            setDiscountValue("");
            setValidityPeriod("unlimited");
            setValidFromDate("");
            setValidToDate("");
            setApplicableFor("");
            setCouponPrefix("");
            setCouponCount("");
            goBack();
            setIsLoading(false);
        } catch (error) {
            // Handle error response
            console.error("Error occurred:", error);
            setIsLoading(false);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: error.response
                    ? error.response.data.message || error.message
                    : "Something went wrong. Please try again.",
                confirmButtonText: "OK",
            });
        }
    };



    const getEvents = async () => {
        try {
            const { data } = await api.get("/api/v1/admin/email-templates/events");
            setEvents(data?.data.events || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        }
    };

    // get event details
    const getEventsDetails = async () => {
        try {
            const { data } = await api.get(`/api/v1/admin/events/event-details/${EventId}`);
            setEventDetails(data?.data.event || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        }
    };



    useEffect(() => {
        getEvents();
    }, []);
    useEffect(() => {
        if (EventId) {
            setSelectedEvent(EventId);
            getEventsDetails();
        }
    }, [EventId]);

    useEffect(() => {
        if (selectedEvent && events.length > 0) {
            const foundEvent = events.find(
                (ev) => String(ev.id) === String(selectedEvent)
            );

            setEventName(foundEvent?.name || "");
        }
    }, [selectedEvent, events]);

    // Handler for the "Back" button click
    const goBack = () => {
        router.push(`/promotioncodes/${EventId}`);
    };



    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="post-eventpg" className="my-4">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-deta bg-white mt-3 mb-4 pb-3 rounded custom-shadow">
                                <h2 className="text-16 text-white text-uppercase position-relative text-start fw-bold">
                                    <i className="far fa-calendar-plus"></i> Add New Coupon || {eventName}
                                </h2>
                                <form
                                    onSubmit={handleSubmit}>
                                    <div className="inner-formdeta p-4 text-start">
                                        <div className="row g-3">
                                            {/* Event (Readonly) */}
                                            <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Event <span className="text-danger">*</span>
                                                </label>

                                                <select
                                                    className="form-select rounded-0"
                                                    value={selectedEvent || ""}
                                                    disabled
                                                >
                                                    <option value="">Select Event</option>
                                                    {events.map((item) => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Coupon Count */}
                                            <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Number of Coupon Codes <span className="text-danger">*</span>
                                                </label>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control rounded-0"
                                                    placeholder="Enter number of Coupon codes e.g., 10"
                                                    value={couponCount}
                                                    onChange={(e) => setCouponCount(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            {/* Coupon Prefix */}
                                            <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Coupon Code Prefix <span className="text-danger">*</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control rounded-0"
                                                    placeholder="Enter Coupon Code Prefix e.g., XYZXXX"
                                                    value={couponPrefix}
                                                    onChange={handlePrefixChange}
                                                    required
                                                />
                                            </div>

                                            {/* Discount Type */}
                                            <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Discount Type <span className="text-danger">*</span>
                                                </label>

                                                <select
                                                    className="form-select rounded-0"
                                                    value={discountType}
                                                    onChange={(e) => setDiscountType(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="percentage">Percentage (%)</option>
                                                    <option value="fixed_amount">Fixed Amount</option>
                                                </select>
                                            </div>

                            
                                            {/* Discount Value */}
                                            <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Discount Value <span className="text-danger">*</span>
                                                </label>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={discountType === "percentage" ? 100 : undefined}
                                                    className="form-control rounded-0"
                                                    placeholder="Enter value"
                                                    value={discountValue}
                                                    onChange={(e) => {
                                                        let value = e.target.value;

                                                        // If percentage, restrict > 100
                                                        if (discountType === "percentage" && value > 100) {
                                                            value = 100;
                                                        }

                                                        setDiscountValue(value);
                                                    }}
                                                    required
                                                />
                                            </div>

                                            {/* <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Discount Value <span className="text-danger">*</span>
                                                </label>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control rounded-0"
                                                    placeholder="Enter value"
                                                    value={discountValue}
                                                    onChange={(e) => setDiscountValue(e.target.value)}
                                                    required
                                                />
                                            </div> */}


                                            {/* Applicable For */}
                                            <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Applicable For <span className="text-danger">*</span>
                                                </label>

                                                <select
                                                    className="form-select rounded-0"
                                                    value={applicableFor}
                                                    onChange={(e) => setApplicableFor(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Option</option>

                                                    {eventDetails?.is_free === "Y" ? (
                                                        // If event is FREE → Only Appointment
                                                        <option value="appointment">Appointment</option>
                                                    ) : (
                                                        // If NOT free → Show all options
                                                        <>
                                                            <option value="ticket">Ticket</option>
                                                            <option value="addon">Addon</option>
                                                            <option value="appointment">Appointment</option>
                                                            <option value="committesale">Committesale</option>
                                                            <option value="package">Package</option>
                                                            <option value="all">Complete Order</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>




                                            {/* <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Applicable For <span className="text-danger">*</span>
                                                </label>

                                                <select
                                                    className="form-select rounded-0"
                                                    value={applicableFor}
                                                    onChange={(e) => setApplicableFor(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="ticket">Ticket</option>
                                                    <option value="addon">Addon</option>
                                                    <option value="appointment">Appointment</option>
                                                    <option value="committesale">Committesale</option>
                                                    <option value="package">Package</option>
                                                    <option value="all">Complete Order</option>
                                                </select>
                                            </div> */}

                                            {/* Validity */}
                                            <div className="col-lg-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Validity Period <span className="text-danger">*</span>
                                                </label>

                                                <select
                                                    className="form-select rounded-0"
                                                    value={validityPeriod}
                                                    onChange={(e) => setValidityPeriod(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Validity</option>
                                                    <option value="unlimited">Unlimited</option>
                                                    <option value="specified_date">Specific Date Range</option>
                                                </select>
                                            </div>

                                            {/* Date Range */}
                                            {validityPeriod === "specified_date" && (
                                                <>
                                                    <div className="col-lg-4 col-md-6">
                                                        <label className="form-label fw-semibold">
                                                            Valid From <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="form-control rounded-0"
                                                            required={validityPeriod === "specified_date"}
                                                            value={validFromDate}
                                                            min={new Date().toISOString().split("T")[0]} // Disable past dates
                                                            onChange={(e) => setValidFromDate(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="col-lg-4 col-md-6">
                                                        <label className="form-label fw-semibold">
                                                            Valid To <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="validToDate"
                                                            className="form-control rounded-0"
                                                            required={validityPeriod === "specified_date"}
                                                            value={validToDate}
                                                            min={
                                                                validFromDate ||
                                                                new Date().toISOString().split("T")[0]
                                                            } // Disable past dates and dates before 'Valid From'
                                                            onChange={(e) => {
                                                                if (
                                                                    new Date(e.target.value) < new Date(validFromDate)
                                                                ) {
                                                                    alert(
                                                                        "Valid To Date cannot be earlier than Valid From Date."
                                                                    );
                                                                    setValidToDate(""); // Reset if invalid
                                                                } else {
                                                                    setValidToDate(e.target.value);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Footer Buttons */}
                                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary px-4"
                                                onClick={goBack}
                                            >
                                                ← Back
                                            </button>

                                            <button
                                                type="submit"
                                                className="btn btn-primary px-4"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Creating..." : "Create Coupon Code"}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                            </div>

                        </div>
                    </div>
                </div>
            </section>
            <FrontendFooter />
        </>
    );
};

export default CreatePromotionCode;