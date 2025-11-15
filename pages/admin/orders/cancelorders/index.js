import React, { useEffect, useState } from "react";

// import { Button, Form, Modal, Table, Card, Row, Col, Breadcrumb, Alert, Collapse } from "react-bootstrap";
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
  Table,
  Card,
  Row,
  Col,
  Breadcrumb,
  Alert,
  Collapse,
  Pagination,
  Spinner,
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import { useRouter } from "next/router";
import Moment from "react-moment";
import ClipLoader from "react-spinners/ClipLoader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CForm, CCol, CFormLabel, CFormInput, CButton } from "@coreui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const CancelOrders = () => {
  const router = useRouter();
  const { event, id } = router.query;
  const eventName = event ? decodeURIComponent(event.toString()) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [basic, setBasic] = useState(false);
  const [DATATABLE, setDATATABLE] = useState([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [addonCount, setAddonCount] = useState(0);
  // console.log("DATATABLE", DATATABLE)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [fromDateModified, setFromDateModified] = useState(false);
  const [searchFormData, setSearchFormData] = useState({
    name: null,
    lname: null,
    email: null,
    orderId: null,
    mobile: null,
    eventName: eventName,
    startDate: null,
    endDate: null,
    key: "search_order",
  });

  useEffect(() => {
    if (eventName) {
      setSearchFormData((prevFormData) => ({
        ...prevFormData,
        eventName: eventName,
      }));
    }
  }, [eventName]);

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

  const handleFormReset = () => {
    handleViewOrdersV2();
    setSearchFormData({
      name: null,
      lname: null,
      email: null,
      orderId: null,
      mobile: null,
      eventName: eventName,
      startDate: null,
      endDate: null,
      key: "search_order",
    });
    setStartDate(null);
    setEndDate(null);
  };

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "wd-5p borderrigth",
    },
    {
      Header: "Order Information",
      accessor: "actualamount",
      className: "wd-33p borderright",
      Cell: ({ row }) => {
        const {
          couponcode,
          currencysign,
          actualamount,
          totalamount,
          discountAmount,
          tax_percentage = 0, // Default tax percentage is 0
          total_include_tax,
          stripekey,
          is_free_ticket,
          orderrrn,
          ticket_status,
          ticket_cancel_id,
        } = row.original;

        const calculateTaxAmount = (amount, taxRate) =>
          (amount * taxRate) / 100;
        const roundNumber = (number) => Math.round(number);

        const amountAfterDiscount = couponcode
          ? actualamount - discountAmount
          : actualamount;

        const taxAmount = calculateTaxAmount(
          amountAfterDiscount,
          tax_percentage
        );

        return (
          <div>
            {/* Order Number */}
            <b>
              {/* <Link
                                className="d-flex align-items-center"
                                title="View Order Details"
                                target="_blank"
                                href={`/admin/orders/${orderrrn}`}
                                style={{ textDecoration: "underline", color: "blue" }}
                            > */}
              # {orderrrn} {/* Free Ticket Badge */}
            </b>

            {/* Stripe Key */}
            {stripekey && (
              <div className="text-right">
                {/* <br /> */}
                <strong>Stripe Key:</strong> {stripekey}
              </div>
            )}

            {/* Order Amount Details */}
            <div>
              {couponcode ? (
                <>
                  <strong>Actual Amount:</strong> {currencysign}{" "}
                  {/* {roundNumber(actualamount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(actualamount)
                  )}
                  <br />
                  <strong>Coupon Code:</strong> {couponcode} <br />
                  <strong>Discount Applied:</strong> {currencysign}{" "}
                  {/* {roundNumber(discountAmount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(discountAmount)
                  )}
                  <br />
                  <strong>After Discount (Before Tax):</strong> {currencysign}{" "}
                  {/* {roundNumber(amountAfterDiscount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(amountAfterDiscount)
                  )}
                  <br />
                </>
              ) : (
                <>
                  <strong>Total Amount (Before Tax):</strong> {currencysign}{" "}
                  {/* {roundNumber(actualamount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(actualamount)
                  )}
                  <br />
                </>
              )}
              {/* Tax and Total Details */}
              <strong>Tax ({tax_percentage}%):</strong> {currencysign}{" "}
              {/* {roundNumber(taxAmount)} */}
              {new Intl.NumberFormat("en-IN").format(roundNumber(taxAmount))}
              <br />
              <strong>Total (Including Tax):</strong> {currencysign}{" "}
              {/* {roundNumber(total_include_tax)} */}
              {new Intl.NumberFormat("en-IN").format(
                roundNumber(total_include_tax)
              )}
            </div>
          </div>
        );
      },
    },

    // {
    //   Header: "Event Name",
    //   accessor: "Event Name",
    //   className: "wd-10p borderrigth",
    //   Cell: ({ row }) => <div>{row.original.eventName}</div>,
    // },
    {
      Header: "User Info",
      className: "wd-25p borderrigth",
      Cell: ({ row }) => (
        <div>
          <strong>Name:</strong> {row.original.name} <br />
          <strong>Email:</strong> {row.original.email}
          <br />
          <strong>Mobile:</strong> {row.original.mobile}
        </div>
      ),
    },
    {
      Header: "VIP Packages",
      accessor: "tickets",
      className: "wd-12p borderright",
      Cell: ({ row }) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>
            <strong>Tickets:</strong> {row.original.tickettotal}
          </span>
          <span>
            <strong>Addons:</strong> {row.original.ticketaddontotal}
          </span>
        </div>
      ),
    },
    {
      Header: "Order Date",
      accessor: "StartDates",
      className: "wd-13p borderrigth",
      Cell: ({ row }) => (
        <div>
          {/* {row.original.StartDate} */}
          <Moment format="DD-MMM-YYYY">{row.original.orderDate}</Moment>
        </div>
      ),
    },
    {
      Header: "Action",
      accessor: "ticket_cancel_id",
      className: "wd-10p borderrigth",
      Cell: ({ row }) =>
        row.original.ticket_cancel_id != null && (
          <div
            className="d-flex align-items-center"
            style={{ gap: "4px" }} // Adds spacing between the badge and the icon
          >
            <span
              className="badge btn btn-danger btn-sm"
              // style={{
              //   backgroundColor: "#ff4d4f", // Bright red for canceled orders
              //   color: "#fff", // White text for contrast
              //   fontSize: "14px",
              //   padding: "5px 10px",
              //   borderRadius: "5px",
              //   fontWeight: "bold",
              //   boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
              // }}
            >
              Canceled
            </span>
            {row.original.refund_reason && (
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => {
                  Swal.fire({
                    title: "Refund Reason",
                    text: row.original.refund_reason,
                    showCloseButton: true,
                    showConfirmButton: false, // Hides the OK button
                  });
                }}
              >
                <i
                  className="fas fa-info-circle"
                  style={{ fontSize: "18px", color: "#007bff" }}
                  title="View Reason" // Tooltip when hovering over the icon
                ></i>
              </div>
            )}
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

  const getEventNameFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return decodeURIComponent(urlParams.get("event"));
  };

  // New api intigrate ondalinda setup tables data search
  const handleViewOrdersV2 = async () => {
    setIsLoading(true);
    const eventName = getEventNameFromURL();
    const API_URL = `/api/v1/events`;
    try {
      const body = new FormData();
      body.append("key", "viewCancelOrder");
      body.append("eventName", eventName);
      const response = await axios.post(API_URL, body);
      setDATATABLE(response.data.data);
      setAddonCount(response.data.addonCount);
      setTicketCount(response.data.ticketCount);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("There was a problem with your Axios request:", error);
    }
  };

  useEffect(() => {
    handleViewOrdersV2();
    setPageSize(25);
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const SEARCH_API = "/api/v1/orders";
    // return false;
    setIsLoading(true);

    try {
      const { data } = await axios.post(SEARCH_API, {
        ...searchFormData,
        key: "searchCancelOrders",
      });
      // console.log("Response Data:", data);
      if (data.data) {
        setDATATABLE(data.data);
      } else {
        setDATATABLE([]); // or set a default value
      }
      setIsLoading(false);
      // console.log("Response Data:", response.data.data);
    } catch (error) {
      console.error("Error:", error);
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
      <Seo title={"Event Cancel Orders"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Events Cancel Orders
          </span>
        </div>
        <div className="justify-content-between d-flex mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Cancel Orders
            </Breadcrumb.Item>
          </Breadcrumb>
          <Link
            href={"#"}
            className="filtr-icon"
            variant=""
            onClick={() => viewDemoShow("Basic")}
          >
            {" "}
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
                      readOnly
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

                  <div className="d-flex align-items-end justify-content-between">
                    <Button variant="primary"  className="me-2 w-50" type="submit">
                      Submit
                    </Button>
                    <Button variant="secondary"  className="w-50" type="reset">
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
                <Card.Header className="ps-3 ">
                  <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <h4 className="card-title card-t mg-b-0">
                      {eventName || "Event Cancel Orders"}
                    </h4>
                    <div>
                      {ticketCount > 0 && (
                        <Link
                          href={`/admin/orders/cancelorders/${eventName}?type=ticket`}
                          target="_blank"
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            type="button"
                            className=" my-1 btn-sm"
                            style={{
                              backgroundColor: "#007bff",
                              color: "white",
                            }}
                          >
                            Cancel Tickets ({ticketCount})
                          </Button>
                        </Link>
                      )}

                      {addonCount > 0 && (
                        <Link
                          href={`/admin/orders/cancelorders/${eventName}?type=addon`}
                          target="_blank"
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            type="button"
                            className="ms-2 my-1 btn-sm"
                            style={{
                              backgroundColor: "#5cd3b9",
                              color: "white",
                            }}
                          >
                            Cancel Addons ({addonCount})
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="p-2">
                  <div className=" CancelOrderTbl">
                    <table
                      {...getTableProps()}
                      // className="table mb-0"
                      className="table table-bordered  mb-0 text-md-nowrap responsive-table"
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

                      {/* <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            onChange={toggleAllRowsSelected}
                            checked={
                              selectedRows.length === page.length &&
                              page.length > 0
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
                    </thead> */}
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
                      ) : page.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            style={{ textAlign: "center", padding: "20px" }}
                          >
                            No results found.
                          </td>
                        </tr>
                      ) : (
                        <tbody {...getTableBodyProps()}>
                          {page.map((row) => {
                            prepareRow(row);
                            return (
                              <tr key={Math.random()} {...row.getRowProps()}>
                                {/* <td>
                                <input
                                  type="checkbox"
                                  checked={isSelected(row.original.orderid)}
                                  onChange={() =>
                                    toggleRowSelected(
                                      row.original.orderid,
                                      row.original.id
                                    )
                                  }
                                />
                              </td> */}
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

                  {/* Pagination start */}
                  <Row className="mt-4 mt-sm-2  mx-0">
                    <Col xs={12} sm={6} className="d-flex align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="me-2">
                          Showing page{" "}
                          <strong>
                            {pageIndex + 1} of {pageOptions.length}
                          </strong>
                        </span>
                        <span>
                          Total Records:{" "}
                          <strong>{DATATABLE && DATATABLE.length}</strong>
                        </span>
                      </div>
                    </Col>
                    <Col xs={12} sm={6} className="d-flex pgintn justify-content-end">
                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => gotoPage(0)}
                        disabled={!canPreviousPage}
                      >
                        {"First"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => previousPage()}
                        disabled={!canPreviousPage}
                      >
                        {"<"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => nextPage()}
                        disabled={!canNextPage}
                      >
                        {">"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton"
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={!canNextPage}
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

      <Modal show={basic} className="Member-filtr-mdlDgn">
        <Modal.Header>
          <Modal.Title>Search here</Modal.Title>
          <Button
            variant=""
            className="btn btn-close"
            onClick={() => {
              viewDemoClose("Basic");
            }}
          >
            <i class="bi bi-x"></i>
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
                readOnly
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

CancelOrders.layout = "Contentlayout";
export default CancelOrders;
