import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";


const ContactUs = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');

     const [formData, setFormData] = useState({
    name: "",
    email: "",
    event: "",
    subject: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ---------- helpers ---------- */
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim())
      newErrors.name = "Name is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!isValidEmail(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.subject)
      newErrors.subject = "Subject is required";

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10)
      newErrors.description = "Minimum 10 characters required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => ({
      ...p,
      [name]: value,
    }));

    setErrors((p) => ({
      ...p,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      event: formData.event.trim(),
      subject: formData.subject,
      message: formData.description.trim(),
    };

    Swal.fire({
      title: "Sending...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    setLoading(true);

    try {
      const res = await api.post("/api/v1/contact-us", payload);

      if (res.data?.success) {
        Swal.fire("Success", "Message sent successfully", "success");
        setFormData({
          name: "",
          email: "",
          event: "",
          subject: "",
          description: "",
        });
      } else {
        Swal.fire("Error", res.data?.message || "Failed", "error");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };
  
    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />
            <section id="contact-us">
                <div className="container">
                    <div className="section-heading">
                        <h1>Contact us</h1>
                        <h2>Contact us</h2>
                        <p className="mb-4 heading_p text-center text-14 body-text">Any question or remarks? Just write us a message!</p>
                    </div>
                    <div className="row no-gutters">
                        <div className="col-sm-6">
                            <div className="content_inf">
                                <div className="info">
                                    <ul className="ps-0 mb-0">
                                        <li className="d-flex position-relative">
                                            <i className="fas fa-mobile-alt mr-1 mr-2"></i>
                                            <div>
                                                <h6 className="text-16 body-text">Office</h6>
                                                <span className="text-14">868-222-2534</span>
                                            </div>
                                        </li>

                                        <li className="d-flex position-relative">
                                            <i className="bi bi-whatsapp whatsapp_icon mr-1 mr-2"></i>
                                            <div>
                                                <h6 className="text-16 body-text">Whatsapp</h6>
                                                <span className="text-14">868-778-6837</span>
                                            </div>
                                        </li>

                                        <li className="d-flex position-relative">
                                            <i className="far fa-envelope mr-1 mr-2"></i>
                                            <div>
                                                <h6 className="text-16 body-text">Email id</h6>
                                                <span className="text-14">info@eboxtickets.com</span>
                                            </div>
                                        </li>

                                        <li className="d-flex position-relative">
                                            <i className="fas fa-map-marker-alt mr-1 mr-2"></i>
                                            <div>
                                                <h6 className="text-16 body-text">Address</h6>
                                                <span className="text-14">
                                                    Unit#5 Courtyard, <br /> Government Campus Plaza <br /> Nos 1-3 Richmond Street <br /> Port of Spain
                                                </span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="contact_form">
                                <h3 className="text-center fw-bold">
                                    Get In Touch
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <input
                                        type="text"
                                        className="form-control mb-1"
                                        placeholder="Name *"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && <small className="text-danger">{errors.name}</small>}

                                    <input
                                        type="email"
                                        className="form-control mb-1 mt-2"
                                        placeholder="Email *"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <small className="text-danger">{errors.email}</small>}

                                    <input
                                        type="text"
                                        className="form-control mb-3 mt-2"
                                        placeholder="Event"
                                        name="event"
                                        value={formData.event}
                                        onChange={handleChange}
                                    />

                                    <select
                                        className="form-select mb-1 border-0 rounded-0"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    >
                                        <option value="">Choose a subject *</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Support">Support</option>
                                        <option value="Feedback">Feedback</option>
                                    </select>
                                    {errors.subject && <small className="text-danger">{errors.subject}</small>}

                                    <textarea
                                        className="form-control mb-1 mt-2"
                                        rows="4"
                                        placeholder="Description *"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                    {errors.description && (
                                        <small className="text-danger">{errors.description}</small>
                                    )}

                                    <button
                                        type="submit"
                                        className="primery-button w-100 mt-3"
                                        disabled={loading}
                                    >
                                        {loading ? "Sending..." : "Submit"}{" "}
                                        <i className="fas fa-angle-double-right"></i>
                                    </button>
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

export default ContactUs