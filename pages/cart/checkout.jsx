import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";



const Cart = () => {
    const [backgroundImage] = useState("https://eboxtickets.com/images/about-slider_bg.jpg");

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="cart">
                <div className="container">
                    <div className="section-heading">
                        <h2 className="text-start">Checkout</h2>
                    </div>
                    <div className="cart-details mx-auto mb-0">
                        <div className="row">
                            <div className="col-md-8">
                                <div className="cart-item">
                                    <div className="row item_heading text-white">
                                        <div className="col-6">
                                            <p className="mb-0">Event</p>
                                        </div>
                                        <div className="col-3">
                                            <p className="mb-0">Price</p>
                                        </div>
                                        <div className="col-3 text-center">
                                            <p className="mb-0">Remove</p>
                                        </div>
                                    </div>
                                    <div className="row item-list align-items-center">
                                        <div className="col-6">
                                            <p className="heading-text mb-0">IFRS UPDATE 2025</p>
                                            <span className="sub-text mb-0">Member</span>
                                        </div>

                                        <div className="col-3">
                                            <p className="mb-0">$200.00 USD</p>
                                        </div>

                                        <div className="col-3 text-center">
                                            <a href="#" className="delete-btn" aria-label="Remove item">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#e62d56" className="icon-trash" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="row item-list align-items-center">
                                        <div className="col-6">
                                            <p className="p_h mb-0">Event Name</p>
                                            <span className="span_h">Member / Non-member</span>
                                        </div>
                                        <div className="col-3">
                                            <p className="mb-0">$250.00 USD</p>
                                        </div>
                                        <div className="col-3 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#e62d56" className="bi bi-trash" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                                            </svg>
                                        </div>
                                    </div>

                                </div>
                                <hr style={{ margin: "auto", width: "92%", borderColor: "rgba(0,0,0,0.1)" }} />
                            </div>

                            <div className="col-md-4">
                                <div className="total_items">
                                    <h4>Total: 2 items</h4>
                                    <div className="cart_price">
                                        <p className="d-flex justify-content-between">
                                            Price <span>$450.00</span>
                                        </p>
                                        <hr />
                                        <p className="d-flex justify-content-between">
                                            Fee (8%) <span>$36.00</span>
                                        </p>
                                        <hr />
                                        <h6 className="d-flex justify-content-between">
                                            Total <span>$486.00</span>
                                        </h6>
                                    </div>
                                    <hr />
                                    <div className="cart-inputbox">
                                        <h6 className="text-uppercase text-black">
                                            Card number
                                        </h6>

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

export default Cart;