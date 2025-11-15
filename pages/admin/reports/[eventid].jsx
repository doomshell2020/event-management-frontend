import { useRouter } from 'next/router';
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect, useMemo } from "react";
import {
    Button,
    Form,
    Modal,
    Table,
    Card,
    Row,
    Col,
    Breadcrumb,
    Alert,
    Collapse,
    Spinner,
    ButtonGroup,
    Dropdown,
} from "react-bootstrap";
import axios from 'axios';
import DataTable from "react-data-table-component";
import dynamic from "next/dynamic";

import { CSVLink } from "react-csv";
import { Tooltip, IconButton, Switch } from "@mui/material";
import moment from "moment";
import ExcelJS from "exceljs";
import tinycolor from "tinycolor2";
import { saveAs } from "file-saver";

const EventReportPage = () => {
    const router = useRouter();
    const { eventid, name } = router.query;


    const handleDownloadOrdersExcel = async () => {
        if (!eventid) return;

        try {
            const formData = new FormData();
            formData.append("key", "download_excel");
            formData.append("eventid", eventid); // You can also use eventName if needed

            const response = await axios.post("/api/v1/events", formData);
            const orders = response.data?.data || [];
            if (orders.length === 0) {
                alert("No data found for this event.");
                return;
            }

            // Create Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Orders");

            worksheet.columns = [
                { header: "Order ID", key: "OriginalTrxnIdentifier", width: 20 },
                { header: "Email", key: "User.Email", width: 25 },
                { header: "Amount", key: "actualamount", width: 15 },
                { header: "Payment Type", key: "paymenttype", width: 15 },
                { header: "Created At", key: "createdAt", width: 20 },
            ];

            // Flatten nested user email
            orders.forEach((order) => {
                worksheet.addRow({
                    OriginalTrxnIdentifier: order.OriginalTrxnIdentifier,
                    "User.Email": order?.User?.Email || "-",
                    actualamount: order.actualamount,
                    paymenttype: order.paymenttype,
                    createdAt: moment(order.createdAt).format("YYYY-MM-DD HH:mm"),
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(blob, `Orders_Report_${name}.xlsx`);
        } catch (err) {
            console.error("Excel download failed:", err);
            alert("Failed to download Excel.");
        }
    };

    return (
        <>
            <Seo title="Reports" />
            <ToastContainer />

            <Breadcrumb className="mb-4">
                <Breadcrumb.Item href="/admin/dashboard">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item active>Reports</Breadcrumb.Item>
            </Breadcrumb>

            <Row className="row-sm">
                <Col xl={12}>
                    <Card className="p-4 shadow-sm border-0">
                        <div className="mb-3">
                            <h5 className="text-dark fw-semibold mb-0">
                                <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
                                Reports for: <span className="text-muted">{name || '...'}</span>
                            </h5>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                            <Link
                                href={`/admin/reports/ticketsummary/${eventid}`}
                                className="btn btn-sm btn-outline-primary d-flex align-items-center"
                            >
                                <i className="bi bi-ticket-perforated-fill me-2"></i>
                                Ticket Summary
                            </Link>

                            <Link
                                href={`/admin/reports/accommodation/${eventid}`}
                                className="btn btn-sm btn-outline-success d-flex align-items-center"
                            >
                                <i className="bi bi-house-door-fill me-2"></i>
                                Accommodation
                            </Link>

                            {/* <Button
                                onClick={handleDownloadOrdersExcel}
                                className="btn btn-sm btn-outline-success d-flex align-items-center"
                            >
                                <i className="bi bi-house-door-fill me-2"></i>
                                Orders Details
                            </Button> */}


                            {/* <Link
                                href={`/admin/reports/bookedproperty/${eventid}`}
                                className="btn btn-sm btn-outline-warning d-flex align-items-center"
                            >
                                <i className="bi bi-building-check me-2"></i>
                                Booked Property
                            </Link> */}
                        </div>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

EventReportPage.layout = "Contentlayout";

export default EventReportPage;
