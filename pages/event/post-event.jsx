import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import api from "@/utils/api";
import Swal from "sweetalert2";
import moment from "moment-timezone"; // ✅ Import moment-timezone
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";
import { useRouter } from 'next/router';
import {
    DragDropContext,
    Droppable,
    Draggable,
} from "react-beautiful-dnd";

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
        approve_timer: "10",
        is_free: "N",
        allow_register: "N",
        request_rsvp: new Date().toISOString(),
        event_timezone: "",
        video_url: "",
        entry_type: "event"
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const noteRef = useRef(null);
    // const content = getHtmlEditorContent(noteRef);
    const [editorData, setEditorData] = useState({ content: "" });
    const [errors, setErrors] = useState({});
    const [enableRefund, setEnableRefund] = useState(false);
    const [refundAllowed, setRefundAllowed] = useState("");
    const [refundDeadline, setRefundDeadline] = useState("");
    const [cancellationPolicy, setCancellationPolicy] = useState("");

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

    const handleEventDateChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Only validate if the event is NOT free
        if (!isFree) {
            let startDate = name == "date_from" ? value : formData.date_from;
            let endDate = name == "date_to" ? value : formData.date_to;

            if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
                setErrors((prev) => ({
                    ...prev,
                    date_to: "Event End date must be after Event Start date"
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    date_to: ""
                }));
            }
        }
    };

    const handleSaleDateChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Validation: Sale End must be after Sale Start
        let saleStart = name == "sale_start" ? value : formData.sale_start;
        let saleEnd = name == "sale_end" ? value : formData.sale_end;

        if (saleStart && saleEnd && new Date(saleEnd) < new Date(saleStart)) {
            setErrors((prev) => ({
                ...prev,
                sale_end: "Sale End date must be greater than Sale Start date"
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                sale_end: ""
            }));
        }
    };

    const handlePaidDateChange = (e) => {
        const { name, value } = e.target;

        let updatedForm = { ...formData, [name]: value };
        let newErrors = {};

        if (!isFree) {
            const { date_from, date_to, sale_start, sale_end } = updatedForm;

            /* ================= EVENT DATE VALIDATION ================= */

            // Event End >= Event Start
            if (date_from && date_to && new Date(date_to) < new Date(date_from)) {
                newErrors.date_to = "Event End must be after Event Start";
            }

            /* ================= RESET SALE DATES (ONLY WHEN EVENT CHANGES) ================= */

            if (name === "date_from" || name === "date_to") {
                // If sale dates exist but now invalid → reset them
                if (
                    (sale_start && date_from && new Date(sale_start) < new Date(date_from)) ||
                    (sale_end && date_to && new Date(sale_end) > new Date(date_to))
                ) {
                    updatedForm.sale_start = "";
                    updatedForm.sale_end = "";
                }
            }

            /* ================= SALE DATE VALIDATION ================= */

            // Sale End >= Sale Start
            if (sale_start && sale_end && new Date(sale_end) < new Date(sale_start)) {
                newErrors.sale_end = "Sale End must be after Sale Start";
            }

            // Sale Start <= Event Start
            if (sale_start && date_from && new Date(sale_start) > new Date(date_from)) {
                newErrors.sale_start = "Sale Start cannot be after Event Start";
            }

            // Sale End <= Event End
            if (sale_end && date_to && new Date(sale_end) > new Date(date_to)) {
                newErrors.sale_end = "Sale End cannot be after Event End";
            }
        }

        // ✅ Update state once (important)
        setFormData(updatedForm);
        setErrors(newErrors);
    };

    const getSaleStartMinDate = () => {
        if (!formData.date_from) return "";

        const eventStart = new Date(formData.date_from);
        eventStart.setDate(eventStart.getDate() - 30);

        return eventStart.toISOString().slice(0, 16);
    };


    const validateSlug = (slug) => {
        if (!slug || slug.trim() == "") {
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

    const hasDateErrors = () => {
        return Object.values(errors).some((err) => err && err.trim() !== "");
    };

    const [enableGate, setEnableGate] = useState(false);
    const [gates, setGates] = useState([
        { name: "" }
    ]);
    const handleGateToggle = () => {
        setEnableGate(!enableGate);
    };

    const addGate = () => {
        setGates([...gates, { name: "" }]);
    };

    const removeGate = (index) => {
        if (gates.length === 1) return; // prevent delete last
        const updated = gates.filter((_, i) => i !== index);
        setGates(updated);
    };

    const handleGateChange = (index, value) => {
        const updated = [...gates];
        updated[index].name = value;
        setGates(updated);
    };




    const handleSubmit = async (e) => {
        e.preventDefault();


        /* ================= STOP SUBMIT IF DATE ERRORS ================= */
        if (hasDateErrors()) {
            Swal.fire({
                icon: "error",
                title: "Invalid Date Selection",
                text: "Please fix date & time errors before submitting the form.",
            });
            return;
        }


        setLoading(true);

        try {
            const content = getHtmlEditorContent(noteRef).trim();
            const fd = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                fd.append(key, value);
            });
            fd.append("desp", content.trim())
            fd.append("gates", JSON.stringify(gates))
            if (image) fd.append("feat_image", image);
            // return false

            fd.append("refund_enabled", enableRefund ? "Y" : "N");

            if (enableRefund) {
                fd.append("refund_allowed", refundAllowed);
                fd.append("refund_deadline", refundDeadline);
                fd.append("cancellation_policy", cancellationPolicy);
            }

            const response = await api.post("/api/v1/events/create", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const resData = response.data;
            if (resData?.success) {

                const eventId = resData.data.event.id;
                //  ONLY if exhibitors enabled
                if (enableExhibitors && exhibitors.length > 0) {
                    const exhibitorFd = new FormData();
                    exhibitorFd.append("event_id", eventId);
                    // 🧩 remove image from JSON
                    const exhibitorPayload = exhibitors.map(({ image, ...rest }) => rest);
                    exhibitorFd.append("exhibitors", JSON.stringify(exhibitorPayload));
                    // 🖼️ append images separately
                    exhibitors.forEach((ex) => {
                        if (ex.image) {
                            exhibitorFd.append("exhibitor_logos", ex.image);
                        }
                    });
                    // 🔥 CALL API
                    await api.post("/api/v1/events/create/event-exhibitors", exhibitorFd, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                }
                // ================= GALLERY ================= 🔥 NEW
                if (enableGallery && gallery.length > 0) {

                    const galleryFd = new FormData();

                    galleryFd.append("event_id", eventId);

                    gallery.forEach((file) => {
                        galleryFd.append("gallery_images", file);
                    });

                    await api.post(
                        "/api/v1/events/create/event-gallery",
                        galleryFd,
                        { headers: { "Content-Type": "multipart/form-data" } }
                    );
                }

                // ================= SLIDERS =================
                if (enableSliders && slider.images.length > 0) {

                    const sliderFd = new FormData();

                    sliderFd.append("event_id", eventId);

                    slider.images.forEach((file) => {
                        sliderFd.append("slider_images", file);
                    });

                    await api.post(
                        "/api/v1/events/create/event-sliders",
                        sliderFd,
                        { headers: { "Content-Type": "multipart/form-data" } }
                    );
                }


                Swal.fire("Success", resData?.message ?? "Event created successfully!", "success");
                router.push(`/event/my-event/`)
            } else if (resData?.error?.details) {
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


    const handleRefundToggle = (e) => {
        const checked = e.target.checked;
        setEnableRefund(checked);

        // agar unchecked kare to values reset ho jaye
        if (!checked) {
            setRefundAllowed("");
            setRefundDeadline("");
            setCancellationPolicy("");
        }
    };

    const handleRefundAllowedChange = (e) => {
        setRefundAllowed(e.target.value);
    };

    const handleRefundDeadlineChange = (e) => {
        setRefundDeadline(e.target.value);
    };

    const handleCancellationPolicyChange = (e) => {
        setCancellationPolicy(e.target.value);
    };

    const [enableExhibitors, setEnableExhibitors] = useState(false);


    const [exhibitors, setExhibitors] = useState([
        { name: "", image: null, description: "", website: "" }
    ]);

    const handleExhibitorsToggle = () => {
        setEnableExhibitors(!enableExhibitors);
        if (!enableExhibitors && exhibitors.length === 0) {
            setExhibitors([
                { name: "", logo: null, description: "", website: "" }
            ]);
        }
    };
    const addExhibitor = () => {
        setExhibitors([
            ...exhibitors,
            { name: "", image: null, description: "", website: "" }
        ]);
    };

    const removeExhibitor = (index) => {
        setExhibitors(exhibitors.filter((_, i) => i !== index));
    };

    const handleExhibitorChange = (index, field, value) => {
        const updated = [...exhibitors];
        updated[index][field] = value;
        setExhibitors(updated);
    };


    const [enableGallery, setEnableGallery] = useState(false);

    const [gallery, setGallery] = useState([]);

    const handleGalleryToggle = () => {
        setEnableGallery(!enableGallery);
    };

    const handleGalleryUpload = (e) => {
        const files = Array.from(e.target.files);
        setGallery([...gallery, ...files]);
    };

    const removeGallery = (index) => {
        setGallery(gallery.filter((_, i) => i !== index));
    };

    const [enableSliders, setEnableSliders] = useState(false);

    const [slider, setSlider] = useState({
        images: [],
    });
    // ================= HANDLERS =================

    const handleSlidersToggle = () => {
        setEnableSliders(!enableSliders);
    };

    const handleSliderChange = (field, value) => {
        setSlider({ ...slider, [field]: value });
    };

    const handleSliderImages = (e) => {
        const files = Array.from(e.target.files);

        // limit (max 5 at a time)
        if (files.length > 5) {
            alert("You can upload max 5 images at a time");
            return;
        }

        setSlider({
            ...slider,
            images: [...slider.images, ...files],
        });

        e.target.value = null;
    };

    const removeSliderImage = (index) => {
        const updated = slider.images.filter((_, i) => i !== index);
        setSlider({ ...slider, images: updated });
    };

    // 🔥 DRAG END FUNCTION
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(slider.images);
        const [movedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, movedItem);

        setSlider({ ...slider, images: items });
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

                            <div className="form-deta bg-white mt-3 mb-4 pb-0 rounded custom-shadow">

                                <h2 className="text-16 text-white text-uppercase position-relative text-start fw-bold">
                                    <i className="far fa-calendar-plus"></i>Post Event
                                </h2>

                                <div className="inner-formdeta p-4 pt-0 text-start fs-6 fw-normal pt-md-4">

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

                                    <form className="mt-2 mt-md-0" onSubmit={handleSubmit}>
                                        <h4 className="fw-bold">Event Info</h4>
                                        <div className="resistor-content">
                                            <div className="row g-3">
                                                {/* Company */}
                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
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
                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
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
                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
                                                    <label className="form-label">
                                                        Country <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select rounded-0"
                                                        name="country_id"
                                                        onChange={handleChange}
                                                        value={formData.country_id}
                                                        required
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
                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
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
                                                        required
                                                    />
                                                </div>

                                                {/* Upload Image */}
                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
                                                    <label className="form-label">
                                                        Upload Image{" "}
                                                        <small className="text-danger" style={{ fontSize: "11px" }}>
                                                            (1200×800 min · 1920×800 max · JPG/PNG · ≤2MB)
                                                        </small>
                                                    </label>

                                                    <input
                                                        type="file"
                                                        className="form-control rounded-0 pt-2"
                                                        accept=".jpg, .jpeg, .png" // ✅ HTML-level validation
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

                                                {/* Free and Register Checkboxes */}
                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-0 mb-sm-2 mt-0 d-flex align-items-end">
                                                    <div className="d-flex align-items-center justify-content-between w-100 form-check-btn-group">
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
                                                        {/* {formData.is_free == "Y" && (<div className="btn freeEventCheck green d-flex align-items-center w-50">
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
                                                        </div>)} */}
                                                    </div>
                                                </div>

                                                {/* {formData.is_free != "Y" && ( */}
                                                <>
                                                    {/* Currency */}
                                                    <div className="col-lg-3 col-md-6 mb-3 mt-0">
                                                        <label className="form-label">Currency <span className="text-danger">*</span></label>
                                                        <select
                                                            className="form-select rounded-0"
                                                            name="payment_currency"
                                                            value={formData.payment_currency}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            <option value="">Payment Type</option>
                                                            <option value="1">INR</option>
                                                            <option value="2">USD</option>
                                                        </select>
                                                    </div>

                                                </>

                                                {/* )} */}

                                                {/* Timezone */}
                                                <div
                                                    className={`col-lg-${formData.is_free == "Y" ? 6 : 3} col-md-${formData.is_free == "Y" ? 6 : 6} 
                                                            mb-3 mt-0`}
                                                >
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

                                                {/* ===== Event Start ===== */}
                                                <div className="col-lg-6 col-md-6 mb-3 mt-0">
                                                    <label className="form-label">
                                                        Event Start <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        className={`form-control rounded-0 ${errors.date_from ? "is-invalid" : ""}`}
                                                        name="date_from"
                                                        value={formData.date_from}
                                                        onChange={handlePaidDateChange}
                                                        min={formData.sale_start || new Date().toISOString().slice(0, 16)}
                                                        required={!isFree}
                                                    />
                                                    {errors.date_from && <div className="invalid-feedback">{errors.date_from}</div>}
                                                </div>

                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
                                                    <label className="form-label">
                                                        Event End <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        className={`form-control rounded-0 ${errors.date_to ? "is-invalid" : ""}`}
                                                        name="date_to"
                                                        value={formData.date_to}
                                                        onChange={handlePaidDateChange}
                                                        min={formData.date_from || formData.sale_end || new Date().toISOString().slice(0, 16)}
                                                        required={!isFree}
                                                    />
                                                    {errors.date_to && <div className="invalid-feedback">{errors.date_to}</div>}
                                                </div>

                                                {/* Conditional Fields */}
                                                {isFree ? (
                                                    <>
                                                        {/* RSVP By - Only for Free Events */}
                                                        {/* <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
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
                                                        </div> */}
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* Sale Start/End for Paid Events */}
                                                        <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
                                                            <label className="form-label">
                                                                Sale Start <span className="text-danger">*</span>
                                                            </label>
                                                            {/* <input
                                                                type="datetime-local"
                                                                className={`form-control rounded-0 ${errors.sale_start ? "is-invalid" : ""}`}
                                                                name="sale_start"
                                                                value={formData.sale_start}
                                                                onChange={handlePaidDateChange}
                                                                min={new Date().toISOString().slice(0, 16)}
                                                                required={!isFree}
                                                            /> */}
                                                            <input
                                                                type="datetime-local"
                                                                className={`form-control rounded-0 ${errors.sale_start ? "is-invalid" : ""}`}
                                                                name="sale_start"
                                                                value={formData.sale_start}
                                                                onChange={handlePaidDateChange}
                                                                min={getSaleStartMinDate()}   // ✅ 30 days before event start
                                                                max={formData.date_from || ""} // ✅ cannot exceed event start
                                                                required={!isFree}
                                                            />

                                                            {errors.sale_start && <div className="invalid-feedback">{errors.sale_start}</div>}
                                                        </div>
                                                        <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
                                                            <label className="form-label">
                                                                Sale End <span className="text-danger">*</span>
                                                            </label>

                                                            <input
                                                                type="datetime-local"
                                                                className={`form-control rounded-0 ${errors.sale_end ? "is-invalid" : ""}`}
                                                                name="sale_end"
                                                                value={formData.sale_end}
                                                                onChange={handlePaidDateChange}
                                                                min={formData.sale_start || ""}
                                                                max={formData.date_from || ""} // ✅ Sale must end before event start
                                                                required={!isFree}
                                                            />


                                                            {/* <input
                                                                type="datetime-local"
                                                                className={`form-control rounded-0 ${errors.sale_end ? "is-invalid" : ""}`}
                                                                name="sale_end"
                                                                value={formData.sale_end}
                                                                onChange={handlePaidDateChange}
                                                                min={formData.sale_start || new Date().toISOString().slice(0, 16)}
                                                                max={formData.date_to || ""}
                                                                required={!isFree}
                                                            /> */}
                                                            {errors.sale_end && <div className="invalid-feedback">{errors.sale_end}</div>}
                                                        </div>


                                                        {/* Ticket Limit per Person */}
                                                        <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
                                                            <label className="form-label">Ticket Limit per person</label>
                                                            <select
                                                                className="form-select rounded-0"
                                                                name="ticket_limit"
                                                                onChange={handleChange}
                                                                required
                                                            >
                                                                <option value="">Choose Limit</option>
                                                                <option value="1">1</option>
                                                                <option value="2">2</option>
                                                                <option value="5">5</option>
                                                                <option value="7">7</option>
                                                                <option value="10">10</option>
                                                            </select>
                                                        </div>

                                                        {/* Approval Expiry Remove 12-02-2026 kamal */}
                                                        {/* <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
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
                                                        </div> */}
                                                    </>
                                                )}

                                                {/* URL Slug */}
                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
                                                    <label className="form-label">URL Slug <span className="text-danger">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-0"
                                                        name="slug"
                                                        value={formData.slug}
                                                        required
                                                        onChange={handleChange}
                                                        placeholder="Slug"
                                                    />
                                                    {/* <label className="form-label">
                                                        Share URL <span>{`http://localhost:3000/event/${formData.slug}`}</span>
                                                    </label> */}
                                                </div>

                                                {/* Youtube URL */}
                                                <div className="col-xl-4 col-lg-6 col-md-6 mb-2 mt-0">
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


                                                {!isFree && (
                                                    <div className="col-lg-4 col-md-6 mb-3">
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
                                                            onChange={handleChange}
                                                            value={formData.entry_type || ""}
                                                        >
                                                            <option value="">Choose Type</option>
                                                            <option value="event">Event</option>
                                                            <option value="multi">Multi</option>
                                                            {/* <option value="slot">Slot</option>
                                                            <option value="single">Single</option> */}
                                                        </select>
                                                    </div>
                                                )}


                                                <div className="col-12">
                                                    <div className="form-check mb-3">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="refundCheck"
                                                            checked={enableRefund}
                                                            onChange={handleRefundToggle}
                                                        />
                                                        <label className="form-check-label" htmlFor="refundCheck">
                                                            Enable Cancellation & Refund
                                                        </label>
                                                    </div>

                                                    {enableRefund && (
                                                        <div className="row">
                                                            {/* Refund Allowed */}
                                                            <div className="col-md-4">
                                                                <label className="form-label">Refund<span className="text-danger">*</span></label>
                                                                <select className="form-control"
                                                                    value={refundAllowed}
                                                                    onChange={handleRefundAllowedChange}
                                                                    required={enableRefund}
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Y">Allowed</option>
                                                                    <option value="N">Not Allowed</option>
                                                                </select>
                                                            </div>

                                                            {/* Refund Deadline */}
                                                            <div className="col-md-4">
                                                                <label className="form-label">Refund Deadline<span className="text-danger">*</span></label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="e.g. 7 days before event"
                                                                    value={refundDeadline}
                                                                    onChange={handleRefundDeadlineChange}
                                                                    required={enableRefund}
                                                                />
                                                            </div>

                                                            {/* Cancellation Policy */}
                                                            <div className="col-md-4">
                                                                <label className="form-label">Cancellation Policy<span className="text-danger">*</span></label>
                                                                <textarea
                                                                    className="form-control"
                                                                    placeholder="Enter cancellation policy"
                                                                    value={cancellationPolicy}
                                                                    onChange={handleCancellationPolicyChange}
                                                                    required={enableRefund}
                                                                ></textarea>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Add Gates for this Event */}
                                                <div className="col-12">
                                                    <div className="form-check mb-3">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="gateCheck"
                                                            required
                                                            checked={enableGate}
                                                            onChange={handleGateToggle}
                                                        />
                                                        <label className="form-check-label fw-semibold" htmlFor="gateCheck">
                                                            Add Gates for this Event
                                                        </label>
                                                    </div>

                                                    {enableGate && (
                                                        <div className="row">
                                                            {gates.map((gate, index) => (
                                                                <div className="col-md-6 mb-3" key={index}>
                                                                    <div className="border rounded-3 p-3 bg-light h-100 shadow-sm">

                                                                        {/* Gate Title */}
                                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                                            <label className="form-label mb-0 fw-semibold">
                                                                                Gate {index + 1}
                                                                            </label>

                                                                            {/* Remove Button */}
                                                                            {gates.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-outline-danger btn-sm"
                                                                                    onClick={() => removeGate(index)}
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {/* Gate Input */}
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Enter gate name (e.g. Gate A, VIP Entry)"
                                                                            required
                                                                            value={gate.name}
                                                                            onChange={(e) =>
                                                                                handleGateChange(index, e.target.value)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {/* Bottom Section */}
                                                            <div className="col-12 mt-2">
                                                                <div className="d-flex justify-content-between align-items-center border-top pt-3">

                                                                    <small className="text-muted">
                                                                        You can add multiple gates for this event
                                                                    </small>

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-success px-3"
                                                                        onClick={addGate}
                                                                    >
                                                                        + Add Gate
                                                                    </button>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>



                                                {/* ================= EXHIBITORS ================= */}
                                                <div className="col-12">
                                                    <div className="form-check mb-3">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="gateExhibitors"
                                                            checked={enableExhibitors}
                                                            onChange={handleExhibitorsToggle}
                                                        />
                                                        <label className="form-check-label fw-semibold" htmlFor="gateExhibitors">
                                                            Add Exhibitors for this Event
                                                        </label>
                                                    </div>

                                                    {enableExhibitors && (
                                                        <div className="row">
                                                            {exhibitors.map((ex, index) => (
                                                                <div className="col-md-6 mb-3" key={index}>
                                                                    <div className="border rounded-4 p-4 bg-white shadow-sm">

                                                                        {/* Gate Title */}
                                                                        <div className="d-flex justify-content-between mb-3">
                                                                            <label className="fw-semibold">
                                                                                Exhibitor {index + 1}
                                                                            </label>

                                                                            {/* Remove Button */}
                                                                            {exhibitors.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-danger"
                                                                                    onClick={() => removeExhibitor(index)}
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        <input
                                                                            className="form-control mb-3"
                                                                            placeholder="Company Name"
                                                                            required
                                                                            value={ex.name}
                                                                            onChange={(e) =>
                                                                                handleExhibitorChange(index, "name", e.target.value)
                                                                            }
                                                                        />

                                                                        <input
                                                                            type="file"
                                                                            className="form-control mb-3"
                                                                            required
                                                                            onChange={(e) =>
                                                                                handleExhibitorChange(index, "image", e.target.files[0])
                                                                            }
                                                                        />
                                                                        {ex.image && (
                                                                                <div className="position-relative mb-3">
                                                                                    <img
                                                                                        src={
                                                                                            typeof ex.image === "string"
                                                                                                ? ex.image   // ✅ edit mode (URL from backend)
                                                                                                : URL.createObjectURL(ex.image) // ✅ new upload
                                                                                        }
                                                                                        className="img-fluid rounded"
                                                                                        style={{ height: "100px", objectFit: "cover" ,width:"100px" }}
                                                                                    /></div>
                                                                            )}

                                                                        <textarea
                                                                            className="form-control mb-3"
                                                                            rows="2"
                                                                            placeholder="Short Description"
                                                                            required
                                                                            value={ex.description}
                                                                            onChange={(e) =>
                                                                                handleExhibitorChange(index, "description", e.target.value)
                                                                            }
                                                                        />

                                                                        <input
                                                                            type="url"
                                                                            className="form-control"
                                                                            placeholder="https://company.com"
                                                                            required
                                                                            value={ex.website}
                                                                            onChange={(e) =>
                                                                                handleExhibitorChange(index, "website", e.target.value)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {/* Bottom Section */}
                                                            <div className="col-12 mt-2">
                                                                <div className="d-flex justify-content-between align-items-center border-top pt-3">

                                                                    <small className="text-muted">
                                                                        You can add multiple gates for this event
                                                                    </small>

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-success px-3"
                                                                        onClick={addExhibitor}
                                                                    >
                                                                        + Add Exhibitor
                                                                    </button>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ================= GALLERY ================= */}
                                                <div className="col-12">
                                                    <div className="form-check mb-3">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                             id="gallery"
                                                            checked={enableGallery}
                                                            onChange={handleGalleryToggle}
                                                        />
                                                        <label className="form-check-label fw-semibold" htmlFor="gallery">
                                                            Add Event Gallery
                                                        </label>
                                                    </div>

                                                    {enableGallery && (
                                                        <div className="row">

                                                            {/* Upload Input */}
                                                            <div className="col-4 mb-3">
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    required
                                                                    className="form-control"
                                                                    onChange={handleGalleryUpload}
                                                                />
                                                            </div>

                                                            {/* Images Preview */}
                                                            {gallery.map((img, index) => (
                                                                <div className="col-md-3 mb-3" key={index}>
                                                                    <div className="position-relative">

                                                                        <img
                                                                            src={
                                                                                typeof img === "string"
                                                                                    ? img
                                                                                    : URL.createObjectURL(img)
                                                                            }
                                                                            className="img-fluid rounded-3"
                                                                        />

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                                            onClick={() => removeGallery(index)}
                                                                        >
                                                                            ×
                                                                        </button>

                                                                    </div>
                                                                </div>
                                                            ))}

                                                        

                                                        </div>
                                                    )}
                                                </div>

                                                {/* ================= SLIDERS ================= */}
                                                <div className="col-12">
                                                    {/* Checkbox */}
                                                    <div className="form-check mb-3">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="sliderCheck"
                                                            checked={enableSliders}
                                                            onChange={handleSlidersToggle}
                                                        />
                                                        <label className="form-check-label fw-semibold" htmlFor="sliderCheck">
                                                            Add Slider for this Event
                                                        </label>
                                                    </div>

                                                    {enableSliders && (
                                                        <div className="border rounded-4 p-4 bg-white shadow-sm">
                                                            {/* <div className="col-4 mb-3"> */}
                                                            {/* Upload */}
                                                            <input
                                                                type="file"
                                                                multiple
                                                                required
                                                                accept="image/*"
                                                                className="form-control mb-2"
                                                                onChange={handleSliderImages}
                                                            />

                                                            <small className="text-muted">
                                                                Drag & drop images to reorder. First image will be primary.
                                                            </small>

                                                            {/* 🔥 DRAG AREA */}
                                                            <DragDropContext onDragEnd={handleDragEnd}>
                                                                <Droppable droppableId="sliderImages" direction="horizontal">
                                                                    {(provided) => (
                                                                        <div
                                                                            className="row mt-3"
                                                                            ref={provided.innerRef}
                                                                            {...provided.droppableProps}
                                                                        >
                                                                            {slider.images.map((img, index) => (
                                                                                <Draggable
                                                                                    key={index.toString()}
                                                                                    draggableId={index.toString()}
                                                                                    index={index}
                                                                                >
                                                                                    {(provided) => (
                                                                                        <div
                                                                                            className="col-md-3 mb-3"
                                                                                            ref={provided.innerRef}
                                                                                            {...provided.draggableProps}
                                                                                            {...provided.dragHandleProps}
                                                                                        >
                                                                                            <div className="position-relative border rounded p-2 bg-light">

                                                                                                {/* Primary Badge */}
                                                                                                {index === 0 && (
                                                                                                    <span className="badge bg-primary position-absolute top-0 start-0">
                                                                                                        Primary
                                                                                                    </span>
                                                                                                )}

                                                                                                {/* Image */}
                                                                                                <img
                                                                                                    src={URL.createObjectURL(img)}
                                                                                                    className="img-fluid rounded mb-2"
                                                                                                />

                                                                                                {/* Remove Button */}
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                                                                    onClick={() => removeSliderImage(index)}
                                                                                                >
                                                                                                    ×
                                                                                                </button>

                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </Draggable>
                                                                            ))}

                                                                            {provided.placeholder}
                                                                        </div>
                                                                    )}
                                                                </Droppable>
                                                            </DragDropContext>

                                                        </div>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div className="col-12">
                                                    <label className="form-label">Description</label>
                                                    <HtmlEditor
                                                        editorRef={noteRef}
                                                        initialContent={editorData.content}
                                                        onChange={(content) => editorData({ ...editorData, content })}
                                                    />
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
