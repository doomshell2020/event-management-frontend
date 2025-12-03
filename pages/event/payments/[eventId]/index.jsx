import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import { Eye, EyeOff, Lock, Settings, CheckCircle, XCircle, Ticket } from "lucide-react";
import { Form, Button, Modal } from "react-bootstrap";

const ManagePayments = () => {
    const router = useRouter();
    const { eventId } = router.query;
    const [eventDetails, setEventDetails] = useState(null);
    const [isOpenWiggins, setIsOpenWiggins] = useState(false);
    const [show, setShow] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState([]);
    // console.log('orderData :', orderData);

    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });

            if (res.data.success && res.data.data.events.length > 0) {
                const event = res.data.data.events[0];
                setEventDetails(event);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) fetchEventDetails(eventId);
        if (eventId) fetchOrders(eventId);
    }, [eventId]);

    const fetchOrders = async (eventId) => {
        setLoading(true); // start loading
        try {
            const res = await api.get(`/api/v1/orders?eventId=${eventId}`);
            if (res.data.success) {
                setOrderData(res.data.data || []);
            } else {
                setOrderData([]);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setOrderData([]);
        } finally {
            setLoading(false); // stop loading after API call
        }
    };

    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    {/* Dummy Payment Data */ }
    const paymentData = [
        {
            customerName: "Rohit",
            orderNo: 4344,
            tickets: 1,
            amount: "10.00",
            currency: "TTD",
            paymentMethod: "Cash",
            date: "13 Nov 2024"
        },
        {
            customerName: "Aarav",
            orderNo: 5521,
            tickets: 2,
            amount: "25.00",
            currency: "TTD",
            paymentMethod: "Card",
            date: "16 Nov 2024"
        },
        {
            customerName: "Sophia",
            orderNo: 5522,
            tickets: 3,
            amount: "50.00",
            currency: "USD",
            paymentMethod: "Online",
            date: "20 Nov 2024"
        }
    ];

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    {/* Sidebar */}
                    <EventSidebar eventId={eventId} />
                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg edit-event-page">
                                <EventHeaderSection eventDetails={eventDetails} isProgressBarShow={false} />
                                <h4 className="text-24">Payments</h4>
                                <hr className="custom-hr" />
                                <div className="stripe-table mt-4">
                                    <table className="table align-middle">
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Tickets</th>
                                                <th>Total Amount</th>
                                                <th>Payment Type</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {orderData.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: "1px solid #eaeaea" }}>

                                                    {/* Customer + Order */}
                                                    <td>
                                                        <div className="fw-bold">{item.customerName}</div>
                                                        <small className="text-muted">Order : {item.order_uid}</small>
                                                    </td>

                                                    {/* Tickets */}
                                                    <td className="fw-bold">{item.orderItems.length}</td>

                                                    {/* Amount */}
                                                    <td className="fw-bold">
                                                        {item.total_amount}
                                                    </td>

                                                    {/* Payment Method */}
                                                    <td>{item.paymentMethod}</td>

                                                    {/* Date */}
                                                    <td>{item.createdAt}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>



                            </section>
                        </div>
                    </div>
                </div>
            </section>
            <FrontendFooter />
        </>
    );
};

export default ManagePayments;
