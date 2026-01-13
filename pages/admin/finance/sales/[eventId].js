import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    Row,
    Col,
    Card,
    Tabs,
    Tab,
    Table,
    Spinner,
    Form,
    Button
} from "react-bootstrap";
import Seo from "@/shared/layout-components/seo/seo";
import ClipLoader from "react-spinners/ClipLoader";
import api from "@/utils/api";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";

const SalePerMonths = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { eventId } = router.query; // Retrieve the event ID from the URL
    const [eventData, setEventData] = useState();
    const [excelLoading, setExcelLoading] = useState(false);
    useEffect(() => {
        if (eventId) {
            const fetchTicketTypes = async () => {
                try {
                    setIsLoading(true);
                    const response = await api.get(`/api/v1/admin/finance/sales/monthly/${eventId}`);
                    setEventData(response.data.data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTicketTypes();
        }
    }, [eventId]);


    // download excel......
    const handleDownloadMonthlyExcel = async (report) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sales Per Month");

            const currency = report?.event?.currency_symbol || "";
            const monthsArray = report?.months || [];

            /* ================= NORMALIZE ================= */
            const ordersByMonth = {};
            monthsArray.forEach(m => {
                ordersByMonth[m.month] = m;
            });

            const months = Object.keys(ordersByMonth);
            const gross = report?.gross_total || {};

            /* ================= TITLE ================= */
            worksheet.mergeCells(1, 1, 1, months.length + 2);
            worksheet.getCell("A1").value =
                `${report?.event?.name || "Event"} - Sales By Months`;
            worksheet.getCell("A1").font = { size: 14, bold: true };
            worksheet.getCell("A1").alignment = { horizontal: "center" };
            worksheet.addRow([]);

            /* ================= HEADER ================= */
            worksheet.addRow([
                "Months",
                "Gross Total",
                ...months
            ]).font = { bold: true };

            /* ================= COUNT ROWS ================= */
            const addCountRow = (label, grossKey, monthKey) => {
                worksheet.addRow([
                    label,
                    gross[grossKey] || 0,
                    ...months.map(m => ordersByMonth[m]?.[monthKey] || 0)
                ]);
            };

            addCountRow("Tickets", "tickets", "tickets");
            addCountRow("Addons", "addons", "addons");
            addCountRow("Packages", "packages", "packages");
            addCountRow("Appointments", "appointments", "appointments");
            addCountRow("Committees", "committees", "committees");
            addCountRow("Comps", "comps", "comps");

            /* ================= AMOUNT ROWS ================= */
            const addAmountRow = (label, grossKey, monthKey) => {
                worksheet.addRow([
                    `${label} (${currency})`,
                    `${currency}${Number(gross[grossKey] || 0).toLocaleString()}`,
                    ...months.map(
                        m =>
                            `${currency}${Number(
                                ordersByMonth[m]?.[monthKey] || 0
                            ).toLocaleString()}`
                    )
                ]);
            };

            addAmountRow("Face Value", "face_value", "face_value");
            addAmountRow("Tax", "tax", "tax");
            addAmountRow("Gross Amount", "gross_amount", "gross_amount");
            addAmountRow("Cancellation Amount", "cancel_amount", "cancel_amount");

            /* ================= NET ================= */
            worksheet.addRow([
                "Net Amount Received",
                `${currency}${Number(report?.net_amount_received || 0).toLocaleString()}`
            ]).font = { bold: true };

            /* ================= STYLING ================= */
            worksheet.eachRow(row => {
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" }
                    };
                    cell.alignment = {
                        vertical: "middle",
                        horizontal: "center"
                    };
                });
            });

            worksheet.columns.forEach(col => {
                let max = 12;
                col.eachCell({ includeEmpty: true }, cell => {
                    const len = cell.value ? cell.value.toString().length : 10;
                    max = Math.max(max, len + 2);
                });
                col.width = max;
            });

            /* ================= SAVE ================= */
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(
                new Blob([buffer]),
                `Sales_By_Months_${report?.event?.name || "Event"}_${moment().format(
                    "YYYYMMDD_HHmmss"
                )}.xlsx`
            );

        } catch (error) {
            console.error("Excel download failed:", error);
            alert("Something went wrong while generating the Excel file.");
        }
    };







    return (
        <>
            <Seo title={"Sales Summary Months"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <div className="Mmbr-card">
                        <Card>
                            <Card.Header className="ps-3 pb-2 d-flex justify-content-between align-items-center">
                                <h4 className="card-title mg-b-5">Sales By Months</h4>

                                <Button
                                    variant="success"
                                    className="btn-sm d-flex align-items-center"
                                    onClick={() => handleDownloadMonthlyExcel(eventData)}
                                    disabled={excelLoading}
                                >
                                    {excelLoading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-file-earmark-excel-fill me-2"></i>
                                            Download
                                        </>
                                    )}
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                <Tabs defaultActiveKey="summary" id="sales-per-months">
                                    <Tab eventKey="summary" title="Sales By Months">
                                        {isLoading ? (
                                            <div className="d-flex justify-content-center">
                                                <ClipLoader
                                                    loading={isLoading}
                                                    color="#36d7b7"
                                                    aria-label="Loading Spinner"
                                                />
                                            </div>
                                        ) : (
                                            (() => {
                                                /* =========================
                                                   NORMALIZE API RESPONSE
                                                ========================= */
                                                const report = eventData || {};
                                                const currency = report?.event?.currency_symbol || "";
                                                const monthsArray = report?.months || [];

                                                const ordersByMonth = {};
                                                monthsArray.forEach(m => {
                                                    ordersByMonth[m.month] = m;
                                                });

                                                const months = Object.keys(ordersByMonth);
                                                const gross = report?.gross_total || {};

                                                return (
                                                    <div className="admin-financeMain">
                                                        <Table striped bordered hover className="responsive-table">
                                                            <tbody>

                                                                {/* EVENT NAME */}
                                                                <tr>
                                                                    <th colSpan={months.length + 2}>
                                                                        <strong>{report?.event?.name || "Event"}</strong>
                                                                    </th>
                                                                </tr>

                                                                {/* MONTH HEADER */}
                                                                <tr>
                                                                    <th>Months</th>
                                                                    <th style={{ textAlign: "center" }}>Gross Total</th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "center" }}>
                                                                            <strong>{m}</strong>
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* TICKETS */}
                                                                <tr>
                                                                    <th>Tickets</th>
                                                                    <th style={{ textAlign: "right" }}>{gross.tickets || 0}</th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {ordersByMonth[m]?.tickets || 0}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* ADDONS */}
                                                                <tr>
                                                                    <th>Addons</th>
                                                                    <th style={{ textAlign: "right" }}>{gross.addons || 0}</th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {ordersByMonth[m]?.addons || 0}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* PACKAGES */}
                                                                <tr>
                                                                    <th>Packages</th>
                                                                    <th style={{ textAlign: "right" }}>{gross.packages || 0}</th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {ordersByMonth[m]?.packages || 0}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* APPOINTMENTS */}
                                                                <tr>
                                                                    <th>Appointments</th>
                                                                    <th style={{ textAlign: "right" }}>{gross.appointments || 0}</th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {ordersByMonth[m]?.appointments || 0}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* committees */}
                                                                <tr>
                                                                    <th>committee</th>
                                                                    <th style={{ textAlign: "right" }}>{gross.committees || 0}</th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {ordersByMonth[m]?.committees || 0}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                                {/* comps(free) */}
                                                                <tr>
                                                                    <th>Comps</th>
                                                                    <th style={{ textAlign: "right" }}>{gross.comps || 0}</th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {ordersByMonth[m]?.comps || 0}
                                                                        </td>
                                                                    ))}
                                                                </tr>


                                                                {/* FACE VALUE */}
                                                                <tr>
                                                                    <th>Face Value ({currency})</th>
                                                                    <th style={{ textAlign: "right" }}>
                                                                        {currency}{Number(gross.face_value || 0).toLocaleString()}
                                                                    </th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {currency}
                                                                            {Number(ordersByMonth[m]?.face_value || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* TAX */}
                                                                <tr>
                                                                    <th>Tax ({currency})</th>
                                                                    <th style={{ textAlign: "right" }}>
                                                                        {currency}{Number(gross.tax || 0).toLocaleString()}
                                                                    </th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {currency}
                                                                            {Number(ordersByMonth[m]?.tax || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* GROSS AMOUNT */}
                                                                <tr>
                                                                    <th>Gross Amount ({currency})</th>
                                                                    <th style={{ textAlign: "right" }}>
                                                                        {currency}{Number(gross.gross_amount || 0).toLocaleString()}
                                                                    </th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {currency}
                                                                            {Number(ordersByMonth[m]?.gross_amount || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* CANCELLATION */}
                                                                <tr>
                                                                    <th>Total Amount (Cancellation)</th>
                                                                    <th style={{ textAlign: "right" }}>
                                                                        {currency}{Number(gross.cancel_amount || 0).toLocaleString()}
                                                                    </th>
                                                                    {months.map(m => (
                                                                        <td key={m} style={{ textAlign: "right" }}>
                                                                            {currency}
                                                                            {Number(ordersByMonth[m]?.cancel_amount || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* NET AMOUNT */}
                                                                <tr>
                                                                    <th>Net Amount Received</th>
                                                                    <th style={{ textAlign: "right" }}>
                                                                        {currency}
                                                                        {Number(report?.net_amount_received || 0).toLocaleString()}
                                                                    </th>
                                                                </tr>

                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>

                    </div>
                </Col>
            </Row>

        </>
    );
};

SalePerMonths.layout = "Contentlayout";

export default SalePerMonths;
