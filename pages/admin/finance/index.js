import React, { useEffect, useState } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import {
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Table,
  Form,
} from "react-bootstrap";
import ClipLoader from "react-spinners/ClipLoader";
import Moment from "react-moment";
import "moment-timezone";
import Link from "next/link";
import api from "@/utils/api";

const Finance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchEventData, setSearchEventData] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // To store list of all events for the dropdown
  const [selectedEvent, setSelectedEvent] = useState("all"); // Track the selected event
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/v1/admin/finance/event-details");
      if (response.data.success) {
        const fetchedEvents = response.data.data.events;
        // console.log("fetchedEvents",fetchedEvents)
        setAllEvents(fetchedEvents);
        setSearchEventData(fetchedEvents);
        setIsLoading(false);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching events:", error);
    }
  };

  // Event handler for the dropdown change
  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
    if (event.target.value == "all") {
      fetchEvents();
    } else {
      searchFetchEvents(event.target.value);
    }
  };

  const searchFetchEvents = async (eventId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/admin/finance/event-details?event_id=${eventId}`);
      if (response.data.success) {
        const fetchedEvents = response.data.data.events;
        setSearchEventData(fetchedEvents);
        setIsLoading(false);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching events:", error);
    }
  };

  return (
    <>
      <Seo title={"Sales Summary"} />
      <Row className="row-sm mt-4">
        <Col xl={12}>
          <div className="Mmbr-card">
            <Card>

              <Card.Body>
                <Tabs defaultActiveKey="summary" id="sales-summary-tabs">
                  <Tab eventKey="summary" title="Summary">
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
                        {/* Dropdown for selecting event */}
                        <div className="d-flex justify-content-end my-2 mx-sm-2 mx-0">
                          <Form.Select
                            aria-label="Select Event"
                            onChange={handleEventChange}
                            value={selectedEvent}
                            style={{ width: "100%", maxWidth: "440px" }}
                          >
                            <option value="all">All Events</option>
                            {allEvents.map((event) => (
                              <option key={event.event_id} value={event.event_id}>
                                {event.event_name}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        {/* Table displaying filtered sales data */}
                        <div className="admin-financeMain">
                          <Table
                            striped
                            bordered
                            hover
                            className=" responsive-table"
                          >
                            <thead>
                              <tr>
                                <th>Event Name</th>
                                <th>Details</th>
                                {/* <th>Total</th> */}
                                <th>Tickets (Qty)</th>
                                <th>Addons (Qty)</th>
                                <th>package (Qty)</th>
                                <th>Staff Tickets</th>
                                {/* <th>Transfer</th> */}
                                <th>Face Value</th>
                                <th>Taxes</th>
                                <th>Gross Sales</th>
                              </tr>
                            </thead>
                            <tbody>
                              {searchEventData.map((detail, index) => (
                                <tr key={index}>
                                  {/* Event Name */}
                                  <td>
                                    <div style={{ marginBottom: "5px" }}>
                                      <Link
                                        href={`/admin/finance/sale-by-ticket-type/${detail.event_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.event_name}
                                      </Link>
                                      {/*
                                      {
                                        detail.id == 111 && (
                                          <Button
                                            variant="success"
                                            className="btn-sm d-flex align-items-center"
                                            onClick={() => handleDownloadOrdersExcel(detail.Name)} // ✅ Correct
                                            disabled={excelLoading}
                                          >
                                            {excelLoading ? (
                                              <>
                                                <span
                                                  className="spinner-border spinner-border-sm me-2"
                                                  role="status"
                                                  aria-hidden="true"
                                                ></span>
                                                Downloading...
                                              </>
                                            ) : (
                                              <>
                                                <i className="bi bi-file-earmark-excel-fill me-2"></i>
                                                Download Orders
                                              </>
                                            )}
                                          </Button>
                                        )
                                      } */}
                                    </div>

                                    <div style={{ marginTop: "5px" }}>
                                      <Link
                                        href={`/admin/finance/sales/${detail.event_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        Sales per month
                                      </Link>
                                    </div>
                                  </td>

                                  {/* Event Dates with Time */}
                                  <td style={{ whiteSpace: "nowrap" }}>
                                    <Moment format="DD-MMM-YYYY" utc>
                                      {detail.date_from}
                                    </Moment>
                                    {" to "}
                                    <Moment format="DD-MMM-YYYY" utc>
                                      {detail.date_to}
                                    </Moment>

                                    <div className="bold-text">
                                      <b>Orders:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/orders/orders-list/${encodeURIComponent(
                                            detail.event_name
                                          )}`,
                                          query: { eventId: detail.event_id },
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.total_orders}
                                      </Link>

                                    </div>
                                  </td>

                                  {/* Total Tickets Sold */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Total:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/orders/order-details/${encodeURIComponent(
                                            detail.event_name
                                          )}`,
                                          query: { type: "ticket" },
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.ticket_count}
                                      </Link>
                                    </div>
                                    <div className="bold-text">

                                      <b>Cancelled:</b>{" "}
                                      {detail.cancel_ticket_count}
                                    </div>
                                  </td>

                                  {/* Total Addons Sold */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Total:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/orders/order-details/${encodeURIComponent(
                                            detail.Name
                                          )}`,
                                          query: { type: "addon" },
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.addon_count}
                                      </Link>
                                    </div>
                                    <div className="bold-text">
                                      <b>Cancelled:</b>{" "}
                                      {detail.cancel_addon_count}
                                    </div>
                                  </td>

                                  {/* Total Accommodation Sold */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Total:</b>{" "}

                                      {detail.package_count}
                                      {/* </Link> */}
                                    </div>
                                    <div className="bold-text">
                                      <b>Cancelled:</b>{" "}
                                      {detail.cancel_package_count}
                                    </div>
                                  </td>



                                  {/* Total Staff Ticket */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Total:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/events/staff`,
                                          query: { id: detail.event_id },
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.staff_count}
                                      </Link>
                                    </div>
                                  </td>

                                  {/* Transfer  */}
                                  {/* <td>
                                    <Link
                                      href={{
                                        pathname: `/admin/orders/order-details/${encodeURIComponent(
                                          detail.Name
                                        )}`,
                                        query: { type: "ticket", transfer: 1 },
                                      }}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        textDecoration: "underline",
                                        color: "blue",
                                      }}
                                    >
                                      Ticket: {detail.totalTicketTransfer}
                                    </Link>
                                    <br />
                                    <Link
                                      href={{
                                        pathname: `/admin/orders/order-details/${encodeURIComponent(
                                          detail.Name
                                        )}`,
                                        query: { type: "addon", transfer: 1 },
                                      }}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        textDecoration: "underline",
                                        color: "blue",
                                      }}
                                    >
                                      Addon: {detail.totalAddonTransfer}
                                    </Link>
                                  </td> */}

                                  {/* Net Sales: Modify if you have any specific calculation for net */}
                                  <td style={{ textAlign: "right" }}>
                                    {`${detail.currency_symbol || ""}${Number(
                                      detail.sub_total_sum || 0
                                    ).toLocaleString()}`}
                                  </td>

                                  {/* totalTax */}
                                  <td style={{ textAlign: "right" }}>
                                    {`${detail.currency_symbol || ""}${Number(
                                      detail.tax_total_sum || 0
                                    ).toLocaleString()}`}
                                  </td>

                                  {/* Gross Sales: Checking if Currency exists */}
                                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                    <div>
                                      <strong>Total Amount:</strong>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/orders/orders-list/${encodeURIComponent(detail.event_name)}`,
                                          query: { eventId: detail.event_id },
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {`${detail.currency_symbol || ""}${Number(
                                          detail.grand_total_sum || 0
                                        ).toLocaleString()}`}
                                      </Link>
                                    </div>
                                    <div>
                                      <strong>Cancel Amount:</strong>{" "}
                                      {`${detail.currency_symbol || ""}${Number(
                                        detail.cancel_grand_total || 0
                                      ).toLocaleString()}`}

                                    </div>
                                    <div>
                                      <strong>Net Amount:</strong>{" "}
                                      {`${detail.currency_symbol || ""}${Number(
                                        (detail.grand_total_sum || 0) - (detail.cancel_grand_total || 0)
                                      ).toLocaleString()}`}

                                    </div>
                                  </td>
                                </tr>
                              ))}
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
        </Col >
      </Row >
    </>
  );
};

Finance.layout = "Contentlayout";

export default Finance;
