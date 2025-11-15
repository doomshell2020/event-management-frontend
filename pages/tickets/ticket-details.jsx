import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";


const MyTicket = () => {
    const [backgroundImage, setIsMobile] = useState('https://eboxtickets.com/images/about-slider_bg.jpg');
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            <section id="ticket-detailpage" className="bg-white position-relative">
                <div className="container">
                    <div className="section-heading">
                        <h1>Ticket</h1>
                        <h2 className="mt-4">
                            Ticket Details
                        </h2>
                    </div>
                    <div className="row">
                        <div className="col-md-5">
                            <div className="about_img fadeInLeft about_img w-100 pe-3 position-sticky top-0">
                                <div className="about_imgmn wow fadeInLeft">
                                    <img
                                        src="https://eboxtickets.com/images/eventimages/17551892758c152ca3b25bacef67167ee4523329db.jpg"
                                        alt="img"
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="col-md-7">
                            <div class="ticket_h d-flex justify-content-between">
                                <div class="flex-fill pe-2">
                                    <h3 className="fw-bold">IFRS UPDATE 2025</h3>
                                    <h6 className="text-14 fw-bold">Hosted By <a href="#">ACCA</a></h6>
                                </div>
                            </div>
                            <div className="info">
                                <ul className="d-flex ps-0 mb-0">
                                    <li className="flex-fill">
                                        <div>
                                            <h6>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5ZM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1Z" /><path d="M11 6h1v1h-1V6ZM3 8h2v2H3V8Zm3 0h2v2H6V8Zm3 0h2v2H9V8ZM3 11h2v2H3v-2Zm3 0h2v2H6v-2Zm3 0h2v2H9v-2Z" /></svg>

                                                Start Date
                                            </h6>
                                            <span>Sun, 24th Aug 2025 | 06:00 PM</span>
                                        </div>
                                    </li>
                                    <li className="flex-fill">
                                        <div>
                                            <h6>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5ZM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1Z" /><path d="M11 6h1v1h-1V6ZM3 8h2v2H3V8Zm3 0h2v2H6V8Zm3 0h2v2H9V8ZM3 11h2v2H3v-2Zm3 0h2v2H6v-2Zm3 0h2v2H9v-2Z" /></svg>

                                                End Date
                                            </h6>
                                            <span>Sun, 24th Aug 2025 | 09:00 PM</span>
                                        </div>
                                    </li>
                                    <li className="flex-fill">
                                        <div>
                                            <h6>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" /></svg>

                                                Location
                                            </h6>
                                            <span>South Oropouche R.C. School</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="ticket_dis mt-3">
                                <h4>Tickets</h4>
                                <p>
                                    You have to name all your tickets below before you can print or download them.
                                </p>
                            </div>
                            <form action="">
                                <div className="form_detals mb-3" id="update_ticket">
                                    <div className="mt-2">
                                        <div className="row">
                                            <div className="d-flex mb-3 w-100">
                                                <span className="info_heading">Ticket Type</span>
                                                <span className="con-dest">:</span>
                                                <span className="info_contant">
                                                    <strong>Non-member</strong>
                                                </span>
                                            </div>

                                            <div className="d-flex mb-3 w-100">
                                                <span className="info_heading">Purchase Date</span>
                                                <span className="con-dest">:</span>
                                                <span className="info_contant">
                                                    <strong>Thu, 28 Aug 2025 | 05:12 PM</strong>
                                                </span>
                                            </div>

                                            <div className="d-flex mb-3 w-100">
                                                <span className="info_heading">Location</span>
                                                <span className="con-dest">:</span>
                                                <span className="info_contant">
                                                    <strong>Virtual</strong>
                                                </span>
                                            </div>

                                            <div className="d-flex mb-3 w-100">
                                                <span className="info_heading">Ticket Holder Name</span>
                                                <span className="con-dest">:</span>
                                                <span className="info_contant">
                                                    <input
                                                        type="text"
                                                        name="name[]"
                                                        required
                                                        className="form-control"
                                                        defaultValue="Karina Heusner"
                                                        placeholder="Enter Full Name"
                                                        aria-describedby="emailHelp"
                                                    />
                                                    <input type="hidden" name="tid[]" value="24620" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <hr />

                                    <div className="d-flex justify-content-end mb-2">
                                        <Link
                                            className="printtickets down primery-button"
                                            href="/"
                                            title="Download"
                                        >
                                            Print ticket
                                        </Link>

                                        <button className=" primery-button subtn ms-2">Save Name</button>
                                    </div>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            </section>
            <FrontendFooter />
        </>
    )
}

export default MyTicket