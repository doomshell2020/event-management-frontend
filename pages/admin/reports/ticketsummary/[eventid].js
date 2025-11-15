// pages/admin/reports/accommodation-report.js

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/router';
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
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import DataTable from "react-data-table-component";
import dynamic from "next/dynamic";

import { CSVLink } from "react-csv";
import { Tooltip, IconButton, Switch } from "@mui/material";
import moment from "moment";
import ExcelJS from "exceljs";
import tinycolor from "tinycolor2";
import { saveAs } from "file-saver";

const DataTableExtensions = dynamic(
    () => import("react-data-table-component-extensions"),
    {
        ssr: false,
        // loading: () => <div>Loading DataTable ...</div>,
    }
);

function formatAmount(value) {
    const num = Number(value) || 0;
    if (num % 1 === 0) {
        return num.toLocaleString(); // e.g. 26,000
    }
    // If float, show 2 decimal places
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // e.g. 26,000.75
}

export const COLUMNS = [
    {
        name: "Sr No",
        selector: (row) => row.srno,
        sortable: true,
        width: "80px",
    },
    {
        name: "Order Number",
        selector: (row) => row.orderNumber,
        sortable: true,
    },
    {
        name: "Customer Name",
        selector: (row) => row.customerName,
        sortable: true,
    },
    {
        name: "Order Amount",
        selector: (row) => row.ticketPrice,
        sortable: true,
        cell: (row) => <div style={{ textAlign: "right", width: "100%" }}>{formatAmount(row.ticketPrice)}</div>,
    },
    {
        name: "Bank",
        selector: (row) => row.ticketBankFee,
        sortable: true,
        cell: (row) => <div style={{ textAlign: "right", width: "100%" }}>{formatAmount(row.ticketBankFee)}</div>,
    },
    {
        name: "Stripe",
        selector: (row) => row.ticketStripeFee,
        sortable: true,
        cell: (row) => <div style={{ textAlign: "right", width: "100%" }}>{formatAmount(row.ticketStripeFee)}</div>,
    },
    {
        name: "Processing",
        selector: (row) => row.ticketProcessingFee,
        sortable: true,
        cell: (row) => <div style={{ textAlign: "right", width: "100%" }}>{formatAmount(row.ticketProcessingFee)}</div>,
    },
    {
        name: "Platform",
        selector: (row) => row.ticketPlatformFee,
        sortable: true,
        cell: (row) => <div style={{ textAlign: "right", width: "100%" }}>{formatAmount(row.ticketPlatformFee)}</div>,
    },
    {
        name: "Total Amount",
        selector: (row) => row.ticketTotal,
        sortable: false,
        cell: (row) => <div style={{ textAlign: "right", width: "100%" }}>{formatAmount(row.ticketTotal)}</div>,
    },
];


