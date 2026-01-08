import React, { useState } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Swal from "sweetalert2";
import api from "@/utils/api";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire("Error", "Please fill in all fields.", "error");
      return;
    }

    if (password.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match.", "error");
      return;
    }

    if (!token) {
      Swal.fire("Error", "Invalid or expired token.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/v1/auth/reset-password", { token, password });

      if (res.data?.success) {
        Swal.fire("Success", res.data.message || "Password reset successfully!", "success");
        router.push("/login");
      } else {
        Swal.fire("Error", res.data?.message || "Failed to reset password.", "error");
      }
    } catch (err) {
      const apiErrorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";
      Swal.fire("Error", apiErrorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section id="sign-up" className="py-4">
        <div className="container">
          <div className="section-heading text-center">
            <h1 className="mb-3">Reset Your Password</h1>
            <p className="body-text">Enter a new password to access your account.</p>
          </div>

          <div className="form-content">
            <div className="row align-items-center justify-content-center">
              {/* Left side GIF */}
              <div className="col-md-6 col-sm-12 sig_img">
                <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWFzMnZhZDJ6dXRxYmx5bzUycnZmdGxzMGF6Y2Rsbzhuemh2NmVkMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IgLIVXrBcID9cExa6r/giphy.gif" alt="Reset Password" style={{ maxWidth: "100%", marginBottom: "20px" }} />

              </div>

              {/* Right side form */}
              <div className="col-md-6 col-sm-12">
                <div className="contact-form">
                  <form onSubmit={handleSubmit}>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        className="form-control mb-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                        }}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </span>
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="form-control mb-3"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="primery-button w-100 text-14 mt-3"
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
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

export default ResetPasswordPage;
