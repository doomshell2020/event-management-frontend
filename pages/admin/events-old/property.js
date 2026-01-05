import { React, useState } from "react";
import { Button, Form, Modal, Table, Card, Row, Col, Breadcrumb } from "react-bootstrap";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import Seo from '@/shared/layout-components/seo/seo';
import { optiondefault } from "../../../shared/data/form/form-validation"

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
        className: "borderrigth",
    },
    {
        Header: "Availability",
        accessor: "Name",
        className: "borderrigth",

    },
    {
        Header: "Status",
        accessor: "Status",
        className: "borderrigth",
    },
    {
        Header: "Neighborhood",
        accessor: "Department",
        className: "wd-15p borderrigth",
    },
    {
        Header: "Property Name",
        accessor: "Property",
        className: "borderrigth",
        Cell: ({ row }) => (
            <div className=" ">
                {row.original.Almendra}<br />{row.original.Bedrooms}
            </div>
        ),
    },
    {
        Header: "Type",
        accessor: "Waiver",
        className: "borderrigth",
    },
    {
        Header: "Renter",
        accessor: "Renter",
        className: "borderrigth",
    }, {
        Header: "Actions",
        accessor: "Actions",
        className: "borderrigth",
    },
];
export const DATATABLE = [
    {
        Id: "1",
        SNo: "1",
        Name: "Allocated for Homeowner",
        Status: "Homeowner Coming",
        Department: "Casitas de las Flores",
        Almendra: <a href="#" className="badge rounded-pill bg-success rupam  border-0" > Almendra </a>,
        Bedrooms: "Bedrooms:1",
        Waiver: "Casita",
        Renter: <a href="#" className="badge rounded-pill bg-success kamal border-0" > Griffis, Eli </a>,
        Actions: <a className="btn btn-success editttt btn-sm"><i className="bi bi-pencil-square  pe-1"></i>Edit</a>
    },
    {
        Id: "2",
        SNo: "2",
        Name: "Available for Rent",
        Status: "Booked 100% Paid",
        Department: "Casitas de las Flores",
        Almendra: <a href="#" className="badge rounded-pill bg-success rupam  border-0" > Almendra </a>,
        Bedrooms: "Bedrooms:1",
        Waiver: "Casita",
        Renter: <a href="#" className="badge rounded-pill bg-success kamal border-0" > Griffis, Eli </a>,
        Actions: <a className="btn btn-success editttt btn-sm" ><i className="bi bi-pencil-square  pe-1"></i>Edit</a>
    },
];



