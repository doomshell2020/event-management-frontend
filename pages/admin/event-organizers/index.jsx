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

export const EventOrganizersList = () => {
    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "Name",
            accessor: "title",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span>{row.original.first_name}</span></div>
            ),
        },

        {
            Header: "Email",
            accessor: "eventName",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.email ? row.original.email : "---"}
                </div>
            ),
        },
        {
            Header: "Mobile",
            accessor: "mobile",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.mobile ? row.original.mobile : "---"}
                </div>
            ),
        },
        {
            Header: "Status",
            accessor: "status",
            className: "borderrigth",
            Cell: ({ row }) => {
                const { id, status } = row.original;
                return (
                    <div className="form-check form-switch d-flex justify-content-center">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            style={{ cursor: "pointer" }}
                            checked={status === "Y"}
                            onChange={() => handleStatusToggle(id, status)}
                        />
                    </div>
                );
            },
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


    let navigate = useRouter();
    const [OrganizerList, setOrganizerList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Alert messages
    const [openAlert, setOpenAlert] = useState(false);
    const [staticAdded, setStaticAdded] = useState("");

    var StaticMessage = "";
    useEffect(() => {
        if (typeof window !== "undefined") {
            var StaticMessage = localStorage.getItem("staticAdded");

            if (StaticMessage != null && StaticMessage !== "") {
                setOpenAlert(true);
                setStaticAdded(StaticMessage);
                setTimeout(() => {
                    localStorage.setItem("staticAdded", "");
                    setOpenAlert(false);
                }, 5000);
            } else {
                setOpenAlert(false);
                setStaticAdded("");
            }
        }
    }, [StaticMessage]);
    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === "Y" ? "N" : "Y";
        const statusText = newStatus === "Y" ? "Activate" : "Deactivate";

        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${statusText} this Event Organizer?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Yes, ${statusText}`,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#20c997",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        // Optimistic UI update
        setOrganizerList(prev =>
            prev.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            )
        );

        try {
            Swal.fire({
                title: "Updating status...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            await api.put(`/api/v1/admin/event-organizer/update-status/${id}`, {
                status: newStatus,
            });

            Swal.fire({
                icon: "success",
                title: "Success",
                text: `Status updated successfully`,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Status update failed", error);

            // rollback
            setOrganizerList(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, status: currentStatus } : item
                )
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Unable to update status. Please try again.",
            });
        }
    };
    const getEventOrganizers = async () => {
        const { data } = await api.get("/api/v1/admin/event-organizer");
        return data?.data?.eventOrganizers || [];
    };
    useEffect(() => {
        setIsLoading(true);
        getEventOrganizers()
            .then(setOrganizerList)
            .catch(err =>
                console.error("Error fetching event organizers:", err)
            )
            .finally(() => setIsLoading(false));
    }, []);
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: OrganizerList,
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
        navigate.push(`/admin/event-organizers/${id}`);
    };

    return (
        <div>
            <Seo title={"Event Organizer Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <Card>
                        {staticAdded != null && openAlert === true && (
                            <Collapse in={openAlert}>
                                <Alert aria-hidden={true} severity="success">
                                    {staticAdded}
                                </Alert>
                            </Collapse>
                        )}

                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Event Organizer Manager</h4>
                                <div>


                                    <Link
                                        className="btn ripple btn-info btn-sm"
                                        href="/admin/event-organizers/create"
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
        </div>
    );
};

EventOrganizersList.layout = "Contentlayout";

export default EventOrganizersList;
