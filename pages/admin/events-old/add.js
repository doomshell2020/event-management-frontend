import React, { useState, useEffect, useRef } from "react";
import {
  Breadcrumb,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
  Alert
} from "react-bootstrap";
import Link from "next/link";
import axios from "axios";
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
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import moment from "moment-timezone";
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";


const EventAdd = ({ currencies, countries, eventData, statesList }) => {
  // if you need states
  const [currencyList, setCurrencyList] = useState(currencies || []);
  const [countryList, setCountryList] = useState(countries || []);
  const [event, setEvent] = useState(eventData || {});

  //DefaultValidation
  const noteRef = useRef(null);
  const router = useRouter();
  const { id } = router.query;

  const [Default, setDefault] = useState("");
  const [Name, setName] = useState("");
  const [ShortName, setShortName] = useState("");
  const [Venue, setVenue] = useState("");
  const [Address, setAddress] = useState("");
  const [City, setCity] = useState("");
  const [State, setState] = useState(statesList || []);
  const [PostalCode, setPostalCode] = useState("");
  const [ImageURL, setImageURL] = useState(null);
  const [StartDate, setStartDate] = useState("");
  const [EndDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState("1");
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isClient, setIsClient] = useState(false);

  // const titleRef = useRef(null);
  // new keys added(28-01-2025)
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const timeZonesList = moment.tz.names(); // List of all time zones

  // new keys added(05-02-2025)
  const [serviceFee, setServiceFee] = useState(0);
  const [mexicanVat, setMexicanVat] = useState(0);
  const [accommodationTax, setAccommodationTax] = useState(0);
  const [ondalindaFee, setOndalindaFee] = useState(0);
  const [expiryDuration, setExpiryDuration] = useState(0);
  const [partialDueDays, setPartialDueDays] = useState(0);
  const [strip_fee, setStrip_fee] = useState(0);

  // Ticket Fee States
  const [ticketPlatformFee, setTicketPlatformFee] = useState('');
  const [ticketStripeFee, setTicketStripeFee] = useState('');
  const [ticketBankFee, setTicketBankFee] = useState('');
  const [ticketProcessingFee, setTicketProcessingFee] = useState('');
  const [editorContent, setEditorData] = useState({ content: "" });

  const [SaleStartDate, setSaleStartDate] = useState("");
  const [SaleEndDate, setSaleEndDate] = useState("");

  const handleSaleStartDate = (e) => setSaleStartDate(e.target.value);
  const handleSaleEndDate = (e) => setSaleEndDate(e.target.value);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PNG, JPG, and JPEG files are allowed.");
        setImageURL(null);
        return;
      }
      setError("");
      setImageURL(file);
    }
  };

  // Update StartDate and EndDate when the timeZone changes
  useEffect(() => {
    if (StartDate) {
      const adjustedStartDate = moment
        .tz(StartDate, timeZone)
        .format("YYYY-MM-DDTHH:mm:ssZ");
      setStartDate(adjustedStartDate);
    }

    if (EndDate) {
      const adjustedEndDate = moment
        .tz(EndDate, timeZone)
        .format("YYYY-MM-DDTHH:mm:ssZ");
      setEndDate(adjustedEndDate);
    }
  }, [timeZone]);

  // Fetch all states from db
  const fetchAllStates = async (country_id) => {
    const { data } = await axios.get(`/api/v1/states?country_id=${country_id}`);
    if (data.success == true) {
      setState(data.data);
    } else {
      console.log("There was an issue fetching states");
    }
  };

  // Route Change
  let navigate = useRouter();
  const routeChange = () => {
    let path = `/admin/events`;
    navigate.push(path);
  };

  const handleStartDate = (e) => {
    const selectedDate = e.target.value; // YYYY-MM-DDTHH:MM
    const formattedDateTime = moment
      .tz(selectedDate, timeZone)
      .format("YYYY-MM-DDTHH:mm:ssZ");
    setStartDate(formattedDateTime);
  };

  const handleEndDate = (e) => {
    const selectedEndDate = e.target.value; // YYYY-MM-DDTHH:MM
    const formattedDateTime = moment
      .tz(selectedEndDate, timeZone)
      .format("YYYY-MM-DDTHH:mm:ssZ");
    setEndDate(formattedDateTime);
  };


  useEffect(() => {
    if (event && event.id) {
      setName(event.Name || "");
      setShortName(event.ShortName || "");
      setVenue(event.Venue || "");
      setAddress(event.Address || "");
      setCity(event.City || "");
      setSelectedState(event.State || "");
      setSelectedCounty(event.Country || "");
      setPostalCode(event.PostalCode || "");
      setSelectedCurrency(event.payment_currency || "");
      setEventType(event.EventType ? String(event.EventType) : "1");

      // Dates in your API are UTC → format them for input type="datetime-local"
      setStartDate(moment(event.StartDate).format("YYYY-MM-DDTHH:mm"));
      setEndDate(moment(event.EndDate).format("YYYY-MM-DDTHH:mm"));
      setSaleStartDate(moment(event.SaleStartDate).format("YYYY-MM-DDTHH:mm"));
      setSaleEndDate(moment(event.SaleEndDate).format("YYYY-MM-DDTHH:mm"));

      // Ticket Fees
      setTicketPlatformFee(event.ticket_platform_fee_percentage || "");
      setTicketStripeFee(event.ticket_stripe_fee_percentage || "");
      setTicketBankFee(event.ticket_bank_fee_percentage || "");
      setTicketProcessingFee(event.ticket_processing_fee_percentage || "");

      // Other Fees
      setServiceFee(event.ServiceFee || 0);
      setMexicanVat(event.MexicanVAT || 0);
      setAccommodationTax(event.AccommodationTax || 0);
      setOndalindaFee(event.OndalindaFee || 0);
      setStrip_fee(event.strip_fee || 0);
      setExpiryDuration(event.expiry_duration || 0);
      setPartialDueDays(event.partial_payment_duration || 0);

      // Summary (HtmlEditor)
      setEditorData({ content: event.Summary || "" });

      // Timezone
      setTimeZone(event.EventTimeZone || "Asia/Kolkata");
    }
  }, [event]);

  const [editorError, setEditorError] = useState(""); // State for editor error message

  const EventsAdd = async (event) => {
    const form = event.currentTarget;
    setIsLoading(true);
    event.preventDefault();
    const content = getHtmlEditorContent(noteRef);

    if (form.checkValidity() == false) {
      event.preventDefault();
      event.stopPropagation();
      setValidatedCustom(true);
      setIsLoading(false);
    } else {

      const EventsAddUrl = "/api/v1/events/";
      event.preventDefault();
      const body = new FormData();
      body.append("Name", Name);
      body.append("ImageURL", ImageURL);
      body.append("Venue", Venue);
      body.append("ShortName", ShortName);
      body.append("PaymentCurrency", selectedCurrency);
      body.append("Address", Address);
      body.append("City", City);
      body.append("State", selectedState);
      body.append("Country", selectedCounty);
      body.append("PostalCode", PostalCode);
      body.append("StartDate", StartDate);
      body.append("EndDate", EndDate);

      body.append("SaleStartDate", SaleStartDate);
      body.append("SaleEndDate", SaleEndDate);


      body.append("EventType", eventType);
      body.append("EventTimeZone", timeZone);
      body.append("Summary", content.trim());

      // Ticket Fee Percentages
      body.append("ticket_platform_fee_percentage", ticketPlatformFee);
      body.append("ticket_stripe_fee_percentage", ticketStripeFee);
      body.append("ticket_bank_fee_percentage", ticketBankFee);
      body.append("ticket_processing_fee_percentage", ticketProcessingFee);

      body.append("ServiceFee", serviceFee);
      body.append("MexicanVAT", mexicanVat);
      body.append("AccommodationTax", accommodationTax);
      body.append("OndalindaFee", ondalindaFee);
      body.append("strip_fee", strip_fee);
      if (expiryDuration !== null && expiryDuration !== "" && expiryDuration !== "null") {
        body.append("expiry_duration", expiryDuration);
      }

      if (partialDueDays !== null && partialDueDays !== "" && partialDueDays !== "null") {
        body.append("partial_payment_duration", partialDueDays);
      }

      await axios.post(EventsAddUrl, body)
        .then((res) => {
          if (res.data.statusCode == 200) {
            const msg = res.data.message;
            setIsLoading(false);
            Swal.fire({
              icon: "success",
              title: `${Name} Event Created!`, // Dynamic event name in title
              text: `The event "${Name}" has been successfully created!`, // Descriptive message
              confirmButtonText: "Great! Let's go!", // Custom confirmation button text
              customClass: { popup: "add-tckt-dtlpop" }
            });
            const redirectUrl = res.data.redirectUrl;
            navigate.push(redirectUrl)
          } else {
            setIsLoading(false);
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: res.data.error,
              confirmButtonText: "OK",
              customClass: { popup: "add-tckt-dtlpop" }
            });
          }
        })
        .catch((err) => {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.response
              ? error.response.data.message || error.message
              : "Something went wrong. Please try again.",
            confirmButtonText: "OK",
            customClass: { popup: "add-tckt-dtlpop" }
          });
        });
    }
    setValidatedCustom(true);
  };

  // Set this to false when you want to enable the links
  const isDisabled = true;


  return (
    <div>
      <Seo title={"Add Events"} />
      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Event Manager
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
              Events
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              add
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}

      {/* <!--Row--> */}
      <div className="row">
        <Col lg={12} md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <h3 className="card-title">Add Event</h3>
              <div style={{ height: "39px" }}></div>
            </Card.Header>
            <Card.Body className="p-sm-3 p-2">
              {error && <Alert variant="danger">{error}</Alert>}
              <div className="add-event-progress-bar">
                <ul className="progress-br-head mx-auto">

                  <li className="active">
                    <Link href={`/admin/events/add${id ? `?id=${id}` : ""}`}>
                      <span>Create Event</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href={id ? `/admin/events/add-2step?id=${id}` : "#"}
                      style={{
                        pointerEvents: id ? "auto" : "none",
                        color: id ? "inherit" : "gray",
                      }}
                    >
                      <span>Tickets</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href={id ? `/admin/events/add-3step?id=${id}` : "#"}
                      style={{
                        pointerEvents: id ? "auto" : "none",
                        color: id ? "inherit" : "gray",
                      }}
                    >
                      <span>Publish Event</span>
                    </Link>
                  </li>


                </ul>
              </div>

              <CForm
                className="row g-3 EdtEvtFrm needs-validation"
                noValidate
                validated={validatedCustom}
                onSubmit={EventsAdd}
              >
                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="validationDefault01">
                    Event Name<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault01"
                    placeholder="Event Name"
                    required
                    value={Name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </CCol>
                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="EventSortName">
                    Event Sort Name <span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="EventSortName"
                    placeholder="Event Sort Name"
                    required
                    value={ShortName}
                    onChange={(e) => {
                      setShortName(e.target.value);
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="currencyDropdown">
                    Currency<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <select
                    id="currencyDropdown"
                    className="form-control"
                    required
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option value="">-Select-</option>
                    {currencyList &&
                      currencyList.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.Currency_symbol} - {currency.Currency}
                        </option>
                      ))}
                  </select>
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="timezone">
                    Time Zone:<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <select
                    className="form-control"
                    id="timezone"
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                  >
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                    {/* Add Indian Standard Time (IST) manually */}
                    <option value="Asia/Kolkata">
                      Indian Standard Time (IST)
                    </option>

                    {timeZonesList.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="StartDateTime">
                    Start Date Time<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <InputGroup className="input-group reactdate-pic">
                    <InputGroup.Text className="input-group-text">
                      <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                    </InputGroup.Text>
                    <CFormInput
                      id="StartDateTime"
                      type="datetime-local"
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      value={moment
                        .tz(StartDate, timeZone)
                        .format("YYYY-MM-DDTHH:mm")} // Convert StartDate to local format
                      // min={new Date().toISOString().slice(0, 16)} // Set the minimum to the current datetime
                      onChange={handleStartDate}
                    />
                  </InputGroup>
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="EndDateTime">
                    End Date Time<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <InputGroup className="input-group reactdate-pic">
                    <InputGroup.Text className="input-group-text">
                      <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                    </InputGroup.Text>
                    <CFormInput
                      id="EndDateTime"
                      type="datetime-local"
                      required
                      // value={EndDate}
                      // min={StartDate || new Date().toISOString().slice(0, 16)}
                      min={
                        StartDate
                          ? moment
                            .tz(StartDate, timeZone)
                            .format("YYYY-MM-DDTHH:mm")
                          : new Date().toISOString().slice(0, 16)
                      }
                      value={moment
                        .tz(EndDate, timeZone)
                        .format("YYYY-MM-DDTHH:mm")} // Convert StartDate to local format
                      onChange={handleEndDate}
                    />
                  </InputGroup>
                </CCol>


                {/* ✅ New: Sale Start Date */}
                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="SaleStartDateTime">
                    Sale Start Date Time<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <InputGroup className="input-group reactdate-pic">
                    <InputGroup.Text className="input-group-text">
                      <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                    </InputGroup.Text>
                    <CFormInput
                      id="SaleStartDateTime"
                      type="datetime-local"
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      value={moment.tz(SaleStartDate, timeZone).format("YYYY-MM-DDTHH:mm")}
                      onChange={handleSaleStartDate}
                    />
                  </InputGroup>
                </CCol>

                {/* ✅ New: Sale End Date */}
                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="SaleEndDateTime">
                    Sale End Date Time<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <InputGroup className="input-group reactdate-pic">
                    <InputGroup.Text className="input-group-text">
                      <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                    </InputGroup.Text>
                    <CFormInput
                      id="SaleEndDateTime"
                      type="datetime-local"
                      required
                      min={
                        SaleStartDate
                          ? moment.tz(SaleStartDate, timeZone).format("YYYY-MM-DDTHH:mm")
                          : new Date().toISOString().slice(0, 16)
                      }
                      value={moment.tz(SaleEndDate, timeZone).format("YYYY-MM-DDTHH:mm")}
                      onChange={handleSaleEndDate}
                    />
                  </InputGroup>
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="eventImageInput">
                    Event Image
                    <span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="file"
                    id="eventImageInput"
                    required={!id}   // ✅ agar id nahi hai toh required true
                    accept=".png, .jpg, .jpeg"
                    onChange={handleFileChange}
                  />
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </CCol>


                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="validationDefault04">
                    Country<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <select
                    id="countryDropdown"
                    className="form-control"
                    required
                    value={selectedCounty}
                    // onChange={(e) => setSelectedCounty(e.target.value)}
                    onChange={(e) => {
                      const selectedCountryName = e.target.value; // Capture the country name
                      setSelectedCounty(selectedCountryName); // Set the selected country name
                      const country_id = countryList.find(country => country.name == selectedCountryName);
                      if (country_id) {
                        fetchAllStates(country_id.id);
                      } else {
                        setState([]);
                      }
                    }}
                  >
                    <option value="">-Select Country-</option>
                    {countryList &&
                      countryList.map((cur) => (
                        <option key={cur.id} value={cur.name}>
                          {cur.name}
                        </option>
                      ))}
                  </select>
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="validationDefault04">State/Province<span style={{ color: "Red" }}>*</span></CFormLabel>
                  <select
                    id="stateDropdown"
                    className="form-control"
                    required
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    <option value="">-Select State-</option>
                    {State &&
                      State.map((cur) => (
                        <option key={cur.id} value={cur.name}>
                          {cur.name}
                        </option>
                      ))}
                  </select>
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="EventType">
                    Event Type<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <select
                    name="id"
                    id="EventType"
                    className="form-control"
                    required
                    value={eventType}
                    onChange={(e) => {
                      setEventType(e.target.value);
                    }}
                  >
                    <option value="">-Select-</option>
                    <option value="1">Without Housing</option>
                    <option value="2">With Housing</option>
                  </select>
                </CCol>

                {/* <CCol md={12}>
                  <CFormLabel htmlFor="validationDefault01">Summary</CFormLabel>
                  <CFormTextarea
                    type="text"
                    id="validationDefault01"
                    value={Summary}
                    onChange={(e) => {
                      setSummary(e.target.value);
                    }}
                  />
                </CCol> */}

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="ServiceFee">Service Fee (%)</CFormLabel>
                  <CFormInput
                    type="number"
                    id="ServiceFee"
                    placeholder="Service Fee"
                    value={serviceFee}
                    // onChange={(e) => {
                    //   const value = e.target.value;
                    //   if (value >= 0) {
                    //     setServiceFee(value);
                    //   }
                    // }}
                    // onChange={(e) => {
                    //   const value = Math.min(100, Math.max(0, Number(e.target.value))); // Ensures value is between 0 and 100
                    //   setServiceFee(value);
                    // }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setServiceFee(value);
                      }
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="MaxicanVAT">Mexican VAT (%)</CFormLabel>
                  <CFormInput
                    type="number"
                    id="MaxicanVAT"
                    placeholder="Mexican VAT"
                    value={mexicanVat}
                    // onChange={(e) => {
                    //   const value = e.target.value;
                    //   if (value >= 0) {
                    //     setMexicanVat(value);
                    //   }
                    // }}
                    // onChange={(e) => {
                    //   const value = Math.min(100, Math.max(0, Number(e.target.value))); // Ensures value is between 0 and 100
                    //   setMexicanVat(value);
                    // }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setMexicanVat(value);
                      }
                    }}
                  />
                </CCol>
                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="AccommodationTax">Accommodation Tax (%)</CFormLabel>
                  <CFormInput
                    type="number"
                    id="AccommodationTax"
                    placeholder="Accommodation Tax"
                    value={accommodationTax}
                    // onChange={(e) => {
                    //   const value = e.target.value;
                    //   if (value >= 0) {
                    //     setAccommodationTax(value);
                    //   }
                    // }}
                    // onChange={(e) => {
                    //   const value = Math.min(100, Math.max(0, Number(e.target.value))); // Ensures value is between 0 and 100
                    //   setAccommodationTax(value);
                    // }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setAccommodationTax(value);
                      }
                    }}
                  />
                </CCol>
                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="OndalindaFee">Ondalinda Fee (%)</CFormLabel>
                  <CFormInput
                    type="number"
                    id="OndalindaFee"
                    placeholder="Ondalinda Fee"
                    value={ondalindaFee}
                    // onChange={(e) => {
                    //   const value = e.target.value;
                    //   if (value >= 0) {
                    //     setOndalindaFee(value);
                    //   }
                    // }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setOndalindaFee(value);
                      }
                    }}
                  // onChange={(e) => {
                  //   const value = Math.min(100, Math.max(0, Number(e.target.value))); // Ensures value is between 0 and 100
                  //   setOndalindaFee(value);
                  // }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="StripFee">Stripe Fee (%)</CFormLabel>
                  <CFormInput
                    type="number"
                    id="StripFee"
                    placeholder="Stripe Fee"
                    value={strip_fee}
                    // onChange={(e) => {
                    //   const value = e.target.value;
                    //   if (value >= 0) {
                    //     setStrip_fee(value);
                    //   }
                    // }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setStrip_fee(value);
                      }
                    }}
                  // onChange={(e) => {
                  //   const value = Math.min(100, Math.max(0, Number(e.target.value))); // Ensures value is between 0 and 100
                  //   setStrip_fee(value);
                  // }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="expiryDuration">Accommodation expiry duration(days)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="expiryDuration"
                    value={expiryDuration}
                    placeholder="Accommodation request expiry duration"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setExpiryDuration(value);
                      }
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="partialPaymentDuration">Collect Partial Payment Before (Days)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="partialPaymentDuration"
                    value={partialDueDays}
                    placeholder="collect partial payment"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setPartialDueDays(value);
                      }
                    }}
                  />
                </CCol>




                {/* ===== Ticket Fee Section ===== */}
                <CCol xs={12} className="border-bottom pb-2 mb-1">
                  {/* <h6 className="fw-bold">Ticket Fee Details</h6> */}
                  <h6 className="fw-bold">Fee Details</h6>
                  {/* <small className="text-muted">Enter applicable fees for ticket purchases</small> */}
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="ticketPlatformFee">Ticket Platform Fee (%)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="ticketPlatformFee"
                    value={ticketPlatformFee}
                    placeholder="Enter ticket platform fee"
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === "") setTicketPlatformFee("");
                      else if (!isNaN(value) && value >= 0 && value <= 100) setTicketPlatformFee(value);
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="ticketStripeFee">Stripe Fee (%)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="ticketStripeFee"
                    value={ticketStripeFee}
                    placeholder="Enter stripe fee for ticket"
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === "") setTicketStripeFee("");
                      else if (!isNaN(value) && value >= 0 && value <= 100) setTicketStripeFee(value);
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="ticketBankFee">Bank Fee (%)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="ticketBankFee"
                    value={ticketBankFee}
                    placeholder="Enter bank fee for ticket"
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === "") setTicketBankFee("");
                      else if (!isNaN(value) && value >= 0 && value <= 100) setTicketBankFee(value);
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="ticketProcessingFee">Processing Fee (%)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="ticketProcessingFee"
                    value={ticketProcessingFee}
                    placeholder="Enter processing fee for ticket"
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === "") setTicketProcessingFee("");
                      else if (!isNaN(value) && value >= 0 && value <= 100) setTicketProcessingFee(value);
                    }}
                  />
                </CCol>


                <CCol md={12}>
                  <b>Event Description:</b>
                  <div >
                    <HtmlEditor
                      editorRef={noteRef}
                      initialContent={editorContent.content}
                      onChange={(content) => setEditorData({ ...editorContent, content })}
                    />
                  </div>
                </CCol>

                <CCol md={4} className="d-flex justify-content-between">
                  <Link className="w-50 me-2" href="/admin/events">
                    <CButton color="warning me-4 w-100">Back</CButton>
                  </Link>

                  <CButton
                    className=" w-50 "
                    color="primary"
                    type="submit"
                    disabled={isLoading}
                  >
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
                      // "Next"
                    )}
                  </CButton>
                </CCol>
              </CForm>
            </Card.Body>
          </Card>
        </Col>
      </div>
      {/* <!--/Row--> */}
    </div>
  );
};


