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

    // Basic Fields
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");

    // REQUIRED NEW FIELDS
    const [platformFee, setPlatformFee] = useState("");
    const [autoApprove, setAutoApprove] = useState("N");

    // Validation States
    const [emailError, setEmailError] = useState("");
    const [validateDefault, setValidateDefault] = useState(false);

    // Email Validation Function
    const validateEmail = (email) => {
        if (!email) {
            setEmailError("Email is required");
            return false;
        }

        const emailPattern =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            setEmailError("Invalid email format!");
            return false;
        }

        setEmailError("");
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
            // console.log('organizer :', organizer);

            if (organizer) {
                setFirstName(organizer.first_name || "");
                setEmail(organizer.email || "");
                setMobile(organizer.mobile || "");

                // ONLY REQUIRED FIELDS
                setPlatformFee(organizer.default_platform_charges || "");
                setAutoApprove(organizer.admin_approval_required || "N");
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        // Email Validation
        if (!validateEmail(email)) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please enter a valid email.",
            });
            return;
        }

        // Platform Fee Validation
        if (platformFee == "") {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Platform Fee is required.",
            });
            return;
        }

        if (Number(platformFee) < 0) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Platform Fee cannot be negative.",
            });
            return;
        }

        if (!form.checkValidity()) {
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
                platform_fee: platformFee,
                auto_approve_events: autoApprove,
            };

            const res = await api.put(
                `/api/v1/admin/event-organizer/${id}`,
                payload
            );

            if (res.data?.success) {
                setBtnLoading(false);

                const result = await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text:
                        res.data.message ||
                        "Event organizer updated successfully!",
                    confirmButtonText: "OK",
                });

                if (result.isConfirmed) {
                    router.push("/admin/event-organizers");
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text:
                        res.data?.message ||
                        "Something went wrong. Please try again.",
                });
            }
        } catch (err) {

            const apiErrorMsg =
                err.response?.data?.error?.details?.[0]?.msg ||
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                err.message ||
                "Something went wrong. Please try again.";

            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: apiErrorMsg
            });
        } finally {
            setBtnLoading(false);
            setValidateDefault(true);
        }
    };

    return (
        <div>
            <Seo title={"Event Organizers Edit"} />

            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        <Card.Header>
                            <h3 className="card-title mb-0">
                                Edit Event Organizer
                            </h3>
                        </Card.Header>

                        <Card.Body>
                            <CForm
                                className="row g-3 needs-validation housing-addflow"
                                noValidate
                                validated={validateDefault}
                                onSubmit={handleSubmit}
                            >
                                {/* Name */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Organizer Name{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Organizer Name"
                                        required
                                        value={firstName}
                                        onChange={(e) =>
                                            setFirstName(e.target.value)
                                        }
                                    />
                                </CCol>

                                {/* Email */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Email{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="email"
                                        placeholder="Email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            validateEmail(e.target.value);
                                        }}
                                        className={
                                            emailError ? "is-invalid" : ""
                                        }
                                    />
                                    {emailError && (
                                        <div className="invalid-feedback">
                                            {emailError}
                                        </div>
                                    )}
                                </CCol>

                                {/* Mobile */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Mobile{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Mobile"
                                        required
                                        value={mobile}
                                        maxLength={15}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 15) {
                                                setMobile(value);
                                            }
                                        }}
                                    />
                                    {/* <CFormInput
                                        type="number"
                                        placeholder="Mobile"
                                        required
                                        value={mobile}
                                        onChange={(e) =>
                                            setMobile(e.target.value)
                                        }
                                    /> */}
                                </CCol>

                                {/* Platform Fee */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Platform Fee (%){" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="number"
                                        placeholder="Platform Fee"
                                        required
                                        value={platformFee}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9.]/g, "")
                                            setPlatformFee(value)

                                        }
                                        }
                                    />
                                </CCol>

                                {/* Auto Approve */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Auto Approve Events (Paid){" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>

                                    <select
                                        className="form-control"
                                        value={autoApprove}
                                        onChange={(e) =>
                                            setAutoApprove(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="Y">Yes</option>
                                        <option value="N">No</option>
                                    </select>
                                </CCol>

                                {/* Buttons */}
                                <CCol md={12} className="mt-4 d-flex gap-2">
                                    <Link href="/admin/event-organizers">
                                        <CButton color="secondary">
                                            Back
                                        </CButton>
                                    </Link>

                                    <CButton
                                        color="success"
                                        type="submit"
                                        disabled={btnLoading}
                                    >
                                        {btnLoading ? (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
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
        </div>
    );
};

EventOrganizerEdit.layout = "Contentlayout";

export default EventOrganizerEdit;
