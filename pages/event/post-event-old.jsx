import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import styles from "@/styles/PostEvent.module.css"; // using the same CSS
import Link from "next/link";
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";
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
import { Breadcrumb, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import moment from "moment-timezone";
import Swal from "sweetalert2";

const PostEvent = () => {
    const siteUrl = process.env.SITE_URL;
    const [isFree, setIsFree] = useState(false);
    const noteRef = useRef(null);
    const [editorData, setEditorData] = useState({ content: "" });
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [currencies, setCurrencies] = useState([]);
    const [isClient, setIsClient] = useState(false);
    const [selectedCounty, setSelectedCounty] = useState("");
    const [country, setCountry] = useState([]);
    const content = getHtmlEditorContent(noteRef);
    const [timeZone, setTimeZone] = useState("Asia/Kolkata");
    const timeZonesList = moment.tz.names(); // List of all time zones
    const [eventType, setEventType] = useState("");

    const [slug, setSlug] = useState("");
    const [shareUrl, setShareUrl] = useState(siteUrl);

    const handleSlugChange = (e) => {
        const inputValue = e.target.value;

        // convert to slug
        const generatedSlug = inputValue
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "") // remove special characters
            .trim()
            .replace(/\s+/g, "-"); // replace spaces with -

        setFormData((prev) => ({
            ...prev,
            slug: generatedSlug,
            shareUrl: `${siteUrl}${generatedSlug}`, // if you keep shareUrl inside formData
        }));
    };


    // Ticket Fee States
    const [ticketPlatformFee, setTicketPlatformFee] = useState('');
    const [ticketStripeFee, setTicketStripeFee] = useState('');
    const [ticketBankFee, setTicketBankFee] = useState('');
    const [ticketProcessingFee, setTicketProcessingFee] = useState('');


    // Fetch currencies on page load
    const fetchCurrencies = async () => {
        // console.log('>>>>>>>>>>>>>>');

        try {
            const response = await axios.get("/api/v1/events/?key=getCurrency");
            if (response.data && response.data.success) {
                setCurrencies(response.data.data); // Adjust the key based on API response structure
            } else {
                console.error("Failed to fetch currencies:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await axios.get("/api/v1/country");
            if (response.data && response.data.success) {
                setCountry(response.data.data); // Adjust the key based on API response structure
            } else {
                console.error("Failed to fetch currencies:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    };

    useEffect(() => {
        setIsClient(true);
        fetchCurrencies();
        fetchCountries();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type == "checkbox"
                    ? checked
                    : type == "file"
                        ? files[0]
                        : value,
        }));
    };


    const [formData, setFormData] = useState({
        companyId: "",
        eventName: "",
        countryId: "",
        location: "",
        eventImage: null,
        eventType: "",
        timeZone: "America/Los_Angeles",
        currencyId: "",
        isFree: false,
        startDate: "",
        endDate: "",
        SaleStartDate: "",
        SaleEndDate: "",
        ticketLimit: "",
        slug: "",
        shareUrl: "",
        approvalDays: "",
        youtubeUrl: "",
        ticketPlatformFee: "",
        ticketStripeFee: "",
        ticketBankFee: "",
        ticketProcessingFee: "",
    });

    // Submit Handler
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);

        // Example: send to API
        const body = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            body.append(key, value);
        });
        body.append('description', content.trim());

        axios.post("/api/v1/front/event/add", body, {
            withCredentials: true, // 👈 include cookies
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
            .then((res) => {
                console.log("Saved:", res.data);
                Swal.fire({
                    icon: "success",
                    // title: "Success!",
                    text: res.data.message,
                    customClass: { popup: "add-tckt-dtlpop" },
                });

            })
            .catch((err) => {
                // console.error("Error:", err.response ? err.response.data : err.message);
                Swal.fire({
                    icon: "error",
                    // title: "Error!",
                    text: err.response.data.message,
                    customClass: { popup: "add-tckt-dtlpop" },
                });
            });
    };

    return (
        <>
            <FrontendHeader />
            <section className={styles.dashboard_section}>
                <div className="container">
                    <div className={`dashboard_pg_btm ${styles.dashboard_pg_btm}`}>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form">
                                    <h2>
                                        <i className="fa fa-calendar-plus"></i>
                                        Post Event
                                    </h2>
                                    <div className="form_inner">
                                        
                                        <Form className="needs-validation" onSubmit={handleSubmit}>

                                            <h4>Event Info</h4>
                                            <section>
                                                <Card className="p-4">
                                                    <Row className="gy-3">
                                                        {/* Company */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="company-id">
                                                                <Form.Label>Company</Form.Label>
                                                                {/* Company */}
                                                                <Form.Select
                                                                    name="companyId"
                                                                    value={formData.companyId}
                                                                    onChange={handleChange}
                                                                    required
                                                                >
                                                                    <option value="">Choose Company</option>
                                                                    <option value="99">Doomshell</option>
                                                                </Form.Select>
                                                                <CButton
                                                                    variant="primary"
                                                                    className="mt-2"
                                                                >
                                                                    Add
                                                                </CButton>
                                                            </Form.Group>
                                                        </Col>

                                                        {/* Event Name */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="event-name">
                                                                <Form.Label>
                                                                    Event Name <span style={{ color: "red" }}>*</span>
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="eventName"
                                                                    value={formData.eventName}
                                                                    onChange={handleChange}
                                                                    placeholder="Event Name"
                                                                    required
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        {/* Country */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="country-id">
                                                                <Form.Label>
                                                                    Country <span style={{ color: "red" }}>*</span>
                                                                </Form.Label>
                                                                <Form.Select
                                                                    name="countryId"
                                                                    value={formData.countryId}
                                                                    onChange={handleChange}
                                                                    required
                                                                >
                                                                    <option value="">Choose Country</option>
                                                                    {country.map((c, index) => (
                                                                        <option key={index} value={c.id}>
                                                                            {c.name}
                                                                        </option>
                                                                    ))}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </Col>

                                                        {/* Location */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="location">
                                                                <Form.Label>
                                                                    Location <span style={{ color: "red" }}>*</span>
                                                                </Form.Label>
                                                                <Form.Control
                                                                    value={formData.location}
                                                                    name="location"
                                                                    onChange={handleChange}
                                                                    type="text"
                                                                    placeholder="Location"
                                                                    required
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        {/* Upload Image */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="event-image">
                                                                <Form.Label>
                                                                    Upload Image{" "}
                                                                    <strong style={{ color: "red" }}>
                                                                        (Size 550×550) * JPG,JPEG,PNG
                                                                    </strong>
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="file"
                                                                    name="eventImage"
                                                                    accept="image/png, image/jpeg"
                                                                    // required
                                                                    onChange={handleChange}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        {/* Event Type */}
                                                        <Col md={4}>
                                                            <CFormLabel htmlFor="EventType">
                                                                Event Type<span style={{ color: "Red" }}>*</span>
                                                            </CFormLabel>
                                                            <select
                                                                name="eventType"
                                                                id="EventType"
                                                                className="form-control"
                                                                required
                                                                value={formData.eventType}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">-Select-</option>
                                                                <option value="1">Without Housing</option>
                                                                <option value="2">With Housing</option>
                                                            </select>
                                                        </Col>

                                                        {/* Time Zone */}
                                                        <Col md={4}>
                                                            <CFormLabel htmlFor="currencyDropdown2">
                                                                Time Zone:<span style={{ color: "Red" }}>*</span>
                                                            </CFormLabel>
                                                            <select
                                                                name="timeZone"
                                                                className="form-control"
                                                                id="currencyDropdown2"
                                                                value={formData.timeZone}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                                                <option value="Asia/Kolkata">Indian Standard Time (IST)</option>
                                                                {timeZonesList.map((zone) => (
                                                                    <option key={zone} value={zone}>
                                                                        {zone}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Col>

                                                        {/* Currency */}
                                                        <CCol md={4}>
                                                            <CFormLabel htmlFor="currencyDropdown">
                                                                Currency <span style={{ color: "red" }}>*</span>
                                                            </CFormLabel>
                                                            <select
                                                                name="currencyId"
                                                                id="currencyDropdown"
                                                                className="form-control"
                                                                required
                                                                value={formData.currencyId}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">-Select-</option>
                                                                {currencies &&
                                                                    currencies.map((currency) => (
                                                                        <option key={currency.id} value={currency.id}>
                                                                            {currency.Currency_symbol} - {currency.Currency}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </CCol>

                                                        {/* Free Event Checkbox */}
                                                        <Col md={4} className="d-flex align-items-center">
                                                            <Form.Check
                                                                type="checkbox"
                                                                name="isFree"
                                                                label="This Event is FREE"
                                                                checked={formData.isFree}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>

                                                        {/* Start Date */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="start-date">
                                                                <Form.Label>
                                                                    Start Date Time <span style={{ color: "red" }}>*</span>
                                                                </Form.Label>
                                                                <InputGroup>
                                                                    <InputGroup.Text>
                                                                        <i className="typcn typcn-calendar-outline"></i>
                                                                    </InputGroup.Text>
                                                                    <Form.Control
                                                                        type="datetime-local"
                                                                        required
                                                                        name="startDate"
                                                                        value={formData.startDate}
                                                                        onChange={handleChange}
                                                                        min={new Date().toISOString().slice(0, 16)}
                                                                    />
                                                                </InputGroup>
                                                            </Form.Group>
                                                        </Col>

                                                        {/* End Date */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="end-date">
                                                                <Form.Label>
                                                                    End Date Time <span style={{ color: "red" }}>*</span>
                                                                </Form.Label>
                                                                <InputGroup>
                                                                    <InputGroup.Text>
                                                                        <i className="typcn typcn-calendar-outline"></i>
                                                                    </InputGroup.Text>
                                                                    <Form.Control
                                                                        type="datetime-local"
                                                                        required
                                                                        name="endDate"
                                                                        value={formData.endDate}
                                                                        onChange={handleChange}
                                                                    />
                                                                </InputGroup>
                                                            </Form.Group>
                                                        </Col>

                                                        {/*Sale Start Date */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="start-date">
                                                                <Form.Label>
                                                                    Sale Start Date Time <span style={{ color: "red" }}>*</span>
                                                                </Form.Label>
                                                                <InputGroup>
                                                                    <InputGroup.Text>
                                                                        <i className="typcn typcn-calendar-outline"></i>
                                                                    </InputGroup.Text>
                                                                    <Form.Control
                                                                        type="datetime-local"
                                                                        required
                                                                        name="SaleStartDate"
                                                                        value={formData.SaleStartDate}
                                                                        onChange={handleChange}
                                                                        min={new Date().toISOString().slice(0, 16)}
                                                                    />
                                                                </InputGroup>
                                                            </Form.Group>
                                                        </Col>

                                                        {/*Sale End Date */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="end-date">
                                                                <Form.Label>
                                                                    Sale End Date Time <span style={{ color: "red" }}>*</span>
                                                                </Form.Label>
                                                                <InputGroup>
                                                                    <InputGroup.Text>
                                                                        <i className="typcn typcn-calendar-outline"></i>
                                                                    </InputGroup.Text>
                                                                    <Form.Control
                                                                        type="datetime-local"
                                                                        required
                                                                        name="SaleEndDate"
                                                                        value={formData.SaleEndDate}
                                                                        onChange={handleChange}
                                                                    />
                                                                </InputGroup>
                                                            </Form.Group>
                                                        </Col>

                                                        {/* Ticket Limit */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="ticket-limit">
                                                                <Form.Label>Ticket Limit per Person</Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="1"
                                                                    name="ticketLimit"
                                                                    value={formData.ticketLimit}
                                                                    onChange={handleChange}
                                                                    placeholder="Enter ticket limit"
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        {/* URL Slug */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="url-slug">
                                                                <Form.Label>
                                                                    URL Slug <span style={{ color: "red" }}>*</span>
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="slug"
                                                                    value={formData.slug}
                                                                    onChange={handleSlugChange}
                                                                    placeholder="Enter URL slug"
                                                                    required={!formData.slug}
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        {/* Share URL */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="share-url">
                                                                <Form.Label>Share URL</Form.Label>
                                                                <Form.Control
                                                                    type="url"
                                                                    name="shareUrl"
                                                                    value={formData.shareUrl}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        {/* Approval Expiry Days */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="approval-days">
                                                                <Form.Label>Approval Expiry Days</Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="1"
                                                                    name="approvalDays"
                                                                    value={formData.approvalDays}
                                                                    onChange={handleChange}
                                                                    placeholder="Enter days"
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        {/* YouTube URL */}
                                                        <Col md={4}>
                                                            <Form.Group controlId="youtube-url">
                                                                <Form.Label>YouTube URL</Form.Label>
                                                                <Form.Control
                                                                    type="url"
                                                                    name="youtubeUrl"
                                                                    value={formData.youtubeUrl}
                                                                    onChange={handleChange}
                                                                    placeholder="https://youtube.com/..."
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        {/* ===== Ticket Fee Section ===== */}
                                                        <CCol xs={12} className="border-bottom pb-2 mb-1">
                                                            <h6 className="fw-bold"> Fee Details</h6>
                                                        </CCol>

                                                        <CCol lg={3} md={6}>
                                                            <CFormLabel htmlFor="ticketPlatformFee">Ticket Platform Fee (%)</CFormLabel>
                                                            <CFormInput
                                                                type="number"
                                                                name="ticketPlatformFee"
                                                                value={formData.ticketPlatformFee}
                                                                onChange={handleChange}
                                                                placeholder="Enter ticket platform fee"
                                                            />
                                                        </CCol>

                                                        <CCol lg={3} md={6}>
                                                            <CFormLabel htmlFor="ticketStripeFee">Stripe Fee (%)</CFormLabel>
                                                            <CFormInput
                                                                type="number"
                                                                name="ticketStripeFee"
                                                                value={formData.ticketStripeFee}
                                                                onChange={handleChange}
                                                                placeholder="Enter stripe fee for ticket"
                                                            />
                                                        </CCol>

                                                        <CCol lg={3} md={6}>
                                                            <CFormLabel htmlFor="ticketBankFee">Bank Fee (%)</CFormLabel>
                                                            <CFormInput
                                                                type="number"
                                                                name="ticketBankFee"
                                                                value={formData.ticketBankFee}
                                                                onChange={handleChange}
                                                                placeholder="Enter bank fee for ticket"
                                                            />
                                                        </CCol>

                                                        <CCol lg={3} md={6}>
                                                            <CFormLabel htmlFor="ticketProcessingFee">Processing Fee (%)</CFormLabel>
                                                            <CFormInput
                                                                type="number"
                                                                name="ticketProcessingFee"
                                                                value={formData.ticketProcessingFee}
                                                                onChange={handleChange}
                                                                placeholder="Enter processing fee for ticket"
                                                            />
                                                        </CCol>

                                                        {/* Description */}
                                                        <Col md={12}>
                                                            <Form.Group controlId="description">
                                                                <Form.Label>Event Description</Form.Label>
                                                                <div >
                                                                    <HtmlEditor
                                                                        editorRef={noteRef}
                                                                        initialContent={editorData.content}
                                                                        onChange={(content) => editorData({ ...editorData, content })}
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    {/* Submit Button */}
                                                    <div className="mt-3">
                                                        <CButton color="primary" type="submit">
                                                            Submit
                                                        </CButton>
                                                    </div>
                                                </Card>
                                            </section>
                                        </Form>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div >
                </div >

            </section >
            <FrontendFooter />

        </>
    )
}

export default PostEvent