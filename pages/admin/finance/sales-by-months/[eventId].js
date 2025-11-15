import React from "react";
import { useState, useRef, useEffect } from "react";
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
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";

import ClipLoader from "react-spinners/ClipLoader";

const SalePerMonths = () => {
    // const [DATA_TABLE, SetDATA_TABLE] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { eventId } = router.query; // Retrieve the event ID from the URL
    const [eventData, setEventData] = useState();
    // console.log(eventData)
    useEffect(() => {
        if (eventId) {
            const fetchTicketTypes = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch("/api/v1/dashboard/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            // key: "tickets_addons_per_months",
                            key: "tickets_addons_sales_monthly",
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


    const [DATA_TABLE, setDataTable] = useState([]);

    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "Event Date",
            accessor: "tickettype",
            className: "wd-20p borderrigth",
        },
        {
            Header: "SOLD",
            accessor: "sold",
            className: "wd-10p borderrigth",
        },
        {
            Header: (
                <span style={{ textAlign: "right", display: "block" }}>FACE VALUE</span>
            ), // Align header text to the right
            accessor: "face",
            className: "wd-10p borderrigth text-right", // Right-align cell content
        },
    ]);

    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: DATA_TABLE,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const {
        getTableProps, // table props from react-table
        headerGroups, // headerGroups, if your table has groupings
        getTableBodyProps, // table body props from react-table
        prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
        state,
        setGlobalFilter,
        page, // use, page or rows
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        pageOptions,
        gotoPage,
        pageCount,
        setPageSize,
        footerGroups,
    } = tableInstance;

    const { globalFilter, pageIndex } = state;

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
                                                                    <th><strong>Gross Total</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month}><strong>{month}</strong></td>
                                                                    ))}
                                                                </tr>

                                                                {/* Tickets Count Per Month */}
                                                                <tr>
                                                                    <th><strong>Tickets</strong></th> {/* Moved to First Column */}
                                                                    <th><strong>{eventData?.grandTotalTickets}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month}>{eventData?.ordersByMonth[month]?.ticketCount || 0}</td>
                                                                    ))}
                                                                </tr>

                                                                {/* Addons Count Per Month */}
                                                                <tr>
                                                                    <th><strong>Addons</strong></th> {/* Moved to First Column */}
                                                                    <th><strong>{eventData?.grandTotalAddons}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month}>{eventData?.ordersByMonth[month]?.addonCount || 0}</td>
                                                                    ))}
                                                                </tr>

                                                                {/* Price Tickets and Addons Monthly without Tax */}
                                                                <tr>
                                                                    <th><strong>Face Value ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th><strong>{eventData?.currencySymbol}{eventData?.totalTicketAmountWithoutTax.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.ordersByMonth[month]?.ticketAmountWithoutTax + eventData?.ordersByMonth[month]?.addonAmountWithoutTax || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* Tax Per Month */}
                                                                <tr>
                                                                    <th><strong>Tax ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th><strong>{eventData?.currencySymbol}{eventData?.grandTotalTax.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.totalTaxByMonth || {}).map((month) => (
                                                                        <td key={month}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.totalTaxByMonth[month] || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
                                                                </tr>

                                                                {/* Total Amount Per Month */}
                                                                <tr>
                                                                    <th><strong>Total Amount ({eventData?.currencySymbol})</strong></th> {/* Moved to First Column */}
                                                                    <th><strong>{eventData?.currencySymbol}{eventData?.totalOrderAmount.toLocaleString()}</strong></th>
                                                                    {Object.keys(eventData?.ordersByMonth || {}).map((month) => (
                                                                        <td key={month}>
                                                                            {eventData?.currencySymbol}
                                                                            {Math.round(eventData?.ordersByMonth[month]?.totalAmount || 0).toLocaleString()}
                                                                        </td>
                                                                    ))}
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
