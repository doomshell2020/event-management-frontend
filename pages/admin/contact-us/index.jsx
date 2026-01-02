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

export const ContactUsList = () => {
    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            style: { width: "7%" },
            className: "borderrigth",
        },
        {
            Header: "Date",
            accessor: "date",
            className: "borderrigth",
            style: { width: "13%" },
            Cell: ({ row }) => (
                <div>
                    <Moment format="DD-MMM-YYYY">
                        {row.original.createdAt}
                    </Moment></div>
            ),
        },

        {
            Header: "Name",
            accessor: "title",
            className: "borderrigth",
            style: { width: "30%" },
            Cell: ({ row }) => (
                <div >
                    <span>{row.original.name}</span></div>
            ),
        },

        {
            Header: "Email",
            accessor: "eventName",
            className: "borderrigth",
            style: { width: "20%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.email ? row.original.email : "---"}
                </div>
            ),
        },
        {
            Header: "Subject",
            accessor: "subject",
            className: "borderrigth",
            style: { width: "15%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.subject ? row.original.subject : "---"}
                </div>
            ),
        },
        {
            Header: "Event",
            accessor: "event",
            className: "borderrigth",
            style: { width: "15%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.event ? row.original.event : "---"}
                </div>
            ),
        },
        // {
        //     Header: "Description",
        //     accessor: "description",
        //     className: "borderrigth",
        //     Cell: ({ row }) => (
        //         <div>
        //             {row.original.description ? row.original.description : "---"}
        //         </div>
        //     ),
        // },
    ]);


    let navigate = useRouter();
    const [contactUs, setContactUs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const getContactUs = async () => {
        const { data } = await api.get("/api/v1/admin/contact-us");
        return data?.data?.contacts || [];
    };
    useEffect(() => {
        setIsLoading(true);
        getContactUs()
            .then(setContactUs)
            .catch(err =>
                console.error("Error fetching event organizers:", err)
            )
            .finally(() => setIsLoading(false));
    }, []);
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: contactUs,
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
            <Seo title={"Contact Us Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Contact Us Manager</h4>
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
                                    className="table table-bordered table-hover mb-0"
                                    style={{ tableLayout: "fixed" }}

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

ContactUsList.layout = "Contentlayout";

export default ContactUsList;
