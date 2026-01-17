import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import { Eye, EyeOff } from "lucide-react";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";

const PublishEvent = () => {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(false);
    const [eventDetails, setEventDetails] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);

    const fetchEventDetails = async (eventId) => {
        setLoading(true);
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchEventDetails(id);
    }, [id]);

    const toggleEventStatus = async () => {
        if (!eventDetails) return;
        const newStatus = eventDetails.status == 'N' ? 'Y' : 'N';
        // console.log('newStatus :', newStatus);
        const confirmResult = await Swal.fire({
            title: "Are you sure?",
            text: `You want to ${newStatus ? "activate" : "deactivate"} this event?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: newStatus ? "Activate" : "Deactivate",
            cancelButtonText: "Cancel",
        });

        if (confirmResult.isConfirmed) {
            try {
                setStatusLoading(true);

                // ✅ Prepare FormData
                const formData = new FormData();
                formData.append("status", newStatus);

                // ✅ Send FormData via PUT
                const res = await api.put(`/api/v1/events/update/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (res.data.success) {
                    setEventDetails(res.data.data.event);
                    Swal.fire({
                        icon: "success",
                        title: `Event ${newStatus ? "activated" : "deactivated"} successfully!`,
                        timer: 1500,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: res.data.message || "Something went wrong!",
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Something went wrong!",
                });
            } finally {
                setStatusLoading(false);
            }
        }

    };

    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    <EventSidebar eventId={id} eventDetails={eventDetails} />
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Publish Event</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">You can manage event status here.</p>

                                <div className="contant_bg mt-4 shadow-sm rounded p-4 bg-white border">

                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h6 className="fw-bold mb-0">Activation Setting</h6>

                                        {eventDetails?.admineventstatus == "Y" ? (
                                            <span className="badge bg-success px-3 py-2">Admin Approved</span>
                                        ) : (
                                            <span className="badge bg-warning text-dark px-3 py-2">
                                                Pending Admin Approval
                                            </span>
                                        )}
                                    </div>

                                    <hr className="mt-2 mb-3" />

                                    <div className="d-flex align-items-start">

                                        <div className="me-3">
                                            {eventDetails?.status == "Y" ? (
                                                <div className="bg-success bg-opacity-10 p-2 rounded">
                                                    <Eye className="text-success" size={22} />
                                                </div>
                                            ) : (
                                                <div className="bg-danger bg-opacity-10 p-2 rounded">
                                                    <EyeOff className="text-danger" size={22} />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="fs-6 fw-semibold mb-1">
                                                {eventDetails?.status == "Y"
                                                    ? "Event is Active"
                                                    : "Event is Inactive"}
                                            </p>

                                            <p className="text-muted small mb-0">
                                                {eventDetails?.status == "Y"
                                                    ? "Your event is live and visible to attendees."
                                                    : "Your event is not visible to attendees."}
                                            </p>

                                            {/* ADMIN STATUS MESSAGE */}
                                            {eventDetails?.admineventstatus == "N" && (
                                                <div className="alert alert-warning mt-3 mb-0 p-2 d-flex align-items-center">
                                                    <span className="me-2">⚠</span>
                                                    <small>
                                                        Admin approval is pending. You cannot activate or deactivate this event.
                                                    </small>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                </div>


                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
};

export default PublishEvent;
