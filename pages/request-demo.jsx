import React, { useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";
import api from "@/utils/api";

const RequestDemo = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/img/slider_bg9.jpg');
    const [date, setDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [description, setDescription] = useState("");
    const [agree, setAgree] = useState(false);
    const [countryCode, setCountryCode] = useState("");
    const timeSlots = [
        "12:00 AM", "12:30 PM", "1:00 PM", "1:30 PM",
        "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
        "6:00 PM", "6:30 PM", "7:00 PM"
    ];

    const isPastTime = (time) => {
        // const now = new Date();
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

        const selected = new Date(date);

        if (selected.toDateString() !== now.toDateString()) {
            return false;
        }
        const [timePart, modifier] = time.split(" ");
        let [hours, minutes] = timePart.split(":").map(Number);

        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0);

        return slotTime < now;
    };

    const validateForm = () => {

        if (!name.trim()) {
            Swal.fire("Error", "Name is required", "warning");
            return false;
        }

        if (!email.match(/^\S+@\S+\.\S+$/)) {
            Swal.fire("Error", "Valid email required", "warning");
            return false;
        }

        if (!countryCode) {
            Swal.fire("Error", "Please select country code", "warning");
            return false;
        }

        if (!mobile.match(/^[0-9]{7,15}$/)) {
            Swal.fire("Error", "Valid mobile number required", "warning");
            return false;
        }

        if (!selectedTime) {
            Swal.fire("Error", "Please select meeting time", "warning");
            return false;
        }

        if (!description.trim()) {
            Swal.fire("Error", "Meeting description required", "warning");
            return false;
        }

        if (!agree) {
            Swal.fire("Error", "Please accept Terms & Privacy Policy", "warning");
            return false;
        }

        return true;
    };
    const convertTo24Hour = (time12h) => {

        const [time, modifier] = time12h.trim().split(" ");
        let [hours, minutes] = time.split(":");

        hours = parseInt(hours, 10);

        if (modifier === "PM" && hours !== 12) {
            hours += 12;
        }

        if (modifier === "AM" && hours === 12) {
            hours = 0;
        }

        const formattedHours = hours.toString().padStart(2, "0");

        return `${formattedHours}:${minutes}:00`;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        const formattedTime = convertTo24Hour(selectedTime);
        const payload = {
            name,
            email,
            mobile,
            country_code: countryCode,
            description,
            date: date.toISOString().split("T")[0],
            time: formattedTime
        };

        Swal.fire({
            title: "Sending...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        setLoading(true);

        try {

            const res = await api.post("/api/v1/demo", payload);

            if (res.data?.success) {

                Swal.fire("Success", res.data.message, "success");

                setName("");
                setEmail("");
                setMobile("");
                setCountryCode("");
                setDescription("");
                setSelectedTime(null);
                setAgree(false);

            } else {
                Swal.fire("Error", res.data?.message || "Failed", "error");
            }

        } catch (err) {

            let errorMessage =
                err?.response?.data?.error?.message ||
                "Something went wrong";

            Swal.fire("Error", errorMessage, "error");

        } finally {
            setLoading(false);
        }
    };

    const countries = [
        { name: "Afghanistan", code: "+93" },
        { name: "Albania", code: "+355" },
        { name: "Algeria", code: "+213" },
        { name: "Andorra", code: "+376" },
        { name: "Angola", code: "+244" },
        { name: "Argentina", code: "+54" },
        { name: "Armenia", code: "+374" },
        { name: "Australia", code: "+61" },
        { name: "Austria", code: "+43" },
        { name: "Azerbaijan", code: "+994" },
        { name: "Bahrain", code: "+973" },
        { name: "Bangladesh", code: "+880" },
        { name: "Belarus", code: "+375" },
        { name: "Belgium", code: "+32" },
        { name: "Bhutan", code: "+975" },
        { name: "Bolivia", code: "+591" },
        { name: "Brazil", code: "+55" },
        { name: "Bulgaria", code: "+359" },
        { name: "Cambodia", code: "+855" },
        { name: "Canada", code: "+1" },
        { name: "Chile", code: "+56" },
        { name: "China", code: "+86" },
        { name: "Colombia", code: "+57" },
        { name: "Costa Rica", code: "+506" },
        { name: "Croatia", code: "+385" },
        { name: "Cuba", code: "+53" },
        { name: "Cyprus", code: "+357" },
        { name: "Czech Republic", code: "+420" },
        { name: "Denmark", code: "+45" },
        { name: "Dominican Republic", code: "+1" },
        { name: "Ecuador", code: "+593" },
        { name: "Egypt", code: "+20" },
        { name: "Estonia", code: "+372" },
        { name: "Finland", code: "+358" },
        { name: "France", code: "+33" },
        { name: "Germany", code: "+49" },
        { name: "Greece", code: "+30" },
        { name: "Hong Kong", code: "+852" },
        { name: "Hungary", code: "+36" },
        { name: "Iceland", code: "+354" },
        { name: "India", code: "+91" },
        { name: "Indonesia", code: "+62" },
        { name: "Iran", code: "+98" },
        { name: "Iraq", code: "+964" },
        { name: "Ireland", code: "+353" },
        { name: "Israel", code: "+972" },
        { name: "Italy", code: "+39" },
        { name: "Japan", code: "+81" },
        { name: "Jordan", code: "+962" },
        { name: "Kazakhstan", code: "+7" },
        { name: "Kenya", code: "+254" },
        { name: "Kuwait", code: "+965" },
        { name: "Kyrgyzstan", code: "+996" },
        { name: "Laos", code: "+856" },
        { name: "Latvia", code: "+371" },
        { name: "Lebanon", code: "+961" },
        { name: "Lithuania", code: "+370" },
        { name: "Luxembourg", code: "+352" },
        { name: "Malaysia", code: "+60" },
        { name: "Maldives", code: "+960" },
        { name: "Mexico", code: "+52" },
        { name: "Monaco", code: "+377" },
        { name: "Mongolia", code: "+976" },
        { name: "Morocco", code: "+212" },
        { name: "Nepal", code: "+977" },
        { name: "Netherlands", code: "+31" },
        { name: "New Zealand", code: "+64" },
        { name: "Nigeria", code: "+234" },
        { name: "North Korea", code: "+850" },
        { name: "Norway", code: "+47" },
        { name: "Oman", code: "+968" },
        { name: "Pakistan", code: "+92" },
        { name: "Panama", code: "+507" },
        { name: "Peru", code: "+51" },
        { name: "Philippines", code: "+63" },
        { name: "Poland", code: "+48" },
        { name: "Portugal", code: "+351" },
        { name: "Qatar", code: "+974" },
        { name: "Romania", code: "+40" },
        { name: "Russia", code: "+7" },
        { name: "Saudi Arabia", code: "+966" },
        { name: "Singapore", code: "+65" },
        { name: "Slovakia", code: "+421" },
        { name: "South Africa", code: "+27" },
        { name: "South Korea", code: "+82" },
        { name: "Spain", code: "+34" },
        { name: "Sri Lanka", code: "+94" },
        { name: "Sweden", code: "+46" },
        { name: "Switzerland", code: "+41" },
        { name: "Taiwan", code: "+886" },
        { name: "Thailand", code: "+66" },
        { name: "Turkey", code: "+90" },
        { name: "UAE", code: "+971" },
        { name: "UK", code: "+44" },
        { name: "USA", code: "+1" },
        { name: "Ukraine", code: "+380" },
        { name: "Uruguay", code: "+598" },
        { name: "Uzbekistan", code: "+998" },
        { name: "Vietnam", code: "+84" },
        { name: "Yemen", code: "+967" },
        { name: "Zimbabwe", code: "+263" }
    ];






    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            <section id="request-demo" className="py-5 px-0">
                <div className="container">
                    <div className="demo-innerconent bg-white">
                        <div className="row align-items-stretch">
                            <div className="col-lg-4">
                                <div className="meattingpgLeft h-100 d-flex flex-column justify-content-between">
                                    <div className="mobile-order-one">
                                        <h1 className="fw-bold">Schedule a Meeting</h1>
                                        <p className="body-text">For any information related to eboxtenants, Contact Us</p>
                                        <ul className="timingsMeetingUl p-0">
                                            {/* <li className="position-relative text-16"><i className="far fa-calendar"></i> 2024-06-20</li>
                                            <li className="position-relative text-16"><i className="far fa-clock"></i> 1:30 pm</li> */}
                                            <li className="position-relative text-16">
                                                <i className="far fa-calendar"></i> {date.toDateString()}
                                            </li>

                                            <li className="position-relative text-16">
                                                <i className="far fa-clock"></i> {selectedTime || "Select Time"}
                                            </li>
                                        </ul>
                                    </div>
                                    <img src="https://eboxtickets.com/images/meetingTeamImg.svg" className="contactImg" alt="Meeting"></img>
                                </div>
                            </div>
                            <div className="col-lg-8">
                                <div className="meattingpgRgt p-30">

                                    <div className="d-flex gap-3 flex-wrap flex-sm-nowrap">

                                        <div className="calender-box">
                                            {/* <img src="/assets/img/demo-celender.png" alt="slider" /> */}
                                            <div className="calendar-wrapper">
                                                <Calendar
                                                    onChange={setDate}
                                                    minDate={new Date()}
                                                    value={date} />,
                                            </div>
                                        </div>

                                        <div className="mettingTimingsDv">

                                            <ul className="d-flex flex-column ps-0">
                                                {timeSlots.map((time, index) => {
                                                    const disabled = isPastTime(time);

                                                    return (
                                                        <li key={index} className={selectedTime === time ? "meatingBtnsActive" : ""}>

                                                            <a
                                                                className="meatingTimeBtn text-center text-16"
                                                                onClick={() => {
                                                                    if (!disabled) setSelectedTime(time);
                                                                }}
                                                                style={{
                                                                    pointerEvents: disabled ? "none" : "auto",
                                                                    opacity: disabled ? 0.5 : 1,
                                                                    cursor: disabled ? "not-allowed" : "pointer"
                                                                }}
                                                            >
                                                                {time}
                                                            </a>

                                                            <a
                                                                className="nextbtnMeating text-center text-16"
                                                                style={{
                                                                    pointerEvents: selectedTime === time ? "auto" : "none",
                                                                    opacity: selectedTime === time ? 1 : 0.5
                                                                }}
                                                            >
                                                                Next
                                                            </a>

                                                        </li>
                                                    );
                                                })}
                                            </ul>


                                            {/* <ul className="d-flex flex-column ps-0">
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">12:00 am</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">12:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">1:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li className="meatingBtnsActive">
                                                    <a className="meatingTimeBtn text-center text-16">1:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">2:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">2:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">3:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">3:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">6:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">6:30 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                                <li>
                                                    <a className="meatingTimeBtn text-center text-16">7:00 pm</a>
                                                    <a className="nextbtnMeating text-center text-16">Next</a>
                                                </li>
                                            </ul> */}
                                        </div>

                                    </div>
                                    <div className="meatingForm">
                                        <h3 className="fw-bold">Enter Your Details</h3>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3 row">
                                                <div className="col-md-12">
                                                    <div className="form-floating mb-3">
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            className="form-control"
                                                            placeholder="Name"
                                                            required
                                                            value={name}
                                                            onChange={(e) => {
                                                                setName(e.target.value)
                                                            }}
                                                        />
                                                        <label>Name</label>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-floating mb-3">
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            className="form-control"
                                                            placeholder="Email"
                                                            required
                                                            value={email}
                                                            onChange={(e) => {
                                                                setEmail(e.target.value)
                                                            }}
                                                        />
                                                        <label>Email Address</label>
                                                    </div>
                                                </div>

                                                <div className="col-md-12 d-flex flex-wrap flex-sm-nowrap gap-3 gap-sm-0">
                                                    <div className="me-2 w-20 w-md-25">
                                                        <select
                                                            name="countryCode"
                                                            className="form-select"
                                                            required
                                                            value={countryCode}
                                                            onChange={(e) => setCountryCode(e.target.value)}
                                                        >

                                                            <option value="">--Select Country--</option>

                                                            {countries.map((country, index) => (
                                                                <option key={index} value={country.code}>
                                                                    {country.name} ({country.code})
                                                                </option>
                                                            ))}

                                                        </select>
                                                    </div>
                                                    <div className="flex-grow-1 phone-numberinput">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="number"
                                                                name="phoneNumber"
                                                                className="form-control"
                                                                placeholder="Phone Number"
                                                                required
                                                                value={mobile}
                                                                onChange={(e) => {
                                                                    setMobile(e.target.value)
                                                                }}
                                                            />
                                                            <label>Phone Number</label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-floating mb-3">
                                                        <textarea
                                                            name="meetingDescription"
                                                            className="form-control"
                                                            placeholder="Meeting Description"
                                                            style={{ height: "120px" }}
                                                            required
                                                            value={description}
                                                            onChange={(e) => {
                                                                setDescription(e.target.value)
                                                            }}
                                                        ></textarea>
                                                        <label>Meeting Description</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-check mb-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    name="agreeTerms"
                                                    required
                                                    checked={agree}
                                                    onChange={(e) => setAgree(e.target.checked)}
                                                />
                                                <label className="form-check-label body-text">
                                                    By proceeding, you confirm that you accept our{" "}
                                                    <a
                                                        href="https://eboxtickets.com/pages/privacy-policy"
                                                        className="btn button-linkcolor p-0 m-0 align-baseline"
                                                        target="_blank"
                                                    >
                                                        Privacy Policy
                                                    </a>{" "}
                                                    and{" "}
                                                    <a
                                                        href="https://eboxtickets.com/pages/terms-and-conditions"
                                                        className="btn button-linkcolor p-0 m-0 align-baseline"
                                                        target="_blank"
                                                    >
                                                        Terms of Use
                                                    </a>
                                                    .
                                                </label>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <button type="button" className="btn btn-primary">
                                                    Back
                                                </button>
                                                {/* <button type="submit" className="btn btn-primary">
                                                    Submit
                                                </button> */}

                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                    {loading ? "Submitting..." : "Submit"}
                                                </button>

                                            </div>
                                        </form>
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

export default RequestDemo;
