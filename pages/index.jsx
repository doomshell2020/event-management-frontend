import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import React, { useMemo, useState, useRef, useEffect } from "react";

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


const Home = ({ events }) => {
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
      <FrontendHeader isStripeShowing={true} />

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


          {/* View All Button */}
          <div className="view-button d-flex justify-content-center">
            <Link href="/event/upcoming-events" className="primery-button">
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* <section className="home-events" id="events">
        <div className="container">
          <div className="section-heading">
            <h1>
              Events
            </h1>
            <h2>
              Upcoming Events
            </h2>
          </div>
          <div className="search-container">
            <form action="">
              <input
                className="form-control" type="text" placeholder="Search Events" aria-label="Search" />
            </form>
            <svg width="20" height="20" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg">
              <g fill="#2874F1" fillRule="evenodd">
                <path className="_34RNph" d="m11.618 9.897l4.225 4.212c.092.092.101.232.02.313l-1.465 1.46c-.081.081-.221.072-.314-.02l-4.216-4.203">
                </path>
                <path className="_34RNph" d="m6.486 10.901c-2.42 0-4.381-1.956-4.381-4.368 0-2.413 1.961-4.369 4.381-4.369 2.42 0 4.381 1.956 4.381 4.369 0 2.413-1.961 4.368-4.381 4.368m0-10.835c-3.582 0-6.486 2.895-6.486 6.467 0 3.572 2.904 6.467 6.486 6.467 3.582 0 6.486-2.895 6.486-6.467 0-3.572-2.904-6.467-6.486-6.467">
                </path>
              </g>
            </svg>
          </div>

          <div className="up-events">
            <div className="month">
              <h4>Aug</h4>
            </div>
            <div className="event-list-box">
              <div className="event-coverbox">
                <Link href={`/event/149/test-event`}>
                  <div className="event-inner-content">
                    <div className="row align-items-center">
                      <div className="col-lg-2 col-md-3 col-sm-4 col-12 image_event  ">
                        <img className="event_img" src="/assets/front-images/event-section-img.jpg" alt="Event"></img>
                      </div>
                      <div className="col-lg-8 col-md-6 col-sm-8 col-12 event-details">
                        <h3 className="event-title"> Souldierz Games Night</h3>
                        <p className="time">
                          <i className="fa-solid fa-calendar-days"></i>
                          <strong>Start Date</strong><span>:</span>
                          Sun, 24 Aug 2025 | 06:00 PM
                        </p>
                        <p className="time"><i className="fa-solid fa-calendar-days"></i>
                          <strong>End Date</strong> <span>:</span>
                          Sun, 24 Aug 2025 |
                          09:00 PM
                        </p>
                        <span className="d-block">
                          Hosted By Our Lady of Assumption
                        </span>
                        <span className="d-block">@ South Oropouche R.C. School</span>
                      </div>
                      <div className="col-lg-2 col-md-3 d-block event-timing">
                        <div className="event-date">
                          <h2>
                            24
                            <span>Aug</span>
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            <div className="month">
              <h4>Sep</h4>
            </div>
            <div className="event-list-box">
              <div className="event-coverbox">
                <Link href={`/event/149/test-event`}>
                  <div className="event-inner-content">
                    <div className="row align-items-center">
                      <div className="col-lg-2 col-md-3 col-sm-4 col-12 image_event  ">
                        <img className="event_img" src="/assets/front-images/event-section-img.jpg" alt="Event"></img>
                      </div>
                      <div className="col-lg-8 col-md-6 col-sm-8 col-12 event-details">
                        <h3 className="event-title"> Souldierz Games Night</h3>
                        <p className="time">
                          <i className="fa-solid fa-calendar-days"></i>
                          <strong>Start Date</strong><span>:</span>
                          Sun, 24 Aug 2025 | 06:00 PM
                        </p>
                        <p className="time"><i className="fa-solid fa-calendar-days"></i>
                          <strong>End Date</strong> <span>:</span>
                          Sun, 24 Aug 2025 |
                          09:00 PM
                        </p>
                        <span className="d-block">
                          Hosted By Our Lady of Assumption
                        </span>
                        <span className="d-block">@ South Oropouche R.C. School</span>
                      </div>
                      <div className="col-lg-2 col-md-3 d-block event-timing">
                        <div className="event-date">
                          <h2>
                            24
                            <span>Aug</span>
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="view-button d-flex justify-content-center">
            <Link href="#" className="primery-button">View All</Link>
          </div>
        </div>
      </section> */}

      {/* scan section home page */}
      <section id="scan_section">
        <div className="container">
          <div className="section-heading"><h1></h1><h2></h2></div>

          <div className="row">
            <div className="col-sm-4 col-12">
              <div className="card">
                <div className="img_icon">
                  <img
                    src="/assets/front-images/ticket-scanning.png"
                    className="card-img-top scan_img"
                    alt="Ticket Scaning"
                    loading="lazy"
                  />
                </div>

                <div className="card-body">
                  <h5 className="card-title text-dark">Fast Ticket Scanning</h5>
                  <p className="card-text">
                    Ticket scanning app for iOS or Android devices offers faster
                    ticket validation for larger audiences
                  </p>
                </div>
              </div>
            </div>

            <div className="col-sm-4 col-12">
              <div className="card">
                <div className="img_icon">
                  <img
                    src="/assets/front-images/ticket-reporting.png"
                    className="card-img-top scan_img"
                    alt="Ticket Reporting"
                    loading="lazy"
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title text-dark">Scan Reporting</h5>
                  <p className="card-text">
                    Ticket scan report shows which tickets have been scanned and which
                    customers have yet to arrive
                  </p>
                </div>
              </div>
            </div>

            <div className="col-sm-4 col-12">
              <div className="card">
                <div className="img_icon">
                  <img
                    src="/assets/front-images/ticket-sales.png"
                    className="card-img-top scan_img"
                    alt="Ticket Sales"
                    loading="lazy"
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title text-dark">Committee Sales</h5>
                  <p className="card-text">
                    Screen ticket requests through Committee Approval, ensuring
                    tickets end up in the right hands; resulting in your event hosting
                    the Right Crowd
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  */}
      <section id="manage_Audience" className="bg_color1">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-sm-12 img_view">
              <div className="manage_img text-center">
                <img
                  src="/assets/front-images/Manage_audience.png"
                  className="audi_img"
                  alt="Manage Audience"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="col-md-6 col-sm-12">
              <div className="section-heading">
                <h2 className="text-start">Promoters - Manage your Event ‘On the Go’</h2>

                <ul className="list-inline facilities">
                  <li className="d-flex align-items-start">
                    <img className="arrow-img" src="/assets/front-images/arrow.png" alt="" loading="lazy" />
                    <p>Multiple TTD/ USD Payment Options (Credit - Debit Card or Cash)</p>
                  </li>

                  <li className="d-flex align-items-start">
                    <img className="arrow-img" src="/assets/front-images/arrow.png" alt="" loading="lazy" />
                    <p>Sell Tickets through Committees (Credit - Debit Card or Cash)</p>
                  </li>

                  <li className="d-flex align-items-start">
                    <img className="arrow-img" src="/assets/front-images/arrow.png" alt="" loading="lazy" />
                    <p>Mobile App (iOS / Android)</p>
                  </li>

                  <li className="d-flex align-items-start">
                    <img className="arrow-img" src="/assets/front-images/arrow.png" alt="" loading="lazy" />
                    <p>Real Time Analytics</p>
                  </li>

                  <li className="d-flex align-items-start">
                    <img className="arrow-img" src="/assets/front-images/arrow.png" alt="" loading="lazy" />
                    <p>Faster Entry Times into Venues</p>
                  </li>

                  <li className="d-flex align-items-start">
                    <img className="arrow-img" src="/assets/front-images/arrow.png" alt="" loading="lazy" />
                    <p>Secure CC Transactions (Multi Factor Authentication)</p>
                  </li>

                  <li className="d-flex align-items-start">
                    <img className="arrow-img" src="/assets/front-images/arrow.png" alt="" loading="lazy" />
                    <p>Ticket Scanning Equipment & Staffing Resources (just ask)</p>
                  </li>

                  <li className="d-flex align-items-start">
                    <img className="arrow-img" src="/assets/front-images/arrow.png" alt="" loading="lazy" />
                    <p>Easy & Intuitive process</p>
                  </li>
                </ul>

              </div>
            </div>
          </div>
        </div>
      </section>
      {/*  */}

      <section id="manage_Audience" className="bg_color3">
        <div className="container">
          <div className="row">

            <div className="col-md-6 col-sm-12">
              <div className="section-heading">
                <h2 className="text-start">Ticket scanning with your phone</h2>
                <p>We have a free ticket scanning app that works alongside your eboxtickets account to enable you to
                  scan the code on your customer's tickets, in whatever format they have chosen.</p>
                <p>The app checks the ticket reference in real time, so you'll need a Wi-Fi or 3G connection at the
                  venue to use it. You can have multiple devices scanning tickets, all updating your eboxtickets
                  account in real time.</p>

                <div className="down_icon">
                  <a href="https://play.google.com/store/apps/details?id=com.doomshell.eboxticket&amp;pli=1">
                    <img src="/assets/front-images/play_stor.png" loading="lazy" alt="play store" />
                  </a>
                  <a href="https://apps.apple.com/in/app/eboxtickets/id6443949094">
                    <img src="/assets/front-images/app_stor.png" loading="lazy" alt="App Store" />
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-sm-12 img_view">
              <div className="manage_img text-center">
                <img src="/assets/front-images/Manage_audience2.png" className="audi_img" alt="Manage Audience" loading="lazy" />
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="manage_Audience" className="bg_color2">
        <div className="container">
          <div className="row">

            <div className="col-md-6 col-sm-12 img_view">
              <div className="manage_img text-center">
                <img
                  src="/assets/front-images/Manage_audience3.png"
                  className="audi_img"
                  alt="Manage Audience"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="col-md-6 col-sm-12">
              <div className="section-heading">
                <h2 className="text-start">No internet connection?</h2>
                <p>We have an offline ticket scanning app available for your Windows PC or laptop. Simply install
                  the software and download your event booking information before heading to the event.</p>
                <p>When you're ready to start scanning tickets, simply plug-in a USB barcode scanner and start
                  scanning tickets – with no internet connection required.</p>
                <p>Unrecognised booking confirmations are visibly and audibly rejected, speeding up your queue
                  management.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/*  */}
      <div id="calculator">
        <div className="container">

          <div className="row">
            <div className="col-md-8 col-sm-7 col-12">
              <div className="section-heading">
                <h2 className="text-start">Calculate Your Fees</h2>
                <p>Ticket Price</p>

                <div className="range-slider">
                  <input
                    className="range-slider__range"
                    type="range"
                    defaultValue="100"
                    min="0"
                    max="500"
                    style={{ background: "linear-gradient(90deg, rgb(26, 188, 156) 20%, rgb(215, 220, 223) 20.1%)" }}
                  />
                  <span className="range-slider__value text-center position-relative d-inline-block text-white">100</span>
                </div>

                <form className="row g-3 mt-1">

                  <div className="col-md-4 col-sm-4 col-4 rang_f">
                    <label htmlFor="customerpays" className="form-label">Customer Pays</label>
                    <input type="text" className="form-control" id="customerpays" placeholder="$ 107" />
                  </div>
                  <div className="col-md-4 col-sm-4 col-4 rang_f">
                    <label htmlFor="youreceive" className="form-label">You Receive</label>
                    <input type="text" className="form-control" id="youreceive" placeholder="$ 100" />
                  </div>
                  <div className="col-md-4 col-sm-4 col-4 rang_f">
                    <label htmlFor="ourcost" className="form-label">Our Cost</label>
                    <input type="text" className="form-control" id="ourcost" placeholder="8%" />
                  </div>

                </form>
              </div>
            </div>

            <div className="col-md-4 col-sm-5 col-12">
              <div className="container_img">
                <img src="/assets/front-images/Calculate_Fees_img.png" alt="Calculate Fees" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  */}
      <div id="down_app">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-sm-6">
              <div className="counting section-heading">
                <h2>Download on any Device</h2>
                <p>
                  Our mobile event app is available to download on any iOS or Android
                  device via the app store.
                </p>
                <div className="down_icon text-center">
                  <a href="https://play.google.com/store/apps/details?id=com.doomshell.eboxticket&amp;pli=1">
                    <img src="/assets/front-images/play_stor.png" alt="Play Store" />
                  </a>
                  <a href="https://apps.apple.com/in/app/eboxtickets/id6443949094">
                    <img src="/assets/front-images/app_stor.png" alt="App Store" />
                  </a>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="app_img">
                <img src="/assets/front-images/app-screen.png" alt="App Screenshot" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FrontendFooter />
    </>
  );
};

export default Home;
