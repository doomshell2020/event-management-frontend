import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const UpdateProfile = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        password: "",
        gender: "",
        dob: "",
        emailNewsLetter: "N",
        emailRelatedEvents: "N",

        oldPassword: "",
        newPassword: "",
    });

    const [profileImage, setProfileImage] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
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
                        // email: user.email || "",
                        gender: user.gender || "",
                        dob: user.dob || "",
                        emailNewsLetter: user.emailNewsLetter,
                        emailRelatedEvents: user.emailRelatedEvents,
                    });
                    setEmail(user.email)
                    setPhone(user.mobile)
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                gender: formData.gender,
                dob: formData.dob,
                emailNewsLetter: formData.emailNewsLetter,
                emailRelatedEvents: formData.emailRelatedEvents,
            };

            // ---------- PASSWORD UPDATE LOGIC ----------
            // If user typed any password value
            if (formData.oldPassword.trim() !== "" || formData.newPassword.trim() !== "") {

                // Check both inputs must be filled
                if (formData.oldPassword.trim() === "" || formData.newPassword.trim() === "") {
                    Swal.fire("Error", "Both old and new password are required.", "error");
                    setLoading(false);
                    return;
                }

                // Backend expects only "password"
                payload.password = formData.newPassword;
            }
            // --------------------------------------------
            const response = await api.patch("/api/v1/auth/update-profile", payload);
            if (response.data?.success) {
                Swal.fire("Success", response.data.message, "success");
                // Reset password fields
                setFormData(prev => ({
                    ...prev,
                    oldPassword: "",
                    newPassword: ""
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

    return (
        <>
            <FrontendHeader />
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
                            <div className="profile-image-wrapper">
                                <img
                                    src={profileImage || "https://eboxtickets.com/images/Usersprofile/noimage.jpg"}
                                    className="profile-img"
                                    alt="Profile Image"
                                />
                                <h6 className="mt-2">{formData.firstName} {formData.lastName}</h6>
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
                                                type="text"
                                                name="phone"
                                                readOnly
                                                className="form-control"
                                                value={phone}
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
                                                name="oldPassword"
                                                className="form-control"
                                                value={formData.oldPassword}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                className="form-control"
                                                value={formData.newPassword}
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
                                        <button className="btn btn-primary">Save</button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

        </>
    )
}

export default UpdateProfile