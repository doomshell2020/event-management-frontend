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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
const OrderDetails = () => {
  const router = useRouter();
  const { eventname, type, transfer, discountAmount, ticketId } = router.query; // Access eventname from the URL
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATATABLE] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [basic, setBasic] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [amountInfo, setAmountInfo] = useState({});

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
    discountAmount: discountAmount || null,
    ticketId: ticketId || null,
    transfer: transfer || null, // Default transfer value (Yes)
    type: type || "all", // Default type value (Ticket)
    key: "get_sales_data", // Static key value
  });

  const submitBtnRef = useRef(null);

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "wd-5p borderrigth borderright",
    },
    {
      Header: "User Info",
      className: "wd-32p borderrigth borderright",
      Cell: ({ row }) => (
        <div>
          <strong>Name:</strong> {row.original.name || "--"}{" "}
          {row.original.lname || "--"}
          <br />
          <strong>Email:</strong> {row.original.email || "--"}
          <br />
          <strong>Mobile:</strong> {row.original.mobile || "--"}
        </div>
      ),
    },
    {
      Header: "Ticket Name",
      accessor: "eventticketname",
      className: "wd-28p borderrigth borderright",
      Cell: ({ row }) => (
        <div style={{ fontSize: "14px", color: "#333" }}>
          {row.original.eventticketname}
        </div>
      ),
    },
    {
      Header: "Order Info",
      accessor: "OriginalTrxnIdentifier",
      className: "wd-20p borderrigth borderright",
      Cell: ({ row }) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Order ID */}
          <div style={{ fontSize: "13px", color: "#333" }}>
            <strong>Order ID: </strong>
            {row.original.OriginalTrxnIdentifier}
          </div>
          {/* <div style={{ fontSize: "14px", color: "#333" }}>
            <strong>Date:</strong>{" "}
            <Moment format="DD-MMM-YYYY">{row.original.orderDate}</Moment>
          </div> */}
          {row.original.couponcode && (
            <div style={{ fontSize: "13px", color: "#333" }}>
              <strong>Coupon:</strong> {row.original.couponcode}
            </div>
          )}
          {/* Amount Info */}
          <div style={{ fontSize: "13px", color: "#333" }}>
            {/* {row.original.couponcode && (
              <div>
                <strong>Coupon Code:</strong> {row.original.couponcode}
                <br />
                <strong>Discount:</strong> {row.original.currencysign}{" "}
                {row.original.discount_amount.toLocaleString()}
              </div>
            )} */}
            {/* Free Ticket Badge */}
            {row.original.is_free_ticket && (
              <span
                style={{
                  // marginLeft: "10px",
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                Free Ticket
              </span>
            )}
          </div>

          {/* Transferred Status */}
          {row.original.transfer_ticket_to_email && (
            <div
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "5px",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Transferred to: {row.original.transfer_ticket_to_email}
            </div>
          )}
        </div>
      ),
    },
    {
      Header: "Order Date",
      accessor: "orderDate",
      className: "wd-15p borderrigth borderright",
      Cell: ({ row }) => (
        <div style={{ fontSize: "14px", color: "#333" }}>
          {/* {row.original.orderDate && (
            moment.utc(row.original.orderDate).format("DD-MMM-YYYY")
          )} */}

          <Moment format="DD-MMM-YYYY" utc>
            {row.original.orderDate}
          </Moment>

          {/* // <Moment format="DD-MMM-YYYY">{row.original.orderDate}</Moment> */}
        </div>
      ),
    },
    // {
    //   Header: "Taxes",
    //   accessor: "Taxes",
    //   className: "wd-35p borderright",
    //   Cell: ({ row }) => (
    //     <div style={{ fontSize: "14px", color: "#333", textAlign: "right" }}>
    //       {row.original.currencysign}{" "}
    //       {Math.round(row.original.tax_on_ticket).toLocaleString()} (
    //       {row.original.tax_percentage}%)
    //     </div>
    //   ),
    // },
    // {
    //   Header: "Total",
    //   accessor: "Total",
    //   className: "wd-35p borderright",
    //   Cell: ({ row }) => (
    //     <div style={{ fontSize: "14px", color: "#333", textAlign: "right" }}>
    //       {row.original.currencysign}{" "}
    //       {Math.round(
    //         row.original.total_ticket_price_with_tax
    //       ).toLocaleString()}
    //     </div>
    //   ),
    // },

    // {
    //   Header: "Ticket",
    //   accessor: "Ticket",
    //   className: "borderright",
    //   Cell: ({ row }) => <div>{row.original.eventticketname}</div>,
    // },
    // {
    //   Header: "Order Date",
    //   accessor: "StartDates",
    //   className: "borderright",
    //   Cell: ({ row }) => (
    //     <div>
    //       <Moment format="DD-MMM-YYYY">{row.original.orderDate}</Moment>
    //     </div>
    //   ),
    // },
  ]);

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: DATATABLE,
      initialState: { pageSize: 100 }, // Set the default page size to 100
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

  // Update state based on URL query params
  useEffect(() => {
    // Set a 2-second delay before calling the API
    const timeoutId = setTimeout(() => {
      const updatedSearchFormData = { ...searchFormData }; // Make a copy of the state to update
      if (eventname) {
        updatedSearchFormData.eventName = eventname;
      }
      if (type) {
        updatedSearchFormData.type = type;
      }
      if (transfer) {
        updatedSearchFormData.transfer = transfer;
      }
      if (discountAmount) {
        updatedSearchFormData.discountAmount = discountAmount;
      }
      if (ticketId) {
        updatedSearchFormData.ticketId = ticketId;
      }
      // Call the API with the updated values
      callSearchApi(updatedSearchFormData);

      // Update the state with the new values
      setSearchFormData(updatedSearchFormData);
    }, 2000); // 2-second delay

    return () => clearTimeout(timeoutId);
  }, [eventname, type, transfer, discountAmount, ticketId]);


  const callSearchApi = async (formData) => {
    const SEARCH_API = "/api/v1/orders";
    setIsLoading(true);
    try {
      const response = await axios.post(SEARCH_API, formData);
      if (response.data.data) {
        setAmountInfo(response.data.amount_info);
        setDATATABLE(response.data.data);
      } else {
        setDATATABLE([]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleFromDateChange = (date) => {
    setStartDate(date);
    setEndDate(null);
    setFromDateModified(true);
    setSearchFormData((prevState) => ({
      ...prevState,
      startDate: formatDate(date),
      endDate: null,
    }));
  };

  const handleToDateChange = (date) => {
    setEndDate(date);
    setSearchFormData((prevState) => ({
      ...prevState,
      endDate: formatDate(date),
    }));
  };

  const handleFormReset = async () => {
    setSearchFormData({
      eventName: eventname,
      key: "get_sales_data",
      type: type || "all",
      ticketId: ticketId || null,
      discountAmount: discountAmount || null,
      transfer: transfer || null, // Default transfer value (Yes)
    });
    setStartDate(null);
    setEndDate(null);
    await callSearchApi({
      eventName: eventname,
      key: "get_sales_data",
      type: type || "all",
      ticketId: ticketId || null,
      discountAmount: discountAmount || null,
      transfer: transfer || null, // Default transfer value (Yes)
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    callSearchApi(searchFormData);
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



  // Export Excel
  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filename = `${eventname}_${getCurrentDate()}.xlsx`;
  // Generate Excel
  const handleExport = async () => {
    if (!Array.isArray(DATATABLE)) {
      console.error("Invalid orderData: Expected an array.");
      return;
    }
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // Define headers with auto width
    worksheet.columns = [
      { header: "S.No", key: "serialNumber", width: 10 },
      { header: "First Name", key: "FirstName", width: 20 },
      { header: "Last Name", key: "LastName", width: 20 },
      { header: "Email", key: "userEmail", width: 25 },
      { header: "Mobile", key: "userMobile", width: 15 },
      { header: "Ticket Name", key: "TicketName", width: 15 },
      { header: "Order ID", key: "orderId", width: 15 },
      { header: "Order Date", key: "orderDate", width: 15 },
    ];

    // Add header styles and enable filters
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF000000" }, // Dark color (black)
        bgColor: { argb: "FFFFFFFF" }, // Background color (white)
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true }; // White text and bold
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    worksheet.autoFilter = "A1:O1"; // Enable filters
    worksheet.views = [{ state: "frozen", ySplit: 1 }]; // Freeze the first row

    // Add data rows
    DATATABLE.forEach((item, index) => {
      worksheet.addRow({
        serialNumber: index + 1, // Add serial number
        orderId: item.OriginalTrxnIdentifier || "N/A",
        orderDate: item.orderDate
          ? moment(item.orderDate).format("DD-MMM-YYYY")
          : "N/A",
        FirstName: `${item.name || "N/A"}`,
        LastName: `${item.lname || "N/A"}`,
        userEmail: item.email || "N/A",
        userMobile: item.mobile || "N/A",
        TicketName: item.eventticketname || "N/A",
      });
    });
    // Generate the Excel file as a Blob and use file-saver to save it
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, filename);
    } catch (err) {
      console.error("Error creating Excel file:", err);
    }
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
        <div className="justify-content-between d-flex mt-2">
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
        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card className="member-fltr-hid">
              <Card.Header>
                <div className="d-flex justify-content-between">
                  <h4 className="card-title mg-b-0">Filters</h4>
                </div>
              </Card.Header>
              <Card.Body className="p-2" >
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
                      readOnly={true}
                      value={searchFormData.eventName || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          eventName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  {/* Transfer Dropdown */}
                  <Form.Group className="mb-3" controlId="formTransfer">
                    <Form.Label>Transfer</Form.Label>
                    <Form.Control
                      as="select"
                      value={searchFormData.transfer}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          transfer: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="1">Yes</option>
                    </Form.Control>
                  </Form.Group>

                  {/* Type Dropdown */}
                  <Form.Group className="mb-3" controlId="formType">
                    <Form.Label>Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={searchFormData.type}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="all">All</option>
                      <option value="ticket">Ticket</option>
                      <option value="addon">Addon</option>
                    </Form.Control>
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

                  <Form.Group className="mb-3" controlId="formDiscount">
                    <Form.Label>Discount</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Discount Amount"
                      value={searchFormData.discountAmount || ""}
                      readOnly={true}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          discountAmount: e.target.value,
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

                  <div className="d-flex justify-content-between mt-2">
                    <Button
                      variant="primary me-2 w-50"
                      ref={submitBtnRef}
                      id="submitBtn"
                      type="submit"
                    >
                      Submit
                    </Button>

                    <Button variant="secondary w-50" type="reset">
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
                <Card.Header className="ps-3 ob-2">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <h4 className="card-title card-t mb-0 mb-sm-2">{eventname}</h4>
                    <div className="d-flex align-items-center">
                      <button
                        variant=""
                        className="btn exel-btn-scn-tct btn-sm my-1 btn-success"
                        style={{
                          color: "white",
                          border: "none",
                        }}
                        type="button"
                        onClick={handleExport}
                      >
                        <i className="bi bi-file-earmark-excel-fill me-1"></i>
                        Generate Excel
                      </button>
                    </div>


                    {/* <div className="d-flex align-items-center">
                    {amountInfo.total_amount > 0 && (
                      <div>
                        <button
                          variant=""
                          className="btn btn-primary me-3"
                          style={{
                            background: "#845adf",
                            color: "white",
                            border: "none",
                            whiteSpace: "nowrap",
                            padding: "12px 20px", // Increase padding for bigger buttons
                            fontSize: "16px", // Increase font size
                            minWidth: "200px", // Set minimum width for consistency
                            textAlign: "center",
                          }}
                          type="button"
                        >
                          <strong>Total Amount: </strong>
                          {Math.round(amountInfo.total_amount).toLocaleString()}
                        </button>
                      </div>
                    )}

                    {amountInfo.total_taxes > 0 && (
                      <div>
                        <button
                          variant=""
                          className="btn btn-primary me-3"
                          style={{
                            background: "#845adf",
                            color: "white",
                            border: "none",
                            whiteSpace: "nowrap",
                            padding: "12px 20px",
                            fontSize: "16px",
                            minWidth: "200px",
                            textAlign: "center",
                          }}
                          type="button"
                        >
                          <strong>Taxes: </strong>
                          {Math.round(amountInfo.total_taxes).toLocaleString()}
                        </button>
                      </div>
                    )}

                    {amountInfo.gross_total > 0 && (
                      <div>
                        <button
                          variant=""
                          className="btn btn-primary"
                          style={{
                            background: "#845adf",
                            color: "white",
                            border: "none",
                            whiteSpace: "nowrap",
                            padding: "12px 20px",
                            fontSize: "16px",
                            minWidth: "200px",
                            textAlign: "center",
                          }}
                          type="button"
                        >
                          <strong>Total with Taxes: </strong>
                          {Math.round(amountInfo.gross_total).toLocaleString()}
                        </button>
                      </div>
                    )}
                  </div> */}
                  </div>
                </Card.Header>

                <Card.Body className="p-2">
                  <div className="FinanceOredrDtl-tbl-rs">
                    <table
                      {...getTableProps()}
                      className="table mb-0 responsive-table"
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
                  <div className="d-flex ms-0 ms-sm-2 align-items-center mt-4 justify-content-between mt-sm-2 flex-wrap">
                    <span className="">
                      Page{" "}
                      <strong>
                        {pageIndex + 1} of {pageOptions.length}
                      </strong>{" "}
                      Total Records:{" "}
                      <strong>{DATATABLE && DATATABLE.length}</strong>
                    </span>
                    <span className="pgintn  ">
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
            </div>
          </Col>
        </Row>
      </div>

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
                readOnly={true}
                value={searchFormData.eventName || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    eventName: e.target.value,
                  })
                }
              />
            </Form.Group>

            {/* Transfer Dropdown */}
            <Form.Group className="mb-3" controlId="formTransfer">
              <Form.Label>Transfer</Form.Label>
              <Form.Control
                as="select"
                value={searchFormData.transfer}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    transfer: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="1">Yes</option>
              </Form.Control>
            </Form.Group>

            {/* Type Dropdown */}
            <Form.Group className="mb-3" controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={searchFormData.type}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    type: e.target.value,
                  })
                }
              >
                <option value="all">All</option>
                <option value="ticket">Ticket</option>
                <option value="addon">Addon</option>
              </Form.Control>
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

            <Form.Group className="mb-3" controlId="formDiscount">
              <Form.Label>Discount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Discount Amount"
                value={searchFormData.discountAmount || ""}
                readOnly={true}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    discountAmount: e.target.value,
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
        </Modal.Body>
      </Modal>
    </>
  );
};

OrderDetails.layout = "Contentlayout";
export default OrderDetails;
