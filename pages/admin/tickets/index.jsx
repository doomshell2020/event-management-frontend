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
import Link from "next/link";

export const TicketList = () => {
    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "Purchase Date",
            accessor: "OrderDate",
            className: "borderrigth",
            Cell: ({ row }) => {
                const createdDate = row.original?.order?.created;
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
            Header: "Ticket No.",
            accessor: "TicketNo",
            className: "borderrigth",
            Cell: ({ row }) => {
                const {
                    ticket_id,
                    addon_id,
                    appointment_id
                } = row.original;

                const ticketNo =
                    ticket_id ||
                    addon_id ||
                    appointment_id ||
                    "-";

                return (
                    <div>
                        {ticketNo}
                    </div>
                );
            },
        },


        {
            Header: "Event",
            accessor: "event",
            className: "borderrigth",
            Cell: ({ row }) => {
                const eventName = row.original?.order?.event?.name;

                return (
                    <div>
                        {eventName || "-"}
                    </div>
                );
            },
        },
        {
            Header: "Event Date & Time",
            accessor: "eventDate",
            className: "borderrigth",
            Cell: ({ row }) => {
                const event = row.original?.order?.event;

                if (!event?.date_from || !event?.date_to) return "-";

                return (
                    <div>
                        <div>
                            <strong>From </strong>
                            {moment(event.date_from).format("DD MMM, YYYY hh:mm A")}
                        </div>
                        <div>
                            <strong>To </strong>
                            {moment(event.date_to).format("DD MMM, YYYY hh:mm A")}
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
                const user = row.original?.order?.user;

                if (!user) return <span>-</span>;

                const fullName =
                    [user.first_name, user.last_name].filter(Boolean).join(" ");

                return (
                    <div>
                        <div>{fullName || "-"}</div>
                        <div> {user.email || "-"}</div>
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
                const qty = row.original?.count;

                return (
                    <div>
                        {qty ?? "-"}
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
        const symbol =
            row?.order?.event?.currencyName?.Currency_symbol || "";

        const amount = row?.order?.[key];

        if (!amount) return "-";

        return `${symbol} ${Number(amount).toLocaleString("en-IN")}`;
    };
    const [ticketList, setTicketList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [customer, setCustomer] = useState("");
    const [mobile, setMobile] = useState("");
    const [event, setEvent] = useState("");
    const [ticketNumber, setTicketNumber] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const getTicketList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/v1/admin/tickets");
            setTicketList(data?.data?.tickets || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getTicketList();
    }, []);

    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: ticketList,
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



    const handleSearch = async (e) => {
        e.preventDefault();

        try {
            const response = await api.get("/api/v1/admin/tickets/search", {
                params: {
                    customer,
                    mobile,
                    event,
                    ticketNumber,
                    purchaseFrom: fromDate ? fromDate.toISOString().split("T")[0] : "",
                    purchaseTo: toDate ? toDate.toISOString().split("T")[0] : "",
                },
            });
            setTicketList(response?.data?.data.tickets || []);
        } catch (error) {
            console.error("Error searching tickets:", error);
            setTicketList([]);
        }
    };


    const handleReset = () => {
        setCustomer("");
        setMobile("");
        setEvent("");
        setTicketNumber("");
        setFromDate(null);
        setToDate(null);
        setTicketList([]);
        getTicketList(); // reload full list
    };



    const getCurrentDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const headers = [
        "Buy Date & Time",
        "Ticket No.",
        "Event Name",
        "Event Date & Time",
        "Customer Name",
        "Mobile",
        "Buy Ticket",
        "Amount",
        "Commission(8%)",
    ];
    const formatDateTime = (date) => {
        if (!date) return "----";
        const d = new Date(date);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    };
    const calculateCommission = (amount, percent = 8) => {
        if (!amount) return "0";
        return ((Number(amount) * percent) / 100).toFixed(2);
    };
    const csvData = ticketList.map((item) => {
        const order = item?.order || {};
        const user = order?.user || {};
        const event = order?.event || {};
        const currency = event?.currencyName?.Currency_symbol || "";

        const amount = order?.sub_total || 0;
        const commission = calculateCommission(amount);

        return {
            "Buy Date & Time": formatDateTime(order?.created),
            "Ticket No.": item?.ticket_id || "----",
            "Event Name": event?.name || "----",
            "Event Date & Time": `${formatDateTime(event?.date_from)} - ${formatDateTime(event?.date_to)}`,
            "Customer Name": `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "----",
            "Mobile": user?.mobile || "----",
            "Buy Ticket": item?.count || 0,
            "Amount": `${currency}${amount}`,
            "Commission(8%)": `${currency}${commission}`,
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
        link.download = `Ticket_${getCurrentDate()}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };








    return (
        <div>
            <Seo title={"Ticket Manager"} />
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

                                <Form.Group className="mb-3">
                                    <Form.Label>Customer</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Customer Name"
                                        value={customer}
                                        onChange={(e) => setCustomer(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Mobile</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Mobile"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Event</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Event Name"
                                        value={event}
                                        onChange={(e) => setEvent(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Ticket Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ticket / Addon / Appointment ID"
                                        value={ticketNumber}
                                        onChange={(e) => setTicketNumber(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Purchase From</Form.Label>
                                    <DatePicker
                                        selected={fromDate}
                                        onChange={(date) => {
                                            setFromDate(date);
                                            if (toDate && date && toDate < date) {
                                                setToDate(null);
                                            }
                                        }}
                                        dateFormat="dd-MM-yyyy"
                                        placeholderText="DD-MM-YYYY"
                                        className="form-control"
                                        maxDate={toDate || null}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Purchase To</Form.Label>
                                    <DatePicker
                                        selected={toDate}
                                        onChange={(date) => setToDate(date)}
                                        dateFormat="dd-MM-yyyy"
                                        placeholderText="DD-MM-YYYY"
                                        className="form-control"
                                        disabled={!fromDate}
                                        minDate={fromDate}
                                    />
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button type="submit" variant="primary" className="w-50">
                                        Submit
                                    </Button>
                                    <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
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
                                <h4 className="card-title mg-b-0">Ticket Manager</h4>
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

TicketList.layout = "Contentlayout";

export default TicketList;
