import React, { useState, useEffect } from "react";
import {
    Modal,
    Card,
    Col,
    Row,
    Button,
    Spinner,
    Alert,
    Collapse,
} from "react-bootstrap";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import axios from "axios";
import Link from "next/link";
import api from "@/utils/api";
import Moment from "react-moment";
import Swal from "sweetalert2";

import { useRouter } from "next/router";

export const EmailTemplatesList = () => {
    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "Title",
            accessor: "title",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span>{row.original.title}</span></div>
            ),
        },

        {
            Header: "Subject",
            accessor: "subject",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.subject ? row.original.subject : "---"}
                </div>
            ),
        },
        {
            Header: "Created",
            accessor: "created",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    <Moment format="DD MMM YYYY">
                        {row.original.createdAt}
                    </Moment>
                </div>
            ),
        },
        {
            Header: "Format",
            accessor: "format",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div className="d-flex justify-content-center">

                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewTemplate(row.original)}
                    >
                        View Template
                    </button>
                </div>
            ),
        },
        {
            Header: "Action",
            accessor: "action",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {/* Edit Button */}
                    <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "#20c997", color: "white" }}
                        type="button"
                        onClick={() => handleEdit(row.original.id)}
                    >
                        <i className="bi bi-pencil-square"></i>
                    </button></div>
            ),
        },
    ]);
    const [showModal, setShowModal] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const handleViewTemplate = (rowData) => {
        // console.log("Template data:", rowData);
        setSelectedTemplate(rowData.description)
        setSelectedSubject(rowData.subject)
        setShowModal(true);
    };
    let navigate = useRouter();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const getEmailTemplates = async () => {
        const { data } = await api.get("/api/v1/admin/email-templates");
        return data?.data?.templates || [];
    };
    useEffect(() => {
        setIsLoading(true);
        getEmailTemplates()
            .then(setTemplates)
            .catch(err =>
                console.error("Error fetching event organizers:", err)
            )
            .finally(() => setIsLoading(false));
    }, []);
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: templates,
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
    useEffect(() => { setPageSize(50) }, []);
    const handleEdit = (id) => {
        navigate.push(`/admin/email-templates/${id}`);
    };

    return (
        <div>
            <Seo title={"Email Templates Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Email Templates Manager</h4>
                                <div>


                                    <Link
                                        className="btn ripple btn-info btn-sm"
                                        href="/admin/email-templates/create"
                                    >
                                        + ADD
                                    </Link>
                                </div>
                            </div>
                        </Card.Header>

                        <div className="table-responsive mt-4">
                            {isLoading ? (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "33vh",
                                    }}
                                >
                                    <Spinner
                                        animation="border"
                                        role="status"
                                        variant="primary"
                                        style={{ width: "30px", height: "30px" }}
                                    >
                                        <span className="sr-only">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <table
                                    {...getTableProps()}
                                    className="table table-bordered table-hover mb-0 text-md-nowrap"
                                >
                                    <thead>
                                        <tr>

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
                                                    {/* <th>Actions</th> */}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page.map((row) => {
                                            prepareRow(row);
                                            const rowId = row.original.id; // Assuming `id` is present in row.original
                                            const rowData = row.original; // Assuming `id` is present in row.original
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
                                </table>
                            )}
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
                    </Card>
                </Col>
            </Row>
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
                scrollable

            >
                <Modal.Header closeButton>
                    <Modal.Title>
                      <strong>Subject: {selectedSubject}</strong>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    <div
                        className="p-2"
                        dangerouslySetInnerHTML={{
                            __html: selectedTemplate || "<p>No description available</p>",
                        }}
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => setShowModal(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

EmailTemplatesList.layout = "Contentlayout";

export default EmailTemplatesList;
