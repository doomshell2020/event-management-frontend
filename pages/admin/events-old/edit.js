import React, { useState, useEffect, useRef } from "react";
import {
  Breadcrumb,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CButton,
  CFormCheck,
  CFormTextarea,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import SummernoteLite from "react-summernote-lite";
// import "react-summernote-lite/dist/esm/dist/summernote-lite.min.css";
import "react-summernote-lite/dist/summernote-lite.min.css";
import Moment from "react-moment";
import moment from "moment-timezone";
import Image from 'next/image';


const EventEdit = () => {
  //DefaultValidation
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState([]);
  const [Venue, setVenue] = useState("");
  const [Name, setName] = useState("");
  const [ShortName, setShortName] = useState("");
  const [Address, setAddress] = useState("");
  const [City, setCity] = useState("");
  const [State, setState] = useState([]);
  const [country, setCountry] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [PostalCode, setPostalCode] = useState("");
  const [ImageURL, setImageURL] = useState("");
  const [Price, setPrice] = useState("");
  const [Summary, setSummary] = useState("");
  const [ticket_description, setTicket_Description] = useState("");
  const [addon_description, setAddon_Description] = useState("");
  const [other_description, setOther_Description] = useState("");
  const [ListPrice, setListPrice] = useState("");
  const [StartDate, setStartDate] = useState("");
  const [EndDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isClient, setIsClient] = useState(false);

  // new keys added(05-02-2025)
  const [serviceFee, setServiceFee] = useState(0);
  const [mexicanVat, setMexicanVat] = useState(0);
  const [accommodationTax, setAccommodationTax] = useState(0);
  const [ondalindaFee, setOndalindaFee] = useState(0);
  const [strip_fee, setStrip_fee] = useState(0);
  const [expiryDuration, setExpiryDuration] = useState(0);
  const [partialDueDays, setPartialDueDays] = useState(0);

  const [selectedImage, setSelectedImage] = useState(null);
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const timeZonesList = moment.tz.names(); // List of all time zones

  let navigate = useRouter();
  const noteRef = useRef();
  // new keys added(28-01-2025)
  const ticketDescription = useRef(null)
  const addonDescription = useRef(null)
  const otherDescription = useRef(null)

  // Ticket Fee States
  const [ticketPlatformFee, setTicketPlatformFee] = useState('');
  const [ticketStripeFee, setTicketStripeFee] = useState('');
  const [ticketBankFee, setTicketBankFee] = useState('');
  const [ticketProcessingFee, setTicketProcessingFee] = useState('');

  // Accommodation Fee States
  // const [accommodationStripeFee, setAccommodationStripeFee] = useState('');
  // const [accommodationBankFee, setAccommodationBankFee] = useState('');
  // const [accommodationProcessingFee, setAccommodationProcessingFee] = useState('');


  const routeChange = () => {
    let path = `/admin/events`;
    // let path = `/admin/events/add-2step?id=${id}`;
    navigate.push(path);
  };

  const EventsURL = `/api/v1/events?id=${id}`;
  useEffect(() => {
    if (id != undefined) {
      setIsLoading(true);
      fetch(EventsURL)
        .then((response) => response.json())
        .then((value) => {
          // console.log("-----------", value.data.partial_payment_duration)
          setName(value.data.Name);
          setVenue(value.data.Venue);
          setTimeZone(value.data.EventTimeZone);


          // New fields (21-05-2025)
          setTicketPlatformFee(value.data.ticket_platform_fee_percentage);
          setTicketStripeFee(value.data.ticket_stripe_fee_percentage);
          setTicketBankFee(value.data.ticket_bank_fee_percentage);
          setTicketProcessingFee(value.data.ticket_processing_fee_percentage);

          // Accommodation Fee States
          // setAccommodationStripeFee(value.data.accommodation_stripe_fee_percentage);
          // setAccommodationBankFee(value.data.accommodation_bank_fee_percentage);
          // setAccommodationProcessingFee(value.data.accommodation_processing_fee_percentage);

          // Handle StartDate and EndDate with timezone adjustments
          const startDateTime = moment(value.data.StartDate)
            .tz(value.data.EventTimeZone) // Assuming `EventTimeZone` is stored in the database
            .format("YYYY-MM-DDTHH:mm"); // Format for datetime-local input

          const endDateTime = moment(value.data.EndDate)
            .tz(value.data.EventTimeZone)
            .format("YYYY-MM-DDTHH:mm");

          setStartDate(startDateTime);
          setEndDate(endDateTime);

          // setStartDate(
          //   new Date(value.data.StartDate).toISOString().slice(0, 16)
          // );
          // setEndDate(new Date(value.data.EndDate).toISOString().slice(0, 16));
          // setEndDate(value.data.EndDate)
          setAddress(value.data.Address);
          setCity(value.data.City);
          // setState(value.data.State);
          setPostalCode(value.data.PostalCode);
          setShortName(value.data.ShortName);
          // setCountry(value.data.Country);
          // setListPrice(value.data.ListPrice);
          // setPrice(value.data.Price);
          setSummary(value.data.Summary);
          setEventType(value.data.EventType);
          setSelectedCurrency(value.data.payment_currency);
          setSelectedCounty(value.data.Country);
          setSelectedState(value.data.State);
          setImageURL(value.data.ImageURL);
          setTicket_Description(value.data.ticket_description)
          setAddon_Description(value.data.addon_description)
          setOther_Description(value.data.other_description)

          setServiceFee(value.data.ServiceFee)
          setMexicanVat(value.data.MexicanVAT)
          setAccommodationTax(value.data.AccommodationTax)
          setOndalindaFee(value.data.OndalindaFee)
          setStrip_fee(value.data.strip_fee)
          // new keys added accommodation expiry duration
          setExpiryDuration(value.data.expiry_duration)
          // new keys added accommodation partial payment duration
          setPartialDueDays(value.data.partial_payment_duration)
          setTimeout(() => {
            setEvent(value.data);
            setIsLoading(false);
          }, 2000);
        });
      // fetchedColors();
    }
  }, [id]);
  const [editorError, setEditorError] = useState(""); // State for editor error message

  const EventsUpdate = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    const editorContent = noteRef.current.summernote("code").trim();
    const isEditorContentEmpty =
      !editorContent || editorContent === "<p><br></p>" || editorContent === "";

    setLoading(true);
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidatedCustom(true);
      setLoading(false);

      // Set error message for editor
      // if (isEditorContentEmpty) {
      //   setEditorError("Event Description is required.");
      // } else {
      //   setEditorError(""); // Clear the error if the editor content is valid
      // }
      // return;
    } else {
      const EventsEditUrl = `/api/v1/events?id=${id}`;
      event.preventDefault();
      const body = new FormData();
      body.append("Name", Name);
      body.append("Address", Address);
      body.append("City", City);
      body.append("State", selectedState);
      body.append("Country", selectedCounty);
      body.append("PostalCode", PostalCode);
      const textContent = noteRef.current.summernote("code");
      body.append("Summary", textContent.trim());
      // body.append("Summary", Summary);

      // body.append("ImageURL", ImageURL);
      // body.append("Venue", Venue);
      // const ticketContent = ticketDescription.current.summernote("code");
      // body.append("ticket_description", ticketContent.trim());
      // const addonContent = addonDescription.current.summernote("code");
      // body.append("addon_description", addonContent.trim());
      // const otherContent = otherDescription.current.summernote("code");
      // body.append("other_description", otherContent.trim());

      body.append("PaymentCurrency", selectedCurrency);
      body.append("StartDate", StartDate);
      body.append("EndDate", EndDate);
      // console.log('>>>>>>>>>>>>>',EndDate);
      // return false

      // body.append("ListPrice", ListPrice); //23-01-2025
      body.append("EventType", eventType);
      body.append("EventTimeZone", timeZone);
      // body.append("Price", Price); //23-01-2025
      body.append("ShortName", ShortName);
      if (selectedImage) {
        body.append("ImageURL", selectedImage); // Append the selected image file if present
      }
      // new keys added (05-02-2025)
      body.append("ServiceFee", serviceFee);
      body.append("MexicanVAT", mexicanVat);
      body.append("AccommodationTax", accommodationTax);
      body.append("OndalindaFee", ondalindaFee);
      body.append("strip_fee", strip_fee);

      // Ticket Fee Percentages
      body.append("ticket_platform_fee_percentage", ticketPlatformFee);
      body.append("ticket_stripe_fee_percentage", ticketStripeFee);
      body.append("ticket_bank_fee_percentage", ticketBankFee);
      body.append("ticket_processing_fee_percentage", ticketProcessingFee);

      // Accommodation Fee Percentages
      // body.append("accommodation_stripe_fee_percentage", accommodationStripeFee);
      // body.append("accommodation_bank_fee_percentage", accommodationBankFee);
      // body.append("accommodation_processing_fee_percentage", accommodationProcessingFee);

      // body.append("expiry_duration", expiryDuration);
      // body.append("partial_payment_duration", partialDueDays);
      if (expiryDuration !== null && expiryDuration !== "" && expiryDuration !== "null") {
        body.append("expiry_duration", expiryDuration);
      }

      if (partialDueDays !== null && partialDueDays !== "" && partialDueDays !== "null") {
        body.append("partial_payment_duration", partialDueDays);
      }


      await axios
        .put(EventsEditUrl, body)
        .then((res) => {
          // console.log("res", res);
          setLoading(false);
          const msg = res.data.EdiEvents.message;
          localStorage.setItem("staticAdded", msg);
          routeChange();
        })
        .catch((err) => {
          const message = err.message;
          setLoading(false);
        });
    }
    setValidatedCustom(true);
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

  // const handleImageUpload = (files) => {
  //   const fileList = Array.from(files);
  //   fileList.forEach(async (file) => {
  //     await uploadImageToServer(file);
  //   });
  // };
  const handleImageUpload = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(async (file) => {
      await uploadImageToServer(file, "note");
    });
  };

  const handleTicketImageUpload = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(async (file) => {
      await uploadImageToServer(file, "ticket");
    });
  };

  // Addon Description Image
  const handleAddonImageUpload = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(async (file) => {
      await uploadImageToServer(file, "addon");
    });
  };

  // Other Description Image
  const handleOtherImageUpload = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(async (file) => {
      await uploadImageToServer(file, "other");
    });
  };

  const uploadImageToServer = async (file, editorType) => {
    try {
      setIsLoading(true);
      const body = new FormData();
      const apiurl = `/api/v1/cms/`;
      body.append("image", file);
      const response = await axios.post(apiurl, body);
      const imageUrl = `/uploads/profiles/${response.data}`;
      if (editorType === "note") {
        noteRef.current.summernote("insertImage", imageUrl);
      }

    } catch (err) {
      const message = err.response ? err.response.data.message : "";
      alert(message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch currencies on page load
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get("/api/v1/events/?key=getCurrency");
        if (response.data && response.data.success) {
          setCurrencies(response.data.data); // Adjust the key based on API response structure
        } else {
          console.error("Failed to fetch currencies:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await axios.get("/api/v1/country");
        if (response.data && response.data.success) {
          setCountry(response.data.data); // Adjust the key based on API response structure
        } else {
          console.error("Failed to fetch currencies:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };
    setIsClient(true);
    fetchCurrencies();
    fetchCountries();
  }, []);

  // Fetch all states from db
  const fetchAllStates = async (country_id) => {
    const { data } = await axios.get(`/api/v1/states?country_id=${country_id}`);
    if (data.success === true) {
      setState(data.data);
    } else {
      console.log("There was an issue fetching states");
    }
  };

  // UseEffect to make API calls when the component mounts or when the Country state changes
  useEffect(() => {
    const selectedCountryName = country.find(
      (country) => country.name === selectedCounty
    );

    if (selectedCountryName) {
      fetchAllStates(selectedCountryName.id);
      // fetchAllCountryLocation(selectedCountry.id);
    }
  }, [country, selectedCounty]); // This runs when Country or countries changes

  //DefaultValidation
  return (
    <div>
      <Seo title={"Edit Events"} />

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
              Edit
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}

      {/* <!--Row--> */}
      <div className="row">
        <Col lg={12} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Edit Event</h3>
            </Card.Header>
            <Card.Body className="p-sm-3 p-2">

              <CForm
                className="row g-3 needs-validation EdtEvtFrm"
                noValidate
                validated={validatedCustom}
                onSubmit={EventsUpdate}
              >
                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="validationDefault01">
                    Event Name<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault01"
                    placeholder="Name"
                    required
                    value={Name}
                    onChange={(e) => {
                      console.log(e.target.value);
                      setName(e.target.value);
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="EventSortName">
                    Event Sort Name<span style={{ color: "Red" }}>*</span>
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

                {/* <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault02">Venue </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault02"
                    placeholder="Venue"
                    value={Venue}
                    onChange={(e) => {
                      console.log(e.target.value);
                      setVenue(e.target.value);
                    }}
                  />
                </CCol> */}

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
                    {currencies &&
                      currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.Currency_symbol} - {currency.Currency}
                        </option>
                      ))}
                  </select>
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="currencyDropdown2">
                    Time Zone:<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <select
                    className="form-control"
                    id="currencyDropdown2"
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
                  <CFormLabel htmlFor="StartDateTIme">
                    Start Date Time<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <InputGroup className="input-group reactdate-pic">
                    <InputGroup.Text className="input-group-text">
                      <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                    </InputGroup.Text>
                    <CFormInput
                      id="StartDateTIme"
                      type="datetime-local"
                      style={{ display: "flex", alignItems: "center" }}
                      required
                      value={moment
                        .tz(StartDate, timeZone)
                        .format("YYYY-MM-DDTHH:mm")}
                      // min={new Date().toISOString().slice(0, 16)} 
                      onChange={handleStartDate}
                    />
                  </InputGroup>
                </CCol>

                <CCol lg={3} md={6} >
                  <CFormLabel htmlFor="EndDateTIme">
                    End Date Time<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <InputGroup className="input-group reactdate-pic">
                    <InputGroup.Text className="input-group-text">
                      <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                    </InputGroup.Text>
                    <CFormInput
                      id="EndDateTIme"
                      type="datetime-local"
                      style={{ display: "flex", alignItems: "center" }}
                      required
                      // value={EndDate}
                      value={moment
                        .tz(EndDate, timeZone)
                        .format("YYYY-MM-DDTHH:mm")}
                      min={StartDate || new Date().toISOString().slice(0, 16)}
                      onChange={handleEndDate}
                    />
                  </InputGroup>
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="EventImage">
                    Event Image
                  </CFormLabel>
                  <CFormInput
                    type="file"
                    id="EventImage"
                    // placeholder="Postal Code"
                    // onChange={(e) => {
                    //   console.log(e.target.value);
                    //   setImageURL(e.target.files[0]);
                    // }}
                    onChange={(e) => {
                      setSelectedImage(e.target.files[0]); // Store the selected image in state
                    }}
                  />
                  {selectedImage ? (
                    <Image
                      src={URL.createObjectURL(selectedImage)} // Preview the selected image
                      alt="Selected Image"
                      style={{ marginTop: "10px", objectFit: "cover", borderRadius: "10px", }}
                      width={200}
                      height={75}
                    />
                  ) : ImageURL ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_S3_URL}/profiles/${ImageURL}`} // Show the current image
                      alt="Event Image"
                      style={{ marginTop: "10px", objectFit: "cover", borderRadius: "10px", }}
                      width={200}
                      height={75}
                    />
                  ) : (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_S3_URL}/no-image-1.png`}
                      alt="Image Not Found"
                      style={{ marginTop: "10px", objectFit: "cover", borderRadius: "10px", }}
                      width={200}
                      height={75}
                    />
                  )}

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
                    <option value="1">Without Housig</option>
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
                      console.log(e.target.value);
                      setSummary(e.target.value);
                    }}
                  />
                </CCol> */}

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="ServiceFee">
                    Service Fee (%)
                  </CFormLabel>
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
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setServiceFee(value);
                      }
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="MexicanVAT">
                    Mexican VAT (%)
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="MexicanVAT"
                    placeholder="Mexican VAT"
                    value={mexicanVat}
                    // onChange={(e) => {
                    //   setMexicanVat(e.target.value);
                    // }}
                    // onChange={(e) => {
                    //   const value = e.target.value;
                    //   if (value >= 0) {
                    //     setMexicanVat(value);
                    //   }
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
                  <CFormLabel htmlFor="AccommodationTax">
                    Accommodation Tax (%)
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="AccommodationTax"
                    placeholder="Accommodation Tax"
                    value={accommodationTax}
                    // onChange={(e) => {
                    //   setAccommodationTax(e.target.value);
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
                  <CFormLabel htmlFor="OndalindaFee">
                    Ondalinda Fee (%)
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="OndalindaFee"
                    placeholder="Ondalinda Fee"
                    value={ondalindaFee}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setOndalindaFee(value);
                      }
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="StripFee">
                    Stripe Fee (%)
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="StripFee"
                    placeholder="Strip Fee"
                    value={strip_fee}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 && value <= 100) {
                        setStrip_fee(value);
                      }
                    }}
                  />
                </CCol>


                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="expiryDuration">Accommodation expiry duration(days)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="expiryDuration"
                    value={expiryDuration === "null" || expiryDuration === null ? "" : expiryDuration}
                    placeholder="Accommodation request expiry duration"
                    onChange={(e) => {
                      const value = e.target.value.trim(); // remove leading/trailing spaces
                      if (value === "") {
                        setExpiryDuration(""); // keep it empty
                      } else if (!isNaN(value) && value >= 0 && value <= 100) {
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
                    value={partialDueDays === "null" || partialDueDays === null ? "" : partialDueDays}
                    placeholder="Collect partial payment"
                    onChange={(e) => {
                      // const value = e.target.value;
                      const value = e.target.value.trim();
                      if (value === "") {
                        setPartialDueDays("");
                      } else if (value >= 0 && value <= 100) {
                        setPartialDueDays(value);
                      }
                    }}
                  />
                </CCol>


                {/* ===== Ticket Fee Section ===== */}
                <CCol xs={12} className="border-bottom pb-2 mb-1">
                  <h6 className="fw-bold"> Fee Details</h6>
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

                {/* ===== Accommodation Fee Section ===== */}
                {/* <CCol xs={12} className="border-bottom pb-2 mt-4 mb-1">
                  <h6 className="fw-bold">Accommodation Fee Details</h6> */}
                {/* <small className="text-muted">Enter applicable fees for accommodation bookings</small> */}
                {/* </CCol> */}

                {/* <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="accommodationStripeFee">Accommodation Stripe Fee (%)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="accommodationStripeFee"
                    value={accommodationStripeFee}
                    placeholder="Enter stripe fee for accommodation"
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === "") setAccommodationStripeFee("");
                      else if (!isNaN(value) && value >= 0 && value <= 100) setAccommodationStripeFee(value);
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="accommodationBankFee">Accommodation Bank Fee (%)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="accommodationBankFee"
                    value={accommodationBankFee}
                    placeholder="Enter bank fee for accommodation"
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === "") setAccommodationBankFee("");
                      else if (!isNaN(value) && value >= 0 && value <= 100) setAccommodationBankFee(value);
                    }}
                  />
                </CCol>

                <CCol lg={3} md={6}>
                  <CFormLabel htmlFor="accommodationProcessingFee">Accommodation Processing Fee (%)</CFormLabel>
                  <CFormInput
                    type="text"
                    id="accommodationProcessingFee"
                    value={accommodationProcessingFee}
                    placeholder="Enter processing fee for accommodation"
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === "") setAccommodationProcessingFee("");
                      else if (!isNaN(value) && value >= 0 && value <= 100) setAccommodationProcessingFee(value);
                    }}
                  />
                </CCol> */}








                <CCol md={12}>
                  <b>Event Description:</b>
                  {/* <span style={{ color: "Red" }}>*</span> */}
                  <br />
                  {/* Display editor error message */}
                  {/* {editorError && (
                    <p
                      style={{
                        color: "red",
                        marginTop: "5px",
                        marginBottom: "5px",
                      }}
                    >
                      {editorError}
                    </p>
                  )} */}
                  {isClient ? (
                    <div className="mt-2">
                      <SummernoteLite
                        ref={noteRef}
                        defaultCodeValue={Summary}
                        placeholder={"Write something here..."}
                        tabsize={2}
                        lang="zh-CN" // only if you want to change the default language
                        height={150 || "30vh"}
                        dialogsInBody={true}
                        blockquoteBreakingLevel={0}
                        toolbar={[
                          ["style", ["style"]],
                          [
                            "font",
                            [
                              "bold",
                              "underline",
                              "clear",
                              "strikethrough",
                              "superscript",
                              "subscript",
                            ],
                          ],
                          ["fontsize", ["fontsize"]],
                          ["fontname", ["fontname"]],
                          ["color", ["color"]],
                          ["para", ["ul", "ol", "paragraph"]],
                          ["table", ["table"]],
                          ["insert", ["link", "picture", "video", "hr"]],
                          ["view", ["fullscreen", "codeview", "help"]],
                        ]}
                        fontNames={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontNamesIgnoreCheck={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontSizes={[
                          "8",
                          "9",
                          "10",
                          "11",
                          "12",
                          "14",
                          "16",
                          "18",
                          "20",
                          "22",
                          "24",
                          "28",
                          "32",
                          "36",
                          "40",
                          "44",
                          "48",
                          "54",
                          "60",
                          "66",
                          "72",
                          "78",
                          "80",
                          "82",
                          "84",
                          "86",
                          "92",
                          "98",
                          "100",
                          "102",
                          "106",
                          "108",
                          "110",
                          "116",
                          "120",
                        ]}
                        // onChange={(content) => setData({ ...data, content })}
                        // callbacks={{
                        //   onImageUpload: handleImageUpload,
                        // }}
                        callbacks={{
                          onImageUpload: handleImageUpload,
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </CCol>



                <CCol md={4} className="d-flex justify-content-between">
                  <Link className="w-50 me-2" href="/admin/events">
                    <CButton className="w-100" color="dark op-7">Back</CButton>
                  </Link>

                  <CButton
                    variant="primary"
                    className="btn w-50 btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
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
                {/* <CButton color="primary" type="submit">
                    Submit
                  </CButton> */}



              </CForm>
            </Card.Body>
          </Card>
        </Col>
      </div>
      {/* <!--/Row--> */}

    </div>
  );
};

EventEdit.propTypes = {};

EventEdit.defaultProps = {};

EventEdit.layout = "Contentlayout";

export default EventEdit;
