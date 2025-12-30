import React, { useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Swal from "sweetalert2";
import Link from "next/link";

const RegisterPage = () => {
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
    dob: "2000-01-01"
  });


  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

  /* ---------------- HELPERS ---------------- */
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const isValidName = (name) =>
    /^[A-Za-z\s]{2,}$/.test(name);

  const isValidDOB = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age =
      today.getFullYear() -
      birthDate.getFullYear() -
      (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    return age >= 13;
  };

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    if (!isValidName(formData.firstName)) {
      Swal.fire("Invalid First Name", "First name must contain at least 2 letters.", "error");
      return false;
    }

    if (!isValidName(formData.lastName)) {
      Swal.fire("Invalid Last Name", "Last name must contain at least 2 letters.", "error");
      return false;
    }

    if (!isValidEmail(formData.email)) {
      Swal.fire("Invalid Email", "Please enter a valid email address.", "error");
      return false;
    }

    if (!isStrongPassword(formData.password)) {
      Swal.fire(
        "Weak Password",
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
        "error"
      );
      return false;
    }

    if (!formData.gender) {
      Swal.fire("Missing Gender", "Please select your gender.", "error");
      return false;
    }

    if (!isValidDOB(formData.dob)) {
      Swal.fire("Invalid Date of Birth", "You must be at least 13 years old to register.", "error");
      return false;
    }

    return true;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post("/api/v1/auth/register", formData);

      if (response.data?.success) {
        Swal.fire(
          "Success",
          "Registration successful! Please check your email for verification.",
          "success"
        );

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          gender: "",
          dob: ""
        });
      } else {
        Swal.fire("Error", response.data?.message || "Something went wrong!", "error");
      }
    } catch (error) {
      const apiErrorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
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
                <img src="/assets/front-images/sigin.png" alt="Register" />
              </div>

              <div className="col-md-6 col-sm-12 sig_img">
                <div className="contact-form">
                  <h1 className="fw-bold">Create Account</h1>
                  <p className="body-text">Fill in the details below to register.</p>

                  <form className="signup-pageform" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="form-control"
                      required
                    />

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="form-control"
                      required
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="form-control"
                      required
                    />

                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="form-control"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#666"
                        }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>


                    <div className="row align-items-center">
                      <label className="col-sm-3 col-form-label">Gender</label>
                      <div className="col-sm-9 d-flex">
                        <input type="radio" name="gender" value="Male" checked={formData.gender == "Male"} onChange={handleChange} />
                        <label className="ms-1">Male</label>

                        <input className="ms-3" type="radio" name="gender" value="Female" checked={formData.gender == "Female"} onChange={handleChange} />
                        <label className="ms-1">Female</label>
                      </div>
                    </div>

                    <div className="row align-items-center">
                      <label className="col-sm-3 col-form-label">Date of Birth</label>
                      <div className="col-sm-9">
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="form-control"
                          required
                          min="2000-01-01"
                          max={new Date().toISOString().split("T")[0]}
                        />

                      </div>
                    </div>

                    <button type="submit" className="primery-button w-100 mt-3" disabled={loading}>
                      {loading ? "Registering..." : "Register"}
                    </button>
                  </form>

                  <hr />

                  <p className="text-center">
                    Already have an account?
                    <Link href="/login" className="fw-bold"> Log in</Link>
                  </p>
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
