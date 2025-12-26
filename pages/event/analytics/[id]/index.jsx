import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Spinner } from "react-bootstrap"; // Using Bootstrap spinner

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";

import api from "@/utils/api";

// 🔹 ApexCharts (SSR disabled)
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsIndexPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [eventDetails, setEventDetails] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
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

    /* ---------------- DYNAMIC CHART DATA ---------------- */
    const salesChartOptions = {
        chart: { type: "line", height: 350 },
        xaxis: { categories: dashboardData?.sales_over_time?.map(item => item.month) || [] },
        stroke: { curve: "smooth" },
        markers: { size: 5 },
        colors: ["#600e7d"]
    };

    const salesChartSeries = [
        { name: "Total Sales", data: dashboardData?.sales_over_time?.map(item => item.revenue) || [] }
    ];

    const ticketChartOptions = {
        chart: { type: "bar", height: 350 },
        xaxis: { categories: dashboardData?.sales_by_item?.map(item => item.name) || [] },
        colors: ["#2b7cff"]
    };

    const ticketChartSeries = [
        { name: "Tickets Sold", data: dashboardData?.sales_by_item?.map(item => item.sold) || [] }
    ];

    const paymentChartOptions = {
        chart: { type: "donut", height: 350 },
        labels: dashboardData?.sales_by_payment_method?.map(item => item.paymenttype) || [],
        colors: ["#28a745", "#ffc107", "#17a2b8"]
    };

    const paymentChartSeries = dashboardData?.sales_by_payment_method?.map(item => item.method_revenue) || [];

    /* ---------------- RENDER ---------------- */
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar eventId={id} />
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />

                                <h4 className="text-24">Dashboard</h4>
                                <hr className="custom-hr" />

                                {/* 🔹 Tabs */}
                                <ul className="tabes d-flex ps-0 flex-grow-1 mb-4">
                                    <li>
                                        <Link href={`/event/analytics/${id}`} className="active text-16">Dashboard</Link>
                                    </li>
                                    <li>
                                        <Link href={`/event/analytics/${id}/sales`} className="text-16">Sales</Link>
                                    </li>
                                    <li>
                                        <Link href={`/event/analytics/${id}/sales-addons`} className="text-16">Addons</Link>
                                    </li>
                                </ul>

                                {/* ================= CHARTS ================= */}
                                <div className="contant_bg container-fluid">
                                    {loading ? (
                                        <div className="text-center my-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2">Loading dashboard data...</p>
                                        </div>
                                    ) : (
                                        <div className="row">

                                            {/* 🔹 SALES OVER TIME */}
                                            <div className="col-md-12 mb-4">
                                                <div className="card p-3">
                                                    <h6>Sales Over Time</h6>
                                                    {isClient && dashboardData && (
                                                        <ReactApexChart
                                                            options={salesChartOptions}
                                                            series={salesChartSeries}
                                                            type="line"
                                                            height={350}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* 🔹 TICKET SALES */}
                                            <div className="col-md-6 mb-4">
                                                <div className="card p-3">
                                                    <h6>Ticket & Appointment Sales</h6>
                                                    {isClient && dashboardData && (
                                                        <ReactApexChart
                                                            options={ticketChartOptions}
                                                            series={ticketChartSeries}
                                                            type="bar"
                                                            height={350}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* 🔹 PAYMENT METHOD */}
                                            <div className="col-md-6 mb-4">
                                                <div className="card p-3">
                                                    <h6>Payment Method Breakdown</h6>
                                                    {isClient && dashboardData && (
                                                        <ReactApexChart
                                                            options={paymentChartOptions}
                                                            series={paymentChartSeries}
                                                            type="donut"
                                                            height={350}
                                                        />
                                                    )}
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

export default AnalyticsIndexPage;
