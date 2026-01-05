// new page design
import React, { useState, useEffect, useRef } from "react";
import axios from "axios"
import { Breadcrumb, Card, Spinner, Col, Row } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from 'next/router';
import api from "@/utils/api";
import {
    CForm,
    CCol,
    CFormLabel,
    CFormInput,
    CButton,
    CFormSelect,
    CFormFeedback
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";

const EventOrganizerCreate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [emailError, setEmailError] = useState("");
    const [error, setError] = useState("");

    // Route Change
    let router = useRouter();

    const [emailTouched, setEmailTouched] = useState(false);
    //  Email Validation
    const validateEmail = (email) => {
        if (!email) {
            setError(emailTouched ? "" : "");
            setEmail("")
            return false;
        }
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            setError("Invalid email format!");
            return false;
        }
        setError("");
        return true;
    };


    const [validateDefault, setValidateDefault] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        // Frontend validation
        if (
            !form.checkValidity() ||
            error === "Invalid email format!" ||
            emailError === "Invalid email format!"
        ) {
            event.stopPropagation();
            setValidateDefault(true);
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please fill all required fields correctly.",
            });
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                first_name: firstName.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
            };
            const res = await api.post("/api/v1/admin/event-organizer", payload);
            if (res.data?.success) {
                const result = await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Event organizer added successfully!",
                    confirmButtonText: "OK",
                });

                if (result.isConfirmed) {
                    router.push("/admin/event-organizers");
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: res.data?.message || "Something went wrong. Please try again.",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: err?.response?.data?.error?.message || "Internal server error",
            });
        } finally {
            setIsLoading(false);
            setValidateDefault(true);
        }
    };


    return (
        <div>
            <Seo title={"Event Organizers Create"} />
            {/* <!--Row--> */}
            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        {/* HEADER */}
                        <Card.Header>
                            <h3 className="card-title mb-0">Add Event Organizer</h3>
                        </Card.Header>
                        {/* BODY */}
                        <Card.Body>
                            <CForm
                                className="row g-3 needs-validation housing-addflow"
                                noValidate
                                validated={validateDefault}
                                onSubmit={handleSubmit}
                            >
                                {/* Organizer Name */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Event Organizer <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Event Organizer"
                                        required
                                        value={firstName}
                                        onChange={(e) => {
                                            let inputValue = e.target.value;
                                            inputValue = inputValue.replace(/[^a-zA-Z\s]/g, "");
                                            setFirstName(inputValue);
                                        }}
                                    />
                                </CCol>

                                {/* Email */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Event Organizer Email <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="email"
                                        placeholder="Event Organizer Email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setEmailTouched(true);
                                            validateEmail(e.target.value);
                                        }}
                                        onBlur={() => {
                                            setEmailTouched(true);
                                            validateEmail(email);
                                        }}
                                        className={emailTouched && error ? "is-invalid" : ""}
                                        feedbackInvalid={error}
                                    />
                                </CCol>

                                {/* Mobile */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Event Organizer Mobile <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="number"
                                        placeholder="Event Organizer Mobile"
                                        required
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                    />
                                </CCol>

                                {/* ACTION BUTTONS */}
                                <CCol
                                    md={12}
                                    className="mt-4 d-flex gap-2"
                                >
                                    <Link href="/admin/event-organizers">
                                        <CButton color="secondary">
                                            Back
                                        </CButton>
                                    </Link>

                                    <CButton
                                        color="success"
                                        type="submit"
                                        disabled={isLoading}
                                        style={{ minWidth: "120px" }}
                                    >
                                        {isLoading ? (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            "Submit"
                                        )}
                                    </CButton>
                                </CCol>

                            </CForm>
                        </Card.Body>
                    </Card>
                </Col>


            </div>
            {/* <!--/Row--> */}
        </div >
    );
}

EventOrganizerCreate.propTypes = {};

EventOrganizerCreate.defaultProps = {};

EventOrganizerCreate.layout = "Contentlayout"

export default EventOrganizerCreate;
