import React, { useState, useEffect } from "react";
import {
    Card,
    Col,
    Row,
    Button,
    Spinner,
    Form
} from "react-bootstrap";
import { useRouter } from "next/router";
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
import AsyncSelect from "react-select/async";

export const OrdersByEvent = () => {
    const router = useRouter();
    const { event_id } = router.query;
    // console.log("event_id",event_id)
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
                const { paymenttype, RRN } = row.original;

                // 👇 FREE order case
                if (paymenttype === "free") {
                    return (
                        <span
                            className="badge ms-2"
                            style={{
                                backgroundColor: "#28a745",
                                color: "#fff",
                                fontSize: "12px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontWeight: 600,
                            }}
                        >
                            Free Ticket
                        </span>
                    );
                }

                // 👇 Paid / other cases
                return (
                    <div>
                        <strong>Order Identifier: </strong>
                        {RRN || "-"}
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
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const getOrdersList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/api/v1/admin/orders/${event_id}`);
            setOrdersList(data?.data?.orders || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!event_id) return;
        getOrdersList();
    }, [event_id]);
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


    useEffect(() => {
        if (!event_id) return;

        const fetchEventById = async () => {
            try {
                const response = await api.get(`/api/v1/admin/events/event-details/${event_id}`);
                const data = response.data;
                if (data?.success) {
                    const eventObj = data.data.event;
                    const option = {
                        value: eventObj.id,
                        label: eventObj.name,
                        event: eventObj,
                    };
                    setSelectedEvent(option); // 👈 AsyncSelect default fill
                    setEvent(eventObj.name);  // 👈 your normal state
                }
            } catch (error) {
                console.error("Error fetching event by id:", error);
            }
        };

        fetchEventById();
    }, [event_id]);




    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            // Format dates as YYYY-MM-DD for API
            const formattedFromDate = formatDate(fromDate);
            const formattedToDate = formatDate(toDate);
            const response = await api.get("/api/v1/admin/orders/search-order-details", {
                params: {
                    customer,
                    event_id: event_id,
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
        setCustomer("");
        setSelectedCustomer(null);   // 👈 THIS WAS MISSING
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

    const loadUserOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const response = await api.get(
                "/api/v1/admin/customers/first-name/search",
                {
                    params: {
                        search: inputValue, // 👈 backend expects this
                    },
                }
            );
            const data = response.data;
            if (data?.success) {
                return data.data.customers.map((user) => ({
                    value: user.id,
                    label: user.first_name, // 👈 correct key
                    user,
                }));
            }

            return [];
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    };

    const handleUserSelect = (selectedOption) => {
        setSelectedCustomer(selectedOption); // 👈 dropdown control

        if (selectedOption) {
            setCustomer(selectedOption.user.first_name);
        } else {
            setCustomer("");
        }
    };

    const loadEventOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];

        try {
            const response = await api.get(
                "/api/v1/admin/events/search/search",
                {
                    params: {
                        search: inputValue, // backend expects this
                    },
                }
            );

            const data = response.data;

            if (data?.success) {
                return data.data.events.map((event) => ({
                    value: event.id,
                    label: event.name,
                    event, // full event object if needed later
                }));
            }

            return [];
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    };

    const handleEventSelect = (selectedOption) => {
        setSelectedEvent(selectedOption); // 👈 dropdown control

        if (selectedOption) {
            setEvent(selectedOption.event?.name);
        } else {
            setEvent("");
        }
    };

    const getCurrentDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const formatDateTime = (date) => {
        if (!date) return "---";
        return moment(date).format("DD MMM, YYYY hh:mm A");
    };

    const headers = [
        "S.No",
        "Order Date",
        "Order Details",
        "Event",
        "Customer",
        "Mobile",
        "Qty",
        "Customer Pay",
        "Admin Commission",
    ];

    const calculateCommission = (amount, percent = 8) => {
        if (!amount) return "0";
        return ((Number(amount) * percent) / 100).toFixed(2);
    };
    const csvData = orderList.map((order, index) => {
        const user = order?.user || {};
        const event = order?.event || {};
        const items = order?.orderItems || [];

        const totalQty = items.reduce(
            (sum, item) => sum + (item.count || 0),
            0
        );

        const customerName =
            [user.first_name, user.last_name].filter(Boolean).join(" ") || "-";

        const orderDetails =
            order.paymenttype === "free"
                ? "Free Ticket"
                : order.RRN || "-";

        return {
            "S.No": index + 1,
            "Order Date": formatDateTime(order.created),
            "Order Details": orderDetails,
            "Event": event?.name || "-",
            "Customer": customerName,
            "Mobile": user?.mobile || "-",
            "Qty": totalQty || "-",
            "Customer Pay": formatCurrencyAmount(order, "sub_total"),
            "Admin Commission": formatCurrencyAmount(order, "tax_total"),
        };
    });

    const onExportLinkPress = () => {
        const rows = [
            headers,
            ...csvData.map((row) =>
                headers.map((header) => {
                    const value = row[header] ?? "";
                    return `"${String(value).replace(/"/g, '""')}"`;
                })
            ),
        ];

        const csvContent =
            "data:text/csv;charset=utf-8,\uFEFF" +
            rows.map((e) => e.join(",")).join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `orders_${getCurrentDate()}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

                                    <AsyncSelect
                                        className="search-dropdown"
                                        cacheOptions
                                        loadOptions={loadUserOptions}
                                        value={selectedCustomer}
                                        onChange={handleUserSelect}
                                        placeholder="Search by name"
                                        isClearable
                                        getOptionLabel={(option) => option.user.first_name}
                                        getOptionValue={(option) => option.value}
                                        formatOptionLabel={(option, { context }) => {
                                            if (context === "menu") {
                                                return (
                                                    <div>
                                                        <strong>{option.user.first_name}</strong>
                                                    </div>
                                                );
                                            }
                                            return option.user.first_name;
                                        }}
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 1050,
                                            }),
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Event</Form.Label>
                                    <AsyncSelect
                                        className="search-dropdown"
                                        isDisabled
                                        cacheOptions
                                        loadOptions={loadEventOptions}
                                        value={selectedEvent}
                                        onChange={handleEventSelect}
                                        placeholder="Search by event"
                                        isClearable
                                        getOptionLabel={(option) => option.event?.name}
                                        getOptionValue={(option) => option.value}
                                        formatOptionLabel={(option, { context }) => {
                                            if (context === "menu") {
                                                return (
                                                    <div>
                                                        <strong>{option.event?.name}</strong>
                                                    </div>
                                                );
                                            }
                                            return option.event?.name;
                                        }}
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 1050,
                                            }),
                                        }}
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
                                <Button onClick={onExportLinkPress}>
                                    Export CSV
                                </Button>
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
                                        {/* <tr style={{ fontWeight: "bold", background: "#f8f9fa" }}>
                                            <td colSpan={6} className="text-end">
                                                Total Amount :
                                            </td>
                                            <td>
                                                {formatCurrency(pageTotals.subTotal)}
                                            </td>
                                            <td>
                                                {formatCurrency(pageTotals.taxTotal)}
                                            </td>
                                        </tr> */}
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

OrdersByEvent.layout = "Contentlayout";

export default OrdersByEvent;
