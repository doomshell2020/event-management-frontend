import React, { useEffect, useState } from "react";
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
import { redirect } from "next/dist/server/api-utils";

const Donations = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [DATATABLE, setDATATABLE] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [totalDonation, setTotalDonation] = useState(null);
    const [currency, setCurrency] = useState(null);
    const [endDate, setEndDate] = useState(null);
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
        key: "search_order",
    });
    const router = useRouter();
    const { event, id } = router.query;
    const eventName = event ? decodeURIComponent(event.toString()) : null;

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
        setSearchFormData({});
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
            Header: "Order Id",
            accessor: "orderId",
            className: "wd-20p borderright",
            Cell: ({ row }) => {
                return (
                    <div>
                        <b>
                            <Link
                                className="d-flex align-items-center"
                                title="View Order Details"
                                target="_blank"
                                href={`/admin/orders/${row.original.orderrrn}`}
                                style={{ textDecoration: "underline", color: "blue" }}
                            >
                                # {row.original.orderrrn} {/* Free Ticket Badge */}
                            </Link>
                        </b>
                    </div>
                );
            },
        },

        {
            Header: "Order Amount",
            accessor: "TotalAmount",
            className: "wd-15p borderright",
            Cell: ({ row }) => {
                return (
                    <div style={{ textAlign: "right" }}>
                        {row.original.currencysign}
                        {new Intl.NumberFormat('en-IN').format(row.original.actualamount ? row.original.actualamount : "N/A")}
                        {/* {row.original.actualamount ? row.original.actualamount : "N/A"} */}
                    </div>
                );
            },
        },
        {
            Header: "Donation",
            accessor: "donation amount",
            className: "wd-20p borderright",
            Cell: ({ row }) => {
                // Check if donationfee exists and calculate donation amount
                const donationFee = row.original.donationfee;
                const donationAmount = donationFee
                    ? Math.round(row.original.actualamount * donationFee / 100)
                    : null;

                return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {donationFee ? (
                            <span>
                                <strong>Donation ({donationFee}%):</strong>{" "}
                                {row.original.currencysign}
                                {/* {donationAmount} */}
                                {new Intl.NumberFormat('en-IN').format(donationAmount)}
                            </span>
                        ) : (
                            <span>
                                <strong>Donation:</strong> N/A
                            </span>
                        )}
                    </div>
                );
            },
        },

        {
            Header: "Order Date",
            accessor: "StartDates",
            className: "wd-20p borderrigth",
            Cell: ({ row }) => (
                <div>
                    {/* {row.original.StartDate} */}
                    <Moment format="DD-MMM-YYYY">{row.original.orderDate}</Moment>
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
            body.append("key", "eventorder");
            body.append("eventName", eventName);
            const response = await axios.post(API_URL, body);
            setDATATABLE(response.data.data);
            setTotalDonation(response.data.donation_total_amount)
            setCurrency(response.data.currency)
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
                key: "search_order",
            });
            // console.log("Response Data:", data);
            if (data.data) {
                setDATATABLE(data.data);
                setTotalDonation(data.donation_total_amount)
            } else {
                setDATATABLE([]); // or set a default value
            }
            setIsLoading(false);
            // console.log("Response Data:", response.data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <>
            <Seo title={"Donation Manager"} />

            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Events Donation Orders
                    </span>
                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Donation Orders
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <div className="left-content mt-2">
                <ToastContainer />

                <Row className="row-sm mt-4">
                    <Col xl={2}>
                        <Card>
                            <Card.Header>
                                <div className="d-flex justify-content-between">
                                    <h4 className="card-title mg-b-0">Filters</h4>
                                </div>
                            </Card.Header>
                            <Card.Body>
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

                                    <div className="d-flex  mt-2">
                                        <Button variant="primary me-3" type="submit">
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
                            <Card.Header className=" ">
                                <div className="d-flex flex-wrap justify-content-between align-items-center">
                                    <h4 className="card-title card-t mg-b-0">
                                        {eventName || "Event Orders"}
                                    </h4>
                                    <p style={{ marginRight: "100px", marginBottom: "0", }}><strong>Total Donations:
                                        {/* {totalDonation ? totalDonation : 0} */}
                                        {currency && totalDonation
                                            ? `${currency} ${(totalDonation).toLocaleString()}`
                                            : "N/A"}
                                    </strong></p>

                                </div>
                            </Card.Header>

                            <Card.Body className="">
                                <div className=" oredr-tbl-rs">
                                    <table
                                        {...getTableProps()}
                                        // className="table mb-0"
                                        className="table table-bordered table-hover mb-0 text-md-nowrap"
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

                                {/* Pagination start */}
                                <Row className="mt-4">
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
                                    <Col xs={12} sm={6} className="d-flex justify-content-end">
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
                    </Col>
                </Row>
            </div>
        </>
    );
};


Donations.layout = "Contentlayout";
export default Donations;
