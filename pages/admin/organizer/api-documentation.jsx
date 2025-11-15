import React, { useRef } from "react";
import { Card, Row, Col, Accordion, Badge, Button } from "react-bootstrap";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const apiKey = "28a27307756ad7d153cb2ea460f3559befd868f8ced421be2c744f1278f75f2a";

const ApiDocumentation = () => {
    const baseUrl = "https://saas.eboxtickets.com/api";
    const liveBaseUrl = "{{BASE_URL}}";

    const docRef = useRef();

    const apis = [
        {
            title: "Fetch Cart Items",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/front/cart?userId=10315`,
            description: "Retrieve all items currently in the cart for the specified user.",
        },
        {
            title: "Add Item to Cart",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/front/cart`,
            description: "Add a ticket or addon to the user's cart.",
            body: {
                userId: 10315,
                eventId: 111,
                ticketId: 312,
                ticket_type: "ticket",
                symbol: "+",
            },
        },
        {
            title: "Delete Cart Item",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/front/cart?action=delete_cart_item&cartId=19302`,
            description: "Remove a specific item from the cart using the cart ID.",
        },
        {
            title: "Validate Coupon Code",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/front/validate-coupon?couponCode=FFF&action=is_valid&userId=10315&eventId=111`,
            description: "Check if a coupon code is valid for the specified user and event.",
        },
        {
            title: "Fetch Housing Information",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/front/cart?key=info&property_id=377&EventID=111`,
            description: "Retrieve housing details for the selected property and event.",
        },
        {
            title: "Get Event Details",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/events/111`,
            description: "Fetch detailed information for a specific event.",
        },
        {
            title: "Get User Order List",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/front/orders/10315`,
            description: "Retrieve all orders placed by a specific user.",
        },
        {
            title: "Get User Ticket List",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/front/user-tickets/10315`,
            description: "Retrieve all tickets associated with a specific user.",
        },
        {
            title: "Get Admin Order List",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/admin/orders`,
            description: "Fetch the list of orders for admin, optionally filtered by event name.",
            body: {
                eventName: "ONDALINDA x CAREYES 2025"
            }
        },
        {
            title: "Get Admin Order Details",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/admin/orders`,
            description: "Fetch detailed information for a specific order including tickets and addons.",
            body: {
                orderId: "M-10315-2121",
                type: "all", // ticket , addon
                key: "searchOrderDetails"
            }
        },
        {
            title: "Admin Sales Ticket Report",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/dashboard`,
            description: "Generate sales report for tickets for a specific event.",
            body: {
                key: "sale_ticket_reports",
                eventId: "111"
            }
        },
        {
            title: "Admin Ticket List Export",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/orders`,
            description: "Export ticket list filtered by scanned or cancelled status.",
            body: {
                scanned: "cancelled",
                key: "ticketExport",
                event_id: "110"
            }
        },
        {
            title: "Event List with Ticket Sales Count",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/events?key=event_ticket_sale_count`,
            description: "Retrieve all events along with their ticket sales count for admin.",
        },
        {
            title: "Finance Tab Summary for Events",
            method: "GET",
            endpoint: `${liveBaseUrl}/v3/events?key=get_summary`,
            description: "Get summarized finance information for all events or a single event for admin.",
        },
        {
            title: "Synchronize Housing Data",
            method: "POST",
            endpoint: `${liveBaseUrl}/sync-housing`,
            description: "Synchronize housing data from a third-party platform including housing info, events, ticket types, and addons.",
        },
        {
            title: "Staff Login for Ticket Scanning",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/front/auth`,
            description: "Authenticate staff user for ticket scanning.",
            body: {
                email: "akshay+1@doomshell.com",
                password: "M@$!er",
                action: "login"
            }
        },
        {
            title: "Scan Ticket via Mobile",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/front/scantickets`,
            description: "Scan a ticket from a mobile device for staff.",
            body: {
                user_id: 10315,
                order_id: 11,
                ticketdetail_id: 11,
                tickettype: "ticket",
                scannerId: 12440,
                key: "scanTickets"
            }
        },
        {
            title: "Coupon Code List",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/orders`,
            description: "Coupon Code List for Admin.",
            body: {
                "key": "PromotionCodes",
                "eventName": "ONDALINDA x CAREYES 2025"
            }
        },
        {
            title: "Order Create",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/front/create-order`,
            description: "For create order need to send data in body every thing in the body the ticket is crete even accommodation",
            body: {
                "paymentIntentId": "pi_3SBGBaFEjngFr9300GCOT9fs",
                "amount": 7703,
                "currency": "usd",
                "status": "succeeded",
                "cartData": [
                    {
                        "cartId": 19344,
                        "ticketType": "ticket",
                        "noTickets": 1,
                        "ticketId": 312,
                        "price": 2900
                    },
                    {
                        "cartId": 19345,
                        "ticketType": "addon",
                        "noTickets": 1,
                        "ticketId": 8,
                        "price": 250
                    }
                ],
                "couponDetails": {},
                "eventId": 111,
                "userId": 10272,
                "adminFees": 10.75,
                "donationFees": 0,
                "propertyDetailsObj": {
                    "propertyId": 378,
                    "no_of_bedrooms": 2,
                    "totalAccommodationAmount": 4204,
                    "arrivalDate": "2025-11-06",
                    "departureDate": "2025-11-10",
                    "totalNight": 4,
                    "perNightOwnerAmount": 853.16,
                    "nightlyPrice": 968.66,
                    "basePriceHousing": 770
                },
                "totalTax": 678,
                "finalPrice": 7703,
                "isExtension": null,
                "selectedPaymentOption": "full",
                "OriginalTrxnIdentifier": null
            }
        },
        {
            title: "Create Payment Intent",
            method: "POST",
            endpoint: `${liveBaseUrl}/v3/front/create-payment-intent`,
            description:
                "Create a payment intent for checkout, including tickets, addons, and taxes.",
            body: {
                "userId": 10315,
                "eventId": 111,
                "email": "tech+1@ashwalabs.com",
                "currency": "USD",
                "adminFees": 10.75,
                "donationFees": 0,
                "couponDetails": "",
                "breakdown": {
                    "fees": {
                        "ticket": {
                            "platform": 72.5,
                            "bank": 75.4,
                            "processing": 79.75,
                            "stripe": 93.41,
                            "total": 321.06
                        },
                        "addon": {
                            "platform": 6.25,
                            "bank": 6.5,
                            "processing": 6.88,
                            "stripe": 8.05,
                            "total": 27.68
                        },
                        "accommodationPaymentBreakdown": {
                            "nights": 4,
                            "basePriceHousing": 0,
                            "accommodationServiceFeeAmount": 0,
                            "accommodationMexicanVATAmount": 0,
                            "accomTaxAmount": 0,
                            "ondalindaFeeAmount": 0,
                            "totalAfterTaxes": 0,
                            "propertyOwnerAmount": 0,
                            "nightlyRate": 0,
                            "accommodationBankFee": 0,
                            "accommodationProcessingFee": 0,
                            "accommodationStripeFee": 0
                        },
                        "accommodation": {
                            "bank": 0,
                            "processing": 0,
                            "stripe": 0,
                            "total": 0
                        }
                    },
                    "ticketTaxBreakdown": {
                        "totalTax": 349,
                        "ticketPlatformFee": 78.75,
                        "ticketStripeFee": 101.46,
                        "ticketBankFee": 81.9,
                        "ticketProcessingFee": 86.63,
                        "nights": 4,
                        "accommodation_basePerDaysPriceHousing": 0,
                        "accommodationPerDaysPropertyOwnerAmount": 0,
                        "accommodation_nightlyPerDaysRate": 0,
                        "accommodationOndalindaPerDaysTotalAfterTaxes": 0,
                        "accommodationPerDaysServiceFeeAmount": 0,
                        "accommodationPerDaysMexicanVATAmount": 0,
                        "accommodationPerDaysTaxAmount": 0,
                        "accommodationOndalindaPerDaysFeeAmount": 0,
                        "accommodationBankFee": 0,
                        "accommodationProcessingFee": 0,
                        "accommodationStripeFee": 0
                    },
                    "ticketTotal": 2900,
                    "addonTotal": 250,
                    "accommodationTotal": 0,
                    "ticketTax": 321.06,
                    "addonTax": 27.68,
                    "accommodationTax": 0,
                    "halfAccommodation": 0,
                    "ticketingFeeDetails": {
                        "ticket_platform_fee_percentage": 2.5,
                        "ticket_stripe_fee_percentage": 2.9,
                        "ticket_bank_fee_percentage": 2.6,
                        "ticket_processing_fee_percentage": 2.75
                    },
                    "totalTicketPrice": 2900,
                    "totalAddonPrice": 250,
                    "totalAccommodationPriceWithTaxes": 0,
                    "nightlyRateWithTaxes": 0,
                    "totalAccommodationBasePrice": 0,
                    "totalTicketAndAddonPrice": 3150,
                    "partialAccommodationWithTax": 0,
                    "ticket": 2900,
                    "addon": 250,
                    "totalAccommodationPrice": 0,
                    "finalAmount": 3499,
                    "totalTax": 349,
                    "partialPayableTax": 349,
                    "partialAmount": 0,
                    "payableAmount": 3499,
                    "partialPayableAmount": 3499,
                    "partialAccommodationAmount": 0,
                    "partialAccommodationTax": 0,
                    "nights": 4,
                    "basePriceHousing": 0,
                    "accommodationServiceFeeAmount": 0,
                    "accommodationMexicanVATAmount": 0,
                    "accomTaxAmount": 0,
                    "ondalindaFeeAmount": 0,
                    "totalAfterTaxes": 0,
                    "propertyOwnerAmount": 0,
                    "nightlyRate": 0,
                    "discountAmount": 0
                },
                "name": "Tech Team1",
                "amount": 3499,
                "totalTax": 349,
                "cart": [
                    {
                        "id": 19327,
                        "user_id": 10315,
                        "event_id": 111,
                        "addons_id": null,
                        "ticket_id": 312,
                        "ticket_type": "ticket",
                        "no_tickets": 1,
                        "description": null,
                        "status": "Y",
                        "createdAt": "2025-09-24T07:14:20.000Z",
                        "updatedAt": "2025-09-24T08:23:16.000Z",
                        "EventTicketType": {
                            "title": "LATE TIME BIRD",
                            "price": 2900,
                            "count": 600
                        },
                        "Addon": null,
                        "Event": {
                            "Name": "ONDALINDA x CAREYES 2025",
                            "ImageURL": "ImageURL_1747657088180.jpg",
                            "StartDate": "2025-11-06T16:56:00.000Z",
                            "EndDate": "2025-11-09T16:56:00.000Z",
                            "Currency": {
                                "Currency": "USD",
                                "Currency_symbol": "$"
                            }
                        }
                    },
                    {
                        "id": 19329,
                        "user_id": 10315,
                        "event_id": 111,
                        "addons_id": 8,
                        "ticket_id": null,
                        "ticket_type": "addon",
                        "no_tickets": 1,
                        "description": null,
                        "status": "Y",
                        "createdAt": "2025-09-24T08:23:19.000Z",
                        "updatedAt": "2025-09-24T08:23:32.000Z",
                        "EventTicketType": null,
                        "Addon": {
                            "name": "TRANSPORTATION PASS",
                            "price": 250,
                            "count": 250
                        },
                        "Event": {
                            "Name": "ONDALINDA x CAREYES 2025",
                            "ImageURL": "ImageURL_1747657088180.jpg",
                            "StartDate": "2025-11-06T16:56:00.000Z",
                            "EndDate": "2025-11-09T16:56:00.000Z",
                            "Currency": {
                                "Currency": "USD",
                                "Currency_symbol": "$"
                            }
                        }
                    }
                ]
            },
        },
    ];

    // 📘 Generate proper text-based PDF
    const handleDownloadPDF = () => {
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const margin = 10;
        let y = 20;
        const pageHeight = 297;

        // Title
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80);
        doc.text("SaaS API Documentation", margin, y);
        y += 12;

        // API Key
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text("All API requests require this header:", margin, y);
        y += 6;
        doc.setTextColor(0, 0, 255);
        doc.setFont("courier", "normal");
        doc.text(`x-api-key: ${apiKey}`, margin, y);
        y += 10;

        // Base URL
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        doc.text("Base URL:", margin, y);
        y += 6;
        doc.setFont("courier", "normal");
        doc.text(liveBaseUrl, margin, y);
        y += 10;

        apis.forEach((api, i) => {
            // Check page break
            if (y > pageHeight - 50) {
                doc.addPage();
                y = 20;
            }

            // API Title
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 60, 120);
            doc.setFontSize(13);
            doc.text(`${i + 1}. ${api.title}`, margin, y);
            y += 6;

            // Method
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(api.method === "GET" ? 0 : 0);
            doc.text(`Method: ${api.method}`, margin, y);
            y += 6;

            // Endpoint
            doc.setFont("courier", "normal");
            doc.setTextColor(0, 0, 255);
            const splitEndpoint = doc.splitTextToSize(api.endpoint, 180);
            doc.text("Endpoint:", margin, y);
            y += 6;
            doc.text(splitEndpoint, margin + 10, y);
            y += splitEndpoint.length * 6;

            // Description
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50);
            const splitDesc = doc.splitTextToSize(api.description, 180);
            doc.text("Description:", margin, y);
            y += 6;
            doc.text(splitDesc, margin + 10, y);
            y += splitDesc.length * 6;

            // Request Body
            if (api.body) {
                if (y > pageHeight - 60) {
                    doc.addPage();
                    y = 20;
                }
                doc.setTextColor(0);
                doc.text("Example Request Body:", margin, y);
                y += 6;
                const jsonBody = JSON.stringify(api.body, null, 2);
                const splitBody = doc.splitTextToSize(jsonBody, 180);
                doc.setFont("courier", "normal");
                doc.setTextColor(60, 60, 60);
                splitBody.forEach((line) => {
                    if (y > pageHeight - 10) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, margin + 10, y);
                    y += 5;
                });
                y += 4;
            }

            // Divider
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, 200, y);
            y += 8;
        });

        doc.save("SaaS_API_Documentation.pdf");
    };


    return (
        <>
            <Seo title={"API Documentation"} />

            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <Card className="shadow-lg border-0">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 px-4 border-bottom">
                            <h4 className="card-title mb-0 text-primary d-flex align-items-center gap-2">
                                🧾 API Documentation
                            </h4>
                            <div className="d-flex gap-2">
                                <Button variant="outline-primary" size="sm" onClick={handleDownloadPDF}>
                                    📥 Download API Doc (PDF)
                                </Button>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-4" ref={docRef}>
                            <p className="text-muted mb-4">
                                This documentation provides all endpoints for managing the cart flow: fetching, adding, deleting, applying coupons, and payment intent creation.
                            </p>

                            {/* Base URL & Authentication Section */}
                            <div className="bg-light border-start border-5 border-primary p-3 rounded mb-5 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                                <div className="flex-fill">
                                    <strong>Base URL:</strong>
                                    <pre className="mt-2 mb-0 bg-dark text-white p-2 rounded text-break">
                                        <code>{baseUrl}</code>
                                    </pre>
                                </div>

                                <div className="flex-fill">
                                    <strong>Authentication Header:</strong>
                                    <pre className="mt-2 mb-0 bg-dark text-white p-2 rounded text-break">
                                        <code>x-api-key: {apiKey}</code>
                                    </pre>
                                </div>
                            </div>

                            {/* API Endpoints Header */}
                            <div className="mb-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 text-primary">🛠️ API Endpoints</h5>
                                <Badge bg="secondary">{apis.length} APIs</Badge>
                            </div>

                            {/* GET Endpoints */}
                            {apis.filter(api => api.method === "GET").map((api, index) => (
                                <div key={index} className="mb-3 border rounded shadow-sm bg-light p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-semibold text-primary">{api.title}</span>
                                        <Badge bg="info">{api.method}</Badge>
                                    </div>
                                    <p className="text-secondary mb-2">{api.description}</p>
                                    <div className="d-flex align-items-start border rounded bg-white p-2 shadow-sm">
                                        <strong className="me-2">Endpoint:</strong>
                                        <code className="text-break">{api.endpoint}</code>
                                    </div>
                                </div>
                            ))}

                            {/* POST / Other Endpoints */}
                            <Accordion alwaysOpen>
                                {apis.filter(api => api.method !== "GET").map((api, index) => (
                                    <Accordion.Item eventKey={index.toString()} key={index} className="mb-3 border rounded shadow-sm">
                                        <Accordion.Header className="py-2 fs-6 d-flex justify-content-between align-items-center">
                                            <span className="fw-semibold text-primary p-2">{api.title}</span>
                                            <Badge bg={api.method === "POST" ? "success" : "danger"} className="fs-6">{api.method}</Badge>
                                        </Accordion.Header>

                                        <Accordion.Body className="bg-light p-3">
                                            <p className="text-secondary mb-3">{api.description}</p>

                                            {/* Endpoint */}
                                            <div className="d-flex align-items-start border rounded bg-white p-2 mb-2 shadow-sm">
                                                <strong className="me-2">Endpoint:</strong>
                                                <code className="text-break">{api.endpoint}</code>
                                            </div>

                                            {/* Request Body */}
                                            {api.body && (
                                                <div className="border rounded bg-white p-2 shadow-sm">
                                                    <strong>Request Body:</strong>
                                                    <pre className="mt-2 mb-0 bg-dark text-white p-2 rounded overflow-auto">
                                                        {JSON.stringify(api.body, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Card.Body>


                    </Card>
                </Col>
            </Row>

        </>
    );
};

ApiDocumentation.layout = "Contentlayout";
export default ApiDocumentation;
