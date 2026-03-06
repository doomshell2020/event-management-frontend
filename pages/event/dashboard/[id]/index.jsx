import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Spinner } from "react-bootstrap"; // Using Bootstrap spinner

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import api from "@/utils/api";
// 🔹 ApexCharts (SSR disabled)
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EventDashboardPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [eventDetails, setEventDetails] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    // console.log('dashboardData :', dashboardData);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    /* ---------------- CLIENT CHECK ---------------- */
    useEffect(() => setIsClient(true), []);

    /* ---------------- FETCH EVENT & DASHBOARD DATA ---------------- */
    useEffect(() => {
        if (!id) return;

        const fetchEventData = async () => {
            setLoading(true); // Start loading
            try {
                // Event details
                const eventRes = await api.post(`/api/v1/events/event-list`, { id });
                if (eventRes.data.success && eventRes.data.data.events.length > 0) {
                    setEventDetails(eventRes.data.data.events[0]);
                }

                // Dashboard analytics
                const dashRes = await api.get(`/api/v1/orders/event-dashboard-analytics?event_id=${id}`);
                if (dashRes.data.success) {
                    // console.log('dashRes.data.data :', dashRes.data.data);
                    setDashboardData(dashRes.data.data);
                }
            } catch (err) {
                console.error("Fetch dashboard data error:", err);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchEventData();
    }, [id]);


    // ---------------- SANITIZE DASHBOARD DATA ----------------
    const salesOverTime = Array.isArray(dashboardData?.sales_over_time)
        ? dashboardData.sales_over_time.filter(item => item && item.month != null && item.revenue != null)
        : [];

    const salesByItem = Array.isArray(dashboardData?.sales_by_item)
        ? dashboardData.sales_by_item.filter(item => item && item.name != null && item.sold != null)
        : [];

    const salesByPayment = Array.isArray(dashboardData?.sales_by_payment_method)
        ? dashboardData.sales_by_payment_method.filter(item => item && item.paymenttype != null && item.method_revenue != null)
        : [];

    /* ================== DERIVED VALUES ================== */
    const totalTickets = dashboardData?.total_tickets || 500;
    const soldTickets = dashboardData?.tickets_sold || 450;
    const totalRevenue = dashboardData?.total_revenue || 90000;
    const organizerEarning = dashboardData?.organizer_earning || 78300;
    const platformFee = dashboardData?.platform_fee || 7200;
    const committeeFee = dashboardData?.committee_fee || 4500;

    const soldPercent = Math.round((soldTickets / totalTickets) * 100);

    /* ================== CHARTS ================== */
    const commissionColors = {
        organizer: "#22c55e", // green
        platform: "#6366f1",  // indigo
        committee: "#f59e0b", // orange
    };

    // Revenue Distribution (Horizontal Bar)
    const revenueBarSeries = [
        {
            name: "Revenue",
            data: [organizerEarning, platformFee, committeeFee],
        },
    ];

    const revenueBarOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "40%",
                borderRadius: 6,
                distributed: true, // 👈 THIS IS THE KEY
            },
        },
        colors: [
            commissionColors.organizer,
            commissionColors.platform,
            commissionColors.committee,
        ],
        xaxis: {
            categories: ["Organizer", "Platform", "Committee"],
            labels: { style: { colors: "#94a3b8" } },
        },
        dataLabels: { enabled: false },
    };


    // Commission Split (Donut)
    const commissionDonutSeries = [
        organizerEarning,
        platformFee,
        committeeFee,
    ];

    const commissionDonutOptions = {
        chart: { type: "donut" },
        labels: ["Organizer", "Platform", "Committee"],
        colors: [
            commissionColors.organizer,
            commissionColors.platform,
            commissionColors.committee,
        ],
        legend: {
            position: "bottom",
            labels: { colors: "#94a3b8" },
        },
        dataLabels: { enabled: false },
    };
    /* ---------------- RENDER ---------------- */
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar eventId={id} eventDetails={eventDetails} />
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />

                                <h4 className="text-24">Sales Dashboard</h4>
                                <hr className="custom-hr" />
                                {/* ================= CHARTS ================= */}
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
                                                                <small>{soldPercent}% sold</small>
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
                                                                <h4 className="dash-value">₹{totalRevenue}</h4>
                                                            </div>
                                                            <div className="dash-icon bg-info">
                                                                <i className="fe fe-dollar-sign"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
                                                    <div className="card dashboard-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="dash-label">ORGANIZER EARNINGS</p>
                                                                <h4 className="dash-value">₹{organizerEarning}</h4>
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
                                                        <h6 className="section-title">Revenue Distribution</h6>
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
                                                        <h6 className="section-title">Commission Split</h6>
                                                        {isClient && (
                                                            <ReactApexChart
                                                                options={commissionDonutOptions}
                                                                series={commissionDonutSeries}
                                                                type="donut"
                                                                height={260}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ================= Commission Breakdown ================= */}
                                            <div className="col-md-6 mb-4">
                                                <div className="light-card">
                                                    <div className="card-top">
                                                        <h6>Commission Breakdown</h6>
                                                        {/* <span className="pill">450 tickets sold</span> */}
                                                    </div>

                                                    <div className="list-row">
                                                        <span>Payment Gateway Fee(8%)</span>
                                                        <span className="text-success fw-bold">₹200</span>
                                                    </div>

                                                    <div className="list-row">
                                                        <span>Platform Fee(8%)</span>
                                                        <span className="text-info">₹16</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ================= Sales Progress ================= */}
                                            <div className="col-md-6 mb-4">
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
                                                            <p>Sold<br />TICKETS</p>
                                                            <h4>{soldTickets}</h4>
                                                        </div>

                                                        <div className="sales-box">
                                                            <p>Remaining<br />TICKETS</p>
                                                            <h4>{totalTickets - soldTickets}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ================= Committee Performance ================= */}
                                            <div className="col-12">
                                                <div className="light-card">
                                                    <div className="card-top">
                                                        <h6>Committee Performance</h6>
                                                        <span className="pill warning">5% Commission</span>
                                                    </div>

                                                    {[
                                                        { name: "Rahul Sharma", value: 85, color: "warning" },
                                                        { name: "Priya Patel", value: 92, color: "success" },
                                                        { name: "Amit Kumar", value: 78, color: "warning" },
                                                        { name: "Sneha Gupta", value: 95, color: "success" },
                                                        { name: "Vikram Singh", value: 100, color: "success" },
                                                    ].map((item, i) => (
                                                        <div key={i} className="mb-4">
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <span>{item.name}</span>
                                                                <span className="fw-bold">{item.value}%</span>
                                                            </div>
                                                            <div className="progress light-progress">
                                                                <div
                                                                    className={`progress-bar bg-${item.color}`}
                                                                    style={{ width: `${item.value}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="summary-row">
                                                        <span>Total Committee Earnings <b>₹4,500</b></span>
                                                        <span className="ms-auto">Avg. Conversion <b>90%</b></span>
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
