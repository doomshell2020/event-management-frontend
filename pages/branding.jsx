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

  <section className="py-5">
        <div className="container">
          <div className="section-heading">
            <h1>Branding</h1>
          </div>
        </div>
</section>
      <FrontendFooter />
    </>
  );
};

export default RegisterPage;
