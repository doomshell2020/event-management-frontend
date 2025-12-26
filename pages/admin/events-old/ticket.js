import { React, useEffect, useState } from "react";
import { Button, Form, Modal, Table, Card, Row, Col, Breadcrumb, Alert, Collapse } from "react-bootstrap";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import axios from "axios";
import Seo from '@/shared/layout-components/seo/seo';
import Link from "next/link";
import { useRouter } from "next/router";
import Moment from "react-moment";
import ClipLoader from "react-spinners/ClipLoader";
import { CForm, CCol, CFormLabel, CFormInput, CButton, } from "@coreui/react";
export const COLUMNS = [
    {
        Header: "Name",
        accessor: "Name",
        className: " borderrigth",
        Cell: ({ row }) => (

            <div>
                {row.original.User && (
                    <>
                        {row.original.User.FirstName && (
                            <>{row.original.User.FirstName}</>
                        )} {row.original.User.LastName && (
                            <>{row.original.User.LastName}</>
                        )}
                    </>
                )}
            </div>
        ),
    },

    {
        Header: "Email",
        accessor: "Email",
        className: " borderrigth",
        Cell: ({ row }) => (
            <div>
                {row.original.User && (
                    <>
                        {row.original.User.Email && (
                            <>{row.original.User.Email}</>
                        )}
                    </>
                )}
            </div>
        ),
    },
    {
        Header: "Mobile",
        accessor: "Mobile",
        className: " borderrigth",
        Cell: ({ row }) => (
            <div>
                {row.original.User && (
                    <>
                        {row.original.User.PhoneNumber && (
                            <>{row.original.User.PhoneNumber}</>
                        )}
                    </>
                )}
            </div>
        ),
    },
    {
        Header: "Tickets",
        accessor: "TicketSold",
        className: " borderrigth",
        Cell: ({ row }) => (
            <div>
                NA
            </div>
        )
    },



    {
        Header: "Purchased Date",
        accessor: "StartDates",
        className: " borderrigth",
        Cell: ({ row }) => (
            <div>
                {/* {row.original.StartDate} */}
                <Moment format="YYYY-MM-DD">
                    {row.original.createdAt}
                </Moment>
            </div>
        )
    },
];
const EventTicketView = () => {
    const [validatedCustom, setValidatedCustom] = useState(false);
    // const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [DATATABLE, setDATATABLE] = useState([]);
    const [FirstName, setFirstName] = useState("");
    const [Email, setEmail] = useState("");
    const [StartDate, setStartDate] = useState("");
    const [EndDate, setEndDate] = useState("");
    const router = useRouter();
    const { id } = router.query;
    // console.log(id)

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

    // Vire Events
    const EventsTicketURL = `/api/v1/invitationevents?Eventid=${id}`
    useEffect(() => {
        if (id != undefined) {
            fetch(EventsTicketURL)
                .then((response) => response.json())
                .then((value) => {
                    setTimeout(() => {
                        setDATATABLE(value.data);
                        setIsLoading(false);
                        // console.log("value.data", value.data)
                    }, 1000);
                })
        } else {
            console.log("hy")
        }
    }, [id])



    // Search user for purchased ticket
    const SearchUrl = "/api/v1/invitationevents";
    const SearchMember = async (event) => {
        event.preventDefault();

        const Searchbody = {
            key: "TicketPurchased",
            FirstName: FirstName,
            Email: Email,
            EventID: id,
            startedate: StartDate,
            EndDate: EndDate,

        };
        // console.log("Searchbody", Searchbody)
        await axios.post(SearchUrl, Searchbody)
            .then((res) => {
                setDATATABLE(res.data.searchResults)
            })
            .catch((err) => console.log(err));
    };


    const handleStartDate = (e) => {
        const selectedDate = e.target.value; // This will be a string in the format "YYYY-MM-DDTHH:MM"
        console.log(selectedDate);
        setStartDate(selectedDate);
    };
    const handleEndDate = (e) => {
        const selectedEndDate = e.target.value; // This will be a string in the format "YYYY-MM-DDTHH:MM"
        console.log(selectedEndDate);
        setEndDate(selectedEndDate);
    };




    return (
        <>
            <Seo title={"Events Manager"} />

            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">Order History Manager</span>
                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Events
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Ticket
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>


            <div className="left-content mt-2">


                <Row className="row-sm mt-4">
                    <Col xl={2}>
                        <Card>
                            <Card.Header className="">
                                <div className="d-flex justify-content-between">
                                    <h4 className="card-title mg-b-0">Filters</h4>

                                    {/* <Link href="/admin/events" className="btn btn-secondary "><i className="ri-arrow-go-back-fill align-bottom pe-1"></i>Back</Link> */}
                                </div>
                            </Card.Header>
                            <Card.Body className="">

                                <CForm
                                    className="row g-3 needs-validation"
                                    noValidate
                                    // validated={validatedCustom}
                                    onSubmit={SearchMember}
                                >


                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Name</CFormLabel>
                                        <CFormInput type="text" id="validationCustom03" required
                                            value={FirstName}
                                            onChange={(e) => {
                                                setFirstName(e.target.value);
                                            }}
                                        />

                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Email</CFormLabel>
                                        <CFormInput type="text"
                                            id="validationCustom03"
                                            value={Email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                            }}
                                        />

                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">StartDate</CFormLabel>
                                        <CFormInput type="date" id="validationCustom03" required
                                            value={StartDate}
                                            onChange={handleStartDate}
                                        />

                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">End Date</CFormLabel>
                                        <CFormInput type="date" id="validationCustom03" required
                                            value={EndDate}
                                            onChange={handleEndDate}
                                        />

                                    </CCol>
                                    <CCol md={13} className="d-flex justify-content-between mt-2">
                                        <CButton color="primary" type="submit">
                                            Submit
                                        </CButton>
                                    </CCol>
                                </CForm>
                            </Card.Body>

                        </Card>
                    </Col>

                    <Col xl={10}>
                        <Card>


                            <Card.Body className="">
                                <table {...getTableProps()} className="table mb-0">
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
                                            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
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
                                            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
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


EventTicketView.layout = "Contentlayout"
export default EventTicketView



