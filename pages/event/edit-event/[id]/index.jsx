import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
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
import api from "@/utils/api";
import { useRouter } from "next/router";
import { formatDateTime, formatDateTimeShort } from "@/utils/formatDate";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import Spinner from "@/pages/components/Spinner";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";


const MyEventsPage = () => {
    const router = useRouter();
    const { id } = router.query; // ✅ get id from route like /event/edit-event/123
    const [isOpen, setIsOpen] = useState(false);
    const [isLeftRight, setIsLeftRight] = useState(false);
    const [isOpenWiggins, setIsOpenWiggins] = useState(false);
    const [eventDetails, setEventDetails] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [countries, setCountries] = useState([]);
    const [timezones, setTimezones] = useState([]);
    const [loading, setLoading] = useState(true);

    const noteRef = useRef(null);
    const [editorData, setEditorData] = useState({ content: "" });

    const [isFormSubmit, setIsFormSubmit] = useState(false);
    // ✅ Form state (binds with input fields)
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        company_id: "",
        country_id: "",
        slug: "",
        video_url: "",
        date_from: "",
        date_to: "",
        sale_start: "",
        sale_end: "",
        payment_currency: "",
        ticket_limit: "",
        approve_timer: "",
        event_timezone: "",
        desp: "",
        is_free: "",
        allow_register: "",
        entry_type: "multi"
    });

    const [image, setImage] = useState(null);
    const [isFree, setIsFree] = useState(false);
    const [slugError, setSlugError] = useState("");

    useEffect(() => {
        if (id) {
            fetchEventDetails(id);
        }
    }, [id]);

    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });

            if (res.data.success && res.data.data.events.length > 0) {
                const event = res.data.data.events[0];
                setEventDetails(event);

                // ✅ Set formData state with event details
                setFormData({
                    name: event.name || "",
                    location: event.location || "",
                    company_id: event.company_id || "",
                    country_id: event.country_id || "",
                    slug: event.slug || "",
                    video_url: event.video_url || "",
                    date_from: "", // ✅ empty by default
                    date_to: "",
                    sale_start: "",
                    sale_end: "",
                    payment_currency: event.payment_currency || "",
                    event_timezone: event.event_timezone || "",
                    ticket_limit: event.ticket_limit || "",
                    approve_timer: event.approve_timer || "",
                    is_free: event.is_free == "Y" ? "Y" : "N",
                    allow_register: event.allow_register == "Y" ? "Y" : "N",
                    entry_type: event.entry_type
                });

                // console.log('entry_type :', formData);
                setEditorData({ content: event.desp || "" });
                // ✅ Set checkbox states if applicable
                setIsFree(event.is_free == "Y");
            } else {
                console.error("Event not found");
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch countries
                const countryRes = await api.get("/api/v1/common/list?key=country");
                if (countryRes.data?.success && Array.isArray(countryRes.data.data?.data)) {
                    setCountries(countryRes.data.data.data);
                }

                // Fetch companies
                const companyRes = await api.get("/api/v1/events/company-list");
                if (companyRes.data?.success && Array.isArray(companyRes.data.data?.companies)) {
                    setCompanies(companyRes.data.data.companies);
                }

                // ✅ Use moment-timezone to get timezone list
                const tzList = moment.tz.names();
                setTimezones(tzList.map((tz) => ({ id: tz, name: tz })));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name == "slug") {
            const formatted = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            setFormData({ ...formData, slug: formatted });

            // ✅ live validate
            const errorMsg = validateSlug(formatted);
            setSlugError(errorMsg || "");
            return;
        }

        if (name == "is_free") {
            setIsFree(checked);
            setFormData({ ...formData, [name]: checked ? "Y" : "N" });
        } else if (name == "allow_register") {
            setFormData({ ...formData, [name]: checked ? "Y" : "N" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateSlug = (slug) => {
        if (!slug || slug.trim() === "") {
            return "Slug is required";
        }
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return "Slug must contain only lowercase letters, numbers, and hyphens";
        }
        return null;
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsFormSubmit(true);

        // ✅ Slug validation
        const slugError = validateSlug(formData.slug);
        if (slugError) {
            Swal.fire({
                icon: "error",
                title: "Validation Error",
                text: slugError,
            });
            setIsFormSubmit(false);
            return;
        }

        // console.log('formData :', formData);
        try {
            const fd = new FormData();

            // ✅ Append only non-empty fields
            Object.entries(formData).forEach(([key, value]) => {
                if (
                    value != null &&
                    value != undefined &&
                    value != "" &&
                    !(typeof value == "object" && Object.keys(value).length == 0)
                ) {
                    fd.append(key, value);
                }
            });
            const content = getHtmlEditorContent(noteRef).trim();
            // ✅ Append image only if present
            if (image) fd.append("feat_image", image);
            fd.append("desp", content);

            const endpoint =
                formData.is_free == "Y"
                    ? `/api/v1/events/update/${id}`
                    : `/api/v2/events/update/${id}`;

            // console.log('endpoint :', endpoint);
            const response = await api.put(endpoint, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const resData = response.data;

            if (resData?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Event Updated",
                    text: resData?.message || "Event updated successfully!",
                    timer: 1500,
                    showConfirmButton: false,
                });

                // ✅ Refresh the event details after update
                await fetchEventDetails(id);

                // ✅ Reset image state to prevent duplicate uploads
                setImage(null);
            }
        } catch (error) {
            const errData = error?.response?.data?.error;
            if (errData?.details?.length) {
                const errorList = errData.details
                    .map((err) => `<li><strong>${err.path}</strong>: ${err.msg}</li>`)
                    .join("");
                Swal.fire({
                    icon: "error",
                    title: "Validation Errors",
                    html: `<ul style="text-align:left; padding-left:20px;">${errorList}</ul>`,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: errData?.message || "Something went wrong. Please try again.",
                });
            }
        } finally {
            setIsFormSubmit(false);
        }
    };

    const handleImagePreview = () => {
        const imageUrl = eventDetails?.feat_image || eventDetails?.image_url;

        if (!imageUrl) {
            Swal.fire({
                icon: "info",
                title: "No Image Found",
                text: "This event does not have an image yet.",
            });
            return;
        }

        Swal.fire({
            imageUrl: imageUrl.startsWith("http")
                ? imageUrl
                : `${process.env.NEXT_PUBLIC_BASE_URL || ""}${imageUrl}`,
            imageWidth: 400,
            imageHeight: 400,
            imageAlt: "Event Image",
            showConfirmButton: false,  // ✅ hides the "Close" button
            showCloseButton: true,     // ✅ shows the "X" icon at the top-right
            // background: "#db4848cc",   // optional: adds a dim background
            customClass: {
                popup: "rounded-lg shadow-lg p-0",
                closeButton: "text-white bg-transparent position-absolute top-2 right-2 fs-5",
            },
        });
    };


    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const [dateErrors, setDateErrors] = useState({});
    const validatePaidEventDates = (data) => {
        const errors = {};

        const {
            date_from,
            date_to,
            sale_start,
            sale_end
        } = data;

        // Event Start < Event End
        if (date_from && date_to && new Date(date_to) < new Date(date_from)) {
            errors.date_to = "Event End must be after Event Start";
        }

        // Sale Start < Sale End
        if (sale_start && sale_end && new Date(sale_end) < new Date(sale_start)) {
            errors.sale_end = "Sale End must be after Sale Start";
        }

        // Sale Start <= Event Start
        if (sale_start && date_from && new Date(date_from) < new Date(sale_start)) {
            errors.date_from = "Event Start cannot be before Sale Start";
        }

        // Sale End <= Event End
        if (sale_end && date_to && new Date(sale_end) > new Date(date_to)) {
            errors.sale_end = "Sale End cannot be after Event End";
        }

        return errors;
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;

        let updatedForm = {
            ...formData,
            [name]: value
        };

        // 🔁 If Event dates change → reset Sale dates
        if (name == "date_from" || name == "date_to") {
            updatedForm.sale_start = "";
            updatedForm.sale_end = "";
        }

        setFormData(updatedForm);

        // ✅ Validate only for PAID events
        if (!isFree) {
            const errors = validatePaidEventDates(updatedForm);
            setDateErrors(errors); // replaces old errors (no stuck red)
        }
    };


    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">

                    {/* left menu */}
                    <EventSidebar eventId={id} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            {loading || !eventDetails ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <div className="mt-3">
                                        {loading ? "Loading event details..." : "No event found."}
                                    </div>
                                </div>
                            ) : (
                                <section id="post-eventpg">

                                    <EventHeaderSection eventDetails={eventDetails} />

                                    <h4 className="text-24">Manage Event Settings </h4>
                                    <hr className="custom-hr" />
                                    <p className="text-14 text-dark">You can manage all your event settings here.</p>

                                    <ul className="tabes d-flex ps-0">
                                        <li>
                                            <a href="#" className="active text-16">
                                                Settings
                                            </a>
                                        </li>
                                    </ul>

                                    <div className="contant_bg">
                                        <h6>Event Settings</h6>
                                        <form onSubmit={handleSubmit}>

                                            <div className="resistor-content">
                                                <div className="row g-3">

                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Event Name <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-0"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            placeholder="Event Name"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Location <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-0"
                                                            name="location"
                                                            value={formData.location}
                                                            onChange={handleChange}
                                                            placeholder="Location"
                                                        />
                                                    </div>

                                                    {/* Timezone */}
                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Timezone <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-select rounded-0"
                                                            name="event_timezone"
                                                            value={formData.event_timezone || ""}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            <option value="">Select Timezone</option>
                                                            {timezones.map((tz) => (
                                                                <option key={tz.name} value={tz.name}>
                                                                    {tz.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Company <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-select rounded-0"
                                                            name="company_id"
                                                            onChange={handleChange}
                                                            value={formData.company_id}
                                                        >
                                                            <option value="">Choose Company</option>
                                                            {companies.map((company) => (
                                                                <option key={company.id} value={company.id}>
                                                                    {company.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <label className="form-label">
                                                            Country <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-select rounded-0"
                                                            name="country_id"
                                                            onChange={handleChange}
                                                            value={formData.country_id}
                                                        >
                                                            <option value="">Choose Country</option>
                                                            {countries.map((country) => (
                                                                <option key={country.id} value={country.id}>
                                                                    {country.CountryName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Checkboxes */}
                                                    <div className="col-md-3 d-flex align-items-center">
                                                        <CFormCheck
                                                            type="checkbox"
                                                            id="is_free"
                                                            name="is_free"
                                                            checked={isFree}
                                                            onChange={handleChange}
                                                            label="This event is free"
                                                        />
                                                    </div>

                                                    {/* <div className="col-md-3 d-flex align-items-center">
                                                        <CFormCheck
                                                            type="checkbox"
                                                            id="allow_register"
                                                            name="allow_register"
                                                            checked={formData.allow_register == "Y"}
                                                            onChange={handleChange}
                                                            label="Allowed Registration"
                                                        />
                                                    </div> */}

                                                    {!isFree && (
                                                        <div className="col-md-3">
                                                            <label className="form-label">
                                                                Currency <span className="text-danger">*</span>
                                                            </label>
                                                            <select
                                                                className="form-select rounded-0"
                                                                name="payment_currency"
                                                                value={formData.payment_currency}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Payment Type</option>
                                                                <option value="1">INR</option>
                                                                <option value="2">USD</option>
                                                            </select>
                                                        </div>

                                                    )}

                                                    <div className={`col-md-${!isFree ? 3 : 6}`}>
                                                        <label className="form-label">
                                                            URL Slug <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control rounded-0 ${slugError ? "is-invalid" : ""}`}
                                                            name="slug"
                                                            value={formData.slug}
                                                            onChange={handleChange}
                                                            placeholder="Slug"
                                                        />
                                                        {slugError && <div className="text-danger mt-1">{slugError}</div>}
                                                    </div>




                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Event Start:- (
                                                            {formatDateTimeShort(eventDetails?.date_from?.local)}
                                                            ) <span className="text-danger">*</span>
                                                        </label>
                                                        {/* <input
                                                            type="datetime-local"
                                                            className="form-control rounded-0"
                                                            name="date_from"
                                                            onChange={handleChange}
                                                            value={formData.date_from}
                                                        /> */}
                                                        <input
                                                            type="datetime-local"
                                                            className={`form-control rounded-0 ${dateErrors.date_from ? "is-invalid" : ""}`}
                                                            name="date_from"
                                                            value={formData.date_from}
                                                            onChange={handleDateChange}
                                                        />
                                                        {dateErrors.date_from && (
                                                            <div className="invalid-feedback">{dateErrors.date_from}</div>
                                                        )}

                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Event End:- (
                                                            {formatDateTimeShort(eventDetails?.date_to?.local)}
                                                            ) <span className="text-danger">*</span>
                                                        </label>
                                                        {/* <input
                                                            type="datetime-local"
                                                            className="form-control rounded-0"
                                                            name="date_to"
                                                            onChange={handleChange}
                                                            value={formData.date_to}
                                                        /> */}

                                                        <input
                                                            type="datetime-local"
                                                            className={`form-control rounded-0 ${dateErrors.date_to ? "is-invalid" : ""}`}
                                                            name="date_to"
                                                            value={formData.date_to}
                                                            onChange={handleDateChange}
                                                            min={formData.date_from}
                                                        />
                                                        {dateErrors.date_to && (
                                                            <div className="invalid-feedback">{dateErrors.date_to}</div>
                                                        )}

                                                    </div>

                                                    {!isFree && (
                                                        <>
                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    Sale Start:- (
                                                                    {formatDateTimeShort(eventDetails?.sale_start?.local)}
                                                                    ) <span className="text-danger">*</span>
                                                                </label>
                                                                {/* <input
                                                                    type="datetime-local"
                                                                    className="form-control rounded-0"
                                                                    name="sale_start"
                                                                    onChange={handleChange}
                                                                    value={formData.sale_start}
                                                                /> */}

                                                                <input
                                                                    type="datetime-local"
                                                                    className="form-control rounded-0"
                                                                    name="sale_start"
                                                                    value={formData.sale_start}
                                                                    onChange={handleDateChange}
                                                                    disabled={!formData.date_from || !formData.date_to}
                                                                />




                                                            </div>

                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    Sale End:- (
                                                                    {formatDateTimeShort(eventDetails?.sale_end?.local)}
                                                                    ) <span className="text-danger">*</span>
                                                                </label>
                                                                {/* <input
                                                                    type="datetime-local"
                                                                    className="form-control rounded-0"
                                                                    name="sale_end"
                                                                    onChange={handleChange}
                                                                    value={formData.sale_end}
                                                                /> */}

                                                                <input
                                                                    type="datetime-local"
                                                                    className={`form-control rounded-0 ${dateErrors.sale_end ? "is-invalid" : ""}`}
                                                                    name="sale_end"
                                                                    value={formData.sale_end}
                                                                    onChange={handleDateChange}
                                                                    min={formData.sale_start}
                                                                    max={formData.date_to}
                                                                    disabled={!formData.sale_start}
                                                                />
                                                                {dateErrors.sale_end && (
                                                                    <div className="invalid-feedback">{dateErrors.sale_end}</div>
                                                                )}


                                                            </div>
                                                        </>)}


                                                    {!isFree && (
                                                        <>
                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    Ticket Limit per person <span className="text-danger">*</span>
                                                                </label>
                                                                <select
                                                                    className="form-select rounded-0"
                                                                    name="ticket_limit"
                                                                    value={formData.ticket_limit}       // ✅ Bind selected value here
                                                                    onChange={handleChange}
                                                                >
                                                                    <option value="">Choose Limit</option>
                                                                    <option value="1">1</option>
                                                                    <option value="2">2</option>
                                                                    <option value="5">5</option>
                                                                </select>
                                                            </div>

                                                            <div className="col-md-6">
                                                                <label className="form-label">
                                                                    Approval Expiry <span className="text-danger">*</span>
                                                                </label>
                                                                <select
                                                                    className="form-select rounded-0"
                                                                    name="approve_timer"
                                                                    value={formData.approve_timer}
                                                                    onChange={handleChange}
                                                                >
                                                                    <option value="">Choose Days</option>
                                                                    {[...Array(10)].map((_, i) => (
                                                                        <option key={i + 1} value={i + 1}>
                                                                            {i + 1} Days
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </>

                                                    )}

                                                    <div className="col-md-6">
                                                        <label htmlFor="formFile" className="form-label">
                                                            Upload Image{" "}
                                                            <small className="text-danger" style={{ fontSize: "11px" }}>
                                                                (1200×800 min · 1920×800 max · JPG/PNG · ≤2MB)
                                                            </small>
                                                            <span
                                                                className="preview_img fw-normal text-primary ms-2"
                                                                role="button"
                                                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                                                onClick={handleImagePreview}
                                                            >
                                                                Preview Image
                                                            </span>
                                                        </label>

                                                        <input
                                                            type="file"
                                                            className="form-control rounded-0"
                                                            accept=".jpg,.jpeg,.png"
                                                            // required
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;

                                                                // ================= FILE TYPE VALIDATION =================
                                                                const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
                                                                if (!allowedTypes.includes(file.type)) {
                                                                    Swal.fire({
                                                                        icon: "error",
                                                                        title: "Invalid File Format",
                                                                        html: `
                                                                            <p style="color:red;font-weight:600">
                                                                                Only JPG, JPEG, and PNG images are allowed.
                                                                            </p>
                                                                        `
                                                                    });
                                                                    e.target.value = "";
                                                                    return;
                                                                }

                                                                // ================= FILE SIZE VALIDATION =================
                                                                const maxSize = 2 * 1024 * 1024;
                                                                if (file.size > maxSize) {
                                                                    Swal.fire({
                                                                        icon: "warning",
                                                                        title: "File Size Exceeded",
                                                                        html: `
                                                                            <p style="color:red;font-weight:600">
                                                                                Maximum allowed file size is 2 MB.
                                                                            </p>
                                                                            <p>Your file size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                                        `
                                                                    });
                                                                    e.target.value = "";
                                                                    return;
                                                                }

                                                                // ================= IMAGE DIMENSION VALIDATION =================
                                                                const img = new Image();
                                                                const objectUrl = URL.createObjectURL(file);

                                                                img.onload = () => {
                                                                    const width = img.width;
                                                                    const height = img.height;

                                                                    URL.revokeObjectURL(objectUrl);

                                                                    const minWidth = 1200;
                                                                    const maxWidth = 1920;
                                                                    const requiredHeight = 800;

                                                                    if (
                                                                        height !== requiredHeight ||
                                                                        width < minWidth ||
                                                                        width > maxWidth
                                                                    ) {
                                                                        Swal.fire({
                                                                            icon: "error",
                                                                            title: "Invalid Image Dimensions",
                                                                            html: `
                                                                                <div style="text-align:left">
                                                                                    <p style="color:red;font-weight:700">
                                                                                        Image size does not meet the required dimensions.
                                                                                    </p>
                                                                                    <p><b style="color:red">Recommended:</b> 1200 × 800 px</p>
                                                                                    <p><b style="color:red">Maximum allowed:</b> 1920 × 800 px</p>
                                                                                    <p><b>Your image:</b> ${width} × ${height} px</p>
                                                                                </div>
                                                                            `
                                                                        });

                                                                        e.target.value = "";
                                                                        return;
                                                                    }

                                                                    // ✅ ALL VALIDATIONS PASSED
                                                                    Swal.fire({
                                                                        icon: "success",
                                                                        title: "Image Valid",
                                                                        html: `
                                                                                <p style="color:green;font-weight:600">
                                                                                    Image uploaded successfully!
                                                                                </p>
                                                                                <p>Your image size: ${width} × ${height} px</p>
                                                                            `,
                                                                        timer: 1500,
                                                                        showConfirmButton: false
                                                                    });

                                                                    handleFileChange(e);
                                                                };

                                                                img.onerror = () => {
                                                                    Swal.fire({
                                                                        icon: "error",
                                                                        title: "Invalid Image",
                                                                        html: `
                                                                            <p style="color:red;font-weight:600">
                                                                                Unable to read the uploaded image file.
                                                                            </p>
                                                                        `
                                                                    });
                                                                    e.target.value = "";
                                                                };

                                                                img.src = objectUrl;
                                                            }}
                                                        />

                                                    </div>

                                                    {!isFree && (
                                                        <div className="col-lg-6">
                                                            <label className="form-label d-flex align-items-center gap-2">
                                                                Type of Event

                                                                <i
                                                                    className="bi bi-info-circle-fill text-primary"
                                                                    style={{ cursor: "pointer", fontSize: "14px" }}
                                                                    onClick={() => {
                                                                        Swal.fire({
                                                                            icon: "info",
                                                                            title: "Event Type Guide",
                                                                            html: `
                                                                            <div style="text-align:left;font-size:14px">
                                                                                <p><b>Event:</b> One-time entry for a single event.</p>
                                                                                <p><b>Multi:</b> One ticket gives access to multiple events or days.</p>
                                                                            </div>
                                                                        `
                                                                        });
                                                                    }}
                                                                ></i>
                                                            </label>

                                                            <select
                                                                className="form-select rounded-0"
                                                                name="entry_type"
                                                                value={formData.entry_type || ""}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Choose Type</option>
                                                                <option value="event">Event</option>
                                                                <option value="multi">Multi</option>
                                                                {/* <option value="slot">Slot</option>
                                                                <option value="single">Single</option> */}
                                                            </select>

                                                        </div>
                                                    )}

                                                    {/* Youtube URL */}
                                                    <div className="col-lg-6">
                                                        <label className="form-label">Youtube URL</label>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-0"
                                                            name="video_url"
                                                            value={formData.video_url}
                                                            onChange={handleChange}
                                                            placeholder="Youtube URL"
                                                        />
                                                    </div>


                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">
                                                            Description <span className="text-danger">*</span>
                                                        </label>
                                                        <HtmlEditor
                                                            editorRef={noteRef}
                                                            initialContent={editorData.content}
                                                            onChange={(content) => editorData({ content })}
                                                        />
                                                    </div>

                                                    <div className="col-12 text-end">
                                                        {/* <button type="submit" className="btn submit">
                                                        Next
                                                    </button> */}
                                                        <button type="submit" className="primery-button px-4" disabled={isFormSubmit}>
                                                            {isFormSubmit ? "Updating Event..." : "Submit"}
                                                        </button>
                                                    </div>

                                                </div>

                                            </div>

                                        </form>
                                    </div>

                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

        </>
    )
}

export default MyEventsPage