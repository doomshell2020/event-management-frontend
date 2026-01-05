import React, { useState, useEffect } from "react";
import {
    Card,
    Col,
    Row,
    Button,
    Spinner,
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";


export const OrdersList = () => {
    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "Order Date",
            accessor: "OrderDate",
            className: "borderrigth",
            Cell: ({ row }) => {
                const createdDate = row.original.created;
                return (
                    <div className="d-flex align-items-center gap-2">
                        <span>
                            {createdDate
                                ? moment(createdDate).format("DD MMM, YYYY hh:mm A")
                                : "---"}
                        </span>
                    </div>
                );
            },
        },
        {
            Header: "Order Details",
            accessor: "OrderDetails",
            className: "borderrigth",
            Cell: ({ row }) => {
                return (
                    <div>
                        <div>
                            <strong>OrderIdentifier : </strong>
                            {row.original.RRN ? row.original.RRN : "-"}
                        </div>
                    </div>
                );
            },
        },

        {
            Header: "Event",
            accessor: "event",
            className: "borderrigth",
            Cell: ({ row }) => {
                const eventName = row.original.event;
                return (
                    <div>
                        <div>
                            {eventName?.name ? eventName?.name : "-"}
                        </div>
                    </div>
                );
            },
        },

        {
            Header: "Customer",
            accessor: "customer",
            className: "borderrigth",
            Cell: ({ row }) => {
                const user = row.original.user;

                if (!user) return <span>-</span>;

                const fullName =
                    [user.first_name, user.last_name].filter(Boolean).join(" ");

                return (
                    <div>
                        <div>{fullName || "-"}</div>
                        {user.mobile || "-"}
                    </div>
                );
            },
        },

        {
            Header: "Qty.",
            accessor: "qty",
            className: "borderrigth",
            Cell: ({ row }) => {
                const items = row.original.orderItems || [];

                const totalQty = items.reduce(
                    (sum, item) => sum + (item.count || 0),
                    0
                );

                return (
                    <div>
                        {totalQty || "-"}
                    </div>
                );
            },
        },

        {
            Header: "Customer Pay",
            accessor: "CustomerPay",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {formatCurrencyAmount(row.original, "sub_total")}
                </div>
            ),
        },
        {
            Header: "Admin Commission",
            accessor: "Commission",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {formatCurrencyAmount(row.original, "tax_total")}
                </div>
            ),
        },


    ]);
    const formatCurrencyAmount = (row, key) => {
        const symbol = row?.event?.currencyName?.Currency_symbol || "";
        const amount = row?.[key];

        if (!amount) return "-";

        return `${symbol} ${Number(amount).toLocaleString("en-IN")}`;
    };
    const [orderList, setOrdersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [event, setEvent] = useState("");
    const [customer, setCustomer] = useState("");

    const getOrdersList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/v1/admin/orders");
            setOrdersList(data?.data?.orders || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getOrdersList();
    }, []);
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: orderList,
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

    const formatDate = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            // Format dates as YYYY-MM-DD for API
            const formattedFromDate = formatDate(fromDate);
            const formattedToDate = formatDate(toDate);
            const response = await api.get("/api/v1/admin/orders/search", {
                params: {
                    customer,
                    event,
                    orderFrom: formattedFromDate,
                    orderTo: formattedToDate,
                },
            });

            // console.log("0-response.data", response?.data?.data?.events)
            setOrdersList(response?.data?.data?.orders); // Save API results in state
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrdersList([]);
        }
    };

    const handleReset = () => {
        setEvent("");
        setCustomer("");
        setFromDate(null);
        setToDate(null);
        setOrdersList([]);
        getOrdersList();
    };

    const pageTotals = React.useMemo(() => {
        return page.reduce(
            (acc, row) => {
                acc.subTotal += Number(row.original.sub_total || 0);
                acc.taxTotal += Number(row.original.tax_total || 0);
                return acc;
            },
            { subTotal: 0, taxTotal: 0 }
        );
    }, [page]);
    const formatCurrency = (amount) => {
        return `${Number(amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };





    return (
        <div>
            <Seo title={"Order Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={2}>
                    <Card className="member-fltr-hid">
                        <Card.Header>
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Filters</h4>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-2">
                            <Form onSubmit={handleSearch}>

                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Customer</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Customer"
                                        value={customer}
                                        onChange={(e) => setCustomer(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Event</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Event Name"
                                        value={event}
                                        onChange={(e) => setEvent(e.target.value)}

                                    />
                                </Form.Group>



                                <Form.Group className="mb-3" controlId="formDateFrom">
                                    <Form.Label>Order From</Form.Label>
                                    <div style={{ width: "127%" }}>
                                        <DatePicker
                                            selected={fromDate}
                                            onChange={(date) => {
                                                setFromDate(date);

                                                // Reset To Date if it is smaller than From Date
                                                if (toDate && date && toDate < date) {
                                                    setToDate(null);
                                                }
                                            }}
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="DD-MM-YY"
                                            className="form-control"
                                            wrapperClassName="w-100"
                                            maxDate={toDate || null}   // optional (UX improvement)
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formDateTo">
                                    <Form.Label>Order To</Form.Label>
                                    <div style={{ width: "127%" }}>
                                        <DatePicker
                                            selected={toDate}
                                            onChange={(date) => setToDate(date)}
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="DD-MM-YY"
                                            className="form-control"
                                            wrapperClassName="w-100"
                                            disabled={!fromDate}      // ✅ Disable until From Date selected
                                            minDate={fromDate}        // ✅ Cannot select smaller date
                                        />
                                    </div>
                                </Form.Group>


                                <div className="d-flex align-items-end justify-content-between">
                                    <Button
                                        variant="primary "
                                        className="me-2 w-50"
                                        type="submit"
                                    >
                                        Submit
                                    </Button>
                                    <Button variant="secondary" className="w-50" type="reset" onClick={handleReset}>
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
                                <h4 className="card-title mg-b-0">Order Manager</h4>

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
                                         {/* TOTAL ROW */}
                                        <tr style={{ fontWeight: "bold", background: "#f8f9fa" }}>
                                            <td colSpan={6} className="text-end">
                                                Total Amount :
                                            </td>
                                            <td>
                                                {formatCurrency(pageTotals.subTotal)}
                                            </td>
                                            <td>
                                                {formatCurrency(pageTotals.taxTotal)}
                                            </td>
                                        </tr>
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

OrdersList.layout = "Contentlayout";

export default OrdersList;
