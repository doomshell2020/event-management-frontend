import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs";
import api from "@/utils/api";
import Swal from "sweetalert2";

const TicketDetails = ({ pendingRequests, counts }) => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("ticket");
  const [ticketData, setTicketData] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Added states (NO UI change)
  const [email, setEmail] = useState("");
  const [ticketQty, setTicketQty] = useState({});

  /* ---------------- TAB CHANGE ---------------- */
  const setMyActiveTab = (tab) => {
    setActiveTab(tab);
    router.push(`/committee/${tab}`);
  };

  /* ---------------- FETCH TICKET DETAILS ---------------- */
  useEffect(() => {
    if (!pendingRequests?.length) return;
    const eventId = pendingRequests[0]?.event_id;
    if (!eventId) return;
    fetchTicketDetails(eventId);
  }, [pendingRequests]);

  const fetchTicketDetails = async (event_id) => {
    try {
      setLoading(true);
      const res = await api.post(
        "/api/v1/committee/committee-ticket-details",
        { event_id }
      );

      if (res?.data?.success) {
        setTicketData(res.data.data.tickets || []);
        setEventInfo(res.data.data.event || null);
      }
    } catch {
      Swal.fire("Error", "Failed to load committee ticket details", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- TICKET PUSH SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!email) {
      Swal.fire("Error", "Please enter email address", "error");
      return;
    }

    const selectedTickets = Object.entries(ticketQty)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ ticket_id: id, qty }));

    if (!selectedTickets.length) {
      Swal.fire("Error", "Please select at least one ticket", "error");
      return;
    }

    try {
      await api.post("/api/v1/committee/push-ticket", {
        email,
        event_id: eventInfo.id,
        tickets: selectedTickets,
      });

      Swal.fire("Success", "Tickets sent successfully", "success");
      setEmail("");
      setTicketQty({});
    } catch {
      Swal.fire("Error", "Failed to send tickets", "error");
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <>
      <FrontendHeader backgroundImage="/assets/front-images/about-slider_bg.jpg" />

      <section className="mt-5 mb-5">
        <div className="container">
          <div className="section-heading">
            <h1>Committee</h1>
            <h2 className="mt-4">Committee Tickets</h2>
            <p className="mb-4 text-center">
              Manage assigned tickets and share with patrons.
            </p>
          </div>

          <div className="profil_deaile mx-auto">
            <TicketCountTabs
              active={activeTab}
              onChange={setMyActiveTab}
              counts={counts}
            />

            {/* EVENT INFO */}
            {eventInfo && (
              <div className="text-center my-3">
                <h4>{eventInfo.name}</h4>
                <p className="text-muted">
                  {eventInfo.location} • {eventInfo.companyInfo?.name}
                </p>
              </div>
            )}

            {/* ---------------- TICKET TABLE ---------------- */}
            <div className="card custom-card p-3 mb-4">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Available</th>
                      <th>Ticket</th>
                      <th className="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : ticketData.length ? (
                      ticketData.map((item) => {
                        const available = item.count - item.usedticket;
                        return (
                          <tr key={item.id}>
                            <td>
                              <span className="badge bg-light text-dark px-3 py-2">
                                {available}
                              </span>
                            </td>
                            <td className="fw-medium">
                              {item.ticket?.title}
                            </td>
                            <td className="text-end fw-semibold">
                              {eventInfo?.currencyName?.Currency_symbol}
                              {item.ticket?.price}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          No tickets assigned
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---------------- SHARE LINK (UNCHANGED) ---------------- */}
            <div className="card custom-card mb-4">
              <div className="card-body">
                <h5>Share Link</h5>
                <p className="text-muted">
                  Share this link with friends to request tickets.
                </p>
                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    readOnly
                    value={`${process.env.NEXT_PUBLIC_SITE_URL}event/${eventInfo?.id}/${eventInfo?.slug}`}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${process.env.NEXT_PUBLIC_SITE_URL}event/${eventInfo?.id}/${eventInfo?.slug}`
                      );
                      Swal.fire("Copied!", "", "success");
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------- TICKET PUSH (DESIGN SAME) ---------------- */}
            <div className="card custom-card">
              <div className="card-body">
                <h5>Ticket Push</h5>
                <p className="text-muted">
                  Send approved tickets directly to a user.
                </p>

                <div className="mb-3">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="row g-3 mb-4">
                  {ticketData.map((item) => {
                    const available = item.count - item.usedticket;
                    return (
                      <div className="col-md-6" key={item.id}>
                        <label className="form-label">
                          {item.ticket?.title}{" "}
                          <small className="text-muted">
                            ({available} available)
                          </small>
                        </label>
                        <select
                          className="form-select"
                          value={ticketQty[item.id] || 0}
                          onChange={(e) =>
                            setTicketQty({
                              ...ticketQty,
                              [item.id]: Number(e.target.value),
                            })
                          }
                        >
                          {Array.from({ length: available + 1 }, (_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                <button className="btn btn-success w-100" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FrontendFooter />
    </>
  );
};

export default TicketDetails;

/* ---------------- SSR ---------------- */
export async function getServerSideProps(context) {
  try {
    const token = context.req.cookies?.userAuthToken;

    if (!token) {
      return {
        redirect: { destination: "/login", permanent: false },
      };
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/committee/requests/N`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const json = await res.json();
    const list = json?.data?.list || [];

    const counts = { pending: 0, approved: 0, ignored: 0 };
    list.forEach((i) => {
      if (i.status === "N") counts.pending++;
      if (i.status === "Y") counts.approved++;
      if (i.status === "I") counts.ignored++;
    });

    return {
      props: { pendingRequests: list, counts },
    };
  } catch {
    return {
      props: {
        pendingRequests: [],
        counts: { pending: 0, approved: 0, ignored: 0 },
      },
    };
  }
}