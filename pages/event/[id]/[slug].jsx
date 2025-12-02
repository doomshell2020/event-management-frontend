import React, { useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import { format } from "date-fns";
import CartModal from "@/pages/components/cart_new/CartModal";
import AppointmentModal from "@/pages/components/appointment_cart/CartModal";

export async function getServerSideProps({ params }) {
  const { id, slug } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/public-event-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
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

  // console.log("✅ Active Events:", event);

  // ⛳ All hooks MUST be at the top
  const [backgroundImage, setIsMobile] = useState("/assets/front-images/about-slider_bg.jpg");

  // Prepare dates safely
  const startDate = event ? new Date(event.date_from?.local || event.date_from?.utc) : null;
  const endDate = event ? new Date(event.date_to?.local || event.date_to?.utc) : null;
  const saleStart = event ? new Date(event.sale_start?.local || event.sale_start?.utc) : null;
  const saleEnd = event ? new Date(event.sale_end?.local || event.sale_end?.utc) : null;
  const eventId = event ? event.id : null;
  // 🛑 Early return MUST come after hooks
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

  const handleOpenCart = () => {
    setSelectedEventId(selectedEventId);
    setShowCart(true);
  };

  // appointment cart...
  const handleOpenAppointmentCart = () => {
    setSelectedEventId(selectedEventId);
    setShowAppointmentCart(true);
  };


  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section id="event-detail-page">
        <div className="container">
          <div className="row">

            {/* Left side image */}
            <div className="col-md-6">
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

                <div className="social mt-4 d-flex social_bg justify-content-between align-items-center">
                  <h5 className="mb-0">Share With Friends</h5>
                  <ul className="list-inline social_ul m-0">
                    <li className="list-inline-item">
                      <Link
                        href={`https://www.facebook.com/sharer.php?u=https://eboxtickets.com/event/${slug}`}
                        target="_blank"
                      >
                        <i className="fab fa-facebook-f"></i>
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link
                        href={`https://twitter.com/share?url=https://eboxtickets.com/event/${slug}&text=${event.name}`}
                        target="_blank"
                      >
                        <i className="fab fa-twitter"></i>
                      </Link>
                    </li>
                    <li className="list-inline-item">
                      <Link
                        href={`mailto:?subject=Ebox Tickets: ${event.name}&body=Check out this event: https://eboxtickets.com/event/${slug}`}
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
            <div className="col-md-6">
              <div className="event-ticket-box">
                <div className="section-heading">
                  <h2 className="text-start">{event.name}</h2>
                  <h6>
                    Hosted By <a href="#">Organizer #{event.event_org_id}</a>
                  </h6>

                  {/* 🚫 Inactive Event Warning */}
                  {event.status === "N" && (
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

                  {/* ✅ Show button only for active events */}
                  {event.status === "Y" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenCart();
                      }}
                      className="check-btn"
                    >
                      Check Availability
                    </button>
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

                {/* <h5 className="event_Sub_h">Tickets</h5>
                <p className="event_pra">
                  The maximum number of tickets allowed per account is {event.ticket_limit || 50}.
                </p> */}

                {/* TICKETS LIST */}
                {/* <div className="form-group ticket_all">
                  <ul className="ps-0">
                    {event?.tickets?.length > 0 ? (
                      event.tickets
                        .filter((t) => t.status == "Y" || t.hidden == "N")
                        .map((ticket) => (
                          <li key={ticket.id} className="list-item-none">
                            <div className="row align-items-center">
                              <div className="col-sm-6 col-4 price-name">
                                <h6>{ticket.title}</h6>
                              </div>
                              <div className="col-sm-6 col-8 price-details">
                                <div className="row align-items-center">
                                  <div className="col-6 d-flex align-items-center justify-content-end">
                                    <span className="price">₹{ticket.price}</span>
                                  </div>
                                  <div className="col-6">
                                    <select className="form-select">
                                      {Array.from({ length: 11 }, (_, i) => (
                                        <option key={i} value={i}>
                                          {i}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                    ) : (
                      <li>No active tickets available.</li>
                    )}
                  </ul>
                </div> */}

                {/* ADDONS LIST */}
                {/* {event?.addons?.length > 0 && (
                  <>
                    <h5 className="event_Sub_h">Addons</h5>
                    <div className="form-group ticket_all">
                      <ul className="ps-0">
                        {event.addons
                          .filter((a) => a.status == "Y" || a.hidden == "N")
                          .map((addon) => (
                            <li key={addon.id} className="list-item-none">
                              <div className="row align-items-center">
                                <div className="col-sm-6 col-4 price-name">
                                  <h6>{addon.name}</h6>
                                </div>
                                <div className="col-sm-6 col-8 price-details">
                                  <div className="row align-items-center">
                                    <div className="col-6 d-flex align-items-center justify-content-end">
                                      <span className="price">₹{addon.price}</span>
                                    </div>
                                    <div className="col-6">
                                      <select className="form-select">
                                        {Array.from({ length: 11 }, (_, i) => (
                                          <option key={i} value={i}>
                                            {i}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                )} */}

                {/* Description */}
                <h5 className="event_Sub_h">Description</h5>
                <div className="event_desp">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: event.desp || "No description available.",
                    }}
                  />
                  <p className="mb-0">
                    <i>
                      <b>Note: An 8% transaction fee applies to each purchase.</b>
                    </i>
                  </p>
                </div>

                <hr style={{ margin: "10px 0px", borderColor: "rgba(0,0,0,0.1)" }} />
              </div>
            </div>
          </div>
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
          />
        )
      }





      <FrontendFooter />
    </>
  );
};

export default EventDetailPage;
