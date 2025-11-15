import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";


const ContactUs = () => {
  const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />
            <section id="contact-us">
                <div className="container">
                    <div className="section-heading">
                        <h1>Contact us</h1>
                        <h2>Contact us</h2>
                        <p className="mb-4 heading_p text-center text-14 body-text">Any question or remarks? Just write us a message!</p>
                    </div>
                    <div className="row no-gutters">
                        <div className="col-sm-6">
                            <div className="content_inf">
                                <div className="info">
                                    <ul className="ps-0 mb-0">
                                        <li className="d-flex position-relative">
                                            <i className="fas fa-mobile-alt mr-1 mr-2"></i>
                                            <div>
                                                <h6 className="text-16 body-text">Office</h6>
                                                <span className="text-14">868-222-2534</span>
                                            </div>
                                        </li>

                                        <li className="d-flex position-relative">
                                            <i className="bi bi-whatsapp whatsapp_icon mr-1 mr-2"></i>
                                            <div>
                                                <h6 className="text-16 body-text">Whatsapp</h6>
                                                <span className="text-14">868-778-6837</span>
                                            </div>
                                        </li>

                                        <li className="d-flex position-relative">
                                            <i className="far fa-envelope mr-1 mr-2"></i>
                                            <div>
                                                <h6 className="text-16 body-text">Email id</h6>
                                                <span className="text-14">info@eboxtickets.com</span>
                                            </div>
                                        </li>

                                        <li className="d-flex position-relative">
                                            <i className="fas fa-map-marker-alt mr-1 mr-2"></i>
                                            <div>
                                                <h6 className="text-16 body-text">Address</h6>
                                                <span className="text-14">
                                                    Unit#5 Courtyard, <br /> Government Campus Plaza <br /> Nos 1-3 Richmond Street <br /> Port of Spain
                                                </span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="contact_form">
                                <h3 className="text-center fw-bold">
                                    Get In Touch
                                </h3>
                                <form>
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        placeholder="Name"
                                    />
                                    <input
                                        type="email"
                                        className="form-control mb-3"
                                        placeholder="Email"
                                    />
                                     <input
                                        type="text"
                                        className="form-control mb-3"
                                        placeholder="Event"
                                    />
                                    <select className="form-select mb-3 border-0 rounded-0" defaultValue="">
                                        <option value="" disabled>Choose a subject</option>
                                        <option value="1">General Inquiry</option>
                                        <option value="2">Support</option>
                                        <option value="3">Feedback</option>
                                    </select>
                                    <textarea
                                        className="form-control mb-3"
                                        rows="4"
                                        placeholder="Description"
                                    ></textarea>
                                    <button type="submit" className="primery-button w-100">Submit <i className="fas fa-angle-double-right"></i></button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    )
}

export default ContactUs