// CSV conversion
function convertArrayOfObjectsToCSV(array) {
    let result = "";

    const columnDelimiter = ",";
    const lineDelimiter = "\n";

    // Filter out the 'id' field from the keys
    const keys = Object.keys(array[0]).filter((key) => key !== "id");

    // Add headers to the CSV (excluding 'id')
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    // Iterate through each row and exclude 'id' values
    array.forEach((item) => {
        let ctr = 0;
        keys.forEach((key) => {
            if (ctr > 0) result += columnDelimiter;

            // If the value is null or undefined, show an empty string
            result += item[key] === null || item[key] === undefined ? "" : item[key];

            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}
// CSV download
function downloadCSV(array, eventName) {
    const csv = convertArrayOfObjectsToCSV(array);
    if (csv == null) return;
    // Get the current date in the format DD-MM-YYYY
    const currentDate = new Date()
        .toLocaleDateString("en-GB")
        .split("/")
        .join("_");

    // Generate the filename using eventName and current date
    const filename = `${eventName}_${currentDate}_export.csv`;
    const csvData = `data:text/csv;charset=utf-8,${csv}`;

    // Create download link and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvData));
    link.setAttribute("download", filename);
    link.click();
}

const Export = ({ onExport }) => (
    <Button className="btn-sm" onClick={onExport}>
        Export CSV
    </Button>
);

const TicketSummaryReport = () => {

    const router = useRouter();
    const {
        eventid,
        firstName = "",
        email = "",
        phone = "",
        order = "",
        dateFrom = "",
        dateTo = "",
        housingID = ""
    } = router.query;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        firstName: "",
        email: "",
        phone: "",
        order: "",
        dateFrom: "",
        dateTo: "",
        housingID: ""
    });

    useEffect(() => {
        if (!eventid) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get("/api/v1/reports/ticketsummary", {
                    params: {
                        eventid,
                        firstName,
                        email,
                        phone,
                        order,
                        dateFrom,
                        dateTo,
                        housingID
                    }
                });

                setData(res.data?.data || []);
                setFilters({
                    firstName,
                    email,
                    phone,
                    order,
                    dateFrom,
                    dateTo,
                    housingID
                });
            } catch (err) {
                console.error("Error loading data from URL", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [eventid, firstName, email, phone, order, dateFrom, dateTo, housingID]);

    const customStyles = {
        headCells: {
            style: {
                fontWeight: 'bold',
                backgroundColor: '#f9f9f9',
                border: '1px solid #dee2e6',
                textAlign: 'right',
                justifyContent: 'flex-end',
            },
        },
        cells: {
            style: {
                textAlign: 'right',
                justifyContent: 'flex-end',
                border: '1px solid #dee2e6',
            },
        },
        rows: {
            style: {
                border: '1px solid #dee2e6',
            },
        },
    };

    let formattedData = [];
    if (Array.isArray(data)) {
        data.forEach((row, index) => {
            const addonPrice = row.totalAddonAmount || 0;
            const totalTicketAmount = row.totalTicketAmount || 0;
            const accommodationAmount = row.totalAccommodationAmount || 0;
            const ticketPrice = addonPrice + totalTicketAmount;

            let {
                ticketBankFee = 0,
                ticketStripeFee = 0,
                ticketProcessingFee = 0,
                ticketPlatformFee = 0,
                ticket_bank_fee_percentage = 0,
                ticket_platform_fee_percentage = 0,
                ticket_stripe_fee_percentage = 0,
                ticket_processing_fee_percentage = 0,
                accommodation_basePriceHousing = 0,
                total_night_stay = 0
            } = row;

            // Deduct taxes if accommodation is present
            if (accommodationAmount) {
                const baseAmount = (accommodation_basePriceHousing || 0) * (total_night_stay || 0);

                ticketBankFee -= (baseAmount * ticket_bank_fee_percentage) / 100;
                ticketStripeFee -= (baseAmount * ticket_stripe_fee_percentage) / 100;
                ticketProcessingFee -= (baseAmount * ticket_processing_fee_percentage) / 100;

                ticketBankFee = Math.max(ticketBankFee, 0);
                ticketStripeFee = Math.max(ticketStripeFee, 0);
                ticketProcessingFee = Math.max(ticketProcessingFee, 0);
            }

            const ticketTotal =
                parseFloat(ticketPrice) +
                parseFloat(ticketBankFee) +
                parseFloat(ticketStripeFee) +
                parseFloat(ticketProcessingFee) +
                parseFloat(ticketPlatformFee);

            formattedData.push({
                srno: index + 1,
                orderNumber: row?.OriginalTrxnIdentifier || "-",
                customerName: row?.User?.FirstName || "-",
                ticketPrice: parseFloat(ticketPrice.toFixed(2)),
                addonPrice: parseFloat(addonPrice.toFixed(2)),
                ticketBankFee: parseFloat(ticketBankFee.toFixed(2)),
                ticketStripeFee: parseFloat(ticketStripeFee.toFixed(2)),
                ticketProcessingFee: parseFloat(ticketProcessingFee.toFixed(2)),
                ticketPlatformFee: parseFloat(ticketPlatformFee.toFixed(2)),
                ticketTotal: parseFloat(ticketTotal.toFixed(2)),
                ticketPlatformFee,
                ticket_bank_fee_percentage,
                ticket_stripe_fee_percentage,
                ticket_processing_fee_percentage,
                ticket_platform_fee_percentage

            });
        });
    }

    let columns = [...COLUMNS]; // clone to modify safely

    if (formattedData.length > 0) {
        const {
            ticket_bank_fee_percentage,
            ticket_stripe_fee_percentage,
            ticket_processing_fee_percentage,
            ticket_platform_fee_percentage
        } = formattedData[0]; // use first row as base

        columns = columns.map((col) => {
            if (col.name === "Bank") {
                return {
                    ...col,
                    name: `Bank (${ticket_bank_fee_percentage}%)`,
                };
            }
            if (col.name === "Stripe") {
                return {
                    ...col,
                    name: `Stripe (${ticket_stripe_fee_percentage}%)`,
                };
            }
            if (col.name === "Processing") {
                return {
                    ...col,
                    name: `Processing (${ticket_processing_fee_percentage}%)`,
                };
            }
            if (col.name === "Platform") {
                return {
                    ...col,
                    name: `Platform (${ticket_platform_fee_percentage}%)`,
                };
            }
            return col;
        });
    }

    const totals = {
        ticketPrice: formattedData.reduce((acc, row) => acc + (Number(row.ticketPrice) || 0), 0),
        ticketBankFee: formattedData.reduce((acc, row) => acc + (Number(row.ticketBankFee) || 0), 0),
        ticketStripeFee: formattedData.reduce((acc, row) => acc + (Number(row.ticketStripeFee) || 0), 0),
        ticketProcessingFee: formattedData.reduce((acc, row) => acc + (Number(row.ticketProcessingFee) || 0), 0),
        ticketPlatformFee: formattedData.reduce((acc, row) => acc + (Number(row.ticketPlatformFee) || 0), 0),
        ticketTotal: formattedData.reduce((acc, row) => acc + (Number(row.ticketTotal) || 0), 0),
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const query = {
            firstName: filters.firstName,
            email: filters.email,
            phone: filters.phone,
            order: filters.order,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            housingID: filters.housingID,
        };

        // Remove empty fields
        Object.keys(query).forEach(key => {
            if (!query[key]) delete query[key];
        });

        router.push({
            pathname: `/admin/reports/ticketsummary/${eventid}`,
            query
        });
    };

    const handleFormReset = async () => {
        setFilters({ firstName: "", email: "" });
        router.push({
            pathname: `/admin/reports/ticketsummary/${eventid}`,
            query: {},
        });
    };

    const actionsMemo = useMemo(
        () => <Export onExport={() => downloadCSV(formattedData, 'testing')} />,
        [formattedData]
    );

    const getCurrentDate = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}_${month}_${year}`;
    };

    const filename = `${"ONDALINDA_TICKET_SUMMARY"}_${getCurrentDate()}.xlsx`;
    // Generate Excel
    const handleExport = async () => {
        if (!Array.isArray(formattedData)) {
            console.error("Invalid formattedData: Expected an array.");
            return;
        }


        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Orders");

        let bankPercent = 0;
        let stripePercent = 0;
        let processingPercent = 0;
        let platformPercent = 0;

        if (formattedData.length > 0) {
            const {
                ticket_bank_fee_percentage,
                ticket_stripe_fee_percentage,
                ticket_processing_fee_percentage,
                ticket_platform_fee_percentage
            } = formattedData[0];
            bankPercent = ticket_bank_fee_percentage;
            stripePercent = ticket_stripe_fee_percentage;
            processingPercent = ticket_processing_fee_percentage;
            platformPercent = ticket_platform_fee_percentage;
        }

        // Define headers dynamically
        worksheet.columns = [
            { header: "Sr No", key: "srno", width: 10 },
            { header: "Order Number", key: "orderNumber", width: 25 },
            { header: "Customer Name", key: "customerName", width: 25 },
            { header: "Order Amount", key: "ticketPrice", width: 15 },
            { header: `Bank (${bankPercent}%)`, key: "ticketBankFee", width: 15 },
            { header: `Stripe (${stripePercent}%)`, key: "ticketStripeFee", width: 15 },
            { header: `Processing (${processingPercent}%)`, key: "ticketProcessingFee", width: 20 },
            { header: `Platform (${platformPercent}%)`, key: "ticketPlatformFee", width: 20 },
            { header: "Total Amount", key: "ticketTotal", width: 18 },
        ];

        // Style header row
        worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF000000" },
                bgColor: { argb: "FFFFFFFF" },
            };
            cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        worksheet.autoFilter = "A1:I1";
        worksheet.views = [{ state: "frozen", ySplit: 1 }];

        // Add data rows
        formattedData.forEach((item) => {
            worksheet.addRow({
                srno: item.srno,
                orderNumber: item.orderNumber,
                customerName: item.customerName,
                ticketPrice: item.ticketPrice,
                ticketBankFee: item.ticketBankFee,
                ticketStripeFee: item.ticketStripeFee,
                ticketProcessingFee: item.ticketProcessingFee,
                ticketPlatformFee: item.ticketPlatformFee,
                ticketTotal: item.ticketTotal,
            });
        });

        // Format number cells (NO $ and NO comma)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            [4, 5, 6, 7, 8, 9].forEach((colIndex) => {
                const cell = row.getCell(colIndex);
                cell.numFmt = '0.00'; // Plain decimal format without $, commas
                cell.alignment = { horizontal: "right" };
            });
        });

        // Calculate totals
        const totals = {
            ticketPrice: 0,
            ticketBankFee: 0,
            ticketStripeFee: 0,
            ticketProcessingFee: 0,
            ticketPlatformFee: 0,
            ticketTotal: 0,
        };

        formattedData.forEach(item => {
            totals.ticketPrice += parseFloat(item.ticketPrice || 0);
            totals.ticketBankFee += parseFloat(item.ticketBankFee || 0);
            totals.ticketStripeFee += parseFloat(item.ticketStripeFee || 0);
            totals.ticketProcessingFee += parseFloat(item.ticketProcessingFee || 0);
            totals.ticketPlatformFee += parseFloat(item.ticketPlatformFee || 0);
            totals.ticketTotal += parseFloat(item.ticketTotal || 0);
        });

        // Add total row at the end
        const totalRow = worksheet.addRow({
            srno: "Total",
            ticketPrice: totals.ticketPrice,
            ticketBankFee: totals.ticketBankFee,
            ticketStripeFee: totals.ticketStripeFee,
            ticketProcessingFee: totals.ticketProcessingFee,
            ticketPlatformFee: totals.ticketPlatformFee,
            ticketTotal: totals.ticketTotal,
        });

        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF9F9F9" },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
            if ([4, 5, 6, 7, 8, 9].includes(colNumber)) {
                cell.numFmt = '0.00'; // again, plain number format
                cell.alignment = { horizontal: "right" };
            }
        });

        // Export the file
        try {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, filename);
        } catch (err) {
            console.error("Error creating Excel file:", err);
        }
    };


    return (
        <>
            <Seo title={"Ticket Summary Report"} />
            <ToastContainer />

            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Ticket Summary Report
                    </span>
                </div>

                <div className="justify-content-between d-flex mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Ticket Summary Report
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <Row className="row-sm mt-4">
                <Col xl={2}>
                    <Card className="member-fltr-hid">
                        <Card.Header>
                            <h4 className="card-title mg-b-0">Filters</h4>
                        </Card.Header>
                        <Card.Body className="p-2">
                            <Form onSubmit={handleFormSubmit} onReset={handleFormReset}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Order</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Order Number"
                                        value={filters.order}
                                        onChange={(e) => setFilters({ ...filters, order: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="First Name"
                                        value={filters.firstName}
                                        onChange={(e) => setFilters({ ...filters, firstName: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Mobile</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Mobile"
                                        value={filters.phone}
                                        onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Email"
                                        value={filters.email}
                                        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Date From</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={filters.dateFrom}
                                        max={filters.dateTo || ""}
                                        onChange={(e) =>
                                            setFilters({ ...filters, dateFrom: e.target.value })
                                        }
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Date To</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={filters.dateTo}
                                        min={filters.dateFrom || ""}
                                        onChange={(e) =>
                                            setFilters({ ...filters, dateTo: e.target.value })
                                        }
                                    />
                                </Form.Group>

                                <div className="d-flex align-items-end justify-content-between">
                                    <Button variant="primary" className="me-2 w-50" type="submit">
                                        Submit
                                    </Button>
                                    <Button variant="secondary" className="w-50" type="reset">
                                        Reset
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={10}>
                    <Card>
                        <Card.Header>
                            <div className="d-flex flex-wrap justify-content-between">
                                <h4 className="card-title card-t evnt-mbr mg-b-0">
                                    Ticket Summary Report
                                </h4>
                                <button
                                    variant=""
                                    className="btn exel-btn-scn-tct btn-sm my-1 btn-success"
                                    style={{
                                        color: "white",
                                        border: "none",
                                    }}
                                    type="button"
                                    onClick={handleExport}
                                >
                                    <i className="bi bi-file-earmark-excel-fill me-1"></i>
                                    Generate Excel
                                </button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-2">
                            {loading ? (
                                <div className="text-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <>
                                    <DataTableExtensions columns={columns} data={formattedData}>
                                        <DataTable
                                            columns={COLUMNS}
                                            data={formattedData}
                                            // actions={actionsMemo}
                                            pagination
                                            highlightOnHover
                                            striped
                                            customStyles={customStyles}
                                            paginationPerPage={50} // ✅ default rows per page
                                            paginationRowsPerPageOptions={[50, 100, 200, 500]} // ✅ dropdown options
                                        />
                                    </DataTableExtensions>

                                    {
                                        formattedData.length > 0 && (
                                            <table className="table table-bordered table-sm w-100">
                                                <tfoot>
                                                    <tr className="fw-bold" style={{ background: "#f9f9f9" }}>
                                                        <td style={{ width: "100px", border: "1px solid #dee2e6" }}>Total</td>
                                                        <td style={{ width: "100px", border: "1px solid #dee2e6" }}></td>
                                                        <td style={{ width: "150px", border: "1px solid #dee2e6" }}></td>
                                                        <td className="text-end" style={{ width: "130px", border: "1px solid #dee2e6" }}>{formatAmount(totals.ticketPrice)}</td>
                                                        <td className="text-end" style={{ width: "120px", border: "1px solid #dee2e6" }}>{formatAmount(totals.ticketBankFee)}</td>
                                                        <td className="text-end" style={{ width: "120px", border: "1px solid #dee2e6" }}>{formatAmount(totals.ticketStripeFee)}</td>
                                                        <td className="text-end" style={{ width: "140px", border: "1px solid #dee2e6" }}>{formatAmount(totals.ticketProcessingFee)}</td>
                                                        <td className="text-end" style={{ width: "130px", border: "1px solid #dee2e6" }}>{formatAmount(totals.ticketPlatformFee)}</td>
                                                        <td className="text-end" style={{ width: "130px", border: "1px solid #dee2e6" }}>{formatAmount(totals.ticketTotal)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        )
                                    }

                                </>
                            )}
                        </Card.Body>

                    </Card>
                </Col>
            </Row>
        </>
    );
};

TicketSummaryReport.layout = "Contentlayout";

export default TicketSummaryReport;
