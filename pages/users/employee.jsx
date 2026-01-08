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
          <h1 className="my-3">My Staff</h1>
          {/* <h2 className="mt-4"></h2> */}
          <p className="mb-3 body-text text-center">
            You can manage your Staff!
          </p>
        </div>
        <div className="container">

          <div className="d-flex justify-content-end mb-2">
            <a href="#" className="btn btn-primary btn-sm">Add Staff</a>
          </div>

          <div className="table-responsive my-staff-table">
            <table className="table table-deta-no-wrap">
              <thead className="table-dark">
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
                <tr>
                  <td>1</td>
                  <td>Tech Team</td>
                  <td>rupam+6@doomshell.com</td>
                  <td>+918905045840</td>
                  <td>02 Jan 2026 08:53:00 PM</td>
                  <td>
                    {/* View Icon */}
                    <a href="#" className="me-2">
                      <i className="bi bi-eye-fill text-success"></i>
                    </a>

                    {/* Edit Icon */}
                    <a href="#" className="me-2">
                      <i className="bi bi-pencil-square text-primary"></i>
                    </a>

                    {/* Change Password */}
                    <button className="btn btn-secondary btn-sm">
                      Change Password
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          <div className="paginator col-sm-12 mt-2">
            <ul className="pagination justify-content-center">
              <li className="prev disabled">
                <Link href="/"><i className="bi bi-chevron-left"></i> Previous</Link>
              </li>
              <li className="next disabled">
                <Link href="/">Next <i className="bi bi-chevron-right"></i></Link>
              </li>
            </ul>
            <div className="text-center">
              <p className="paginate_p text-14">
                Page 1 of 1, showing 2 record(s) out of 2 total
              </p>
            </div>
          </div>


        </div>
      </section>

      <FrontendFooter />
    </>
  );
};

export default ProfilePage;
