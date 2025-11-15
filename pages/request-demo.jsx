import React, { useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";

const RequestDemo = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/img/slider_bg9.jpg');
    return (
        <>
             <FrontendHeader backgroundImage={backgroundImage} />
            <section id="request-demo" className="py-5 px-0">
                <div className="container">
                    <div className="demo-innerconent bg-white">
                        <div className="row align-items-stretch">
                            <div className="col-md-4">
                                <div className="meattingpgLeft h-100 d-flex flex-column justify-content-between">
                                    <div>
                                        <h1 className="fw-bold">Schedule a Meeting</h1>
                                        <p className="body-text">For any information related to eboxtenants, Contact Us</p>
                                        <ul className="timingsMeetingUl p-0">
                                            <li className="position-relative text-16"><i className="far fa-calendar"></i> 2024-06-20</li>
                                            <li className="position-relative text-16"><i className="far fa-clock"></i> 1:30 pm</li>
                                        </ul>
                                    </div>
                                    <img src="https://eboxtickets.com/images/meetingTeamImg.svg" className="contactImg" alt="Meeting"></img>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="meattingpgRgt p-30">

                                    <div className="d-flex gap-3">

                                        <div className="calender-box">
                                            <img src="/assets/img/demo-celender.png" alt="slider" />
                                        </div>

                                        <div className="mettingTimingsDv">
                                            <ul className="d-flex flex-column ps-0">
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">12:00 am</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">12:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">1:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li className="meatingBtnsActive">
                                                    <a className="meatingTimeBtn text-center text-16">1:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">2:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">2:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">3:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">3:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">6:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">6:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">7:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                            </ul>
                                        </div>

                                    </div>
                                    <div className="meatingForm">
                                        <h3 className="fw-bold">Enter Your Details</h3>
                                        <form>
                                            <div className="mb-3 row">
                                                <div className="col-md-12">
                                                    <div className="form-floating mb-3">
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            className="form-control"
                                                            placeholder="Name"
                                                            required
                                                        />
                                                        <label>Name</label>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-floating mb-3">
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            className="form-control"
                                                            placeholder="Email"
                                                            required
                                                        />
                                                        <label>Email Address</label>
                                                    </div>
                                                </div>

                                                <div className="col-md-12 d-flex">
                                                    <div className="me-2 w-25">
                                                        <select name="countryCode" className="form-select" required>
                                                            <option value="">--Select Country--</option>
                                                            <option value="93">Afghanistan (+93)</option>
                                                            <option value="355">Albania (+355)</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="text"
                                                                name="phoneNumber"
                                                                className="form-control"
                                                                placeholder="Phone Number"
                                                                required
                                                            />
                                                            <label>Phone Number</label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-floating mb-3">
                                                        <textarea
                                                            name="meetingDescription"
                                                            className="form-control"
                                                            placeholder="Meeting Description"
                                                            style={{ height: "120px" }}
                                                            required
                                                        ></textarea>
                                                        <label>Meeting Description</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-check mb-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    name="agreeTerms"
                                                    required
                                                />
                                                <label className="form-check-label body-text">
                                                    By proceeding, you confirm that you accept our{" "}
                                                    <a
                                                        href="https://eboxtickets.com/pages/privacy-policy"
                                                        className="btn button-linkcolor p-0 m-0 align-baseline"
                                                        target="_blank"
                                                    >
                                                        Privacy Policy
                                                    </a>{" "}
                                                    and{" "}
                                                    <a
                                                        href="https://eboxtickets.com/pages/terms-and-conditions"
                                                        className="btn button-linkcolor p-0 m-0 align-baseline"
                                                        target="_blank"
                                                    >
                                                        Terms of Use
                                                    </a>
                                                    .
                                                </label>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <button type="button" className="btn btn-primary">
                                                    Back
                                                </button>
                                                <button type="submit" className="btn btn-primary">
                                                    Submit
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                </div>
                            </div>



                        </div>
                    </div>

                </div>
            </section>
            <FrontendFooter />
        </>
    );
};

export default RequestDemo;
