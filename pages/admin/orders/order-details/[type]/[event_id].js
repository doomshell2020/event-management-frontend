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
import { useRouter } from "next/router";
import Seo from "@/shared/layout-components/seo/seo";
import api from "@/utils/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import AsyncSelect from "react-select/async";
export const OrderDetails = () => {
    const router = useRouter();
    const { type, event_id } = router.query;

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
            Header: "Ticket",
            accessor: "ticket_name",
            className: "borderrigth",
            Cell: ({ row }) => {
                const { type, appointment } = row.original;

                let name = "-";
                let label = "";
                let badgeColor = "#28a745"; // default green
                let extraInfo = null;

                // helpers
                const formatDate = (dateStr) => {
                    return dateStr ? moment(dateStr).format("DD MMM, YYYY") : "-";
                };

                const formatTime = (timeStr) => {
                    if (!timeStr) return "-";
                    const [h, m] = timeStr.split(":");
                    const date = new Date();
                    date.setHours(h, m);
                    return date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    });
                };

                switch (type) {
                    case "ticket":
                        name = row.original.ticketType?.title;
                        label = "Ticket";
                        break;

                    case "comps":
                        name = row.original.ticketType?.title;
                        label = "Comps";
                        break;

                    case "committesale":
                        name = row.original.ticketType?.title;
                        label = "Committee";
                        break;

                    case "addon":
                        name = row.original.addonType?.name;
                        label = "Addon";
                        break;

                    case "appointment":
                        name = appointment?.wellnessList?.name;
                        label = "Appointment";
                        badgeColor = "#0d6efd"; // 🔵 blue for appointment

                        extraInfo = (
                            <span>
                               <strong>Date: </strong>{formatDate(appointment?.date)} <br />
                               <strong>Time: </strong> {formatTime(appointment?.slot_start_time)} –{" "}
                                {formatTime(appointment?.slot_end_time)}
                            </span>
                        );
                        break;

                    case "package":
                        name = row.original.package?.name;
                        label = "Package";
                        break;

                    default:
                        name = "-";
                        label = "";
                }

                return (
                    <div className="d-flex flex-column">
                        <span className="fw-semibold">{name || "-"}</span>
                        <span className="fw-semibold"> {extraInfo}</span>

                        {label && (
                            <span
                                className="badge mt-1"
                                style={{
                                    backgroundColor: badgeColor,
                                    color: "#fff",
                                    fontSize: "12px",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                    width: "fit-content",
                                }}
                            >
                                {label}
                            </span>
                        )}
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
        // {
        //     Header: "Customer Pay",
        //     accessor: "CustomerPay",
        //     className: "borderrigth",
        //     Cell: ({ row }) => (
        //         <div>
        //             {formatCurrencyAmount(row.original, "sub_total")}
        //         </div>
        //     ),
        // },
        // {
        //     Header: "Admin Commission",
        //     accessor: "Commission",
        //     className: "borderrigth",
        //     Cell: ({ row }) => (
        //         <div>
        //             {formatCurrencyAmount(row.original, "tax_total")}
        //         </div>
        //     ),
        // },



    ]);

    const formatCurrencyAmount = (row, key) => {
        const symbol =
            row?.order?.event?.currencyName?.Currency_symbol || "";

        const amount = row?.order?.[key];

        if (!amount) return "-";

        return `${symbol} ${Number(amount).toLocaleString("en-IN")}`;
    };
    const [ticketList, setTicketList] = useState([]);
    // console.log("ticketList", ticketList)
    const [isLoading, setIsLoading] = useState(true);
    const [customer, setCustomer] = useState("");
    const [mobile, setMobile] = useState("");
    const [event, setEvent] = useState("");
    // console.log("event--",event)
    const [ticketNumber, setTicketNumber] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const getTicketList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/api/v1/admin/tickets/${type}/${event_id}`);
            setTicketList(data?.data?.tickets || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!event_id) return;
        getTicketList();
    }, [event_id, type]);

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
            const formattedFromDate = formatDate(fromDate);
            const formattedToDate = formatDate(toDate);
            const response = await api.get("/api/v1/admin/tickets/search", {
                params: {
                    customer,
                    mobile,
                    event,
                    ticketNumber,
                    purchaseFrom: formattedFromDate,
                    purchaseTo: formattedToDate,
                    type: type
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
        setSelectedCustomer(null);   // 👈 THIS WAS MISSING
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
        // "Amount",
        // "Commission(8%)",
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
            "Ticket No.": item?.ticket_id || item?.package_id || item?.appointment_id || item?.addon_id || "----",
            "Event Name": event?.name || "----",
            "Event Date & Time": `${formatDateTime(event?.date_from)} - ${formatDateTime(event?.date_to)}`,
            "Customer Name": `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "----",
            "Mobile": user?.mobile || "----",
            "Buy Ticket": item?.count || 0,
            // "Amount": `${currency}${amount}`,
            // "Commission(8%)": `${currency}${commission}`,
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

                                <Form.Group className="mb-3">
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






                                {/* <Form.Group className="mb-3">
                                    <Form.Label>Ticket Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ticket / Addon / Appointment ID"
                                        value={ticketNumber}
                                        onChange={(e) => setTicketNumber(e.target.value)}
                                    />
                                </Form.Group> */}

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

OrderDetails.layout = "Contentlayout";

export default OrderDetails;