EventAdd.layout = "Contentlayout";
export default EventAdd;

export async function getServerSideProps(context) {
  const { id } = context.query;
  const baseUrl = process.env.SITE_URL;

  try {
    // Step 1: Fetch event, currency, and countries in parallel
    const [currencyRes, countryRes, eventRes] = await Promise.all([
      axios.get(`${baseUrl}/api/v1/events/?key=getCurrency`),
      axios.get(`${baseUrl}/api/v1/country`),
      axios.get(`${baseUrl}/api/v1/events?id=${id}`)
    ]);

    const eventData = eventRes?.data?.data || {};
    const countries = countryRes.data?.success ? countryRes.data.data : [];

    // Step 2: Map Country name → id
    let statesRes = { data: { data: [] } };
    if (eventData.Country) {
      const matchedCountry = countries.find(
        (c) => c.name.toLowerCase() == eventData.Country.toLowerCase()
      );

      if (matchedCountry?.id) {
        statesRes = await axios.get(
          `${baseUrl}/api/v1/states?country_id=${matchedCountry.id}`
        );
      }
    }

    return {
      props: {
        currencies: currencyRes.data?.success ? currencyRes.data.data : [],
        countries: countryRes.data?.success ? countryRes.data.data : [],
        eventData,
        statesList: statesRes.data?.data ? statesRes.data.data : [],
      },
    };
  } catch (error) {
    console.error("Server-side fetch error:", error);
    return {
      props: {
        currencies: [],
        countries: [],
        eventData: {},
        statesList: [],
      },
    };
  }
}