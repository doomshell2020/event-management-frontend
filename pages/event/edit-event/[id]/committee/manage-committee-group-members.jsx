import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import api from "@/utils/api";
import Link from "next/link";
import Swal from "sweetalert2";

const CommitteeGroupMembersPage = () => {
  const router = useRouter();
  const { id: eventId, groupId } = router.query;

  const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

  /* ---------------- STATES ---------------- */
  const [eventDetails, setEventDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [adding, setAdding] = useState(false);

  /* ---------------- FETCH EVENT ---------------- */
  const fetchEventDetails = async () => {
    if (!eventId) return;
    const res = await api.post("/api/v1/events/event-list", { id: eventId });
    if (res.data?.success) {
      setEventDetails(res.data.data.events[0]);
    }
  };

  /* ---------------- FETCH GROUP MEMBERS ---------------- */
  const fetchGroupMembers = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/committee/groups/${groupId}/members`);
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SEARCH USERS ---------------- */
  useEffect(() => {
    if (!searchText || searchText.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const res = await api.get(`/api/v1/users/search?q=${searchText}`);
        if (res.data.success) {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSearch(false);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timer);
  }, [searchText]);

  /* ---------------- ADD MEMBER ---------------- */
  const handleAddMember = async (userId) => {
    setAdding(true);
    try {
      await api.post("/api/v1/committee/group/add-member", {
        group_id: groupId,
        user_id: userId,
        event_id: eventId,
      });
      fetchGroupMembers();
      setSearchText("");
      setSearchResults([]);
      Swal.fire("Success", "Member added successfully", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Failed to add member", "error");
    } finally {
      setAdding(false);
    }
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (eventId && groupId) {
      fetchEventDetails();
      fetchGroupMembers();
    }
  }, [eventId, groupId]);

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section id="myevent-deshbord">
        <div className="d-flex">
          <EventSidebar eventId={eventId} />

          <div className="event-righcontent">
            <div className="dsa_contant">
              <EventHeaderSection eventDetails={eventDetails} />

              <h4 className="text-24">Committee Group Members</h4>
              <hr className="custom-hr" />

              {/* TABS */}
              <ul className="tabes d-flex ps-0">
                <li>
                  <Link
                    href={`/event/edit-event/${eventId}/committee/manage-committee`}
                    className="text-16"
                  >
                    Manage
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/event/edit-event/${eventId}/committee/manage-committee-tickets`}
                    className="text-16"
                  >
                    Tickets
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/event/edit-event/${eventId}/committee/manage-committee-groups`}
                    className="active text-16"
                  >
                    Groups
                  </Link>
                </li>
              </ul>

              {/* SEARCH & ADD MEMBER */}
              <div className="Committee card p-3 mb-4">
                <h6>
                  Group Members ({loading ? "Loading..." : members.length})
                </h6>

                <div className="row">
                  <div className="col-md-10 col-sm-8 col-8">
                    <div className="position-relative">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Search users by name, email, mobile"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          autoComplete="off"
                        />
                      </div>

                      {/* SEARCH SUGGESTIONS */}
                      {searchText.length > 1 && (
                        <div
                          className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                          style={{ zIndex: 999, maxHeight: "260px", overflowY: "auto" }}
                        >
                          {loadingSearch ? (
                            <div className="text-center p-2">Loading...</div>
                          ) : searchResults.length === 0 ? (
                            <div className="text-center p-2 text-muted">No users found</div>
                          ) : (
                            searchResults.map((user) => {
                              const alreadyAdded = members.some(m => m.user.id === user.id);
                              return (
                                <div
                                  key={user.id}
                                  className={`d-flex align-items-center gap-3 px-3 py-2 user-suggestion-item ${alreadyAdded ? "bg-light text-muted" : "hover-bg"}`}
                                  style={{ cursor: alreadyAdded ? "not-allowed" : "pointer" }}
                                >
                                  <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center ${alreadyAdded ? "bg-secondary text-white" : "bg-primary text-white"}`}
                                    style={{ width: 36, height: 36, fontSize: 13, fontWeight: 600 }}
                                  >
                                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                  </div>

                                  <div className="w-100 d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-semibold">{user.first_name} {user.last_name}</div>
                                      <small className="text-muted">{user.email} • {user.mobile}</small>
                                    </div>
                                    {!alreadyAdded && (
                                      <button
                                        className="btn btn-sm btn-primary"
                                        disabled={adding}
                                        onClick={() => handleAddMember(user.id)}
                                      >
                                        Add
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="custom-hr" />

                {/* MEMBERS TABLE */}
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-sm mb-1">
                    <thead className="text-white table-detail">
                      <tr>
                        <th style={{ width: "5%" }}>S.No.</th>
                        <th style={{ width: "35%" }}>Name</th>
                        <th style={{ width: "35%" }}>Email</th>
                        <th style={{ width: "25%" }}>Joined At</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan="4" className="text-center py-5">
                            <div className="spinner-border text-primary" />
                            <div className="mt-2 fw-semibold">Loading...</div>
                          </td>
                        </tr>
                      )}

                      {!loading && members.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center">
                            No members found
                          </td>
                        </tr>
                      )}

                      {!loading && members.map((m, i) => (
                        <tr key={m.id}>
                          <td>{i + 1}</td>
                          <td>{m.user.first_name} {m.user.last_name}</td>
                          <td>{m.user.email}</td>
                          <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default CommitteeGroupMembersPage;
