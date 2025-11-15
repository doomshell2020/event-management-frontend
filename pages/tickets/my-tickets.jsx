import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";


const MyTicket = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            <section id="my-ticket-module">
                <div className="container">
                    <div className="section-heading">
                        <h1>Tickets</h1>
                        <h2 className="mt-4">My Tickets</h2>
                        <p className="text-center text-14">Here you can manage your tickets</p>
                    </div>
                    <div className="my-ticketcontainer">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="up_events position-relative">
                                    <Link href="/tickets/ticket-detail">
                                        <div className="inner_box">
                                            <div className="row d-flex align-items-center justify-content-center g-0">
                                                <div className="col-sm-5">
                                                    <div className="image_br image_br d-flex align-items-center w-100 overflow-hidden" style={{ height: "220px" }}>
                                                        <img
                                                            className="event_img w-100"
                                                            src="/assets/front-images/my-tacket-section.jpg"
                                                            alt="IMG"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-7">
                                                    <div className="event_contant">
                                                        <h3 className="title m-0 fw-bold">IFRS UPDATE 2025</h3>
                                                        <p className="time d-inline-block m-0 p-0 rounded-0">

                                                            <i className="bi bi-calendar-week me-1"></i>

                                                            <strong style={{ display: "inline-block", width: "70px" }}>
                                                                Start Date
                                                            </strong>
                                                            <span
                                                                style={{
                                                                    display: "inline-block",
                                                                    width: "10px",
                                                                    color: "#333",
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                :
                                                            </span>
                                                            Wed, 17 Sep 2025 | 12:00 AM
                                                        </p>

                                                        <p className="mb-0 time d-inline-block m-0 p-0 rounded-0">
                                                            <i className="bi bi-calendar-week me-1"></i>

                                                            <strong style={{ display: "inline-block", width: "70px" }}>
                                                                End Date
                                                            </strong>
                                                            <span
                                                                style={{
                                                                    display: "inline-block",
                                                                    width: "10px",
                                                                    color: "#333",
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                :
                                                            </span>
                                                            Thu, 18 Sep 2025 | 11:00 PM
                                                        </p>

                                                        <span className="mb-2 d-block">@ Virtual</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                            </div>
                        </div>
                        <div className="paginator col-sm-12">
                            <ul className="pagination justify-content-center">
                                <li className="prev disabled">
                                    <Link href="/"><i class="bi bi-chevron-left"></i> Previous</Link>
                                </li>
                                <li className="next disabled">
                                    <Link href="/">Next <i class="bi bi-chevron-right"></i></Link>
                                </li>
                            </ul>
                            <div className="text-center">
                                <p className="paginate_p text-14">
                                    Page 1 of 1, showing 2 record(s) out of 2 total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <FrontendFooter />
        </>
    )
}

export default MyTicket