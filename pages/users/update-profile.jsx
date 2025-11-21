import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Modal } from 'react-bootstrap';
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { Bold } from "lucide-react";

const UpdateProfile = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        password: "",
        gender: "",
        dob: "",
        phone: "",
        emailNewsLetter: "N",
        emailRelatedEvents: "N",
        old_password: "",
        password: "",
    });
    const [profileImage, setProfileImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [email, setEmail] = useState("");
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = Cookies.get("userAuthToken");
                if (!token) {
                    router.push("/login");
                    return;
                }
                // ✅ Fetch user details from API
                const res = await api.get("/api/v1/auth/me");
                if (res.data?.success) {
                    const user = res.data.data;
                    setFormData({
                        firstName: user.first_name || "",
                        lastName: user.last_name || "",
                        gender: user.gender || "",
                        dob: user.dob || "",
                        phone: user.mobile || "",
                        emailNewsLetter: user.emailNewsLetter,
                        emailRelatedEvents: user.emailRelatedEvents,
                    });
                    setEmail(user.email)
                    setProfileImage(user.profile_image); // if needed
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);


    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked ? "Y" : "N"
        }));
    };

    // update user basic details and change password 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ---------- BASE PAYLOAD ----------
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                gender: formData.gender,
                dob: formData.dob,
                emailNewsLetter: formData.emailNewsLetter,
                emailRelatedEvents: formData.emailRelatedEvents,
                mobile: formData.phone
            };
            // Safely read password fields
            const oldPass = formData.old_password || "";
            const newPass = formData.password || "";
            // ---------- PASSWORD UPDATE LOGIC ----------
            // If either field is filled, user wants to update password
            if (oldPass || newPass) {
                // Both fields are required
                if (!oldPass.trim() || !newPass.trim()) {
                    Swal.fire("Error", "Both old and new password are required.", "error");
                    setLoading(false);
                    return;
                }
                // Add password fields to payload
                payload.old_password = oldPass;
                payload.password = newPass;
            }
            // --------------------------------------------------
            const response = await api.patch("/api/v1/auth/update-profile", payload);
            if (response.data?.success) {
                Swal.fire("Success", response.data.message, "success");
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    old_password: "",
                    password: ""
                }));
            } else {
                Swal.fire("Error", response.data?.message || "Something went wrong!", "error");
            }
        } catch (error) {
            const apiErrorMsg =
                error.response?.data?.error?.message ||
                error.response?.data?.message ||
                error.message ||
                "Profile update failed. Try again later.";
            Swal.fire("Error", apiErrorMsg, "error");
        } finally {
            setLoading(false);
        }
    };


    // ===== IMAGE CHANGE HANDLER =====
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
    };

    // ===== UPLOAD BUTTON HANDLER =====
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const body = new FormData();
        body.append("profile_image", selectedImage);
        try {
            const res = await api.patch("/api/v1/auth/update-profile-image", body, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (res.data.success) {
                setIsLoading(false);
                Swal.fire("Success", res.data.message, "success");
                // show preview without refreshing
                setProfileImage(URL.createObjectURL(selectedImage));
                handleClose();
            }
        } catch (err) {
            setIsLoading(false);
            Swal.fire(
                "Error",
                err.response?.data?.message || "Upload failed!",
                "error"
            );
        }
    };






    return (
        <>
            <FrontendHeader   backgroundImage={backgroundImage}/>
            <section id="edit-profile">
                <div className="container">
                    <div className="section-heading">
                        <h1>Update profile</h1>
                        <h2>Profile</h2>
                        <p className="text-center body-text">
                            Enter your information below to update your account
                        </p>
                    </div>

                    <div className="row justify-content-center mt-4">
                        {/* LEFT SIDE IMAGE */}
                        <div className="col-md-3 text-center">
                            <div
                                className="profile-image-wrapper"
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
                                        zIndex: 10
                                    }}
                                >
                                    <i className="bi bi-pencil" style={{ fontSize: "16px", color: "#555" }}></i>
                                </span>

                                <img
                                    src={profileImage || "https://eboxtickets.com/images/Usersprofile/noimage.jpg"}
                                    alt="Profile Image"
                                    style={{
                                        width: "100%",
                                        borderRadius: "10px"
                                    }}
                                />

                                <h6 className="mt-2">
                                    <strong>{formData.firstName} {formData.lastName}</strong>
                                </h6>
                            </div>
                        </div>


                        {/* RIGHT SIDE FORM */}
                        <div className="col-md-7">
                            <div className="edit-box p-4 shadow-sm">

                                {/* SECTION: EDIT YOUR PROFILE */}
                                <div className="section-title">Edit Your Profile</div>
                                <p>You can edit your profile below including updating your password.</p>

                                <form onSubmit={handleSubmit}>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                className="form-control"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                className="form-control"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                readOnly
                                                value={email}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Gender</label>
                                            <select
                                                className="form-control"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                            >
                                                <option value="">Choose Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                className="form-control"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Phone Number</label>
                                            <input
                                                type="number"
                                                name="phone"
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* SECTION: CHANGE PASSWORD */}
                                    <div className="section-title mt-4">Change Password</div>
                                    <p>Leave blank if you do not wish to change your password.</p>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Old Password</label>
                                            <input
                                                type="password"
                                                name="old_password"
                                                className="form-control"
                                                value={formData.old_password}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                className="form-control"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* SECTION: EMAIL NOTIFICATION */}
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
                                                // checked={formData.relatedEvents}
                                                checked={formData.emailRelatedEvents === "Y"}
                                                onChange={handleCheckbox}
                                            />{" "}
                                            Email Related Events
                                        </div>
                                    </div>

                                    <div className="text-end mt-4">
                                        <button type="button" className="btn btn-secondary me-2" onClick={() => router.push("/users/view-profile")}>View Profile</button>
                                        {/* <button className="btn btn-primary">Save</button> */}
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
                </div>
            </section>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <form onSubmit={handleUploadSubmit}>
                    <Modal.Header closeButton>
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
    )
}

export default UpdateProfile