import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import { Form, Button, Modal } from "react-bootstrap";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import Moment from "react-moment";
import api from "@/utils/api";

const CommitteeCommissionsPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [show, setShow] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [amount, setAmount] = useState("");
    const [txnRef, setTxnRef] = useState("");
    const [remarks, setRemarks] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ---------------- STATES ---------------- */
    const [eventDetails, setEventDetails] = useState(null);
    const [committeeList, setCommitteeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    /* ---------------- FETCH ALL TICKETS ---------------- */
    const fetchCommitteeMembers = async (event_id) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/committee/committee-members/list/${event_id}`);

            if (res.data.success) {
                setCommitteeList(res.data.data || []);
            } else {
                setCommitteeList([]);
            }
        } catch (err) {
            console.error("Tickets fetch error", err);
            setCommitteeList([]);
        } finally {
            setLoading(false);
        }
    };
    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        }
    };

    /* ---------------- INITIAL LOAD ---------------- */
    useEffect(() => {
        if (id) {
            fetchCommitteeMembers(id);
            fetchEventDetails(id);
        }
    }, [id]);
    const showLoader = loading || processing;

    const submitPayout = async () => {
        setSubmitted(true);
        if (!id || !selectedUserId || !amount || !txnRef) return;
        try {
            setSubmitting(true);
            await api.post("/api/v1/committee/create-pay", {
                event_id: id,
                user_id: selectedUserId,
                paid_amount: Number(amount),
                txn_ref: txnRef,
                remarks
            });
            setShow(false);
            setAmount("");
            setTxnRef("");
            setRemarks("");
            setSelectedUserId(null);
            setSubmitted(false);
            fetchCommitteeMembers(id);
        } catch (err) {
            const apiErrorMsg =
                err.response?.data?.error?.details ||
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                err.message ||
                "Something went wrong. Please try again.";
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: apiErrorMsg,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddPayout = (userId) => {
        setSelectedUserId(userId);
        setShow(true);
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar eventId={id} eventDetails={eventDetails} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg edit-event-page">
                                <EventHeaderSection
                                    eventDetails={eventDetails}
                                />

                                <h4 className="text-24">
                                    Committee Payouts
                                </h4>
                                <hr className="custom-hr" />
                                {/* TABS */}
                                <ul className="tabes d-flex ps-0">
                                    <li>
                                        <Link
                                            href={`/event/edit-event/${id}/committee/manage-committee`}
                                            className="text-16"
                                        >
                                            Manage
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={`/event/edit-event/${id}/committee/manage-committee-tickets`}
                                            className="text-16"
                                        >
                                            Tickets
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/event/edit-event/${id}/committee/manage-committee-groups`} className="text-16">
                                            Groups
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={`/event/edit-event/${id}/committee/manage-committee-commissions`} className="active text-16">
                                            Committee Payouts
                                        </Link>
                                    </li>
                                </ul>

                                <div className="contant_bg">
                                    {/* LOADER */}
                                    {showLoader && (
                                        <div className="text-center py-5">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            />
                                            <div className="mt-2 fw-semibold">
                                                Loading committee commissions distribution...
                                            </div>
                                        </div>
                                    )}

                                    {/* TABLE */}
                                    {!showLoader && (

                                        <div className="card manage-commitee-tiket-module">
                                            <div className="table-container-box shadow-sm mb-2 p-3">
                                                {/* first table start*/}
                                                <div className="card-header card-header fw-bold px-0 fs-6 pt-1 text-dark">
                                                    Committee Members
                                                </div>
                                                {/* TABLE */}
                                                <div className="table-responsive">
                                                    <table className="table table-bordered text-center align-middle mb-2 table-border-dark-soft table-mobile-width">
                                                        <thead className="table-primary">
                                                            <tr>
                                                                <th style={{ width: "5%" }}>S.No.</th>
                                                                <th style={{ width: "20%" }}>User Details</th>
                                                                <th style={{ width: "10%" }}>Assigned Tickets</th>
                                                                <th style={{ width: "10%" }}>Sold Tickets</th>
                                                                <th style={{ width: "10%" }}>Sales</th>
                                                                <th style={{ width: "10%" }}>Commission</th>
                                                                <th style={{ width: "10%" }}>Paid Amount</th>
                                                                <th style={{ width: "10%" }}>Pending Amount</th>
                                                                <th style={{ width: "7%" }}>Status</th>
                                                                <th style={{ width: "8%" }}>Action</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {
                                                                committeeList && committeeList.length > 0 ? (
                                                                    committeeList.map((value, index) => {
                                                                        return (
                                                                            <tr key={value.id}>
                                                                                <td className="fw-bold">{index + 1}</td>

                                                                                <td className="text-start">
                                                                                    <div className="d-flex align-items-center gap-2">
                                                                                        <div>
                                                                                            <div className="fw-semibold">
                                                                                                {value.user?.first_name} {value.user?.last_name}
                                                                                            </div>

                                                                                            <div className="fw-bold text-dark">
                                                                                                {value.user?.email || "N/A"}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>


                                                                                {/* <td>
                                                                                    {value.user?.first_name} {value.user?.last_name}<br/>
                                                                                      {value.user?.email || "N/A"}
                                                                                </td> */}

                                                                                <td>
                                                                                    {value.total_assigned_tickets || 0}
                                                                                </td>
                                                                                <td>
                                                                                    {value.total_sold_tickets || 0}
                                                                                </td>

                                                                                <td>{value.currency}{""}{value.total_sales}</td>

                                                                                <td>{value.currency}{""}{value.total_commission}{" "}({value.commission}%)</td>

                                                                                <td className="text-success">{value.currency}{""}{value.total_paid}</td>

                                                                                <td className="text-danger">{value.currency}{""}{value.balance}</td>

                                                                                <td>
                                                                                    {value.payout_status === "Completed" && (
                                                                                        <span className="badge bg-success">Completed</span>
                                                                                    )}

                                                                                    {value.payout_status === "Pending" && (
                                                                                        <span className="badge bg-danger">Pending</span>
                                                                                    )}

                                                                                    {value.payout_status === "No Sales" && (
                                                                                        <span className="badge bg-secondary">No Sales</span>
                                                                                    )}
                                                                                </td>

                                                                                <td>
                                                                                    <button
                                                                                        className="btn btn-sm btn-success"
                                                                                        disabled={value.balance <= 0}
                                                                                        title="Add payout for this member"
                                                                                        // onClick={() => setShow(true)}
                                                                                        onClick={() => handleAddPayout(value.user?.id)}
                                                                                    >
                                                                                        Add Payout
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="9" className="text-center fw-bold">
                                                                            No Member Found
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            }
                                                        </tbody>

                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                    )}

                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

            {/* MODAL */}
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Payout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Paid Amount</Form.Label>
                            <Form.Control
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                isInvalid={submitted && !amount}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Transaction Ref</Form.Label>
                            <Form.Control
                                value={txnRef}
                                onChange={e => setTxnRef(e.target.value)}
                                isInvalid={submitted && !txnRef}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Remarks</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={submitPayout} disabled={submitting}>
                        {submitting ? "Saving..." : "Confirm"}
                    </Button>
                </Modal.Footer>
            </Modal>





        </>
    );
};

export default CommitteeCommissionsPage;
