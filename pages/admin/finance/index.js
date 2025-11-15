import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Seo from "@/shared/layout-components/seo/seo";
import {
  Row,
  Button,
  Col,
  Card,
  Tabs,
  Tab,
  Table,
  Spinner,
  Form,
} from "react-bootstrap";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import Moment from "react-moment";
import "moment-timezone";
import Link from "next/link";
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    grossSales: 0,
    netSales: 0,
    ticketsSold: 0,
    orders: 0,
    totalTransfer: 0,
    totalAttendees: 0,
    salesDetails: [], // Array to hold the tabular data
  });
  const [allEvents, setAllEvents] = useState([]); // To store list of all events for the dropdown
  const [searchEventData, setSearchEventData] = useState([]); // To store list of all events for the dropdown
  const [selectedEvent, setSelectedEvent] = useState("all"); // Track the selected event
  const [excelLoading, setExcelLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/v1/events/?key=get_summary");
      if (response.data.success) {
        const fetchedEvents = response.data.data;
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

  const searchFetchEvents = async (eventId) => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `/api/v1/events/?key=get_summary&event_id=${eventId}`
      );
      if (response.data.success) {
        const fetchedEvents = response.data.data;
        // console.log(">>>>>>>>>.", fetchedEvents);
        // return false

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


  const handleDownloadOrdersExcel = async (eventName) => {
    try {

      const body = new FormData();
      body.append("key", "eventorder");
      body.append("eventName", eventName);
      const response = await axios.post("/api/v1/events/", body);
      const ordersArray = response?.data?.data || [];

      if (ordersArray.length === 0) {
        alert("No orders found.");
        return;
      }

      setExcelLoading(true); // stop loading
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Orders");

      worksheet.columns = [
        { header: "S.No", key: "SNo", width: 8 },
        { header: "Customer Name", key: "Customer Name", width: 25 },
        { header: "Customer Email", key: "Customer Email", width: 30 },
        { header: "Customer Mobile", key: "Customer Mobile", width: 20 },
        { header: "Order Date", key: "Order Date", width: 20 },
        { header: "Order No", key: "Order No", width: 20 },
        { header: "Payment Type", key: "Payment Type", width: 20 },
        { header: "Order Amount", key: "Order Amount", width: 20 },
        { header: "Discount Amount", key: "Discount Amount", width: 20 },
        { header: "Promotion Code", key: "Promotion Code", width: 20 },
        { header: "Total Taxes", key: "Total Taxes", width: 20 },
        { header: "Due Amount", key: "Due Amount", width: 20 },
        { header: "Total Tickets", key: "Total Tickets", width: 20 },
        { header: "Ticket Amount", key: "Ticket Amount", width: 20 },
        { header: "Ticket After Tax", key: "Ticket After Tax", width: 20 },
        { header: "Total Addons", key: "Total Addons", width: 20 },
        { header: "Addons Amount", key: "Addons Amount", width: 20 },
        { header: "Addons After Tax", key: "Addons After Tax", width: 20 },
        { header: "Ticket Stripe Fee", key: "Ticket Stripe Fee", width: 25 },
        { header: "Ticket Bank Fee", key: "Ticket Bank Fee", width: 25 },
        { header: "Ticket Processing Fee", key: "Ticket Processing Fee", width: 25 },
        { header: "Ticket Platform Fee", key: "Ticket Platform Fee", width: 25 },
        { header: "Accommodation Name", key: "Accommodation Name", width: 25 },
        { header: "Base Amount", key: "Base Amount", width: 20 },
        { header: "Check In Date", key: "Check In Date", width: 20 },
        { header: "Check Out Date", key: "Check Out Date", width: 20 },
        { header: "Total Night", key: "Total Night", width: 20 },
        { header: "Per Night", key: "Per Night", width: 20 },
        { header: "Accommodation With Tax", key: "Accommodation With Tax", width: 25 },
        { header: "Owner Per Night", key: "Owner Per Night", width: 20 },
        { header: "Ondalinda Fees", key: "Ondalinda Fees", width: 20 },
        { header: "Service Tax", key: "Service Tax", width: 20 },
        { header: "Mexican VAT", key: "Mexican VAT", width: 20 },
        { header: "Accommodation Tax", key: "Accommodation Tax", width: 25 },
        { header: "Accommodation Stripe Fee", key: "Accommodation Stripe Fee", width: 25 },
        { header: "Accommodation Bank Fee", key: "Accommodation Bank Fee", width: 25 },
        { header: "Accommodation Processing Fee", key: "Accommodation Processing Fee", width: 30 },
        { header: "House Owner Payout", key: "House Owner Payout", width: 20 },
      ];

      // 🧩 Format data
      const formattedData = ordersArray.map((order, index) => {
        const accommodationInfo = order.BookAccommodationInfo || order.AccommodationExtensions?.[0] || {};
        // console.log('>>>>>>>>',accommodationInfo);

        const totalNights = Number(accommodationInfo?.total_night_stay || 0);
        const isPartial = order.paymentOption == "partial";

        const fullHomeownerPayout = (order.accommodationPerDaysPropertyOwnerAmount * totalNights);
        const fullOndalindaPayout = (order.accommodationOndalindaPerDaysFeeAmount * totalNights);

        const HomeownerPayout = isPartial ? fullHomeownerPayout / 2 : fullHomeownerPayout;
        const OndalindaPayout = isPartial ? fullOndalindaPayout / 2 : fullOndalindaPayout;
        const accommodationWithTax = isPartial ? (order.totalAccommodationAmount) / 2 : (order.totalAccommodationAmount);

        const ServiceTax = (order.accommodationPerDaysServiceFeeAmount || 0) * totalNights;
        const MexicanVAT = (order.accommodationPerDaysMexicanVATAmount || 0) * totalNights;
        const AccommodationTax = (order.accommodationPerDaysTaxAmount || 0) * totalNights;
        const StripeFee = (order.accommodationStripeFee || 0);
        const BankFee = (order.accommodationBankFee || 0);
        const ProcessingFee = (order.accommodationProcessingFee || 0);
        const discountAmount = (order.discountAmount || 0);

        return {
          SNo: index + 1,
          "Customer Name": `${order.User?.FirstName || ""} ${order.User?.LastName || ""}`.trim(),
          "Customer Email": order.User?.Email || "-",
          "Customer Mobile": order.User?.PhoneNumber || "-",
          "Order Date": moment(order.createdAt).format("DD-MM-YYYY"),
          "Order No": order.OriginalTrxnIdentifier,
          "Payment Type": order.paymentOption == "partial" ? "Partial Payment" : "Full Payment",
          "Order Amount": order.total_amount || 0,
          "Discount Amount": discountAmount || 0,
          "Promotion Code": order.couponCode || 0,
          "Total Taxes": order.total_tax_amount || 0,
          "Due Amount": order.total_due_amount || 0,
          "Total Tickets": order.TicketBooks?.length || 0,
          "Ticket Amount": order.totalTicketAmount || 0,
          "Ticket After Tax": (
            (Number(order.totalTicketAmount) || 0) +
            (Number(order.totalTicketTax) || 0)
          ) - (Number(discountAmount) || 0),
          "Total Addons": order.AddonBooks?.length || 0,
          "Addons Amount": order.totalAddonAmount || 0,
          "Addons After Tax": (order.totalAddonAmount || 0) + (order.totalAddonTax || 0),
          "Ticket Stripe Fee": order.ticketStripeFee || 0,
          "Ticket Bank Fee": order.ticketBankFee || 0,
          "Ticket Processing Fee": order.ticketProcessingFee || 0,
          "Ticket Platform Fee": order.ticketPlatformFee || 0,
          "Accommodation Name": accommodationInfo?.Housing?.Name || "",
          "Base Amount": order.accommodation_basePerDaysPriceHousing || 0,
          "Check In Date": accommodationInfo?.check_in_date || "",
          "Check Out Date": accommodationInfo?.check_out_date || "",
          "Total Night": totalNights || 0,
          "Per Night": order.accommodation_nightlyPerDaysRate || 0,
          "Accommodation With Tax": accommodationWithTax || 0,
          "Owner Per Night": order.accommodationPerDaysPropertyOwnerAmount || 0,
          "Service Tax": isPartial ? ServiceTax / 2 : ServiceTax,
          "Mexican VAT": isPartial ? MexicanVAT / 2 : MexicanVAT,
          "Accommodation Tax": isPartial ? AccommodationTax / 2 : AccommodationTax,
          "Accommodation Stripe Fee": isPartial ? StripeFee / 2 : StripeFee,
          "Accommodation Bank Fee": isPartial ? BankFee / 2 : BankFee,
          "Accommodation Processing Fee": isPartial ? ProcessingFee / 2 : ProcessingFee,
          "Ondalinda Fees": OndalindaPayout,
          "House Owner Payout": HomeownerPayout,
        };
      });


      // Add all data rows
      formattedData.forEach((item) => {
        worksheet.addRow(item);
      });

      // ✅ Add totals row
      const totalRow = {
        "Order No": "TOTAL",
        "Order Amount": formattedData.reduce((sum, row) => sum + row["Order Amount"], 0),
        "Discount Amount": formattedData.reduce((sum, row) => sum + row["Discount Amount"], 0),
        "Total Taxes": formattedData.reduce((sum, row) => sum + row["Total Taxes"], 0),
        "Due Amount": formattedData.reduce((sum, row) => sum + row["Due Amount"], 0),
        "Ticket Amount": formattedData.reduce((sum, row) => sum + row["Ticket Amount"], 0),
        "Total Tickets": formattedData.reduce((sum, row) => sum + row["Total Tickets"], 0),
        "Total Addons": formattedData.reduce((sum, row) => sum + row["Total Addons"], 0),
        "Ticket After Tax": formattedData.reduce((sum, row) => sum + row["Ticket After Tax"], 0),
        "Addons Amount": formattedData.reduce((sum, row) => sum + row["Addons Amount"], 0),
        "Addons After Tax": formattedData.reduce((sum, row) => sum + row["Addons After Tax"], 0),
        "Ticket Stripe Fee": formattedData.reduce((sum, row) => sum + row["Ticket Stripe Fee"], 0),
        "Ticket Bank Fee": formattedData.reduce((sum, row) => sum + row["Ticket Bank Fee"], 0),
        "Ticket Processing Fee": formattedData.reduce((sum, row) => sum + row["Ticket Processing Fee"], 0),
        "Ticket Platform Fee": formattedData.reduce((sum, row) => sum + row["Ticket Platform Fee"], 0),
        "Base Amount": formattedData.reduce((sum, row) => sum + row["Base Amount"], 0),
        "Per Night": formattedData.reduce((sum, row) => sum + row["Per Night"], 0),
        "Accommodation With Tax": formattedData.reduce((sum, row) => sum + row["Accommodation With Tax"], 0),
        "Owner Per Night": formattedData.reduce((sum, row) => sum + row["Owner Per Night"], 0),
        "Ondalinda Fees": formattedData.reduce((sum, row) => sum + row["Ondalinda Fees"], 0),
        "Service Tax": formattedData.reduce((sum, row) => sum + row["Service Tax"], 0),
        "Mexican VAT": formattedData.reduce((sum, row) => sum + row["Mexican VAT"], 0),
        "Accommodation Tax": formattedData.reduce((sum, row) => sum + row["Accommodation Tax"], 0),
        "Accommodation Stripe Fee": formattedData.reduce((sum, row) => sum + row["Accommodation Stripe Fee"], 0),
        "Accommodation Bank Fee": formattedData.reduce((sum, row) => sum + row["Accommodation Bank Fee"], 0),
        "Accommodation Processing Fee": formattedData.reduce((sum, row) => sum + row["Accommodation Processing Fee"], 0),
        "House Owner Payout": formattedData.reduce((sum, row) => sum + row["House Owner Payout"], 0),
      };

      worksheet.addRow({}); // blank row for spacing
      worksheet.addRow(totalRow);

      // Style total row (last row)
      const totalRowIndex = worksheet.lastRow.number;
      worksheet.getRow(totalRowIndex).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
      });

      // Header styling
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF000000" },
        };
        cell.font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      worksheet.autoFilter = { from: "A1", to: "AF1" };
      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Orders_Report_${eventName}_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
    } catch (error) {
      console.error("Excel download failed:", error);
      alert("Something went wrong while downloading the Excel file.");
    } finally {
      setExcelLoading(false); // stop loading
    }
  };

  // Filtered data based on the selected event
  const filteredSalesDetails =
    selectedEvent == "all"
      ? salesData.salesDetails
      : salesData.salesDetails.filter(
        (detail) => detail.eventId == selectedEvent
      );

  return (
    <>
      <Seo title={"Sales Summary"} />
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
                              <option key={event.id} value={event.id}>
                                {event.Name}
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
                                <th>Start Dates</th>
                                <th>Total</th>
                                <th>Tickets (Qty)</th>
                                <th>Addons (Qty)</th>
                                <th>Staff Tickets</th>
                                {/* <th>Attendees</th> */}
                                <th>Transfer</th>
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
                                        href={`/admin/finance/sale-by-ticket-type/${detail.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.Name}
                                      </Link>

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
                                      }
                                    </div>

                                    <div style={{ marginTop: "5px" }}>
                                      <Link
                                        // href={`/admin/finance/sales-by-months/${detail.id}`}
                                        href={`/admin/finance/sales/${detail.id}`}
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
                                  < td >
                                    <Moment format="DD-MMMM-YYYY" utc>
                                      {detail.StartDate}
                                    </Moment>
                                  </td>
                                  {/* Total Ticket (ticket+addon) */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Tickets:</b>{" "}
                                      {detail.totalTicketSold +
                                        detail.totalFreeStaffTicket}
                                    </div>
                                    <div className="bold-text">
                                      <b>Orders:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/orders/orders-list/${encodeURIComponent(
                                            detail.Name
                                          )}`,
                                          query: { eventId: detail.id },
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.totalOrdersCount}
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
                                            detail.Name
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
                                        {detail.totalTicketSold}
                                      </Link>
                                    </div>
                                    <div className="bold-text">
                                      <b>Scanned:</b>{" "}
                                      {detail.totalScannedTicketCount}
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
                                        {detail.totalAddonSold}
                                      </Link>
                                    </div>
                                    <div className="bold-text">
                                      <b>Scanned:</b>{" "}
                                      {detail.totalScannedAddonsCount}
                                    </div>
                                  </td>

                                  {/* Total Staff Ticket */}
                                  <td>
                                    <div className="bold-text">
                                      <b>Total:</b>{" "}
                                      <Link
                                        href={{
                                          pathname: `/admin/events/staff`,
                                          query: { id: detail.id },
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                        }}
                                      >
                                        {detail.totalFreeStaffTicket}
                                      </Link>
                                    </div>
                                    <div className="bold-text">
                                      <b>Scanned:</b>{" "}
                                      {detail.totalStaffTicketScanned}
                                    </div>
                                  </td>

                                  {/* Transfer  */}
                                  <td>
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
                                  </td>

                                  {/* Net Sales: Modify if you have any specific calculation for net */}
                                  <td style={{ textAlign: "right" }}>
                                    {detail.Currency
                                      ? `${detail.Currency.Currency_symbol}${(
                                        detail.totalAmountAndDiscounts
                                          .total_amount || 0
                                      ).toLocaleString()}`
                                      : "N/A"}
                                  </td>

                                  {/* totalTax */}
                                  <td style={{ textAlign: "right" }}>
                                    {detail.Currency
                                      ? `${detail.Currency.Currency_symbol}${(
                                        detail.totalAmountAndDiscounts
                                          .totalTax || 0
                                      ).toLocaleString()}`
                                      : "N/A"}
                                  </td>

                                  {/* Gross Sales: Checking if Currency exists */}
                                  <td style={{ textAlign: "right" }}>
                                    <Link
                                      href={{
                                        pathname: `/admin/orders/orders-list/${encodeURIComponent(
                                          detail.Name
                                        )}`,
                                        query: { eventId: detail.id },
                                      }}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        textDecoration: "underline",
                                        color: "blue",
                                      }}
                                    >
                                      {detail.Currency
                                        ? `${detail.Currency.Currency_symbol
                                        }${detail.totalAmountAndDiscounts.gross_total.toLocaleString()}`
                                        : "N/A"}
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </>
                    )}
                  </Tab>
                  {/* <Tab eventKey="export" title="Export">
                  <div className="mt-4">
                    <h5>Export Options</h5>
                    <p>
                      You can implement export functionality here, such as
                      exporting to CSV or Excel.
                    </p>
                  </div>
                </Tab> */}
                </Tabs>
              </Card.Body>
            </Card>
          </div>
        </Col >
      </Row >
    </>
  );
};

Dashboard.layout = "Contentlayout";

export default Dashboard;
