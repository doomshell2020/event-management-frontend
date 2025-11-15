import { React, useEffect, useState } from "react";
import { Button, Card, Row, Col, Breadcrumb, Form, } from "react-bootstrap";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import Moment from "react-moment";
import "moment-timezone";
import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import { useRouter } from "next/router";
import ClipLoader from "react-spinners/ClipLoader";
import { CForm, CCol, CFormLabel, CFormInput, CButton, } from "@coreui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const HousingEnquiryPage = () => {
    const navigate = useRouter();
    const router = useRouter();
    const { event_id } = router.query
    const [DATATABLE, setDATATABLE] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [fromDateModified, setFromDateModified] = useState(false);
    // staff navigate
    const handleStaffEdit = (row) => {
        navigate.push({
            pathname: "#",
            query: {
                housingId: row.original.id,
            },
        });
    };

    // CamelCase FirstName and LastName 
    const toCamelCase = (str) => {
        if (!str) return "N/A";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "User Details",
            accessor: "neighborhood",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {/* <strong>Name: </strong>
                    {`${row.original.User?.LastName || "N/A"} ${row.original.User?.FirstName || "N/A"}`} */}
                    <strong>Name: </strong>
                    {`${toCamelCase(row.original.User?.LastName || "N/A")} ${toCamelCase(row.original.User?.FirstName || "N/A")}`}


                    <br />
                    <strong>Email: </strong>{" "}
                    {row.original.User?.Email ? row.original.User.Email : "N/A"}
                    <br />
                </div>
            ),
        },
        {
            Header: "Arrival Date",
            accessor: "ArrivalDate",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {/* {row.original.ArrivalDate ? row.original.ArrivalDate : "N/A"} */}
                    <Moment format="DD-MMM-YYYY">
                        {row.original.ArrivalDate}
                    </Moment>
                </div>
            ),
        },
        {
            Header: "Departure Date",
            accessor: "DepartureDate",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {/* {row.original.DepartureDate ? row.original.DepartureDate : "N/A"} */}
                    <Moment format="DD-MMM-YYYY">
                        {row.original.DepartureDate}
                    </Moment>
                </div>
            ),
        },
        {
            Header: "Accommodation Type",
            accessor: "AccommodationType",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.AccommodationType ? row.original.AccommodationType : "N/A"}
                </div>
            ),
        },
        {
            Header: "Created",
            accessor: "created",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    <Moment format="DD-MMM-YYYY">
                        {row.original.createdAt}
                    </Moment>
                </div>
            ),
        },




        {
            Header: "Actions",
            accessor: "Action",
            className: "border-right",
            style: { width: "50%" }, // Increase header width
            Cell: ({ row }) => (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        width: "80px",
                    }}
                >
                    {" "}
                    <button
                        title="Edit Housing"
                        className="btn btn-success btn-sm"
                        style={{ flex: "1 1 calc(50% - 0.25rem)", margin: "0 0" }}
                    // onClick={() => handleStaffEdit(row)}
                    >
                        <i className="bi bi-pencil-square pe-1"></i>
                    </button>
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

    // View housing data
    const fetchData = async () => {
        setIsLoading(true); // Set loading state to true before the API call
        try {
            const ApiURL = `/api/v1/front/accommodationbook/housing-enquiry?id=${event_id}`;
            const response = await axios.get(ApiURL);
            if (response.data.success) {
                setDATATABLE(response.data.data || []); // Update data state
            } else {
                console.error("API Error:", response.data.message || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching housing enquiry data:", error);
        } finally {
            setIsLoading(false); // Ensure loading state is set to false after the API call
        }
    };
    useEffect(() => {
        if (event_id) {
            fetchData();
        }
    }, [event_id]);




    const handleSearch = async (event) => {
        event.preventDefault()
        // Check if all fields are empty
        if (!name && !email && !startDate && !endDate) {
            console.log("No search criteria provided. API call skipped.");
            return; // Exit the function if all fields are empty
        }
        const SearchUrl = "/api/v1/front/accommodationbook/housing-enquiry";
        event.preventDefault();
        const body = {
            key: "search_enquiry",
            Name: name,
            Email: email,
            ArrivalDate: startDate,
            DepartureDate: endDate
        }
        await axios
            .post(SearchUrl, body)
            .then((res) => {
                if (res.data.success) {
                    setDATATABLE(res.data.searchResults);
                } else {
                    console.log("Search data not found");
                }
            })
            .catch((err) => {
                console.log("message", err);
            });
    };

    // Reset all data after the search
    const HandleResetData = async () => {
        fetchData();
        setEmail("");
        setName("");
        setStartDate("");
        setEndDate("");
    };

    const handleFromDateChange = (date) => {
        if (!date) return; // Add a check to avoid setting invalid date
        const originalDate = new Date(date);
        // Convert to 'YYYY-MM-DD' format
        const formattedDate = `${originalDate.getFullYear()}-${String(
            originalDate.getMonth() + 1
        ).padStart(2, "0")}-${String(originalDate.getDate()).padStart(2, "0")}`; // '2024-10-06'

        setStartDate(formattedDate);
        setEndDate(null); // Reset end date when from date changes
        setFromDateModified(true);
    };

    const handleToDateChange = (date) => {
        if (!date || !startDate) return; // Ensure startDate is set before setting endDate
        const originalDate = new Date(date);
        // Convert to 'YYYY-MM-DD' format
        const formattedDate = `${originalDate.getFullYear()}-${String(
            originalDate.getMonth() + 1
        ).padStart(2, "0")}-${String(originalDate.getDate()).padStart(2, "0")}`; // '2024-10-06'
        setEndDate(formattedDate);
    };







    return (
        <>
            <Seo title={"Housing Enquiries "} />

            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Housing Enquiries  Manager
                    </span>
                </div>
                <div className="justify-content-between d-flex mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Event
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Housing Enquiries
                        </Breadcrumb.Item>
                    </Breadcrumb>
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
                                        <CFormLabel htmlFor="validationCustom03">
                                            Name
                                        </CFormLabel>
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
                                        <CFormLabel htmlFor="validationCustom03">
                                            Email
                                        </CFormLabel>
                                        <CFormInput
                                            type="text"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => {
                                                const trimmedEmail = e.target.value.trim();
                                                setEmail(trimmedEmail);
                                            }}
                                        />
                                    </CCol>

                                    {/* <CCol md={12}> */}
                                    <Form.Group
                                        className="mb-3 dt-pkr-wdt"
                                        controlId="formDateFrom"
                                    >
                                        {/* <CFormLabel htmlFor="validationCustom03">
                                        Arrival Date
                                    </CFormLabel> */}
                                        <Form.Label>Arrival Date</Form.Label>
                                        <DatePicker
                                            selected={startDate ? new Date(startDate) : null} // Make sure startDate is a valid date
                                            onChange={handleFromDateChange}
                                            dateFormat="dd-MM-yyyy"
                                            className="form-control"
                                            placeholderText="DD-MM-YY"
                                        />
                                    </Form.Group>
                                    {/* </CCol> */}
                                    {/* <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">
                                            Departure Date
                                        </CFormLabel> */}
                                    <Form.Group
                                        className="mb-3 dt-pkr-wdt"
                                        controlId="formDateFrom"
                                    >
                                        <Form.Label>Departure Date</Form.Label>

                                        <DatePicker
                                            selected={endDate ? new Date(endDate) : null} // Make sure endDate is a valid date
                                            onChange={handleToDateChange}
                                            dateFormat="dd-MM-yyyy"
                                            className="form-control"
                                            placeholderText="DD-MM-YY"
                                            minDate={startDate ? new Date(startDate) : null} // Ensure minDate is set only when startDate is available
                                            startDate={startDate ? new Date(startDate) : null}
                                            disabled={!fromDateModified} // Disable until Arrival Date is selected
                                        />
                                    </Form.Group>
                                    {/* </CCol> */}




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

                    <Col xl={10}>
                        <div className="Mmbr-card">
                            <Card>
                                <Card.Body className="p-2">
                                    <div className="hosing-mngr">
                                        <table
                                            {...getTableProps()}
                                            className="table responsive-table  mb-0"
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
                                            ) : page.length === 0 ? ( // Check if no data
                                                <tbody>
                                                    <tr>
                                                        <td colSpan={9} style={{ textAlign: "center" }}>
                                                            Data Not Found
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

                                    {/* Pagination start */}
                                    <Row className="mt-4 mx-0 ">
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
            </div >
        </>
    );
};
HousingEnquiryPage.layout = "Contentlayout";
export default HousingEnquiryPage;
