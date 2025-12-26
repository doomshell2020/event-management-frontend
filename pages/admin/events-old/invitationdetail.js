import React, { useState, useRef, useEffect } from "react";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { Breadcrumb, Card, Col, Row, Container, Spinner, Modal, Button } from "react-bootstrap";
import { optiondefault } from "../../../shared/data/form/form-validation"
// import { DateAndTimePickers, Datepicker } from '../../../shared/data/form/form-elements';
import Link from "next/link";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import html2canvas from 'html2canvas';

import {
    CForm,
    CCol,
    CFormLabel,
    CFormFeedback,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CButton,
    CFormCheck,
    CFormTextarea,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import { useRouter } from 'next/router';
import { number } from "prop-types";
const InvitationDetails = () => {

    const router = useRouter();
    const { orderId } = router.query;

    //DefaultValidation
    // const { orderId } = router.query;
    // const orderId = 24;
    //DefaultValidation
    const [Default, setDefault] = useState("");
    const [userdetail, setUserdetail] = useState("");
    const [allTickets, setAllTickets] = useState([]);
    const [allAddons, setallAddons] = useState([]);
    const [orderDetails, setOrderDetails] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [ticketetail, setTicketdetail] = useState("");
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    // const handleShow = (id) => setShow(true);

    const handleShow = (ticketetail) => {
        // do something with the id
        setTicketdetail(ticketetail);
        setShow(true);
    };
    // console.log("ticketetail", ticketetail)

    const handleOnchangedefault = () => {
        setDefault(Default);
    };
    const [validateddefault, setValidateddefault] = useState(false);
    const handleSubmitdefault = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        setValidateddefault(true);
    };


    useEffect(() => {

        if (orderId != undefined) {
            setMyTicketsAnsAddons(orderId);
        }

    }, [orderId]);

    const setMyTicketsAnsAddons = async (orderId) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`https://staging.eboxtickets.com/embedapi/ticketdetail`, {
                orderId
            });
            // console.log("response", response);
            setOrderDetails(response.data.data.orderdetails)
            setAllTickets(response.data.data.tickets);
            setallAddons(response.data.data.addons);
        } catch (error) {
            if (error.response) {
                return error.response.data;
                console.log("No response received:", error.response.data);
            } else if (error) {
                // return error.response.data;
                console.log("No response received:", error.response.data);
            } else {
                return error.message;
            }
        } finally {
            setIsLoading(false); // Set loading state to false when data fetching is done (whether successful or not)
        }
    };

    // console.log('orderDetails', orderDetails);

    // useEffect(() => {

    //     if (id != undefined) {
    //         var MemberURL = `/api/v1/members?id=${id}`
    //         fetch(MemberURL)
    //             .then((response) => response.json())
    //             .then((value) => {
    //                 // console.log("data", value.data)
    //                 setUserdetail(value.data);
    //             })
    //     } else {
    //         console.log("hy")
    //     }

    // }, [id])

    const contentRef = useRef(null);
    const handleDownload = () => {
        if (contentRef.current) {
            html2canvas(contentRef.current).then((canvas) => {
                // console.log("🚀 ~ html2canvas ~ canvas:", contentRef.current);
                // return false;
                const link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.download = 'download.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    };



    //DefaultValidation
    return (
        <div>
            <Seo title={"Form Validations"} />

            {/* <!-- breadcrumb --> */}
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Event Order Detail
                    </span>

                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb className="breadcrumb">
                        <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            className="breadcrumb-item "
                            active
                            aria-current="page"
                        >
                            events
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            className="breadcrumb-item "
                            active
                            aria-current="page"
                        >
                            Order Detail
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <Container>
                <Row>

                    <Col lg={12} md={12}>
                        <Card>
                            <Card.Body>
                                <div>
                                    <h5 className="border-bottom py-2 font-weight-bold my-4"> Order Details</h5>

                                    {orderDetails && (
                                        <Row>
                                            <Col md={6}>
                                                <p><b> Order ID : </b># {orderDetails.OriginalTrxnIdentifier}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><b> Stripe Key : </b>{orderDetails.RRN}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><b> Order Date : </b>{allTickets[0]['purchaseDate']}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><b>Total Amount : </b>{orderDetails.total_amount}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><b>Status : </b>{orderDetails.paymenttype}</p>
                                            </Col>
                                        </Row>
                                    )}


                                    <h5 className="border-bottom py-2 my-4"> Tickets
                                    </h5>

                                    <div className="ticket-row row">

                                        {isLoading ? (
                                            <div >
                                                <Spinner animation="border" role="status" variant="primary" style={{ width: '30px', height: '30px' }}>
                                                    <span className="sr-only">Loading...</span>
                                                </Spinner>
                                            </div>
                                        ) : (

                                            <>
                                                {allTickets.length > 0 ? (
                                                    allTickets.map((indivisulaTicket, index) => (
                                                        <Col md={6} key={index}>
                                                            {/* <a href="/user/my-ticketdetail/?eventid=9"> */}
                                                            <a>
                                                                <div id="ticket">
                                                                    <div className="coupon">
                                                                        <div className="left">
                                                                            <img
                                                                                className="img-fluid h-100"
                                                                                src={indivisulaTicket.qrcode}
                                                                                alt="Image Not Found"
                                                                            />
                                                                        </div>
                                                                        <div className="center ps-3">
                                                                            <h5 className="text-left">{indivisulaTicket.eventName}</h5>
                                                                            <h6>
                                                                                {indivisulaTicket.ticketType}
                                                                            </h6>
                                                                            <p>
                                                                                <strong className="me-2">{indivisulaTicket.purchaseDate}</strong>
                                                                                <br />
                                                                            </p>
                                                                            <a className="btn btn-print" onClick={() => handleShow(indivisulaTicket, index)}>
                                                                                Print Ticket
                                                                            </a>
                                                                            {/* <p>
                                        <strong className="me-2">1 x Wellness Activities </strong>
                                        <br />
                                        <strong className="me-2">1 x Special Dinners</strong>
                                        <br />
                                      </p> */}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        </Col>

                                                    ))
                                                ) : (
                                                    <h4> Ticket not Available</h4>
                                                )}

                                            </>
                                        )}

                                    </div>


                                    <h5 className="border-bottom py-2 my-4"> Addons
                                    </h5>
                                    <div className="ticket-row row">
                                        <>
                                            {allAddons.length > 0 ? (
                                                allAddons.map((indivisulAddon,index) => (
                                                    <Col md={6} key={index}>
                                                        <a>
                                                            <div id="ticket">
                                                                <div className="coupon">
                                                                    <div className="center ps-3">
                                                                        <h5 className="text-left">{indivisulAddon.eventName}</h5>
                                                                        <h6>
                                                                            {indivisulAddon.ticketType}
                                                                        </h6>
                                                                        <p>
                                                                            <strong className="me-2">{indivisulAddon.purchaseDate}</strong>
                                                                            <br />
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </Col>

                                                ))
                                            ) : (
                                                <h4> Addon not Available</h4>
                                            )}

                                        </>
                                    </div>

                                    <Modal
                                        show={show}
                                        size="md"
                                        aria-labelledby="contained-modal-title-vcenter"
                                        centered
                                    >

                                        <Modal.Body >
                                            <div className="outer-bg p-4" ref={contentRef}>
                                                <div className="inner-bg">
                                                    <div className="bg-blur p-3">
                                                        <img className="d-block mb-3 " src={"/assets/img/brand/logo-white.png"} alt="logo" />

                                                        <Row>
                                                            <Col md={7}>
                                                                <div className="ticket_info">
                                                                    <h6>EVENT</h6>
                                                                    <p>{ticketetail.eventName ? ticketetail.eventName : '---'}</p>
                                                                    <h6>DATE</h6>
                                                                    <p>{ticketetail.purchaseDate}</p>

                                                                    <h6>Tickets</h6>
                                                                    <p>{ticketetail.ticketType ? ticketetail.ticketType : '---'}</p>
                                                                </div>
                                                            </Col>
                                                            <Col md={5}>
                                                                <div className="ticket-image">
                                                                    <img className="img-fluid" src={"/assets/img/front-images/ox-montenegro.jpg"} />
                                                                </div>
                                                            </Col>
                                                            <Col md={12}>
                                                                <div className="ticket-img p-5">
                                                                    <img className="img-fluid mx-auto d-block" src={ticketetail.qrcode} />
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </div>
                                            </div>
                                        </Modal.Body>

                                        <Modal.Footer>
                                            <Button
                                                className="btn-danger"
                                                onClick={() => handleDownload()}
                                            >
                                                Download
                                            </Button>
                                            <Button
                                                onClick={() => setShow(false)}
                                            >
                                                Close
                                            </Button>
                                        </Modal.Footer>

                                    </Modal>
                                </div>
                                
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>
            {/* <!--/Row--> */}
        </div>
    );
}

InvitationDetails.propTypes = {};

InvitationDetails.defaultProps = {};

InvitationDetails.layout = "Contentlayout"

export default InvitationDetails;