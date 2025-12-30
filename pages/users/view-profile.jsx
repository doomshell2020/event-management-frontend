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
      <section id="profile" className="mt-5 mb-5">
        <div className="container">
          <div className="section-heading">
            <h1>Profile</h1>
            <h2 className="mt-4">My Profile</h2>
            <p className="mb-4 body-text text-center">
              Your profile information is displayed below.
            </p>
          </div>

          <div className="profil_deaile mx-auto">
            <div className="row">
              {/* Left side - avatar & edit */}
              <div className="col-md-3">
                <div className="user-profile text-center">
                  <div className="user-avatar">
                    <img
                      className="mx-auto text-center rounded-full w-24 h-24 object-cover"
                      src={user?.profile_image || "/default-avatar.png"}
                      alt={`${user?.first_name || "User"} Avatar`}
                    />

                  </div>
                  <h5 className="user-name text-center text-16 my-3">
                    {user.first_name} {user.last_name}
                  </h5>
                  <Link
                    className="primery-button text-14 fw-normal"
                    href="/users/update-profile"
                  >
                    <i className="fas fa-edit"></i> Edit Profile
                  </Link>
                </div>
              </div>

              {/* Right side - details */}
              <div className="col-md-9">
                <div className="profile-details p-4 mx-auto">
                  <table className="table mb-0 border-0">
                    <tbody>
                      <tr>
                        <td className="border-top-0">Email</td>
                        <td className="border-top-0">{user.email}</td>
                      </tr>
                      <tr>
                        <td>Name</td>
                        <td>{`${user.first_name} ${user.last_name}`}</td>
                      </tr>
                      <tr>
                        <td>Date of Birth</td>
                        <td>
                          {user.dob
                            ? new Date(user.dob).toLocaleDateString("en-GB")
                            : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td>Gender</td>
                        <td>{user.gender || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>Registered On</td>
                        <td>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleString("en-GB")
                            : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td>Phone Number</td>
                        <td>
                          {user.mobile || "Not Added"}
                          {/* <button
                            type="button"
                            className="btn verified_btn p-0 ms-2"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title="Verified"
                          >
                            <i className="bi bi-patch-check-fill"></i>
                          </button> */}
                        </td>
                      </tr>
                      <tr>
                        <td>Email Related Events</td>
                        <td>{user?.emailRelatedEvents ? user.emailRelatedEvents : 'N'}</td>
                      </tr>
                      <tr>
                        <td>Email Newsletter</td>
                        <td>{user?.emailNewsLetter ? user.emailNewsLetter : 'N'}</td>
                      </tr>

                    </tbody>
                  </table>
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

export default ProfilePage;
