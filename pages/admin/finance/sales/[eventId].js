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
} from "react-bootstrap";
import Seo from "@/shared/layout-components/seo/seo";
import ClipLoader from "react-spinners/ClipLoader";
import api from "@/utils/api";

const SalePerMonths = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { eventId } = router.query; // Retrieve the event ID from the URL
    const [eventData, setEventData] = useState();
    console.log("eventData", eventData)

    useEffect(() => {
        if (eventId) {
            const fetchTicketTypes = async () => {
                try {
                    setIsLoading(true);
                    const response = await api.get(`/api/v1/admin/finance/sales/monthly/${eventId}`);
                    console.log("response", response.data.data)
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

    return (
        <>
            <Seo title={"Sales Summary Months"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <div className="Mmbr-card">
                        <Card>
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
