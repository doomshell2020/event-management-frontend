import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Spinner } from "react-bootstrap";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import api from "@/utils/api";

const SalesPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [eventDetails, setEventDetails] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    // console.log('analytics :', analytics);
    const [loading, setLoading] = useState(false);

    /* ---------------- FETCH EVENT ---------------- */
    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (err) {
            console.error("Event fetch error", err);
        }
    };

    const fetchSalesAnalytics = async (eventId) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/orders/event-sales-summary`, { params: { event_id: eventId } });
            if (res.data.success) {
                setAnalytics(res.data.data);
            }
        } catch (err) {
            console.error("Analytics fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchEventDetails(id);
            fetchSalesAnalytics(id);
        }
    }, [id]);

    const formatCurrency = (currency, value) => {
        if (value == null) value = 0;
        const number = Number(value);
        return currency + (Number.isInteger(number) ? number : number.toFixed(2));
    };
    const sumByKey = (arr, key) => arr.reduce((sum, item) => sum + Number(item[key] || 0), 0);

    // Determine currency dynamically (from first item or default)
    const ticketCurrency = analytics?.sales_by_item?.[0]?.currency || "€";
    const methodCurrency = analytics?.sales_by_payment_method?.[0]?.currency || "€";

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar eventId={id}  eventDetails={eventDetails}/>
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <div>
                                    <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />
                                </div>

                                <h4 className="text-24">Sales</h4>
                                <hr className="custom-hr" />

                                <div className="d-flex align-items-end justify-content-between">
                                    <ul className="tabes d-flex ps-0 flex-grow-1 mb-0">
                                        <li>
                                            <Link href={`/event/analytics/${id}`} className="text-16">Dashboard</Link>
                                        </li>
                                        <li>
                                            <Link href={`/event/analytics/${id}/sales`} className="active text-16">Sales</Link>
                                        </li>
                                        <li>
                                            <Link href={`/event/analytics/${id}/sales-addons`} className="text-16">Addons</Link>
                                        </li>
                                    </ul>
                                    {/* <div className="h-100" style={{ minWidth: "150px" }}>
                                        <button className="d-flex align-items-center gap-2 bg-dark text-white px-4 py-2 rounded text-sm fw-medium">
                                            Export Ticket
                                        </button>
                                    </div> */}
                                </div>

                                <div className="contant_bg">
                                    {loading ? (
                                        <div className="text-center my-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2">Loading sales data...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Sales by Ticket */}
                                            <div className="card p-2 mb-3">
                                                <div className="d-flex align-items-center gap-2 pb-3 border-bottom">
                                                    <span className="ticket-icon-circle">🎟</span>
                                                    <h5 className="mb-0 fw-bold">Sales by Ticket</h5>
                                                </div>

                                                <div className="table-responsive">
                                                    <table className="table align-middle mb-0 mobile-talbe-width-480">
                                                        <thead className="table-light small text-uppercase">
                                                            <tr>
                                                                <th>Ticket Type</th>
                                                                <th className="text-end">Count</th>
                                                                <th className="text-end">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {analytics?.sales_by_item?.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td className="fw-medium">{item.name}</td>
                                                                    <td className="text-end">{item.sold}</td>
                                                                    <td className="text-end">{formatCurrency(item.currency, item.revenue)}</td>
                                                                </tr>
                                                            ))}

                                                            <tr className="total-row">
                                                                <td className="fw-semibold">Total</td>
                                                                <td className="text-end fw-semibold">
                                                                    {sumByKey(analytics?.sales_by_item?.filter(i => i.type == "ticket") || [], "sold")}
                                                                </td>
                                                                <td className="text-end fw-semibold">
                                                                    {formatCurrency(ticketCurrency, sumByKey(analytics?.sales_by_item?.filter(i => i.type == "ticket") || [], "revenue"))}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Sales by Method */}
                                            <div className="card p-2">
                                                <div className="d-flex align-items-center gap-2 pb-3 border-bottom">
                                                    <span className="ticket-icon-circle">💳</span>
                                                    <h5 className="mb-0 fw-bold">Sales by Method</h5>
                                                </div>

                                                <div className="table-responsive">
                                                    <table className="table align-middle mb-0 mobile-talbe-width-480">
                                                        <thead className="table-light small text-uppercase">
                                                            <tr>
                                                                <th>Payment Method</th>
                                                                <th className="text-end">Orders</th>
                                                                <th className="text-end">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {analytics?.sales_by_payment_method?.map((row, index) => (
                                                                <tr key={index}>
                                                                    <td className="fw-medium text-capitalize">{row.paymenttype}</td>
                                                                    <td className="text-end">{row.total_orders}</td>
                                                                    <td className="text-end">{formatCurrency(row.currency, row.method_revenue)}</td>
                                                                </tr>
                                                            ))}

                                                            <tr className="total-row">
                                                                <td className="fw-semibold">Total</td>
                                                                <td className="text-end fw-semibold">
                                                                    {sumByKey(analytics?.sales_by_payment_method || [], "total_orders")}
                                                                </td>
                                                                <td className="text-end fw-semibold">
                                                                    {formatCurrency(methodCurrency, sumByKey(analytics?.sales_by_payment_method || [], "method_revenue"))}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </>
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

export default SalesPage;
