import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Modal } from "react-bootstrap";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

/* ================= VALIDATION HELPERS ================= */
const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

const isValidDOB = (dob) => {
    if (!dob) return false;
    const birth = new Date(dob);
    const today = new Date();
    if (birth > today) return false;

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    return age >= 18;
};

const isStrongPassword = (pwd) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pwd);

/* ================= COMPONENT ================= */
const UpdateProfile = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        dob: "",
        phone: "",
        emailNewsLetter: "N",
        emailRelatedEvents: "N",
        old_password: "",
        password: "",
    });

    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [show, setShow] = useState(false);

    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    /* ================= FETCH PROFILE ================= */
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = Cookies.get("userAuthToken");
                setProfileLoading(true);
                if (!token) {
                    router.replace("/login");
                    return;
                }

                const res = await api.get("/api/v1/auth/me");
                if (res.data?.success) {
                    const u = res.data.data;
                    setFormData({
                        firstName: u.first_name || "",
                        lastName: u.last_name || "",
                        gender: u.gender || "",
                        dob: u.dob ? u.dob.split("T")[0] : "",
                        phone: u.mobile || "",
                        emailNewsLetter: u.emailNewsLetter || "N",
                        emailRelatedEvents: u.emailRelatedEvents || "N",
                        old_password: "",
                        password: "",
                    });
                    setEmail(u.email);
                    setProfileImage(u.profile_image);
                    setProfileLoading(false);
                }
            } catch {
                router.replace("/login");
                setProfileLoading(false);

            }
        };
        fetchUser();
    }, [router]);

    /* ================= INPUT HANDLER ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;
        }

        setFormData((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setFormData((p) => ({ ...p, [name]: checked ? "Y" : "N" }));
    };

    /* ================= FORM VALIDATION ================= */
    const validateForm = () => {
        let newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.gender) newErrors.gender = "Gender is required";

        if (!formData.dob) {
            newErrors.dob = "Date of birth is required";
        } else if (!isValidDOB(formData.dob)) {
            newErrors.dob = "You must be at least 18 years old";
        }

        if (!formData.phone) {
            newErrors.phone = "Phone number is required";
        } else if (!isValidPhone(formData.phone)) {
            newErrors.phone = "Enter valid 10 digit phone number";
        }

        if (formData.old_password || formData.password) {
            if (!formData.old_password)
                newErrors.old_password = "Old password is required";
            if (!formData.password)
                newErrors.password = "New password is required";
            else if (!isStrongPassword(formData.password))
                newErrors.password =
                    "Password must be 8+ chars with upper, lower, number & symbol";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🔴 STOP here if validation fails
        if (!validateForm()) {
            return;
        }

        Swal.fire({
            title: "Updating profile...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        setLoading(true);

        try {
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                gender: formData.gender,
                dob: formData.dob,
                mobile: formData.phone,
                emailNewsLetter: formData.emailNewsLetter,
                emailRelatedEvents: formData.emailRelatedEvents,
            };

            if (formData.old_password && formData.password) {
                payload.old_password = formData.old_password;
                payload.password = formData.password;
            }
            console.log('payload :', payload);

            const res = await api.patch("/api/v1/auth/update-profile", payload);

            if (res.data?.success) {
                Swal.fire("Success", res.data.message, "success");
                setFormData((p) => ({ ...p, old_password: "", password: "" }));
            } else {
                Swal.fire("Error", res.data?.message || "Failed", "error");
            }
        } catch (err) {
            // console.log("err.response.data :", err.response.data);

            let errorMessage = "Profile update failed. Please try again.";

            if (err.response) {
                if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }
                else if (err.response.data?.error?.message) {
                    errorMessage = err.response.data.error.message;
                }
                else if (err.response.data?.errors) {
                    const firstKey = Object.keys(err.response.data.errors)[0];
                    errorMessage = err.response.data.errors[firstKey];
                }
            }

            Swal.fire("Error", errorMessage, "error");
        }
        finally {
            setLoading(false);
        }
    };

    /* ================= IMAGE UPLOAD ================= */
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const body = new FormData();
        body.append("profile_image", selectedImage);

        try {
            const res = await api.patch("/api/v1/auth/update-profile-image", body);
            if (res.data.success) {
                Swal.fire("Success", res.data.message, "success");
                setProfileImage(URL.createObjectURL(selectedImage));
                setShow(false);
            }
        } catch {
            Swal.fire("Error", "Upload failed", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    /* ================= IMAGE UPLOAD ================= */
    const handleImageUpload = (e) => {
        setSelectedImage(e.target.files[0]);
    };


    /* ================= JSX ================= */
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            <section id="edit-profile" className="mb-2">
                <div className="container">
                    <div className="section-heading">
                        <h1 className="mb-3 mt-4">Update Profile</h1>
                        {/* <h2>Profile</h2> */}
                        <p className="text-center body-text">
                            Enter your information below to update your account
                        </p>
                    </div>
                    {profileLoading ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row justify-content-center mt-4">
                            {/* LEFT SIDE IMAGE */}
                            <div className="col-md-3 text-center">
                                <div className="profile-image-wrapper"
                                    style={{
                                        position: "relative",
                                        display: "inline-block"
                                    }}
                                >
                                    {/* Pencil Icon */}
                                    <span
                                        onClick={handleShow}
                                        style={{
                                            position: "absolute",
                                            top: "-8px",
                                            right: "-8px",
                                            background: "#fff",
                                            borderRadius: "50%",
                                            padding: "6px",
                                            cursor: "pointer",
                                            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
                                            zIndex: 10,

                                            /* added css */
                                            height: "38px",
                                            width: "38px",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}
                                    >
                                        <i
                                            className="bi bi-pencil"
                                            style={{ fontSize: "16px", color: "#555" }}
                                        ></i>
                                    </span>


                                    <img
                                        src={profileImage || "https://eboxtickets.com/images/Usersprofile/noimage.jpg"}
                                        alt="Profile Image"
                                        style={{
                                            width: "100%",
                                            borderRadius: "10px"
                                        }}
                                    />

                                    <h6 className="mt-3">
                                        <strong>{formData.firstName} {formData.lastName}</strong>
                                    </h6>
                                </div>
                            </div>
                            {/* RIGHT SIDE FORM */}
                            <div className="col-md-9">
                                <div className="edit-box p-4 shadow-sm">

                                    {/* SECTION: EDIT YOUR PROFILE */}
                                    <div className="section-title">Edit Your Profile</div>
                                    <p>You can edit your profile below including updating your password.</p>

                                    <form onSubmit={handleSubmit} noValidate>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label>
                                                    First Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                />
                                                {errors.firstName && (
                                                    <div className="invalid-feedback">{errors.firstName}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label>
                                                    Last Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                />
                                                {errors.lastName && (
                                                    <div className="invalid-feedback">{errors.lastName}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label>Email <span className="text-danger">*</span></label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={email}
                                                    readOnly
                                                />
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label>
                                                    Gender <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className={`form-control ${errors.gender ? "is-invalid" : ""}`}
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Choose Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                {errors.gender && (
                                                    <div className="invalid-feedback">{errors.gender}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label>
                                                    Date of Birth <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="dob"
                                                    className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                                                    value={formData.dob}
                                                    onChange={handleChange}
                                                />
                                                {errors.dob && (
                                                    <div className="invalid-feedback">{errors.dob}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label>Phone Number <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    maxLength="10"
                                                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                                {errors.phone && (
                                                    <div className="invalid-feedback">{errors.phone}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* CHANGE PASSWORD */}
                                        <div className="section-title mt-4">Change Password</div>
                                        <p>Leave blank if you do not wish to change your password.</p>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label>Old Password</label>
                                                <input
                                                    type="password"
                                                    name="old_password"
                                                    className={`form-control ${errors.old_password ? "is-invalid" : ""}`}
                                                    value={formData.old_password}
                                                    onChange={handleChange}
                                                />
                                                {errors.old_password && (
                                                    <div className="invalid-feedback">{errors.old_password}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label>New Password</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                />
                                                {errors.password && (
                                                    <div className="invalid-feedback">{errors.password}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* EMAIL NOTIFICATIONS */}
                                        <div className="section-title mt-4">Email Notifications</div>
                                        <p>You can manage the notifications you receive via email.</p>

                                        <div className="d-flex gap-4 mb-3">
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    name="emailNewsLetter"
                                                    checked={formData.emailNewsLetter === "Y"}
                                                    onChange={handleCheckbox}
                                                />{" "}
                                                Email Newsletter
                                            </div>

                                            <div>
                                                <input
                                                    type="checkbox"
                                                    name="emailRelatedEvents"
                                                    checked={formData.emailRelatedEvents === "Y"}
                                                    onChange={handleCheckbox}
                                                />{" "}
                                                Email Related Events
                                            </div>
                                        </div>

                                        <div className="text-end mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-secondary me-2"
                                                onClick={() => router.push("/users/view-profile")}
                                            >
                                                View Profile
                                            </button>

                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? "Updating..." : "Save"}
                                            </button>
                                        </div>

                                    </form>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <form onSubmit={handleUploadSubmit}>
                    <Modal.Header closeButton className="profile-modal-close">
                        <Modal.Title>Upload Picture</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>

                        <h6><strong>Picture Guidelines</strong></h6>

                        <p>Please ensure that you have complied with the following Site Rules to avoid your profile from being deleted:</p>

                        <ol>
                            <li>Your face must be clearly visible.</li>
                            <li>The photo uploaded MUST be YOU.</li>
                            <li>The background of the photo must be clear with no other obscured objects.</li>
                            <li>You can use only your picture for one account.</li>
                        </ol>

                        <p>
                            We review your uploads manually and can reject submissions that don't match the aforementioned criteria.
                        </p>

                        {/* File Input */}
                        <div className="mt-3">
                            <input
                                type="file"
                                name="profile_image"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                required
                                onChange={handleImageUpload}
                                className="form-control"
                            />
                        </div>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating..." : "Upload"}
                        </Button>

                        {/* <Button variant="primary" type="submit">
                            Upload
                        </Button> */}
                    </Modal.Footer>
                </form>
            </Modal>
            <FrontendFooter />

        </>
    );
};

export default UpdateProfile;