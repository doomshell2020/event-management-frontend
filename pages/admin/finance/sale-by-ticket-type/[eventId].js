import React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

import { Button, Card, Row, Col, Breadcrumb } from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import api from "@/utils/api";
import ClipLoader from "react-spinners/ClipLoader";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";

const SaleByTicketType = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { eventId } = router.query; // Retrieve the event ID from the URL
  const [eventData, setEventData] = useState();
  console.log("eventData", eventData)
  const [excelLoading, setExcelLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      // Fetch ticket types using the eventId
      const fetchTicketTypes = async () => {
        try {
          setIsLoading(true);
          const response = await api.get(`/api/v1/admin/finance/sales-ticket-types/${eventId}`);
          //  console.log("response.data.data",response.data.data)
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

  const [DATA_TABLE, setDataTable] = useState([]);

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "TICKET TYPE",
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
        <span >FACE VALUE</span>
      ), // Align header text to the right
      accessor: "face",
      className: "wd-10p borderrigth text-left", // Right-align cell content
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


  const handleDownloadOrdersExcel = async (eventName) => {
    try {
      setExcelLoading(true);

      const currency = eventData?.event?.currency_symbol || "";
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      /* ================= TITLE ================= */
      worksheet.mergeCells("A1:C1");
      worksheet.getCell("A1").value = `${eventName} - Sales Report`;
      worksheet.getCell("A1").font = { size: 14, bold: true };
      worksheet.getCell("A1").alignment = { horizontal: "center" };
      worksheet.addRow([]);

      /* ================= HEADER ================= */
      worksheet.addRow(["TYPE", "SOLD", "FACE VALUE"]).font = { bold: true };

      /* ================= TICKETS ================= */
      if (eventData?.ticketInfo?.tickets?.length > 0) {
        worksheet.addRow([
          "TOTAL TICKETS (All Tier)",
          `${eventData.ticketInfo.summary.tickets.total_sold} / ${eventData.ticketInfo.count_summary.tickets}`,
          `${currency}${Math.round(
            eventData.ticketInfo.summary.tickets.total_face_value
          ).toLocaleString()}`
        ]).font = { bold: true };

        eventData.ticketInfo.tickets.forEach(ticket => {
          worksheet.addRow([
            `${ticket.name} (${ticket.type})`,
            ticket.sold,
            `${currency}${Math.round(ticket.face_value).toLocaleString()}`
          ]);
        });

        worksheet.addRow([]);
      }

      /* ================= ADDONS ================= */
      if (eventData?.ticketInfo?.addons?.length > 0) {
        worksheet.addRow(["TOTAL ADDONS", "", ""]).font = { bold: true };

        worksheet.addRow([
          "Addons Summary",
          `${eventData.ticketInfo.summary.addons.total_sold} / ${eventData.ticketInfo.count_summary.addons}`,
          `${currency}${Math.round(
            eventData.ticketInfo.summary.addons.total_face_value
          ).toLocaleString()}`
        ]).font = { bold: true };

        eventData.ticketInfo.addons.forEach(addon => {
          worksheet.addRow([
            addon.name,
            addon.sold,
            `${currency}${Math.round(addon.face_value).toLocaleString()}`
          ]);
        });

        worksheet.addRow([]);
      }

      /* ================= PACKAGES ================= */
      if (eventData?.ticketInfo?.packages?.length > 0) {
        worksheet.addRow(["TOTAL PACKAGES", "", ""]).font = { bold: true };

        worksheet.addRow([
          "Packages Summary",
          `${eventData.ticketInfo.summary.packages.total_sold} / ${eventData.ticketInfo.count_summary.packages}`,
          `${currency}${Math.round(
            eventData.ticketInfo.summary.packages.total_face_value
          ).toLocaleString()}`
        ]).font = { bold: true };

        eventData.ticketInfo.packages.forEach(pkg => {
          worksheet.addRow([
            pkg.name,
            pkg.sold,
            `${currency}${Math.round(pkg.face_value).toLocaleString()}`
          ]);
        });

        worksheet.addRow([]);
      }

      /* ================= APPOINTMENTS ================= */
      if (eventData?.ticketInfo?.appointments?.length > 0) {
        worksheet.addRow(["TOTAL APPOINTMENTS", "", ""]).font = { bold: true };

        worksheet.addRow([
          "Appointments Summary",
          `${eventData.ticketInfo.summary.appointments.total_sold} / ${eventData.ticketInfo.count_summary.appointments}`,
          `${currency}${Math.round(
            eventData.ticketInfo.summary.appointments.total_face_value
          ).toLocaleString()}`
        ]).font = { bold: true };

        eventData.ticketInfo.appointments.forEach(app => {
          worksheet.addRow([
            app.name,
            app.sold,
            `${currency}${Math.round(app.face_value).toLocaleString()}`
          ]);
        });

        worksheet.addRow([]);
      }

      /* ================= FINAL TOTALS ================= */
      worksheet.addRow([
        "TOTAL ORDERS",
        eventData?.totalOrdersCount || 0,
        `${currency}${Math.round(eventData?.priceInfo?.total_amount || 0).toLocaleString()}`
      ]).font = { bold: true };

      worksheet.addRow([
        "TAXES",
        "",
        `${currency}${Math.round(eventData?.priceInfo?.total_taxes || 0).toLocaleString()}`
      ]);

      worksheet.addRow([
        "GROSS SALES",
        "",
        `${currency}${Math.round(eventData?.priceInfo?.gross_total || 0).toLocaleString()}`
      ]).font = { bold: true };

      worksheet.addRow([
        "CANCEL AMOUNT",
        "",
        `${currency}${Math.round(eventData?.cancelAmount?.cancel_amount || 0).toLocaleString()}`
      ]);

      worksheet.addRow([
        "NET AMOUNT",
        "",
        `${currency}${Math.round(
          (eventData?.priceInfo?.gross_total || 0) -
          (eventData?.cancelAmount?.cancel_amount || 0)
        ).toLocaleString()}`
      ]).font = { bold: true };

      /* ================= STYLING ================= */
      worksheet.eachRow(row => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
      });

      worksheet.columns.forEach(col => {
        let max = 12;
        col.eachCell({ includeEmpty: true }, cell => {
          max = Math.max(max, cell.value ? cell.value.toString().length + 2 : 12);
        });
        col.width = max;
      });

      /* ================= DOWNLOAD ================= */
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `Sales_Report_${eventName}_${moment().format("YYYYMMDD_HHmmss")}.xlsx`
      );

    } catch (err) {
      console.error("Excel download failed:", err);
      alert("Something went wrong while downloading the Excel file.");
    } finally {
      setExcelLoading(false);
    }
  };








  return (
    <>
      <Seo title={"Sales By Ticket Type"} />
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Sales By Ticket Type
          </span>
        </div>

        <div className="justify-content-center mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Finance
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Sales By Ticket Type
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={12}>
            <div className="Mmbr-card">
              <Card>
                <Card.Header className="ps-3 pb-2 d-flex justify-content-between align-items-center">
                  <h4 className="card-title card-t mg-b-0">
                    {eventData?.event?.name || "No event name available"}
                  </h4>
                  <Button
                    variant="success"
                    className="btn-sm d-flex align-items-center"
                    onClick={() => handleDownloadOrdersExcel(eventData?.event?.name ?? 'Event Excel')}
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
                        Download
                      </>
                    )}
                  </Button>
                </Card.Header>

                <Card.Body className="p-2">
                  <div className="FinanceStaff-tbl">
                    <table
                      {...getTableProps()}
                      className="table table-bordered table-hover mb-0 text-md-nowrap"
                    >
                      <thead>
                        <tr>
                          {headerGroups.map((headerGroup) => (
                            <React.Fragment key={Math.random()}>
                              {headerGroup.headers.map((column) => (
                                <th
                                  key={Math.random()}
                                  {...column.getHeaderProps(
                                    column.getSortByToggleProps()
                                  )}
                                  className={column.className}
                                >
                                  <span className="tabletitle">
                                    {column.render("Header")}
                                  </span>
                                  <span>
                                    {column.isSorted ? (
                                      column.isSortedDesc ? (
                                        <i className="fa fa-angle-down"></i>
                                      ) : (
                                        <i className="fa fa-angle-up"></i>
                                      )
                                    ) : (
                                      ""
                                    )}
                                  </span>
                                </th>
                              ))}
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>

                      {isLoading ? (
                        <tbody>
                          <tr>
                            <td colSpan={10}>
                              <div
                                className="loader inner-loader"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <ClipLoader
                                  // color={color}
                                  loading={isLoading}
                                  color="#36d7b7"
                                  aria-label="Loading Spinner"
                                  data-testid="loader"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {/* Display loader if loading */}
                          {isLoading ? (
                            <tr>
                              <td colSpan={3}>
                                <div
                                  className="loader inner-loader"
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <ClipLoader
                                    loading={isLoading}
                                    color="#36d7b7"
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                  />
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <>
                              {/* Display tickets */}
                              {eventData?.ticketInfo.tickets?.length > 0 && (
                                <>
                                  {/* Total Tickets Row */}
                                  <tr>
                                    <td>
                                      <b>
                                        TOTAL{" "}
                                        {/* {eventData?.event?.Name
                                        ? eventData.event.Name
                                        : "No event name available"}{" "} */}
                                        TICKETS (All Tier)
                                      </b>
                                    </td>
                                    <td>
                                      <b>
                                        {/* Calculate total tickets sold and display single total ticket count */}
                                        {eventData?.ticketInfo?.summary?.tickets?.total_sold}
                                        {""} / {""}
                                        {eventData?.ticketInfo?.count_summary?.tickets}
                                      </b>
                                    </td>

                                    {/* Price  */}
                                    <td >
                                      <b>
                                        {/* Calculate total ticket price for all tickets sold */}
                                        {
                                          eventData?.event?.currency_symbol
                                        }
                                        {Math.round(
                                          eventData?.ticketInfo?.summary?.tickets?.total_face_value
                                        ).toLocaleString()}
                                      </b>
                                    </td>
                                  </tr>

                                  {/* List Each Ticket Tier Separately */}
                                  {eventData?.ticketInfo.tickets.map(
                                    (ticket, index) => (
                                      <tr key={index}>
                                        <td>
                                          {ticket.name &&
                                            ticket.name}{" "}({ticket.type &&
                                              ticket.type})
                                        </td>

                                        {/* Sold */}
                                        <td>
                                          <Link
                                            href={{
                                              pathname: `/admin/tickets/ticket/${eventData?.event?.id}/${ticket.id}`
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              textDecoration: "underline",
                                              color: "blue",
                                            }}
                                          >
                                            {ticket.sold}
                                          </Link>
                                        </td>

                                        {/* Face amount */}
                                        <td >
                                          {ticket.face_value &&
                                            `${eventData?.event?.currency_symbol
                                            }${Math.round(
                                              ticket.face_value
                                            ).toLocaleString()}`}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </>
                              )}

                              {/* Display addons */}
                              {eventData?.ticketInfo.addons?.length > 0 && (
                                <>
                                  {/* Total Addons Row */}
                                  <tr>
                                    <td>
                                      <b>TOTAL ADD ON TICKET</b>
                                    </td>
                                    <td>
                                      {/* Calculate total addons sold and display single total addon count */}
                                      <b>
                                        {eventData?.ticketInfo?.summary?.addons?.total_sold}
                                        {""} / {""}
                                        {eventData?.ticketInfo?.count_summary?.addons}
                                      </b>
                                    </td>
                                    <td >
                                      {/* Calculate total addon price for all addons sold */}
                                      <b>
                                        {
                                          eventData?.event?.currency_symbol
                                        }
                                        {Math.round(
                                          eventData?.ticketInfo?.summary?.addons?.total_face_value
                                        ).toLocaleString()}
                                      </b>
                                    </td>
                                  </tr>

                                  {/* List Each Addon Separately */}
                                  {eventData.ticketInfo.addons.map(
                                    (addon, index) => (
                                      <tr key={index}>
                                        <td>{addon.name}</td>

                                        <td>
                                          <Link
                                            href={{
                                              pathname: `/admin/tickets/addon/${eventData?.event?.id}/${addon.id}`
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              textDecoration: "underline",
                                              color: "blue",
                                            }}
                                          >
                                            {addon.sold}
                                          </Link>
                                        </td>

                                        <td >
                                          {eventData?.event?.currency_symbol}
                                          {Math.round(
                                            addon.face_value
                                          ).toLocaleString()}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </>
                              )}

                              {/* Display packages */}
                              {eventData?.ticketInfo.packages?.length > 0 && (
                                <>
                                  {/* Total Addons Row */}
                                  <tr>
                                    <td>
                                      <b>TOTAL PACKAGES  TICKET</b>
                                    </td>
                                    <td>
                                      {/* Calculate total addons sold and display single total addon count */}
                                      <b>
                                        {eventData?.ticketInfo?.summary?.packages?.total_sold}
                                        {""} / {""}{eventData?.ticketInfo?.count_summary?.packages}
                                      </b>
                                    </td>
                                    <td >
                                      {/* Calculate total addon price for all addons sold */}
                                      <b>
                                        {
                                          eventData?.event?.currency_symbol
                                        }
                                        {Math.round(
                                          eventData?.ticketInfo?.summary?.packages?.total_face_value
                                        ).toLocaleString()}
                                      </b>
                                    </td>
                                  </tr>

                                  {/* List Each Addon Separately */}
                                  {eventData.ticketInfo.packages.map(
                                    (addon, index) => (
                                      <tr key={index}>
                                        <td>{addon.name}</td>

                                        <td>
                                          <Link
                                            href={{
                                              pathname: `/admin/tickets/package/${eventData?.event?.id}/${addon.id}`
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              textDecoration: "underline",
                                              color: "blue",
                                            }}
                                          >
                                            {addon.sold}
                                          </Link>
                                        </td>

                                        <td >
                                          {eventData?.event?.currency_symbol}
                                          {Math.round(
                                            addon.face_value
                                          ).toLocaleString()}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </>
                              )}

                              {/* Display appointments */}
                              {eventData?.ticketInfo.appointments?.length > 0 && (
                                <>
                                  {/* Total Addons Row */}
                                  <tr>
                                    <td>
                                      <b>TOTAL APPOINTMENTS</b>
                                    </td>
                                    <td>
                                      {/* Calculate total addons sold and display single total addon count */}
                                      <b>
                                        {eventData?.ticketInfo?.summary?.appointments?.total_sold}
                                        {""} / {""}
                                        {eventData?.ticketInfo?.count_summary?.appointments}
                                      </b>
                                    </td>
                                    <td >
                                      {/* Calculate total addon price for all addons sold */}
                                      <b>
                                        {
                                          eventData?.event?.currency_symbol
                                        }
                                        {Math.round(
                                          eventData?.ticketInfo?.summary?.appointments?.total_face_value
                                        ).toLocaleString()}
                                      </b>
                                    </td>
                                  </tr>

                                  {/* List Each Addon Separately */}
                                  {eventData.ticketInfo.appointments.map(
                                    (addon, index) => (
                                      <tr key={index}>
                                        <td>{addon.name}</td>

                                        <td>
                                          <Link
                                            href={{
                                              pathname: `/admin/tickets/appointment/${eventData?.event?.id}/${addon.id}`
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              textDecoration: "underline",
                                              color: "blue",
                                            }}
                                          >
                                            {addon.sold}
                                          </Link>
                                        </td>

                                        <td >
                                          {eventData?.event?.currency_symbol}
                                          {Math.round(
                                            addon.face_value
                                          ).toLocaleString()}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </>
                              )}

                            </>
                          )}
                        </tbody>
                      )}
                      <tfoot>
                        {/* Display final total */}
                        <tr>
                          <td>
                            <b>TOTAL ORDERS</b>
                          </td>
                          <td>
                            <Link
                              href={{
                                pathname: `/admin/orders/${eventData?.event?.id}`,

                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                textDecoration: "underline",
                                color: "blue",
                              }}
                            >
                              <b>{eventData?.totalOrdersCount}</b>
                            </Link>
                          </td>
                          {/* Total Orders */}
                          <td >
                            <b>
                              {eventData?.event?.currency_symbol}
                              {Math.round(
                                eventData?.priceInfo?.total_amount
                              ).toLocaleString()}
                            </b>
                          </td>
                        </tr>

                        {/* Display final Taxes */}
                        <tr>
                          <td>
                            <b>TAXES</b>
                          </td>
                          <td></td>
                          <td >
                            <b>
                              {eventData?.event?.currency_symbol}
                              {Math.round(
                                eventData?.priceInfo.total_taxes
                              ).toLocaleString()}
                            </b>
                          </td>
                        </tr>

                        {/* Display final Taxes */}
                        <tr>
                          <td>
                            <b>GROSS SALES</b>
                          </td>
                          <td></td>
                          <td >
                            <b>
                              {eventData?.event?.currency_symbol}
                              {Math.round(
                                eventData?.priceInfo.gross_total
                              ).toLocaleString()}
                            </b>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

SaleByTicketType.layout = "Contentlayout";

export default SaleByTicketType;
