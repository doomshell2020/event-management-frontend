// new page design
import React, { useState, useEffect } from "react";
import { Card, Spinner, Col } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from 'next/router';
import api from "@/utils/api";
import {
    CForm,
    CCol,
    CFormLabel,
    CFormInput,
    CButton,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";

const EventOrganizerEdit = () => {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [emailError, setEmailError] = useState("");
    const [error, setError] = useState("");

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



    const fetchOrganizersDetails = async (id) => {
        if (!id) return;

        setIsLoading(true);

        try {
            const { data } = await api.get(
                `/api/v1/admin/event-organizer/${id}`
            );

            const organizer = data?.data;

            if (organizer) {
                setFirstName(organizer.first_name || "");
                setEmail(organizer.email || "");
                setMobile(organizer.mobile || "");
            }
        } catch (error) {
            console.error("Failed to fetch organizer details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizersDetails(id);
    }, [id]);

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
        setBtnLoading(true);
        try {
            const payload = {
                first_name: firstName.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
            };
            const res = await api.put(`/api/v1/admin/event-organizer/${id}`, payload);
            if (res.data?.success) {
                setBtnLoading(false);
                const result = await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: res.data.message || "Event organizer update successfully!",
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
            setBtnLoading(false);
            setValidateDefault(true);
        }
    };


    return (
        <div>
            <Seo title={"Event Organizers Edit"} />
            {/* <!--Row--> */}
            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        {/* HEADER */}
                        <Card.Header>
                            <h3 className="card-title mb-0">Edit Event Organizer</h3>
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
                                        disabled={btnLoading}
                                        style={{ minWidth: "120px" }}
                                    >
                                        {btnLoading ? (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            "Update"
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

EventOrganizerEdit.propTypes = {};

EventOrganizerEdit.defaultProps = {};

EventOrganizerEdit.layout = "Contentlayout"

export default EventOrganizerEdit;
