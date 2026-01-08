import React, { useState, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import { format } from "date-fns";
import CartModal from "@/pages/components/cart_new/CartModal";
import AppointmentModal from "@/pages/components/appointment_cart/CartModal";
import { useAuth } from "@/shared/layout-components/layout/AuthContext";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import api from "@/utils/api";
import { isEventExpired, formatEventDateTime } from "@/utils/formatDate";


export async function getServerSideProps({ params }) {
  const { id, slug } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/public-event-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        is_details_page: true
      }),
    });

    const data = await response.json();

    return {
      props: {
        event: data?.data?.events?.[0] || null,
        slug,
      },
    };
  } catch (error) {
    console.error("Error fetching event detail:", error.message);
    return {
      props: {
        event: null,
        slug,
      },
    };
  }
}

const EventDetailPage = ({ event, slug }) => {
  const { token } = useAuth();
  const router = useRouter();
  const [backgroundImage, setIsMobile] = useState("/assets/front-images/about-slider_bg.jpg");
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState([]);
  const [currency, setCurrency] = useState("");
  // console.log("currency",currency);
  const formatTime = (timeString) => {
    if (!timeString) return "";

    let [hours, minutes] = timeString.split(":");

    hours = parseInt(hours);
    const suffix = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert 0 -> 12, 13 -> 1

    return `${hours}:${minutes} ${suffix}`;
  };

  const formatReadableDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;

    try {
      // youtu.be/VIDEO_ID
      if (url.includes("youtu.be/")) {
        return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
      }

      // youtube.com/watch?v=VIDEO_ID
      if (url.includes("watch?v=")) {
        return `https://www.youtube.com/embed/${url.split("watch?v=")[1].split("&")[0]}`;
      }

      // youtube.com/shorts/VIDEO_ID ✅ SUPPORT SHORTS
      if (url.includes("youtube.com/shorts/")) {
        return `https://www.youtube.com/embed/${url.split("shorts/")[1].split("?")[0]}`;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Prepare dates safely
  const startDate = event ? new Date(event.date_from?.local || event.date_from?.utc) : null;
  const endDate = event ? new Date(event.date_to?.local || event.date_to?.utc) : null;
  const saleStart = event ? new Date(event.sale_start?.local || event.sale_start?.utc) : null;
  const saleEnd = event ? new Date(event.sale_end?.local || event.sale_end?.utc) : null;
  const eventId = event ? event.id : null;

  // ⏰ Check if event is expired
  const expired = isEventExpired(event);

  // Early return MUST come after hooks
  if (!event || Object.keys(event).length == 0) {
    return (
      <>
        <FrontendHeader backgroundImage="/assets/front-images/about-slider_bg.jpg" />

        <section id="event-not-found" className="py-5 text-center">
          <div className="container">
            <h2 className="text-danger mb-3">No Event Found</h2>
            <p className="text-muted">
              The event you’re looking for doesn’t exist or has been removed.
            </p>
            <Link href="/" className="btn btn-primary mt-3">
              Go Back Home
            </Link>
          </div>
        </section>

        <FrontendFooter />
      </>
    );
  }

  const [showCart, setShowCart] = useState(false);
  const [showAppointmentCart, setShowAppointmentCart] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(eventId);
  const [slotIds, setSlotIds] = useState([]);

  const handleOpenCart = () => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to view your cart.",
        confirmButtonText: "Login Now"
      }).then(() => {
        router.push("/login");
      });
      return;
    }

    setSelectedEventId(selectedEventId);
    setShowCart(true);
  };

  // appointment cart...
  const handleOpenAppointmentCart = (slots, selectedSlots) => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to view your cart.",
        confirmButtonText: "Login Now"
      }).then(() => {
        router.push("/login");
      });
      return;
    }
    // Extract only IDs
    const selectedIds = selectedSlots.map(s => s.id);
    setSlotIds(selectedIds)
    // console.log("Selected IDs:", selectedIds);
    setSelectedEventId(selectedEventId);
    setShowAppointmentCart(true);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`api/v2/events/${eventId}/appointments`);
        const currencySymbol =  res?.data?.data?.currencyName?.Currency_symbol || "$";
        setCurrency(currencySymbol)
        setAppointmentData(res.data.data.wellness);
      } catch (error) {
        console.error("Error loading cart/event:", error);
      }
      setIsLoading(false);
    };

    fetchDetails();
  }, [eventId]);

  const [selectedSlots, setSelectedSlots] = useState({});
  const toggleSlotSelection = (wellnessId, slot) => {
    setSelectedSlots((prev) => {
      const current = prev[wellnessId] || [];

      const exists = current.find((s) => s.id === slot.id);

      let updated;
      if (exists) {
        // remove slot
        updated = current.filter((s) => s.id !== slot.id);
      } else {
        // add full slot object with numeric price
        updated = [...current, { ...slot, price: Number(slot.price) }];
      }

      return {
        ...prev,
        [wellnessId]: updated
      };
    });
  };


  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section id="event-detail-page">
        <div className="container">
          <div className="row">

            {/* Left side image */}
            <div className="col-md-5">
              <div className="ticker_img fadeInLeft position-sticky top-0">

                <div className="ticker_imgmn">
                  <img
                    className="event_img"
                    src={event.feat_image || "/assets/front-images/event-section-img.jpg"}
                    alt={event.name}
                  />
                </div>

                <img
                  className="event_bg position-absolute"
                  src="/assets/front-images/detals-bg.png"
                  alt="background"
                />

                <div className="social mt-3 d-flex social_bg justify-content-between align-items-center">
                  <h5 className="mb-0">Share With Friends</h5>
                  <ul className="list-inline social_ul m-0">
                    <li className="list-inline-item">
                      <Link
                        href={`https://www.facebook.com/sharer.php?u=${process.env.NEXT_PUBLIC_API_BASE_URL}event/${slug}`}
                        target="_blank"
                      >
                        <i className="fab fa-facebook-f"></i>
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link
                        href={`https://twitter.com/share?url=${process.env.NEXT_PUBLIC_API_BASE_URL}event/${slug}&text=${event.name}`}
                        target="_blank"
                      >
                        <i className="fab fa-twitter"></i>
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link
                        href={`mailto:?subject=Ebox Tickets: ${event.name}&body=Check out this event: ${process.env.NEXT_PUBLIC_API_BASE_URL}event/${slug}`}
                        target="_blank"
                      >
                        <i className="fa fa-envelope"></i>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right side details */}
            <div className="col-md-7">
              <div className="event-ticket-box">

                <div className="section-heading">
                  <h2 className="text-start">{event.name}</h2>
                  <h6>
                    Hosted By <a href="#"> #{event.companyInfo?.name || 'Company'}</a>
                  </h6>


                  {/* 🚫 Inactive Event Warning */}
                  {!expired && event.status == "N" && (
                    <div
                      style={{
                        background: "#ffdddd",
                        border: "1px solid #ff6b6b",
                        padding: "10px 15px",
                        borderRadius: "6px",
                        marginTop: "10px",
                        color: "#b30000",
                        fontWeight: "600",
                      }}
                    >
                      ⚠️ This event is currently inactive and not available for booking.
                    </div>
                  )}

                  {!expired && event.status == "Y" && (
                    <div className="mt-3 d-flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenCart();
                        }}
                        className="btn btn-primary"
                      >
                        Check Availability
                      </button>

                      {/* <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenAppointmentCart();
                        }}
                        className="btn btn-outline-primary"
                      >
                        Check Appointment
                      </button> */}
                    </div>
                  )}

                </div>

                <div className="info">
                  <ul className="d-flex ps-0 mb-0">
                    <li className="flex-fill">
                      <div>
                        <h6>Start Date</h6>
                        <span>{startDate ? format(startDate, "EEE, dd MMM yyyy | hh:mm a") : ""}</span>
                      </div>
                    </li>

                    <li className="flex-fill">
                      <div>
                        <h6>End Date</h6>
                        <span>{endDate ? format(endDate, "EEE, dd MMM yyyy | hh:mm a") : ""}</span>
                      </div>
                    </li>

                    <li className="flex-fill">
                      <div>
                        <h6>Location</h6>
                        <span>{event.location || "Not Available"}</span>
                      </div>
                    </li>

                  </ul>
                </div>

                {expired && (
                  <div
                    style={{
                      background: "#f8d7da",
                      border: "1px solid #f5c2c7",
                      padding: "10px 15px",
                      borderRadius: "6px",
                      marginTop: "12px",
                      color: "#842029",
                      fontWeight: "600",
                    }}
                  >
                    ⛔ This event has ended as per local event time.
                    <div className="small mt-1">
                      Ended on{" "}
                      <b>
                        {formatEventDateTime(
                          event.date_to.utc,
                          event.event_timezone
                        )}
                      </b>
                    </div>
                  </div>
                )}              

                
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="event-appointment-sec">
        <div className="container">
          {appointmentData?.length > 0 && (
            <>
              <h5 className="mb-4">Available Appointments</h5>

              <div className="row g-4">
                {appointmentData.map((w) => (
                  <div
                    key={w.id}
                    className={`col-md-${appointmentData.length === 1 ? "12 only-single-cart" : "6"
                      }`}
                  >
                    <div className="card shadow-sm border-0 h-100">
                      {/* IMAGE */}
                      <div className="event-appo-img">
                        <img
                          src={w.Image}
                          className="card-img-top"
                          style={{ objectFit: "cover" }}
                          alt={w.name}
                        />
                      </div>

                      <div className="card-body py-4">
                        {/* TITLE */}
                        <h6 className="fw-bold mb-1 text-uppercase">{w.name}</h6>

                        {/* LOCATION */}
                        <p className="mb-2">
                          <i className="bi bi-geo-alt-fill me-1"></i>
                          {w.location}
                        </p>

                        {/* DESCRIPTION */}
                        <div
                          className="text-muted mb-3 card-description"
                          style={{ fontSize: "13px" }}
                          dangerouslySetInnerHTML={{ __html: w.description }}
                        />

                        <div className="py-3">
                          <div className="appoinment-checkbtn">
                            {(() => {
                              const selectedForThis = selectedSlots[w.id] || [];
                              const selectedCount = selectedForThis.length;
                              const totalPrice = selectedForThis.reduce(
                                (sum, s) => sum + Number(s.price),
                                0
                              );

                              return (
                                <>
                                  {/* SLOT LIST */}
                                  {w.wellnessSlots?.map((slot) => {
                                    const isSelected = selectedForThis.some(
                                      (s) => s.id === slot.id
                                    );
                                    return (
                                      <div
                                        key={slot.id}
                                        className="slot-btn"
                                        onClick={() =>
                                          toggleSlotSelection(w.id, slot)
                                        }
                                        style={{
                                          border: isSelected
                                            ? "2px solid #21a67a"
                                            : "1px solid #e1e1e1",
                                          padding: "12px",
                                          borderRadius: "9px",
                                          marginBottom: "10px",
                                          cursor: "pointer",
                                          backgroundColor: isSelected
                                            ? "rgb(236 243 251)"
                                            : "#fff",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        {/* CHECKBOX */}
                                        <input
                                          type="checkbox"
                                          className="form-check-input me-3"
                                          checked={isSelected}
                                          readOnly
                                          style={{ cursor: "pointer" }}
                                        />

                                        {/* DATE & TIME */}
                                        <div style={{ fontSize: "14px" }}>
                                          <div className="d-flex align-items-center gap-3">
                                            <span className="d-flex align-items-center">
                                              <i className="bi bi-calendar me-1"></i>
                                              <strong>
                                                {formatReadableDate(slot.date)}
                                              </strong>
                                            </span>

                                            <span className="d-flex align-items-center">
                                              <i className="bi bi-clock me-1"></i>
                                              {formatTime(slot.slot_start_time)} -{" "}
                                              {formatTime(slot.slot_end_time)}
                                            </span>
                                          </div>
                                        </div>

                                        {/* PRICE */}
                                        <div
                                          style={{
                                            fontWeight: "bold",
                                            color: "rgb(33, 166, 122)",
                                            fontSize: "16px",
                                          }}
                                        >
                                          {currency}{" "}
                                          {slot.price}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* SUMMARY */}
                                  {selectedCount > 0 && (
                                    <div
                                      style={{
                                        padding: "12px",
                                        background: "#f8fdfb",
                                        border: "1px solid #d7f2ea",
                                        borderRadius: "8px",
                                        marginBottom: "15px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "14px",
                                      }}
                                    >
                                      <div>{selectedCount} slots selected</div>
                                      <div style={{ fontWeight: "bold" }}>
                                        Total: {currency}{" "}
                                        {totalPrice}
                                      </div>
                                    </div>
                                  )}

                                  {/* BOOK BUTTON */}
                                  {w.wellnessSlots?.length > 0 && (
                                    <div className="text-center">
                                      <button
                                        className="btn mt-3 w-100"
                                        disabled={selectedCount === 0}
                                        style={{
                                          background:
                                            selectedCount > 0
                                              ? "#21a67a"
                                              : "#9fd6c5",
                                          color: "#fff",
                                          borderRadius: "50px",
                                          padding: "10px 30px",
                                        }}
                                        onClick={() =>
                                          handleOpenAppointmentCart(
                                            w,
                                            selectedForThis
                                          )
                                        }
                                      >
                                        Book Appointment
                                      </button>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>


      {/* ✅ Cart Modal */}
      {
        showCart && (
          <CartModal
            show={showCart}
            handleClose={() => setShowCart(false)}
            eventId={selectedEventId}
          />
        )
      }

      {/* ✅Appointment Cart Modal */}
      {
        showAppointmentCart && (
          <AppointmentModal
            show={showAppointmentCart}
            handleClose={() => setShowAppointmentCart(false)}
            eventId={selectedEventId}
            slotIds={slotIds}
          />
        )
      }
      {/* Description */}
      <div className="mt-4">
        <div className="container">

          <div className="event_desp pb-3 p-3 border border-gray rounded shadow-sm mb-3">
            <h5 className="event_Sub_h mb-2">Description</h5>
            <div className="border-top border-1 pb-3"
              dangerouslySetInnerHTML={{
                __html: event.desp || "No description available.",
              }}
            />

            {/* 🎥 Event Video */}
            {event.video_url && getYoutubeEmbedUrl(event.video_url) && (
              <div className="mt-4">
                <h6 className="mb-2">Event Preview</h6>

                <div
                  className="ratio ratio-16x9 rounded overflow-hidden shadow-sm"
                  style={{ backgroundColor: "#000" }}
                >
                  <iframe
                    src={getYoutubeEmbedUrl(event.video_url)}
                    title="Event Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}


            <p className="mb-0">
              <i>
                <b>Note: An 8% transaction fee applies to each purchase.</b>
              </i>
            </p>
          </div>
        </div>
      </div>
      <FrontendFooter />
    </>
  );
};



export default EventDetailPage;
