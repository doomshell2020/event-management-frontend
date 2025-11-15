import { React, useState } from "react";
import { Button, Form, Modal, Table, Card, Row, Col, Breadcrumb } from "react-bootstrap";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import MultiSelect from "react-multiple-select-dropdown-lite";

import Seo from '@/shared/layout-components/seo/seo';
import Link from "next/link";
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
} from "@coreui/react";
export const COLUMNS = [
    {
        Header: "S.No",
        accessor: "SNo",
        className: "wd-10p borderrigth",
    },
    {
        Header: "Attendee ID",
        accessor: "AttendeeID",
        className: "wd-15p borderrigth",
    },
    {
        Header: "Name",
        accessor: "Name",
        className: "wd-15p borderrigth",
    },
    {
        Header: "Email",
        accessor: "Email",
        className: "wd-15p borderrigth",
    },
    {
        Header: "Gender",
        accessor: "Gender",
        className: "wd-15p borderrigth",
    },
    {
        Header: "Status",
        accessor: "Status",
        className: "wd-15p borderrigth",
    }, {
        Header: "Housing",
        accessor: "Housing",
        className: "wd-15p borderrigth",
    }, {
        Header: "Internal Notes",
        accessor: "InternalNotes",
        className: "wd-15p borderrigth",
    },
];
export const DATATABLE = [
    {
        Id: "1",
        SNo: "1",
        AttendeeID: "2001",
        Name: "TBD,TBD",
        Email: "TBD",
        Gender: "TBD",
        Status: "Registered",
        Housing: "Sol de Oriente, Peninsula de las Estrellas",
        InternalNotes: " "
    },
    {
        Id: "2",
        SNo: "2",
        AttendeeID: "2001",
        Name: "TBD,TBD",
        Email: "TBD",
        Gender: "TBD",
        Status: "Registered",
        Housing: "Sol de Oriente, Peninsula de las Estrellas",
        InternalNotes: " "
    }, {
        Id: "3",
        SNo: "3",
        AttendeeID: "2001",
        Name: "TBD,TBD",
        Email: "TBD",
        Gender: "TBD",
        Status: "Registered",
        Housing: "Sol de Oriente, Peninsula de las Estrellas",
        InternalNotes: " "
    }, {
        Id: "4",
        SNo: "4",
        AttendeeID: "2001",
        Name: "TBD,TBD",
        Email: "TBD",
        Gender: "TBD",
        Status: "Registered",
        Housing: "Sol de Oriente, Peninsula de las Estrellas",
        InternalNotes: " "
    },
];
const AttendeesList = () => {
    const [validatedCustom, setValidatedCustom] = useState(false);
    const handleSubmitCustom = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        setValidatedCustom(true);
    };

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



    const [Default, setDefault] = useState("");

    const handleOnchangedefault = () => {
        setDefault(Default);
    };
    const optiondefault = [
        { label: 'All Statuses', value: 'All Statuses' },
        { label: 'Registration Started', value: 'Registration Started' },
        { label: 'Pending CC Approval', value: 'Pending CC Approval' },
        { label: 'Registered', value: 'Registered' },

        // Add more options as needed
    ];











    return (
        <>
            <Seo title={"Attendees List"} />
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">Attendees List</span>
                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            attendeeslist
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>
            <div className="left-content mt-2">

                <Row className="row-sm mt-4">
                    <Col xl={12}>
                        <Card>
                            <Card.Header className=" pb-0">

                                <CForm
                                    className="row g-3 needs-validation"
                                    noValidate
                                    validated={validatedCustom}
                                    onSubmit={handleSubmitCustom}
                                >
                                    <CCol md={3}>
                                        <CFormLabel htmlFor="validationDefault04">Status</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="--1">Registration Started</option>
                                            <option value="0">Pending CC Approval</option>
                                            <option value="1">Registered</option>


                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Status.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3} className="mt-5">
                                        <CButton color="primary" style={{ marginBottom: "36px" }} type="submit">
                                            Submit
                                        </CButton>
                                    </CCol>

                                </CForm>

                            </Card.Header>

                        </Card>
                    </Col>
                </Row>
            </div>


            <div class="evnt-mngr-tbl">
            <table {...getTableProps()} className="table table-hover mb-0">
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


AttendeesList.layout = "Contentlayout"
export default AttendeesList



