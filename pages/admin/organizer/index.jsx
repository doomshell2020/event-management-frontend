import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import ClipLoader from "react-spinners/ClipLoader";
import Link from "next/link";
import Moment from "react-moment";
import axios from "axios";
import { useRouter } from "next/router";

export const COLUMNS = [
  {
    Header: "S.No",
    accessor: (row, index) => index + 1,
    className: "borderrigth",
  },
  {
    Header: "Organisation Details",
    accessor: "organisation_name",
    className: "borderrigth",
    Cell: ({ row }) => {
      const data = row.original;
      return (
        <div style={{ lineHeight: "1.6" }}>
          <strong>Organisation:</strong> {data.organisation_name || "—"} <br />
          <strong>Contact Person:</strong> {data.contact_person || "—"} <br />
          <strong>Email:</strong> {data.contact_email || "—"} <br />
          <strong>Phone:</strong> {data.phone || "—"} <br />
          <strong>Website:</strong>{" "}
          {data.website ? (
            <a
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.website}
            </a>
          ) : (
            "—"
          )}
        </div>
      );
    },
  },
  {
    Header: "Subscription Details",
    accessor: "subscriptions",
    className: "borderrigth",
    Cell: ({ row }) => {
      const subscription = row.original.subscriptions?.[0] || {};
      const [copied, setCopied] = React.useState(false);

      const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <div style={{ lineHeight: "1.6" }}>
          {/* API Key */}
          <strong>API Key:</strong>{" "}
          {subscription.key_hash ? (
            <span className="d-flex align-items-center gap-2">
              <span style={{ fontFamily: "monospace" }}>
                {subscription.key_hash}
              </span>
              <button
                onClick={() => handleCopy(subscription.key_hash)}
                style={{
                  border: "none",
                  background: "none",
                  color: "green",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                📋 {copied ? "Copied!" : "Copy"}
              </button>
            </span>
          ) : (
            "—"
          )}
          <br />

          {/* Allowed Domains */}
          <strong>Allowed Domains:</strong>{" "}
          {subscription.allowed_domains || "—"}
          <br />

          {/* Purchase Date */}
          <strong>Purchase Date:</strong>{" "}
          {subscription.created_at ? (
            <Moment format="DD-MMM-YYYY">{subscription.created_at}</Moment>
          ) : (
            "—"
          )}
          <br />

          {/* Subscription Start Date */}
          <strong>Subscription Start Date:</strong>{" "}
          {subscription.start_date ? (
            <Moment format="DD-MMM-YYYY">{subscription.start_date}</Moment>
          ) : (
            "—"
          )}
          <br />

          {/* Subscription End Date */}
          <strong>Subscription End Date:</strong>{" "}
          {subscription.end_date ? (
            <Moment format="DD-MMM-YYYY">{subscription.end_date}</Moment>
          ) : (
            "—"
          )}
          <br />

          {/* Subscription End Date */}
          <strong>Last Used:</strong>{" "}
          {subscription.last_used ? (
            <Moment format="DD-MMM-YYYY hh:mm:ss A z">{subscription.last_used}</Moment>
          ) : (
            "—"
          )}

        </div>
      );
    },
  },
  {
    Header: "Status",
    accessor: "status",
    className: "borderrigth",
  },
];


const EventOrganisersList = () => {
  const [DATA_TABLE, setDataTable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useRouter();

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
    getTableProps,
    headerGroups,
    getTableBodyProps,
    prepareRow,
    state,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
  } = tableInstance;

  const { pageIndex } = state;

  const fetchOrganisers = async () => {
    try {
      const { data } = await axios.get("/api/v1/organizers/list");
      if (data.success) {
        setDataTable(data.data);
      }
    } catch (error) {
      console.error("Error fetching organisers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row) => {
    navigate.push(`/admin/organizer/add?id=${row.original.id}`);
  };

  const handleRenew = async (row) => {
    if (!confirm("Renew this subscription without changing API key?")) return;
    try {
      const { data } = await axios.post("/api/v1/subscriptions/renew", {
        subscription_id: row.original.subscription_id
      });
      if (data.success) {
        alert("Subscription renewed successfully!");
        fetchOrganisers();
      }
    } catch (error) {
      console.error("Error renewing subscription:", error);
      alert("Failed to renew subscription");
    }
  };

  useEffect(() => {
    setPageSize(10);
    fetchOrganisers();
  }, []);

  return (
    <>
      <Seo title={"Event Organisers"} />
      <Row className="row-sm mt-4">
        <Col xl={12}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Event Organizer</h4>
                <div className="d-flex gap-2">
                  <Link
                    className="btn ripple btn-info btn-sm"
                    href={"/admin/organizer/add"}
                  >
                    Add New Organizer
                  </Link>
                  <Link
                    className="btn ripple btn-info btn-sm"
                    href={"/admin/organizer/api-documentation"}
                  >
                    API Docs
                  </Link>
                </div>
              </div>
            </Card.Header>

            <Card.Body>
              <table {...getTableProps()} className="table table-hover mb-0">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr key={Math.random()} {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          key={Math.random()}
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className={column.className}
                        >
                          {column.render("Header")}
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <i className="fa fa-angle-down"></i>
                            ) : (
                              <i className="fa fa-angle-up"></i>
                            )
                          ) : null}
                        </th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  ))}
                </thead>

                {isLoading ? (
                  <tbody>
                    <tr>
                      <td colSpan={COLUMNS.length + 1} style={{ textAlign: "center" }}>
                        <ClipLoader color="#36d7b7" loading={isLoading} />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody {...getTableBodyProps()}>
                    {page.map((row) => {
                      prepareRow(row);
                      return (
                        <tr key={Math.random()} {...row.getRowProps()}>
                          {row.cells.map((cell) => (
                            <td key={Math.random()} {...cell.getCellProps()}>
                              {cell.render("Cell")}
                            </td>
                          ))}
                          <td className="gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              className="gap-2"
                              onClick={() => handleEdit(row)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleRenew(row)}
                            >
                              Renew
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </table>

              <div className="d-flex justify-content-between mt-3">
                <span>
                  Page {pageIndex + 1} of {pageOptions.length}
                </span>
                <div>
                  <Button
                    className="me-2"
                    onClick={() => gotoPage(0)}
                    disabled={!canPreviousPage}
                  >
                    First
                  </Button>
                  <Button
                    className="me-2"
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                  >
                    Prev
                  </Button>
                  <Button
                    className="me-2"
                    onClick={() => nextPage()}
                    disabled={!canNextPage}
                  >
                    Next
                  </Button>
                  <Button
                    onClick={() => gotoPage(pageCount - 1)}
                    disabled={!canNextPage}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </Card.Body>

          </Card>
        </Col>
      </Row>
    </>
  );
};

EventOrganisersList.layout = "Contentlayout";
export default EventOrganisersList;
