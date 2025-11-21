import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import { format } from "date-fns";
import React, { useMemo, useState, useRef, useEffect } from "react";

// ✅ Correct SSR Function (with current date range)
export async function getServerSideProps() {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const date_from = today.toISOString().split("T")[0]; // current date
    const date_to = new Date(today.setMonth(today.getMonth() + 1))
      .toISOString()
      .split("T")[0]; // one month ahead

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/public-event-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // ✅ Send only recent/upcoming events within the next month
      body: JSON.stringify({
        // status: "Y",
        // date_from,
        // date_to,
      }),
    });

    const data = await response.json();

    return {
      props: {
        events: data?.data?.events || [],
      },
    };
  } catch (error) {
    console.error("Error fetching events:", error.message);
    return {
      props: {
        events: [],
      },
    };
  }
}


const UpComingEvent = ({ events }) => {
  // console.log("✅ Active Events:", events);

  const [searchTerm, setSearchTerm] = useState("");
  // Debounced input handler
  const handleSearch = (e) => {
    const value = e.target.value;
    clearTimeout(window.searchDebounce);
    window.searchDebounce = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  };

  // Filtered events (memoized for optimization)
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;

    return events.filter((event) => {
      const search = searchTerm.toLowerCase();
      return (
        event.name?.toLowerCase().includes(search) ||
        event.desp?.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search)
      );
    });
  }, [searchTerm, events]);

  // Group filtered events by month
  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      // use local time if available, else utc
      const dateString = event?.date_from?.local || event?.date_from?.utc;
      if (!dateString) return acc; // skip if no date found
      const month = format(new Date(dateString), "MMM yyyy"); // e.g., "Jul 2025"
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);


  return (
    <>
      <FrontendHeader backgroundImage="/assets/front-images/about-slider_bg.jpg"/>
      <section className="home-events" id="events">
        <div className="container">
          {/* Section Heading */}
          <div className="section-heading">
            <h1>Events</h1>
            <h2>Upcoming Events</h2>
          </div>

          {/* Search Box */}
          <div className="search-container">
            <form action={'#'}>
              <input
                className="form-control"
                type="search"
                placeholder="Search Events"
                aria-label="Search"
                onChange={handleSearch}
              />
            </form>
            <svg
              width="20"
              height="20"
              viewBox="0 0 17 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="#2874F1" fillRule="evenodd">
                <path d="m11.618 9.897l4.225 4.212c.092.092.101.232.02.313l-1.465 1.46c-.081.081-.221.072-.314-.02l-4.216-4.203"></path>
                <path d="m6.486 10.901c-2.42 0-4.381-1.956-4.381-4.368 0-2.413 1.961-4.369 4.381-4.369 2.42 0 4.381 1.956 4.381 4.369 0 2.413-1.961 4.368-4.381 4.368m0-10.835c-3.582 0-6.486 2.895-6.486 6.467 0 3.572 2.904 6.467 6.486 6.467 3.582 0 6.486-2.895 6.486-6.467 0-3.572-2.904-6.467-6.486-6.467"></path>
              </g>
            </svg>
          </div>

          {/* Dynamic Events */}
          <div className="up-events">
            {Object.keys(groupedEvents).map((month) => (
              <div key={month}>
                {/* Month heading */}
                <div className="month">
                  <h4>{month}</h4>
                </div>

                {groupedEvents[month].map((event) => {
                  const startDate = new Date(event.date_from?.local || event.date_from?.utc);
                  const endDate = new Date(event.date_to?.local || event.date_to?.utc);

                  return (
                    <div className="event-list-box" key={event.id}>
                      <div className="event-coverbox">
                        <Link
                          href={`/event/${event.id}/${event.slug}`}
                        >
                          <div className="event-inner-content">
                            <div className="row align-items-center">

                              {/* Image */}
                              <div className="col-lg-2 col-md-3 col-sm-4 col-12 image_event">
                                <img
                                  className="event_img"
                                  src={event.feat_image || "/default-event.jpg"}
                                  alt={event.name}
                                />
                              </div>

                              {/* Details */}
                              <div className="col-lg-8 col-md-6 col-sm-8 col-12 event-details">
                                <h3 className="event-title">{event.name}</h3>

                                <p className="time">
                                  <i className="fa-solid fa-calendar-days"></i>
                                  <strong> Start Date</strong> <span>:</span>{" "}
                                  {format(startDate, "EEE, dd MMM yyyy")}
                                </p>

                                <p className="time">
                                  <i className="fa-solid fa-calendar-days"></i>
                                  <strong> End Date</strong> <span>:</span>{" "}
                                  {format(endDate, "EEE, dd MMM yyyy")}
                                </p>

                                <span className="d-block">@ {event.location}</span>
                              </div>

                              {/* Date Box */}
                              <div className="col-lg-2 col-md-3 d-block event-timing">
                                <div className="event-date">
                                  <h2>
                                    {format(startDate, "dd")}
                                    <span>{format(startDate, "MMM")}</span>
                                  </h2>
                                </div>
                              </div>

                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      <FrontendFooter />
    </>
  );
};

export default UpComingEvent;
