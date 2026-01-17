import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";

import api from "@/utils/api";
import Swal from "sweetalert2";

const CommitteeGroupPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [eventDetails, setEventDetails] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState("");

    const [showLoader, setShowLoader] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ---------------- FETCH EVENT ---------------- */
    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (err) {
            console.error("Event fetch error", err);
        }
    };

    /* ---------------- FETCH GROUP LIST ---------------- */
    const fetchGroups = async () => {
        try {
            setShowLoader(true);
            const res = await api.get(
                `/api/v1/committee/groups/${id}`
            );

            if (res.data.success) {
                setGroups(res.data.data || []);
            }
        } catch (err) {
            console.error("Group fetch error", err);
        } finally {
            setShowLoader(false);
        }
    };

    /* ---------------- CREATE GROUP ---------------- */
    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Swal.fire("Warning", "Please enter group name", "warning");
            return;
        }

        try {
            setIsSubmitting(true);

            const res = await api.post(
                `/api/v1/committee/groups/create`,
                {
                    event_id: id,
                    group_name: groupName.trim()
                }
            );

            if (res.data.success) {
                Swal.fire("Success", "Group created successfully", "success");
                setGroupName("");
                fetchGroups(); // refresh list
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error?.response?.data?.error?.message || "Failed to create group",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------------- INITIAL LOAD ---------------- */
    useEffect(() => {
        if (id) {
            fetchEventDetails(id);
            fetchGroups();
        }
    }, [id]);

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar eventId={id}  eventDetails={eventDetails}/>

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg edit-event-page">
                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Committee Groups Distribution</h4>
                                <hr className="custom-hr" />

                                <p className="text-14 text-dark">
                                    Committee groups persist across events. This is a convenient way to manage different lists of committee members.
                                </p>

                                {/* TABS */}
                                <ul className="tabes d-flex ps-0">
                                    <li>
                                        <Link href={`/event/edit-event/${id}/committee/manage-committee`} className="text-16">
                                            Manage
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/event/edit-event/${id}/committee/manage-committee-tickets`} className="text-16">
                                            Tickets
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/event/edit-event/${id}/committee/manage-committee-groups`} className="active text-16">
                                            Groups
                                        </Link>
                                    </li>
                                </ul>

                                <div className="contant_bg">
                                    {/* LOADER */}
                                    {showLoader && (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" />
                                            <div className="mt-2 fw-semibold">Loading groups...</div>
                                        </div>
                                    )}

                                    {!showLoader && (
                                        <div className="card px-0 px-sm-3">
                                            <div className="table-container-box shadow-sm p-3">
                                                <h6>Add New Groups</h6>

                                                <div className="row my-2 mt-3 g-2">
                                                    <div className="col-md-10 col-sm-8">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter group name"
                                                            value={groupName}
                                                            onChange={(e) => setGroupName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-md-2 col-sm-4 text-end">
                                                        <button
                                                            className="btn save next w-100 primery-button py-2 h-100 fw-normal"
                                                            disabled={isSubmitting}
                                                            onClick={handleCreateGroup}
                                                        >
                                                            {isSubmitting ? "Adding..." : "Add"}
                                                        </button>
                                                    </div>
                                                </div>

                                                <h6 className="mt-4">Existing Groups</h6>

                                                {groups.length == 0 && (
                                                    <p className="text-muted text-14">No groups created yet</p>
                                                )}

                                                <div className="row mt-2">
                                                    {groups.map((g) => (
                                                        <div key={g.id} className="col-md-6 mb-3">
                                                            <div
                                                                className="group-card p-3 rounded shadow-sm h-100 d-flex align-items-center justify-content-between"
                                                                style={{
                                                                    cursor: "pointer",
                                                                    transition: "all 0.2s ease",
                                                                    background: "#fff"
                                                                }}
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/event/edit-event/${id}/committee/manage-committee-group-members?groupId=${g.id}`
                                                                    )
                                                                }
                                                            >
                                                                <div>
                                                                    <div className="fw-semibold text-15">{g.name}</div>
                                                                    <div className="text-muted text-12">
                                                                        Click to manage members
                                                                    </div>
                                                                </div>

                                                                <i className="bi bi-arrow-right-circle text-primary fs-4"></i>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>

                                            <div className="row my-3">
                                                <div className="col-6">
                                                    <button
                                                        className="btn primery-button py-2 fw-normal text-14"
                                                        style={{height:"auto"  }}
                                                    >
                                                        Previous
                                                    </button>
                                                </div>
                                                <div className="col-6 text-end">
                                                    <button className="btn save py-2 primery-button fw-normal text-14"
                                                    style={{ height:"auto",backgroundColor:"#3d6db5" }}>
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div >
            </section >

            <FrontendFooter />
        </>
    );
};

export default CommitteeGroupPage;
