import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import styles from "@/styles/LoginPage.module.css";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/utils/api";
import Cookies from "js-cookie"; // 👈 add this import at the top
import Swal from "sweetalert2";
import { useAuth, login } from "@/shared/layout-components/layout/AuthContext";


const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('rupam@doomshell.com');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = Cookies.get("userAuthToken");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const { login: loginUser } = useAuth();  // 👈 Get login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = { email, password };

    try {
      const res = await api.post("/api/v1/auth/login", payload);

      if (!res.data?.success) {
        const msg =
          res.data?.error?.message ||
          res.data?.message ||
          "Invalid credentials, please try again.";
        throw new Error(msg);
      }

      const { token, user } = res.data.data;
      loginUser(user, token);
      toast.success("Login successful!");
      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: "Login successful!",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/");

    } catch (err) {
      console.error("Login error:", err);

      const apiErrorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";

      setError(apiErrorMsg);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: apiErrorMsg,
      });

    } finally {
      setLoading(false);
    }
  };


  const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />
      <section id="sign-up">
        <div className="container">
          <div className="section-heading">
            <h1>Login</h1>
            <h2>Login</h2>
            <p className="text-center body-text">Existing users use the form below to sign in.</p>
          </div>

          <div className="form-content">
            <div className="row align-items-center">
              <div className="col-md-6 col-sm-12 sig_img">
                <img src="/assets/front-images/sigin.png" alt="Login Illustration" /></div>

              <div className="col-md-6 col-sm-12 sig_img">
                <div className="contact-form">
                  <h1 className="fw-bold">Login</h1>
                  <p className="body-text">Welcome back! Please login to your account.</p>

                  <form className="signup-pageform" onSubmit={handleSubmit}>

                    <div>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=" email"
                        className="form-control"
                        required
                      />
                    </div>

                    {/* <div>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" password"
                        className="form-control"
                        required
                      />
                    </div> */}

                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"} // toggle type
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" password"
                        className="form-control"
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </span>
                    </div>



                    <div className="row justify-content-between">
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="rememberMe"
                            name="remember_me"
                            onClick={() => setRememberMe(!rememberMe)}
                          />
                          <label className="form-check-label text-14" htmlFor="rememberMe">
                            Remember Me
                          </label>
                        </div>
                      </div>

                      <div className="col-6 text-end">
                        <a href="users/forgotcpassword" className="for_pass fw-bold">
                          Forgot your password?
                        </a>
                      </div>
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
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </button>


                  </form>
                  <hr style={{ borderColor: "currentColor" }} />
                  <div className="reg_btn text-center">
                    <p className="text-14">
                      Don't have an account? <Link className="rg fw-bold" href="/register">Sign up</Link>
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

export default LoginPage;
