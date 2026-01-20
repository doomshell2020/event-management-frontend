import React, { useState, useEffect, useMemo } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Moment from "react-moment";
import api from "@/utils/api";
import EventSidebar from "../../components/Event/EventSidebar";
import { useRouter } from "next/router";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
import { Button } from "react-bootstrap";
import { formatDate } from "@/utils/formatDate";
export default function Appointments() {
    const router = useRouter();

    const [codes, setCodes] = useState([]);
    const [events, setEvents] = useState([]);
    const [eventId, setEventId] = useState(router.query.event_id);
    const [eventName, setEventName] = useState("");
    const [loading, setLoading] = useState(true);
    const [excelLoading, setExcelLoading] = useState(false);
    /* ---------------- Pagination States ---------------- */
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    /* ---------------- Fetch Promotion Codes ---------------- */
    const fetchCodes = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/coupons/event/${eventId}`);
            if (res.data.success) {
                setCodes(res.data.coupons || []);
                setCurrentPage(1); // reset page on new fetch
            } else {
                setCodes([]);
            }
        } catch (error) {
            console.error("Error fetching codes:", error);
            setCodes([]);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- Fetch Events ---------------- */
    const getEvents = async () => {
        try {
            const { data } = await api.get("/api/v1/admin/email-templates/events");
            setEvents(data?.data.events || []);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    useEffect(() => {
        if (eventId)
            fetchCodes();
        getEvents();
    }, [eventId]);

    useEffect(() => {
        if (events.length > 0) {
            const foundEvent = events.find(
                (ev) => String(ev.id) === String(eventId)
            );
            setEventName(foundEvent?.name || "");
        }
    }, [events, eventId]);

    /* ---------------- Pagination Calculations ---------------- */
    const getVisiblePages = () => {
        const pages = [];

        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }

        let start = currentPage - 1;
        let end = currentPage + 1;

        if (start < 1) {
            start = 1;
            end = 3;
        }

        if (end > totalPages) {
            end = totalPages;
            start = totalPages - 2;
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };


    const totalPages = Math.ceil(codes.length / itemsPerPage);

    const paginatedCodes = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return codes.slice(start, start + itemsPerPage);
    }, [codes, currentPage]);



    const handleDownloadPromotionCodesExcel = async () => {
        if (!eventId) return;

        setExcelLoading(true);

        try {
            const response = await api.get(`/api/v1/coupons/event/${eventId}`);
            const records = response.data?.coupons || [];
            if (!records.length) {
                Swal.fire("Info", "No promotion codes found", "info");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Promotion Codes");

            /* ---------------- Excel Columns ---------------- */
            worksheet.columns = [
                { header: "S.No", key: "srNo", width: 8 },
                { header: "Promotion Code", key: "promoCode", width: 22 },
                { header: "Discount", key: "discount", width: 15 },
                { header: "Duration", key: "duration", width: 15 },
                { header: "Applicable", key: "applicable", width: 18 },
                { header: "Start On", key: "startOn", width: 18 },
                { header: "Expires On", key: "expiresOn", width: 18 },
                { header: "Created On", key: "createdOn", width: 18 },
                { header: "Usage", key: "usage", width: 12 }
            ];

            /* ---------------- Header Styling ---------------- */
            worksheet.getRow(1).eachCell(cell => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF000000" }
                };
                cell.alignment = {
                    vertical: "middle",
                    horizontal: "center"
                };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });

            worksheet.views = [{ state: "frozen", ySplit: 1 }];

            /* ---------------- Data Rows ---------------- */
            records.forEach((item, index) => {
                worksheet.addRow({
                    srNo: index + 1,
                    promoCode: item.PromoCode,
                    discount: item.Discount,
                    duration: item.Duration,
                    applicable: item.ApplicableFor,
                    startOn:
                        item.Duration === "Unlimited"
                            ? "N/A"
                            : moment(item.StartOn).format("DD-MMM-YYYY"),
                    expiresOn:
                        item.Duration === "Unlimited"
                            ? "N/A"
                            : moment(item.ExpiresOn).format("DD-MMM-YYYY"),
                    createdOn: moment(item.CreatedOn).format("DD-MMM-YYYY"),
                    usage: item.Usage
                });
            });

            /* ---------------- Download ---------------- */
            const buffer = await workbook.xlsx.writeBuffer();

            saveAs(
                new Blob([buffer]),
                `Promotion_Codes_${eventName}_${moment().format(
                    "YYYYMMDD_HHmmss"
                )}.xlsx`
            );

        } catch (error) {
            console.error("Excel download failed:", error);
        } finally {
            setExcelLoading(false);
        }
    };


    return (
        <>
            <FrontendHeader backgroundImage="/assets/front-images/about-slider_bg.jpg" />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar />

                    <div className="event-righcontent">
                        <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-center mb-4">
                            <h4 className="mb-0">Promotion Codes || {eventName}</h4>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className="primery-button fw-normal px-2 text-white"
                                    style={{ backgroundColor: "#00ad00" }}
                                    onClick={() => router.push(`/promotioncodes/${eventId}/create`)}
                                >
                                    <i className="bi bi-gift-fill pe-1"></i>
                                    Create Promotion Codes
                                </button>

                                <Button
                                    variant="success"
                                    className="btn-sm d-flex align-items-center"
                                    onClick={handleDownloadPromotionCodesExcel}
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
                                            Download Codes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 ">
                                <thead className="table-dark table_bg">
                                    <tr>
                                        <th>S.No</th>
                                        <th>Promotion Code</th>
                                        <th>Discount</th>
                                        <th>Duration</th>
                                        <th>Applicable</th>
                                        <th>Start On</th>
                                        <th>Expires On</th>
                                        <th>Created On</th>
                                        <th>Usage</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4">
                                                <div className="spinner-border text-primary"></div>
                                                <div>Loading Codes...</div>
                                            </td>
                                        </tr>
                                    ) : paginatedCodes.length > 0 ? (
                                        paginatedCodes.map((value, index) => (
                                            <tr key={value.id}>
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="fw-semibold text-primary">{value.PromoCode}</td>
                                                <td>{value.Discount}</td>
                                                <td>{value.Duration}</td>
                                                <td>{value.ApplicableFor}</td>
                                                <td>
                                                    {value.Duration === "Unlimited"
                                                        ? "N/A"
                                                        : formatDate(value.StartOn)}
                                                </td>
                                                <td>
                                                    {value.Duration === "Unlimited"
                                                        ? "N/A"
                                                        : formatDate(value.ExpiresOn)}
                                                </td>
                                                <td>
                                                    {formatDate(value.CreatedOn)}
                                                </td>
                                                <td>{value.Usage}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4 fw-bold text-muted">
                                                No Promotion Codes Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ---------------- Pagination UI ---------------- */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-end mt-3 gap-2">

                                {/* Previous */}
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    Previous
                                </button>

                                {/* Page Numbers (Only 3 Visible) */}
                                {getVisiblePages().map((page) => (
                                    <button
                                        key={page}
                                        className={`btn btn-sm ${currentPage === page
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                            }`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* Next */}
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
}
