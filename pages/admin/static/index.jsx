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

export const StaticList = () => {
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
            Header: "Description",
            accessor: "descr",
            className: "borderrigth",
            Cell: ({ row }) => {
                const text = stripHtml(row.original.descr);
                return (
                    <div title={text}>
                        {text.length > 80 ? text.slice(0, 80) + "..." : text}
                    </div>
                );
            },
        },


        {
            Header: "Actions",
            accessor: "actions",
            className: "borderrigth",
            Cell: ({ row }) => {
                const { id, status } = row.original;

                return (
                    <div className="d-flex flex-column align-items-center gap-1">
                        <div className="d-flex align-items-center gap-2">

                            {/* Edit Button */}
                            <button
                                className="btn btn-sm d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "#20c997", color: "white" }}
                                type="button"
                                onClick={() => handleEdit(row.original.id)}
                                title="Edit"
                            >
                                <i className="bi bi-pencil-square"></i>
                            </button>

                            {/* Delete Button */}
                            <button
                                className="btn btn-sm d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "#eb0f0fff", color: "white" }}
                                type="button"
                                onClick={() => handleDeleteEvent(id)}
                                title="Delete"
                            >
                                <i className="bi bi-trash-fill"></i>
                            </button>

                        </div>
                    </div>

                );
            },
        },
    ]);

    const stripHtml = (html = "") => {
        if (!html) return "---";
        return html.replace(/<[^>]*>?/gm, '').trim();
    };

    let navigate = useRouter();
    const [staticPage, setStaticPage] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // services/static.service.js
    const getStaticPageList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/v1/admin/static");
            setStaticPage(data?.data?.static || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getStaticPageList();
    }, []);
    const handleDeleteEvent = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this static page?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Deleting page...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // API call to delete event
            await api.delete(`/api/v1/admin/static/${id}`);
            getStaticPageList(); // refresh the table after deletion
            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Static page deleted successfully.",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Static page deletion failed", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Unable to delete the static page. Please try again.",
            });
        }
    };


    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: staticPage,
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
        navigate.push(`/admin/static/${id}`);
    };

    return (
        <div>
            <Seo title={"Static Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Static Manager</h4>
                                <div>


                                    <Link
                                        className="btn ripple btn-info btn-sm"
                                        href="/admin/static/create"
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

StaticList.layout = "Contentlayout";

export default StaticList;
