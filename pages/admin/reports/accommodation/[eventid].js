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
const DataTableExtensions = dynamic(
    () => import("react-data-table-component-extensions"),
    {
        ssr: false,
        // loading: () => <div>Loading DataTable ...</div>,
    }
);

import { CSVLink } from "react-csv";
import { Tooltip, IconButton, Switch } from "@mui/material";
import Moment from "react-moment";
import moment from "moment"; // Make sure moment is installed and imported
import ExcelJS from "exceljs";
import tinycolor from "tinycolor2";
import { saveAs } from "file-saver";

export const COLUMNS = [
    {
        name: "#",
        selector: (row) => row.SNo,
        sortable: true,
        width: "60px",
    },
    {
        name: "Order Number",
        selector: (row) => row.Order,
        sortable: true,
    },
    {
        name: "Name",
        selector: (row) => row.Name,
        sortable: true,
    },
    {
        name: "Mobile",
        selector: (row) => row.Mobile,
        sortable: true,
    },
    {
        name: "Email",
        selector: (row) => row.Email,
        sortable: true,
    },
    {
        name: "Housing",
        selector: (row) => row.Housing,
        sortable: true,
    },
    {
        name: "Type",
        selector: (row) => row.Type,
        sortable: true,
    },
    {
        name: "Title",
        selector: (row) => row.Title,
        sortable: true,
    },
    {
        name: "Date",
        selector: (row) => row?.Date, // still needed for sorting
        sortable: true,
        cell: (row) => (
            <Moment format="DD-MMM-YYYY" utc>
                {row?.Date}
            </Moment>
        ),
    }
];

function formatAmount(value) {
    const num = Number(value) || 0;
    if (num % 1 === 0) {
        return num.toLocaleString(); // e.g. 26,000
    }
    // If float, show 2 decimal places
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // e.g. 26,000.75
}


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


const AccommodationReport = () => {

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
    const [housingList, setHousingList] = useState([]);
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
                const res = await axios.get("/api/v1/reports/accommodation", {
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
                setHousingList(res.data?.uniqueHousingList || []);
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

    const formattedData = [];
    let serialNumber = 1;

    if (Array.isArray(data)) {
        data.forEach((row) => {
            const baseData = {
                Order: row?.OriginalTrxnIdentifier || "-",
                Name: row?.User?.FirstName || "-",
                Mobile: row?.User?.PhoneNumber || "-",
                Email: row?.User?.Email || "-",
                Housing: row?.BookAccommodationInfo?.Housing?.Name || "-",
                Date: row?.createdAt,
            };

            if (row.TicketBooks?.length > 0) {
                row.TicketBooks.forEach((ticket) => {
                    formattedData.push({
                        SNo: serialNumber++,
                        ...baseData,
                        Type: "Ticket",
                        Title: ticket?.EventTicketType?.title || "-",
                    });
                });
            }

            if (row.AddonBooks?.length > 0) {
                row.AddonBooks.forEach((addon) => {
                    formattedData.push({
                        SNo: serialNumber++,
                        ...baseData,
                        Type: "Addon",
                        Title: addon?.Addon?.name || "-",
                    });
                });
            }

            if ((row.TicketBooks?.length || 0) === 0 && (row.AddonBooks?.length || 0) === 0) {
                formattedData.push({
                    SNo: serialNumber++,
                    ...baseData,
                    Type: "Accommodation",
                    Title: "-",
                });
            }
        });
    }

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
            pathname: `/admin/reports/accommodation/${eventid}`,
            query
        });
    };

    const handleFormReset = async () => {
        setFilters({ firstName: "", email: "" });
        router.push({
            pathname: `/admin/reports/accommodation/${eventid}`,
            query: {},
        });
    };

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

    const filename = `ONDALINDA_TICKET_SUMMARY_${getCurrentDate()}.xlsx`;

    const handleExport = async () => {

        if (!Array.isArray(formattedData)) {
            console.error("Invalid formattedData: Expected an array.");
            return;
        }

        // console.log('>>>>>>>>', formattedData);
        // return false

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Orders");

        // ✅ Define Excel headers matching your formattedData keys
        worksheet.columns = [
            { header: "Sr No", key: "SNo", width: 10 },
            { header: "Order Number", key: "Order", width: 25 },
            { header: "Customer Name", key: "Name", width: 25 },
            { header: "Mobile", key: "Mobile", width: 20 },
            { header: "Email", key: "Email", width: 30 },
            { header: "Housing", key: "Housing", width: 25 },
            { header: "Date", key: "Date", width: 15 },
            { header: "Type", key: "Type", width: 15 },
            { header: "Ticket Title", key: "Title", width: 25 },
        ];

        // ✅ Style header row
        worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF000000" },
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

        // ✅ Add each data row
        formattedData.forEach((item) => {
            worksheet.addRow({
                SNo: item.SNo,
                Order: item.Order,
                Name: item.Name,
                Mobile: item.Mobile,
                Email: item.Email,
                Housing: item.Housing,
                Date: moment(item.Date).format("DD-MM-YYYY"),
                Type: item.Type,
                Title: item.Title,
            });
        });

        // ✅ Export the file
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
            <Seo title={"Accommodation Report"} />
            <ToastContainer />

            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Accommodation Report
                    </span>
                </div>

                <div className="justify-content-between d-flex mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Accommodation Report
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
                                    <Form.Label>Housing</Form.Label>
                                    <Form.Select
                                        value={filters.housingID}
                                        onChange={(e) => setFilters({ ...filters, housingID: e.target.value })}
                                    >
                                        <option value="">Select Housing</option>
                                        {housingList.map((housing) => (
                                            <option key={housing.ID} value={housing.ID}>
                                                {housing.name}
                                            </option>
                                        ))}
                                    </Form.Select>
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
                                    Accommodation Report
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
                                <DataTableExtensions
                                    columns={COLUMNS}
                                    data={formattedData}
                                >
                                    <DataTable
                                        columns={COLUMNS}
                                        data={formattedData}
                                        pagination
                                        highlightOnHover
                                        striped
                                        customStyles={customStyles}
                                        paginationPerPage={50} // ✅ default rows per page
                                        paginationRowsPerPageOptions={[50, 100, 200, 500]} // ✅ dropdown options
                                    />
                                </DataTableExtensions>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

AccommodationReport.layout = "Contentlayout";

export default AccommodationReport;
