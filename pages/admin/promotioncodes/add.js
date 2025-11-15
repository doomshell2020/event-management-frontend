import React, { useEffect, useState } from "react";
import MultiSelect from "react-multiple-select-dropdown-lite";
import {
  Breadcrumb,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { optiondefault } from "../../../shared/data/form/form-validation";
import {
  DateAndTimePickers,
  Datepicker,
} from "../../../shared/data/form/form-elements";
import DatePicker from "react-datepicker";
import Link from "next/link";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CFormCheck,
  CFormTextarea,
  CFormSelect,
} from "@coreui/react";

import Seo from "@/shared/layout-components/seo/seo";

const AddCoupon = () => {
  // State variables
  const [events, setEvents] = useState([]); // Store fetched events
  const [discountType, setDiscountType] = useState(""); // Default to 'percentage'
  const [couponPrefix, setCouponPrefix] = useState("");
  const [couponCount, setCouponCount] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [validityPeriod, setValidityPeriod] = useState(""); // Default to 'unlimited'
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [validFromDate, setValidFromDate] = useState(""); // Date when validity starts
  const [validToDate, setValidToDate] = useState(""); // Date when validity ends
  const [applicableFor, setApplicableFor] = useState("");
  const [eventName, setEventName] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(""); // Initialize as empty or default to a specific event
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch events when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const getEventNameFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return decodeURIComponent(urlParams.get("event"));
      };

      const eventFromURL = getEventNameFromURL();
      setEventName(eventFromURL);
      fetchEvents(eventFromURL);
    }
  }, []);

  const fetchEvents = async (eventFromURL) => {
    try {
      const response = await axios.get("/api/v1/events");
      if (response.data.success) {
        const fetchedEvents = response.data.viewCms;
        setEvents(fetchedEvents);

        const matchingEvent = fetchedEvents.find(
          (event) => event.Name == eventFromURL
        );

        if (matchingEvent) {
          setSelectedEvent(matchingEvent.id); // Pre-select the event by ID
        }
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
 

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
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidatedCustom(true);
      setIsLoading(false);
      return;
    }

    // Form is valid, gather data
    const data = {
      key: "create_coupon",
      selectedEvent,
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
      const response = await axios.post("/api/v1/coupons", data);
      // console.log(">>>>>>>>", response.data.message);

      // Handle success response
      Swal.fire({
        icon: "success",
        title: "Promotion Code Created!",
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

  // Handler for the "Back" button click
  const goBack = () => {
    const encodedName = encodeURIComponent(eventName);
    router.push(`/admin/promotioncodes/?event=${encodedName}`);
  };

  return (
    <div>
      <Seo title={"Add Promotion Codes"} />

      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Promotion Codes Manager
          </span>
        </div>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Promotion Codes
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Add
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}

      {/* <!--Row--> */}
      <div className="row">
        <CCol lg={12} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Add New Promotion || {eventName} </h3>
            </Card.Header>
            <Card.Body>
              <CForm
                className="row g-3 needs-validation"
                noValidate
                validated={validatedCustom}
                onSubmit={handleSubmit}
              >
                {/* Event Selection Dropdown */}
                <CCol md={4}>
                  <CFormLabel htmlFor="eventSelect">
                    Select Event <span style={{ color: "red" }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    id="eventSelect"
                    className="form-control"
                    required
                    value={selectedEvent}
                    disabled={true} // Keeping the dropdown disabled
                    onChange={(e) => setSelectedEvent(e.target.value)}
                  >
                    <option value="">Select Event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.Name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                {/* No. of Coupon Code */}
                <CCol md={4}>
                  <CFormLabel htmlFor="numberOfCoupons">
                    No. of Promotion Code{" "}
                    <span style={{ color: "red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="numberOfCoupons"
                    placeholder="Enter number of promotion codes e.g., 10"
                    required
                    value={couponCount}
                    onChange={(e) => setCouponCount(e.target.value)}
                  />
                </CCol>

                {/* Coupon Prefix */}
                <CCol md={4}>
                  <CFormLabel htmlFor="couponPrefix">
                    Promotion Code Prefix{" "}
                    <span style={{ color: "red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="couponPrefix"
                    placeholder="Enter Promotion Code Prefix e.g., MONTXXX"
                    required
                    value={couponPrefix}
                    onChange={(e) => handlePrefixChange(e)}
                  />
                </CCol>

                {/* Discount Type Dropdown */}
                <CCol md={4}>
                  <CFormLabel htmlFor="discountType">
                    Discount Type <span style={{ color: "red" }}>*</span>
                  </CFormLabel>
                  <select
                    id="discountType"
                    required
                    className="form-control"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="">Select Discount Type</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </CCol>

                {/* Discount Value */}
                <CCol md={4}>
                  <CFormLabel htmlFor="discountValue">
                    Discount Value <span style={{ color: "red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="discountValue"
                    placeholder="Enter discount value"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </CCol>

                {/* Applicable For Dropdown */}
                <CCol md={4}>
                  <CFormLabel htmlFor="applicableFor">
                    Applicable For <span style={{ color: "red" }}>*</span>
                  </CFormLabel>
                  <select
                    id="applicableFor"
                    className="form-control"
                    required
                    value={applicableFor}
                    onChange={(e) => setApplicableFor(e.target.value)}
                  >
                    <option value="">Select Applicable Option</option>
                    <option value="ticket">Only Ticket</option>
                    <option value="addon">Only Addon</option>
                    <option value="ticket_addon">Both (Ticket & Addon)</option>
                    <option value="all">All (Complete Order)</option>
                  </select>
                </CCol>

                {/* Validity Period Dropdown */}
                <CCol md={4}>
                  <CFormLabel htmlFor="validityPeriod">
                    Validity Period <span style={{ color: "red" }}>*</span>
                  </CFormLabel>
                  <select
                    className="form-control"
                    id="validityPeriod"
                    required
                    value={validityPeriod}
                    onChange={(e) => setValidityPeriod(e.target.value)}
                  >
                    <option value="">Select Validity Period</option>
                    <option value="unlimited">Unlimited Validity</option>
                    <option value="specified_date">Valid Specified Date</option>
                  </select>
                </CCol>

                {/* Valid From and To Dates (Conditional) */}
                {validityPeriod === "specified_date" && (
                  <>
                    <CCol md={4}>
                      <CFormLabel htmlFor="validFromDate">
                        Valid From Date <span style={{ color: "red" }}>*</span>
                      </CFormLabel>
                      <CFormInput
                        type="date"
                        id="validFromDate"
                        required={validityPeriod === "specified_date"}
                        value={validFromDate}
                        min={new Date().toISOString().split("T")[0]} // Disable past dates
                        onChange={(e) => setValidFromDate(e.target.value)}
                      />
                    </CCol>

                    <CCol md={4}>
                      <CFormLabel htmlFor="validToDate">
                        Valid To Date <span style={{ color: "red" }}>*</span>
                      </CFormLabel>
                      <CFormInput
                        type="date"
                        id="validToDate"
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
                    </CCol>
                  </>
                )}

                {/* Submit Button */}
                <CCol md={12} className="d-flex justify-content-end">
                  <CButton
                    color="warning me-4"
                    type="button"
                    onClick={goBack}
                    className="me-2" // Adds space between the buttons
                  >
                    Back
                  </CButton>
                  <CButton color="primary" type="submit" disabled={isLoading}>
                    {/* Update */}
                    {isLoading ? (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      "Submit"
                    )}
                  </CButton>
                </CCol>
              </CForm>
            </Card.Body>
          </Card>
        </CCol>
      </div>
      {/* <!--/Row--> */}
    </div>
  );
};

AddCoupon.propTypes = {};

AddCoupon.defaultProps = {};

AddCoupon.layout = "Contentlayout";

export default AddCoupon;
