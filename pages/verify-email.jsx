import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import styles from "@/styles/LoginPage.module.css";
import toast from "react-hot-toast";

const VerifyEmailPage = () => {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const verify = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const verifyPromise = fetch(`/api/v1/front/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Verification failed");
        }
        return data;
      });

    toast.promise(verifyPromise, {
      loading: "Verifying your email...",
      success: (data) => data.message || "Email verified successfully!",
      error: (err) => err.message || "Something went wrong!",
    });

    try {
      const data = await verifyPromise;
      setSuccess(data.message);

      // redirect to login after 3s
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Invalid or expired link.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    verify();
  }, [token, router]);

  return (
    <>
      <FrontendHeader />

      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <div className={styles.leftSide}>
            <img
              src="https://eboxtickets.com/images/sigin.png"
              alt="Verification Illustration"
              className={styles.illustration}
            />
          </div>

          <div className={styles.rightSide}>
            <h1>Email Verification</h1>
            <p>Please wait while we verify your email.</p>

            {loading && <h5 className={styles.info}>Verifying...</h5>}
            {error && <h5 className={styles.error}>{error}</h5>}
            {success && <h5 className={styles.success}>{success}</h5>}

            {success && (
              <p className={styles.signupText}>
                Redirecting you to <b>Login</b> page...
              </p>
            )}
          </div>
        </div>
      </div>

      <FrontendFooter />
    </>
  );
};

export default VerifyEmailPage;
