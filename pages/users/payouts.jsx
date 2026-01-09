import React, { useEffect, useState, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import { formatEventDateTime } from "@/utils/formatDate";

const MyPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalSales, setTotalSales] = useState({}); // ✅ NEW
  const [loading, setLoading] = useState(false);

  /* Filter */
  const [eventId, setEventId] = useState("");

  const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

  /* ================= FETCH PAYOUTS ================= */
  const fetchPayoutsList = async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/payouts/list", { params });

      setPayouts(res.data.data.payouts || []);
      setEvents(res.data.data.events || []);
      setTotalSales(res.data.data.totalSales || {}); // ✅ STORE TOTAL SALES
    } catch (err) {
      Swal.fire("Error", "Failed to load payouts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutsList();
  }, []);

  /* ================= APPLY FILTER ================= */
  const applyFilter = (e) => {
    e.preventDefault();
    const params = {};

    if (eventId) {
      params.event_id = eventId;
    }

    fetchPayoutsList(params);
  };

  /* ================= TOTAL SALE CALCULATION ================= */
  const totalSaleAmount = useMemo(() => {
    // If specific event selected
    if (eventId) {
      return Number(totalSales[eventId] || 0);
    }

    // All events → sum everything
    return Object.values(totalSales).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );
  }, [eventId, totalSales]);

  const currency =
    payouts[0]?.event?.currencyName?.Currency_symbol || "₹";

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section className="my-staff-module py-4">
        <div className="section-heading">
          <h1 className="mb-3">My Payouts</h1>
          {/* <h2 className="mt-4">My Payouts</h2> */}
          <p className="mb-4 body-text text-center">
            View payments received for your events
          </p>
        </div>

        <div className="container">
          {/* ================= FILTER ================= */}
          <Form
            className="d-flex justify-content-end mb-3"
            onSubmit={applyFilter}
          >
            <Form.Select
              style={{ maxWidth: "300px" }}
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </Form.Select>

            <Button type="submit" className="ms-2" size="sm">
              Apply
            </Button>
          </Form>

          {/* ================= TOTAL SALE SUMMARY ================= */}
          <div className="mb-3 text-end">
            <strong>Total Sales: </strong>
            <span className="text-success">
              {currency}
              {totalSaleAmount.toLocaleString()}
            </span>
          </div>

          {/* ================= TABLE ================= */}
          <div className="table-responsive my-staff-table">
            <table className="table">
              <thead className="table-dark">
                <tr>
                  <th>S.No</th>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Paid Amount</th>
                  <th>Txn Ref</th>
                  <th>Remarks</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : payouts.length ? (
                  payouts.map((row, i) => {
                    const currency =
                      row.event?.currencyName?.Currency_symbol || "₹";
                    const organizer = row.event?.Organizer;

                    return (
                      <tr key={row.id}>
                        <td>{i + 1}</td>
                        <td>{row.event?.name || "-"}</td>
                        <td>
                          {organizer
                            ? `${organizer.first_name} ${organizer.last_name}`
                            : "-"}
                        </td>
                        <td>
                          {currency}
                          {row.paid_amount}
                        </td>
                        <td>{row.txn_ref}</td>
                        <td>{row.remarks || "-"}</td>
                        <td>{formatEventDateTime(row.createdAt)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No payouts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FrontendFooter />
    </>
  );
};

export default MyPayouts;
