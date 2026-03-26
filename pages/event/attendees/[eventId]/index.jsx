import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import { formatEventDateTime } from "@/utils/formatDate";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";

const ManageAttendees = () => {
    const router = useRouter();
    const { eventId } = router.query;
    const [eventDetails, setEventDetails] = useState(null);
    // console.log("eventDetails-----",eventDetails?.currencyName?.Currency_symbol)
    const [orderData, setOrderData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");
    const [excelLoading, setExcelLoading] = useState(false);
    // Fetch Event Details Only Once
    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        }
    };

    // Fetch Orders with Pagination
    const fetchAttendees = async (eventId, page) => {
        setLoading(true);
        try {
            const res = await api.get(
                `/api/v1/tickets/attendees-list/${eventId}&page=${page}&limit=${limit}`
            );

            if (res.data.success) {
                const { records, totalPages, currentPage, totalRecords } = res.data.data;
                setOrderData(records);
                setTotalPages(totalPages);
                setCurrentPage(currentPage);
                setTotalRecords(totalRecords);
            } else {
                setOrderData([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrderData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchEventDetails(eventId); // only once
        }
    }, [eventId]);

    useEffect(() => {
        if (eventId) {
            fetchAttendees(eventId, currentPage); // only orders refresh
        }
    }, [eventId, currentPage]);

    // Pagination
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };



    // const handleDownloadAttendeesExcel = async () => {
    //     if (!eventDetails?.id) return;

    //     setExcelLoading(true);

    //     try {
    //         // ✅ FIXED API URL
    //         const response = await api.get(
    //             `/api/v1/tickets/attendees-list/${eventDetails.id}?page=1&limit=1000000`
    //         );

    //         const { records } = response.data.data;

    //         if (!records.length) {
    //             Swal.fire("Info", "No attendees found", "info");
    //             return;
    //         }

    //         const workbook = new ExcelJS.Workbook();
    //         const worksheet = workbook.addWorksheet("Attendees");

    //         // ✅ Columns
    //         worksheet.columns = [
    //             { header: "Sr No", key: "srNo", width: 8 },
    //             { header: "Name", key: "name", width: 25 },
    //             { header: "Email", key: "email", width: 30 },
    //             { header: "Mobile", key: "mobile", width: 18 },
    //             { header: "Event Name", key: "eventName", width: 18 },
    //             { header: "Ticket Type", key: "type", width: 35 },
    //             { header: "Category", key: "category", width: 15 },
    //             // { header: "Price", key: "price", width: 15 },
    //             {
    //                 header: "Price",
    //                 key: "price",
    //                 width: 15,
    //                 style: {
    //                     numFmt: `"${eventDetails?.currencyName?.Currency_symbol}" #,##0.00`,
    //                     alignment: { horizontal: "right" } // ✅ always right
    //                 }
    //             },
    //             { header: "Status", key: "status", width: 15 },
    //             { header: "Scanned Date", key: "date", width: 18 },
    //         ];

    //         // ✅ Header Styling
    //         // worksheet.getRow(1).eachCell(cell => {
    //         //     cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    //         //     cell.fill = {
    //         //         type: "pattern",
    //         //         pattern: "solid",
    //         //         fgColor: { argb: "FF343A40" } // dark grey
    //         //     };
    //         //     cell.alignment = {
    //         //         vertical: "middle",
    //         //         horizontal: "center"
    //         //     };
    //         // });
    //         worksheet.getRow(1).eachCell(cell => {
    //             cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    //             cell.fill = {
    //                 type: "pattern",
    //                 pattern: "solid",
    //                 fgColor: { argb: "FF343A40" }
    //             };
    //             cell.alignment = {
    //                 vertical: "middle",
    //                 horizontal: "center" // ✅ center header
    //             };
    //         });


    //         worksheet.views = [{ state: "frozen", ySplit: 1 }];

    //         // ✅ Add Rows

    //         records.forEach((item, index) => {

    //             let type = "-";
    //             let category = "Unknown";

    //             if (item?.ticketPricing?.ticket?.title) {
    //                 type = item.ticketPricing.ticket.title;
    //                 category = "Ticket";
    //             } else if (item?.ticketType?.title) {
    //                 type = item.ticketType.title;
    //                 category = "Ticket";
    //             } else if (item?.addonType?.name) {
    //                 type = item.addonType.name;
    //                 category = "Addon";
    //             } else if (item?.package?.name) {
    //                 type = item.package.name;
    //                 category = "Package";
    //             } else if (item?.appointment?.wellnessList?.name) {
    //                 type = item?.appointment?.wellnessList?.name;
    //                 category = "Appointment";
    //             }

    //             const Price =
    //                 item?.ticketPricing?.price ||
    //                 item?.ticketType?.price ||
    //                 item?.addonType?.price ||
    //                 item?.package?.grandtotal ||
    //                 item?.appointment?.price ||
    //                 0;

    //             const row = worksheet.addRow({
    //                 srNo: index + 1,
    //                 name: `${item?.user?.first_name || ""} ${item?.user?.last_name || ""}`.trim(),
    //                 email: item?.user?.email || "-",
    //                 mobile: item?.user?.mobile || "-",
    //                 eventName: eventDetails.name || "-",
    //                 type: type,
    //                 category: category,
    //                 price: Price, // ✅ raw number (important)
    //                 status: item?.is_scanned === "Y" ? "Scanned" : "Not Scanned",
    //                 date: item?.scanned_date
    //                     ? moment(item.scanned_date).format("DD-MM-YYYY")
    //                     : "-"
    //             });

    //             // ✅ Row Alignment
    //             row.eachCell((cell, colNumber) => {
    //                 if (colNumber === 8) {
    //                     // Price column
    //                     cell.alignment = { horizontal: "right" }; // ✅ right align price
    //                 } else {
    //                     cell.alignment = { horizontal: "left" }; // ✅ बाकी left
    //                 }
    //             });

    //             // ✅ Currency Format (Excel format)
    //             row.getCell("price").numFmt = `"${eventDetails?.currencyName?.Currency_symbol}" #,##0.00`;
    //         });



    //         // records.forEach((item, index) => {

    //         //     // 🔥 Type Logic (same as UI)
    //         //     let type = "-";
    //         //     let category = "Unknown";

    //         //     if (item?.ticketPricing?.ticket?.title) {
    //         //         type = item.ticketPricing.ticket.title;
    //         //         category = "Ticket";
    //         //     } else if (item?.ticketType?.title) {
    //         //         type = item.ticketType.title;
    //         //         category = "Ticket";
    //         //     } else if (item?.addonType?.name) {
    //         //         type = item.addonType.name;
    //         //         category = "Addon";
    //         //     } else if (item?.package?.name) {
    //         //         type = item.package.name;
    //         //         category = "Package";
    //         //     } else if (item?.appointment?.wellnessList?.name) {
    //         //         type = item?.appointment?.wellnessList?.name;
    //         //         category = "Appointment";
    //         //     }

    //         //     const Price =
    //         //         item?.ticketPricing?.price ||
    //         //         item?.ticketType?.price ||
    //         //         item?.addonType?.price ||
    //         //         item?.package?.grandtotal ||
    //         //         item?.appointment?.price ||
    //         //         "-";

    //         //     worksheet.addRow({
    //         //         srNo: index + 1,
    //         //         name: `${item?.user?.first_name || ""} ${item?.user?.last_name || ""}`.trim(),
    //         //         email: item?.user?.email || "-",
    //         //         mobile: item?.user?.mobile || "-",
    //         //         eventName: eventDetails.name || "-",
    //         //         type: type,
    //         //         category: category,
    //         //         price: `${eventDetails?.currencyName?.Currency_symbol} ${Price}`,
    //         //         status: item?.is_scanned === "Y" ? "Scanned" : "Not Scanned",
    //         //         date: item?.scanned_date
    //         //             ? moment(item.scanned_date).format("DD-MM-YYYY")
    //         //             : "-"
    //         //     });
    //         // });

    //         // ✅ Auto filter add (pro feature)
    //         worksheet.autoFilter = {
    //             from: "A1",
    //             to: "H1",
    //         };

    //         const buffer = await workbook.xlsx.writeBuffer();

    //         saveAs(
    //             new Blob([buffer]),
    //             `Attendees_${eventDetails.name}_${moment().format("YYYYMMDD_HHmmss")}.xlsx`
    //         );

    //     } catch (error) {
    //         console.error("Excel download failed:", error);
    //         Swal.fire("Error", "Failed to download Excel", "error");
    //     } finally {
    //         setExcelLoading(false);
    //     }
    // };

    const handleDownloadAttendeesExcel = async () => {
        if (!eventDetails?.id) return;

        setExcelLoading(true);

        try {
            const response = await api.get(
                `/api/v1/tickets/attendees-list/${eventDetails.id}?page=1&limit=1000000`
            );

            const { records } = response.data.data;

            if (!records.length) {
                Swal.fire("Info", "No attendees found", "info");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Attendees");

            const currencySymbol =
                eventDetails?.currencyName?.Currency_symbol || "₹";

            // ✅ Columns (ALL styling here only)
            worksheet.columns = [
                { header: "Sr No", key: "srNo", width: 8, style: { alignment: { horizontal: "left" } } },
                { header: "Name", key: "name", width: 25, style: { alignment: { horizontal: "left" } } },
                { header: "Email", key: "email", width: 30, style: { alignment: { horizontal: "left" } } },
                { header: "Mobile", key: "mobile", width: 18, style: { alignment: { horizontal: "left" } } },
                { header: "Event Name", key: "eventName", width: 25, style: { alignment: { horizontal: "left" } } },
                { header: "Ticket Type", key: "type", width: 35, style: { alignment: { horizontal: "left" } } },
                { header: "Category", key: "category", width: 15, style: { alignment: { horizontal: "left" } } },
                {
                    header: "Price",
                    key: "price",
                    width: 15,
                    style: {
                        numFmt: `"${currencySymbol}" #,##0.00`,
                        alignment: { horizontal: "right" }
                    }
                },
                { header: "Status", key: "status", width: 15, style: { alignment: { horizontal: "left" } } },
                { header: "Scanned Date", key: "date", width: 18, style: { alignment: { horizontal: "left" } } },
            ];

            // ✅ Header Style
            worksheet.getRow(1).eachCell(cell => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF343A40" }
                };
                cell.alignment = {
                    vertical: "middle",
                    horizontal: "center"
                };
            });

            worksheet.views = [{ state: "frozen", ySplit: 1 }];

            // ✅ Add Rows
            records.forEach((item, index) => {

                let type = "-";
                let category = "Unknown";

                if (item?.ticketPricing?.ticket?.title) {
                    type = item.ticketPricing.ticket.title;
                    category = "Ticket";
                } else if (item?.ticketType?.title) {
                    type = item.ticketType.title;
                    category = "Ticket";
                } else if (item?.addonType?.name) {
                    type = item.addonType.name;
                    category = "Addon";
                } else if (item?.package?.name) {
                    type = item.package.name;
                    category = "Package";
                } else if (item?.appointment?.wellnessList?.name) {
                    type = item?.appointment?.wellnessList?.name;
                    category = "Appointment";
                }

                const price =
                    item?.ticketPricing?.price ||
                    item?.ticketType?.price ||
                    item?.addonType?.price ||
                    item?.package?.grandtotal ||
                    item?.appointment?.price ||
                    0; // ✅ ALWAYS number

                worksheet.addRow({
                    srNo: index + 1,
                    name: `${item?.user?.first_name || ""} ${item?.user?.last_name || ""}`.trim(),
                    email: item?.user?.email || "-",
                    mobile: item?.user?.mobile || "-",
                    eventName: eventDetails.name || "-",
                    type: type,
                    category: category,
                    price: price,
                    status: item?.is_scanned === "Y" ? "Scanned" : "Not Scanned",
                    date: item?.scanned_date
                        ? moment(item.scanned_date).format("DD-MM-YYYY")
                        : "-"
                });
            });

            // ✅ Auto Filter
            worksheet.autoFilter = {
                from: "A1",
                to: "J1",
            };

            const buffer = await workbook.xlsx.writeBuffer();

            saveAs(
                new Blob([buffer]),
                `Attendees_${eventDetails.name}_${moment().format("YYYYMMDD_HHmmss")}.xlsx`
            );

        } catch (error) {
            console.error("Excel download failed:", error);
            Swal.fire("Error", "Failed to download Excel", "error");
        } finally {
            setExcelLoading(false);
        }
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">

                    {/* Sidebar */}
                    <EventSidebar eventId={eventId} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">

                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />

                                <h4 className="text-24">Attendees</h4>
                                <hr className="custom-hr" />
                                <Button
                                    variant="success"
                                    className="btn-sm d-flex align-items-center"
                                    onClick={handleDownloadAttendeesExcel}
                                    disabled={excelLoading}
                                >
                                    {excelLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-file-earmark-excel-fill me-2"></i>
                                            Download Attendees
                                        </>
                                    )}
                                </Button>

                                <div className="stripe-table mt-4 payment-table">

                                    <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                                        <h6 className="fw-bold">Total Attendees: {totalRecords}</h6>
                                    </div>

                                    {/* TABLE */}


                                    <div className="table-responsive">
                                        <table className="admin-table-deta-no-wrap table table-hover align-middle">

                                            {/* HEADER */}
                                            <thead className="bg-dark text-white">
                                                <tr>
                                                    <th style={{ padding: "12px" }}>#</th>
                                                    <th style={{ padding: "12px" }}>Customer</th>
                                                    <th style={{ padding: "12px" }}>Ticket Type</th>
                                                    <th style={{ padding: "12px" }}>Price</th>
                                                    <th style={{ padding: "12px" }}>Status</th>
                                                    <th style={{ padding: "12px" }} className="text-center">Date</th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {/* 🔄 Loader */}
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-5">
                                                            <div className="spinner-border text-primary" role="status"></div>
                                                            <p className="mt-4 text-muted">Loading attendees...</p>
                                                        </td>
                                                    </tr>
                                                ) : orderData.length === 0 ? (

                                                    /* ❌ No Data */
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-4 text-muted">
                                                            No attendees found.
                                                        </td>
                                                    </tr>

                                                ) : (

                                                    /* ✅ Data */
                                                    orderData.map((item, index) => {
                                                        const srNo = index + 1 + (currentPage - 1) * limit;
                                                        // 🔥 Type Logic (clean)
                                                        const type =
                                                            item?.ticketPricing?.ticket?.title ||
                                                            item?.ticketType?.title ||
                                                            item?.addonType?.name ||
                                                            item?.package?.name ||
                                                            item?.appointment?.wellnessList?.name ||
                                                            "-";

                                                        const category =
                                                            item?.ticketPricing?.ticket?.title || item?.ticketType?.title
                                                                ? "Ticket"
                                                                : item?.addonType?.name
                                                                    ? "Addon"
                                                                    : item?.package?.name
                                                                        ? "Package"
                                                                        : item?.appointment?.wellnessList?.name
                                                                            ? "Appointment"
                                                                            : "Unknown";

                                                        const Price =
                                                            item?.ticketPricing?.price ||
                                                            item?.ticketType?.price ||
                                                            item?.addonType?.price ||
                                                            item?.package?.grandtotal ||
                                                            item?.appointment?.price ||
                                                            "-";
                                                        // console.log("Price", Price)
                                                        return (
                                                            <tr key={index} style={{ borderBottom: "1px solid #f1f1f1" }}>

                                                                {/* 🔢 SR NO */}
                                                                <td className="fw-semibold">{srNo}</td>

                                                                {/* 👤 CUSTOMER */}
                                                                <td>
                                                                    <div className="fw-semibold text-dark">
                                                                        {item?.user?.first_name} {item?.user?.last_name}
                                                                    </div>
                                                                    <div className="text-muted" style={{ fontSize: "12px" }}>
                                                                        📞 {item?.user?.mobile || "-"}
                                                                    </div>
                                                                    <div className="text-muted" style={{ fontSize: "12px" }}>
                                                                        ✉️ {item?.user?.email || "-"}
                                                                    </div>
                                                                </td>

                                                                {/* 🎟️ TYPE */}
                                                                <td>
                                                                    <div className="fw-semibold">{type}</div>
                                                                    <div className="text-muted" style={{ fontSize: "12px" }}>
                                                                        ({category})
                                                                    </div>
                                                                </td>

                                                                <td>
                                                                    <div className="fw-semibold">{eventDetails?.currencyName?.Currency_symbol}{" "}{Price}</div>

                                                                </td>

                                                                {/* ✅ STATUS */}
                                                                <td>
                                                                    <span
                                                                        className="px-3 py-1 rounded-pill fw-semibold"
                                                                        style={{
                                                                            fontSize: "12px",
                                                                            display: "inline-flex",
                                                                            alignItems: "center",
                                                                            gap: "6px",
                                                                            backgroundColor:
                                                                                item?.is_scanned === "Y" ? "#e6f4ea" : "#fdecea",
                                                                            color:
                                                                                item?.is_scanned === "Y" ? "#1e7e34" : "#c62828",
                                                                            border: `1px solid ${item?.is_scanned === "Y" ? "#c3e6cb" : "#f5c6cb"
                                                                                }`
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                width: "6px",
                                                                                height: "6px",
                                                                                borderRadius: "50%",
                                                                                backgroundColor:
                                                                                    item?.is_scanned === "Y" ? "green" : "red",
                                                                                display: "inline-block"
                                                                            }}
                                                                        ></span>

                                                                        {item?.is_scanned === "Y" ? "Scanned" : "Not Scanned"}
                                                                    </span>
                                                                </td>

                                                                {/* 📅 DATE */}
                                                                <td className="text-center">
                                                                    {item?.scanned_date
                                                                        ? moment(item.scanned_date).format("DD MMM, YYYY")
                                                                        : (
                                                                            <span className="text-muted">---</span>
                                                                        )}
                                                                </td>

                                                            </tr>
                                                        );
                                                    })
                                                )}

                                            </tbody>
                                        </table>
                                    </div>

                                </div>

                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <button
                                            className="btn btn-outline-primary"
                                            disabled={currentPage === 1}
                                            onClick={() => goToPage(currentPage - 1)}
                                        >
                                            ⬅ Previous
                                        </button>

                                        <div className="fw-bold">Page {currentPage} / {totalPages}</div>

                                        <button
                                            className="btn btn-outline-primary"
                                            disabled={currentPage === totalPages}
                                            onClick={() => goToPage(currentPage + 1)}
                                        >
                                            Next ➜
                                        </button>
                                    </div>
                                )}

                            </section>

                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
};

export default ManageAttendees;
