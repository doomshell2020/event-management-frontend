import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Cookies from "js-cookie";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

  // console.log('>>>>>>>>>>', user);

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
          setUser(res.data.data);
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

  // if (loading) {
  //   return (
  //     <div className="text-center mt-5 mb-5">
  //       <h3>Loading profile...</h3>
  //     </div>
  //   );
  // }

  if (!user) {
    return null; // handled by redirect above
  }

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />
      <section className="my-staff-module">
        <div className="section-heading">
          <h1 className="mb-3">My Staff</h1>
          {/* <h2 className="mt-4"></h2> */}
          <p className="mb-4 body-text text-center">
            You can manage your Staff!
          </p>
        </div>
        <div className="container">

          <div className="d-flex justify-content-end mb-2">
            <a href="#" className="btn btn-primary btn-sm">Add Staff</a>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">

              <thead className="table-dark text-center">
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr className="text-white">
                  <td colSpan="6" className="text-center">
                    No Records
                  </td>
                </tr>
              </tbody>

            </table>
          </div>

        </div>
      </section>

      <FrontendFooter />
    </>
  );
};

export default ProfilePage;
