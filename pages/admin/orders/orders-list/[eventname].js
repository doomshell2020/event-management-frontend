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

const OrderList = () => {
  const router = useRouter();
  const { eventname, eventId } = router.query; // Access eventname from the URL
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATA_TABLE] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [basic, setBasic] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [amountInfo, setAmountInfo] = useState({
    total_amount: 0,
    total_taxes: 0,
    gross_total: 0,
    currencySign: null,
  });
  const [eventInfo, setEventInfo] = useState({});

  const [fromDateModified, setFromDateModified] = useState(false);
  const [searchFormData, setSearchFormData] = useState({
    email: null,
    OriginalTrxnIdentifier: null,
    mobile: null,
    startDate: null,
    endDate: null,
    eventname: eventname || null,
    eventId: eventId || null,
    key: "order_list", // Static key value
  });

  const submitBtnRef = useRef(null);

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "wd-5p borderrigth text-center font-weight-bold", // Added bold text for better visibility
    },
    {
      Header: "Order Information", // Full descriptive title
      className: "wd-35p borderrigth text-left font-weight-bold", // Adjusted width to fit both details
      Cell: ({ row }) => {
        const {
          OriginalTrxnIdentifier,
          RRN,
          is_free,
          couponCode,
          actualamount,
          discountAmount,
          total_amount,
          adminfee = 0,
        } = row.original;

        let amountAfterDiscount = actualamount;
        if (couponCode) {
          amountAfterDiscount -= discountAmount;
        }

        const taxAmount = (amountAfterDiscount * adminfee) / 100;
        const roundNumber = (number) => Math.round(number);

        return (
          <div>
            <div>
              <b>Order ID: #{OriginalTrxnIdentifier}</b>
              {RRN && (
                <div className="">
                  <strong>Stripe Key:</strong> {RRN}
                </div>
              )}
              {is_free && (
                <div className="mt-1">
                  <span className="badge badge-primary">Free Ticket</span>
                </div>
              )}
            </div>

            <div className="">
              {couponCode ? (
                <div>
                  <strong>Actual:</strong>{" "}
                  {eventInfo?.Currency?.Currency_symbol || ""}{" "}
                  {/* {roundNumber(actualamount)}  */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(actualamount)
                  )}
                  <br />
                  <strong>Coupon:</strong> {couponCode} <br />
                  <strong>Discount:</strong>{" "}
                  {eventInfo?.Currency?.Currency_symbol || ""}{" "}
                  {/* {roundNumber(discountAmount)}  */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(discountAmount)
                  )}
                  <br />
                  <strong>Before Tax:</strong>{" "}
                  {eventInfo?.Currency?.Currency_symbol || ""}{" "}
                  {/* {roundNumber(amountAfterDiscount)}  */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(amountAfterDiscount)
                  )}
                  <br />
                  {/* <strong>Tax ({adminfee}%):</strong>{" "} */}
                  <strong>Tax:</strong>{" "}
                  {eventInfo?.Currency?.Currency_symbol || ""}{" "}
                  {/* {roundNumber(taxAmount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(taxAmount)
                  )}
                  <br />
                  <strong>Total:</strong>{" "}
                  {eventInfo?.Currency?.Currency_symbol || ""}{" "}
                  {/* {roundNumber(total_amount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(total_amount)
                  )}
                </div>
              ) : (
                <div>
                  <strong>Before Tax:</strong>{" "}
                  {eventInfo?.Currency?.Currency_symbol || ""}{" "}
                  {/* {roundNumber(actualamount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(actualamount)
                  )}
                  <br />
                  {/* <strong>Tax ({adminfee}%):</strong>{" "} */}
                  <strong>Tax:</strong>{" "}
                  {eventInfo?.Currency?.Currency_symbol || ""}{" "}
                  {/* {roundNumber(taxAmount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(taxAmount)
                  )}
                  <br />
                  <strong>Total (Including Tax):</strong>{" "}
                  {eventInfo?.Currency?.Currency_symbol || ""}{" "}
                  {/* {roundNumber(total_amount)} */}
                  {new Intl.NumberFormat("en-IN").format(
                    roundNumber(total_amount)
                  )}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      Header: "User Info",
      className: "wd-30p borderrigth text-left font-weight-bold", // Shortened for clarity
      Cell: ({ row }) => (
        <div>
          <strong>Name:</strong> {row.original.User.FirstName} <br />
          <strong>Email:</strong> {row.original.User.Email} <br />
          <strong>Mobile:</strong> {row.original.User.PhoneNumber}
        </div>
      ),
    },
    {
      Header: "Summary",
      className: "wd-15p borderrigth text-left font-weight-bold", // Shortened header and kept center-aligned
      Cell: ({ row }) => (
        <div>
          <span>
            <strong>Tickets:</strong> {row.original.TicketBooks.length}
          </span>
          <br />
          <span>
            <strong>Addons:</strong> {row.original.AddonBooks.length}
          </span>
        </div>
      ),
    },
    {
      Header: "Date",
      accessor: "StartDates",
      className: "wd-15p borderrigth text-left font-weight-bold", // Shortened header and center-aligned
      Cell: ({ row }) => (
        <div>
          <Moment format="DD-MMM-YYYY" utc>{row.original.createdAt}</Moment>
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updatedSearchFormData = { ...searchFormData };
      if (eventname) {
        updatedSearchFormData.eventname = eventname;
      }
      if (eventId) {
        updatedSearchFormData.eventId = eventId;
      }
      callSearchApi(updatedSearchFormData);
      setSearchFormData(updatedSearchFormData);
    }, 2000); // 3-second delay

    return () => clearTimeout(timeoutId);
  }, [eventname, eventId]);

  const callSearchApi = async (formData) => {
    const SEARCH_API = "/api/v1/orders";
    setIsLoading(true);
    try {
      const { data } = await axios.post(SEARCH_API, formData);
      if (data.success) {
        setDATA_TABLE(data.data.totalOrders);
        setEventInfo(data.data.event);
        setAmountInfo(data.data.amountInfo);
      } else {
        setDATA_TABLE([]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFromDateChange = (date) => {
    const originalDate = new Date(date);
    // Convert to 'YYYY-MM-DD' format
    const formattedDate = `${originalDate.getFullYear()}-${String(
      originalDate.getMonth() + 1
    ).padStart(2, "0")}-${String(originalDate.getDate()).padStart(2, "0")}`; // '2024-10-06'
    // console.log(">>>>>>>>>>>>>startDate", formattedDate);

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
    // console.log(">>>>>>>>>>>>>endDate", formattedDate);

    setSearchFormData((prevFormData) => ({
      ...prevFormData,
      endDate: formattedDate,
    }));
    setEndDate(date);
  };

  const handleFormReset = async () => {
    setStartDate(null);
    setEndDate(null);
    const resetFormData = {
      email: null,
      OriginalTrxnIdentifier: null,
      mobile: null,
      startDate: null,
      endDate: null,
      eventname: eventname || null,
      eventId: eventId || null,
      key: "order_list", // Static key value
    };
    setSearchFormData(resetFormData);
    await callSearchApi(resetFormData);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSearchFormData(searchFormData); // Update the state (optional)
    await callSearchApi(searchFormData); // Use the updated data for API call
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
      <Seo title={"Orders List"} />

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
            <Card  className="member-fltr-hid">
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
                      value={searchFormData.OriginalTrxnIdentifier || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          OriginalTrxnIdentifier: e.target.value,
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
                      value={searchFormData.eventname || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          eventname: e.target.value,
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
                <Card.Header className="ps-3 pb-2">
                  <div className="d-flex justify-content-between flex-wrap align-items-center w-100">
                    <h4 className="card-title card-t">{eventname}</h4>

                    <div className="d-flex flex-wrap ord-list-hdrbtn align-items-center">
                      {amountInfo.total_amount > 0 && (
                        <div className="mb-2">
                          <button
                            variant=""
                            className="btn btn-sm btn-primary me-3"
                            style={{
                              background: "#845adf",
                              color: "white",
                              border: "none",
                              whiteSpace: "nowrap",
                              padding: "12px 20px", // Increase padding for bigger buttons
                              fontSize: "16px", // Increase font size
                              // maxWidth: "200px",
                              textAlign: "center",
                            }}
                            type="button"
                          >
                            <strong>Total Amount: </strong>
                            {amountInfo.currencySign}
                            {Math.round(
                              amountInfo.total_amount
                            ).toLocaleString()}
                          </button>
                        </div>
                      )}

                      {amountInfo.total_taxes > 0 && (
                        <div className="mb-2">
                          <button
                            variant=""
                            className="btn btn-sm btn-primary me-3"
                            style={{
                              background: "#845adf",
                              color: "white",
                              border: "none",
                              whiteSpace: "nowrap",
                              padding: "12px 20px",
                              fontSize: "16px",
                              // maxWidth: "200px",
                              textAlign: "center",
                            }}
                            type="button"
                          >
                            <strong>Taxes: </strong>
                            {amountInfo.currencySign}
                            {Math.round(
                              amountInfo.total_taxes
                            ).toLocaleString()}
                          </button>
                        </div>
                      )}

                      {amountInfo.gross_total > 0 && (
                        <div className="mb-2">
                          <button
                            variant=""
                            className="btn btn-sm btn-primary"
                            style={{
                              background: "#845adf",
                              color: "white",
                              border: "none",
                              whiteSpace: "nowrap",
                              padding: "12px 20px",
                              fontSize: "16px",
                              // maxWidth: "200px",
                              textAlign: "center",
                            }}
                            type="button"
                          >
                            <strong>Total with Taxes: </strong>
                            {amountInfo.currencySign}
                            {Math.round(
                              amountInfo.gross_total
                            ).toLocaleString()}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="p-2">
                  <div className="FinanceOrderList">
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
                      <tbody>
                        {isLoading ? (
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
                          page.map((row) => {
                            prepareRow(row);
                            return (
                              <tr key={Math.random()} {...row.getRowProps()}>
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
                          })
                        )}
                      </tbody>
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
                    <span className="pgintn">
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
          <Modal.Title>Search here</Modal.Title>
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
                      value={searchFormData.OriginalTrxnIdentifier || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          OriginalTrxnIdentifier: e.target.value,
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
                      value={searchFormData.eventname || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          eventname: e.target.value,
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
        </Modal.Body>
      </Modal>
    </>
  );
};

OrderList.layout = "Contentlayout";
export default OrderList;
