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

        const newStatus = eventDetails.is_active ? 0 : 1;

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
                    setEventDetails((prev) => ({ ...prev, is_active: newStatus }));
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
                    <EventSidebar />
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg edit-event-page">
                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Publish Event</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">You can manage event status here.</p>

                                <div className="contant_bg mt-4">
                                    <h6>Activation Setting</h6>
                                    <hr className="custom-hr" />
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            {eventDetails && eventDetails.is_active ? (
                                                <Eye className="me-2" />
                                            ) : (
                                                <EyeOff className="me-2" />
                                            )}
                                            <div>
                                                <p className="text-16 mb-1">
                                                    {eventDetails && eventDetails.is_active
                                                        ? "Event is Active"
                                                        : "Event is Inactive"}
                                                </p>
                                                <p className="text-14 text-dark mb-0">
                                                    {eventDetails && eventDetails.is_active
                                                        ? "Your event is live and visible to attendees."
                                                        : "Your event is not visible to attendees."}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            {eventDetails && (
                                                <button
                                                    className={`btn ${eventDetails.is_active ? "btn-danger" : "btn-success"}`}
                                                    onClick={toggleEventStatus}
                                                    disabled={statusLoading}
                                                >
                                                    {statusLoading
                                                        ? "Processing..."
                                                        : eventDetails.is_active
                                                            ? "Deactivate Event"
                                                            : "Activate Event"}
                                                </button>
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
