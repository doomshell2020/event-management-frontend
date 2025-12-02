import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import api from "@/utils/api";
import Swal from "sweetalert2";
import moment from "moment-timezone"; // ✅ Import moment-timezone
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";
import { useRouter } from 'next/router';

const CreateAppointmentPage = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const router = useRouter();
    const EventId = router.query.eventId || "";
    const today = new Date().toISOString().split("T")[0];
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [paymentCurrency, setPaymentCurrency] = useState("");
    const [image, setImage] = useState(null);
    const noteRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const content = getHtmlEditorContent(noteRef);
    const [editorData, setEditorData] = useState({ content: "" });

    const handleChange = (index, field, value) => {
        const updatedSlots = [...slots];
        updatedSlots[index][field] = value;

        const start = updatedSlots[index].slot_start_time;
        const end = updatedSlots[index].slot_end_time;
        // ✅ End time must be greater than Start time
        if (start && end && start >= end) {
            // alert("End time must be greater than Start time");
            Swal.fire({
                    icon: "error",
                    title: "Oops!",
                    text: 'End time must be greater than Start time',
                });
            updatedSlots[index].slot_end_time = "";
        }
        setSlots(updatedSlots);
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



    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const [slots, setSlots] = useState([
        {
            date: "",
            slot_start_time: "",
            slot_end_time: "",
            price: "",
            slot_location: "",
            count: "",
        }
    ]);

    // Add More Slot
    const handleAddMore = () => {
        setSlots([
            ...slots,
            {
                date: "",
                slot_start_time: "",
                slot_end_time: "",
                price: "",
                slot_location: "",
                count: "",
            }
        ]);
    };
    const handleRemove = (index) => {
        const newSlots = slots.filter((_, i) => i !== index);
        setSlots(newSlots);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsLoading(true);
        try {
            // ✅ Ensure slots is sent as JSON string
            const slotsJSON = JSON.stringify(slots);
            // ✅ FormData object
            const body = new FormData();
            body.append("name", name.trim());
            body.append("currency", paymentCurrency);
            body.append("event_id",EventId );
            body.append("location", location || "");
            body.append("description", content.trim());
            body.append("slots", slotsJSON);
            // ✅ Append image only if user selected
            if (image) {
                body.append("wellnessImage", image);
            }
            const response = await api.post("/api/v1/wellness/create-slots", body, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const resData = response.data;
            if (resData?.success) {
                Swal.fire("Success", resData?.message ?? "Appointment created successfully!", "success");
                router.push(`/appointments/${EventId}`)
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
            }
        } catch (error) {
            console.error("Submit Error:", error);
        } finally {
            setIsLoading(false);
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
                                    <p className="des_h mb-0">Create Appointment</p>
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

                                {/* -------------------- TITLE -------------------- */}
                                <h2 className="text-16 text-white text-uppercase position-relative text-start fw-bold">
                                    <i className="far fa-calendar-plus"></i> Create Appointment
                                </h2>

                                {/* ---------------- SINGLE FORM START ---------------- */}
                                <form onSubmit={handleSubmit}>

                                    {/* -------------------- APPOINTMENT INFO -------------------- */}
                                    <div className="inner-formdeta p-4 text-start fs-6 fw-normal">

                                        <h4 className="fw-bold">Appointment Info</h4>

                                        <div className="resistor-content">
                                            <div className="row g-3">

                                                {/* Appointment Name */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">
                                                        Appointment Name <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-0"
                                                        name="name"
                                                        placeholder="Appointment Name"
                                                        required
                                                        value={name}
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/[~!@$%^&*()_+=\\|/?`{}[\];:'",.<>\s]/g, ' ');
                                                            setName(value);
                                                        }}
                                                    />
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
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        placeholder="Location"
                                                    />
                                                </div>

                                                {/* Currency */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">Currency</label>
                                                    <select
                                                        className="form-select rounded-0"
                                                        name="payment_currency"
                                                        value={paymentCurrency}
                                                        onChange={(e) => setPaymentCurrency(e.target.value)}
                                                    >
                                                        <option value="">Payment Type</option>
                                                        <option value="1">INR</option>
                                                        <option value="2">USD</option>
                                                    </select>
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
                                                        accept=".jpg, .jpeg, .png"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;

                                                            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
                                                            if (!allowedTypes.includes(file.type)) {
                                                                Swal.fire("Invalid File", "Only JPG, JPEG, PNG allowed.", "error");
                                                                e.target.value = "";
                                                                return;
                                                            }

                                                            const maxSize = 2 * 1024 * 1024;
                                                            if (file.size > maxSize) {
                                                                Swal.fire("File Too Large", "Maximum size 2 MB.", "warning");
                                                                e.target.value = "";
                                                                return;
                                                            }

                                                            handleFileChange(e);
                                                        }}
                                                    />
                                                </div>

                                                {/* Description */}
                                                <div className="col-12">
                                                    <label className="form-label">Description</label>

                                                    <HtmlEditor
                                                        editorRef={noteRef}
                                                        initialContent={editorData.content}
                                                        onChange={(content) =>
                                                            setEditorData({ ...editorData, content })
                                                        }
                                                    />
                                                </div>

                                            </div>
                                        </div>

                                    </div>

                                    {/* -------------------- SLOT SECTION -------------------- */}
                                    <h2 className="text-16 text-white text-uppercase position-relative text-start fw-bold mt-3">
                                        <i className="far fa-calendar-plus"></i> Add Appointment Slots
                                    </h2>

                                    <div className="inner-formdeta p-4 text-start fs-6 fw-normal">
                                        <div className="resistor-content">
                                            {slots.map((slot, index) => (
                                                <div className="row g-3" key={index}>

                                                    {/* Date */}
                                                    <div className="col-lg-2 col-md-6 mb-3">
                                                        <label className="form-label">
                                                            Date <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="form-control rounded-0"
                                                            name="slot_date"
                                                            required
                                                            min={today}
                                                            value={slot.date}
                                                            onChange={(e) => handleChange(index, "date", e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Start Time */}
                                                    <div className="col-lg-2 col-md-6 mb-3">
                                                        <label className="form-label">Start Time <span className="text-danger">*</span></label>
                                                        <input
                                                            type="time"
                                                            className="form-control rounded-0"
                                                            name="slot_start"
                                                            value={slot.slot_start_time}
                                                            onChange={(e) => handleChange(index, "slot_start_time", e.target.value)}
                                                        />

                                                    </div>

                                                    {/* End Time */}
                                                    <div className="col-lg-2 col-md-6 mb-3">
                                                        <label className="form-label">End Time <span className="text-danger">*</span></label>
                                                        <input
                                                            type="time"
                                                            className="form-control rounded-0"
                                                            name="slot_end"
                                                            required
                                                            value={slot.slot_end_time}
                                                            onChange={(e) => handleChange(index, "slot_end_time", e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Price */}
                                                    <div className="col-lg-2 col-md-6 mb-3">
                                                        <label className="form-label">Price <span className="text-danger">*</span></label>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-0"
                                                            name="slot_price"
                                                            required
                                                            value={slot.price}
                                                            onChange={(e) => handleChange(index, "price", e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Slot Location */}
                                                    <div className="col-lg-2 col-md-6 mb-3">
                                                        <label className="form-label">Slot Location</label>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-0"
                                                            name="slot_location"
                                                            value={slot.slot_location}
                                                            onChange={(e) => handleChange(index, "slot_location", e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Count */}
                                                    <div className="col-lg-2 col-md-6 mb-3">
                                                        <label className="form-label">Count <span className="text-danger">*</span></label>
                                                        <input
                                                            type="number"
                                                            className="form-control rounded-0"
                                                            name="slot_count"
                                                            required
                                                            value={slot.count}
                                                            onChange={(e) => handleChange(index, "count", e.target.value)}
                                                        />
                                                    </div>

                                                    {/* REMOVE BUTTON (RIGHT SIDE) */}
                                                    <div className="col-lg-12 d-flex justify-content-end mt-3">
                                                        {index !== 0 && (<button type="button" className="primery-button"
                                                            onClick={() => handleRemove(index)}
                                                        >
                                                            Remove
                                                        </button>
                                                        )}
                                                    </div>

                                                </div>

                                            ))}


                                            <div className="col-lg-12 d-flex justify-content-end mt-1">

                                                <button
                                                    type="button"
                                                    className="primery-button fw-normal px-2 text-white"
                                                    style={{ backgroundColor: "#00ad00" }}
                                                    onClick={handleAddMore}
                                                >
                                                    <i className="bi bi-plus"></i> Add More
                                                </button>
                                            </div>


                                            {/* ---------------- SUBMIT BUTTON ---------------- */}
                                            <div className="text-center mt-4">
                                                <button type="submit" className="primery-button px-4" disabled={isLoading}>
                                                    {isLoading ? "Creating..." : "Create Appointment"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                                {/* ---------------- SINGLE FORM END ---------------- */}

                            </div>

                        </div>
                    </div>
                </div>
            </section>
            <FrontendFooter />
        </>
    );
};

export default CreateAppointmentPage;
