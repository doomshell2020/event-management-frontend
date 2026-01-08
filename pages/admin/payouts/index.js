import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Spinner,
  Badge,
  Form,
  Button
} from "react-bootstrap";
import Seo from "@/shared/layout-components/seo/seo";
import api from "@/utils/api";
import Link from "next/link";

const EventsSalesList = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  /* Filters */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  /* FETCH */
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        "/api/v1/admin/payouts/events/sales-summary"
      );
      setEvents(data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* FILTER DATA */
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchSearch = ev.event_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus = status
        ? status === "pending"
          ? ev.balance > 0
          : ev.balance === 0
        : true;

      return matchSearch && matchStatus;
    });
  }, [events, search, status]);

  /* SUMMARY */
  const totals = useMemo(() => {
    return filteredEvents.reduce(
      (acc, e) => {
        acc.sales += Number(e.total_sales || 0);
        acc.paid += Number(e.total_paid || 0);
        acc.balance += Number(e.balance || 0);
        return acc;
      },
      { sales: 0, paid: 0, balance: 0 }
    );
  }, [filteredEvents]);

  return (
    <div>
      <Seo title="Events Sales Summary" />

      <Row className="mt-1">
        {/* FILTER PANEL */}
        <Col xl={2}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0 fw-semibold">Filters</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted">
                  Search Event
                </Form.Label>
                <Form.Control
                  placeholder="Search by event name"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-muted">Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>

              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
              >
                Reset Filters
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* MAIN CONTENT */}
        <Col xl={10}>
          {/* SUMMARY CARDS */}
          <Row className="mb-1">
            <Col md={4}>
              <Card className="text-center shadow-sm border-0">
                <Card.Body>
                  <small className="text-muted text-uppercase">
                    Total Sales
                  </small>
                  <h3 className="fw-bold mt-2">
                    ₹{totals.sales}
                  </h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="text-center shadow-sm border-success border-2">
                <Card.Body>
                  <small className="text-muted text-uppercase">
                    Total Paid
                  </small>
                  <h3 className="fw-bold text-success mt-2">
                    ₹{totals.paid}
                  </h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="text-center shadow-sm border-danger border-2">
                <Card.Body>
                  <small className="text-muted text-uppercase">
                    Balance
                  </small>
                  <h3 className="fw-bold text-danger mt-2">
                    ₹{totals.balance}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* EVENTS TABLE */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h4 className="card-title mb-0 fw-semibold">
                Events Sales Summary
              </h4>
            </Card.Header>

            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center p-5">
                  <Spinner />
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Event</th>
                      <th>Orders</th>
                      <th>Tickets</th>
                      <th>Sales</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEvents.length == 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-4 text-muted"
                        >
                          No events found
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((ev, index) => (
                        <tr key={ev.event_id}>
                          <td>{index + 1}</td>

                          <td>
                            <Link
                              href={`/admin/payouts/${ev.event_id}`}
                              target="_blank"
                              className="fw-semibold text-decoration-none d-block"
                            >
                              {ev.event_name}
                            </Link>
                            <small className="text-muted">
                              {ev.organizer_name}
                            </small>
                          </td>

                          <td>{ev.total_orders}</td>
                          <td>{ev.total_tickets}</td>

                          <td>
                            {ev.currency_symbol}{ev.total_sales}
                          </td>

                          <td className="text-success">
                            {ev.currency_symbol}{ev.total_paid}
                          </td>

                          <td className="text-danger">
                            {ev.currency_symbol}{ev.balance}
                          </td>

                          <td>
                            <Badge
                              bg={
                                ev.balance > 0
                                  ? "warning"
                                  : "success"
                              }
                              className="px-3 py-2"
                            >
                              {ev.balance > 0
                                ? "Pending"
                                : "Completed"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

EventsSalesList.layout = "Contentlayout";
export default EventsSalesList;
