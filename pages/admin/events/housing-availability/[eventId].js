import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  Card,
  Row,
  Col,
  Breadcrumb,
  Alert,
  InputGroup,
  Collapse,
  Spinner,
} from "react-bootstrap";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CButton,
} from "@coreui/react";

import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import Link from "next/link";
import DataTable from "react-data-table-component";
import moment from "moment-timezone";
import dynamic from "next/dynamic";
const DataTableExtensions = dynamic(
  () => import("react-data-table-component-extensions"),
  { ssr: false }
);

const HousingAvailability = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const [data, setHouseData] = useState([]);
  const [eventDetails, setEventDetails] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // searching states......
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [housingTypes, setHousingTypes] = useState([]);
  const [type, setType] = useState("");
  const [numBedrooms, setNumBedrooms] = useState("");

  const [selectedOpenHousing, setSelectedOpenHousing] = useState("");
  const [housingDetailsSelected, setHousingDetailsSelected] = useState("");
  const [isBookedByMember, setIsBookedByMember] = useState(false);

  useEffect(() => {
    if (housingDetailsSelected?.isBooked == "Y") {
      setIsBookedByMember(true);
    } else {
      setIsBookedByMember(false);
    }
  }, [housingDetailsSelected]);

  // console.log('housingDetailsSelected', housingDetailsSelected);

  // #########################################
  const [basePrice, setBasePrice] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(""); // Formatted value (shown in input)
  const [serviceFee, setServiceFee] = useState(0);
  const [vat, setVat] = useState(0);
  const [accommodationTax, setAccommodationTax] = useState(0);
  const [ondalindaFee, setOndalindaFee] = useState(0);
  const [stripeFeePercent, setStripeFeePercent] = useState(0);
  const [availabilityStartDate, setAvailabilityStartDate] = useState("");
  const [availabilityEndDate, setAvailabilityEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [ticket_bank_fee_percentage, setTicket_bank_fee_percentage] =
    useState(0);
  const [ticket_processing_fee_percentage, seTicket_processing_fee_percentage] =
    useState(0);
  const [ticket_stripe_fee_percentage, setTicket_stripe_fee_percentage] =
    useState(0);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [location, setLocation] = useState("");
  const formRef = useRef(null);
  const [basic, setBasic] = useState(false);
  const closedModal = () => setBasic(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchHouseData();
      fetchEventDetails(eventId);
      // use of searching
      getNeighborhood();
      getHousingTypes();
    }
  }, [eventId]);

  const [totals, setTotals] = useState({
    serviceFeeAmt: 0,
    vatAmt: 0,
    accommodationTaxAmt: 0,
    ondalindaFeeAmt: 0,
    totalAfterTaxes: 0,
    totalGuestPayout: 0,
    totalPayoutHomeOwner: 0,
    stripeFeeAmt: 0,
    ticketBank_fee_Amount: 0,
    ticketProcessing_fee_Amount: 0,
    ticketStripe_fee_Amount: 0,
  });

  useEffect(() => {
    const base = parseFloat(basePrice || 0);

    const serviceFeeAmt = (base * serviceFee) / 100;
    const vatAmt = (base * vat) / 100;
    const accommodationTaxAmt = (base * accommodationTax) / 100;
    const totalAfterTaxes = base + serviceFeeAmt + vatAmt + accommodationTaxAmt;

    const ticketBank_fee_Amount = (totalAfterTaxes * ticket_bank_fee_percentage) / 100;
    const ticketProcessing_fee_Amount = (totalAfterTaxes * ticket_processing_fee_percentage) / 100;
    // const ticketStripe_fee_Amount = (totalAfterTaxes * ticket_stripe_fee_percentage) / 100;

    // Calculate net and gross
    const stripeFeeDecimal = ticket_stripe_fee_percentage / 100;
    const netAmount = totalAfterTaxes + ticketBank_fee_Amount + ticketProcessing_fee_Amount;
    const grossAmount = netAmount / (1 - stripeFeeDecimal);
    const ticketStripe_fee_Amount = grossAmount - netAmount;
    // console.log('>>>>>>> Net:', netAmount.toFixed(2),
    //   'Gross:', grossAmount.toFixed(2),
    //   'Stripe Fee %:', ticket_stripe_fee_percentage,
    //   'Stripe Fee Amt:', ticketStripe_fee_Amount.toFixed(2));

    const stripeFeeAmt = (totalAfterTaxes * stripeFeePercent) / 100;
    const ondalindaFeeAmt = (base * ondalindaFee) / 100;

    const totalGuestPayout = totalAfterTaxes + ticketBank_fee_Amount + ticketProcessing_fee_Amount + ticketStripe_fee_Amount;
    const totalPayoutHomeOwner = totalAfterTaxes - ondalindaFeeAmt;

    setTotals({
      serviceFeeAmt,
      vatAmt,
      accommodationTaxAmt,
      ondalindaFeeAmt,
      totalAfterTaxes,
      stripeFeeAmt,
      ticketBank_fee_Amount,
      ticketProcessing_fee_Amount,
      ticketStripe_fee_Amount,
      totalGuestPayout,
      totalPayoutHomeOwner,
    });

  }, [
    basePrice,
    serviceFee,
    vat,
    accommodationTax,
    ondalindaFee,
    stripeFeePercent,
  ]);

  // #########################################################
  const handleOpenModal = (selectedRow) => {
    setSelectedOpenHousing(selectedRow);
    const housingDetailsSelect = selectedRow.EventHousings.find(
      (current) => current.EventID == eventId
    );

    // console.log('>>>>>>>',housingDetailsSelect);

    if (housingDetailsSelect) {
      setHousingDetailsSelected(housingDetailsSelect);

      // Dynamic updates
      setBasePrice(parseFloat(housingDetailsSelect.BaseNightlyPrice || 0));
      setDisplayPrice(
        formatWithCommas(housingDetailsSelect.BaseNightlyPrice || 0)
      );
      setServiceFee(
        parseFloat(housingDetailsSelect.ServiceFee || eventDetails.ServiceFee)
      );
      setVat(
        parseFloat(housingDetailsSelect.MexicanVAT || eventDetails.MexicanVAT)
      );
      setAccommodationTax(
        parseFloat(
          housingDetailsSelect.AccommodationTax || eventDetails.AccommodationTax
        )
      );
      setOndalindaFee(
        parseFloat(
          housingDetailsSelect.OndalindaFee || eventDetails.OndalindaFee
        )
      );
      setStripeFeePercent(
        parseFloat(housingDetailsSelect.stripe_fee || eventDetails.strip_fee)
      );
      setAvailabilityStartDate(
        housingDetailsSelect.AvailabilityStartDate || ""
      );
      setAvailabilityEndDate(housingDetailsSelect.AvailabilityEndDate || "");
      setAvailabilityStatus(housingDetailsSelect.Status || "");
      setInternalNotes(housingDetailsSelect.InternalNotes || "");

      setTicket_bank_fee_percentage(
        parseFloat(housingDetailsSelect.ticket_bank_fee_percentage) ||
        parseFloat(eventDetails.ticket_bank_fee_percentage)
      );
      seTicket_processing_fee_percentage(
        parseFloat(housingDetailsSelect.ticket_processing_fee_percentage) ||
        parseFloat(eventDetails.ticket_processing_fee_percentage)
      );
      setTicket_stripe_fee_percentage(
        parseFloat(housingDetailsSelect.ticket_stripe_fee_percentage) ||
        parseFloat(eventDetails.ticket_stripe_fee_percentage)
      );
    } else {
      // console.log('>>>>>>>>>', eventDetails);
      setBasePrice(0);
      setDisplayPrice(0);
      setServiceFee(parseFloat(eventDetails.ServiceFee || 0));
      setVat(parseFloat(eventDetails.MexicanVAT || 0));
      setAccommodationTax(parseFloat(eventDetails.AccommodationTax || 0));
      setOndalindaFee(parseFloat(eventDetails.OndalindaFee || 0));
      setStripeFeePercent(parseFloat(eventDetails.strip_fee || 0));
      setAvailabilityStartDate(null);
      setAvailabilityEndDate(null);
      setAvailabilityStatus(null);
      setTicket_bank_fee_percentage(
        parseFloat(eventDetails.ticket_bank_fee_percentage) || 0
      );
      seTicket_processing_fee_percentage(
        parseFloat(eventDetails.ticket_processing_fee_percentage) || 0
      );
      setTicket_stripe_fee_percentage(
        parseFloat(eventDetails.ticket_stripe_fee_percentage) || 0
      );
    }

    setIsOpen(true);
  };

  // =================================================================

  const validateDateDifference = () => {
    const availableFrom = new Date(availabilityStartDate);
    const availableTo = new Date(availabilityEndDate);
    const timeDiff = availableTo - availableFrom;
    const dayDiff = timeDiff / (1000 * 3600 * 24);
    // if (dayDiff < 3 || dayDiff > 6) {
    if (dayDiff < 3) {
      // "Minimum 3 days and maximum 6 days stay is compulsory."
      setFormError("Minimum 3 days stay is compulsory.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous errors
    setDateError("");
    setFormError("");
    if (!formRef.current) return;

    // Basic empty field validation
    if (!availabilityStartDate || !availabilityEndDate || !basePrice) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (availabilityStatus == 2) {
      // Validate if Available To date is not less than Available From date
      if (!validateDateDifference()) {
        return false;
      }
    }

    const cleanCurrency = (value) => {
      if (!value) return 0;

      return (
        parseFloat(
          String(value)
            .replace(/[^\d.-]/g, "") // Keep only digits, dot, minus
            .trim()
        ) || 0
      );
    };

    const formBody = new FormData(formRef.current);
    const data = {};
    for (let [key, value] of formBody.entries()) {
      data[key] = value;
    }
    setFormError("");

    // return false;
    const body = new FormData();
    body.append("key", "add_update_housing");
    body.append("Status", data.availability);
    body.append("InternalNotes", data.internalNotes);
    body.append("EventID", eventId);
    body.append("HousingID", selectedOpenHousing.id);
    body.append("isBookedByMember", isBookedByMember);

    // if (data.availability == 2) {
    body.append("AvailabilityStartDate", data.availabilityStartDate);
    body.append("AvailabilityEndDate", data.availabilityEndDate);

    // Cleaned and converted amounts
    body.append("ServiceFeeAmount", cleanCurrency(data.serviceFeeAmount));
    body.append("MexicanVatAmount", cleanCurrency(data.MexicanVatAmount));
    body.append("accommodationTaxAmount", cleanCurrency(data.accommodationTaxAmount));
    body.append("ondalindaFeeAmount", cleanCurrency(data.ondalindaFeeAmount));
    body.append("stripeFeeAmount", cleanCurrency(data.stripeFeeAmount));
    body.append("bankFeeAmount", cleanCurrency(data.bankFeeAmount));
    body.append("processingFeeAmount", cleanCurrency(data.processingFeeAmount));
    body.append("totalAfterTaxes", cleanCurrency(data.totalAfterTaxes));
    body.append("totalPayoutHomeOwner", cleanCurrency(data.totalPayoutHomeOwner)
    );

    // Percentages
    body.append(
      "serviceFeePercentage",
      cleanCurrency(data.serviceFeePercentage)
    );
    body.append(
      "MexicanVatPercentage",
      cleanCurrency(data.MexicanVatPercentage)
    );
    body.append(
      "accommodationTaxPercentage",
      cleanCurrency(data.accommodationTaxPercentage)
    );
    body.append(
      "OndalindaFeePercentage",
      cleanCurrency(data.OndalindaFeePercentage)
    );
    body.append("StripeFeePercentage", cleanCurrency(data.StripeFeePercentage));
    body.append("BankFeePercentage", cleanCurrency(data.BankFeePercentage));
    body.append(
      "ProcessingFeePercentage",
      cleanCurrency(data.ProcessingFeePercentage)
    );

    body.append("basePrice", cleanCurrency(data.basePrice));
    body.append("totalGuestPayout", cleanCurrency(data.totalGuestPayout));

    const housingUpdate = "/api/v1/housings/";

    try {
      const response = await axios.post(housingUpdate, body);
      Swal.fire({
        title: "Success!",
        text: response.data.message,
        icon: "success",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
        confirmButtonText: "OK",
      });
      setIsOpen(false);
      await fetchHouseData(); // Call this only on success
    } catch (error) {
      setFormError(error?.response?.data?.message || "Something went wrong.");
      Swal.fire({
        title: "Error!",
        text: error?.response?.data?.message || "Something went wrong.",
        icon: "error",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
        confirmButtonText: "OK",
      });
    }
  };

  const fetchHouseData = async () => {
    try {
      // setLoading(true);
      const response = await axios.get(`/api/v1/housings`);
      setHouseData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching housing data:", error);
      setLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const { data } = await axios.get(`/api/v1/events/?id=${eventId}`);
      if (data.data) {
        // console.log('>>>>>>>>>>>', data.data);
        setEventDetails(data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setLoading(false);
    }
  };

  // get Neighborhood housing
  const getNeighborhood = async () => {
    try {
      const ApiUrl = "/api/v1/housings-new/";
      const body = new FormData();
      body.append("key", "getHousingNeighborhood");
      const response = await axios.post(ApiUrl, body);
      const data = response.data;
      if (data.success) {
        setNeighborhoods(data.data);
      } else {
        console.log("errr");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // get Housing Types
  const getHousingTypes = async () => {
    try {
      const ApiUrl = "/api/v1/housings-new/";
      const body = new FormData();
      body.append("key", "get_housingTypes");
      const response = await axios.post(ApiUrl, body);
      const data = response.data;
      if (data.success) {
        setHousingTypes(data.data);
      } else {
        console.log("errr");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    // Check if all fields are empty
    if (
      !name &&
      !neighborhood &&
      !type &&
      !numBedrooms &&
      !status &&
      !location &&
      !paymentStatus
    ) {
      console.log("No search criteria provided. API call skipped.");
      return; // Exit the function if all fields are empty
    }
    setLoading(true);
    setBasic(false);
    const housingSearchUrl = "/api/v1/housings/";
    event.preventDefault();
    const body = new FormData();
    body.append("key", "search_event_housing");
    body.append("Name", name);
    body.append("Neighborhood", neighborhood);
    body.append("Type", type);
    body.append("NumBedrooms", numBedrooms), body.append("Status", status);
    body.append("location", location);
    body.append("paymentStatus", paymentStatus);
    await axios
      .post(housingSearchUrl, body)
      .then((res) => {
        setLoading(false);
        setBasic(false);
        if (res.data.success) {
          setHouseData(res.data.data);
        } else {
          console.log("Search data not found");
        }
      })
      .catch((err) => {
        console.log("message", err);
        setLoading(false);
        setBasic(false);
      });
  };

  // Reset all data after the search
  const HandleResetData = async () => {
    setLoading(true);
    setType("");
    setName("");
    setNeighborhood("");
    setNumBedrooms("");
    setStatus("");
    setLocation("");
    setPaymentStatus("");
    fetchHouseData();
    fetchEventDetails(eventId);
    // use of searching
    getNeighborhood();
    getHousingTypes();
    setBasic(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "33vh",
        }}
      >
        <Spinner
          animation="border"
          role="status"
          variant="primary"
          style={{ width: "30px", height: "30px" }}
        >
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const getStatusName = (id) => {
    switch (id) {
      case 0:
        return "Unspecified";
      case 5:
        return "Info Not Updated";
      case 1:
        return "Not available to rent / homeowner does not want to event";
      case 2:
        return "Available to Rent";
      case 3:
        return "Not available to rent / homeowner is coming to event";
      case 4:
        return "Allocated for Staff";
      case 6:
        return "Contact to Property Owner";
      case 7:
        return "Booked for staff";
      default:
        return "";
    }
  };

  function formatSmartPrice(amount) {
    if (isNaN(amount)) return "Invalid amount";

    const isInteger = Number(amount) % 1 === 0;
    const formatted = isInteger
      ? Number(amount).toLocaleString()
      : Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    return `$${formatted}`;
  }

  function extractAmount(id) {
    const text = document.getElementById(id).textContent;
    return parseFloat(text.replace(/[^\d.-]/g, "")) || 0;
  }

  // Format with commas (Nightly price-(kamal-07-06-2025))
  const formatWithCommas = (value) => {
    if (!value) return "";
    const intValue = parseInt(value); // convert "4000.00" → 4000
    return intValue.toLocaleString("en-US"); // → "4,000"
  };

  // On input change
  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/,/g, ""); // Remove commas for raw value
    if (!/^\d*$/.test(raw)) return;

    setBasePrice(raw); // Set raw value for backend/calculation
    setDisplayPrice(formatWithCommas(raw)); // Show formatted value in input
  };

  const columns = [
    {
      name: "Property Details",
      className: "property-cell",
      selector: (row) => {
        const housingDetails = row.EventHousings.find(
          (current) => current.EventID == eventId
        );
        let AvailabilityStatus = "";
        if (housingDetails) {
          AvailabilityStatus = getStatusName(housingDetails.Status);
        }
        const booking = row.AccommodationBookings?.find(
          (b) => b.event_id == eventId
        );

        const internalNotes = housingDetails?.InternalNotes || "";

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",

              padding: "8px 0px",
              minWidth: "200px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {/* <span style={{ fontWeight: "bold", marginRight: "8px",  minWidth: "max-content", }}>
                Property Name:
              </span> */}
              <Link
                href={`/housing/${row.Name ? row.Name.replace(/ /g, "+") : ""}`}
                target="_blank"
                title="View Property Details"
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                  minWidth: "max-content",
                  color: "#047a67",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                <span style={{ fontWeight: "bold", whiteSpace: "normal" }}>
                  {row.Name}
                </span>
              </Link>
              <div className="d-flex align-items-center gap-2 margin-top-2 pro-det-btn">
                <button
                  className="btn "
                  style={{ padding: "0px", fontSize: "15px" }}
                  title="Edit Property Info"
                  onClick={() => handleOpenModal(row)}
                >
                  <i class="bi bi-pencil-fill"></i>
                </button>
                {internalNotes && (
                  <button
                    className="btn"
                    style={{ padding: "0px", fontSize: "17px" }}
                    title="View Internal Notes"
                    onClick={() => showNotesAlert(internalNotes)}
                  >
                    <i className="bi bi-eye-fill"></i>
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "2px",
                  minWidth: "max-content",
                }}
              >
                Neighborhood:
              </span>
              <span style={{ whiteSpace: "normal" }}>
                {row.HousingNeighborhood?.name}
              </span>
            </div>

            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "2px",
                  minWidth: "max-content",
                }}
              >
                Type:
              </span>
              <span style={{ whiteSpace: "normal" }}>
                {row.HousingType?.name}
              </span>
            </div>

            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "2px",
                  minWidth: "max-content",
                }}
              >
                Location:
              </span>
              <span style={{ whiteSpace: "normal" }}>{row.location}</span>
            </div>

            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "2px",
                  minWidth: "max-content",
                }}
              >
                Availability:
              </span>
              <span
                className="text-capitalize"
                style={{ whiteSpace: "normal" }}
              >
                {row.AccommodationBookings?.length > 0
                  ? "Booked by member"
                  : AvailabilityStatus}
              </span>
            </div>

            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "2px",
                  minWidth: "max-content",
                }}
              >
                Max Occupancy:
              </span>
              <span style={{ whiteSpace: "normal" }}> {row.MaxOccupancy}</span>
            </div>
            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "2px",
                  minWidth: "max-content",
                }}
              >
                Available Date:
              </span>
              <span
                className="text-capitalize"
                style={{ whiteSpace: "normal" }}
              >
                <ul
                  className="date-view"
                  style={{ padding: "0", margin: "0", listStyleType: "none" }}
                >
                  {/* <li> {moment.utc(housingDetails.AvailabilityStartDate).format('DD-MMM-YYYY')} </li>  
                   <li style={{ marginRight: "5px",  marginLeft: "5px", }}> To </li> 
                  <li> {moment.utc(housingDetails.AvailabilityEndDate).format('DD-MMM-YYYY')} </li> */}
                  <li>
                    {housingDetails?.AvailabilityStartDate &&
                      housingDetails?.AvailabilityEndDate
                      ? `${moment
                        .utc(housingDetails.AvailabilityStartDate)
                        .format("MMM D")} - ${moment
                          .utc(housingDetails.AvailabilityEndDate)
                          .format("D, YYYY")}`
                      : "N/A"}
                  </li>
                </ul>
              </span>
            </div>

            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "2px",
                  minWidth: "max-content",
                }}
              >
                Status:
              </span>
              <span
                className="text-capitalize"
                style={{ whiteSpace: "normal" }}
              >
                {booking ? `${booking.payment_status}` : "--"}
              </span>
            </div>
          </div>
        );
      },
      sortable: true,
      minWidth: "235px",
    },
    {
      name: "Renter",
      selector: (row) => {
        const booking = row.AccommodationBookings?.find(
          (b) => b.event_id == eventId
        );

        // console.log("booking", booking);

        const ticketCount = booking?.MyOrder?.TicketBooks?.length || 0;
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              padding: "8px 0px",
              minWidth: "200px",
            }}
          >
            {booking ? (
              <>
                <div style={{ display: "flex", marginBottom: "2px" }}>
                  {/* <span style={{ fontWeight: "bold", marginRight: "8px" }}>
                    Name:
                  </span> */}
                  <span>
                    {booking
                      ? `${booking.first_name} ${booking.last_name}`
                      : "--"}
                  </span>
                </div>
                <div style={{ display: "flex", marginBottom: "2px" }}>
                  {/* <span style={{ fontWeight: "bold", marginRight: "8px" }}>
                    Email:
                  </span> */}
                  <span>{booking ? booking.email : "--"}</span>
                </div>
                <div style={{ display: "flex", marginBottom: "2px" }}>
                  <span>{booking.User ? booking.User.PhoneNumber : "--"}</span>
                </div>
                {/* <div style={{ display: "flex",  }}>
                  <span style={{ fontWeight: "bold", marginRight: "8px" }}>
                    9876543210
                  </span>
                  <span>{booking ? booking.text : "--"}</span>
                </div> */}

                <div style={{ display: "flex" }}>
                  <span
                    style={{
                      fontWeight: "bold",
                      marginRight: "8px",
                      marginBottom: "2px",
                      minWidth: "max-content",
                    }}
                  >
                    Booking Date:
                  </span>
                  <span>
                    <ul
                      className="date-view"
                      style={{
                        padding: "0",
                        margin: "0",
                        listStyleType: "none",
                      }}
                    >
                      <li>
                        {moment.utc(booking.check_in_date).format("MMM D")}
                        {" - "}
                        {moment
                          .utc(booking.check_out_date)
                          .format(
                            moment.utc(booking.check_in_date).format("MMM") ===
                              moment.utc(booking.check_out_date).format("MMM")
                              ? "D, YYYY"
                              : "MMM D, YYYY"
                          )}
                      </li>
                    </ul>
                  </span>
                </div>

                <div style={{ display: "flex", marginBottom: "2px" }}>
                  <span style={{ fontWeight: "bold", marginRight: "8px" }}>
                    Tickets:
                  </span>
                  <span style={{ whiteSpace: "normal" }}>
                    {ticketCount}/{row.MaxOccupancy}
                  </span>
                  <span>{booking ? booking.text : "--"}</span>
                </div>
              </>
            ) : (
              "--"
            )}
          </div>
        );
      },
      sortable: true,
      minWidth: "235px",
    },
    {
      name: "House Manager",
      selector: (row) => {
        const housingDetails = row.EventHousings.find(
          (current) => current.EventID == eventId
        );
        let AvailabilityStatus = "";
        if (housingDetails) {
          AvailabilityStatus = getStatusName(housingDetails.Status);
        }

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              padding: "8px 0px",
              minWidth: "200px",
            }}
          >
            <div style={{ display: "flex", marginBottom: "2px" }}>
              {/* <span style={{ fontWeight: "bold", marginRight: "8px" }}>
              House Manager Name:
            </span> */}
              <span>{row.ManagerName ? row.ManagerName : "N/A"}</span>
            </div>
            <div style={{ display: "flex", marginBottom: "2px" }}>
              {/* <span style={{ fontWeight: "bold", marginRight: "8px" }}>
              House Manager Email:
            </span> */}
              <span>{row.ManagerEmail}</span>
            </div>
            <div style={{ display: "flex", marginBottom: "2px" }}>
              <span>{row.ManagerMobile}</span>
            </div>
            {/* <div style={{ display: "flex", }}>
              <span style={{ fontWeight: "bold", marginRight: "8px", minWidth: "max-content", }}>
                Max Occupancy:
              </span>
              <span style={{ whiteSpace: "normal" }}> {row.MaxOccupancy}</span>
            </div>
            <div style={{ display: "flex", }}>
              <span style={{ fontWeight: "bold", marginRight: "8px", minWidth: "max-content", }}>
                Avai. Dates:
              </span>
              <span className="text-capitalize" style={{ whiteSpace: "normal" }}>
                {moment.utc(housingDetails.AvailabilityStartDate).format('DD-MMM-YYYY')} to {moment.utc(housingDetails.AvailabilityEndDate).format('DD-MMM-YYYY')}
              </span>
            </div> */}
          </div>
        );
      },
      sortable: true,
      minWidth: "235px",
    },
    {
      name: "Beds",
      selector: (row) => {
        const bedrooms = row.Housings || [];

        if (bedrooms.length === 0) {
          return <div>No beds available</div>;
        }

        // Group beds by bedroom_number and HousingBedType.name
        const groupedBeds = bedrooms.reduce((acc, bed) => {
          const { bedroom_number, HousingBedType } = bed;

          if (HousingBedType && HousingBedType.name) {
            acc[bedroom_number] = acc[bedroom_number] || {};
            acc[bedroom_number][HousingBedType.name] =
              (acc[bedroom_number][HousingBedType.name] || 0) + 1;
          }
          return acc;
        }, {});

        return (
          <div
            className="d-flex flex-column text-view"
            style={{ padding: "8px 0px" }}
          >
            <div style={{ display: "flex", marginBottom: "2px" }}>
              <span
                style={{
                  fontWeight: "bold",
                  marginRight: "18px",
                  display: "inline-block",
                }}
              >
                Bedrooms:
              </span>
              <span>{row.NumBedrooms}</span>
            </div>
            {Object.entries(groupedBeds).map(([bedroomNumber, beds]) => (
              <div key={bedroomNumber} style={{ display: "flex" }}>
                <strong
                  style={{
                    marginRight: "8px",
                    marginBottom: "2px",
                    display: "inline-block",
                    minWidth: "72px",
                  }}
                >
                  {" "}
                  Bedroom {bedroomNumber}:
                </strong>{" "}
                <div>
                  {" "}
                  {Object.entries(beds).map(([bedType, count]) => (
                    <span key={bedType} style={{ whiteSpace: "normal" }}>
                      {count} {bedType}{" "}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      },
      sortable: true,
      minWidth: "235px",
    },
    {
      name: "Nightly Price",
      selector: (row) => {
        const housingDetails = row.EventHousings.find(
          (current) => current.EventID == eventId
        );

        // Default values
        let finalPrice = 0;
        let subtotalBeforeTxnFees = 0;
        let ondalindaTaxFees = 0;
        let ticketStripe_fee_Amount = 0;

        if (housingDetails) {
          // Parse all relevant values
          // console.log("--------", housingDetails)

          const stripeFee = parseFloat(housingDetails.ticket_stripe_fee_percentage || 0);
          const ticketBank_fee_Amount = parseFloat(housingDetails.ticket_bank_fee_amount || 0);
          const ticketProcessing_fee_Amount = parseFloat(housingDetails.ticket_processing_fee_amount || 0);
          const totalAfterTaxes = parseFloat(housingDetails.totalAfterTaxes || 0);


          const netAmount = totalAfterTaxes + ticketBank_fee_Amount + ticketProcessing_fee_Amount;
          const baseNightlyPrice = parseFloat(housingDetails.BaseNightlyPrice) || 0;
          const stripeFeeDecimal = stripeFee / 100;
          // console.log('>>>>>>>>netAmount', netAmount);
          const grossAmount = netAmount / (1 - stripeFeeDecimal);
          // console.log('>>>>>>>>', grossAmount);
          ticketStripe_fee_Amount = grossAmount - netAmount;

          const serviceFeePercentage =
            housingDetails && housingDetails.ServiceFee != null
              ? parseFloat(housingDetails.ServiceFee)
              : eventDetails && eventDetails.ServiceFee
                ? parseFloat(eventDetails.ServiceFee)
                : 0;

          const mexicanVatPercentage =
            housingDetails && housingDetails.MexicanVAT != null
              ? parseFloat(housingDetails.MexicanVAT)
              : eventDetails && eventDetails.MexicanVAT
                ? parseFloat(eventDetails.MexicanVAT)
                : 0;
          const accommodationTaxPercentage = parseFloat(eventDetails.AccommodationTax) || 0;

          const ondalindaFeePercentage =
            eventDetails && eventDetails.OndalindaFee
              ? parseFloat(eventDetails.OndalindaFee)
              : 0;

          const stripFeePercentage =
            eventDetails && eventDetails.strip_fee
              ? parseFloat(eventDetails.strip_fee)
              : 0;

          // Calculate subtotal before transaction fees
          subtotalBeforeTxnFees =
            baseNightlyPrice +
            (serviceFeePercentage * baseNightlyPrice) / 100 +
            (mexicanVatPercentage * baseNightlyPrice) / 100 +
            (accommodationTaxPercentage * baseNightlyPrice) / 100;

          // Calculate Ondalinda fee
          ondalindaTaxFees = baseNightlyPrice * (ondalindaFeePercentage / 100);
          let AvailabilityStatus = getStatusName(housingDetails.Status);

          if (housingDetails.Status == 2) {
            return (
              <div
                className="d-flex flex-column"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  padding: "8px 0px",
                  minWidth: "200px",
                }}
              >
                <strong>
                  <span style={{ whiteSpace: "normal", color: "#047a67" }}>
                    <ul className="d-flex prices-view ">
                      <li>{` Base Price: `}</li>
                      <li>{formatSmartPrice(baseNightlyPrice)}</li>
                    </ul>
                  </span>
                </strong>

                <span style={{ whiteSpace: "normal" }}>
                  <ul className="d-flex prices-view ">
                    <li>{`Service Fee: `}</li>
                    <li>
                      {serviceFeePercentage.toFixed(1)}% (
                      {formatSmartPrice(
                        (serviceFeePercentage * baseNightlyPrice) / 100
                      )}
                      )
                    </li>
                  </ul>
                </span>

                <span style={{ whiteSpace: "normal" }}>
                  <ul className="d-flex prices-view ">
                    <li>{`Mexican VAT: `}</li>
                    <li>
                      {mexicanVatPercentage.toFixed(1)}% (
                      {formatSmartPrice(
                        (mexicanVatPercentage * baseNightlyPrice) / 100
                      )}
                      )
                    </li>
                  </ul>
                </span>

                <span style={{ whiteSpace: "normal" }}>
                  <ul className="d-flex prices-view ">
                    <li>{`Accommodation Tax: `}</li>
                    <li>
                      {accommodationTaxPercentage.toFixed(1)}% (
                      {formatSmartPrice((accommodationTaxPercentage * baseNightlyPrice) / 100)}
                      )
                    </li>
                  </ul>
                </span>

                <span style={{ whiteSpace: "normal" }}>
                  <ul className="d-flex prices-view ">
                    <li>{`Ondalinda Fee: `}</li>
                    <li>
                      {ondalindaFeePercentage.toFixed(1)}% (
                      {formatSmartPrice(ondalindaTaxFees)})
                    </li>
                  </ul>
                </span>

                <span style={{ whiteSpace: "normal" }}>
                  <ul className="d-flex prices-view ">
                    <li>{`Stripe Fee: `}</li>
                    <li>
                      {stripeFee.toFixed(2)}% (
                      {formatSmartPrice(ticketStripe_fee_Amount)})
                    </li>
                  </ul>
                </span>

                <div className="divider-line"></div>

                <strong>
                  <span style={{ whiteSpace: "normal", color: "#047a67" }}>
                    <ul className="d-flex prices-view ">
                      <li>{`Total guest: `}</li>
                      <li>{formatSmartPrice(housingDetails.NightlyPrice)}</li>
                    </ul>
                  </span>
                </strong>

                <strong>
                  <span style={{ whiteSpace: "normal", color: "#047a67" }}>
                    <ul className="d-flex prices-view ">
                      <li>{`Total payout home owner: `}</li>
                      <li>{formatSmartPrice(housingDetails.OwnerAmount)}</li>
                    </ul>
                  </span>
                </strong>
                {/* <strong>{" "}<span>{`Final Price: ${formatSmartPrice(finalPrice)}`}</span></strong> */}
              </div>
            );
          } else {
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 0px",
                }}
              >
                {/* {AvailabilityStatus} */}
                N/A
              </div>
            );
          }
        } else {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>N/A</div>
          );
        }
      },
      minWidth: "235px", // Adjust width as needed
      sortable: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        color: "#000",
      },
    },
  };

  const tableDatas = {
    columns,
    data,
  };

  // Define a function to show notes in a SweetAlert modal
  const showNotesAlert = (notes) => {
    Swal.fire({
      icon: "info",
      title: "Event Notes",
      text: notes,
      confirmButtonText: "OK",
    });
  };

  return (
    <>
      <Seo title={"Manage Properties"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Manage Properties Manager
          </span>
        </div>
        <div className="justify-content-between d-flex mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Manage Properties
            </Breadcrumb.Item>
          </Breadcrumb>
          <Link
            href={"#"}
            className="filtr-icon"
            variant=""
            onClick={() => setBasic(true)}
          >
            {" "}
            <i className="bi bi-search "></i>
          </Link>
        </div>
      </div>

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card className="member-fltr-hid">
              <Card.Body className="p-2">
                <CForm
                  className="row g-3 needs-validation"
                  onSubmit={handleSearch}
                >
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Availability
                    </CFormLabel>
                    <div className="AddHsingBd1Inr">
                      <select
                        name="id"
                        className="form-control"
                        value={status}
                        onChange={(e) => {
                          setStatus(e.target.value);
                        }}
                      >
                        <option value="">-Select-</option>
                        <option value="2">Available to Rent</option>
                        <option value="3">
                          Not available to rent / homeowner is coming to event
                        </option>
                        <option value="1">
                          Not available to rent / homeowner does not want to
                          rent
                        </option>
                        <option value="5">Info Not Updated</option>
                        <option value="7">Booked for Staff</option>
                        <option value="Y">Booked by member</option>
                      </select>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Status
                    </CFormLabel>
                    <div className="AddHsingBd1Inr">
                      <select
                        name="id"
                        className="form-control"
                        value={paymentStatus}
                        onChange={(e) => {
                          setPaymentStatus(e.target.value);
                        }}
                      >
                        <option value="">-Select-</option>
                        <option value="partial">Partial</option>
                        <option value="full">Full</option>
                      </select>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Location
                    </CFormLabel>
                    <div className="AddHsingBd1Inr">
                      <select
                        name="id"
                        className="form-control"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                        }}
                      >
                        <option value="">-Select-</option>
                        <option value="Off-site">Off-site</option>
                        <option value="On-site">On-site</option>
                      </select>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Number of bedrooms
                    </CFormLabel>
                    <div className="AddHsingBd1Inr">
                      <select
                        name="id"
                        className="form-control"
                        value={numBedrooms}
                        onChange={(e) => {
                          setNumBedrooms(e.target.value);
                        }}
                      >
                        <option value="">-Select-</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">Name</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => {
                        const trimmedName = e.target.value.trim();
                        setName(trimmedName);
                      }}
                    />
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Neighborhood
                    </CFormLabel>
                    <div className="AddHsingBd1Inr">
                      <select
                        name="id"
                        className="form-control"
                        value={neighborhood}
                        onChange={(e) => {
                          setNeighborhood(e.target.value);
                        }}
                      >
                        <option value="">-Select-</option>
                        {neighborhoods.map((value, index) => (
                          <option
                            style={{ textTransform: "none" }}
                            key={index}
                            value={value.id}
                          >
                            {value.name}
                          </option>
                        ))}
                      </select>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">Type</CFormLabel>
                    <div className="AddHsingBd1Inr">
                      <select
                        name="id"
                        className="form-control"
                        value={type}
                        onChange={(e) => {
                          setType(e.target.value);
                        }}
                      >
                        <option value="">-Select-</option>
                        {housingTypes.map((value, index) => (
                          <option
                            style={{ textTransform: "none" }}
                            key={index}
                            value={value.id}
                          >
                            {value.name}
                          </option>
                        ))}
                      </select>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </CCol>

                  <CCol md={12} className="d-flex  ">
                    <CButton
                      color="primary"
                      type="submit"
                      className="me-2 w-50"
                      id="submitBtn"
                    >
                      Submit
                    </CButton>

                    <CButton
                      color="secondary"
                      type="reset"
                      onClick={HandleResetData}
                      className="w-50"
                    >
                      Reset
                    </CButton>
                  </CCol>
                </CForm>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={10} className="housing-table">
            <Card>
              {/* <Card.Header className=" ">
                                <div className="d-flex justify-content-between">
                                    <h4></h4>
                                    <Link className="btn ripple btn-info btn-sm" href="/admin/careyeshousing/add">Add Housing</Link>
                                </div>
                            </Card.Header> */}

              <Card.Body className="">
                <DataTableExtensions
                  style={{ padding: "0.7rem 0rem" }}
                  {...tableDatas}
                >
                  <DataTable
                    columns={columns}
                    data={data}
                    // actions={actionsMemo}
                    // contextActions={contextActions}
                    // onSelectedRowsChange={handleRowSelected}
                    // clearSelectedRows={toggleCleared}
                    // selectableRows
                    customStyles={customStyles}
                    pagination
                  />
                </DataTableExtensions>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        show={isOpen}
        size="xl"
        centered
        className="housing-availbty-edit"
      >
        <Modal.Header>
          <Modal.Title>Edit Event Housing Availability</Modal.Title>
          <Button
            variant=""
            className="btn btn-close"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <i className="bi bi-x"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          {/* Show date error */}
          {dateError && (
            <div className="alert alert-warning" role="alert">
              {dateError}
            </div>
          )}

          {/* Show form error */}
          {formError && (
            <div className="alert alert-danger" role="alert">
              {formError}
            </div>
          )}

          <CForm
            ref={formRef}
            className="needs-validation"
            noValidate
            onSubmit={handleSubmit}
          >
            <Row className="gy-3">
              <input
                type="hidden"
                name="HousingID"
                value={selectedOpenHousing.id}
              />
              <input type="hidden" name="EventID" value={eventId} />
              <Col md={6} className="d-flex">
                <Form.Label className="m-0">Event :</Form.Label>
                <span className="evt-nm ms-2">
                  {eventDetails ? eventDetails.Name : "N/A"}
                </span>
              </Col>

              <Col md={6} className="d-flex">
                <Form.Label className="m-0">Housing :</Form.Label>
                <span className="evt-nm ms-2">
                  {selectedOpenHousing.HousingNeighborhood
                    ? selectedOpenHousing.HousingNeighborhood.name
                    : "N/A"}
                  ,{selectedOpenHousing.Name}
                </span>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formName">
                  <Form.Label>Availability</Form.Label>
                  <select
                    id="availability"
                    name="availability"
                    className="form-select hsing-swp-select"
                    value={
                      housingDetailsSelected?.isBooked == "Y"
                        ? "6"
                        : availabilityStatus ?? "5"
                    }
                    onChange={(e) =>
                      setAvailabilityStatus(parseInt(e.target.value))
                    }
                    disabled={isBookedByMember} // Optional: disable when booked
                  >
                    <option value="2">Available to rent</option>
                    <option value="3">Not available to rent / homeowner is coming to event</option>
                    <option value="1">Not available to rent / homeowner does not want to rent</option>
                    <option value="5">Info Not Updated</option>
                    <option value="7">Booked for staff</option>
                    <option value="6">Booked by member</option>
                  </select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formAvailabilityStart">
                  <Form.Label>Available from</Form.Label>
                  <Form.Control
                    type="date"
                    name="availabilityStartDate"
                    value={availabilityStartDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAvailabilityStartDate(value);
                      if (
                        availabilityEndDate &&
                        value > availabilityEndDate
                      ) {
                        setAvailabilityEndDate("");
                      }
                      setDateError("");
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formAvailabilityEnd">
                  <Form.Label>Available to</Form.Label>
                  <Form.Control
                    type="date"
                    name="availabilityEndDate"
                    value={availabilityEndDate}
                    min={availabilityStartDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAvailabilityEndDate(value);
                      setDateError("");
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                {/* <Form.Group controlId="formBasePrice">
                    <Form.Label>Base nightly price($)</Form.Label>
                    <Form.Control
                      type="text"
                      name="basePrice"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                    />
                  </Form.Group> */}

                <Form.Group controlId="formBasePrice">
                  <Form.Label>Base nightly price ($)</Form.Label>
                  <Form.Control
                    type="text"
                    name="basePrice"
                    value={displayPrice}
                    onChange={handlePriceChange}
                    readOnly={isBookedByMember} 
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="formServiceFee">
                  <Form.Label>Service fee(%)</Form.Label>
                  <InputGroup className="percnt-inpt-grp">
                    <Form.Control
                      name="serviceFeePercentage"
                      value={serviceFee}
                      onChange={(e) => setServiceFee(e.target.value)}
                      readOnly={isBookedByMember}
                    />
                    <input
                      type="hidden"
                      name="serviceFeeAmount"
                      value={totals.serviceFeeAmt}
                    />
                    <InputGroup.Text>
                      {formatSmartPrice(totals.serviceFeeAmt)}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="formVAT">
                  <Form.Label>Mexican VAT(%)</Form.Label>
                  <InputGroup className="percnt-inpt-grp">
                    <Form.Control
                      name="MexicanVatPercentage"
                      value={vat}
                      onChange={(e) => setVat(e.target.value)}
                      readOnly={isBookedByMember}
                    />
                    <input
                      type="hidden"
                      name="MexicanVatAmount"
                      value={totals.vatAmt}
                    />
                    <InputGroup.Text>
                      {formatSmartPrice(totals.vatAmt)}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="formAccommodationTax">
                  <Form.Label>Accommodation Tax(%)</Form.Label>
                  <InputGroup className="percnt-inpt-grp">
                    <Form.Control
                      name="accommodationTaxPercentage"
                      value={accommodationTax}
                      onChange={(e) => setAccommodationTax(e.target.value)}
                      readOnly={isBookedByMember}
                    />
                    <input
                      type="hidden"
                      name="accommodationTaxAmount"
                      value={totals.accommodationTaxAmt}
                    />
                    <InputGroup.Text>
                      ${totals.accommodationTaxAmt.toFixed(2)}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="formOndalindaFee">
                  <Form.Label>Ondalinda Fee</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>{ondalindaFee}%</InputGroup.Text>

                    <Form.Control
                      className="readonly-inpt"
                      name="ondalindaFeeAmount"
                      readOnly
                      value={`${formatSmartPrice(totals.ondalindaFeeAmt)}`}
                    />
                    <input
                      type="hidden"
                      name="OndalindaFeePercentage"
                      value={ondalindaFee}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="formStripeFee">
                  <Form.Label>Stripe Fee</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      {ticket_stripe_fee_percentage}%
                    </InputGroup.Text>
                    <Form.Control
                      className="readonly-inpt"
                      name="stripeFeeAmount"
                      readOnly
                      value={`${formatSmartPrice(
                        totals.ticketStripe_fee_Amount
                      )}`}
                    />
                    <input
                      type="hidden"
                      name="StripeFeePercentage"
                      value={ticket_stripe_fee_percentage}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="formStripeFee">
                  <Form.Label>Bank Fee</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      {ticket_bank_fee_percentage}%
                    </InputGroup.Text>
                    <Form.Control
                      className="readonly-inpt"
                      name="bankFeeAmount"
                      readOnly
                      value={`${formatSmartPrice(
                        totals.ticketBank_fee_Amount
                      )}`}
                    />
                    <input
                      type="hidden"
                      name="BankFeePercentage"
                      value={ticket_bank_fee_percentage}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="formStripeFee">
                  <Form.Label>Processing Fee</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      {ticket_processing_fee_percentage}%
                    </InputGroup.Text>
                    <Form.Control
                      className="readonly-inpt"
                      name="processingFeeAmount"
                      readOnly
                      value={`${formatSmartPrice(
                        totals.ticketProcessing_fee_Amount
                      )}`}
                    />
                    <input
                      type="hidden"
                      name="ProcessingFeePercentage"
                      value={ticket_processing_fee_percentage}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="formTotalAfterTaxes">
                  <Form.Label>Total After Taxes</Form.Label>
                  <Form.Control
                    className="readonly-inpt"
                    type="text"
                    name="totalAfterTaxes"
                    readOnly
                    value={`${formatSmartPrice(totals.totalAfterTaxes)}`}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formHomeOwnerPayout">
                  <Form.Label>
                    Paid from Ondalinda to House Manager
                  </Form.Label>
                  <Form.Control
                    className="readonly-inpt"
                    type="text"
                    name="totalPayoutHomeOwner"
                    readOnly
                    value={`${formatSmartPrice(totals.totalPayoutHomeOwner)}`}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="formGuestPayout">
                  <Form.Label>
                    Paid by customer on Ondalinda platform
                  </Form.Label>
                  <Form.Control
                    className="readonly-inpt"
                    type="text"
                    name="totalGuestPayout"
                    readOnly
                    value={`${formatSmartPrice(totals.totalGuestPayout)}`}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="formDate">
                  <Form.Label>Internal notes</Form.Label>
                  <textarea
                    id="internalNotes"
                    name="internalNotes"
                    className="form-control"
                    rows="3"
                    placeholder="Internal Notes"
                  >
                    {internalNotes}
                  </textarea>
                </Form.Group>
              </Col>

              {/* <Col md={12}>
                <div className="margin-top-2 pro-det-btn p-3 border rounded bg-light">
                  <h5 className="fw-bold mb-3">💳 Payment Breakdown</h5>

                  <div className="mb-2">
                    <strong>Total After Taxes: </strong>
                    <span className="text-muted">Base nightly price + Service fee + Mexican VAT + Accommodation Tax</span>
                  </div>

                  <div className="mb-2">
                    <strong>Stripe Fee: </strong>
                    <span className="text-muted">Total After Taxes × {ticket_stripe_fee_percentage}%</span>
                  </div>

                  <div className="mb-2">
                    <strong>Total Payable (Customer Pays): </strong>
                    <span className="text-muted">Total After Taxes + Stripe Fee + Bank Fee + Processing Fee</span>
                  </div>
                </div>
              </Col> */}

            </Row>
          </CForm>
        </Modal.Body>
        {/* {housingDetailsSelected?.isBooked !== "Y" && ( */}
        <Modal.Footer>
          <Row>
            <Col
              md={12}
              className="d-flex justify-content-between align-items-end"
            >
              <CButton
                color="primary"
                type="submit"
                className="me-2"
                id="submitBtn"
                onClick={handleSubmit}
              >
                Save
              </CButton>

              <CButton
                color="secondary"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </CButton>
            </Col>
          </Row>
        </Modal.Footer>
        {/* )} */}
      </Modal>

      <Modal show={basic} className="Member-filtr-mdlDgn">
        <Modal.Header>
          <Modal.Title>Search here</Modal.Title>
          <Button
            variant=""
            className="btn btn-close"
            onClick={() => {
              closedModal(false);
            }}
          >
            <i class="bi bi-x"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <CForm className="row g-3 needs-validation" onSubmit={handleSearch}>
            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Availability
              </CFormLabel>
              <div className="AddHsingBd1Inr">
                <select
                  name="id"
                  className="form-control"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                  }}
                >
                  <option value="">-Select-</option>
                  <option value="2">Available to Rent</option>
                  <option value="3">
                    Not available to rent / homeowner is coming to event
                  </option>
                  <option value="1">
                    Not available to rent / homeowner does not want to rent
                  </option>
                  <option value="5">Info Not Updated</option>
                  <option value="7">Booked for Staff</option>
                  <option value="Y">Booked by member</option>
                </select>
                <i className="bi bi-chevron-down"></i>
              </div>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">Status</CFormLabel>
              <div className="AddHsingBd1Inr">
                <select
                  name="id"
                  className="form-control"
                  value={paymentStatus}
                  onChange={(e) => {
                    setPaymentStatus(e.target.value);
                  }}
                >
                  <option value="">-Select-</option>
                  <option value="partial">Partial</option>
                  <option value="full">Full</option>
                </select>
                <i className="bi bi-chevron-down"></i>
              </div>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">Location</CFormLabel>
              <div className="AddHsingBd1Inr">
                <select
                  name="id"
                  className="form-control"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                  }}
                >
                  <option value="">-Select-</option>
                  <option value="Off-site">Off-site</option>
                  <option value="On-site">On-site</option>
                </select>
                <i className="bi bi-chevron-down"></i>
              </div>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Number of bedrooms
              </CFormLabel>
              <div className="AddHsingBd1Inr">
                <select
                  name="id"
                  className="form-control"
                  value={numBedrooms}
                  onChange={(e) => {
                    setNumBedrooms(e.target.value);
                  }}
                >
                  <option value="">-Select-</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
                <i className="bi bi-chevron-down"></i>
              </div>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Name</CFormLabel>
              <CFormInput
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  const trimmedName = e.target.value.trim();
                  setName(trimmedName);
                }}
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Neighborhood
              </CFormLabel>
              <div className="AddHsingBd1Inr">
                <select
                  name="id"
                  className="form-control"
                  value={neighborhood}
                  onChange={(e) => {
                    setNeighborhood(e.target.value);
                  }}
                >
                  <option value="">-Select-</option>
                  {neighborhoods.map((value, index) => (
                    <option
                      style={{ textTransform: "none" }}
                      key={index}
                      value={value.id}
                    >
                      {value.name}
                    </option>
                  ))}
                </select>
                <i className="bi bi-chevron-down"></i>
              </div>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Type</CFormLabel>
              <div className="AddHsingBd1Inr">
                <select
                  name="id"
                  className="form-control"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                  }}
                >
                  <option value="">-Select-</option>
                  {housingTypes.map((value, index) => (
                    <option
                      style={{ textTransform: "none" }}
                      key={index}
                      value={value.id}
                    >
                      {value.name}
                    </option>
                  ))}
                </select>
                <i className="bi bi-chevron-down"></i>
              </div>
            </CCol>

            <CCol md={12} className="d-flex  ">
              <CButton
                color="primary"
                type="submit"
                className="me-2 w-50"
                id="submitBtn"
              >
                Submit
              </CButton>

              <CButton
                color="secondary"
                type="reset"
                onClick={HandleResetData}
                className="w-50"
              >
                Reset
              </CButton>
            </CCol>
          </CForm>
        </Modal.Body>
      </Modal>
    </>
  );
};

const GlobalFilter = ({ filter, setFilter }) => {
  return (
    <span className="d-flex ms-auto">
      <Form.Control
        value={filter || ""}
        onChange={(e) => setFilter(e.target.value)}
        className="form-control mb-4"
        placeholder="Search..."
      />
    </span>
  );
};

HousingAvailability.layout = "Contentlayout";
export default HousingAvailability;
