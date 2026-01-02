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

export const CustomerList = () => {
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
            Header: "Total Spends",
            accessor: "totalSpends",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                   {Number(row.original.total_spent || 0).toLocaleString('en-IN')}
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
                    <div className="d-flex align-items-center justify-content-center gap-3">

                        {/* Status Switch */}
                        <div className="form-check form-switch m-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{ cursor: "pointer" }}
                                checked={status === "Y"}
                                onChange={() => handleStatusToggle(id, status)}
                            />
                        </div>

                        {/* Resend Button */}
                        {/* <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSendEmail(row.original.id)}
                        >
                            Resend Verification Email
                        </button> */}

                    </div>
                );
            },
        }

        // {
        //     Header: "Action",
        //     accessor: "action",
        //     className: "borderrigth",
        //     Cell: ({ row }) => (
        //         <div
        //             style={{
        //                 display: "flex",
        //                 gap: "8px",
        //                 justifyContent: "center",
        //                 alignItems: "center",
        //             }}
        //         >
        //             {/* Edit Button */}
        //             <button
        //                 className="btn btn-sm"
        //                 style={{ backgroundColor: "#20c997", color: "white" }}
        //                 type="button"
        //                 onClick={() => handleEdit(row.original.id)}
        //             >
        //                 <i className="bi bi-pencil-square"></i>
        //             </button></div>
        //     ),
        // },
    ]);


    let navigate = useRouter();
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // const handleSendEmail = async (id) => {
    //     const result = await Swal.fire({
    //         title: "Are you sure?",
    //         text: "Do you want to resend the verification email to this customer?",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonText: "Yes, Send Email",
    //         cancelButtonText: "Cancel",
    //         confirmButtonColor: "#20c997",
    //         reverseButtons: true,
    //     });

    //     // If user clicks Cancel
    //     if (!result.isConfirmed) return;

    //     try {
    //         Swal.fire({
    //             title: "Sending email...",
    //             text: "Please wait",
    //             allowOutsideClick: false,
    //             allowEscapeKey: false,
    //             didOpen: () => {
    //                 Swal.showLoading();
    //             },
    //         });

    //         await api.post(`/api/v1/admin/customers/resend-verification-email/${id}`);

    //         Swal.fire({
    //             icon: "success",
    //             title: "Email Sent",
    //             text: "Verification email has been sent successfully.",
    //             timer: 1500,
    //             showConfirmButton: false,
    //         });
    //     } catch (error) {
    //         console.error("Email sending failed", error);

    //         Swal.fire({
    //             icon: "error",
    //             title: "Failed",
    //             text: "Unable to send verification email. Please try again.",
    //         });
    //     }
    // };





    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === "Y" ? "N" : "Y";
        const statusText = newStatus === "Y" ? "Activate" : "Deactivate";
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${statusText} this Customer?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Yes, ${statusText}`,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#20c997",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        // Optimistic UI update
        setCustomers(prev =>
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

            await api.put(`/api/v1/admin/customers/update-status/${id}`, {
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
            setCustomers(prev =>
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
    const getCustomers = async () => {
        const { data } = await api.get("/api/v1/admin/customers");
        return data?.data?.customers || [];
    };
    useEffect(() => {
        setIsLoading(true);
        getCustomers()
            .then(setCustomers)
            .catch(err =>
                console.error("Error fetching event organizers:", err)
            )
            .finally(() => setIsLoading(false));
    }, []);
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: customers,
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
            <Seo title={"Customer Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Customer Manager</h4>
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

CustomerList.layout = "Contentlayout";

export default CustomerList;
