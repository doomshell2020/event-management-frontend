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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Link from "next/link";
import AsyncSelect from "react-select/async";

export const Events = () => {

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
            style: { width: "5%" },
        },
        {
            Header: "Organizer",
            accessor: "organizer",
            className: "borderrigth",
            style: { width: "10%" },
            Cell: ({ row }) => {
                const organizer = row?.original?.Organizer;

                return (
                    <div className="d-flex align-items-center gap-2">
                        <span>
                            {organizer
                                ? `${organizer.first_name || ""} ${organizer.last_name || ""}`.trim()
                                : "-"}
                        </span>
                    </div>
                );
            },
        },
        {
            Header: "Event Name",
            accessor: "eventName",
            className: "borderrigth",
            style: { width: "10%" },
            Cell: ({ row }) => {
                const eventName = row.original.name || "---";
                const eventUrl = `/event/${row.original.id}/${row.original.slug}`;

                return (
                    <Link href={eventUrl} target="_blank" rel="noopener noreferrer"
                        style={{
                            color: "#0d6efd",        // blue
                            textDecoration: "underline",
                            cursor: "pointer"
                        }}
                    >
                        {eventName}
                    </Link>
                );
            },
        },

        {
            Header: "Date and Time",
            accessor: "DateAndTime",
            className: "borderrigth",
            style: { width: "20%" },
            Cell: ({ row }) => {
                const fromDate = row?.original?.date_from;
                const toDate = row?.original?.date_to;

                return (
                    <div>
                        <div>
                            <strong>From </strong>
                            {fromDate
                                ? moment(fromDate).format("DD MMM, YYYY hh:mm A")
                                : "---"}
                        </div>

                        <div>
                            <strong>To </strong>
                            {toDate
                                ? moment(toDate).format("DD MMM, YYYY hh:mm A")
                                : "---"}
                        </div>
                    </div>
                );
            },
        },

        {
            Header: "Venue",
            accessor: "venue",
            className: "borderrigth",
            style: { width: "10%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.location ? row.original.location : "---"}
                </div>
            ),
        },
        {
            Header: "Ticket Types",
            accessor: "TicketTypes",
            className: "borderrigth",
            style: { width: "10%" },
            Cell: ({ row }) => {
                const tickets = row?.original?.tickets;

                return (
                    <div>
                        {Array.isArray(tickets) && tickets.length > 0
                            ? tickets.map((ticket, index) => (
                                <div key={ticket.id || index}>
                                    {ticket.title || "---"}
                                </div>
                            ))
                            : "---"}
                    </div>
                );
            },
        },

        {
            Header: "Total Sales",
            accessor: "total_sales",
            className: "borderrigth",
            style: { width: "10%" },
            Cell: ({ row }) => {
                const eventId = row?.original?.id;
                const amount = formatAmount(row?.original, "total_sales");

                if (!eventId || amount === "---") {
                    return <span>{amount}</span>;
                }
                return (
                    <Link
                        href={`/admin/events/${eventId}`}
                        target="_blank"
                    >
                        {amount}
                    </Link>
                );
            },
        },

        {
            Header: "Comm(8%)",
            accessor: "Comm",
            className: "borderrigth",
            style: { width: "5%" },
            Cell: ({ row }) => (
                <div>
                    {formatAmount(row?.original, "total_tax")}
                </div>
            ),
        },
        {
            Header: "Featured",
            accessor: "featured",
            className: "borderrigth",
            style: { width: "5%" },
            Cell: ({ row }) => {
                const { id, featured } = row.original;
                const isFeatured = featured === "Y";
                return (
                    <div className="d-flex justify-content-center gap-2">
                        {/* Featured Star */}
                        <i
                            className={`${isFeatured ? "fas" : "far"} fa-star`}
                            style={{
                                cursor: "pointer",
                                color: isFeatured ? "#f5c518" : "#333",
                                fontSize: "16px",
                            }}
                            title={isFeatured ? "Remove from Featured" : "Mark as Featured"}
                            onClick={() => handleFeaturedStatusChange(id, featured)}
                        />


                        {/* View Icon */}
                        <i
                            className="fas fa-eye"
                            style={{
                                cursor: "pointer",
                                color: "#333",
                                fontSize: "16px",
                            }}
                            title="View Staff"
                            onClick={() => handleView(id)}
                        />
                    </div>
                );
            },
        },

        {
            Header: "Action",
            accessor: "action",
            className: "borderrigth",
            style: { width: "10%" },
            Cell: ({ row }) => {
                const { id, status } = row.original;

                return (
                    <div className="d-flex flex-column align-items-center gap-1">
                        {/* Top Row: Toggle + Delete */}
                        <div className="d-flex align-items-center gap-2">
                            <div className="form-check form-switch m-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    style={{ cursor: "pointer" }}
                                    checked={status === "Y"}
                                    onChange={() => handleStatusToggle(id, status)}
                                />
                            </div>

                            <i
                                className="bi bi-trash-fill text-danger"
                                style={{ cursor: "pointer", fontSize: "16px" }}
                                onClick={() => handleDeleteEvent(id)}
                                title="Delete"
                            ></i>
                        </div>

                        {/* Bottom Row: Payment Report Button */}
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => generatePaymentReport(id)}
                        >
                            Payment Report
                        </button>
                    </div>
                );
            },



            // Cell: ({ row }) => {
            //     const { id, status } = row.original;
            //     return (
            //         <div className="form-check form-switch d-flex justify-content-center">
            //             <div className="form-check form-switch">
            //                 <input
            //                     className="form-check-input"
            //                     type="checkbox"
            //                     style={{ cursor: "pointer" }}
            //                     checked={status === "Y"}
            //                     onChange={() => handleStatusToggle(id, status)}
            //                 /></div>

            //             <i
            //                 className="bi bi-trash-fill text-danger"
            //                 style={{ cursor: "pointer", fontSize: "16px" }}
            //                 onClick={() => handleDeleteEvent(id)}
            //                 title="Delete"
            //             ></i>
            //             <br />
            //             {/* Payment Report Button */}
            //             <button
            //                 className="btn btn-success btn-sm"
            //                 // onClick={handlePaymentReport}
            //                 onClick={() => generatePaymentReport(id)}

            //             >
            //                 Payment Report
            //             </button>
            //         </div>
            //     );
            // },
        },
    ]);



    const formatCurrency = (amount, currency) => {
        const value = Number(amount || 0);

        if (currency === "INR") {
            return `₹${value.toLocaleString("en-IN")}`;
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
        }).format(value);
    };
    const formatEventDate = (from, to) => {
        const date = new Date(from);

        const day = date.getDate();
        const year = date.getFullYear();
        const month = date.toLocaleString("en-US", { month: "long" });

        const suffix =
            day % 10 === 1 && day !== 11 ? "st" :
                day % 10 === 2 && day !== 12 ? "nd" :
                    day % 10 === 3 && day !== 13 ? "rd" : "th";

        const time = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return `${month} ${day}${suffix} ${year} @${time}`;
    };
    const formatTableDate = (dateStr) => {
        if (!dateStr) return "-";

        const date = new Date(dateStr);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const time = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return `${day}-${month}-${year} ${time}`;
    };


    const generatePaymentReport = async (eventId) => {
        try {
            const res = await api.get(`/api/v1/admin/events/${eventId}/details`);
            const event = res.data.data.event;
            const currency = event.currencyName?.Currency || "USD";
            // ===============================
            // EVENT INFO
            // ===============================
            const eventInfo = {
                name: event.name,
                date: formatEventDate(event.date_from, event.date_to),
                location: event.location,
                totalSales: event.totalSubTotal,
                totalCommission: event.totalTaxTotal,
            };

            // ===============================
            // PAYMENT ROWS
            // ===============================
            const tableBody = [
                [
                    { text: "No#", color: "white", bold: true },
                    { text: "Invoice No", color: "white", bold: true },
                    { text: "Date", color: "white", bold: true },
                    { text: "Ticket Name", color: "white", bold: true },
                    { text: "Price", color: "white", bold: true, alignment: "right" },
                    { text: "Commission", color: "white", bold: true, alignment: "right" },
                    { text: "Customer", color: "white", bold: true },
                    { text: "Contact", color: "white", bold: true },
                ],
            ];




            event.orderItems.forEach((item, index) => {
                const order = item.order || {};
                const user = order.user || {};

                const price = Number(order.sub_total || 0);
                const commission = Number(order.tax_total || 0);
                tableBody.push([
                    index + 1,
                    order.id || "-",
                    // order.created ? new Date(order.created).toLocaleString() : "-",
                    formatTableDate(order.created),
                    getTicketName(item),
                    { text: formatCurrency(price, currency), alignment: "right" },
                    { text: formatCurrency(commission, currency), alignment: "right" },
                    `${user.first_name || ""} ${user.last_name || ""}`,
                    user.mobile || "-",
                ]);
            });

            // ===============================
            // PDF DEFINITION
            // ===============================
            const docDefinition = {
                defaultStyle: {
                    font: "Roboto",
                    fontSize: 9,
                },
                info: {
                    title: "Event Summary Tender Report"
                },
                pageSize: "A4",
                pageMargins: [40, 60, 40, 40],
                content: [
                    // ===============================
                    // HEADER WITH IMAGE
                    // ===============================
                    {
                        columns: [
                            {
                                width: "*",
                                stack: [
                                    {
                                        text: "Event Payment Report",
                                        style: "title",
                                    },
                                    {
                                        text: `(${eventInfo.name})`,
                                        style: "subtitle",
                                    },
                                ],
                            }
                        ],
                        margin: [0, 0, 0, 20],
                    },

                    // ===============================
                    // EVENT INFO TABLE
                    // ===============================
                    {
                        table: {
                            widths: ["20%", "30%", "20%", "30%"],
                            body: [
                                [
                                    { text: "Event Name :", style: "label" },
                                    eventInfo.name,
                                    { text: "Event Date :", style: "label" },
                                    eventInfo.date,
                                ],
                                [
                                    { text: "Location :", style: "label" },
                                    eventInfo.location,
                                    { text: "Currency :", style: "label" },
                                    currency,
                                ],
                                [
                                    { text: "Total Sales :", style: "label" },
                                    formatCurrency(eventInfo.totalSales, currency),
                                    { text: "Total Commission :", style: "label" },
                                    formatCurrency(eventInfo.totalCommission, currency),
                                ],
                            ],
                        },
                        layout: "lightHorizontalLines",
                        margin: [0, 0, 0, 20],
                    },

                    // ===============================
                    // PAYMENT TABLE
                    // ===============================
                    {
                        table: {
                            headerRows: 1,
                            widths: ["5%", "10%", "15%", "20%", "10%", "10%", "15%", "15%"],
                            body: tableBody,
                        },
                        layout: {
                            fillColor: (rowIndex) => (rowIndex === 0 ? "#3F4A5A" : null),
                        },
                    },
                ],

                styles: {
                    title: {
                        fontSize: 18,
                        bold: true,
                        alignment: "center",
                    },
                    subtitle: {
                        fontSize: 10,
                        alignment: "center",
                        margin: [0, 4, 0, 0],
                    },
                    label: {
                        bold: true,
                    },
                },

                defaultStyle: {
                    fontSize: 9,
                },
            };


            pdfMake.createPdf(docDefinition).open();

        } catch (error) {
            console.error("PDF generation failed", error);
        }
    };

    const formatAmount = (row, key) => {
        const symbol = row?.currencyName?.Currency_symbol || "";
        const value = Number(row?.[key] || 0);

        if (!value) return "---";

        return `${symbol} ${value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const [eventList, setEventList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Alert messages
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [eventName, setEventName] = useState("");
    const [organizer, setOrganizer] = useState("");

    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);


    const getTicketName = (item) => {
        return (
            item.ticketType?.title?.trim() ||
            item.addonType?.name?.trim() ||
            item.appointment?.wellnessList?.name?.trim() ||
            "N/A"
        );
    };





    const getEventList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/v1/admin/events");
            setEventList(data?.data?.events || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getEventList();
    }, []);
    const handleDeleteEvent = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this event?",
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
                title: "Deleting event...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // API call to delete event
            await api.delete(`/api/v1/admin/events/${id}`);
            getEventList(); // refresh the table after deletion
            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Event deleted successfully.",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Event deletion failed", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Unable to delete the event. Please try again.",
            });
        }
    };


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

            await api.put(`/api/v1/admin/events/update-status/${id}`, {
                status: newStatus,
            });
            getEventList();
            Swal.fire({
                icon: "success",
                title: "Success",
                text: `Status updated successfully`,
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

    // featured status
    const handleFeaturedStatusChange = async (eventId, currentStatus) => {
        const isCurrentlyFeatured = currentStatus === "Y";
        const updatedStatus = isCurrentlyFeatured ? "N" : "Y";

        const result = await Swal.fire({
            title: "Confirm Action",
            text: isCurrentlyFeatured
                ? "Are you sure you want to remove this event from Featured?"
                : "Are you sure you want to mark this event as Featured?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: isCurrentlyFeatured
                ? "Yes, Remove Featured"
                : "Yes, Mark as Featured",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#20c997",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Updating Featured Status",
                text: "Please wait...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            await api.put(`/api/v1/admin/events/${eventId}/featured`, {
                featured: updatedStatus,
            });
            // 🔁 IMPORTANT: Reload events from API
            getEventList();
            Swal.fire({
                icon: "success",
                title: "Update Successful",
                text: isCurrentlyFeatured
                    ? "The event has been removed from Featured."
                    : "The event has been marked as Featured.",
                timer: 1500,
                showConfirmButton: false,
            });



        } catch (error) {
            console.error("Featured status update failed", error);

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: "Unable to update featured status. Please try again.",
            });
        }
    };


    const handleView = (eventId) => {
        setSelectedEventId(eventId);
        setShowStaffModal(true);
        fetchStaffList(eventId);
    };
    const fetchStaffList = async (eventId) => {
        try {
            setLoadingStaff(true);

            const response = await api.get(
                `/api/v1/admin/events/${eventId}/staff`
            );
            setStaffList(response?.data?.data?.staff || []);
        } catch (error) {
            console.error("Error fetching staff:", error);
            setStaffList([]);
        } finally {
            setLoadingStaff(false);
        }
    };

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
            const response = await api.get("/api/v1/admin/events/search", {
                params: {
                    organizer,
                    eventName,
                    fromDate: formattedFromDate,
                    toDate: formattedToDate,
                },
            });

            // console.log("0-response.data", response?.data?.data?.events)
            setEventList(response?.data?.data?.events); // Save API results in state
        } catch (error) {
            console.error("Error fetching events:", error);
            setEventList([]);
        }
    };

    const handleReset = () => {
        setEventName("");
        setOrganizer("");
        setFromDate(null);
        setToDate(null);
        setEventList([]);
        getEventList();
        setSelectedCustomer(null)
        setSelectedEvent(null)
    };


    const getCurrentDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const headers = [
        "Organizer",
        "Event Name",
        "Date From",
        "Date To",
        "Venue",
        "Total Sales",
        "Comm(8%)",
        "Video Url",
        "Status",
    ];

    const csvData = eventList.map((item) => {
        const organizer = item?.Organizer
            ? `${item.Organizer.first_name || ""} ${item.Organizer.last_name || ""}`.trim()
            : "----";

        return {
            Organizer: organizer || "----",
            "Event Name": item?.name || "----",
            "Date From": item?.date_from || "----",
            "Date To": item?.date_to || "----",
            Venue: item?.location || "----",
            "Total Sales": item?.total_sales ?? "0",
            "Comm(8%)": item?.total_tax ?? "0",
            "Video Url": item?.video_url || "----",
            Status: item?.status === "Y" ? "Active" : "Inactive",
        };
    });

    const onExportLinkPress = () => {
        const rows = [
            headers,
            ...csvData.map((row) =>
                headers.map((header) => {
                    // Wrap values in quotes to handle commas and special chars
                    const value = row[header] ?? "";
                    return `"${String(value).replace(/"/g, '""')}"`;
                })
            ),
        ];

        const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Event_${getCurrentDate()}.csv`);

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
            setOrganizer(selectedOption.user.first_name);
        } else {
            setOrganizer("");
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
            setEventName(selectedOption.event?.name);
        } else {
            setEventName("");
        }
    };








    return (
        <div>
            <Seo title={"Event Manager"} />
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

                                {/* <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Event Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Event Name"
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}

                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Organizer</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Organizer Name"
                                        value={organizer}
                                        onChange={(e) => setOrganizer(e.target.value)}
                                    />
                                </Form.Group> */}

                                <Form.Group className="mb-3" controlId="formDateFrom">
                                    <Form.Label>From Date</Form.Label>
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
                                    <Form.Label>To Date</Form.Label>
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
                                <h4 className="card-title mg-b-0">Event Manager</h4>
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

            <Modal
                show={showStaffModal}
                onHide={() => setShowStaffModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Staff List
                        {staffList.length > 0 && ` (${staffList.length})`}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {loadingStaff ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : Array.isArray(staffList) && staffList.length > 0 ? (
                        <table className="table table-bordered mb-0">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map((staff, index) => (
                                    <tr key={staff.id || index}>
                                        <td>{index + 1}</td>
                                        <td>{staff.first_name}</td>
                                        <td>{staff.email}</td>
                                        <td>{staff.mobile}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-4 text-muted">
                            Staff not Available
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowStaffModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>








        </div>
    );
};

Events.layout = "Contentlayout";

export default Events;
