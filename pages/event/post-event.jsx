import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import api from "@/utils/api";
import Swal from "sweetalert2";
import moment from "moment-timezone"; // ✅ Import moment-timezone
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";
import { useRouter } from 'next/router';


const EventDetailsPage = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const router = useRouter();

    const [isFree, setIsFree] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [countries, setCountries] = useState([]);
    const [timezones, setTimezones] = useState([]);
    const [formData, setFormData] = useState({
        company_id: "",
        name: "",
        country_id: "",
        location: "",
        payment_currency: "",
        date_from: "",
        date_to: "",
        sale_start: "",
        sale_end: "",
        ticket_limit: "",
        slug: "",
        approve_timer: "",
        video_url: "",
        is_free: "N",
        allow_register: "N",
        request_rsvp: "",
        event_timezone: "",
        access_type: "multi"
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const noteRef = useRef(null);
    const content = getHtmlEditorContent(noteRef);
    const [editorData, setEditorData] = useState({ content: "" });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name == "slug") {
            const formatted = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            setFormData({ ...formData, slug: formatted });
            // ✅ live validate
            const errorMsg = validateSlug(formatted);
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

    const handleAddCompany = async () => {
        const { value: companyName } = await Swal.fire({
            title: "Add Company",
            input: "text",
            inputLabel: "Enter company name",
            inputPlaceholder: "Company Name",
            showCancelButton: true,
            confirmButtonText: "Create",
            cancelButtonText: "Cancel",
            inputValidator: (value) => {
                if (!value) return "Company name is required!";
            },
        });

        if (companyName) {
            try {
                const res = await api.post("/api/v1/events/company-create", {
                    companyName,
                });

                if (res.data?.success) {
                    Swal.fire("Success!", "Company added successfully!", "success");
                    const newCompany = res.data.data.company;
                    setCompanies((prev) => [...prev, newCompany]);
                    setFormData((prev) => ({
                        ...prev,
                        company_id: newCompany.id,
                    }));
                } else {
                    Swal.fire("Error", res.data?.message || "Failed to add company", "error");
                }
            } catch (error) {
                Swal.fire(
                    "Error",
                    error.response?.data?.message || "Something went wrong",
                    "error"
                );
            }
        }
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {


            const fd = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                fd.append(key, value);
            });
            fd.append("desp", content.trim())
            if (image) fd.append("feat_image", image);

            // Debug check:
            // for (let pair of fd.entries()) {
            //     console.log(pair[0] + ": ", pair[1]);
            // }
            // return false

            const response = await api.post("/api/v1/events/create", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const resData = response.data;
            // console.log('>>>>>>>>>', resData);

            if (resData?.success) {
                Swal.fire("Success", resData?.message ?? "Event created successfully!", "success");
                router.push(`/event/my-event/`)
            } else if (resData?.error?.details) {
                // console.log('>>>>>>>>>>>>',resData?.error?.details);
                // 🧩 handle backend validation errors
                const errorList = resData.error.details
                    .map(
                        (err) => `<li><strong>${err.path}</strong>: ${err.msg}</li>`
                    )
                    .join("");

                Swal.fire({
                    icon: "error",
                    title: "Validation Errors",
                    html: `<ul style="text-align:left; margin:0; padding-left:20px;">${errorList}</ul>`,
                });
            } else {
                Swal.fire(
                    "Error",
                    resData?.message || resData?.error?.message || "Something went wrong",
                    "error"
                );
            }
        } catch (error) {
            // console.log("Event create error:", error.response.data.error.details);

            if (error?.response?.data?.error) {
                const errData = error.response.data.error;
                if (Array.isArray(errData.details) && errData.details.length > 0) {
                    const errorList = errData.details
                        .map(
                            (err) => `<li><strong>${err.path}</strong>: ${err.msg}</li>`
                        )
                        .join("");

                    Swal.fire({
                        icon: "error",
                        title: "Validation Errors",
                        html: `<ul style="text-align:left; margin:0; padding-left:20px;">${errorList}</ul>`,
                    });
                }
                // Otherwise, show the general error message
                else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: errData.message || "Something went wrong. Please try again.",
                    });
                }
            }

        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="post-eventpg" className="my-4">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">

                            <div className="d-flex justify-content-between post-event-topprt align-items-center">
                                <div className="top_h w-100">
                                    <p className="des_h mb-0">Post Event</p>
                                </div>
                                <ul className="list-inline text-right">
                                    <li className="list-inline-item">
                                        <Link className="primery-button text-14" href="/event/my-event">
                                            View Event
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div className="form-deta bg-white mt-3 mb-4 pb-3 rounded custom-shadow">

                                <h2 className="text-16 text-white text-uppercase position-relative text-start fw-bold">
                                    <i className="far fa-calendar-plus"></i>Post Event
                                </h2>

                                <div className="inner-formdeta p-4 text-start fs-6 fw-normal">

                                    <div className="table-responsive">
                                        <div className="scroll_tab w-auto px-2">
                                            <ul id="progressbar">
                                                <li className="active"><a className="fw-bold" href="#">Post Event</a></li>
                                                <li><a className="fw-bold" href="#">Event Details</a></li>
                                                <li><a className="fw-bold" href="#">Manage Tickets</a></li>
                                                <li><a className="fw-bold" href="#">Publish Event</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <h4 className="fw-bold">Event Info</h4>
                                        <div className="resistor-content">
                                            <div className="row g-3">
                                                {/* Company */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">
                                                        Company <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="d-flex gap-2">
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

                                                        <button
                                                            type="button"
                                                            className="btn btn-primary rounded-0"
                                                            onClick={handleAddCompany}
                                                        >
                                                            Add
                                                        </button>
                                                    </div>

                                                </div>

                                                {/* Event Name */}
                                                <div className="col-lg-4 col-md-6 mb-3">
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

                                                {/* Country */}
                                                <div className="col-lg-4 col-md-6 mb-3">
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

                                                {/* Location */}
                                                <div className="col-lg-4 col-md-6 mb-3">
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

                                                {/* Upload Image */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">
                                                        Upload Image{" "}
                                                        <small className="text-danger">(Size 550×550 JPG, JPEG, PNG Max 2MB)</small>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        className="form-control rounded-0"
                                                        accept=".jpg, .jpeg, .png" // ✅ HTML-level validation
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;

                                                            // ✅ Allowed extensions
                                                            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
                                                            if (!allowedTypes.includes(file.type)) {
                                                                Swal.fire("Invalid File", "Only JPG, JPEG, and PNG files are allowed.", "error");
                                                                e.target.value = ""; // clear file input
                                                                return;
                                                            }

                                                            // ✅ Max size 2MB
                                                            const maxSize = 2 * 1024 * 1024; // 2 MB
                                                            if (file.size > maxSize) {
                                                                Swal.fire("File Too Large", "Maximum file size is 2 MB.", "warning");
                                                                e.target.value = "";
                                                                return;
                                                            }

                                                            handleFileChange(e); // ✅ proceed with your handler
                                                        }}
                                                    />
                                                </div>

                                                {/* Free and Register Checkboxes */}
                                                <div className="col-lg-4 col-md-6 mb-3 d-flex align-items-end">
                                                    <div className="d-flex align-items-center justify-content-between w-100">
                                                        <div className="btn freeEventCheck orange d-flex align-items-center w-50 text-white">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input me-2"
                                                                id="is_free"
                                                                name="is_free"
                                                                checked={formData.is_free == "Y"}
                                                                onChange={handleChange}
                                                            />
                                                            <label htmlFor="is_free" className="mb-0 text-14 text-white">
                                                                This Event is FREE
                                                            </label>
                                                        </div>
                                                        {formData.is_free == "Y" && (<div className="btn freeEventCheck green d-flex align-items-center w-50">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input me-2"
                                                                id="allow_register"
                                                                name="allow_register"
                                                                checked={formData.allow_register == "Y"}
                                                                onChange={handleChange}
                                                                disabled={!isFree} // Only active for free events
                                                            />
                                                            <label htmlFor="allow_register" className="mb-0 text-14 text-white">
                                                                Allow Registration
                                                            </label>
                                                        </div>)}
                                                    </div>
                                                </div>

                                                {/* Currency */}
                                                <div className="col-lg-2 col-md-6 mb-3">
                                                    <label className="form-label">Currency</label>
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

                                                {/* Timezone */}
                                                <div className="col-lg-2 col-md-6 mb-3">
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
                                                            <option key={tz.id} value={tz.id}>
                                                                {tz.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Event Dates */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">
                                                        Event Start <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control rounded-0"
                                                        name="date_from"
                                                        onChange={handleChange}
                                                        value={formData.date_from}
                                                    />
                                                </div>

                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">
                                                        Event End <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control rounded-0"
                                                        name="date_to"
                                                        onChange={handleChange}
                                                        value={formData.date_to}
                                                    />
                                                </div>

                                                {/* Conditional Fields */}
                                                {isFree ? (
                                                    <>
                                                        {/* RSVP By - Only for Free Events */}
                                                        <div className="col-lg-4 col-md-6 mb-3">
                                                            <label className="form-label">
                                                                Request RSVP By <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                className="form-control rounded-0"
                                                                name="request_rsvp"
                                                                onChange={handleChange}
                                                                value={formData.request_rsvp || ""}
                                                                required
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* Sale Start/End for Paid Events */}
                                                        <div className="col-lg-4 col-md-6 mb-3">
                                                            <label className="form-label">
                                                                Sale Start <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="datetime-local"
                                                                className="form-control rounded-0"
                                                                name="sale_start"
                                                                onChange={handleChange}
                                                                value={formData.sale_start}
                                                            />
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 mb-3">
                                                            <label className="form-label">
                                                                Sale End <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="datetime-local"
                                                                className="form-control rounded-0"
                                                                name="sale_end"
                                                                onChange={handleChange}
                                                                value={formData.sale_end}
                                                            />
                                                        </div>

                                                        {/* Ticket Limit per Person */}
                                                        <div className="col-lg-4 col-md-6 mb-3">
                                                            <label className="form-label">Ticket Limit per person</label>
                                                            <select
                                                                className="form-select rounded-0"
                                                                name="ticket_limit"
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Choose Limit</option>
                                                                <option value="1">1</option>
                                                                <option value="2">2</option>
                                                                <option value="5">5</option>
                                                            </select>
                                                        </div>

                                                        {/* Approval Expiry */}
                                                        <div className="col-lg-4 col-md-6 mb-3">
                                                            <label className="form-label">Approval Expiry</label>
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

                                                {/* URL Slug */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">URL Slug</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-0"
                                                        name="slug"
                                                        value={formData.slug}
                                                        onChange={handleChange}
                                                        placeholder="Slug"
                                                    />
                                                    {/* <label className="form-label">
                                                        Share URL <span>{`http://localhost:3000/event/${formData.slug}`}</span>
                                                    </label> */}
                                                </div>

                                                {/* Youtube URL */}
                                                <div className="col-lg-4 col-md-6 mb-3">
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

                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">Type of Event</label>
                                                    <select
                                                        className="form-select rounded-0"
                                                        name="access_type"
                                                        onChange={handleChange}
                                                        value={formData.access_type || ""}
                                                    >
                                                        <option value="">Choose Type</option>
                                                        <option value="event">Event</option>
                                                        <option value="multi">Multi</option>
                                                        <option value="slot">Slot</option>
                                                        <option value="single">Single</option>
                                                    </select>
                                                </div>

                                                {/* Description */}
                                                <div className="col-12">
                                                    <label className="form-label">Description</label>
                                                    <HtmlEditor
                                                        editorRef={noteRef}
                                                        initialContent={editorData.content}
                                                        onChange={(content) => editorData({ ...editorData, content })}
                                                    />
                                                    {/* <textarea
                                                        rows="5"
                                                        className="form-control rounded-0"
                                                        name="desp"
                                                        value={formData.desc}
                                                        onChange={handleChange}
                                                        placeholder="Compose message..."
                                                    ></textarea> */}
                                                </div>

                                            </div>

                                            <div className="text-center mt-4">
                                                <button type="submit" className="primery-button px-4" disabled={loading}>
                                                    {loading ? "Creating Event..." : "Create Event"}
                                                </button>
                                            </div>
                                        </div>
                                    </form>

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

export default EventDetailsPage;
