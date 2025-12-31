import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import Swal from "sweetalert2";
import api from "@/utils/api";
import Cookies from "js-cookie";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // redirect if user is already logged in
    const token = Cookies.get("userAuthToken");
    if (token) {
      router.push("/");
    }
  }, [router]);

  // Email validation regex
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire("Error", "Please enter your email.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      Swal.fire("Error", "Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);
    try {
      // ✅ Call your forgot-password API
      const res = await api.post("/api/v1/auth/forgot-password", { email });

      if (res.data?.success) {
        Swal.fire(
          "Success",
          res.data?.message || "Password reset email sent!",
          "success"
        );
        setEmail("");
      } else {
        Swal.fire(
          "Error",
          res.data?.message || "Something went wrong. Try again.",
          "error"
        );
      }
    } catch (err) {
      const apiErrorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Try again.";
      Swal.fire("Error", apiErrorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section id="sign-up">
        <div className="container">
          <div className="section-heading">
            <h1 className="mb-0">Forgot Password</h1>
            <h2 className="mt-3">Reset your password</h2>
            <p className="text-center body-text">
              Enter your email address below, and we'll send you instructions to reset your password.
            </p>
          </div>

          <div className="form-content">
            <div className="row align-items-center">
              <div className="col-md-6 col-sm-12 sig_img">
                <img src="/assets/front-images/sigin.png" alt="Forgot Password Illustration" />
              </div>

              <div className="col-md-6 col-sm-12 sig_img">
                <div className="contact-form">
                  <h1 className="fw-bold">Forgot Password</h1>

                  <form className="signup-pageform" onSubmit={handleSubmit}>
                    <div>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="form-control"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="primery-button w-100 text-14 mt-3 d-flex justify-content-center align-items-center gap-2"
                      disabled={loading}
                      style={{ opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </form>

                  <hr style={{ borderColor: "currentColor" }} />

                  <div className="reg_btn text-center">
                    <p className="text-14">
                      Remembered your password? <Link className="rg fw-bold" href="/login">Login</Link>
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

export default ForgotPasswordPage;
