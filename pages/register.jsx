import React, { useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import styles from "@/styles/LoginPage.module.css";
import api from "@/utils/api"; // ✅ axios instance
import Swal from "sweetalert2";
import Link from "next/link";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
  });

  const [loading, setLoading] = useState(false);
  const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🧠 Basic validation
    if (!formData.gender) {
      Swal.fire("Error", "Please select your gender.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/auth/register", formData);

      if (response.data?.success) {
        Swal.fire("Success", "Registration successful! Please check your email for verification.", "success");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          gender: "",
          dob: "",
        });
      } else {
        Swal.fire("Error", response.data?.message || "Something went wrong!", "error");
      }
    } catch (error) {

      const apiErrorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Try again later.";

      Swal.fire("Error", apiErrorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section id="sign-up">
        <div className="container">
          <div className="section-heading">
            <h1>Create Account</h1>
            <h2>Register</h2>
            <p className="text-center body-text">
              Enter your information below to create your account
            </p>
          </div>

          <div className="form-content">
            <div className="row">
              <div className="col-md-6 col-sm-12 sig_img">
                <img src="/assets/front-images/sigin.png" alt="img" />
              </div>

              <div className="col-md-6 col-sm-12 sig_img">
                <div className="contact-form">
                  <h1 className="fw-bold">Create Account</h1>
                  <p className="body-text">Fill in the details below to register.</p>

                  <form className="signup-pageform" onSubmit={handleSubmit}>
                    <div>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="form-control"
                        required
                      />
                    </div>

                    <div>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="form-control"
                        required
                      />
                    </div>

                    <div>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="form-control"
                        required
                      />
                    </div>

                    <div>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="row align-items-center">
                      <label className="col-sm-3 col-form-label">Gender</label>
                      <div className="col-sm-9 d-flex">
                        <input
                          className="ms-1"
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === "Male"}
                          onChange={handleChange}
                        />
                        <label className="col-form-label ms-1">Male</label>

                        <input
                          className="ms-3"
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === "Female"}
                          onChange={handleChange}
                        />
                        <label className="col-form-label ms-1">Female</label>
                      </div>
                    </div>

                    <div className="row align-items-center">
                      <label className="col-sm-3 col-form-label">Date of Birth</label>
                      <div className="col-sm-9">
                        <input
                          type="date"
                          className="form-control"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form_checkb gap-2 d-flex align-items-start">
                      <input className="mt-1" type="checkbox" name="termscheck" required />
                      <p className="chack_cont">
                        By Creating An Account You Agree To Our{" "}
                        <span>
                          <a target="_blank" href="https://eboxtickets.com/pages/privacy-policy">
                            Privacy Policy
                          </a>
                        </span>{" "}
                        and Accept Our{" "}
                        <span>
                          <a target="_blank" href="https://eboxtickets.com/pages/terms-and-conditions">
                            Terms and Conditions
                          </a>
                        </span>
                        .
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="primery-button w-100 text-14 mt-3"
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Register"}
                    </button>
                  </form>

                  <hr style={{ borderColor: "currentColor" }} />
                  <div className="reg_btn text-center">
                    <p className="text-14">
                      Already have an account?
                      <a className="rg fw-bold" href="/login"> Log in</a>
                    </p>
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

export default RegisterPage;
