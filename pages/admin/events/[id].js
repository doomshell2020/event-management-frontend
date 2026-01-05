import React, { useState, useEffect } from "react";
import {
    Card,
    Col,
    Row,
    Button,
    Spinner,
} from "react-bootstrap";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import api from "@/utils/api";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Link from "next/link";
import { useRouter } from 'next/router';

export const EventTickets = () => {
    const router = useRouter();
    const { id } = router.query;
    const [eventList, setEventList] = useState([]);
    const [currencyName, setCurrencyName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const COLUMNS = React.useMemo(() => [
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "Ticket Type",
            accessor: "TicketType",
            className: "borderrigth",
            Cell: ({ row }) => {
                return (
                    <div className="d-flex align-items-center gap-2">
                        <span>
                            {row?.original?.title} - {row?.original?.type}
                        </span>
                    </div>
                );
            },
        },
        {
            Header: "Quantity",
            accessor: "quantity",
            className: "borderrigth",
            Cell: ({ row }) => {
                return (
                    <div>
                        {row?.original?.count}
                    </div>
                );
            },
        },
        {
            Header: "Sold out",
            accessor: "soldOut",
            className: "borderrigth",
            Cell: ({ row }) => {
                return (
                    <div>
                        {row?.original?.sold_out === "Y" ? 1 : ""}
                    </div>
                );
            },
        },
        {
            Header: "Remaining Seats",
            accessor: "RemainingSeats",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.location ? row.original.location : "---"}
                </div>
            ),
        },
        {
            Header: "Price",
            accessor: "price",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {currencyName}{' '}{row.original.price ? row.original.price : "---"}
                </div>
            ),
        },
    ], [currencyName]);
    const getEventList = async (eventId) => {
        if (!eventId) return; // ✅ safety check

        try {
            setIsLoading(true);

            const { data } = await api.get(
                `/api/v1/admin/events/${eventId}/ticket-types`
            );
            const event = data?.data?.events?.[0];

            setEventList(event?.tickets || "");
            setCurrencyName(event?.currencyName?.Currency_symbol || "");
        } catch (err) {
            console.error("Error fetching event ticket types:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!router.isReady) return; // ✅ wait for router

        getEventList(id);
    }, [router.isReady, id]);

    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: eventList,
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
            <Seo title={"Event Detail"} />
            <Row className="row-sm mt-4">

                <Col xl={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Event Detail</h4>
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

EventTickets.layout = "Contentlayout";

export default EventTickets;
