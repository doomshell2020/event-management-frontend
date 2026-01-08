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
    Form
} from "react-bootstrap";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import api from "@/utils/api";
import Swal from "sweetalert2";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
export const SeoManager = () => {

    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            style: { width: "5%", textAlign: "center" },
        },
        {
            Header: "Page Name",
            accessor: "pageName",
            style: { width: "15%" },
            Cell: ({ row }) => {
                return (
                    <div>
                       {row.original.page || ""} 
                    </div>
                );
            },
        },
        {
            Header: "Page Location",
            accessor: "location",
            style: { width: "15%" },
            Cell: ({ row }) => {
                return (
                    <Link
                        href={row.original.location}
                        target="_blank"
                        style={{
                            display: "block",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            color: "#0d6efd",
                            textDecoration: "underline",
                        }}
                    >
                        {row.original.location}
                    </Link>
                );
            },
        },
        {
            Header: "Title",
            accessor: "DateAndTime",
            style: { width: "25%" },
            Cell: ({ row }) => {
                return (
                    <div>
                        {row.original.title
                            ? `${row.original.title || ""} ${row.original.title || ""}`.trim()
                            : "---"}
                    </div>

                );
            },
        },
        {
            Header: "Description",
            accessor: "Description",
            style: { width: "15%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.description || "---"}
                </div>
            ),
        },
        {
            Header: "Keywords",
            accessor: "keywords",
            style: { width: "10%", textAlign: "center" },
            Cell: ({ row }) => (
                <div>
                    {row.original.keyword || "---"}
                </div>
            ),
        },
        {
            Header: "Action",
            accessor: "action",
            style: { width: "15%" },
            Cell: ({ row }) => {
                const { id, status } = row.original;
                return (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <div className="form-check form-switch d-flex justify-content-center">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{ cursor: "pointer" }}
                                checked={status === "Y"}
                                onChange={() => handleStatusToggle(id, status)}
                            />
                        </div>
                        <button
                            className="btn btn-sm"
                            style={{ backgroundColor: "#20c997", color: "white" }}
                            onClick={() => handleEdit(id)}
                        >
                            <i className="bi bi-pencil-square"></i>
                        </button>


                    </div>
                );
            },
        },
    ]);
    const [seoList, setSeoList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const getSeoList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/v1/admin/seo");
            setSeoList(data?.data?.seo || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getSeoList();
    }, []);
    let navigate = useRouter();
    const handleEdit = (id) => {
        navigate.push(`/admin/seo/${id}`);
    };
    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === "Y" ? "N" : "Y";
        const statusText = newStatus === "Y" ? "Activate" : "Deactivate";

        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${statusText} this Seo?`,
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
                title: "Updating Seo status...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            await api.put(`/api/v1/admin/seo/update-status/${id}`, {
                status: newStatus,
            });
            getSeoList();
            Swal.fire({
                icon: "success",
                title: "Success",
                text: `Seo Status updated successfully`,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Status update failed", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Unable to update status. Please try again.",
            });
        }
    };
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: seoList,
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


    return (
        <div>
            <Seo title={"Seo Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Seo Manager</h4>
                                <Link
                                    className="btn ripple btn-info btn-sm"
                                    href="/admin/seo/create"
                                >
                                    + ADD
                                </Link>
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
                                                            style={column.style}
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
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
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

SeoManager.layout = "Contentlayout";

export default SeoManager;
