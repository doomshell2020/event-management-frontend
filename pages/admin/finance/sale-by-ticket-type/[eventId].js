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

import ClipLoader from "react-spinners/ClipLoader";

const SaleByTicketType = () => {
  // const [DATA_TABLE, SetDATA_TABLE] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { eventId } = router.query; // Retrieve the event ID from the URL
  const [eventData, setEventData] = useState();

  useEffect(() => {
    if (eventId) {
      // Fetch ticket types using the eventId
      const fetchTicketTypes = async () => {
        try {
          setIsLoading(true);
          const response = await fetch("/api/v1/dashboard/", {
            method: "POST", // Use POST method
            headers: {
              "Content-Type": "application/json", // Specify JSON content type
            },
            body: JSON.stringify({
              key: "sale_ticket_reports",
              eventId: eventId,
            }),
          });

          const { data } = await response.json();
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
                <Card.Header className=" ps-3 pb-2">
                  <h4 className="card-title card-t mg-b-0">
                    {eventData?.event?.Name
                      ? eventData.event.Name
                      : "No event name available"}
                  </h4>
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
                                        {
                                          eventData?.ticketInfo
                                            .ticket_price_info
                                            .total_ticket_counts
                                        }
                                        {""} / {""}
                                        {
                                          eventData?.ticketInfo
                                            .ticket_price_info
                                            ?.total_ticket_limit
                                        }
                                      </b>
                                    </td>

                                    {/* Price  */}
                                    <td >
                                      <b>
                                        {/* Calculate total ticket price for all tickets sold */}
                                        {
                                          eventData?.event?.Currency
                                            .Currency_symbol
                                        }
                                        {Math.round(
                                          eventData?.ticketInfo
                                            .ticket_price_info.total_amount
                                        ).toLocaleString()}
                                      </b>
                                    </td>
                                  </tr>

                                  {/* List Each Ticket Tier Separately */}
                                  {eventData?.ticketInfo.tickets.map(
                                    (ticket, index) => (
                                      <tr key={index}>
                                        <td>
                                          {ticket.ticket_name &&
                                            ticket.ticket_name}
                                        </td>

                                        {/* Sold */}
                                        <td>
                                          <Link
                                            href={{
                                              pathname: `/admin/orders/order-details/${encodeURIComponent(
                                                eventData?.event?.Name || ""
                                              )}`,
                                              query: {
                                                type: "ticket",
                                                ...(ticket.discountAmount === 0
                                                  ? {
                                                      ticketId:
                                                        ticket.event_ticket_id,
                                                    }
                                                  : {
                                                      discountAmount:
                                                        ticket.discountAmount,
                                                    }),
                                              },
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              textDecoration: "underline",
                                              color: "blue",
                                            }}
                                          >
                                            {ticket.total_sale}
                                          </Link>
                                        </td>

                                        {/* Face amount */}
                                        <td >
                                          {ticket.total_amount &&
                                            `${
                                              eventData?.event?.Currency
                                                .Currency_symbol
                                            }${Math.round(
                                              ticket.total_amount
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
                                        {
                                          eventData?.ticketInfo.addon_price_info
                                            .total_ticket_counts
                                        }
                                        {""} / {""}
                                        {
                                          eventData?.ticketInfo.addon_price_info
                                            .total_addon_limit
                                        }
                                      </b>
                                    </td>
                                    <td >
                                      {/* Calculate total addon price for all addons sold */}
                                      <b>
                                        {
                                          eventData?.event?.Currency
                                            .Currency_symbol
                                        }
                                        {Math.round(
                                          eventData?.ticketInfo.addon_price_info
                                            .total_amount
                                        ).toLocaleString()}
                                      </b>
                                    </td>
                                  </tr>

                                  {/* List Each Addon Separately */}
                                  {eventData.ticketInfo.addons.map(
                                    (addon, index) => (
                                      <tr key={index}>
                                        <td>{addon.ticket_name}</td>

                                        <td>
                                          <Link
                                            href={{
                                              pathname: `/admin/orders/order-details/${encodeURIComponent(
                                                eventData?.event?.Name || ""
                                              )}`,
                                              query: {
                                                type: "addon",
                                                ...(addon.discountAmount === 0
                                                  ? {
                                                      ticketId: addon.id,
                                                    }
                                                  : {
                                                      discountAmount:
                                                        addon.discountAmount,
                                                    }),
                                              },
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              textDecoration: "underline",
                                              color: "blue",
                                            }}
                                          >
                                            {addon.total_sale}
                                          </Link>
                                        </td>

                                        <td >
                                          {
                                            eventData?.event?.Currency
                                              .Currency_symbol
                                          }
                                          {Math.round(
                                            addon.total_amount
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
                                pathname: `/admin/orders/orders-list/${encodeURIComponent(
                                  eventData?.event?.Name || ""
                                )}`,
                                query: { eventId: eventData?.event?.id },
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
                              {eventData?.event?.Currency.Currency_symbol}
                              {Math.round(
                                eventData?.ticketInfo.ticket_price_info
                                  .total_amount +
                                  eventData?.ticketInfo.addon_price_info
                                    .total_amount
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
                              {eventData?.event?.Currency.Currency_symbol}
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
                              {eventData?.event?.Currency.Currency_symbol}
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
