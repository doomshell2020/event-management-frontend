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

const SalePerMonths = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { eventId } = router.query; // Retrieve the event ID from the URL
    const [eventData, setEventData] = useState();
    console.log(eventData)
    useEffect(() => {
        if (eventId) {
            const fetchTicketTypes = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch("/api/v1/dashboard/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            key: "tickets_addons_per_months",
                            // key: "tickets_addons_sales_monthly",
                            eventId: eventId,
                        }),
                    });
                    const { data } = await response.json();
                    // setEventData(data);
                    setEventData(data);
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
            <>
                <Seo title={"Sales Summary Months"} />
                <Row className="row-sm mt-4">
                    <Col xl={12}>
                        <div className="Mmbr-card">
                            <Card>
                                {/* <Card.Header>
              <div className="d-flex justify-content-between">
                <h4 className="card-title mg-b-5">Sales Summary</h4>
              </div>
            </Card.Header> */}
                                <Card.Body>
                                    <Tabs defaultActiveKey="summary" id="sales-per-months">
                                        <Tab eventKey="summary" title="Sales By Months">
                                            {isLoading ? (
                                                <div className="d-flex justify-content-center">
                                                    <ClipLoader
                                                        loading={isLoading}
                                                        color="#36d7b7"
                                                        aria-label="Loading Spinner"
                                                        data-testid="loader"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="admin-financeMain">
                                                        <Table striped bordered hover className="responsive-table">
                                                            <tbody>
                                                                {/* Event Name Row */}
                                                                <tr>
                                                                    <th colSpan={Object.keys(eventData?.ordersByMonth || {}).length + 2}>
                                                                        <strong>{eventData?.eventName || "No event name"}</strong>
                                                                    </th>
                                                                </tr>

                                                                {/* Month Headers (Corrected Order) */}
                                                                <tr>
                                                                    <th><strong>Months</strong></th>  {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "center" }} ><strong>Gross Total</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td style={{ textAlign: "center" }} key={month}><strong>{month}</strong></td>
                                                                    ))}
                                                                </tr>

                                                                {/* Tickets Count Per Month */}
                                                                <tr>
                                                                    <th><strong>Tickets</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.grandTotalTickets}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td style={{ textAlign: "right" }} key={month}>{eventData?.ordersByMonth[month]?.ticketCount || 0}</td>
                                                                    ))}
                                                                </tr>

                                                                {/* Addons Count Per Month */}
                                                                <tr>
                                                                    <th><strong>Addons</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.grandTotalAddons}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td style={{ textAlign: "right" }} key={month}>{eventData?.ordersByMonth[month]?.addonCount || 0}</td>
                                                                    ))}
                                                                </tr>


                                                                {/* Cancel Tickets Count Per Month  */}
                                                                <tr>
                                                                    <th><strong>Cancel Tickets</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.cancelTicketsReport?.data?.totalCanceledTickets}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td style={{ textAlign: "right" }} key={month}>{eventData?.cancelTicketsReport?.data?.ordersByMonth[month]?.canceledTickets || 0}</td>
                                                                    ))}
                                                                </tr>

                                                                {/* Cancel Addons Count Per Month */}
                                                                <tr>
                                                                    <th><strong>Cancel Addons</strong></th>
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.cancelTicketsReport?.data?.totalCanceledAddons}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td style={{ textAlign: "right" }} key={month}>{eventData?.cancelTicketsReport?.data?.ordersByMonth[month]?.canceledAddons || 0}</td>
                                                                    ))}
                                                                </tr>


                                                                {/* Total Tickets and Addons  Cancel Amount Per Month */}
                                                                {/* <tr>
                                                                    <th><strong>Cancel Amount ({eventData?.currencySymbol})</strong></th> 
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.currencySymbol}{eventData?.cancelTicketsReport?.data?.totalCancelAmount.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month} style={{ textAlign: "right" }}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.cancelTicketsReport?.data?.ordersByMonth[month]?.cancelAmount || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr> */}

                                                                {/* Price Tickets and Addons Monthly without Tax */}
                                                                <tr>
                                                                    <th><strong>Face Value ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.currencySymbol}{eventData?.totalTicketAmountWithoutTax.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month} style={{ textAlign: "right" }}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.ordersByMonth[month]?.ticketAmountWithoutTax + eventData?.ordersByMonth[month]?.addonAmountWithoutTax || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* Tax Per Month */}
                                                                <tr>
                                                                    <th><strong>Tax ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.currencySymbol}{eventData?.grandTotalTax.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.totalTaxByMonth || {}).map((month) => (
                                                                        <td key={month} style={{ textAlign: "right" }}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.totalTaxByMonth[month] || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* Total Amount Per Month */}
                                                                <tr>
                                                                    <th><strong>Gross Amount ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.currencySymbol}{eventData?.totalOrderAmount.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month} style={{ textAlign: "right" }}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.ordersByMonth[month]?.totalAmount || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>



                                                                {/* Cancelled Tickets Face Value */}
                                                                <tr>
                                                                    <th><strong>Cancelled Tickets Face Value  ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.currencySymbol}{eventData?.cancelTicketsReport?.data?.grandTotalCanceledAmountWithoutTax.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month} style={{ textAlign: "right" }}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.cancelTicketsReport?.data?.ordersByMonth[month]?.totalCanceledAmountWithoutTax || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* Cancelled Tickets Tax */}
                                                                <tr>
                                                                    <th><strong>Cancelled Tickets Tax ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.currencySymbol}{eventData?.cancelTicketsReport?.data?.grandTotalTaxAppliedOnCanceled.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month} style={{ textAlign: "right" }}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.cancelTicketsReport?.data?.ordersByMonth[month]?.totalTaxAppliedOnCanceled || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>


                                                                {/* Total Amount (Cancellation)*/}
                                                                <tr>
                                                                    <th><strong>Total Amount (Cancellation) ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.currencySymbol}{eventData?.cancelTicketsReport?.data?.totalCancelAmount.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month} style={{ textAlign: "right" }}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.cancelTicketsReport?.data?.ordersByMonth[month]?.cancelAmount || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* Total Received Amount */}
                                                                <tr>
                                                                    <th><strong>Net Amount Received ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th style={{ textAlign: "right" }}><strong>{eventData?.currencySymbol}
                                                                        {(
                                                                            (eventData?.totalOrderAmount || 0) -
                                                                            (eventData?.cancelTicketsReport?.data?.totalCancelAmount || 0)
                                                                        ).toLocaleString()}</strong></th>
                                                                    {/* {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month} style={{ textAlign: "right" }}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.ordersByMonth[month]?.totalAmount || 0).toLocaleString()}
                                                                        </td>
                                                                    ))} */}
                                                                </tr>



                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </>
                                            )}
                                        </Tab>
                                    </Tabs>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </>
        </>
    );
};

SalePerMonths.layout = "Contentlayout";

export default SalePerMonths;
