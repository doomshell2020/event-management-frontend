import React, { useEffect, useState, useRef } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import {
  Button,
  Form,
  Modal,
  Card,
  Row,
  Col,
  Breadcrumb,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import { useRouter } from "next/router";
import Moment from "react-moment";
import ClipLoader from "react-spinners/ClipLoader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "moment-timezone"; // This adds the .tz() method to moment
import ExtendBookingModal from "../ExtendBookingModal";

const Orders = () => {
  const router = useRouter();
  const { eventName } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [basic, setBasic] = useState(false);
  const [DataTable, setDataTable] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [fromDateModified, setFromDateModified] = useState(false);
  const submitButtonRef = useRef();

  const [searchFormData, setSearchFormData] = useState({
    keyword: null,
    name:  null,
    lname: null,
    email: null,
    orderId: null,
    mobile: null,
    eventName: null,
    startDate: null,
    endDate: null,
    paymentOption: null,
    key: "search_order",
  });
  //   const eventName = event ? decodeURIComponent(event.toString()) : null;
  const decodedEventName = eventName ? decodeURIComponent(eventName.toString()) : null;
  const [showExtendBookingModal, setShowExtendBookingModal] = useState(false);
  const [extendBookingRow, setExtendBookingRow] = useState(null);
  const handleExtendBooking = (row, email, firstName, fullPropertyName) => {
    const mergedRow = {
      ...row,
      email,
      firstName,
      fullPropertyName,
    };
    setExtendBookingRow(mergedRow);
    setShowExtendBookingModal(true);
  };

  useEffect(() => {
    if (decodedEventName) {
      setSearchFormData((prevFormData) => ({
        ...prevFormData,
        eventName: decodedEventName,
      }));
    }
  }, [decodedEventName]);

  const handleFromDateChange = (date) => {
    const originalDate = new Date(date);
    // Convert to 'YYYY-MM-DD' format
    const formattedDate = `${originalDate.getFullYear()}-${String(
      originalDate.getMonth() + 1
    ).padStart(2, "0")}-${String(originalDate.getDate()).padStart(2, "0")}`; // '2024-10-06'

    setSearchFormData((prevFormData) => ({
      ...prevFormData,
      startDate: formattedDate,
    }));

    setStartDate(date);
    setEndDate(null);
    setFromDateModified(true);
  };

  const handleToDateChange = (date) => {
    const originalDate = new Date(date);
    // Convert to 'YYYY-MM-DD' format
    const formattedDate = `${originalDate.getFullYear()}-${String(
      originalDate.getMonth() + 1
    ).padStart(2, "0")}-${String(originalDate.getDate()).padStart(2, "0")}`; // '2024-10-06'

    setSearchFormData((prevFormData) => ({
      ...prevFormData,
      endDate: formattedDate,
    }));
    setEndDate(date);
  };

 useEffect(() => {
  if (router.isReady && Object.keys(router.query).length > 0) {
    setSearchFormData((prev) => ({
      ...prev,
      keyword: router.query.keyword || null,
      name: router.query.name || null,
      lname: router.query.lname || null,
      email: router.query.email || null,
      orderId: router.query.orderId || null,
      mobile: router.query.mobile || null,
      eventName: router.query.eventName ? decodeURIComponent(router.query.eventName) : null,
      startDate: router.query.startDate || null,
      endDate: router.query.endDate || null,
      paymentOption: router.query.paymentOption || null,
    }));
  }
}, [router.isReady, router.query]);


  // Resend order  email
  const ResendEmail = async (orderId) => {
    const confirmationResult = await Swal.fire({
      title: "Are you sure you want to Send Order Email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes,Send!",
      cancelButtonText: "No,Cancel",
    });
    if (confirmationResult.isConfirmed) {
      // Show Swal Loader
      Swal.fire({
        title: "Processing your request...",
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
          popup: "add-tckt-dtlpop",
        },
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const EmailUrl = "/api/v1/create-order";
      const body = {
        // orderId: orderId,
        orderId: [orderId], // after select All ticket send kamal
        key: "resend_order",
      };
      await axios
        .post(EmailUrl, body)
        .then((res) => {
          const msg = res.data.message;
          Swal.fire({
            title: "Done!",
            text: msg,
            icon: "success",
            customClass: {
              popup: "add-tckt-dtlpop",
            },
          });
        })
        .catch((err) => {
          setIsLoading(false);
          Swal.fire({
            title: "Done!",
            text: err.message,
            icon: "success",
            customClass: {
              popup: "add-tckt-dtlpop",
            },
          });
        });
    }
  };

  // Resend ticket send email priticular user
  const ResendTicketEmail = async (orderId) => {
    const confirmationResult = await Swal.fire({
      title: "Are you sure you want to Send Ticket Email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes,Send!",
      cancelButtonText: "No,Cancel",
      customClass: {
        popup: "add-tckt-dtlpop",
      },
    });
    if (confirmationResult.isConfirmed) {
      // Show Swal Loader
      Swal.fire({
        title: "Processing your request...",
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
          popup: "add-tckt-dtlpop",
        },
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // const EmailUrl = "/api/v1/create-order";
      const EmailUrl = "/api/v1/resend-orders";
      const body = {
        orderId: [orderId],
        key: "resend_tickets",
      };
      await axios
        .post(EmailUrl, body)
        .then((res) => {
          const msg = res.data.message;
          Swal.fire({
            title: "Done!",
            text: msg,
            icon: "success",
            customClass: {
              popup: "add-tckt-dtlpop",
            },
          });
          submitButtonRef.current.click();
        })
        .catch((err) => {
          setIsLoading(false);
          Swal.fire({
            title: "Done!",
            text: err.message,
            icon: "success",
            customClass: {
              popup: "add-tckt-dtlpop",
            },
          });
        });
    }
  };


  let cancelId;
  if (typeof window !== "undefined") {
    cancelId = localStorage.getItem("UserID_");
  }


  const getPaymentLabel = (option) => {
    switch (option) {
      case "full":
        return "Full Payment";
      case "partial":
        return "Partial Payment";
      case "installment":
        return "Installment Plan";
      default:
        return option?.toString().charAt(0).toUpperCase() + option?.slice(1); // Fallback label
    }
  };

  const [selectedRows, setSelectedRows] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [checkedButton, setCheckedButton] = useState(false);

  const toggleAllRowsSelected = () => {
    setCheckedButton(true);
    const allRowIds = page.map((row) => row.original.id);
    // Check if all eligible rows are selected
    if (allRowIds.length > 0 && selectedRows.length === allRowIds.length) {
      setSelectedRows([]); // Deselect all if all are currently selected
    } else {
      setSelectedRows(allRowIds); // Select all eligible rows
    }
  };

  const toggleRowSelected = (rowId) => {
    setCheckedButton(true);
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const isSelected = (rowId) => {
    return selectedRows.includes(rowId);
  };

  // Send Remaining Amount Email function multiple emails
  const SendRemainingAmountEmail = async () => {
    try {
      const totalMembers = selectedRows.length;
      const confirmationResult = await Swal.fire({
        title: `Are you sure you want to send the remaining amount email to ${totalMembers} members  ?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Send Email",
        cancelButtonText: "No, Cancel",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });
      const orderIDsArray = [
        ...new Set(
          DataTable.filter(
            (item) =>
              item.paymentOption !== "full" &&
              selectedRows.includes(item.orderid)
          ).map((item) => item.orderid)
        ),
      ];
      if (!confirmationResult.isConfirmed) return;
      // Show loader
      Swal.fire({
        title: "Sending remaining amount email...",
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
          popup: "add-tckt-dtlpop",
        },
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Send email
      const body = {
        key: "remaining_amount_email",
        orderId: orderIDsArray,
      };
      // Send approval request
      const response = await axios.post("/api/v1/orders", body);
      // Show success alert
      Swal.fire({
        title: "Success!",
        text:
          response.data.message || "Remaining amount email sent successfully.",
        icon: "success",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });
      setSelectedRows([]);
    } catch (err) {
      setIsLoading(false);
      Swal.fire({
        title: "Error",
        text: err.message || "Something went wrong while sending the email.",
        icon: "error",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });
    }
  };

  // Send Remaining Amount Email function priticular user
  const RemainingAmountEmail = async (orderid) => {
    const confirmationResult = await Swal.fire({
      title: "Are you sure you want to send the remaining amount email ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes,Send!",
      cancelButtonText: "No,Cancel",
    });
    if (confirmationResult.isConfirmed) {
      // Show Swal Loader
      Swal.fire({
        title: "Processing your request...",
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
          popup: "add-tckt-dtlpop",
        },
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const ApiUrl = "/api/v1/orders";
      const body = {
        key: "remaining_amount_email",
        orderId: [orderid],
      };
      await axios
        .post(ApiUrl, body)
        .then((res) => {
          const msg = res.data.message;
          Swal.fire({
            title: "Done!",
            text: msg,
            icon: "success",
            customClass: {
              popup: "add-tckt-dtlpop",
            },
          });
        })
        .catch((err) => {
          setIsLoading(false);
          Swal.fire({
            title: "Done!",
            text: err.message,
            icon: "success",
            customClass: {
              popup: "add-tckt-dtlpop",
            },
          });
        });
    }
  };

  const format = (val) =>
    new Intl.NumberFormat("en-IN").format(Math.round(Number(val) || 0));

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      // accessor: (_row, index) => index + 1,
      accessor: "serialNum",
      className: "wd-5p borderrigth",
    },
    {
      Header: "Order Information",
      accessor: "actualamount",
      className: "wd-33p borderright",
      Cell: ({ row }) => {
        const {
          OriginalTrxnIdentifier = "",
          is_free = false,
          couponCode = "",
          actualamount = 0,
          discountAmount = 0,
          total_amount = 0,
          total_due_amount = 0,
          adminfee = 0,
          paymentOption = "full",
          RRN = "",
          totalCartAmount = 0,
          Event = {},
          BookAccommodationInfo = {},
          AccommodationExtensions = [],
        } = row.original || {};

        const user = row.original?.User || {};
        const isExtendedOrder =
          !BookAccommodationInfo && AccommodationExtensions.length > 0;
        const { Housing } = BookAccommodationInfo || {};
        const propertyName = Housing?.Name || "";
        const neighborhoodName = Housing?.HousingNeighborhood?.name || "";
        const fullPropertyName =
          propertyName && neighborhoodName
            ? `${propertyName} in ${neighborhoodName}`
            : propertyName || neighborhoodName || "";

        const EventHousings = Housing?.EventHousings || [];
        const isExtensionRequestBlocked =
          EventHousings[0]?.isDateExtensionRequestedSent == "B";
        // console.log('>>>>>>>>', isExtensionRequestBlocked);

        const currencySign = Event?.Currency?.Currency_symbol || "";

        const format = (val) =>
          new Intl.NumberFormat("en-IN").format(Math.round(Number(val) || 0));

        return (
          <div
            className="d-flex flex-column gap-1"
            style={{ fontSize: "13px" }}
          >
            {/* Order ID with Free Ticket */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-1">
              <b className="mb-0">
                {isExtendedOrder ? (
                  <span>
                    # {OriginalTrxnIdentifier}
                    {is_free && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#28a745",
                          color: "#fff",
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Free Ticket
                      </span>
                    )}
                  </span>
                ) : (
                  <Link
                    className="d-flex align-items-center flex-wrap"
                    title="View Order Details"
                    target="_blank"
                    href={`/admin/orders/${OriginalTrxnIdentifier}`}
                    style={{
                      textDecoration: "none",
                      color: "rgb(4, 122, 103)",
                    }}
                  >
                    # {OriginalTrxnIdentifier}
                    {is_free && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#28a745",
                          color: "#fff",
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Free Ticket
                      </span>
                    )}
                  </Link>
                )}
              </b>
              {/* btn */}
              <div className="d-flex align-items-center gap-2 margin-top-2 order-info table-btn-view">
                {/* {row.original.paymentOption == "partial" && (
              <a
                style={{ color: "red"  }}
                className=" d-flex justify-content-center"
                onClick={() => {
                  RemainingAmountEmail(row.original.orderid);
                }}
              >
          <i className="bi bi-cash-stack"></i>
              </a>
            )} */}
              </div>

              {BookAccommodationInfo && !isExtensionRequestBlocked && (
                <button
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  title="Extend Accommodation Dates"
                  style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontWeight: "500",
                  }}
                  onClick={() => handleExtendBooking(BookAccommodationInfo, user.Email, user.FirstName, fullPropertyName)}
                >
                  <i className="fa fa-calendar" aria-hidden="true"></i> Extend Stay
                </button>
              )}
            </div>

            {/* Stripe Key */}
            {RRN && (
              <div>
                <strong>Stripe Key:</strong> {RRN}
              </div>
            )}

            {/* Coupon details */}
            {couponCode && (
              <>
                <div>
                  <strong>Actual Amount:</strong> {currencySign}{" "}
                  {format(actualamount)}
                </div>
                <div>
                  <strong>Coupon Code:</strong> {couponCode}
                </div>
                <div>
                  <strong>Discount Applied:</strong> {currencySign}{" "}
                  {format(discountAmount)}
                </div>
              </>
            )}

            {/* Total with Tax */}
            <div>
              {/* <strong>Total Amount ({adminfee || 0}%):</strong> {currencySign}{" "} */}
              <strong>Total Amount:</strong> {currencySign}{" "}
              {paymentOption === "partial"
                ? format(totalCartAmount)
                : format(total_amount)}
            </div>

            {/* Partial Payment Info */}
            {paymentOption !== "full" && (
              <>
                <div>
                  <strong>Partially Paid:</strong> {currencySign}{" "}
                  {format(total_amount)}
                </div>
                <div>
                  <strong>Total Due:</strong> {currencySign}{" "}
                  {format(total_due_amount)}
                </div>
              </>
            )}

            {/* Payment Option */}
            <div>
              <strong>Payment Option:</strong> {getPaymentLabel(paymentOption)}
            </div>
          </div>
        );
      },
    },
    {
      Header: "User Info",
      className: "wd-25p borderrigth",
      Cell: ({ row }) => {
        const user = row.original?.User || {};
        const fullName = `${user.FirstName || ""} ${user.LastName || ""
          }`.trim();

        return (
          <div
            className="orders-info"
            style={{ fontSize: "13px", lineHeight: "1.5" }}
          >
            <div>{fullName || "-"}</div>
            <div>{user.Email || "-"}</div>
            <div>{user.PhoneNumber || "-"}</div>
          </div>
        );
      },
    },
    {
      Header: "Accommodation Info",
      accessor: "accommodation",
      className: "wd-12p borderright",
      Cell: ({ row }) => {
        const {
          BookAccommodationInfo,
          AccommodationExtensions = [],
          accommodationOndalindaPerDaysFeeAmount = 0,
          accommodationPerDaysPropertyOwnerAmount = 0,
          total_night_stay = 0,
          paymentOption = "full",
          OriginalTrxnIdentifier = ""
        } = row.original || {};

        const isExtendedOrder =
          !BookAccommodationInfo && AccommodationExtensions.length > 0;
        const accommodationData =
          BookAccommodationInfo || AccommodationExtensions[0] || {};
        const {
          check_in_date,
          check_out_date,
          Housing = {},
        } = accommodationData;

        const neighborhood = Housing?.HousingNeighborhood?.name || "NA";
        const isPartial = paymentOption === "partial";

        const fullHomeownerPayout =
          accommodationPerDaysPropertyOwnerAmount * total_night_stay;
        const fullOndalindaPayout =
          accommodationOndalindaPerDaysFeeAmount * total_night_stay;

        const HomeownerPayout = isPartial
          ? fullHomeownerPayout / 2
          : fullHomeownerPayout;
        const OndalindaPayout = isPartial
          ? fullOndalindaPayout / 2
          : fullOndalindaPayout;

        if (!Housing?.Name) {
          return <span style={{ color: "#888" }}>NA</span>;
        }

        return (
          <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
            {isExtendedOrder && (
              <div>
                <strong style={{ color: "green" }}>Extended Stay</strong>
              </div>
            )}
            <div>
              <Link
                className="d-flex align-items-center flex-wrap"
                title="View Property Details"
                target="_blank"
                href={`/housing/${Housing.Name ? Housing.Name.replace(/ /g, "+") : ""}`}
                style={{ textDecoration: "none", color: "rgb(4, 122, 103) ", fontWeight: "600" }}
              >
                {Housing.Name}, {neighborhood}
              </Link>
              {/* <Link
                    className="d-flex align-items-center flex-wrap"
                    title="View Order Details"
                    target="_blank"
                    href={`/admin/orders/${OriginalTrxnIdentifier}`}
                    style={{ textDecoration: "none", color: "rgb(4, 122, 103)" }}
                  >
                  </Link> */}
            </div>
            <div>
              <strong>Bedrooms:</strong> {Housing.NumBedrooms || "-"}
            </div>
            <div>
              <strong>Occupancy:</strong> {Housing.MaxOccupancy || "-"}
            </div>
            <div>
              <strong>Nights:</strong> {total_night_stay}
            </div>
            <div>
              <strong>Check In:</strong>{" "}
              <Moment format="DD-MMM-YYYY" utc>
                {check_in_date}
              </Moment>
            </div>
            <div>
              <strong>Check Out:</strong>{" "}
              <Moment format="DD-MMM-YYYY" utc>
                {check_out_date}
              </Moment>
            </div>
            <div>
              <strong>Homeowner Payout:</strong> {format(HomeownerPayout)}
            </div>
            <div>
              <strong>Ondalinda Fee:</strong> {format(OndalindaPayout)}
            </div>
          </div>
        );
      },
    },
    {
      Header: "Tickets",
      accessor: "tickets",
      className: "wd-12p borderright",
      Cell: ({ row }) => {
        const { TicketBooks = [], AddonBooks = [] } = row.original;

        const ticketCount = TicketBooks.length;
        const addonCount = AddonBooks.length;

        if (ticketCount === 0 && addonCount === 0) {
          return <span style={{ color: "#888" }}>NA</span>;
        }

        return (
          <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
            <div>
              <strong>Tickets:</strong> {ticketCount}
            </div>
            <div>
              <strong>Addons:</strong> {addonCount}
            </div>
          </div>
        );
      },
    },
    {
      Header: "Order Date",
      // accessor: "StartDates",
      accessor: (row) => {
        // return a plain string for searching
        return row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : "";
      },
      id: "orderDate", // unique id

      className: "wd-13p borderrigth",
      Cell: ({ row }) => (
        <div style={{ fontSize: "13px" }}>

          <Moment format="DD-MMM-YYYY" utc>{row.original.createdAt}</Moment>
        </div>
      ),
    },

    // Resend Button
    {
      Header: "Action",
      accessor: "SendEmail",
      className: "wd-10p borderright",
      Cell: ({ row }) => {
        return row.original.order_context == 'regular' && (
          <div className="d-flex flex-column align-items-start">

            {row.original.ticket_cancel_id == null && (
              <>
                {/* <button
                  style={{ width: "100px" }}
                  className="btn btn-sm btn-success mb-2 d-flex justify-content-center"
                  onClick={() => ResendEmail(row.original.orderid)}
                >
                  Send
                </button> */}
                <Button
                  variant="primary"
                  className="btn-sm d-flex align-items-center"
                  onClick={() => ResendTicketEmail(row.original.id)}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Resend Tickets
                </Button>

              </>
            )}

            {/* {row.original.paymentOption == "partial" && (
              <button
                style={{ width: "100px" }}
                className="btn btn-sm btn-secondary mb-2 d-flex justify-content-center"
                onClick={() => {
                  RemainingAmountEmail(row.original.orderid);
                }}
              >
                Remaining Amount
              </button>
            )}  */}
          </div>
        )
      }
    },

    {
      Header: () => <span style={{ display: "none" }}></span>, // hide header inline
      accessor: (row) => {
        // ---- calculate the same way as in your Accommodation Info cell ----
        const {
          accommodationOndalindaPerDaysFeeAmount = 0,
          accommodationPerDaysPropertyOwnerAmount = 0,
          total_night_stay = 0,
          paymentOption = "full",
        } = row;

        const isPartial = paymentOption === "partial";

        const fullHomeownerPayout =
          accommodationPerDaysPropertyOwnerAmount * total_night_stay;
        const fullOndalindaPayout =
          accommodationOndalindaPerDaysFeeAmount * total_night_stay;

        const HomeownerPayout = isPartial
          ? fullHomeownerPayout / 2
          : fullHomeownerPayout;
        const OndalindaPayout = isPartial
          ? fullOndalindaPayout / 2
          : fullOndalindaPayout;

        // ---- build combined search string ----
        return `
      ${row.OriginalTrxnIdentifier || ""}
      ${row.RRN || ""}
      ${row.createdAt || ""}
      ${row.paymentOption || ""}
      ${row.total_amount || ""}
      ${row.totalCartAmount || ""}
      ${row.total_due_amount || ""}
      ${row.User?.FirstName || ""}
      ${row.User?.LastName || ""}
      ${row.User?.Email || ""}
      ${row.User?.PhoneNumber || ""}
      ${row.BookAccommodationInfo?.Housing?.Name || ""}
      ${row.BookAccommodationInfo?.Housing?.HousingNeighborhood?.name || ""}
      ${HomeownerPayout}
      ${OndalindaPayout}
    `;
      },
      id: "searchData",
      Cell: () => <span style={{ display: "none" }}></span>, // hide cells inline
      disableSortBy: true,
    }





    // {
    //   Header: "", // no visible title
    //   accessor: (row) => {
    //     return `
    //       ${row.OriginalTrxnIdentifier || ""}
    //       ${row.RRN || ""}
    //       ${row.paymentOption || ""}
    //       ${row.total_amount || ""}
    //       ${row.totalCartAmount || ""}
    //       ${row.total_due_amount || ""}
    //       ${row.User?.FirstName || ""}
    //       ${row.User?.LastName || ""}
    //       ${row.User?.Email || ""}
    //       ${row.User?.PhoneNumber || ""}
    //       ${row.BookAccommodationInfo?.Housing?.Name || ""}
    //       ${row.BookAccommodationInfo?.Housing?.HousingNeighborhood?.name || ""}
    //     `;
    //   },
    //   id: "searchData",
    //   Cell: () => (
    //     <span style={{ display: "none" }}></span>
    //   ),
    //   disableSortBy: true,
    //   // Hide header inline
    //   headerStyle: { display: "none" }, // 👈 won't be picked by default react-table
    // }





  ]);

  const [pageSize, setPageSize] = useState(50); // ✅ declare early
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const totalPages = Math.ceil(totalRecords / pageSize);
  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: DataTable,
      manualPagination: true,
      pageCount: Math.ceil(totalRecords / 50), // ✅ no error now
      initialState: { pageIndex: currentPageIndex, pageSize: pageSize },

    },
    useSortBy,
    usePagination
  );

  const {
    getTableProps,
    headerGroups,
    getTableBodyProps,
    prepareRow,
    state,
    setGlobalFilter,
    page,
    pageCount,
  } = tableInstance;


  const gotoPage = (pageNumber) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", pageNumber + 1);
    window.history.pushState({}, "", `?${urlParams.toString()}`);

    setCurrentPageIndex(pageNumber);
    handleViewOrdersV2(urlParams); // pass all search params
  };

  const nextPage = () => {
    if (currentPageIndex + 1 < totalPages) {
      gotoPage(currentPageIndex + 1);
    }
  };

  const previousPage = () => {
    if (currentPageIndex > 0) {
      gotoPage(currentPageIndex - 1);
    }
  };


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get("page"), 10);
    if (!isNaN(pageFromUrl) && pageFromUrl > 0) {
      setCurrentPageIndex(pageFromUrl - 1);
    }
  }, []);





  // New api intigrate ondalinda setup tables data search
  const handleViewOrdersV2 = async (urlParams = new URLSearchParams(window.location.search)) => {
    setIsLoading(true);
    const API_URL = `/api/v2/events/orders`;

    try {
      const response = await axios.get(API_URL, {
        params: {
          eventName: decodedEventName || "",
          paymentOption: urlParams.get("paymentOption") || "",
          email: urlParams.get("email") || "",
          orderId: urlParams.get("orderId") || "",
          name: urlParams.get("name") || "",
          lname: urlParams.get("lname") || "",
          mobile: urlParams.get("mobile") || "",
          keyword: urlParams.get("keyword") || "",
          page: parseInt(urlParams.get("page")) || 1,
          limit: 50,
        },
      });

      setDataTable(response.data.data);
      setTotalRecords(response.data.pagination.totalRecords);
      setCurrentPageIndex((parseInt(urlParams.get("page")) || 1) - 1);
    } catch (error) {
      console.error("There was a problem with your Axios request:", error);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    if (decodedEventName) {
      handleViewOrdersV2();
    }
  }, [decodedEventName]); // runs only when it becomes non-null

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // prevent default form reload
    setIsLoading(true);
    try {
      const API_URL = `/api/v2/events/orders`;
      // Raw query parameters
      const rawParams = {
        keyword: searchFormData.keyword?.trim(),
        orderId: searchFormData.orderId?.trim(),
        eventName: searchFormData.eventName?.trim(),
        name: searchFormData.name?.trim(),
        lname: searchFormData.lname?.trim(),
        email: searchFormData.email?.trim(),
        paymentOption: searchFormData.paymentOption,
        startDate: startDate ? formatDate(startDate) : undefined,
        endDate: endDate ? formatDate(endDate) : undefined,
        page: 1,   // optionally add pagination
      };
      // Filter out empty values
      const params = Object.entries(rawParams).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Optionally update URL query string
      const queryString = new URLSearchParams(params).toString();
      window.history.replaceState(null, '', `?${queryString}`);
      // Send GET request
      const response = await axios.get(API_URL, { params });
      setDataTable(response.data.data);
      setTotalRecords(response.data.pagination?.totalRecords || response.data.data.length);
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };




  const handleFormReset = () => {
    window.history.replaceState({}, "", window.location.pathname);
    const preservedEventName = searchFormData.eventName || "";
    setSearchFormData({
      eventName: preservedEventName,
      orderId: "",
      name: "",
      lname: "",
      email: "",
      mobile: "",
      paymentOption: "",
      type: "",
      keyword: ""
    });

    setStartDate(null);
    setEndDate(null);
    setFromDateModified(false);
    // Call your API again with default filters if needed
    handleViewOrdersV2();
  };
  //Sent members ticket Email
  const callMemberTicketEmailApi = async () => {
    const orderIdCount = selectedRows.length;
    if (selectedRows === 0) return;
    const getConfirmation = async () => {
      return await Swal.fire({
        title: "Warning",
        text: `Are you sure you want to send tickets to ${orderIdCount} ${orderIdCount > 1 ? "member" : "members"
          }?`,
        icon: "question",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
        showCancelButton: true,
        confirmButtonText: "Yes!",
        cancelButtonText: "No, cancel",
      });
    };
    try {
      const confirmationResult = await getConfirmation();
      if (confirmationResult.isConfirmed) {
        // setIsLoading(true);
        // Show Swal Loader
        Swal.fire({
          title: "Processing your request...",
          allowOutsideClick: false,
          showConfirmButton: false,
          customClass: {
            popup: "add-tckt-dtlpop",
          },
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const EmailUrl = "/api/v1/resend-orders";
        const response = await axios.post(EmailUrl, {
          // orderId: order_ids,
          orderId: selectedRows,
          // key: "resend_order",
          key: "resend_tickets",
        });

        const msg = response.data.message;
        if (response.data.success === true) {
          await handleViewOrdersV2();
          Swal.fire({
            title: "Done",
            text: msg,
            icon: "success",
            customClass: {
              popup: "add-tckt-dtlpop",
            },
          });
          setSelectedRows([]);
        } else {
          setIsLoading(false);
          Swal.fire({
            title: "Oops!",
            text: msg,
            icon: "error",
            customClass: {
              popup: "add-tckt-dtlpop",
            },
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      Swal.fire({
        title: "Error",
        text: error.message || "An error occurred. Please try again.",
        icon: "error",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });
      console.error("Error:", error);
    }
  };


  // send filters emails
  const resendFiltersTicket = async () => {
    const confirmationResult = await Swal.fire({
      title: "Are you sure you want to Send Ticket Email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes,Send!",
      cancelButtonText: "No,Cancel",
      customClass: {
        popup: "add-tckt-dtlpop",
      },
    });
    if (!confirmationResult.isConfirmed) return;
    // 👇 Show second popup immediately after confirmation
    Swal.fire({
      title: "Processing your request...",
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        popup: "add-tckt-dtlpop",
      },
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const urlParams = new URLSearchParams(window.location.search);
    const body = {
      key: "resend_tickets_all",
    };
    urlParams.forEach((value, key) => {
      if (value !== "") {
        body[key] = value;
      }
    });

    setSpinner(true);
    const ApiUrl = "/api/v1/resend-orders";
    try {
      const res = await axios.post(ApiUrl, body);
      setSpinner(false);
      Swal.fire({
        title: "Done!",
        text: res.data.message,
        icon: "success",
        customClass: { popup: "add-tckt-dtlpop" },
      }).then((result) => {
        if (result.isConfirmed) {
          submitButtonRef.current.click();
          setIsLoading(false);
        }
      });
    } catch (err) {
      setSpinner(false);
      setIsLoading(false);
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        customClass: { popup: "add-tckt-dtlpop" },
      });
    }
  };

  // Popup functions
  let viewDemoShow = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(true);
        break;
    }
  };

  let viewDemoClose = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(false);
        break;
    }
  };



  return (
    <>
      <Seo title={"Order Manager"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Events Orders
          </span>
        </div>
        <div className="justify-content-between d-flex mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Orders
            </Breadcrumb.Item>
          </Breadcrumb>

          <Link
            href={"#"}
            className="filtr-icon"
            variant=""
            onClick={() => viewDemoShow("Basic")}
          >
            <i className="bi bi-search "></i>
          </Link>
        </div>
      </div>

      <div className="left-content mt-2">
        <ToastContainer />

        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card className="member-fltr-hid">
              <Card.Header>
                <div className="d-flex justify-content-between">
                  <h4 className="card-title mg-b-0">Filters</h4>
                </div>
              </Card.Header>
              <Card.Body className="p-2">
                <Form onSubmit={handleFormSubmit} onReset={handleFormReset}>

                  {/* 🔎 Universal Search Bar */}

                  <Form.Group className="mb-3" controlId="keywordSearch">
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                      type="text"
                      id="keywordSearch"
                      placeholder="Search by name, email or mobile"
                      value={searchFormData.keyword || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          keyword: e.target.value,
                        })
                      }
                    />
                  </Form.Group>









                  <Form.Group className="mb-3" controlId="formOrderId">
                    <Form.Label>Order ID</Form.Label>
                    <Form.Control
                      type="text"
                      id="formOrderId"
                      placeholder="Order ID"
                      value={searchFormData.orderId || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          orderId: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control
                      type="text"
                      id="formName"
                      placeholder="Event Name"
                      value={searchFormData.eventName || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          eventName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>


                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      id="formName"
                      placeholder="First Name"
                      value={searchFormData.name || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      id="formName"
                      placeholder="Last Name"
                      value={searchFormData.lname || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          lname: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      id="formEmail"
                      placeholder="Email"
                      value={searchFormData.email || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          email: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPaymentOption">
                    <Form.Label>Payment Option</Form.Label>
                    <Form.Select

                      value={searchFormData.paymentOption || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          paymentOption: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Payment Option</option>
                      <option value="full">Full Payment</option>
                      <option value="partial">Partial Payment</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group
                    className="mb-3 dt-pkr-wdt"
                    controlId="formDateFrom"
                  >
                    <Form.Label>Date From</Form.Label>
                    <DatePicker
                      selected={startDate}
                      onChange={handleFromDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="form-control"
                      placeholderText="DD-MM-YY"
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-3 dt-pkr-wdt"
                    controlId="formDateTo"
                  >
                    <Form.Label>Date To</Form.Label>
                    <DatePicker
                      selected={endDate}
                      onChange={handleToDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="form-control"
                      plahandleToDateChangeceholderText="DD-MM-YY"
                      minDate={startDate}
                      startDate={startDate}
                      disabled={!fromDateModified}
                    />
                  </Form.Group>

                  <div className="d-flex align-items-end justify-content-between">
                    <Button
                     ref={submitButtonRef}
                      variant="primary "
                      className="me-2 w-50"
                      type="submit"
                    >
                      Submit
                    </Button>
                    <Button variant="secondary" className="w-50" type="reset">
                      Reset
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={10}>
            <div className="Mmbr-card">
              <Card>
                <Card.Header className=" ">
                  <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <h4 className="card-title card-t evnt-mbr mg-b-0">
                      {decodedEventName || "Event Orders"}
                    </h4>
                    <div>
                      {/* <Button
                        variant="contained"
                        color="primary"
                        type="button"
                        className=" mt-2 mb-2 btn-sm"
                        style={{ backgroundColor: "	#008000", color: "white" }}
                        onClick={() => handleDonationOrders()}
                      >
                        Donations
                      </Button> */}

                      {/* {selectedRows.length > 0 && checkedButton && (
                        <Button
                          variant=""
                          className="btn-sm btn-info me-1"
                          type="submit"
                          disabled={spinner}
                          onClick={SendRemainingAmountEmail}
                        >
                          {spinner ? (
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            "Send Remaining Amount Email"
                          )}
                        </Button>
                      )} */}


                      <div className="d-flex gap-2 flex-wrap mt-2 mb-3">
                        {/* Resend Tickets Button */}
                        {/* <Button
                          variant="primary"
                          className="btn-sm d-flex align-items-center"
                          onClick={() => callMemberTicketEmailApi()}
                        >
                          <i className="bi bi-arrow-repeat me-2"></i>
                          Resend Tickets
                        </Button> */}

                        {selectedRows.length > 0 && checkedButton && (
                          <Button
                            variant="primary"
                            className="btn-sm d-flex align-items-center"
                            type="submit"
                            disabled={spinner}
                            onClick={callMemberTicketEmailApi}
                          >
                            <i className="bi bi-arrow-repeat me-2"></i>
                            {spinner ? (
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              "Resend Tickets Selected"
                            )}
                          </Button>
                        )}

                        <Button
                          variant="primary"
                          className="btn-sm d-flex align-items-center"
                          type="submit"
                          disabled={spinner}
                          onClick={resendFiltersTicket}
                        >
                          <i className="bi bi-arrow-repeat me-2"></i>
                          {spinner ? (
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            "Resend Tickets"
                          )}
                        </Button>




                        {/* Download Excel Button */}
                        {/* <Button
                          variant="success"
                          className="btn-sm d-flex align-items-center"
                          onClick={handleDownloadOrdersExcel}
                          disabled={excelLoading}
                        >
                          {excelLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-file-earmark-excel-fill me-2"></i>
                              Download Orders
                            </>
                          )}
                        </Button> */}
                      </div>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="p-2">
                  <div className="evnt-ord-mbl">
                    <table
                      {...getTableProps()}
                      className="table table-bordered table-hover mb-0 responsive-table text-md-nowrap"
                    >
                      <thead>
                        <tr>
                          <th className="wd-3p borderrigth">
                            <input
                              type="checkbox"
                              onChange={toggleAllRowsSelected}
                              checked={
                                page.length > 0 &&
                                page.every(row => selectedRows.includes(row.original.id))
                              }
                            />
                          </th>
                          {headerGroups.map((headerGroup) => (
                            <React.Fragment key={Math.random()}>
                              {headerGroup.headers.map((column) => (
                                <th
                                  key={Math.random()}
                                  {...column.getHeaderProps(
                                    column.getSortByToggleProps()
                                  )}
                                  className={column.className}
                                >
                                  <span className="tabletitle">
                                    {column.render("Header")}
                                  </span>
                                  <span>
                                    {column.isSorted ? (
                                      column.isSortedDesc ? (
                                        <i className="fa fa-angle-down"></i>
                                      ) : (
                                        <i className="fa fa-angle-up"></i>
                                      )
                                    ) : (
                                      ""
                                    )}
                                  </span>
                                </th>
                              ))}
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>

                      {isLoading ? (
                        <tbody>
                          <tr>
                            <td colSpan={9}>
                              <div
                                className="loader inner-loader"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <ClipLoader
                                  loading={isLoading}
                                  color="#36d7b7"
                                  aria-label="Loading Spinner"
                                  data-testid="loader"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : page.length === 0 ? (
                        <tbody>
                          <tr>
                            <td
                              colSpan={9}
                              style={{ textAlign: "center", padding: "20px" }}
                            >
                              No results found.
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody {...getTableBodyProps()}>
                          {page.map((row) => {
                            prepareRow(row);
                            return (
                              <tr key={Math.random()} {...row.getRowProps()}>
                                <td className="borderrigth">
                                  <input
                                    type="checkbox"
                                    checked={isSelected(row.original.id)}
                                    onChange={() =>
                                      toggleRowSelected(row.original.id)
                                    }
                                  // disabled={
                                  //   row.original.paymentOption === "full"
                                  // }
                                  />
                                </td>
                                {row.cells.map((cell) => (
                                  <td
                                    key={Math.random()}
                                    className="borderrigth"
                                    {...cell.getCellProps()}
                                  >
                                    {cell.render("Cell")}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      )}
                    </table>
                  </div>
                  {/* Pagination start */}
                  <Row className="mt-4 mt-sm-2  mx-0">
                    <Col xs={12} sm={6} className="d-flex align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="me-2">
                          Showing page{" "}
                          <strong>
                            {currentPageIndex + 1} of {Math.ceil(totalRecords / pageSize)}
                          </strong>
                        </span>
                        <span>
                          Total Records:{" "}
                          <strong>{totalRecords}</strong>
                        </span>
                      </div>
                    </Col>
                    <Col xs={12} sm={6} className="d-flex pgintn justify-content-end">
                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => gotoPage(0)}
                        disabled={currentPageIndex === 0}
                      >
                        {"First"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => previousPage()}
                        disabled={currentPageIndex === 0}
                      >
                        {"<"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => nextPage()}
                        disabled={currentPageIndex + 1 >= totalPages}
                      >
                        {">"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton"
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={currentPageIndex + 1 >= totalPages}
                      >
                        {"Last"}
                      </Button>
                    </Col>
                  </Row>
                  {/* Pagination end */}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {showExtendBookingModal && (
        <ExtendBookingModal
          showExtendBookingModal={showExtendBookingModal}
          setShowExtendBookingModal={setShowExtendBookingModal}
          extendBookingRow={extendBookingRow}
        />
      )}

      <Modal show={basic} className="Member-filtr-mdlDgn">
        <Modal.Header>
          <Modal.Title>Filters</Modal.Title>
          <Button
            variant=""
            className="btn btn-close"
            onClick={() => {
              viewDemoClose("Basic");
            }}
          >
            <i className="bi bi-x"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit} onReset={handleFormReset}>
            <Form.Group className="mb-3" controlId="formOrderId">
              <Form.Label>Order ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Order ID"
                value={searchFormData.orderId || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    orderId: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Event Name"
                value={searchFormData.eventName || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    eventName: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="First Name"
                value={searchFormData.name || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    name: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Last Name"
                value={searchFormData.lname || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    lname: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                value={searchFormData.email || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    email: e.target.value,
                  })
                }
              />
            </Form.Group>

            {/* <Form.Group className="mb-3" controlId="formMobile">
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                type="text"
                placeholder="Mobile"
                value={searchFormData.mobile || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    mobile: e.target.value,
                  })
                }
              />
            </Form.Group> */}

            <Form.Group className="mb-3" controlId="formPaymentOption">
              <Form.Label>Payment Option</Form.Label>
              <Form.Select
                value={searchFormData.paymentOption || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    paymentOption: e.target.value,
                  })
                }
              >
                <option value="">Select Payment Option</option>
                <option value="full">Full Payment</option>
                <option value="partial">Partial Payment</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3 dt-pkr-wdt" controlId="formDateFrom">
              <Form.Label>Date From</Form.Label>
              <DatePicker
                selected={startDate}
                onChange={handleFromDateChange}
                dateFormat="dd-MM-yyyy"
                className="form-control"
                placeholderText="DD-MM-YY"
              />
            </Form.Group>

            <Form.Group className="mb-3 dt-pkr-wdt" controlId="formDateTo">
              <Form.Label>Date To</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={handleToDateChange}
                dateFormat="dd-MM-yyyy"
                className="form-control"
                placeholderText="DD-MM-YY"
                minDate={startDate}
                startDate={startDate}
                disabled={!fromDateModified}
              />
            </Form.Group>

            <div className="d-flex  mt-2">
              <Button variant="primary me-3" type="submit">
                Submit
              </Button>
              <Button variant="secondary" type="reset">
                Reset
              </Button>
            </div>
          </Form>
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

Orders.layout = "Contentlayout";
export default Orders;