const Property = () => {
    const [lgShow, setLgShow] = useState(false);
    const [lgShow2, setLgShow2] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [Default, setDefault] = useState("");
    const handleOnchangedefault = () => {
        setDefault(Default);
    };
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

    const handleClick = (e) => {
        const target = e.target.classList.contains('rupam');
        const target2 = e.target.classList.contains('kamal');
        const editModal = e.target.classList.contains('editttt');
        console.log(target2);
        console.log(target);
        console.log(editModal);
        if (target) {
            //     console.log('iff');
            viewDemoShow('lgShow');
        } else if (target2) {
            viewDemoShow2('lgShow2');
        } else if (editModal) {
            viewEditModal('editShow');
        }
    };

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


    let viewDemoShow = (modal) => {
        switch (modal) {
            case "Basic":
                setbasic(true)
                break;
            case "smShow":
                setSmShow(true)
                break;
            case "lgShow":
                setLgShow(true)
                break;
            case "gridshow":
                setGridshow(true)
                break;
            case "success":
                setSuccess(true)
                break;
            case "Error":
                setError(true)
                break;
            case "select":
                setSelect(true)
                break;
            case "Scroll":
                setScroll(true)
                break;
            // case "modalShow":
            //   setmodalShow(true)
            // break;
        }
    }
    let viewDemoClose = (modal) => {
        switch (modal) {
            case "Basic":
                setbasic(false)
                break;
            case "smShow":
                setSmShow(false)
                break;
            case "lgShow":
                setLgShow(false)
                break;
            case "gridshow":
                setGridshow(false)
                break;
            case "success":
                setSuccess(false)
                break;
            case "Error":
                setError(false)
                break;
            case "select":
                setSelect(false)
                break;
            case "Scroll":
                setScroll(false)
                break;
            // case "modalShow":
            //   setmodalShow(false)
            // break;
        }
    }
    // Second Modal popup open
    let viewDemoShow2 = (modal) => {
        switch (modal) {
            case "Basic":
                setbasic(true)
                break;
            case "smShow":
                setSmShow(true)
                break;
            case "lgShow2":
                setLgShow2(true)
                break;
            case "gridshow":
                setGridshow(true)
                break;
            case "success":
                setSuccess(true)
                break;
            case "Error":
                setError(true)
                break;
            case "select":
                setSelect(true)
                break;
            case "Scroll":
                setScroll(true)
                break;
            // case "modalShow":
            //   setmodalShow(true)
            // break;
        }
    }
    let viewDemoClose2 = (modal) => {
        switch (modal) {
            case "Basic":
                setbasic(false)
                break;
            case "smShow":
                setSmShow(false)
                break;
            case "lgShow2":
                setLgShow2(false)
                break;
            case "gridshow":
                setGridshow(false)
                break;
            case "success":
                setSuccess(false)
                break;
            case "Error":
                setError(false)
                break;
            case "select":
                setSelect(false)
                break;
            case "Scroll":
                setScroll(false)
                break;
            // case "modalShow":
            //   setmodalShow(false)
            // break;
        }
    }
    // Edit Modal popup
    let viewEditModal = (modal) => {
        switch (modal) {
            case "Basic":
                setbasic(true)
                break;
            case "smShow":
                setSmShow(true)
                break;
            case "editShow":
                setEditShow(true)
                break;
            case "gridshow":
                setGridshow(true)
                break;
            case "success":
                setSuccess(true)
                break;
            case "Error":
                setError(true)
                break;
            case "select":
                setSelect(true)
                break;
            case "Scroll":
                setScroll(true)
                break;
            // case "modalShow":
            //   setmodalShow(true)
            // break;
        }
    }
    let editShowClose = (modal) => {
        switch (modal) {
            case "Basic":
                setbasic(false)
                break;
            case "smShow":
                setSmShow(false)
                break;
            case "editShow":
                setEditShow(false)
                break;
            case "gridshow":
                setGridshow(false)
                break;
            case "success":
                setSuccess(false)
                break;
            case "Error":
                setError(false)
                break;
            case "select":
                setSelect(false)
                break;
            case "Scroll":
                setScroll(false)
                break;
            // case "modalShow":
            //   setmodalShow(false)
            // break;
        }
    }




    return (
        <>
            <Seo title={"Manage Property"} />
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">Manage Property</span>
                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Property
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>
            <div className="left-content mt-2">

                <Row className="row-sm mt-4">
                    <Col xl={12}>
                        <Card>
                            <Card.Header className="">
                                <div className="d-flex justify-content-between">
                                    <h4 className="card-title mg-b-0">Search Property</h4>
                                </div>
                            </Card.Header>
                            <Card.Body className="">
                                <CForm
                                    className="row g-3 needs-validation"
                                    noValidate
                                    validated={validatedCustom}
                                    onSubmit={handleSubmitCustom}
                                >
                                    <CCol md={3}>
                                        <CFormLabel htmlFor="validationDefault04">Bedrooms</CFormLabel>
                                        <MultiSelect
                                            className="farms"
                                            onChange={handleOnchangedefault}
                                            placeholder="--Select--"
                                            singleSelect="true"
                                            options={optiondefault}
                                        />
                                        <CFormFeedback invalid>Please provide a valid Bedrooms.</CFormFeedback>
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormLabel htmlFor="validationDefault04">Neighborhoods</CFormLabel>
                                        <MultiSelect
                                            className="farms"
                                            onChange={handleOnchangedefault}
                                            placeholder="--Select--"
                                            singleSelect="true"
                                            options={optiondefault}
                                        />
                                        <CFormFeedback invalid>Please provide a valid Neighborhoods.</CFormFeedback>
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormLabel htmlFor="validationDefault04">Types</CFormLabel>
                                        <MultiSelect
                                            className="farms"
                                            onChange={handleOnchangedefault}
                                            placeholder="--Select--"
                                            singleSelect="true"
                                            options={optiondefault}
                                        />
                                        <CFormFeedback invalid>Please provide a valid Types.</CFormFeedback>
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormLabel htmlFor="validationDefault04">Availabilities</CFormLabel>
                                        <MultiSelect
                                            className="farms"
                                            onChange={handleOnchangedefault}
                                            placeholder="--Select--"
                                            singleSelect="true"
                                            options={optiondefault}
                                        />
                                        <CFormFeedback invalid>Please provide a valid Availabilities.</CFormFeedback>
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormLabel htmlFor="validationDefault04">Statuses</CFormLabel>
                                        <MultiSelect
                                            className="farms"
                                            onChange={handleOnchangedefault}
                                            placeholder="--Select--"
                                            singleSelect="true"
                                            options={optiondefault}
                                        />
                                        <CFormFeedback invalid>Please provide a valid Statuses.</CFormFeedback>
                                    </CCol>

                                    <CCol md={3} className="d-flex align-items-end ">
                                        <CButton color="primary" type="submit" className="me-2">
                                            Submit
                                        </CButton>

                                        <CButton color="secondary" type="reset">
                                            Reset
                                        </CButton>
                                    </CCol>
                                </CForm>
                            </Card.Body>


                        </Card>
                    </Col>
                </Row>
            </div>


            <Col xl={12}>
                <Card>
                    <Card.Header className=" ">
                        <div className="d-flex justify-content-between">
                            <h4 className="card-title mg-b-0">Manage Properties</h4>
                        </div>
                    </Card.Header>
                    <Card.Body className="">

                        <table {...getTableProps()} className="table table-hover mb-0" onClick={handleClick}>
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

            {/* <Button
                onClick={() => viewDemoShow("lgShow")}
                className="btn ripple btn-info"
                variant=""
            >
                View Demo
            </Button> */}
            {/* 1st modal popup */}
            <Modal
                size="lg"
                show={lgShow}
                aria-labelledby="example-modal-sizes-title-sm"
            >
                <Modal.Header>
                    <Modal.Title>Almendra</Modal.Title>
                    <Button
                        variant=""
                        className="btn btn-close ms-auto"
                        onClick={() => { viewDemoClose("lgShow") }}
                    >
                        x
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"><b>Type :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0">Casita</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"> <b>Bedrooms :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0">1</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"><b>Beds :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0">1 King</p>
                                    </div>
                                </div>
                            </div>


                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"> <b>Max Occupancy :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0">2</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"><b>Pool :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0">No Pool</p>
                                    </div>
                                </div>
                            </div>


                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"> <b>House Manager Name :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"> Kim Kessler</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"><b>House Manager Email :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0">kim@kkpr.com</p>
                                    </div>
                                </div>
                            </div>


                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"> <b>Homeowner :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0">Kim Kessler</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"> <b>Renter :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0">--</p>
                                    </div>
                                </div>
                            </div>



                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0"><b>Ticketed Occupants :</b></p>
                                    </div>
                                    <div className="col-md-6 col-sm-12">
                                        <p className="m-0 text-danger">0/2</p>
                                    </div>
                                </div>
                            </div>



                            <div className="col-12 mb-3">
                                <div className="row">
                                    <div className="col-md-3 col-sm-12">
                                        <p className="m-0"> <b>Internal Notes :</b></p>
                                    </div>
                                    <div className="col-md-9 col-sm-12">
                                        <p className="m-0">Kim the HO is coming (also she is the PR for both Careyes and Ondalinda)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 mb-3">
                                <div className="row">
                                    <div className="col-md-3 col-sm-12">
                                        <p className="m-0"><b>Link :</b></p>
                                    </div>
                                    <div className="col-md-9 col-sm-12">
                                        <p className="m-0"><a href="https://www.ondalinda.com/events/careyes-housing.htm?housing=TVRjeA%3D%3D&amp;event=106">https://www.ondalinda.com/events/careyes-housing.htm?housing=TVRjeA%3D%3D&amp;event=106</a></p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 mb-3">
                                <div className="row">
                                    <div className="col-md-3 col-sm-12">
                                        <p className="m-0"><b>Nightly Price :</b></p>
                                    </div>
                                    <div className="col-md-9 col-sm-12">
                                        <div className="row">
                                            <div className="col-6">
                                                <p className="m-0">$275.00 USD Base Price</p>
                                                <p className="m-0 text-muted">Service fee :-</p>
                                                <p className="m-0 text-muted">Mexican VAT :-</p>
                                                <p className="m-0 text-muted">Accom Tax :-</p>
                                            </div>


                                            <div className="col-6">
                                                <p className="m-0">Subtotal before txn fees : 275.00</p>
                                                <p className="m-0 text-muted">Banking fees : 7.15 (2.6%)</p>
                                                <p className="m-0 text-muted">Stripe fee : 7.98 (2.9%)</p>
                                                <p className="m-0">Final Price : 290.13</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </Modal.Body>
            </Modal>

            {/* Second Popup */}
            <Modal
                size="lg"
                show={lgShow2}
                aria-labelledby="example-modal-sizes-title-sm"
            >
                <Modal.Header>
                    <Modal.Title>Guerrero, Eduardo
                    </Modal.Title>
                    <Button
                        variant=""
                        className="btn btn-close ms-auto"
                        onClick={() => { viewDemoClose2("lgShow2") }}
                    >
                        x
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-4">
                                <h6 className="mb-3" id="staticBackdropLabel5">Guerrero, Eduardo</h6>
                                <img src="https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png" alt="" className="bd-placeholder-img border border-primary border-1 p-2 rounded-pill" width="150px" />
                            </div>


                            <div className="col-md-8 mx-auto my-auto">
                                <div className="row">
                                    <div className="col-12 d-flex justify-content-end">
                                        <button type="button" className="btn btn-secondary btn-sm me-2 rounded-pill btn-wave">Log in As User</button>
                                        <button type="button" className="btn btn-success btn-sm rounded-pill btn-wave">See Full Profile</button>
                                    </div>
                                </div>

                                <h6 className="border-bottom py-2">Basic Information</h6>

                                <div className="row mt-3">
                                    <div className="col-sm-6">
                                        <p> <b>First Name:</b> -unspecified-</p>
                                        <p><b>Phone:</b> -unspecified-</p>
                                        <p><b>Gender:</b> -unspecified-</p>
                                    </div>

                                    <div className="col-sm-6">
                                        <p><b>Last Name:</b> -unspecified-</p>
                                        <p><b>Email:</b> stu@festforums.com</p>
                                        <p><b>Company:</b> -unspecified</p>


                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                            <h6 className="border-bottom py-2">System Information</h6>
                            <div className="row mt-3 mx-0">
                                <div className="col-md-4 pe-1 ">
                                    <p><b>Member ID:</b> 6400</p>
                                    <p><b>Membership Level:</b> Standard</p>
                                    <p><b>Comped:</b> No</p>
                                    <p><b>Internal Notes:</b> -none-</p>
                                </div>
                                <div className="col-md-4 ps-1">
                                    <p><b>Date:</b> 2022-06-01 06:34:57</p>
                                    <p><b>Founding Member: </b>No</p>
                                    <p><b>Filippo Referral: </b>No</p>
                                </div>
                                <div className="col-md-4 ps-1">
                                    <p><b>Status: Active</b></p>
                                    <p><b>Careyes Homeowner:</b> No</p>
                                    <p><b>Artist Type:</b></p>
                                </div>
                                <div className="col-sm-9 w-100 mx-2 bg-light border">
                                    <b>Events Attended:</b> This user has no invitation/registrations at this time
                                </div>
                            </div>
                        </div>

                    </div>

                </Modal.Body>

            </Modal>

            {/* Edit Modal popup */}
            <Modal
                size="lg"
                show={editShow}
                aria-labelledby="example-modal-sizes-title-sm"
            >
                <Modal.Header>
                    <Modal.Title>Edit Event Housing Availability
                    </Modal.Title>
                    <Button
                        variant=""
                        className="btn btn-close ms-auto"
                        onClick={() => { editShowClose("editShow") }}
                    >
                        x
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-3 col-sm-12">
                                        <p className="m-0"> <b>Event :</b></p>
                                    </div>
                                    <div className="col-md-9 col-sm-12">
                                        <p className="m-0">Ondalinda x Careyes 2023</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-3 col-sm-12">
                                        <p className="m-0"><b>Housing :</b></p>
                                    </div>
                                    <div className="col-md-9 col-sm-12">
                                        <p className="m-0">Casitas de las Flores, Almendra</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                <label for="inputnmber" className="form-label">Availability<span className="text-danger">*</span></label>
                                <select className="form-select" aria-label="Default select example">
                                    <option selected="">Allocated for Homeowner</option>
                                    <option selected="">Allocated for Homeowner</option>
                                    <option selected="">Allocated for Homeowner</option>
                                    <option selected="">Allocated for Homeowner</option>
                                    <option selected="">Allocated for Homeowner</option>
                                </select>
                            </div>


                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                <label for="inputnmber" className="form-label">Available From</label>
                                <input type="date" className="form-control" aria-label="dateofbirth" />
                            </div>

                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                <label for="inputnmber" className="form-label">Available To</label>
                                <input type="date" className="form-control" aria-label="dateofbirth" />
                            </div>


                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                <label for="inputnmber" className="form-label">Base Nightly Price $</label>
                                <input type="number" className="form-control" aria-label="dateofbirth" />
                            </div>


                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                <label for="inputnmber" className="form-label">Service Fee %</label>
                                <input type="number" className="form-control" aria-label="dateofbirth" />
                            </div>


                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                <label for="inputnmber" className="form-label">Base Nightly Price %</label>
                                <input type="number" className="form-control" aria-label="dateofbirth" />
                            </div>


                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                <label for="inputnmber" className="form-label">Base Nightly Price %</label>
                                <input type="number" className="form-control" aria-label="dateofbirth" />
                            </div>


                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                <label for="inputnmber" className="form-label">Internal Notes</label>
                                <input type="text" className="form-control" aria-label="dateofbirth" />
                            </div>



                            <div className="col-lg-6 col-md-12 col-sm-12 mb-3 d-flex">
                                <a href="" className="btn btn-secondary my-2 w-100 me-2 ">Save</a>
                                <a href="" data-bs-dismiss="modal" className="btn btn-dark op-5 my-2 w-100 ">Cancel</a>
                            </div>


                        </div>
                    </div>

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

Property.layout = "Contentlayout"
export default Property



