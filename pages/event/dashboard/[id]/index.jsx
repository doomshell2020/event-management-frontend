import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Spinner } from "react-bootstrap";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import api from "@/utils/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EventDashboardPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    const [eventDetails, setEventDetails] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => setIsClient(true), []);

    useEffect(() => {
        if (!id) return;

        const fetchEventData = async () => {
            setLoading(true);
            try {
                const eventRes = await api.post(`/api/v1/events/event-list`, { id });

                if (eventRes.data.success && eventRes.data.data.events.length > 0) {
                    setEventDetails(eventRes.data.data.events[0]);
                }

                const dashRes = await api.get(`/api/v1/dashboard/event/${id}`);

                if (dashRes.data.success) {
                    setDashboardData(dashRes.data.data);
                }

            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [id]);

    /* ---------------- SAFE DATA ---------------- */
    const formatPrice = (amount) => {
        return Number(amount || 0).toLocaleString();
    };
    const event = dashboardData?.event || {};
    const summary = dashboardData?.summary || {};
    const revenueDistribution = dashboardData?.revenueDistribution || {};
    const commissionSplit = dashboardData?.commissionSplit || {};
    const commissionBreakdown = dashboardData?.commissionBreakdown || {};
    const salesProgress = dashboardData?.salesProgress || {};
    const committeePerformance = dashboardData?.committeePerformance || {};

    const currency = event?.currencyName?.Currency_symbol || "₹";

    const totalTickets = summary?.totalTicketsCreated || 0;
    const soldTickets = summary?.totalTicketsSold || 0;
    const totalRevenue = summary?.totalRevenue || 0;
    const organizerEarning = summary?.netEarning || 0;


    const organizerRevenue = revenueDistribution?.organizer || 0;
    const platformFee = revenueDistribution?.platform || 0;
    const committeeFee = revenueDistribution?.committee || 0;
    const ticketTotal = salesProgress?.tickets?.total || 0;
    const ticketSold = salesProgress?.tickets?.sold || 0;
    const ticketPercent = salesProgress?.tickets?.percentage || 0;

    const addonTotal = salesProgress?.addons?.total || 0;
    const addonSold = salesProgress?.addons?.sold || 0;
    const addonPercent = salesProgress?.addons?.percentage || 0;
    const soldPercent = salesProgress?.tickets?.percentage || 0;

    const ticketRemaining = ticketTotal - ticketSold;
    const addonRemaining = addonTotal - addonSold;

    // combined progress
    const totalItems = ticketTotal + addonTotal;
    const totalSold = ticketSold + addonSold;

    const combinedPercent =
        totalItems > 0 ? ((totalSold / totalItems) * 100).toFixed(1) : 0;






    const committeeMembers = committeePerformance?.members || [];
    // console.log("committeeMembers", committeeMembers)

    /* ---------------- CHART COLORS ---------------- */

    const commissionColors = {
        organizer: "#22c55e",
        platform: "#6366f1",
        committee: "#f59e0b",
    };

    /* ---------------- REVENUE BAR ---------------- */

    const revenueBarSeries = [
        {
            name: "Revenue",
            data: [organizerRevenue, platformFee, committeeFee],
        },
    ];

    const revenueBarOptions = {
        chart: { type: "bar", toolbar: { show: false } },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 6,
                distributed: true,
            },
        },
        colors: [
            commissionColors.organizer,
            commissionColors.platform,
            commissionColors.committee,
        ],
        xaxis: {
            categories: ["Organizer", "Platform", "Committee"],
        },
        dataLabels: { enabled: false },
    };

    /* ---------------- DONUT ---------------- */

    // const totalRevenue = organizerRevenue + platformFee + committeeFee;
    
    const commissionPercent = commissionSplit?.percentage || {};

    const commissionDonutSeries = [
        organizerRevenue,
        platformFee,
        committeeFee,
    ];

    const commissionDonutOptions = {
        chart: { type: "donut" },

        labels: ["Organizer Earnings", "Platform Commission", "Committee Commission"],

        colors: [
            commissionColors.organizer,
            commissionColors.platform,
            commissionColors.committee,
        ],

        legend: { show: false },

        dataLabels: { enabled: false },

        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,

                        name: {
                            show: true,
                            fontSize: "14px"
                        },

                        value: {
                            show: true,
                            formatter: (val) => `${currency}${Number(val).toLocaleString()}`
                        },

                        total: {
                            show: true,
                            label: "Total Revenue",
                            formatter: () => `${currency}${totalRevenue.toLocaleString()}`
                        }
                    }
                }
            }
        }
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">

                    <EventSidebar eventId={id} eventDetails={eventDetails} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">

                            <section id="post-eventpg">

                                <EventHeaderSection
                                    eventDetails={eventDetails}
                                    isProgressBarShow={false}
                                />

                                <h4 className="text-24">
                                    Sales Dashboard - {event?.name}
                                </h4>

                                <hr className="custom-hr" />

                                <div className="contant_bg container-fluid">

                                    {loading ? (
                                        <div className="text-center my-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2">Loading dashboard...</p>
                                        </div>
                                    ) : (

                                        <div className="row">

                                            {/* ================= TOP CARDS ================= */}

                                            <div className="row mb-4">

                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">TOTAL TICKETS</p>
                                                                <h4 className="dash-value">{totalTickets}</h4>
                                                            </div>
                                                            <div className="dash-icon bg-secondary">
                                                                <i className="fe fe-tag"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">TICKETS SOLD</p>
                                                                <h4 className="dash-value">{soldTickets}</h4>
                                                                {/* <small>{soldPercent}% sold</small> */}
                                                            </div>
                                                            <div className="dash-icon bg-success">
                                                                <i className="fe fe-shopping-cart"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">TOTAL REVENUE</p>
                                                                <h4 className="dash-value">{currency}{formatPrice(totalRevenue)}</h4>
                                                            </div>
                                                            <div className="dash-icon bg-info">
                                                                <i className="fe fe-credit-card"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">ORGANIZER EARNINGS</p>
                                                                <h4 className="dash-value">{currency}{formatPrice(organizerEarning)}</h4>
                                                            </div>
                                                            <div className="dash-icon bg-warning">
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
                                                        <h6>Revenue Distribution</h6>

                                                        {isClient && (
                                                            <ReactApexChart
                                                                options={revenueBarOptions}
                                                                series={revenueBarSeries}
                                                                type="bar"
                                                                height={260}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <div className="card dashboard-card">

                                                        <h6>Commission Split</h6>

                                                        {isClient && (
                                                            <ReactApexChart
                                                                options={commissionDonutOptions}
                                                                series={commissionDonutSeries}
                                                                type="donut"
                                                                height={260}
                                                            />
                                                        )}

                                                        {/* Custom Legend */}

                                                        <div style={{ marginTop: "10px" }}>

                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                <span style={{ color: commissionColors.organizer }}>
                                                                    ● Organizer Earnings
                                                                </span>

                                                                <span>
                                                                    {currency}{organizerRevenue.toLocaleString()}
                                                                    ({commissionPercent?.organizer}%)
                                                                </span>
                                                            </div>

                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                <span style={{ color: commissionColors.platform }}>
                                                                    ● Platform Commission
                                                                </span>

                                                                <span>
                                                                    {currency}{platformFee.toLocaleString()}
                                                                    ({commissionPercent?.platform}%)
                                                                </span>
                                                            </div>

                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                <span style={{ color: commissionColors.committee }}>
                                                                    ● Committee Commission
                                                                </span>

                                                                <span>
                                                                    {currency}{committeeFee.toLocaleString()}
                                                                    ({commissionPercent?.committee}%)
                                                                </span>
                                                            </div>

                                                        </div>

                                                    </div>
                                                </div>

                                            </div>

                                            {/* ================= COMMISSION BREAKDOWN ================= */}

                                            <div className="col-md-6 mb-4">

                                                <div className="light-card">

                                                    <div className="card-top">
                                                        <h6>Commission Breakdown</h6>
                                                    </div>

                                                    <div className="list-row">
                                                        <span>
                                                            Payment Gateway Fee ({commissionBreakdown?.gateway_charge}%)
                                                        </span>
                                                        <span className="text-success fw-bold">
                                                            {currency}{commissionBreakdown?.gateway_fee || 0}
                                                        </span>
                                                    </div>

                                                    <div className="list-row">
                                                        <span>
                                                            Platform Fee ({commissionBreakdown?.platform_charge}%)
                                                        </span>
                                                        <span className="text-info">
                                                            {currency}{commissionBreakdown?.platform_fee || 0}
                                                        </span>
                                                    </div>

                                                </div>

                                            </div>

                                            {/* ================= SALES PROGRESS ================= */}

                                            {/* ================= SALES PROGRESS ================= */}

                                            <div className="col-md-6 mb-4">
                                                <div className="light-card">

                                                    <div className="card-top">
                                                        <h6>Sales Progress</h6>
                                                        <span className="fw-bold">{combinedPercent}%</span>
                                                    </div>

                                                    <div className="progress light-progress mb-4">
                                                        <div
                                                            className="progress-bar bg-success"
                                                            style={{ width: `${combinedPercent}%` }}
                                                        />
                                                    </div>

                                                    <div className="row g-3">

                                                        {/* Sold Tickets */}
                                                        <div className="col-6">
                                                            <div className="sales-box">
                                                                <p>Sold <br />TICKETS</p>
                                                                <h4>{ticketSold}</h4>
                                                            </div>
                                                        </div>

                                                        {/* Remaining Tickets */}
                                                        <div className="col-6">
                                                            <div className="sales-box">
                                                                <p>Remaining <br />TICKETS</p>
                                                                <h4>{ticketRemaining}</h4>
                                                            </div>
                                                        </div>

                                                        {/* Sold Addons */}
                                                        <div className="col-6">
                                                            <div className="sales-box">
                                                                <p>Sold <br />ADDONS</p>
                                                                <h4>{addonSold}</h4>
                                                            </div>
                                                        </div>

                                                        {/* Remaining Addons */}
                                                        <div className="col-6">
                                                            <div className="sales-box">
                                                                <p>Remaining <br />ADDONS</p>
                                                                <h4>{addonRemaining}</h4>
                                                            </div>
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>

                                            {/* <div className="col-md-6 mb-4">

                                                <div className="light-card">

                                                    <div className="card-top">
                                                        <h6>Sales Progress</h6>
                                                        <span>{soldPercent}%</span>
                                                    </div>

                                                    <div className="progress light-progress mb-4">

                                                        <div
                                                            className="progress-bar bg-success"
                                                            style={{ width: `${soldPercent}%` }}
                                                        />

                                                    </div>

                                                    <div className="sales-stats">

                                                        <div className="sales-box">
                                                            <p>Sold Tickets</p>
                                                            <h4>{salesProgress?.tickets?.sold}</h4>
                                                        </div>

                                                        <div className="sales-box">
                                                            <p>Remaining Tickets</p>
                                                            <h4>{remainingTickets}</h4>
                                                        </div>

                                                    </div>
                                                    

                                                </div>

                                            </div> */}

                                            {/* ================= COMMITTEE PERFORMANCE ================= */}

                                            <div className="col-12">
                                                <div className="light-card">

                                                    <div className="card-top">
                                                        <h6>Committee Performance</h6>
                                                    </div>

                                                    {committeeMembers.length > 0 ? (

                                                        committeeMembers.map((member, i) => {

                                                            const fullName = `${member.first_name} ${member.last_name}`;
                                                            const percentage = member.earning_percentage || 0;

                                                            const initials =
                                                                (member.first_name?.charAt(0) || "") +
                                                                (member.last_name?.charAt(0) || "");

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "space-between",
                                                                        marginBottom: "18px",
                                                                        gap: "15px"
                                                                    }}
                                                                >

                                                                    {/* LEFT SIDE */}
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px" }}>

                                                                        {/* Avatar */}
                                                                        <div
                                                                            style={{
                                                                                width: "40px",
                                                                                height: "40px",
                                                                                borderRadius: "50%",
                                                                                background: "linear-gradient(135deg,#4f7cff,#3358ff)",
                                                                                color: "#fff",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                fontWeight: "600",
                                                                                fontSize: "14px"
                                                                            }}
                                                                        >
                                                                            {initials.toUpperCase()}
                                                                        </div>

                                                                        <div>
                                                                            <div style={{ fontWeight: "600" }}>{fullName}</div>
                                                                            <div style={{ fontSize: "12px", color: "#888" }}>
                                                                                Sales: {currency}{member.total_sales}
                                                                            </div>
                                                                        </div>

                                                                    </div>

                                                                    {/* CENTER PROGRESS BAR */}
                                                                    <div style={{ flex: 1, padding: "0 10px" }}>

                                                                        <div
                                                                            style={{
                                                                                width: "100%",
                                                                                height: "8px",
                                                                                background: "#eee",
                                                                                borderRadius: "10px",
                                                                                overflow: "hidden"
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    width: `${percentage}%`,
                                                                                    height: "100%",
                                                                                    background: "#f5a623",
                                                                                    borderRadius: "10px"
                                                                                }}
                                                                            />
                                                                        </div>

                                                                    </div>

                                                                    {/* RIGHT SIDE */}
                                                                    <div style={{ textAlign: "right", minWidth: "120px" }}>

                                                                        <div style={{ fontWeight: "600" }}>
                                                                            {percentage}%
                                                                        </div>

                                                                        <div style={{ fontSize: "12px", color: "#28a745", fontWeight: "600" }}>
                                                                            {currency}{member.earning?.toLocaleString()} earned
                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            );
                                                        })

                                                    ) : (
                                                        <p className="text-muted">No committee members yet</p>
                                                    )}

                                                    <div className="summary-row">
                                                        <span>
                                                            Total Committee Earnings
                                                            <b>
                                                                {" "}
                                                                {currency}
                                                                {committeePerformance?.totalCommitteeEarning?.toLocaleString() || 0}
                                                            </b>
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>

                                    )}

                                </div>

                            </section>

                        </div>
                    </div>

                </div>
            </section>

            <FrontendFooter />
        </>
    );
};

export default EventDashboardPage;