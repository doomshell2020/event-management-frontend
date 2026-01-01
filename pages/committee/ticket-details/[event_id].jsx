import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs";
import api from "@/utils/api";
import Swal from "sweetalert2";

const TicketDetails = ({ pendingRequests, counts, event_id }) => {
  
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("ticket");
  const [ticketData, setTicketData] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticketQty, setTicketQty] = useState({});

  /* ---------------- TAB CHANGE ---------------- */
  const setMyActiveTab = (tab) => {
    // console.log('tab :', tab);
    setActiveTab(tab);
    router.push(`/committee/${tab}`);
  };

  /* ---------------- FETCH TICKET DETAILS ---------------- */
  useEffect(() => {
    if (!event_id) return;
    fetchTicketDetails(event_id);
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

  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [email, setEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchText || searchText.length < 2 || selectedUser) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const res = await api.get(`/api/v1/users/search?q=${searchText}`);
        if (res.data.success) {
          setSearchResults(res.data.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, selectedUser]);

  /* ---------------- TICKET PUSH SUBMIT ---------------- */
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const handleSubmit = async () => {
    if (!email) {
      Swal.fire("Error", "Please select a user", "error");
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
      setLoadingSubmit(true); // ✅ Start loading

      await api.post("/api/v1/committee/push-ticket", {
        email,
        event_id: eventInfo.id,
        tickets: selectedTickets,
      });

      Swal.fire("Success", "Tickets sent successfully", "success");

      // Reset form
      setEmail("");
      setSearchText("");
      setSelectedUser(null);
      setTicketQty({});
      fetchTicketDetails(eventInfo.id);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to send tickets";

      Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoadingSubmit(false); // ✅ End loading
    }
  };


  /* ---------------- RENDER ---------------- */
  return (
    <>
      <FrontendHeader backgroundImage="/assets/front-images/about-slider_bg.jpg" />
      <section id="profile" className="mt-5 mb-5">

        <div className="container">
          <div className="section-heading">
            <h1>Committee</h1>
            <h2 className="mt-4">Committee</h2>
            <p className="mb-4 body-text text-center">
              If you belong to any committees for events on eboxtickets, you can manage ticket requests here.
            </p>
          </div>

          <div className="profil_deaile mx-auto">

            {/* 🔥 SAME TABS */}
            <TicketCountTabs
              active={activeTab}
              onChange={setMyActiveTab}
              counts={counts}
            />

            <div className="committee-event-detailpg">

              {eventInfo && (
                <div className="text-center my-4">
                  <h3 className="fw-bold mb-1">
                    {eventInfo.name}
                  </h3>
                  <p className="text-muted mb-0">
                    {eventInfo.location} • {eventInfo.companyInfo?.name}
                  </p>
                </div>
              )}

              <div className="my-3">

                {/* ---------------- TICKET TABLE ---------------- */}
                <div className="card custom-card p-3">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-3 py-2">Count</th>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2 text-end">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticketData.length > 0 ? (
                          ticketData.map((item) => {
                            const available = item.count - item.usedticket;

                            return (
                              <tr key={item.id}>
                                <td className="px-3">
                                  <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                                    {available}
                                  </span>
                                </td>
                                <td className="px-3 fw-medium">
                                  {item.ticket?.title}
                                </td>
                                <td className="px-3 text-end fw-semibold">
                                  {eventInfo?.currencyName?.Currency_symbol}
                                  {item.ticket?.price}{" "}
                                  <small className="text-muted">
                                    {eventInfo?.currencyName?.Currency}
                                  </small>
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

                <div className="row justify-content-center">
                  <div className="col-lg-12">

                    {/* ---------------- SHARE LINK CARD (UNCHANGED DESIGN) ---------------- */}
                    <div className="card custom-card mb-4">
                      <div className="card-body">
                        <div className="d-flex align-items-start gap-3 mb-3">
                          <div className="icon-badge orange">
                            <i className="bi bi-link-45deg"></i>
                          </div>
                          <div>
                            <h5 className="mb-0">Share Link</h5>
                            <span className="text-muted d-block">
                              Quick access for your friends
                            </span>
                          </div>
                        </div>

                        <p className="text-muted mb-3">
                          This link will have you as the committee member pre-selected so
                          your friends can request tickets faster!
                        </p>

                        <div className="d-flex gap-2">
                          <input
                            type="text"
                            className="form-control custom-input"
                            readOnly
                            value={`${process.env.NEXT_PUBLIC_SITE_URL}event/${eventInfo?.id}/${eventInfo?.slug}`}
                          />
                          <button
                            type="button"
                            className="btn btn-copy px-4"
                            onClick={() => {
                              Swal.fire({
                                icon: "success",
                                title: "Link Ready",
                                text: "Copy the link from the input field and share it with your friends.",
                                timer: 2500,
                                showConfirmButton: false
                              });
                            }}
                          >
                            Copy Link
                          </button>

                        </div>
                      </div>
                    </div>

                    {/* ---------------- TICKET PUSH CARD (UNCHANGED DESIGN) ---------------- */}
                    <div className="card custom-card">
                      <div className="card-body">
                        <div className="d-flex align-items-start gap-3 mb-3">
                          <div className="icon-badge purple">
                            <i className="bi bi-link-45deg"></i>
                          </div>
                          <div>
                            <h5 className="mb-0">Ticket Push</h5>
                            <span className="text-muted d-block">
                              Send tickets directly to patrons
                            </span>
                          </div>
                        </div>

                        <div className="custom-note rounded-xl p-3 mb-4 border">
                          <strong>Note:</strong> This tool allows you to push approvals
                          to a patron's cart using their eboxtickets email address.
                          If the ticket is free, it will go straight to “My Orders”.
                          This action cannot be undone.
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-dark">Email Address</label>
                          <input
                            type="email"
                            className="form-control custom-input"
                            placeholder="patron@example.com"
                            value={email || searchText}
                            onChange={(e) => {
                              setSearchText(e.target.value);
                              setEmail("");
                              setSelectedUser(null);
                            }}
                          />

                          {/* SEARCH SUGGESTIONS */}
                          {showDropdown && (
                            <div
                              className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                              style={{ zIndex: 999, maxHeight: 260, overflowY: "auto" }}
                            >
                              {loadingSearch ? (
                                <div className="text-center p-3">Searching...</div>
                              ) : searchResults.length == 0 ? (
                                <div className="text-center p-3 text-muted">
                                  No users found
                                </div>
                              ) : (
                                searchResults.map((user) => (
                                  <div
                                    key={user.id}
                                    className="d-flex align-items-center gap-3 px-3 py-2 hover-bg"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setEmail(user.email);
                                      setSearchText(user.email);
                                      setShowDropdown(false);
                                      setSearchResults([]);

                                      Swal.fire({
                                        toast: true,
                                        position: "top-end",
                                        icon: "success",
                                        title: "User selected",
                                        showConfirmButton: false,
                                        timer: 1200,
                                      });
                                    }}
                                  >
                                    <div
                                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                      style={{ width: 36, height: 36, fontSize: 13 }}
                                    >
                                      {user.first_name?.charAt(0)}
                                      {user.last_name?.charAt(0)}
                                    </div>

                                    <div className="flex-grow-1">
                                      <div className="fw-semibold">
                                        {user.first_name} {user.last_name}
                                      </div>
                                      <small className="text-muted">{user.email}</small>
                                    </div>

                                    <span className="badge bg-success-subtle text-success">
                                      Select
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}


                        </div>

                        <div className="row g-3 mb-4">
                          {ticketData.map((item) => {
                            const available = item.count - item.usedticket;

                            return (
                              <div className="col-md-6" key={item.id}>
                                <label className="form-label text-dark">
                                  {item.ticket?.title}{" "}
                                  <small className="text-dark">
                                    {eventInfo?.currencyName?.Currency_symbol}
                                    {item.ticket?.price}{" "}
                                    {eventInfo?.currencyName?.Currency} ({available} available)
                                  </small>
                                </label>

                                <select
                                  className="form-select custom-input"
                                  value={ticketQty[item.ticket_id] || 0}
                                  onChange={(e) =>
                                    setTicketQty({
                                      ...ticketQty,
                                      [item.ticket_id]: Number(e.target.value),
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

                        <button
                          type="submit"
                          className="btn btn-submit w-100"

                          onClick={handleSubmit}
                          disabled={loadingSubmit} // ✅ disable while loading
                          style={{ opacity: loadingSubmit ? 0.7 : 1 }}
                        >
                          {loadingSubmit ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Sending...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </button>


                      </div>
                    </div>

                  </div>
                </div>
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

export async function getServerSideProps(context) {
  try {
    const { event_id } = context.params;   // ✅ EVENT ID FROM URL
    const token = context.req.cookies?.userAuthToken;

    if (!token) {
      return {
        redirect: { destination: "/login", permanent: false },
      };
    }

    // ✅ SEND EVENT ID TO BACKEND
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/committee/requests/N?event_id=${event_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await res.json();
    const list = json?.data?.list || [];
    console.log(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/committee/requests/N?event_id=${event_id}`);

    const counts = { pending: 0, approved: 0, ignored: 0 };
    list.forEach((i) => {
      if (i.status == "N") counts.pending++;
      if (i.status == "Y") counts.approved++;
      if (i.status == "I") counts.ignored++;
    });

    return {
      props: {
        pendingRequests: list,
        counts,
        event_id, // ✅ PASS TO COMPONENT ALSO
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        pendingRequests: [],
        event_id: null,
        counts: { pending: 0, approved: 0, ignored: 0 },
      },
    };
  }
}