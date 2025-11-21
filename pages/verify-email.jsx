import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import toast from "react-hot-toast";
import api from "@/utils/api";

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

    const verifyPromise = api
      .get(`/api/v1/auth/verify-email?token=${token}`)
      .then((res) => res.data);

    toast.promise(verifyPromise, {
      loading: "Verifying your email...",
      success: (data) => data.message || "Email verified!",
      error: (err) => err.response?.data?.error?.message || "Something went wrong!",
    });

    try {
      const data = await verifyPromise;
      setSuccess(data.message);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {      
      setError(err.response?.data?.error?.message || "Invalid or expired link.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    verify();
  }, [token]);

    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");
  

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <div className="flex items-center justify-center py-5 px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-xl p-6 text-center">

          {/* Smaller Image */}
          <img
            src="https://eboxtickets.com/images/sigin.png"
            className="w-10 mx-auto mb-3"      // << Smaller image
            alt="verify"
          />

          <h1 className="text-lg font-bold mb-1">Email Verification</h1>

          <p className="text-gray-600 text-sm mb-3">
            Please wait while we verify your email.
          </p>

          {/* Loading */}
          {loading && (
            <p className="text-blue-600 font-semibold text-sm">Verifying...</p>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-600 font-semibold text-sm">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <>
              <p className="text-green-600 font-semibold text-sm">
                {success}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Redirecting to login...
              </p>
            </>
          )}
        </div>
      </div>

      <FrontendFooter />
    </>
  );
};

export default VerifyEmailPage;
