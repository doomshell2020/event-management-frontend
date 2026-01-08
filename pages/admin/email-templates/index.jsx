import React, { useState, useEffect } from "react";
import {
    Modal,
    Card,
    Col,
    Row,
    Button,
    Spinner,
    Form,
    Alert,
    Collapse,
} from "react-bootstrap";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import { CCol, CFormLabel, CFormInput } from "@coreui/react";
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
            style: { width: "10%" },
        },
        {
            Header: "Title",
            accessor: "title",
            className: "borderrigth",
            style: { width: "20%" },
            Cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span>{row.original.title}</span>

                    <button
                        type="button"
                        onClick={() => handleViewTemplate(row.original)}
                        className="btn btn-link p-0 m-0"
                        style={{ color: "#136fc0ff", background: "transparent", border: "none" }}
                        title="View Template"
                    >
                        <i className="bi bi-eye-fill"></i>
                        {/* <i className="bi bi-box-arrow-up-right"></i> */}
                    </button>
                </div>
            ),
        },
        {
            Header: "Event Name",
            accessor: "eventName",
            className: "borderrigth",
            style: { width: "25%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.events ? row.original?.events?.name : "---"}
                </div>
            ),
        },
        {
            Header: "Subject",
            accessor: "subject",
            className: "borderrigth",
            style: { width: "25%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.subject ? row.original.subject : "---"}
                </div>
            ),
        },

        {
            Header: "Action",
            accessor: "action",
            className: "borderrigth",
            style: { width: "20%" },
            Cell: ({ row }) => {
                const { id, status } = row.original;

                const isDraft = status === "N";
                const isPublished = status === "Y";

                return (
                    <div className="d-flex align-items-center gap-2  justify-content-center">
                        {/* Draft / Published Toggle */}
                        {isDraft && (
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                type="button"
                                onClick={() => handleStatusToggle(id, status)}
                                title="This page is in draft — click to publish"
                            >
                                <i className="bi bi-file-earmark-text me-1"></i>
                                In Draft
                            </button>
                        )}

                        {isPublished && (
                            <button
                                className="btn btn-sm btn-success"
                                type="button"
                                onClick={() => handleStatusToggle(id, status)}
                                title="Click to unpublish this page"
                            >
                                Published
                            </button>
                        )}

                        {/* Edit Button */}
                        <button
                            className="btn btn-sm"
                            style={{ backgroundColor: "#20c997", color: "white" }}
                            type="button"
                            onClick={() => handleEdit(id)}
                            title="Edit"
                        >
                            <i className="bi bi-pencil-square"></i>
                        </button>

                        {/* Send Test Email Button */}
                        <button
                            className="btn btn-sm"
                            style={{ backgroundColor: "#008000", color: "white" }}
                            type="button"
                            title="Send Test Email"
                            onClick={() => sendTestEmail(id)}
                        >
                            <i className="fas fa-envelope"></i>
                        </button>
                    </div>
                );
            },
        }
    ]);


    const sendTestEmail = async (templateId) => {
    const { value: email, isConfirmed } = await Swal.fire({
        title: "Send Test Email",
        input: "email",
        inputLabel: "Enter recipient email address",
        inputPlaceholder: "someone@example.com",
        showCancelButton: true,
        confirmButtonText: "Send Email",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
            if (!value) return "Email is required!";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return "Please enter a valid email address!";
            }
            return null;
        },
    });

    if (!isConfirmed || !email) return;

    // 🔄 Loading popup
    Swal.fire({
        title: "Sending...",
        text: "Please wait while we send the test email.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
    });

    try {
        const payload = {
            template_id: templateId,
            email: email,
        };
        const res = await api.post( "/api/v1/admin/email-templates/send-test-email",payload);
        Swal.fire({
            title: "Success!",
            text: res.data?.message || "Test email sent successfully.",
            icon: "success",
        });
    } catch (err) {
        Swal.fire({
            title: "Error!",
            text:
                err?.response?.data?.message ||
                "Failed to send test email.",
            icon: "error",
        });
    }
};


    const [title, setTitle] = useState("");
    const [showModal, setShowModal] = useState(false);
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
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    // console.log("object",events)
    const [isLoading, setIsLoading] = useState(true);
    // services/static.service.js
    const getEmailTemplates = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/v1/admin/email-templates");
            setTemplates(data?.data.templates || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getEvents = async () => {
        try {
            const { data } = await api.get("/api/v1/admin/email-templates/events");
            setEvents(data?.data.events || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        }
    };


    useEffect(() => {
        getEmailTemplates();
        getEvents();
    }, []);


    // publish / unpublish page status
    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === "Y" ? "N" : "Y";
        const statusText = newStatus === "Y" ? "Publish" : "Unpublish";

        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Do you want to ${statusText} this email template?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Yes, ${statusText}`,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#20c997",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Updating template status...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            await api.put(`/api/v1/admin/email-templates/update-status/${id}`, {
                status: newStatus,
            });

            getEmailTemplates();

            Swal.fire({
                icon: "success",
                title: "Success",
                text: `Email Template ${statusText.toLowerCase()}ed successfully`,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Status update failed", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Unable to update page status. Please try again.",
            });
        }
    };



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

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await api.get("/api/v1/admin/email-templates/search", {
                params: {
                    title: title,
                    eventId: selectedEvent
                },
            });
            setTemplates(response?.data?.data?.templates); // Save API results in state
        } catch (error) {
            console.error("Error fetching events:", error);
            setTemplates([]);
        }
    };

    const handleReset = () => {
        setTitle("");
        setSelectedEvent("");
        setTemplates([]);
        getEmailTemplates();
    };




    return (
        <div>
            <Seo title={"Email Templates Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={2}>
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Filters</h4>
                            </div>
                        </Card.Header>
                        <Card.Body className="">
                            <Form onSubmit={handleSearch} onReset={handleReset}>
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault04">Event</CFormLabel>
                                    <Form.Select
                                        aria-label="Default select example"
                                        className="admn-slct"
                                        value={selectedEvent}
                                        onChange={(e) => setSelectedEvent(e.target.value)}
                                    >
                                        <option value="">--Select-Event--</option>
                                        {events &&
                                            events.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                    </Form.Select>

                                    <CFormLabel htmlFor="validationDefault01">Title</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </CCol>
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
                    {/* <Button
                        variant=""
                        className="btn btn-close ms-auto"
                        onClick={() => setShowModal(false)}
                    >
                        x
                    </Button> */}
                </Modal.Header>
                <Modal.Body>
                    <div
                        className="p-2"
                        dangerouslySetInnerHTML={{
                            __html: selectedTemplate || "<p>No description available</p>",
                        }}
                    />
                </Modal.Body>
            </Modal>

        </div>
    );
};

EmailTemplatesList.layout = "Contentlayout";

export default EmailTemplatesList;
