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
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import tinycolor from "tinycolor2";
import { saveAs } from "file-saver";
import moment from "moment";

const CancelTickets = () => {
  const router = useRouter();
  const { eventname, type, transfer, ticketId } = router.query; // Access eventname from the URL
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATATABLE] = useState([]);
  const [startDate, setStartDate] = useState(null);
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
    ticketType: type,
    ticketId: ticketId || null,
    transfer: transfer || null, // Default transfer value (Yes)
    key: "cancel_tickets", // Static key value
  });

  const submitBtnRef = useRef(null);

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "wd-5p",
    },
    {
      Header: "User Info",
      className: "wd-30p borderrigth",
      Cell: ({ row }) => (
        <div>
          <strong>Name:</strong> {row.original.name || "--"}
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
      className: "wd-35p borderrigth",
      Cell: ({ row }) => (
        <div style={{ fontSize: "14px", color: "#333" }}>
          {row.original.ticketName}({row.original.Currency_symbol}{" "}
          {row.original.price})
          <div className="text-right d-inline-block  ms-2">
            <span
              className="badge bg-danger"
              style={{
                color: "#fff",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              {row.original.ticketType}
            </span>
          </div>
        </div>
      ),
    },
    {
      Header: "Order ID",
      accessor: "OriginalTrxnIdentifier",
      className: "wd-15p borderrigth",
      Cell: ({ row }) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Order ID */}
          <div style={{ fontSize: "14px", color: "#333" }}>
            {row.original.orderrrn}
          </div>
        </div>
      ),
    },
    {
      Header: "Order Date",
      accessor: "orderDate",
      className: "wd-15p borderrigth",
      Cell: ({ row }) => (
        <div style={{ fontSize: "14px", color: "#333" }}>
          <Moment format="DD-MMM-YYYY">{row.original.orderDate}</Moment>
        </div>
      ),
    },
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
        updatedSearchFormData.ticketType = type;
      }
      if (transfer) {
        updatedSearchFormData.transfer = transfer;
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
  }, [eventname, type, transfer, ticketId]);

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

  // const handleFromDateChange = (date) => {
  //     setStartDate(date);
  //     setEndDate(null);
  //     setFromDateModified(true);
  // };
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

  // const handleToDateChange = (date) => {
  //     setEndDate(date);
  // };
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

  const handleFormReset = async () => {
    setSearchFormData({
      // type: "all",
      ticketType: type,
      eventName: eventname,
      key: "cancel_tickets",
    });
    // callSearchApi(searchFormData);
    setStartDate(null);
    setEndDate(null);
    await callSearchApi({
      ticketType: type,
      eventName: eventname,
      key: "cancel_tickets",
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    callSearchApi(searchFormData);
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
      { header: "Name", key: "Name", width: 20 },
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
        orderId: item.orderrrn || "N/A",
        orderDate: item.orderDate
          ? moment(item.orderDate).format("DD-MMM-YYYY")
          : "N/A",
        Name: `${item.name || "N/A"}`,
        userEmail: item.email || "N/A",
        userMobile: item.mobile || "N/A",
        TicketName: `${item?.ticketName ? `${item.ticketName} (${item.Currency_symbol || ''}${item.price || ''})` : 'N/A'}`

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
      <Seo title={"Cancel Tickets"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Cancel Tickets
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
              Cancel Tickets
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
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center w-100">
                  <h4 className="card-title">{eventname}</h4>
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
                </div>
              </Card.Header>

              <Card.Body className="">
                {/* <div className="oredrDtl-tbl-rs"> */}
                <table {...getTableProps()} className="table mb-0 ">
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
                {/* </div> */}
                <div className="d-block d-sm-flex mt-4 ">
                  <span className="">
                    Page{" "}
                    <strong>
                      {pageIndex + 1} of {pageOptions.length}
                    </strong>{" "}
                    Total Records:{" "}
                    <strong>{DATATABLE && DATATABLE.length}</strong>
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
    </>
  );
};

CancelTickets.layout = "Contentlayout";
export default CancelTickets;
