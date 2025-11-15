import { React, useEffect, useState, useRef } from "react";
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
  Collapse,
} from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import { useRouter } from "next/router";
import Moment from "react-moment";
import ClipLoader from "react-spinners/ClipLoader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { CForm, CCol, CFormLabel, CFormInput, CButton, } from "@coreui/react";
import Swal from "sweetalert2";
import { CSVLink } from "react-csv";
import { Tooltip, IconButton, Switch } from "@mui/material";
import moment from "moment";

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

const OrderDetail = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATATABLE] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [color, setColor] = useState("");
  const [ticket_id, setTicket_id] = useState("");
  const [transferModalData, setTransferModalData] = useState("");
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [ticketInfo, setTicketInfo] = useState({});
  const [ticketInfoData, setTicketInfoData] = useState({});
  console.log("ticketInfoData", ticketInfoData);

  const [renameFirstName, setRenameFirstName] = useState("");
  const [renameLastName, setRenameLastName] = useState("");

  const [fromDateModified, setFromDateModified] = useState(false);
  const [searchFormData, setSearchFormData] = useState({
    name: null,
    lname: null,
    email: null,
    orderId: null,
    mobile: null,
    eventName: null,
    startDate: null,
    endDate: null,
  });
  const router = useRouter();
  const { orderId } = router.query;
  const submitBtnRef = useRef(null);

  const [errorAlert, setErrorAlert] = useState("");
  const [getUserInfoExist, setGetUserInfoExist] = useState({});
  const [clickButton, setClickButton] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [renameShowHide, setRenameShowHide] = useState(false);

  // Rename ticket popup open
  const handleRenameTicket = (data) => {
    setRenameFirstName(
      data?.ticket_first_name ? data.ticket_first_name : data.name
    );
    setRenameLastName(
      data?.ticket_last_name ? data.ticket_last_name : data.lname
    );
    setRenameShowHide(true);
    setTicketInfoData(data);
  };

  useEffect(() => {
    if (!renameShowHide) {
      setRenameFirstName("");
      setRenameLastName("");
      setTicketInfoData("");
    }
  }, [renameShowHide]);

  // Rename ticket functionality
  const renameTicket = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      setButtonLoading(true);
      setClickButton(true);
      // const apiUrl = `https://staging.eboxtickets.com/embedapi/changeticketname`;
      // const body = new FormData();
      // body.append("fname", renameFirstName);
      // body.append("lname", renameLastName);
      // body.append("ticket_id", ticketInfoData.ticket_id);
      // body.append(
      //   "ticket_type",
      //   ticketInfoData.type == "ticket" ? true : false
      // );
      // body.append("is_admin", true);

      const apiUrl = `/api/v1/orders`;
      const body = {
        key: "changeTicketName",
        fname: renameFirstName,
        lname: renameLastName,
        ticket_id: ticketInfoData.ticket_id,
        ticket_type: ticketInfoData.ticket_type == "ticket" ? true : false,
        is_admin: true,
      };

      await axios
        .post(apiUrl, body)
        .then(async (res) => {
          if (res.data.success == true) {
            setClickButton(false);
            setButtonLoading(false);
            setRenameShowHide(false);
            setRenameFirstName("");
            setRenameLastName("");
            setTicketInfoData("");
            const message = res.data.message;
            Swal.fire({
              title: "Success",
              icon: "success",
              allowOutsideClick: false,
              confirmButtonText: "OK",
              confirmButtonColor: "#38cab3",
              text: message,
            }).then((result) => {
              if (result.isConfirmed && submitBtnRef.current) {
                submitBtnRef.current.click();
              }
            });
          } else {
            setClickButton(false);
            setButtonLoading(false);
            const message = res.data.message;
            setErrorAlert(message);
          }
        })
        .catch((err) => {
          setFirstName("");
          setLastName("");
          setClickButton(false);
          setButtonLoading(false);
          console.log(err, "err");
          setRenameShowHide(true);
        });
    }
    setValidatedCustom(true);
  };

  // Error message remove
  useEffect(() => {
    if (errorAlert) {
      const timeoutId = setTimeout(() => {
        setErrorAlert("");
      }, 7000);
      return () => clearTimeout(timeoutId);
    }
  }, [errorAlert]);

  // Transfer ticket  Start here >>>>>>>>>
  const [showTransferModal, setShowTransferModal] = useState(false);
  const handleCloseTransferModal = () => setShowTransferModal(false);
  const [isTransferButton, setIsTransferButton] = useState(true);

  // Modal popup open
  const handleClickOpenModal = (data) => {
    setTransferModalData(data);
    setTicketInfo(data);
    setTicket_id(data.ticket_id);
    setShowTransferModal(true);
  };

  // Automatic fatch for email
  // Ticket Transfer for email
  const handleEmail = async (email) => {
    setEmail(email);
    setIsTransferButton(true);
    try {
      if (email && email.includes("@")) {
        const encodedEmail = encodeURIComponent(email);
        const decodedEmail = decodeURIComponent(encodedEmail);

        if (decodedEmail == ticketInfo.email) {
          setErrorAlert(
            "You cannot transfer this ticket to the same recipient."
          );
          return false;
        }

        const memberResponse = await fetch(
          `/api/v1/members?email=${encodedEmail}`
        );
        const memberData = await memberResponse.json();

        if (memberData.success) {
          setIsTransferButton(false);
          const fetchedFirstName = memberData?.data?.FirstName || "";
          const fetchedLastName = memberData?.data?.LastName || "";
          setFirstName(fetchedFirstName);
          setLastName(fetchedLastName);
        } else {
          setErrorAlert("");
          const isConfirm = confirm(
            "The provided email does not exist. Would you like to send an invitation to your friend?"
          );

          if (isConfirm) {
            const newMemberEmailSend = "/api/v1/front/sendmailnewuser";
            const body = new FormData();
            body.append("existUserEmail", ticketInfo.email);
            body.append("newEmail", email);
            await axios
              .post(newMemberEmailSend, body)
              .then((res) => {
                setIsLoading(false);
                const resMessage = res.data.sendMailNewUser.message;
                if (res.data.sendMailNewUser.success) {
                  setShowTransferModal(false);
                  Swal.fire({
                    icon: "success",
                    title: "Invitation Sent!",
                    text: resMessage,
                  });
                  setEmail("");
                } else {
                  setShowTransferModal(false);
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text:
                      "Something went wrong. Please try again later. Error:" +
                      err,
                  });
                }
              })
              .catch((err) => {
                setIsLoading(false);
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text:
                    "Something went wrong. Please try again later. Error:" +
                    err,
                });
              });
          } else {
            setFirstName("");
            setLastName("");
          }
        }
      }
    } catch (error) {
      setIsTransferButton(false); // Re-enable the button after API response is processed
      console.error("Error fetching member data:", error);
    }
  };

  const transferTicket = async (event) => {
    setIsLoading(true);
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false || isTransferButton) {
      setIsLoading(false);
      event.preventDefault();
      event.stopPropagation();
    } else {
      if (Email == ticketInfo.email) {
        setIsTransferButton(true);
        setIsLoading(false);
        setErrorAlert("You cannot transfer this ticket to the same recipient.");
        return false;
      }

      const shouldRemove = confirm("Are you sure you want to transfer?");

      if (shouldRemove) {
        // Receiver email
        const encodedEmail = encodeURIComponent(Email);
        const viewProfileApi = await fetch(
          `/api/v1/front/sendmailnewuser/?Email=${encodedEmail}`
        );
        const toUserInfo = await viewProfileApi.json();

        // Sender profile details
        const encodedEmail2 = encodeURIComponent(ticketInfo.email);
        const fromViewProfileApi = await fetch(
          `/api/v1/front/sendmailnewuser/?Email=${encodedEmail2}`
        );
        const fromUserProfile = await fromViewProfileApi.json();

        // return false;
        if (toUserInfo.success) {
          setGetUserInfoExist(toUserInfo.data);
        } else {
          setErrorAlert(toUserInfo.message);
          setIsLoading(false);
          setFirstName("");
          setLastName("");
          setIsTransferButton(true);
          return false;
        }

        // const apiUrl = `https://staging.eboxtickets.com/embedapi/transferticket`;
        // const body = new FormData();
        // body.append("fromName", fromUserProfile.data.FirstName);
        // body.append("toName", toUserInfo.data.FirstName);
        // body.append("email", Email);
        // body.append("ticket_id", ticketInfo.ticket_id);
        // body.append("status", toUserInfo.data.Status);
        // body.append("tickettype", "ticket");

        // Without term and condition
        const apiUrl = `/api/v1/orders`;
        const body = {
          key: "transferTicket",
          fromName:
            (fromUserProfile?.data?.FirstName || "") +
            (fromUserProfile?.data?.LastName
              ? " " + fromUserProfile.data.LastName
              : ""),
          toName:
            (toUserInfo?.data?.FirstName || "") +
            (toUserInfo?.data?.LastName ? " " + toUserInfo.data.LastName : ""),
          email: Email,
          ticket_id: ticketInfo?.ticket_id || "",
          status: toUserInfo?.data?.Status || "",
          toUserId: toUserInfo?.data?.id || "",
          ticket_type: "ticket",
        };
        // console.log("body", body);
        // return false;
        await axios
          .post(apiUrl, body)
          .then(async (res) => {
            if (res.data.success == true) {
              const message = res.data.message;
              setShowTransferModal(false);
              Swal.fire({
                title: "Success",
                icon: "success",
                allowOutsideClick: false,
                confirmButtonText: "ok",
                cancelButtonColor: "#38cab3",
                text: message,
              });

              setEmail("");
              setLastName("");
              setLastName("");
              setErrorAlert("");
              setGetUserInfoExist("");
              await callSearchApi({
                orderId: orderId,
                key: "searchOrderDetails",
              });
            } else {
              setIsLoading(false);
              const message = res.data.message;
              setFirstName("");
              setLastName("");
              setEmail("");
              setIsTransferButton(true);
              setErrorAlert(message);
            }
          })
          .catch((err) => {
            // console.log(err, 'err');
            setErrorAlert(err);
            setShowTransferModal(true);
            setFirstName("");
            setLastName("");
            setEmail("");
            setIsTransferButton(true);
          });
      } else {
        setIsLoading(false);
        return false;
      }
    }
    setValidatedCustom(true);
  };
  // Transfer ticket  Start End >>>>>>>>>

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "wd-5p borderrigth",
    },
    {
      Header: "Order ID",
      accessor: "Name",
      className: "wd-25p borderrigth",
      Cell: ({ row }) => (
        <div>
          {row.original.transferticket ? (
            <div>
              <div style={{ position: "relative", width: "116px" }}>
                <h6
                  style={{
                    position: "absolute",
                    color: "white",
                    zIndex: "99999",
                    transform: "translate(-50%, -50%)",
                    top: "50%",
                    left: "50%",
                    fontSize: "14px",
                  }}
                >
                  Transferred
                </h6>
                <div
                  style={{
                    position: "absolute",
                    backgroundColor: "black",
                    width: "100%",
                    height: "100%",
                    opacity: "0.8",
                  }}
                ></div>
                <img src={row.original.qrcode} alt="QR" />
              </div>
              {row.original.transferticketemail}
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* <div style={{ position: "absolute", backgroundColor: "black", width: "100%", height: "100%", opacity: "0.8" }}></div> */}
              <img src={"/qrCodes/" + row.original.qrcode} alt="QR" />
            </div>
          )}

          <b>
            {/* <Link href={`/admin/orders/orderdetail/?orderId=${row.original.OriginalTrxnIdentifier}`}> */}
            # {row.original.OriginalTrxnIdentifier}
            {/* </Link> */}
          </b>
        </div>
      ),
    },
    {
      Header: "Event",
      accessor: "Event",
      className: " borderrigth",
      Cell: ({ row }) => <div>{row.original.eventname}</div>,
    },
    {
      Header: "Ticket",
      accessor: "Ticket",
      className: " borderrigth",
      Cell: ({ row }) => <div>{row.original.eventticketname}</div>,
    },
    {
      Header: "User Info ",
      className: " wd-25p borderrigth",
      Cell: ({ row }) => (
        <div>
          <strong>Name:</strong> {row.original.name ? row.original.name : "--"}{" "}
          {row.original.lname ? row.original.lname : "--"}
          <br />
          <strong>Email:</strong> {row.original.email}
          <br />
          <strong>Mobile:</strong> {row.original.mobile}
          {row.original.is_transfer && (
            <div className="transferred-label" style={{ marginTop: "5px" }}>
              <span
                className="badge badge-info"
                style={{
                  backgroundColor: "#17a2b8",
                  color: "white",
                  padding: "3px 8px",
                  borderRadius: "4px",
                }}
              >
                Transferred
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      Header: "Amount",
      accessor: "Amount",
      className: "wd-5p borderrigth",
      Cell: ({ row }) => (
        <div>
          {row.original.currencysign} {row.original.ticketPrice}
        </div>
      ),
    },
    {
      Header: "Order Date",
      accessor: "StartDates",
      className: " borderrigth",
      Cell: ({ row }) => (
        <div>
          {/* {row.original.StartDate} */}
          <Moment format="DD-MMM-YYYY" utc>{row.original.orderDate}</Moment>
        </div>
      ),
    },
    {
      Header: "Action",
      accessor: "Transfer Ticket",
      className: "borderright w-25",
      Cell: ({ row }) => (
        <div className="d-flex flex-column">
          {row.original.transferticket ? (
            <strong>
              <Link
                href="javascript:void(0)"
                className="transferticket btn btn-success mb-2 w-100 d-inline-block text-dark"
              >
                Transferred
              </Link>
            </strong>
          ) : (
            <strong>
              <Link
                href="javascript:void(0)"
                className="transferticket btn btn-danger mb-2 w-100 d-inline-block text-dark"
                onClick={() => {
                  handleClickOpenModal(row.original);
                }}
              >
                Transfer Ticket
              </Link>
            </strong>
          )}

          <strong>
            <Link
              href="javascript:void(0)"
              className="btn btn-info w-100 d-inline-block text-dark"
              onClick={() => {
                handleRenameTicket(row.original);
              }}
            >
              Rename Ticket
            </Link>
          </strong>
        </div>
      ),
    },
  ]);

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: DATATABLE,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps, // table props from react-table
    headerGroups, // headerGroups, if your table has groupings
    getTableBodyProps, // table body props from react-table
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
    state,
    setGlobalFilter,
    page, // use, page or rows
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;

  const handleViewOrders = async () => {
    const API_URL =
      "https://staging.eboxtickets.com/embedapi/searchorderdetails";
    try {
      const response = await axios.post(
        API_URL,
        { orderId: orderId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        if (response.data.data) {
          setDATATABLE(response.data.data);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("There was a problem with your Axios request:", error);
    }
  };

  useEffect(() => {
    if (orderId) {
      //   handleViewOrders();
      setSearchFormData({
        ...searchFormData,
        orderId: orderId,
        key: "searchOrderDetails",
      });
      callSearchApi({
        ...searchFormData,
        orderId: orderId,
        key: "searchOrderDetails",
      });
    }
    // setPageSize(25);
    // fetchedColors();
  }, [orderId]);

  const handleFromDateChange = (date) => {
    setStartDate(date);
    setEndDate(null);
    setFromDateModified(true);
  };

  const handleToDateChange = (date) => {
    setEndDate(date);
  };

  const handleFormReset = async () => {
    setSearchFormData({
      orderId: orderId,
      key: "searchOrderDetails",
    });
    setStartDate(null);
    setEndDate(null);
    await callSearchApi({
      orderId: orderId,
      key: "searchOrderDetails",
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    callSearchApi(searchFormData);
  };

  const callSearchApi = async (formData) => {
    // const SEARCH_API = 'https://staging.eboxtickets.com/embedapi/searchorderdetails';
    const SEARCH_API = "/api/v1/orders";
    setIsLoading(true);
    try {
      const response = await axios.post(SEARCH_API, formData);
      if (response.data.data) {
        setDATATABLE(response.data.data);
      } else {
        setDATATABLE([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // view wristband color
  const fetchedColors = async () => {
    const SEARCH_API = `/api/v1/wristband?event_id=${108}`;
    setIsLoading(true);
    try {
      const response = await axios.get(SEARCH_API);
      if (response.data.data) {
        // console.log("Response Data:", response.data.data);
        setColor(response.data.data);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Generate Excel
  const headers = [
    { label: "S.No", key: "serialNumber" },
    { label: "Order ID", key: "orderId" },
    { label: "Order Date", key: "orderDate" },
    { label: "Event", key: "eventName" },
    // { label: "Ticket", key: "ticketName" },
    { label: "Ticket", key: "ticketName" },
    { label: "Addon", key: "addontName" },
    { label: "User Name", key: "userName" },
    { label: "User Email", key: "userEmail" },
    { label: "Amount", key: "amount" },
    { label: "Band Color", key: "bandColor" },
    { label: "Clasp Color", key: "claspColor" },
  ];
  // Process data
  const data = DATATABLE.map((item, index) => {
    const ticketNameCondition =
      item.eventticketname === "VIP EXPERIENCE PACKAGE" ? "Y" : "N";
    const addontNameCondition =
      item.eventticketname === "Illyrian Voyage | Karaka Boat" ? "Y" : "N";
    return {
      serialNumber: index + 1, // Add serial number
      orderId: item.OriginalTrxnIdentifier || "----",
      orderDate: item.orderCreated
        ? moment(item.orderCreated).format("DD-MMM-YYYY")
        : "----",
      eventName: item.eventname || "----",
      ticketName: ticketNameCondition,
      addontName: addontNameCondition,
      userName: `${item.name || "---"} ${item.lname || "---"}`,
      userEmail: item.email || "---",
      amount: item.amount ? `€ ${item.amount}` : "---",
      bandColor: item.bandcolor || "---",
      claspColor: item.claspcolor || "---",
    };
  });
  // Export CSV function
  const onExportLinkPress = async () => {
    const csvData = [
      headers.map((header) => header.label),
      ...data.map((item) => Object.values(item)),
    ];
    const csvOptions = {
      filename: "my-file.csv",
      separator: ",",
    };
    const csvExporter = new CSVLink(csvData, csvOptions);
    // Trigger the download (uncomment the next line if needed)
    // csvExporter.click();
  };

  return (
    <>
      <Seo title={"Order Details"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Order Details
          </span>
        </div>
        <div className="justify-content-center mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Order
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Order Details
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between">
                  <h4 className="card-title mg-b-0">Filters</h4>
                </div>
              </Card.Header>
              <Card.Body>
                <Form
                  onSubmit={handleFormSubmit}
                  onReset={handleFormReset}
                  id="searchForm"
                >
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

                  <Form.Group className="mb-3" controlId="formMobile">
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
                      placeholderText="DD-MM-YY"
                      minDate={startDate}
                      startDate={startDate}
                      disabled={!fromDateModified}
                    />
                  </Form.Group>

                  <div className="d-flex mt-2">
                    <Button
                      variant="primary me-3"
                      ref={submitBtnRef}
                      id="submitBtn"
                      type="submit"
                    >
                      Submit
                    </Button>

                    <Button variant="secondary" type="reset">
                      Reset
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={10}>
            <Card>
              <Card.Header style={{ padding: "10px" }}>
                {/* <div className="d-flex justify-content-end">
                                    <IconButton className="p-0">
                                        <CSVLink
                                            headers={headers}
                                            data={data}
                                            filename={"orders.xlsx"}
                                            className="btn btn-sm btn-primary-light ms-auto me-2"
                                            target="_blank"
                                        >
                                            Generate Excel
                                        </CSVLink>
                                    </IconButton>
                                </div> */}
              </Card.Header>
              <Card.Body className="">
                <div className="oredrDtl-tbl-rs">
                  <table
                    {...getTableProps()}
                    className="table mb-0 orderDtlTbl"
                  >
                    <thead>
                      {headerGroups.map((headerGroup) => (
                        <tr
                          key={Math.random()}
                          {...headerGroup.getHeaderGroupProps()}
                        >
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
                        </tr>
                      ))}
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
                                // color={color}
                                loading={isLoading}
                                color="#36d7b7"
                                aria-label="Loading Spinner"
                                data-testid="loader"
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody {...getTableBodyProps()}>
                        {page.map((row) => {
                          prepareRow(row);
                          return (
                            <tr key={Math.random()} {...row.getRowProps()}>
                              {row.cells.map((cell) => {
                                return (
                                  <td
                                    key={Math.random()}
                                    className="borderrigth"
                                    {...cell.getCellProps()}
                                  >
                                    {cell.render("Cell")}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
                <div className="d-block d-sm-flex mt-4 ">
                  <span className="">
                    Page{" "}
                    <strong>
                      {pageIndex + 1} of {pageOptions.length}
                    </strong>{" "}
                  </span>
                  <span className="ms-sm-auto ">
                    <Button
                      variant=""
                      className="btn-default tablebutton me-2 d-sm-inline d-none my-1"
                      onClick={() => gotoPage(0)}
                      disabled={!canPreviousPage}
                    >
                      {" Previous "}
                    </Button>
                    <Button
                      variant=""
                      className="btn-default tablebutton me-2 my-1"
                      onClick={() => {
                        previousPage();
                      }}
                      disabled={!canPreviousPage}
                    >
                      {" << "}
                    </Button>
                    <Button
                      variant=""
                      className="btn-default tablebutton me-2 my-1"
                      onClick={() => {
                        previousPage();
                      }}
                      disabled={!canPreviousPage}
                    >
                      {" < "}
                    </Button>
                    <Button
                      variant=""
                      className="btn-default tablebutton me-2 my-1"
                      onClick={() => {
                        nextPage();
                      }}
                      disabled={!canNextPage}
                    >
                      {" > "}
                    </Button>
                    <Button
                      variant=""
                      className="btn-default tablebutton me-2 my-1"
                      onClick={() => {
                        nextPage();
                      }}
                      disabled={!canNextPage}
                    >
                      {" >> "}
                    </Button>
                    <Button
                      variant=""
                      className="btn-default tablebutton me-2 d-sm-inline d-none my-1"
                      onClick={() => gotoPage(pageCount - 1)}
                      disabled={!canNextPage}
                    >
                      {" Next "}
                    </Button>
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Ticket name rename  */}
      <Modal
        show={renameShowHide}
        aria-labelledby="example-modal-sizes-title-sm"
        className="event-mdl"
      >
        <Modal.Header>
          <Modal.Title>Rename Ticket</Modal.Title>
          <Button
            className="btn-close ms-auto"
            variant=""
            onClick={() => {
              setRenameShowHide(false);
            }}
          >
            x
          </Button>
        </Modal.Header>

        <Modal.Body className="px-3 event-mdl">
          {/* <CCol md={12} className="mb-3">
                        <p>
                            Please note that you can rename the ticket only twice.<span style={{ color: "Red" }}>*</span>
                        </p>
                    </CCol> */}

          {errorAlert && (
            <CCol md={12} className="mt-3">
              <Alert variant="danger">{errorAlert}</Alert>
            </CCol>
          )}

          <CForm
            className="row g-3 needs-validation"
            noValidate
            validated={validatedCustom}
            onSubmit={renameTicket}
          >
            <CCol md={6}>
              <CFormLabel htmlFor="validationDefault01">
                First Name<span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                id="validationDefault01"
                placeholder="First Name"
                required
                value={renameFirstName}
                onChange={(e) => {
                  setRenameFirstName(e.target.value);
                }}
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="validationDefault01">
                Last Name<span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                id="validationDefault01"
                placeholder="Last Name"
                required
                value={renameLastName}
                onChange={(e) => {
                  setRenameLastName(e.target.value);
                }}
              />
            </CCol>

            <CCol md={12} className="d-flex ">
              <CButton color="primary" type="submit" disabled={clickButton}>
                {buttonLoading ? "Loading..." : "Submit"}
              </CButton>
            </CCol>
          </CForm>
        </Modal.Body>
      </Modal>
      {/* Ticket name rename */}

      {/* Transfer ticket modal start here  */}
      <Modal show={showTransferModal} onHide={handleCloseTransferModal}>
        <Modal.Header>
          <Modal.Title>Transfer Ticket</Modal.Title>
          <Button
            className="btn-close ms-auto"
            variant=""
            onClick={() => {
              setShowTransferModal(false);
            }}
          >
            x
          </Button>
        </Modal.Header>

        <Modal.Body>
          <p>
            <span style={{ color: "Red" }}>*</span> Please enter the details of
            the Ondalinda member to whom you wish to transfer your ticket(s).
            They will be able to access their ticket(s) through their Ondalinda
            member profile. This ticket transfer will include and add-onsite
            purchased along with the ticket(s).
          </p>

          <h5>
            <b>
              #{" "}
              {transferModalData && transferModalData.OriginalTrxnIdentifier
                ? transferModalData.OriginalTrxnIdentifier
                : "--"}
            </b>
          </h5>

          {errorAlert && (
            <CCol md={12} className="mt-3">
              <Alert variant="danger">{errorAlert}</Alert>
            </CCol>
          )}

          <CForm
            className="row g-3 needs-validation"
            noValidate
            validated={validatedCustom}
            onSubmit={transferTicket}
          >
            <CCol md={9}>
              <CFormLabel htmlFor="validationDefault01">
                Email<span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <CFormInput
                type="email"
                id="validationDefault01"
                placeholder="Email"
                required
                value={Email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // handleEmail(e.target.value)
                }}
              />
            </CCol>
            <CCol md={3} className="mt-5">
              <CButton
                color="primary"
                className="w-100 me-4"
                type="button"
                onClick={(e) => {
                  handleEmail(Email);
                }}
              >
                Find
              </CButton>
            </CCol>

            {!isTransferButton && (
              <>
                <CCol md={6}>
                  <CFormLabel htmlFor="validationDefault01">
                    First Name<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault01"
                    placeholder="First Name"
                    required
                    readOnly={true}
                    value={FirstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="validationDefault01">
                    Last Name<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault01"
                    placeholder="Last Name"
                    required
                    value={LastName}
                    readOnly={true}
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                  />
                </CCol>

                <CCol md={4} className="mt-5">
                  <CButton
                    color="primary"
                    className="w-100 me-4"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Transfer"}
                  </CButton>
                </CCol>
              </>
            )}
          </CForm>
        </Modal.Body>
      </Modal>
      {/* Transfer ticket modal end here  */}
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

OrderDetail.layout = "Contentlayout";
export default OrderDetail;
