import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "react-bootstrap"; // Using Bootstrap spinner
import Swal from "sweetalert2";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import api from "@/utils/api";
import Moment from "react-moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
// 🔹 ApexCharts (SSR disabled)
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DashboardPage = () => {
    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [dashboardData, setDashboardData] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [eventFilter, setEventFilter] = useState("all");
    const [excelLoading, setExcelLoading] = useState(false);

    /* ---------------- CLIENT CHECK ---------------- */
    useEffect(() => setIsClient(true), []);

    /* ---------------- DASHBOARD DATA ---------------- */

    useEffect(() => {
        const fetchEventData = async () => {
            setLoading(true);
            try {
                let dashRes;
                if (selectedEventId) {

                    dashRes = await api.get(
                        `/api/v1/dashboard/organizer/event/${selectedEventId}`
                    );
                } else {
                    dashRes = await api.get(
                        `/api/v1/dashboard/organizer`
                    );
                }
                if (dashRes.data.success) {
                    setDashboardData(dashRes.data.data);
                }
            } catch (err) {
                console.error("Fetch dashboard data error:", err);
            } finally {
                setLoading(false);
            }

        };

        fetchEventData();

    }, [selectedEventId]);


    useEffect(() => {

        const fetchAllEvents = async () => {
            try {
                // Dashboard analytics
                const res = await api.get(`/api/v1/dashboard/organizer/all-events`);
                // console.log("res",res.data.data)
                if (res.data.success) {
                    setEvents(res.data.data)
                }
            } catch (err) {
                console.error("Fetch dashboard data error:", err);
            }
        };

        fetchAllEvents();
    }, []);

    const formatPrice = (amount) => {
        return `${Math.round(Number(amount || 0)).toLocaleString("en-IN")}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric"
        });
    };


    const summary = dashboardData?.summary || {};
    const salesTrend = dashboardData?.salesTrend || {};
    const revenueDistribution = dashboardData?.revenueDistribution || {};
    const liveSales = dashboardData?.liveSalesPerformance || [];
    const salesProgress = dashboardData?.salesProgress || {};
    const historicalReport = dashboardData?.historicalSalesReport || {};

    // const allEvents = dashboardData?.events || [];
    const totalEvents = summary?.total_events || 0;
    const totalRunningEvents = summary?.running_events || 0;
    const totalCompletedEvents = summary?.completed_events || 0;

    const totalTickets = summary?.totalTicketsCreated || 0;
    const soldTickets = summary?.totalTicketsSold || 0;

    const totalAddons = summary?.totalAddonsCreated || 0;
    const soldAddons = summary?.totalAddonsSold || 0;

    const totalPackages = summary?.totalPackagesCreated || 0;
    const soldPackages = summary?.totalPackagesSold || 0;

    const totalAppointments = summary?.totalAppointmentsCreated || 0;
    const soldAppointments = summary?.totalAppointmentsSold || 0;

    const totalRevenue = summary?.totalRevenue || 0;

    const totalSoldPackageTickets = summary?.totalSoldPackageTickets || 0;
    const totalSoldPackageAddons = summary?.totalSoldPackageAddons || 0;

    // Sales Progress..
    const potentialRevenue = salesProgress?.potentialRevenue || 0;
    const soldRunningEventTickets = salesProgress?.soldTickets || 0;
    const totalRunningEventTickets = salesProgress?.totalTickets || 0;
    const soldRevenue = salesProgress?.soldRevenue || 0;
    const soldPercent = salesProgress?.soldPercent || 0;


    // Historical Sales Report
    const totalSummary = historicalReport?.summary || {};
    const historicalEvents = historicalReport?.events || [];

    const CompletedSoldEventsTickets = totalSummary?.totalTickets || 0;
    const CompletedEventsRevenue = totalSummary?.totalRevenue || 0;
    const totalCommissions = totalSummary?.totalCommissions || 0;
    const netEarnings = totalSummary?.netEarnings || 0;


    // const soldPercent = Math.round((soldTickets / totalTickets) * 100);

    /* ================== CHARTS ================== */
    const commissionColors = {
        organizer: "#22c55e", // green
        platform: "#6366f1",  // indigo
        gateway: "#0ea5e9",
        committee: "#f59e0b", // orange
    };


    const salesTrendSeries = salesTrend?.series || [];

    const salesTrendCategories =
        salesTrend?.categories?.map((date) => formatDate(date)) || [];

    const salesTrendOptions = {
        chart: {
            type: "line",
            toolbar: { show: false },
            background: "transparent"
        },

        stroke: {
            curve: "smooth",
            width: 3
        },

        colors: ["#3b82f6", "#22c55e"],

        markers: {
            size: 4,
            strokeWidth: 0
        },

        grid: {
            borderColor: "#1e293b",
            strokeDashArray: 4
        },

        xaxis: {
            categories: salesTrendCategories, // dynamic
            labels: {
                style: { colors: "#94a3b8" }
            }
        },

        yaxis: {
            labels: {
                style: { colors: "#94a3b8" }
            }
        },

        legend: {
            position: "bottom",
            labels: {
                colors: "#cbd5f5"
            }
        },

        tooltip: {
            theme: "dark"
        },

        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        }
    };

    const organizerEarning = revenueDistribution?.organizerEarning || 0;
    const platformFee = revenueDistribution?.platformFee || 0;
    const committeeFee = revenueDistribution?.committeeFee || 0;
    const gatewayFee = revenueDistribution?.gatewayFee || 0;

    const committeePerfData = dashboardData?.committeePerformance || {};

    const committeeSummary = committeePerfData?.summary || {};
    const committeeMembers = committeePerfData?.members || [];
    const committeeTotalAssigned = committeeSummary?.totalAssigned || 0;
    const committeeTotalSold = committeeSummary?.totalSold || 0;
    const committeeTotalPaid = committeeSummary?.totalPaid || 0;
    const committeeConversionRate = committeeSummary?.conversionRate || 0;
    const committeeTotalEarning = committeeSummary?.totalCommitteeEarning || 0;
    const committeeAvgConversion = committeeSummary?.avgConversion || 0;



    const commissionDonutSeries = [
        organizerEarning,
        platformFee,
        gatewayFee,
        committeeFee
    ];

    const hasCommittee = committeeMembers?.length > 0;
    const series = hasCommittee
        ? [organizerEarning, platformFee, gatewayFee, committeeFee]
        : [organizerEarning, platformFee, gatewayFee];

    const commissionDonutOptions = {
        chart: {
            type: "donut"
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return formatPrice(val);
                }
            }
        },
        labels: hasCommittee
            ? ["Organizer Earnings", "Platform Commission", "Gateway Commission", "Committee Commission"]
            : ["Organizer Earnings", "Gateway Commission", "Platform Commission"],

        colors: [
            "#22c55e",
            "#6366f1",
            "#0ea5e9",
            "#f59e0b"
        ],

        legend: {
            position: "bottom",
            labels: {
                colors: "#94a3b8"
            }
        },

        dataLabels: {
            enabled: false
        },

        stroke: {
            width: 0
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,

                        value: {
                            formatter: function (val) {
                                return formatPrice(Math.round(val)); // ✅ hover center fix
                            }
                        },

                        total: {
                            show: true,
                            label: "Total Revenue",
                            formatter: function () {
                                return formatPrice(Math.round(totalRevenue)); // ✅ initial center fix
                            }
                        }
                    }
                }
            }
        }
    };

    const filteredSales = liveSales?.filter(
        (item) => (item?.totalTickets || 0) > 0
    );

    const handleDownloadDashboardExcel = async () => {
        if (!dashboardData) return;
        setExcelLoading(true);

        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Dashboard Report");

            const currency = dashboardData?.currency || "₹";

            let rowIndex = 1;

            /* ================= HEADER ================= */
            const addHeader = (headers) => {
                const row = sheet.getRow(rowIndex);

                headers.forEach((h, i) => {
                    const cell = row.getCell(i + 1);
                    cell.value = h;

                    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FF000000" }
                    };

                    cell.alignment = { horizontal: "center" };
                });

                rowIndex++;
            };

            /* ================= ROW ================= */
            const addRow = (data) => {
                const row = sheet.getRow(rowIndex);

                data.forEach((val, i) => {
                    const cell = row.getCell(i + 1);
                    cell.value = val;

                    // Alignment
                    if (i >= 4) {
                        cell.alignment = { horizontal: "right" };
                    } else {
                        cell.alignment = { horizontal: "left" };
                    }
                });

                rowIndex++;
            };

            /* ================= HEADER ================= */
            addHeader([
                "S.No",
                "Event Name",
                "Event Start Date",
                "Event End Date",
                "Total Tickets",
                "Sold Tickets",
                "Total Addons",
                "Sold Addons",
                "Total Packages",
                "Sold Packages",
                "Total Appointments",
                "Sold Appointments",
                "Total Revenue",
                "Total Organizer Earnings",
                "Platform Commission",
                "Payment Gateway Commission",
                "Total Paid Committee Member"
            ]);

            /* ================= TOTAL ================= */
            let totals = {
                totalTickets: 0,
                soldTickets: 0,
                totalAddons: 0,
                soldAddons: 0,
                totalPackages: 0,
                soldPackages: 0,
                totalAppointments: 0,
                soldAppointments: 0,
                revenue: 0,
                organizerEarning: 0,
                PlatformFee: 0,
                PaymentGatewayFee: 0,
                totalPayout: 0
            };

            /* ================= DATA ================= */
            (dashboardData?.events || []).forEach((ev, index) => {

                totals.totalTickets += Number(ev.totalTickets || 0);
                totals.soldTickets += Number(ev.soldTickets || 0);
                totals.totalAddons += Number(ev.totalAddons || 0);
                totals.soldAddons += Number(ev.soldAddons || 0);
                totals.totalPackages += Number(ev.totalPackages || 0);
                totals.soldPackages += Number(ev.soldPackages || 0);
                totals.totalAppointments += Number(ev.totalAppointments || 0);
                totals.soldAppointments += Number(ev.soldAppointments || 0);
                totals.revenue += Number(ev.revenue || 0);
                totals.organizerEarning += Number(ev.organizerEarning || 0);
                totals.PlatformFee += Number(ev.PlatformFee || 0);
                totals.PaymentGatewayFee += Number(ev.PaymentGatewayFee || 0);
                totals.totalPayout += Number(ev.totalPayout || 0);

                addRow([
                    index + 1,
                    ev.name || "-",
                    ev.date_from ? moment(ev.date_from).format("DD-MM-YYYY") : "-",
                    ev.date_to ? moment(ev.date_to).format("DD-MM-YYYY") : "-",

                    ev.totalTickets || 0,
                    ev.soldTickets || 0,

                    ev.totalAddons || 0,
                    ev.soldAddons || 0,

                    ev.totalPackages || 0,
                    ev.soldPackages || 0,

                    ev.totalAppointments || 0,
                    ev.soldAppointments || 0,

                    // Currency only here
                    `${currency}${formatPrice(ev.revenue || 0)}`,
                    `${currency}${formatPrice(ev.organizerEarning || 0)}`,
                    `${currency}${formatPrice(ev.PlatformFee || 0)}`,
                    `${currency}${formatPrice(ev.PaymentGatewayFee || 0)}`,
                    `${currency}${formatPrice(ev.totalPayout || 0)}`
                ]);
            });

            /* ================= TOTAL ROW ================= */
            rowIndex++;

            const totalRow = sheet.getRow(rowIndex);

            totalRow.getCell(2).value = "TOTAL";

            totalRow.getCell(5).value = totals.totalTickets;
            totalRow.getCell(6).value = totals.soldTickets;
            totalRow.getCell(7).value = totals.totalAddons;
            totalRow.getCell(8).value = totals.soldAddons;
            totalRow.getCell(9).value = totals.totalPackages;
            totalRow.getCell(10).value = totals.soldPackages;
            totalRow.getCell(11).value = totals.totalAppointments;
            totalRow.getCell(12).value = totals.soldAppointments;

            // NO currency in total
            // totalRow.getCell(13).value = totals.revenue;
            // totalRow.getCell(14).value = totals.organizerEarning;
            // totalRow.getCell(15).value = totals.PlatformFee;
            // totalRow.getCell(16).value = totals.PaymentGatewayFee;
            // totalRow.getCell(17).value = totals.totalPayout;
            totalRow.getCell(13).value = formatPrice(totals.revenue);
            totalRow.getCell(14).value = formatPrice(totals.organizerEarning);
            totalRow.getCell(15).value = formatPrice(totals.PlatformFee);
            totalRow.getCell(16).value = formatPrice(totals.PaymentGatewayFee);
            totalRow.getCell(17).value = formatPrice(totals.totalPayout);

            totalRow.font = { bold: true };

            for (let i = 1; i <= 17; i++) {
                const cell = totalRow.getCell(i);

                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFEFEFEF" }
                };

                cell.alignment = {
                    horizontal: i >= 5 ? "right" : "left"
                };
            }

            /* ================= AUTO WIDTH ================= */
            sheet.columns.forEach((column) => {
                let maxLength = 0;

                column.eachCell({ includeEmpty: true }, (cell) => {
                    let val = cell.value ? cell.value.toString() : "";
                    val = val.replace(/₹/g, ""); // remove currency for better calc
                    maxLength = Math.max(maxLength, val.length);
                });

                column.width = Math.max(12, maxLength + 2);
            });

            /* ================= CUSTOM WIDTH ================= */
            sheet.getColumn(2).width = 30; // Event Name
            sheet.getColumn(3).width = 18;
            sheet.getColumn(4).width = 18;

            /* ================= DOWNLOAD ================= */
            const buffer = await workbook.xlsx.writeBuffer();

            saveAs(
                new Blob([buffer]),
                `Dashboard_Report_${moment().format("YYYYMMDD_HHmmss")}.xlsx`
            );

        } catch (error) {
            console.error("Excel error:", error.message);
            Swal.fire("Error", "Failed to download report", "error");
        } finally {
            setExcelLoading(false);
        }
    };




    /* ---------------- RENDER ---------------- */
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar />
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">

                                <h4 className="text-24">Sales Dashboard</h4>
                                <hr className="custom-hr" />

                                <div className="mb-4 d-flex flex-wrap align-items-center gap-3">

                                    {/* Event Filter Buttons */}
                                    <div className="d-flex align-items-center gap-2 border rounded p-1 bg-light">

                                        {/* All Events */}
                                        <button
                                            onClick={() => setEventFilter("all")}
                                            className={`btn btn-sm d-flex align-items-center gap-2 ${eventFilter === "all" ? "btn-primary" : "btn-outline-secondary"
                                                }`}
                                        >
                                            <i className="bi bi-calendar"></i>
                                            <span>All Events</span>
                                            <span className="badge bg-light text-dark">{totalEvents}</span>
                                        </button>

                                        {/* Running */}
                                        <button
                                            onClick={() => setEventFilter("running")}
                                            className={`btn btn-sm d-flex align-items-center gap-2 ${eventFilter === "running" ? "btn-primary" : "btn-outline-secondary"
                                                }`}
                                        >
                                            <i className="bi bi-broadcast"></i>
                                            <span>Running</span>
                                            <span className="badge bg-secondary">{totalRunningEvents}</span>
                                        </button>

                                        {/* Completed */}
                                        <button
                                            onClick={() => setEventFilter("completed")}
                                            className={`btn btn-sm d-flex align-items-center gap-2 ${eventFilter === "completed" ? "btn-primary" : "btn-outline-secondary"
                                                }`}
                                        >
                                            <i className="bi bi-check-circle"></i>
                                            <span>Completed</span>
                                            <span className="badge bg-secondary">{totalCompletedEvents}</span>
                                        </button>

                                    </div>

                                    {/* Event Dropdown Filter */}
                                    <div className="d-flex align-items-center gap-2">

                                        <i className="bi bi-funnel text-muted"></i>

                                        <select className="form-select form-select-sm" style={{ width: "220px" }}
                                            onChange={(e) => setSelectedEventId(e.target.value)}
                                        >
                                            <option value="">All Events</option>
                                            {events?.map((event) => (
                                                <option key={event.id} value={event.id}>
                                                    {event.name}
                                                </option>
                                            ))}
                                        </select>

                                    </div>


                                    <button className="export-btn"
                                        data-bs-toggle="tooltip"
                                        title="Download report"
                                        onClick={handleDownloadDashboardExcel}
                                        disabled={excelLoading}>
                                        {excelLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-file-earmark-excel-fill me-2"></i>
                                                ⬇ Export
                                            </>
                                        )}
                                    </button>
                                </div>


                                <div className="contant_bg container-fluid">
                                    {loading ? (
                                        <div className="text-center my-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2">Loading dashboard data...</p>
                                        </div>
                                    ) : (
                                        <div className="row">

                                            {/* ================= TOP CARDS ================= */}
                                            <div className="row mb-4">

                                                {/* Total Events */}
                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">Total Events</p>
                                                                <h4 className="dash-value">{totalEvents}</h4>
                                                                <small>{totalRunningEvents} running, {totalCompletedEvents} completed</small>
                                                            </div>
                                                            <div className="dash-icon bg-primary">
                                                                <i className="fe fe-calendar"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Running Events */}
                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">Running Events</p>
                                                                <h4 className="dash-value">{totalRunningEvents}</h4>
                                                                <small>Currently active</small>
                                                            </div>
                                                            <div className="dash-icon bg-success">
                                                                <i className="fe fe-activity"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Completed Events */}
                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">Completed Events</p>
                                                                <h4 className="dash-value">{totalCompletedEvents}</h4>
                                                                <small>Past events</small>
                                                            </div>
                                                            <div className="dash-icon bg-info">
                                                                <i className="fe fe-check-circle"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Total Tickets Created */}
                                                {totalTickets !== 0 && (
                                                    <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                        <div className="card dashboard-card">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <p className="dash-label">Total Tickets</p>
                                                                    <h4 className="dash-value">
                                                                        <span
                                                                            data-bs-toggle="tooltip"
                                                                            data-bs-placement="top"
                                                                            title="Total Sold Tickets"
                                                                            style={{ cursor: "pointer" }}
                                                                        >
                                                                            {soldTickets + totalSoldPackageTickets}
                                                                        </span>
                                                                        {" / "}
                                                                        <span
                                                                            data-bs-toggle="tooltip"
                                                                            data-bs-placement="top"
                                                                            title="Total Tickets Created"
                                                                            style={{ cursor: "pointer" }}
                                                                        >
                                                                            {totalTickets}
                                                                        </span>
                                                                    </h4>
                                                                    <small>Across all events</small>
                                                                </div>
                                                                <div className="dash-icon bg-warning">
                                                                    <i className="fe fe-layers"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Total Addons  */}
                                                {totalAddons !== 0 && (
                                                    <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                        <div className="card dashboard-card">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <p className="dash-label">Total Addons</p>
                                                                    <h4 className="dash-value">
                                                                        <span
                                                                            data-bs-toggle="tooltip"
                                                                            data-bs-placement="top"
                                                                            title="Total Sold Addons"
                                                                            style={{ cursor: "pointer" }}
                                                                        >
                                                                            {soldAddons + totalSoldPackageAddons}
                                                                        </span>
                                                                        {" / "}
                                                                        <span
                                                                            data-bs-toggle="tooltip"
                                                                            data-bs-placement="top"
                                                                            title="Total Addons Created"
                                                                            style={{ cursor: "pointer" }}
                                                                        >
                                                                            {totalAddons}
                                                                        </span>
                                                                    </h4>
                                                                    <small>Across all events</small>
                                                                </div>
                                                                <div className="dash-icon bg-warning">
                                                                    <i className="fe fe-layers"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Total Package  */}
                                                {totalPackages !== 0 && (
                                                    <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                        <div className="card dashboard-card">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <p className="dash-label">Total Packages</p>
                                                                    <h4 className="dash-value">
                                                                        <span
                                                                            data-bs-toggle="tooltip"
                                                                            data-bs-placement="top"
                                                                            title="Total Sold Packages"
                                                                            style={{ cursor: "pointer" }}
                                                                        >
                                                                            {soldPackages}
                                                                        </span>
                                                                        {" / "}
                                                                        <span
                                                                            data-bs-toggle="tooltip"
                                                                            data-bs-placement="top"
                                                                            title="Total Packages Created"
                                                                            style={{ cursor: "pointer" }}
                                                                        >
                                                                            {totalPackages}
                                                                        </span>
                                                                    </h4>
                                                                    <small>Across all events</small>
                                                                </div>
                                                                <div className="dash-icon bg-warning">
                                                                    <i className="fe fe-layers"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Total Appointments  */}
                                                {totalAppointments !== 0 && (
                                                    <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                        <div className="card dashboard-card">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <p className="dash-label">Total Appointments</p>
                                                                    <h4 className="dash-value">
                                                                        <span
                                                                            data-bs-toggle="tooltip"
                                                                            data-bs-placement="top"
                                                                            title="Total Sold Appointments"
                                                                            style={{ cursor: "pointer" }}
                                                                        >
                                                                            {soldAppointments}
                                                                        </span>
                                                                        {" / "}
                                                                        <span
                                                                            data-bs-toggle="tooltip"
                                                                            data-bs-placement="top"
                                                                            title="Total Appointments Created"
                                                                            style={{ cursor: "pointer" }}
                                                                        >
                                                                            {totalAppointments}
                                                                        </span>
                                                                    </h4>
                                                                    <small>Across all events</small>
                                                                </div>
                                                                <div className="dash-icon bg-warning">
                                                                    <i className="fe fe-layers"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>)}

                                                {/* Total Revenue */}
                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">Total Revenue</p>
                                                                <h4 className="dash-value">{formatPrice(totalRevenue)}</h4>
                                                                <small>Gross revenue</small>
                                                            </div>
                                                            <div className="dash-icon bg-info">
                                                                <i className="fe fe-dollar-sign"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Net Organizer Earnings */}
                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">Net Organizer Earnings</p>
                                                                <h4 className="dash-value">{formatPrice(organizerEarning)}</h4>
                                                                <small>After commissions</small>
                                                            </div>
                                                            <div className="dash-icon bg-dark">
                                                                <i className="fe fe-credit-card"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* ================= CHARTS ================= */}
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <h6 className="section-title">Sales Trends</h6>
                                                        <p>Ticket sales over the last 30 days</p>

                                                        {isClient && (
                                                            <ReactApexChart
                                                                options={salesTrendOptions}
                                                                series={salesTrendSeries}
                                                                type="line"
                                                                height={260}
                                                            />
                                                        )}



                                                    </div>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <h6 className="section-title">Revenue Distribution</h6>
                                                        <p>Platform-wide financial split</p>
                                                        {isClient && (
                                                            <ReactApexChart
                                                                options={commissionDonutOptions}
                                                                series={series}
                                                                type="donut"
                                                                height={260}
                                                            />
                                                        )}

                                                        {/* Custom Legend */}

                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                            <span style={{ color: commissionColors.organizer }}>
                                                                ● Organizer Earnings
                                                            </span>
                                                            <span>{formatPrice(organizerEarning)}</span>
                                                        </div>

                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                            <span style={{ color: commissionColors.platform }}>
                                                                ● Platform Commission
                                                            </span>
                                                            <span>{formatPrice(platformFee)}</span>
                                                        </div>

                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                            <span style={{ color: commissionColors.gateway }}>
                                                                ● Payment Gateway Commission
                                                            </span>
                                                            <span>{formatPrice(gatewayFee)}</span>
                                                        </div>





                                                        {committeeMembers.length > 0 && (
                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                <span style={{ color: commissionColors.committee }}>
                                                                    ● Committee Commission
                                                                </span>
                                                                <span>{formatPrice(committeeFee)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {eventFilter !== "completed" && (
                                                <>
                                                    {filteredSales?.length > 0 && (
                                                        <>
                                                            <div className="col-md-8 mb-4">
                                                                <div className="light-card p-3">

                                                                    <div className="card-top mb-3">
                                                                        <h6>Live Sales Performance</h6>
                                                                        <p className="text-muted mb-0">{totalRunningEvents} running events • Real-time tracking</p>
                                                                    </div>

                                                                    <div className="row g-3">

                                                                        {/* {liveSales?.length > 0 ? (
                                                                            liveSales.map((value) => { */}
                                                                        {filteredSales?.length > 0 ? (
                                                                            filteredSales.map((value) => {
                                                                                const sold = value?.soldTickets || 0;
                                                                                const total = value?.totalTickets || 0;

                                                                                return (
                                                                                    <div className="col-md-12" key={value.event_id}>
                                                                                        <div className="light-card p-3">

                                                                                            {/* Header */}
                                                                                            <div className="d-flex justify-content-between align-items-start mb-3">

                                                                                                {/* Left Side */}
                                                                                                <div>
                                                                                                    <h5 className="mb-1">
                                                                                                        <b>{value?.event_name || "--"}</b>
                                                                                                    </h5>

                                                                                                    <span className="text-muted d-block">
                                                                                                        {value?.event_date ? (
                                                                                                            <Moment format="D MMM YYYY">
                                                                                                                {value.event_date}
                                                                                                            </Moment>
                                                                                                        ) : "--"}
                                                                                                    </span>

                                                                                                    <span className="fw-bold text-muted d-block">
                                                                                                        {value?.soldTickets || 0} / {value?.totalTickets || 0} tickets
                                                                                                    </span>
                                                                                                </div>

                                                                                                {/* Right Side */}
                                                                                                <div className="text-end">
                                                                                                    <h5 className="text-success mb-0">
                                                                                                        {formatPrice(value?.revenue || 0)}
                                                                                                    </h5>
                                                                                                    <small className="text-muted">Net earnings</small>
                                                                                                </div>

                                                                                            </div>

                                                                                            {/* Progress */}
                                                                                            <div className="progress light-progress mb-4">
                                                                                                <div
                                                                                                    className="progress-bar bg-success"
                                                                                                    style={{ width: `${value?.progress || 0}%` }}
                                                                                                ></div>
                                                                                            </div>


                                                                                            {/* Stats */}
                                                                                            <div className="sales-stats d-flex justify-content-between text-center">

                                                                                                <div className="sales-box">
                                                                                                    <h4>{value?.soldTickets || 0}</h4>
                                                                                                    <p className="mb-1">Sold</p>
                                                                                                </div>

                                                                                                <div className="sales-box">
                                                                                                    <h4>{value?.remaining || 0}</h4>
                                                                                                    <p className="mb-1">Remaining</p>
                                                                                                </div>

                                                                                                <div className="sales-box">
                                                                                                    <h4>{formatPrice(value?.revenue || 0)}</h4>
                                                                                                    <p className="mb-1">Revenue</p>
                                                                                                </div>

                                                                                            </div>

                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            <div className="col-md-12">
                                                                                <p className="text-center text-muted">No live sales found</p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            {/* ================= Sales Progress ================= */}
                                                            <div className="col-md-4 mb-4">
                                                                <div className="light-card">
                                                                    <div className="card-top">
                                                                        <h6>Sales Progress</h6>
                                                                        <span className="fw-bold">{soldPercent}%</span>
                                                                    </div>

                                                                    <div className="progress light-progress mb-4">
                                                                        <div
                                                                            className="progress-bar bg-success"
                                                                            style={{ width: `${soldPercent}%` }}
                                                                        />
                                                                    </div>

                                                                    <div className="sales-stats">
                                                                        <div className="sales-box">
                                                                            <p>Sold</p>
                                                                            <h4>{soldRunningEventTickets}</h4>
                                                                            {/* <p className="dash-label mb-1">{formatPrice(soldRevenue)} revenue</p> */}
                                                                        </div>

                                                                        <div className="sales-box">
                                                                            <p>Remaining</p>
                                                                            <h4>{totalRunningEventTickets - soldRunningEventTickets}</h4>
                                                                            {/* <p className="dash-label mb-1">{formatPrice(potentialRevenue)} potential</p> */}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            {historicalEvents?.length > 0 && (
                                                <div className="col-12">
                                                    <div className="card dashboard-card p-4">

                                                        <h6 className="mb-4">Historical Sales Report</h6>

                                                        {/* Stats Cards */}
                                                        <div className="row g-3 mb-4">

                                                            {/* Total Tickets */}
                                                            <div className="col-xl-3 col-lg-6 col-md-6">
                                                                <div className="card dashboard-card h-100 p-3 text-center">
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        <div>
                                                                            <p className="dash-label mb-1">Total Tickets Sold</p>
                                                                            <h4 className="dash-value">{CompletedSoldEventsTickets}</h4>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Tickets Sold */}
                                                            <div className="col-xl-3 col-lg-6 col-md-6">
                                                                <div className="card dashboard-card h-100 p-3 text-center">
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        <div>
                                                                            <p className="dash-label mb-1">Total Revenue</p>
                                                                            <h4 className="dash-value">{formatPrice(CompletedEventsRevenue)}</h4>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Revenue */}
                                                            <div className="col-xl-3 col-lg-6 col-md-6">
                                                                <div className="card dashboard-card h-100 p-3 text-center">
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        <div>
                                                                            <p className="dash-label mb-1">Total Payable Commission</p>
                                                                            <h4 className="dash-value">{formatPrice(totalCommissions)}</h4>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Net Earnings */}
                                                            <div className="col-xl-3 col-lg-6 col-md-6">
                                                                <div className="card dashboard-card h-100 p-3 text-center">
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        <div>
                                                                            <p className="dash-label mb-1">Net Earnings</p>
                                                                            <h4 className="dash-value">{formatPrice(netEarnings)}</h4>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>

                                                        {/* Table */}
                                                        <div className="table-responsive">
                                                            <table className="table table-hover align-middle">

                                                                <thead className="table-light">
                                                                    <tr>
                                                                        <th>Event</th>
                                                                        <th>Date</th>
                                                                        <th>Tickets</th>
                                                                        <th>Revenue</th>
                                                                        <th>Payable Commission</th>
                                                                        <th>Net Earnings</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {historicalEvents.map((e, i) => (
                                                                        <tr key={i}>
                                                                            <td>{e.name}</td>
                                                                            <td> {e?.date ? (
                                                                                <Moment format="D MMM YYYY">
                                                                                    {e?.date}
                                                                                </Moment>
                                                                            ) : "--"}</td>
                                                                            <td>{e.tickets}</td>
                                                                            <td>{e.CurrencyName}{" "}{formatPrice(e.revenue)}</td>
                                                                            <td>{e.CurrencyName}{" "}{formatPrice(e.commission)}</td>
                                                                            <td className="text-success fw-semibold">{e.CurrencyName}{" "}{formatPrice(e.net)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>

                                                            </table>
                                                        </div>

                                                    </div>
                                                </div>
                                            )}
                                            {/* ================= Committee Performance ================= */}
                                            {historicalEvents?.length > 0 && (
                                                <div className="col-12">
                                                    <div className="light-card">
                                                        <div className="card-top">
                                                            <h6>Committee Performance</h6>
                                                        </div>


                                                        <div className="row g-3 mb-4">

                                                            {/* Total Tickets */}
                                                            <div className="col-xl-3 col-lg-6 col-md-6">
                                                                <div className="card dashboard-card h-100 p-3 text-center">
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        <div>
                                                                            <p className="dash-label mb-1">Total Assigned</p>
                                                                            <h4 className="dash-value">{committeeTotalAssigned}</h4>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Tickets Sold */}
                                                            <div className="col-xl-3 col-lg-6 col-md-6">
                                                                <div className="card dashboard-card h-100 p-3 text-center">
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        <div>
                                                                            <p className="dash-label mb-1">Total Sold</p>
                                                                            <h4 className="dash-value">{committeeTotalSold}</h4>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Revenue */}
                                                            <div className="col-xl-3 col-lg-6 col-md-6">
                                                                <div className="card dashboard-card h-100 p-3 text-center">
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        <div>
                                                                            <p className="dash-label mb-1">Total Sale</p>
                                                                            <h4 className="dash-value">{formatPrice(committeeTotalPaid)}</h4>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Organizer Earnings */}
                                                            <div className="col-xl-3 col-lg-6 col-md-6">
                                                                <div className="card dashboard-card h-100 p-3 text-center">
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        <div>
                                                                            <p className="dash-label mb-1">Conversion Rate</p>
                                                                            <h4 className="dash-value">{committeeConversionRate}%</h4>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>

                                                        {committeeMembers?.length > 0 ? (
                                                            committeeMembers.map((item, i) => {

                                                                const initials = (item?.name?.charAt(0) || "").toUpperCase();

                                                                const progressColor =
                                                                    item.conversion >= 90
                                                                        ? "success"
                                                                        : item.conversion >= 70
                                                                            ? "warning"
                                                                            : "danger";

                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        className="d-flex align-items-center"
                                                                        style={{ marginBottom: "14px", gap: "12px" }}
                                                                    >

                                                                        {/* Avatar + Name */}
                                                                        <div
                                                                            className="d-flex align-items-center"
                                                                            style={{ minWidth: "180px", gap: "8px" }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    width: "30px",
                                                                                    height: "30px",
                                                                                    borderRadius: "50%",
                                                                                    background: "#3b82f6",
                                                                                    color: "#fff",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "center",
                                                                                    fontWeight: "600",
                                                                                    fontSize: "13px"
                                                                                }}
                                                                            >
                                                                                {initials}
                                                                            </div>

                                                                            <span>{item?.name || "--"}</span>
                                                                        </div>

                                                                        {/* Progress Bar */}
                                                                        <div
                                                                            className="progress light-progress"
                                                                            style={{
                                                                                flex: 1,
                                                                                height: "8px",
                                                                                borderRadius: "10px"
                                                                            }}
                                                                        >
                                                                            <div
                                                                                className={`progress-bar bg-${progressColor}`}
                                                                                style={{ width: `${item?.conversion || 0}%` }}
                                                                            />
                                                                        </div>

                                                                        {/* Percentage */}
                                                                        <div style={{ width: "45px", textAlign: "right", fontWeight: "600" }}>
                                                                            {item?.conversion || 0}%
                                                                        </div>

                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-center text-muted">No committee members found</p>
                                                        )}

                                                        <div className="summary-row">
                                                            <span>
                                                                Total Committee Earnings <b>{formatPrice(committeeTotalEarning)}</b>
                                                            </span>

                                                            <span className="ms-auto">
                                                                Avg. Conversion <b>{committeeAvgConversion}%</b>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div >
            </section >

            <FrontendFooter />
        </>
    );
};

export default DashboardPage;
