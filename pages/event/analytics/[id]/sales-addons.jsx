import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Spinner } from "react-bootstrap";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import api from "@/utils/api";

const SalesAddonsPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [eventDetails, setEventDetails] = useState(null);
    const [addonsSales, setAddonsSales] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ---------------- HELPERS ---------------- */
    const formatCurrency = (currency, value) => {
        const number = Number(value || 0);
        return currency + (Number.isInteger(number) ? number : number.toFixed(2));
    };

    const sumByKey = (arr, key) =>
        arr.reduce((sum, item) => sum + Number(item[key] || 0), 0);

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

    /* ---------------- FETCH ADDON SALES ---------------- */
    const fetchAddonSales = async (eventId) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/orders/sales-addons`, {
                params: { event_id: eventId }
            });

            if (res.data.success) {
                setAddonsSales(res.data.data.sales_by_addon || []);
            }
        } catch (err) {
            console.error("Addon sales fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- INITIAL LOAD ---------------- */
    useEffect(() => {
        if (id) {
            fetchEventDetails(id);
            fetchAddonSales(id);
        }
    }, [id]);

    const currency = addonsSales?.[0]?.currency || "€";

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar eventId={id}  eventDetails={eventDetails}/>

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <EventHeaderSection
                                    eventDetails={eventDetails}
                                    isProgressBarShow={false}
                                />

                                <h4 className="text-24">Sales</h4>
                                <hr className="custom-hr" />

                                {/* Tabs */}
                                <ul className="tabes d-flex ps-0 flex-grow-1 mb-3">
                                    <li>
                                        <Link href={`/event/analytics/${id}`} className="text-16">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/event/analytics/${id}/sales`} className="text-16">
                                            Sales
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={`/event/analytics/${id}/sales-addons`}
                                            className="active text-16"
                                        >
                                            Addons
                                        </Link>
                                    </li>
                                </ul>

                                <div className="contant_bg">
                                    {loading ? (
                                        <div className="text-center my-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2">Loading addon sales...</p>
                                        </div>
                                    ) : (
                                        <div className="card p-2">
                                            <div className="d-flex align-items-center gap-2 pb-3 border-bottom">
                                                <span className="ticket-icon-circle">➕</span>
                                                <h5 className="mb-0 fw-bold">
                                                    Sales by Addons
                                                </h5>
                                            </div>

                                            <div className="table-responsive">
                                                <table className="table align-middle mb-0 mobile-talbe-width-480">
                                                    <thead className="table-light small text-uppercase">
                                                        <tr>
                                                            <th>Addon Type</th>
                                                            <th className="text-end">Count</th>
                                                            <th className="text-end">Total</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {addonsSales.length > 0 ? (
                                                            addonsSales.map((addon, index) => (
                                                                <tr key={index}>
                                                                    <td className="fw-medium">
                                                                        {addon.addon_name}
                                                                    </td>
                                                                    <td className="text-end">
                                                                        {addon.sold}
                                                                    </td>
                                                                    <td className="text-end">
                                                                        {formatCurrency(
                                                                            addon.currency,
                                                                            addon.revenue
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="3" className="text-center py-4">
                                                                    No addon sales found
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {/* Total Row */}
                                                        {addonsSales.length > 0 && (
                                                            <tr className="total-row">
                                                                <td className="fw-semibold">Total</td>
                                                                <td className="text-end fw-semibold">
                                                                    {sumByKey(addonsSales, "sold")}
                                                                </td>
                                                                <td className="text-end fw-semibold">
                                                                    {formatCurrency(
                                                                        currency,
                                                                        sumByKey(addonsSales, "revenue")
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
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

export default SalesAddonsPage;
