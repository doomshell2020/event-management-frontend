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
  Button
} from "react-bootstrap";
import ClipLoader from "react-spinners/ClipLoader";
import Moment from "react-moment";
import "moment-timezone";
import Link from "next/link";
import api from "@/utils/api";
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const Finance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchEventData, setSearchEventData] = useState([]);
  // console.log("searchEventData", searchEventData)
  const [allEvents, setAllEvents] = useState([]); // To store list of all events for the dropdown
  const [selectedEvent, setSelectedEvent] = useState("all"); // Track the selected event
  const [excelLoadingId, setExcelLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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

  //  download order excel
  const handleDownloadOrdersExcel = async (event_id) => {
    try {
      setExcelLoadingId(event_id);
      const response = await api.get(
        `/api/v1/admin/finance/completed-orders/${event_id}`
      );
      const ordersArray = response?.data?.data?.orders || [];
      if (ordersArray.length === 0) {
        alert("No orders found.");
        return;
      }
      const eventName = ordersArray[0]?.event?.name || "Event";
      const currency = ordersArray[0]?.event?.currency_symbol || "";

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Completed Orders");

      /* =========================
         HEADERS (CLEAN & REQUIRED)
      ========================= */
      worksheet.columns = [
        { header: "S.No", key: "sno", width: 8 },
        { header: "Order ID", key: "order_uid", width: 22 },
        { header: "Order Date", key: "created", width: 18 },
        { header: "Customer Name", key: "customer_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Mobile", key: "mobile", width: 18 },

        { header: "Tickets", key: "tickets", width: 12 },
        { header: "Appointments", key: "appointments", width: 16 },
        { header: "Addons", key: "addons", width: 12 },
        { header: "Packages", key: "packages", width: 14 },
        { header: "Comps", key: "comps", width: 12 },
        { header: "Committee Sale", key: "committesale", width: 16 },

        { header: `Sub Total (${currency})`, key: "sub_total", width: 16 },
        { header: `Tax (${currency})`, key: "tax_total", width: 16 },
        { header: `Grand Total (${currency})`, key: "grand_total", width: 18 },
      ];

      /* =========================
         FORMAT DATA
      ========================= */
      const formattedData = ordersArray.map((order, index) => ({
        sno: index + 1,
        order_uid: order.order_uid,
        created: moment(order.created).format("DD-MM-YYYY"),

        customer_name: `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim(),
        email: order.user?.email || "-",
        mobile: order.user?.mobile || "-",

        tickets: order.item_count?.ticket || 0,
        appointments: order.item_count?.appointment || 0,
        addons: order.item_count?.addon || 0,
        packages: order.item_count?.package || 0,
        comps: order.item_count?.comps || 0,
        committesale: order.item_count?.committesale || 0,

        sub_total: order.amount?.sub_total || 0,
        tax_total: order.amount?.tax_total || 0,
        grand_total: order.amount?.grand_total || 0,
      }));
      ["sub_total", "tax_total", "grand_total"].forEach(key => {
        const colIndex = worksheet.columns.findIndex(c => c.key === key) + 1;
        if (colIndex > 0) {
          worksheet.getColumn(colIndex).numFmt = '#,##0.00';
        }
      });
      formattedData.forEach(row => worksheet.addRow(row));

      /* =========================
         TOTAL ROW
      ========================= */
      worksheet.addRow({}); // blank row

      const totalRow = {
        order_uid: "TOTAL",
        tickets: formattedData.reduce((s, r) => s + r.tickets, 0),
        appointments: formattedData.reduce((s, r) => s + r.appointments, 0),
        addons: formattedData.reduce((s, r) => s + r.addons, 0),
        packages: formattedData.reduce((s, r) => s + r.packages, 0),
        comps: formattedData.reduce((s, r) => s + r.comps, 0),
        committesale: formattedData.reduce((s, r) => s + r.committesale, 0),
        sub_total: formattedData.reduce((s, r) => s + r.sub_total, 0),
        tax_total: formattedData.reduce((s, r) => s + r.tax_total, 0),
        grand_total: formattedData.reduce((s, r) => s + r.grand_total, 0),
      };

      worksheet.addRow(totalRow);

      /* =========================
         STYLING
      ========================= */
      // Header
      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF000000" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Total row
      const totalRowIndex = worksheet.lastRow.number;
      worksheet.getRow(totalRowIndex).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
      });

      worksheet.views = [{ state: "frozen", ySplit: 1 }];
      const totalColumns = worksheet.columns.length;
      const lastColumnLetter = worksheet.getColumn(totalColumns).letter;

      worksheet.autoFilter = {
        from: "A1",
        to: `${lastColumnLetter}1`,
      };
      /* =========================
         DOWNLOAD
      ========================= */
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `Completed_Orders_${eventName}_${moment().format("YYYYMMDD_HHmmss")}.xlsx`
      );
    } catch (error) {
      console.error("Excel download failed:", error);
      alert("Something went wrong while downloading the Excel file.");
    } finally {
      setExcelLoadingId(null);
    }
  };



  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentEvents = searchEventData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(searchEventData.length / itemsPerPage);
  const maxVisiblePages = 3;

  const getVisiblePages = () => {
    let start = Math.max(currentPage - 1, 1);
    let end = start + maxVisiblePages - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
                                <th>Appointment (Qty)</th>
                                <th>Staff Tickets</th>
                                {/* <th>Transfer</th> */}
                                <th>Face Value</th>
                                <th>Taxes</th>
                                <th>Gross Sales</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* {searchEventData.map((detail, index) => ( */}
                              {currentEvents.map((detail, index) => (
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


                                      <Button
                                        variant="success"
                                        className="btn-sm d-flex align-items-center"
                                        onClick={() => handleDownloadOrdersExcel(detail.event_id)} // ✅ Correct
                                        disabled={excelLoadingId === detail.event_id}
                                      >
                                        {excelLoadingId === detail.event_id ? (
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
                                          pathname: `/admin/orders/${detail.event_id}`,
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
                                        href={{ pathname: `/admin/orders/order-details/ticket/${detail.event_id}` }}
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
                                          pathname: `/admin/orders/order-details/addon/${detail.event_id}`
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

                                  {/* Total package Sold */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Total:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/orders/order-details/package/${detail.event_id}`
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.package_count}
                                      </Link>
                                    </div>
                                    <div className="bold-text">
                                      <b>Cancelled:</b>{" "}
                                      {detail.cancel_package_count}
                                    </div>
                                  </td>

                                  {/* Total appointment Sold */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Total:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/orders/order-details/appointment/${detail.event_id}`
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.appointment_count}
                                      </Link>
                                    </div>
                                    <div className="bold-text">
                                      <b>Cancelled:</b>{" "}
                                      {detail.cancel_appointment_count}
                                    </div>
                                  </td>


                                  {/* Total Staff Ticket */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Total:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/events/staff/${detail.event_id}`
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
                                          pathname: `/admin/orders/${detail.event_id}`,
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
                                      ).toFixed(2)}`}
                                      {/* {`${detail.currency_symbol || ""}${Number(
                                        detail.cancel_grand_total || 0
                                      ).toLocaleString()}`} */}

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
                          <div className="d-flex justify-content-end mt-3">
                            <nav>
                              <ul className="pagination mb-0">

                                {/* First */}
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(1)}
                                  >
                                    ⏮
                                  </button>
                                </li>

                                {/* Prev */}
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                  >
                                    ◀
                                  </button>
                                </li>

                                {/* Page Numbers */}
                                {getVisiblePages().map(page => (
                                  <li
                                    key={page}
                                    className={`page-item ${currentPage === page ? "active" : ""}`}
                                  >
                                    <button
                                      className="page-link"
                                      onClick={() => setCurrentPage(page)}
                                    >
                                      {page}
                                    </button>
                                  </li>
                                ))}

                                {/* Next */}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  >
                                    ▶
                                  </button>
                                </li>

                                {/* Last */}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(totalPages)}
                                  >
                                    ⏭
                                  </button>
                                </li>

                              </ul>
                            </nav>
                          </div>


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
