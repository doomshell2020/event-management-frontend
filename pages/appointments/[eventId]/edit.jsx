import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import api from "@/utils/api";
import Swal from "sweetalert2";
import moment from "moment-timezone"; // ✅ Import moment-timezone
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";
import { useRouter } from 'next/router';
import DatePicker from "react-datepicker";



const EditAppointmentPage = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const router = useRouter();
    const AppointmentId = router.query.eventId || "";
    const today = new Date().toISOString().split("T")[0];
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    // const [paymentCurrency, setPaymentCurrency] = useState("");
    const [isTaxApplied, setIsTaxApplied] = useState("");
    const [image, setImage] = useState(null);
    const [eventID, setEventID] = useState("");
    const noteRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    // const content = getHtmlEditorContent(noteRef);
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
        if (!AppointmentId) return;

        const fetchWellness = async () => {
            try {
                const { data } = await api.get(`/api/v1/wellness/wellness/${AppointmentId}`);
                const wellness = data?.data?.wellness;
                if (!data?.success || !wellness) {
                    console.error("Invalid API response:-", data);
                    return;
                }
                setName(wellness.name ?? "");
                setLocation(wellness.location ?? "");
                // setPaymentCurrency(wellness.currency ?? "");
                setEditorData({ content: wellness.description ?? "" });
                setEventID(wellness.event_id);
                setIsTaxApplied(wellness.tax_applied);
                setSlots(wellness.wellnessSlots ?? []);
            } catch (error) {
                console.error("Error fetching wellness:", error);
            }
        };

        fetchWellness();
    }, [AppointmentId]);




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
        const content = getHtmlEditorContent(noteRef).trim();
        try {
            // ✅ Ensure slots is sent as JSON string
            const slotsJSON = JSON.stringify(slots);
            // ✅ FormData object
            const body = new FormData();
            body.append("name", name.trim());
            // body.append("currency", paymentCurrency);
            body.append("event_id", eventID);
            body.append("location", location || "");
            body.append("description", content);
            body.append("slots", slotsJSON);
            body.append("tax_applied", isTaxApplied);

            // ✅ Append image only if user selected
            if (image) {
                body.append("wellnessImage", image);
            }
            // ✅ API Call
            const response = await api.put(`/api/v1/wellness/update-wellness/${AppointmentId}`, body, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const resData = response.data;
            if (resData?.success) {
                Swal.fire("Success", resData?.message ?? "Appointment created successfully!", "success");
                router.push(`/appointments/${eventID}`)
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
                                    <p className="des_h mb-0">Update Appointment</p>
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
                                    <i className="far fa-calendar-plus"></i> Update Appointment
                                </h2>

                                {/* ---------------- SINGLE FORM START ---------------- */}
                                <form onSubmit={handleSubmit}>

                                    {/* -------------------- APPOINTMENT INFO -------------------- */}
                                    <div className="inner-formdeta p-4 text-start fs-6 fw-normal">

                                        <h4 className="fw-bold">Appointment Info</h4>

                                        <div className="resistor-content">
                                            <div className="row g-3">

                                                {/* Appointment Name */}
                                                <div className="col-lg-2 col-md-6 mb-3">
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
                                                <div className="col-lg-2 col-md-6 mb-3">
                                                    <label className="form-label">
                                                        Location <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="form-control rounded-0"
                                                        name="location"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        placeholder="Location"
                                                    />
                                                </div>

                                                {/* Currency */}
                                                {/* <div className="col-lg-2 col-md-6 mb-3">
                                                    <label className="form-label">Currency <span className="text-danger">*</span></label>
                                                    <select
                                                        className="form-select rounded-0"
                                                        name="payment_currency"
                                                        required
                                                        value={paymentCurrency}
                                                        onChange={(e) => setPaymentCurrency(e.target.value)}
                                                    >
                                                        <option value="">Payment Type</option>
                                                        <option value="1">INR</option>
                                                        <option value="2">USD</option>
                                                    </select>
                                                </div> */}


                                                {/* NEW – Include Tax Option */}
                                                <div className="col-lg-2 col-md-6 mb-3">
                                                    <label className="form-label">
                                                        Include Tax<span className="text-danger">*</span>
                                                    </label>

                                                    <select
                                                        className="form-select rounded-0"
                                                        required
                                                        name="is_tax_applied"
                                                        value={isTaxApplied}
                                                        onChange={(e) => setIsTaxApplied(e.target.value)}
                                                    >
                                                        <option value="">Select Option</option>
                                                        <option value="Y">Yes, Include Tax</option>
                                                        <option value="N">No, Exclude Tax</option>
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
                                                        onChange={(content) => setEditorData({ ...editorData, content })}
                                                    />



                                                    {/* <HtmlEditor
                                                        editorRef={noteRef}
                                                        initialContent={editorData.content}
                                                        onChange={(content) =>
                                                            setEditorData({ ...editorData, content })
                                                        }
                                                    /> */}
                                                </div>

                                            </div>
                                        </div>

                                    </div>

                                    {/* -------------------- SLOT SECTION -------------------- */}
                                    <h2 className="text-16 text-white text-uppercase position-relative text-start fw-bold mt-3">
                                        <i className="far fa-calendar-plus"></i> Update Appointment Slots
                                    </h2>

                                    <div className="inner-formdeta p-4 text-start fs-6 fw-normal">
                                        <div className="resistor-content">

                                            {slots.map((slot, index) => {

                                                // Inline Styles
                                                const formControlStyle = {
                                                    height: "38px",
                                                    borderRadius: "4px"
                                                };

                                                const labelStyle = {
                                                    fontWeight: 500
                                                };

                                                const slotRowDefault = {
                                                    transition: "0.3s",
                                                    borderBottom: "1px solid #f1f1f1",
                                                    paddingBottom: "20px",
                                                    marginBottom: "20px"
                                                };

                                                const slotRowHover = {
                                                    background: "#fafafa",
                                                    borderRadius: "6px"
                                                };

                                                return (
                                                    <div
                                                        key={index}
                                                        className="row gy-3 align-items-end"
                                                        style={slotRowDefault}
                                                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, slotRowHover)}
                                                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, slotRowDefault)}
                                                    >

                                                        {/* Date */}
                                                        <div className="col-lg-2 col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Date <span className="text-danger">*</span>
                                                            </label>
                                                            <DatePicker
                                                                selected={slot.date ? new Date(slot.date) : null}
                                                                // onChange={(date) =>
                                                                //     handleChange(index, "date", date.toISOString().split("T")[0])
                                                                // }
                                                                onChange={(date) => {
                                                                    const formattedDate = date.toLocaleDateString("en-CA"); // yyyy-mm-dd
                                                                    handleChange(index, "date", formattedDate);
                                                                }}
                                                                required
                                                                className="form-control"
                                                                style={formControlStyle}
                                                                minDate={new Date()}
                                                                dateFormat="yyyy-MM-dd"
                                                                placeholderText="Select Date"
                                                            />
                                                        </div>

                                                        {/* Start Time */}
                                                        <div className="col-lg-2 col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Start Time <span className="text-danger">*</span>
                                                            </label>

                                                            <DatePicker
                                                                selected={
                                                                    slot.slot_start_time
                                                                        ? new Date(`2000-01-01T${slot.slot_start_time}`)
                                                                        : null
                                                                }
                                                                onChange={(date) => {
                                                                    const dbTime = date.toLocaleTimeString("en-GB", {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: false
                                                                    });
                                                                    handleChange(index, "slot_start_time", dbTime);
                                                                }}
                                                                required
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={5}
                                                                timeCaption="Start Time"
                                                                dateFormat="h:mm aa"
                                                                className="form-control"
                                                                style={formControlStyle}
                                                                placeholderText="Start Time"
                                                            />
                                                        </div>

                                                        {/* End Time */}
                                                        <div className="col-lg-2 col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                End Time <span className="text-danger">*</span>
                                                            </label>

                                                            <DatePicker
                                                                selected={
                                                                    slot.slot_end_time
                                                                        ? new Date(`2000-01-01T${slot.slot_end_time}`)
                                                                        : null
                                                                }
                                                                onChange={(date) => {
                                                                    const dbTime = date.toLocaleTimeString("en-GB", {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: false
                                                                    });
                                                                    handleChange(index, "slot_end_time", dbTime);
                                                                }}
                                                                required
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={5}
                                                                timeCaption="End Time"
                                                                dateFormat="h:mm aa"
                                                                className="form-control"
                                                                style={formControlStyle}
                                                                placeholderText="End Time"
                                                            />
                                                        </div>

                                                        {/* Price */}
                                                        <div className="col-lg-2 col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Price <span className="text-danger">*</span>
                                                            </label>

                                                            <input
                                                                type="text"
                                                                required
                                                                className="form-control"
                                                                style={formControlStyle}
                                                                value={slot.price}
                                                                // onChange={(e) => handleChange(index, "price", e.target.value)}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                                                    handleChange(index, "price", value);
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Count */}
                                                        <div className="col-lg-2 col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Count <span className="text-danger">*</span>
                                                            </label>

                                                            <input
                                                                type="text"
                                                                required
                                                                className="form-control"
                                                                style={formControlStyle}
                                                                value={slot.count}
                                                                // onChange={(e) => handleChange(index, "count", e.target.value)}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                                                    handleChange(index, "count", value);
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Buttons */}
                                                        <div className="col-lg-2 col-md-6 d-flex flex-column align-items-end gap-2">

                                                            {/* Remove button */}
                                                            {index !== 0 && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        backgroundColor: "#ff6b6b",
                                                                        color: "#fff",
                                                                        minWidth: "110px",
                                                                        borderRadius: "4px"
                                                                    }}
                                                                    onClick={() => handleRemove(index)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}

                                                            {/* Add More button */}
                                                            {index === slots.length - 1 && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        backgroundColor: "#16a34a",
                                                                        color: "#fff",
                                                                        minWidth: "110px",
                                                                        borderRadius: "4px"
                                                                    }}
                                                                    onClick={handleAddMore}
                                                                >
                                                                    <i className="bi bi-plus-lg me-1"></i> Add More
                                                                </button>
                                                            )}

                                                        </div>

                                                    </div>
                                                );
                                            })}

                                            {/* Submit Button */}
                                            <div className="text-center mt-4">
                                                <button
                                                    type="submit"
                                                    className="primery-button px-4"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Updating..." : "Update Appointment"}
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

export default EditAppointmentPage;
