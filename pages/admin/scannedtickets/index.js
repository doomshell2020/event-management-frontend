import { React, useEffect, useState } from "react";
import { Button, Form, Modal, Table, Card, Row, Col, Breadcrumb, Alert, Collapse } from "react-bootstrap";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import axios from "axios";
import Seo from '@/shared/layout-components/seo/seo';
import Link from "next/link";
import { useRouter } from "next/router";
import Moment from "react-moment";
import ClipLoader from "react-spinners/ClipLoader";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import { CForm, CCol, CFormLabel, CFormInput, CButton, } from "@coreui/react";
import Swal from "sweetalert2";

const OrderDetail = () => {
    const [lgShow, setLgShow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [DATATABLE, setDATATABLE] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Email, setEmail] = useState("");
    const [ticket_id, setTicket_id] = useState("");
    const [status, setStatus] = useState("");
    const [tickettype, settickettype] = useState("");
    const [modaldata, setModalData] = useState('');

    // console.log("modaldata", modaldata);

    const [fromDateModified, setFromDateModified] = useState(false);
    const [searchFormData, setSearchFormData] = useState({
        name: null,
        email: null,
        orderId: null,
        ticketId: null,
        mobile: null,
        eventName: null,
        startDate: null,
        endDate: null
    });
    const router = useRouter();
    const { event,orderId } = router.query;
    const eventName = event ? decodeURIComponent(event.toString()) : null;
  
    useEffect(() => {
      if (eventName) {
        setSearchFormData(prevFormData => ({
          ...prevFormData,
          eventName: eventName
        }));
      }
    }, [eventName]);

    const [errorAlert, setErrorAlert] = useState('');
    const [openerror, setOpenError] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [staticAdded, setStaticAdded] = useState("");
    var StaticMessage = '';
    useEffect(() => {
        if (typeof window !== 'undefined') {
            var StaticMessage = localStorage.getItem("staticAdded");

            const fetchTemplates = async () => {
                try {
                    const response = await fetch('/api/templates?label=YOUR_LABEL');
                    const data = await response.json();

                    if (data.success) {
                        setTemplates(data.templates);
                    } else {
                        console.error('Failed to fetch templates:', data.message);
                    }
                } catch (error) {
                    console.error('Error fetching templates:', error);
                }
            };

            if (StaticMessage != null && StaticMessage !== "") {
                setOpenAlert(true);
                setStaticAdded(StaticMessage);
                setTimeout(() => {
                    localStorage.setItem("staticAdded", "");
                    setOpenAlert(false);
                }, 3000);
            } else {
                setOpenAlert(false);
                setStaticAdded("");
            }
        }

    }, [staticAdded]);

    const [validatedCustom, setValidatedCustom] = useState(false);
    const [isTransferButton, setIsTransferButton] = useState(true);

    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "wd-5p borderrigth",
        },

        {
            Header: "Date of Scanning",
            className: " wd-15p borderrigth",
            Cell: ({ row }) => (
                <div>
                    <Moment format="DD-MMM-YYYY HH:mm:ss">
                        {row.original.usedbydate}
                    </Moment>
                </div>
            ),
        },
        {
            Header: "Ticket ID",
            accessor: "Ticket Code",
            className: "wd-10p borderrigth",
            Cell: ({ row }) => (
                <div>
                    <></>
                    {/* {row.original.transferticket ? (
                        <div>
                            <div style={{ position: "relative", width: "116px" }}>
                                <h6 style={{ position: "absolute", color: "white", zIndex: "99999", transform: "translate(-50%, -50%)", top: "50%", left: "50%", fontSize: "14px" }}>Transferred</h6>
                                <div style={{ position: "absolute", backgroundColor: "black", width: "100%", height: "100%", opacity: "0.8" }}></div>
                                <img src={row.original.qrcode} alt="QR" />

                            </div>
                            {row.original.transferticketemail}
                        </div>
                    ) : (
                        <div style={{ position: "relative" }}>

                            <div style={{ position: "absolute", backgroundColor: "black", width: "100%", height: "100%", opacity: "0.8" }}></div>
                            <img src={row.original.qrcode} alt="QR" />
                        </div>
                    )} */}

                    <b>
                        {/* <Link href={`/admin/orders/orderdetail/?orderId=${row.original.OriginalTrxnIdentifier}`}> */}
                        # {row.original.ticket_num}
                        {/* </Link> */}
                    </b>
                </div>
            )
        },
        {
            Header: "Order ID",
            accessor: "Name",
            className: "wd-10p borderrigth",
            Cell: ({ row }) => (
                <div>
                    <b>
                        {/* <Link href={`/admin/orders/orderdetail/?orderId=${row.original.OriginalTrxnIdentifier}`}> */}
                        # {row.original.OriginalTrxnIdentifier}
                        {/* </Link> */}
                    </b>
                </div>
            )
        },
        {
            Header: "Used by",
            className: " wd-20p borderrigth",
            Cell: ({ row }) => (
                <div>
                    <strong>Name:</strong> {row.original.usedbyname} <br />
                    <strong>Email:</strong> {row.original.usedby}<br />
                    <strong>Mobile:</strong> {row.original.usedbymobile}
                </div>
            ),
        },
        {
            Header: "Event Name",
            accessor: "Event Name",
            className: " borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.eventname}
                </div>
            )
        },
        {
            Header: "Ticket Name",
            accessor: "Ticket",
            className: " borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.eventticketname}
                </div>
            )
        },
        // {
        //     Header: "User Info",
        //     className: " wd-20p borderrigth",
        //     Cell: ({ row }) => (
        //         <div>
        //             <strong>Name:</strong> {row.original.name} <br />
        //             <strong>Email:</strong> {row.original.email}<br />
        //             <strong>Mobile:</strong> {row.original.mobile}
        //         </div>
        //     ),
        // },
        {
            Header: "Type",
            className: " wd-8p borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.type}
                </div>
            ),
        },
        // {
        //     Header: "Device Details",
        //     className: " wd-10p borderrigth",
        //     Cell: ({ row }) => (
        //         <div>
        //             {`ios`}
        //         </div>
        //     ),
        // },


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

    // console.log(searchFormData);

    const handleViewOrders = async () => {
        const API_URL = 'https://staging.eboxtickets.com/embedapi/scannedtickets';
        try {
            const response = await axios.post(API_URL, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                if (response.data.data) {
                    setDATATABLE(response.data.data);
                }
                setIsLoading(false);
            }

        } catch (error) {
            console.error('There was a problem with your Axios request:', error);
        }
    };

    useEffect(() => {
        handleViewOrders();
        setSearchFormData({ ...searchFormData })
        // setPageSize(25);
    }, []);

    const handleFromDateChange = (date) => {
        const originalDate = new Date(date);
        // const formattedDate = originalDate.toLocaleDateString('en-GB'); // '2024-02-28'
        // const formattedDate = date.toISOString().split('T')[0];
        const formattedDate = originalDate.toISOString().split('T')[0];
        setSearchFormData(prevFormData => ({
            ...prevFormData,
            startDate: formattedDate
        }));
        setStartDate(date);
        setEndDate(null);
        setFromDateModified(true);
    };

    const handleToDateChange = (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        setSearchFormData(prevFormData => ({
            ...prevFormData,
            endDate: formattedDate
        }));
        setEndDate(date);
    };
    const handleFormReset = async () => {
        setSearchFormData({});
        setStartDate(null);
        setEndDate(null);
        await callSearchApi({});
    };


    const handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log(searchFormData);
        // return false;
        callSearchApi(searchFormData);
    };

    const callSearchApi = async (formData) => {
        const SEARCH_API = 'https://staging.eboxtickets.com/embedapi/scannedtickets';
        setIsLoading(true);

        try {
            console.log(formData, "fd");
            const response = await axios.post(SEARCH_API, formData);
            if (response.data.data) {
                console.log("Response Data:", response.data.data);
                setDATATABLE(response.data.data);
            } else {
                setDATATABLE([]);
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <>
            <Seo title={"Tickets Scanned"} />

            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">Tickets Scanned</span>
                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Tickets Scanned
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>
            {staticAdded != null && openAlert === true && (
                <Collapse in={openAlert}>
                    <Alert aria-hidden={true} severity="success">
                        {staticAdded}
                    </Alert>
                </Collapse>
            )}

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
                                <Form onSubmit={handleFormSubmit} onReset={handleFormReset} id="searchForm">


                                    <Form.Group className="mb-3" controlId="formOrderId">
                                        <Form.Label>Ticket ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ticket ID"
                                            value={searchFormData.ticketId || ''}
                                            onChange={(e) => setSearchFormData({ ...searchFormData, ticketId: e.target.value })}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formOrderId">
                                        <Form.Label>Order ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Order ID"
                                            value={searchFormData.orderId || ''}
                                            onChange={(e) => setSearchFormData({ ...searchFormData, orderId: e.target.value })}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formName">
                                        <Form.Label>Event Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Event Name"
                                            value={searchFormData.eventName || ''}
                                            onChange={(e) => setSearchFormData({ ...searchFormData, eventName: e.target.value })}
                                        />

                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formName">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="First Name"
                                            value={searchFormData.name || ''}
                                            onChange={(e) => setSearchFormData({ ...searchFormData, name: e.target.value })}
                                        />

                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Email"
                                            value={searchFormData.email || ''}
                                            onChange={(e) => setSearchFormData({ ...searchFormData, email: e.target.value })}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formMobile">
                                        <Form.Label>Mobile</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Mobile"
                                            value={searchFormData.mobile || ''}
                                            onChange={(e) => setSearchFormData({ ...searchFormData, mobile: e.target.value })}
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

                            <Card.Body className="">
                                <div className="oredrDtl-tbl-rs">
                                    <table {...getTableProps()} className="table mb-0 scannedTicketDtlTbl">
                                        <thead>
                                            {headerGroups.map((headerGroup) => (
                                                <tr key={Math.random()} {...headerGroup.getHeaderGroupProps()}>
                                                    {headerGroup.headers.map((column) => (
                                                        <th key={Math.random()}
                                                            {...column.getHeaderProps(column.getSortByToggleProps())}
                                                            className={column.className}
                                                        >
                                                            <span className="tabletitle">{column.render("Header")}</span>
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
                                                        <div className="loader inner-loader" style={{ display: "flex", justifyContent: "center" }}>
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
                                                                    <td key={Math.random()} className="borderrigth" {...cell.getCellProps()}>
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


OrderDetail.layout = "Contentlayout"
export default OrderDetail



