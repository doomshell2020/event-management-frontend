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
    // console.log('eventDetails :', eventDetails);
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

        const newStatus = eventDetails.status == "N" ? "Y" : "N";

        const confirmResult = await Swal.fire({
            title: "Are you sure?",
            text: `You want to ${newStatus == "Y" ? "activate" : "deactivate"} this event?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: newStatus == "Y" ? "Activate" : "Deactivate",
            cancelButtonText: "Cancel",
        });

        if (confirmResult.isConfirmed) {
            try {
                setStatusLoading(true);

                const formData = new FormData();
                formData.append("status", newStatus);

                const res = await api.put(`/api/v1/events/update/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (res.data.success) {
                    setEventDetails(res.data.data.event);

                    Swal.fire({
                        icon: "success",
                        title: `Event ${newStatus == "Y" ? "activated" : "deactivated"
                            } successfully!`,
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
                                <p className="text-14 text-dark">
                                    You can manage event status here.
                                </p>

                                <div className="contant_bg mt-4 shadow-sm rounded p-4 bg-white border">
                                    <div className="row mb-3">
                                        <div className="col-md-8 col-sm-6">
                                            <h6 className="fw-bold mb-0">
                                                Activation Setting
                                            </h6>
                                        </div>
                                        <div className="col-md-4 col-sm-6 mt-2 mt-sm-0">
                                            {eventDetails?.admineventstatus == "Y" ? (
                                                <span
                                                    className="bg-success px-3 text-white py-2 h-100 d-flex align-items-center justify-content-center"
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    ✔ Admin Approved
                                                </span>
                                            ) : (
                                                <span
                                                    className="text-white bg-warning text-dark px-3 py-2 h-100 d-flex align-items-center justify-content-center"
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    ⏳ Pending Admin Approval
                                                </span>
                                            )}
                                        </div>



                                    </div>

                                    <hr className="mt-2 mb-3" />

                                    {
                                        loading ? (
                                            <div className="text-center my-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="row align-items-center">
                                                <div className="col-md-8 col-sm-6 d-flex align-items-center">
                                                    <div className="me-3">
                                                        {eventDetails?.status == "Y" ? (
                                                            <div
                                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    backgroundColor: "#e6f7ed",
                                                                }}
                                                            >
                                                                <Eye className="text-success" size={26} />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    backgroundColor: "#fdecea",
                                                                }}
                                                            >
                                                                <EyeOff
                                                                    className="text-danger"
                                                                    size={26}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="fs-6 fw-semibold mb-1">
                                                            {eventDetails?.status == "Y"
                                                                ? "Event is Active"
                                                                : "Event is Inactive"}
                                                        </p>

                                                        <p className="mb-0">
                                                            {eventDetails?.status == "Y"
                                                                ? "Your event is live and visible to attendees."
                                                                : "Your event is not visible to attendees."}
                                                        </p>

                                                        {/* WARNING ONLY FOR PAID EVENT WHEN APPROVAL REQUIRED */}
                                                        {eventDetails?.is_free == "N" && eventDetails?.admineventstatus == "N" && (
                                                            <div
                                                                className="mt-3 d-flex align-items-center rounded p-3"
                                                                style={{
                                                                    backgroundColor: "#fff3cd",
                                                                    border: "1px solid #ffecb5",
                                                                    color: "#856404",
                                                                }}
                                                            >
                                                                <div
                                                                    className="me-2 d-flex align-items-center justify-content-center rounded-circle"
                                                                    style={{
                                                                        width: "28px",
                                                                        height: "28px",
                                                                        backgroundColor: "#ffecb5",
                                                                    }}
                                                                >
                                                                    ⚠
                                                                </div>

                                                                <small className="fw-semibold">
                                                                    Admin approval is pending. You cannot activate or deactivate this paid event.
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 mt-md-0 col-md-4 col-sm-6">
                                                    <button
                                                        className={`btn px-4 fw-semibold w-100 ${eventDetails?.status == "Y"
                                                            ? "btn-danger"
                                                            : "btn-success"
                                                            }`}
                                                        onClick={toggleEventStatus}
                                                        disabled={
                                                            statusLoading ||
                                                            (eventDetails?.admineventstatus == "N")
                                                        }
                                                    >

                                                        {statusLoading
                                                            ? "Processing..."
                                                            : eventDetails?.status == "Y"
                                                                ? "Deactivate Event"
                                                                : "Activate Event"}
                                                    </button>


                                                </div>
                                            </div>
                                        )
                                    }


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
