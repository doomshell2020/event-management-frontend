import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import FrontLeftSideBar from "@/shared/layout-components/frontelements/front-left-side-bar";
import Link from "next/link";
import axios from "axios";
import {
    CForm,
    CCol,
    CFormLabel,
    CFormFeedback,
    CFormInput,
    CInputGroupText,
    CButton,
    CFormCheck,
    CFormTextarea,
} from "@coreui/react";
import { Breadcrumb, Card, Col, Form, InputGroup, Row, Modal, Button } from "react-bootstrap";
import moment from "moment-timezone";
import Swal from "sweetalert2";

const MyEventsPage = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [isLeftRight, setIsLeftRight] = useState(false);
    const [isOpenWiggins, setIsOpenWiggins] = useState(false);
    console.log("isOpenWiggins", isOpenWiggins);
    // const [isLeftRightWiggins, setIsLeftRightWiggins] = useState(false);
    const [show, setShow] = useState(false);
    const [complimentary, setComplimentary] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleComplimentaryClose = () => setComplimentary(false);
    const handleComplimentaryShow = () => setComplimentary(true);

    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            {/* <FrontLeftSideBar /> */}

            <section id="myevent-deshbord">
                <div className="d-flex">

                    <div className={`event-sidebar ${isLeftRight ? 'sideBarRightLeftClosed' : ''}`}>
                        <div className="side_menu_icon">
                            <i className={`bi bi-arrow-${isLeftRight ? 'right' : 'left'}-short`} onClick={() => setIsLeftRight(!isLeftRight)}></i>
                        </div>
                        <ul className="listunstyl components2">
                            <li className="mb-3">
                                <Link className="text-white fw-bold"
                                    href="/event/post-event"
                                    style={{ backgroundColor: "#ff9800" }}
                                >
                                    <i className="bi bi-calendar2-event"></i>
                                    <span className="fw-bold"> Create Event </span>
                                </Link>
                            </li>
                            <li className="mb-3">
                                <Link className="text-white fw-bold"
                                    href="/event/post-event"
                                    style={{ backgroundColor: "#00ad00" }}
                                >
                                    <i className="bi bi-eye-fill"></i>
                                    <span className="fw-bold"> View Event </span>
                                </Link>
                            </li>
                        </ul>

                        <ul className="listunstyl components">
                            <li>
                                <Link href="/event/my-event">
                                    <i className="bi bi-speedometer2"></i>
                                    <span> Dashboard </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/event/my-event">
                                    <i className="bi bi-sliders"></i>
                                    <span> Settings </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/event/my-event">
                                    <i className="bi bi-credit-card"></i>
                                    <span> Payments </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/event/my-event">
                                    <i className="bi bi-bar-chart"></i>
                                    <span> Analytics </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/event/my-event">
                                    <i className="bi bi-wallet2"></i>
                                    <span> Payouts </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/event/my-event">
                                    <i className="bi bi-wallet2"></i>
                                    <span> Export Tickets </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/event/my-event">
                                    <i className="bi bi-people"></i>
                                    <span> Committee </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/event/my-event">
                                    <i className="fas fa-ticket-alt"></i>
                                    <span>  Tickets </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/event/my-event">
                                    <i className="fas fa-chart-bar"></i>
                                    <span> Ticket Reports </span>
                                </Link>
                            </li>

                            <li className="menu_line"></li>

                            <li>
                                <ul className="dropdown-box ps-0">
                                    <li className="dropdown">
                                        <button
                                            className="dropdown-toggle w-100 bg-transparent border-0 shadow-none d-flex justify-content-between align-items-center"
                                            role="button"
                                            onClick={() => setIsOpen(!isOpen)}
                                            data-bs-toggle="dropdown"
                                        >
                                            <span> Account </span>
                                        </button>

                                        {isOpen && (
                                            <ul className="dropdown-munubox p-0 w-100 border-0">
                                                <li>
                                                    <Link
                                                        className="dropdown-item"
                                                        href="/event/my-ticket"
                                                    >
                                                        <i className="fas fa-ticket-alt"></i>
                                                        <span> My Tickets </span>
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        className="dropdown-item"
                                                        href="/"
                                                    >
                                                        <i className="bi bi-person"></i>
                                                        <span> Profile </span>
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        className="dropdown-item"
                                                        href="/"
                                                    >
                                                        <i className="bi bi-box-arrow-right"></i>
                                                        <span> Logout </span>
                                                    </Link>
                                                </li>
                                            </ul>
                                        )}
                                    </li>
                                </ul>
                            </li>
                        </ul>


                    </div>
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg edit-event-page">
                                <div className="event_names d-flex justify-content-between align-items-center p-2 px-3 mb-3">
                                    <div className="dropdown">
                                        <button
                                            className="btn rounded-md text-sm text-white dropdown-toggle"
                                            role="button"
                                            id="dropdownMenuLink2"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                            style={{ backgroundColor: "#e62d56" }}
                                            onClick={() => setIsOpenWiggins(!isOpenWiggins)}
                                        >
                                            Jescie Wiggins
                                        </button>
                                        {isOpenWiggins && (
                                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink2">
                                                <li>
                                                    <a className="dropdown-item" href="https://eboxtickets.com/event/settings/287">
                                                        Jescie Wiggins
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" href="https://eboxtickets.com/event/settings/283">
                                                        Raksha Bandhan
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item browseall_event" href="https://eboxtickets.com/event/myevent">
                                                        Browse All Event
                                                    </a>
                                                </li>
                                            </ul>
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <h6 className="event_Heading mb-0 fs-5 fw-bold">Jescie Wiggins</h6>
                                    </div>

                                    <div className="text-right mt-1">
                                        <a
                                            href="https://eboxtickets.com/event/Velit-rerum-amet-ve"
                                            target="_blank"
                                            className="btn rounded-md text-sm text-white"
                                            rel="noopener noreferrer"
                                            style={{ backgroundColor: "#00b56a" }}
                                        >
                                            View Event
                                        </a>
                                    </div>
                                </div>
                                <div className="prosection">
                                    <div className="table-responsive">
                                        <div className="scroll_tab w-auto px-2">
                                            <ul id="progressbar">
                                                <li className="active"><Link className="fw-semibold" href="/event/event-detail/manage-event">Manage Event</Link></li>
                                                <li><Link className="fw-semibold" href="/event/event-detail/manage-tickets">Manage Tickets</Link></li>
                                                <li><Link className="fw-semibold" href="/event/event-detail/manage-committee">Manage Committee</Link></li>
                                                <li><Link className="fw-semibold" href="/event/event-detail/publish-event">Publish Event</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <h4 className="text-24">Manage Tickets </h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">You can manage all your tickets here.</p>
                                <div className="row align-items-baseline">
                                    <div className="col-md-7">
                                        <ul className="tabes d-flex ps-0">
                                            <li>
                                                <Link href="/" className="active text-16">
                                                    Settings
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/" className="text-16">

                                                    Addons
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/" className="text-16">
                                                    Questions
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/" className="text-16">
                                                    Package
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="col-md-5">
                                        <button
                                            className="primery-button fw-normal px-2 text-white"
                                            style={{ backgroundColor: "#00ad00" }}
                                            onClick={handleShow}
                                        >
                                            <i className="bi bi-plus"></i> Add Ticket
                                        </button>

                                        <button
                                            className="primery-button fw-normal px-2 ms-1 text-white"
                                            style={{ backgroundColor: "#ff9800" }}
                                            onClick={handleComplimentaryShow}
                                        >
                                            <i className="bi bi-plus"></i> Generate Complimentary Ticket
                                        </button>
                                    </div>
                                </div>

                                <div className="contant_bg">
                                    <h6>Tickets Types</h6>
                                    <hr className="custom-hr" />
                                    <div className="row d-flex justify-content-end align-items-center item_bg m-0 p-2 px-3 mb-1">
                                        <div className="col-sm-8 col-7 hidden">
                                            <p className="body-text ">
                                                <strong>Comps</strong> ($0.00 USD) <br />
                                                Sold: 0
                                            </p>

                                            <div className="row d-flex justify-content-end align-items-center">
                                                <div className="col-md-4">
                                                    <p className="d-flex body-text mb-0">
                                                        <i className="bi bi-lock-fill"></i> Committee Sales
                                                    </p>
                                                </div>
                                                <div className="col-md-3">
                                                    <p className="body-text mb-0">
                                                        <i className="bi bi-eye-slash-fill"></i> Hidden
                                                    </p>
                                                </div>
                                                <div className="col-md-3"></div>
                                                <div className="col-md-2"></div>
                                            </div>
                                        </div>

                                        <div className="col-sm-4 col-5 d-flex justify-content-end"></div>
                                    </div>
                                    <div className="next_prew_btn d-flex justify-content-between mt-4">
                                        <a className="prew primery-button fw-normal" href="https://eboxtickets.com/event/settings/287">
                                            Previous
                                        </a>
                                        <a className="next primery-button fw-normal" href="https://eboxtickets.com/event/committee/287">
                                            Next
                                        </a>
                                    </div>

                                </div>


                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />
            <Modal className="addticket" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-dark">Add Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body><div className="row g-3 text-start">
                    <div className="col-md-12 mt-0">
                        <label htmlFor="title" className="form-label">Name</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="form-control"
                            placeholder="Enter Ticket Name"
                            id="title"
                        />
                    </div>

                    <div className="col-md-6 mt-0">
                        <label htmlFor="type" className="form-label">Type</label>
                        <select name="type" required className="form-select" id="type">
                            <option value="">Choose Type</option>
                            <option value="open_sales">Open Sales</option>
                            <option value="committee_sales">Committee Sales</option>
                        </select>
                    </div>

                    <div className="col-md-6 mt-0">
                        <label htmlFor="price" className="form-label">Price</label>
                        <input
                            type="number"
                            name="price"
                            required
                            placeholder="Price"
                            className="form-control"
                            id="price"
                        />
                    </div>

                    <div className="col-md-6 mt-0">
                        <label htmlFor="count" className="form-label">Count</label>
                        <input
                            type="number"
                            name="count"
                            className="form-control"
                            placeholder="Enter Count"
                            required
                            maxLength="5"
                            id="count"
                        />
                    </div>

                    <div className="col-md-6 mt-0">
                        <label htmlFor="hidden" className="form-label">Visibility</label>
                        <select name="hidden" required className="form-select" id="hidden">
                            <option value="">Choose One</option>
                            <option value="Y">Visible</option>
                            <option value="N">Hidden</option>
                        </select>
                    </div>
                </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal className="addticket" show={complimentary} onHide={handleComplimentaryClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-dark">Modal ComplimentaryComplimentaryComplimentaryComplimentaryComplimentary</Modal.Title>
                </Modal.Header>
                <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleComplimentaryClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleComplimentaryClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default MyEventsPage