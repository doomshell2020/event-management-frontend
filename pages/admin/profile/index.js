import React, { useCallback, useEffect, useState } from "react";

import { Card, Col, Dropdown, Breadcrumb, Nav, Row, Tab, FormGroup, Form, Alert, Collapse, Spinner } from "react-bootstrap";
import Link from "next/link";
import ImageViewer from "react-simple-image-viewer";
import { useRouter } from "next/router";
import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from "next/image";
import api from "@/utils/api";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { CCol, CForm, CButton, CFormLabel, CFormInput, CFormFeedback, } from "@coreui/react";

const Profile = () => {
  const router = useRouter();
  const [id, setId] = useState('');
  const [profile, setProfile] = useState("")
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [Password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("adminAuthToken");
        if (!token) {
          router.push("/login");
          return;
        }
        // ✅ Fetch user details from API
        const res = await api.get("/api/v1/admin/auth/me");
        if (res.data?.success) {
          setProfile(res.data.data);
          setId(res.data?.data?.id);
        } else {
          router.push("/admin/auth");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        router.push("/admin/auth");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);


  // Change passwords
  const UpdatePassword = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (Password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Both password fields must match",
        timer: 2000,
        showConfirmButton: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        password: Password.trim(),
      };

      const res = await api.patch(
        `/api/v1/admin/auth/${id}/update-password`,
        payload
      );

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        setConfirmPassword("");
        setPassword("");
        setTimeout(() => {
          router.push("/admin/profile");
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.data?.message || "Something went wrong",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Server error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <Seo title={"Profile"} />

      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">PROFILE</span>
        </div>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
              Pages
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Profile
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}

      <Row>
        <Col lg={12} md={12}>
          <Card className="custom-card customs-cards">
            <ToastContainer />
            <Card.Body className=" d-md-flex  bg-white">
              <div className="">
                <span className="profile-image pos-relative">
                  <Image
                    src={
                      profile?.profile_image
                        ? profile.profile_image
                        : "https://eboxtickets.com/images/admin.jpg"
                    }
                    alt="Profile"
                    width={100}
                    height={100}
                    className="br-5"
                  />
                  <span className="bg-success text-white wd-1 ht-1 rounded-pill profile-online"></span>
                </span>
              </div>

              <div className="my-md-auto mt-4 prof-details">
                <h4 className="font-weight-semibold ms-md-4 ms-0 mb-1 pb-0">
                  {profile.first_name ? (
                    <span>{profile.first_name}</span>
                  ) : (
                    <span>---</span>
                  )} {profile.last_name ? (
                    <span>{profile.last_name}</span>
                  ) : (
                    <span>---</span>
                  )}
                </h4>
                <p className="text-muted ms-md-4 ms-0 mb-2">
                  <span>
                    <i className="fa fa-phone me-2"></i>
                  </span>
                  <span className="font-weight-semibold me-2">Phone:</span>
                  <span>+{profile.mobile}</span>
                </p>
                <p className="text-muted ms-md-4 ms-0 mb-2">
                  <span>
                    <i className="fa fa-envelope me-2"></i>
                  </span>
                  <span className="font-weight-semibold me-2">Email:</span>
                  <span> {profile.email}</span>
                </p>
              </div>
              <CCol md={6} className="d-flex justify-content-end">
                <Link href={"/admin/profile/edit"}>
                  <CButton color="primary" >
                    Edit
                  </CButton>
                </Link>
              </CCol>
            </Card.Body>
          </Card>
          {/* <SSRProvider> */}
          <span className=" py-0 ">
            <div className="profile-tab tab-menu-heading border-bottom-0 ">
              <Tab.Container id="left-tabs-example" defaultActiveKey="About">
                <Nav
                  variant="pills"
                  className="nav profile-tabs main-nav-line tabs-menu profile-nav-line bg-white mb-4 border-0 br-5 mb-0	"
                >

                </Nav>
                <Row className=" row-sm ">
                  <Col lg={12} md={12}>
                    <div className="custom-card main-content-body-profile">
                      <Tab.Content>
                        <Tab.Pane eventKey="About">
                          <div
                            className="main-content-body tab-pane  active"
                            id="about"
                          >
                            <Card>
                              <Card.Body className="p-0 border-0 rounded-10">
                                <div className="border-top"></div>
                                <div className="border-top"></div>

                                <div className="p-4">
                                  <label className="main-content-label tx-13 mg-b-20">
                                    Social Networks :
                                  </label>

                                  <div className="flex-wrap d-flex" style={{ gap: "25px" }}>

                                    {/* Instagram */}
                                    <div className="mg-b-10">
                                      <Link
                                        href={profile?.instaurl || "#"}
                                        target="_blank"
                                        className="text-decoration-none"
                                      >
                                        <div className="main-profile-social-list">
                                          <div className="media">
                                            <div className="media-icon bg-danger-transparent text-danger">
                                              <i className="icon ion-logo-instagram"></i>
                                            </div>
                                            <div className="media-body">
                                              <span>Instagram</span>
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>

                                    {/* Facebook */}
                                    <div className="mg-b-10">
                                      <Link
                                        href={profile?.fburl || "#"}
                                        target="_blank"
                                        className="text-decoration-none"
                                      >
                                        <div className="main-profile-social-list">
                                          <div className="media">
                                            <div className="media-icon bg-primary-transparent text-primary">
                                              <i className="icon ion-logo-facebook"></i>
                                            </div>
                                            <div className="media-body">
                                              <span>Facebook</span>
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>

                                    {/* Twitter */}
                                    <div className="mg-b-10">
                                      <Link
                                        href={profile?.Twitterurl || "#"}
                                        target="_blank"
                                        className="text-decoration-none"
                                      >
                                        <div className="main-profile-social-list">
                                          <div className="media">
                                            <div className="media-icon bg-info-transparent text-info">
                                              <i className="icon ion-logo-twitter"></i>
                                            </div>
                                            <div className="media-body">
                                              <span>Twitter</span>
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>

                                    {/* Google Plus */}
                                    <div className="mg-b-10">
                                      <Link
                                        href={profile?.googleplusurl || "#"}
                                        target="_blank"
                                        className="text-decoration-none"
                                      >
                                        <div className="main-profile-social-list">
                                          <div className="media">
                                            <div className="media-icon bg-danger-transparent text-danger">
                                              <i className="icon ion-logo-google"></i>
                                            </div>
                                            <div className="media-body">
                                              <span>Google Plus</span>
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>

                                    {/* LinkedIn */}
                                    <div className="mg-b-10">
                                      <Link
                                        href={profile?.linkdinurl || "#"}
                                        target="_blank"
                                        className="text-decoration-none"
                                      >
                                        <div className="main-profile-social-list">
                                          <div className="media">
                                            <div className="media-icon bg-primary-transparent text-primary">
                                              <i className="icon ion-logo-linkedin"></i>
                                            </div>
                                            <div className="media-body">
                                              <span>LinkedIn</span>
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>

                                    {/* Google Play Store */}
                                    <div className="mg-b-10">
                                      <Link
                                        href={profile?.googleplaystore || "#"}
                                        target="_blank"
                                        className="text-decoration-none"
                                      >
                                        <div className="main-profile-social-list">
                                          <div className="media">
                                            <div className="media-icon bg-success-transparent text-success">
                                              <i className="icon ion-logo-android"></i>
                                            </div>
                                            <div className="media-body">
                                              <span>Google Play Store</span>
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>

                                    {/* Apple Store */}
                                    <div className="mg-b-10">
                                      <Link
                                        href={profile?.applestore || "#"}
                                        target="_blank"
                                        className="text-decoration-none"
                                      >
                                        <div className="main-profile-social-list">
                                          <div className="media">
                                            <div className="media-icon text-dark" style={{ backgroundColor: "#d5d5d5" }}>
                                              <i className="icon ion-logo-apple"></i>
                                            </div>
                                            <div className="media-body">
                                              <span>Apple Store</span>
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>

                                  </div>
                                </div>
                              </Card.Body>
                            </Card>


                          </div>
                        </Tab.Pane>
                        <Card>
                          <Card.Header>
                            <h3 className="card-title">Change Password</h3>
                          </Card.Header>

                          <Card.Body>
                            <CForm className="needs-validation" onSubmit={UpdatePassword}>
                              <Row className="align-items-end g-3">

                                {/* New Password */}
                                <CCol md={4}>
                                  <CFormLabel>New Password</CFormLabel>
                                  <CFormInput
                                    type="password"
                                    required
                                    minLength={5}
                                    value={Password}
                                    onChange={(e) => setPassword(e.target.value)}
                                  />
                                </CCol>

                                {/* Confirm Password */}
                                <CCol md={4}>
                                  <CFormLabel>Confirm Password</CFormLabel>
                                  <CFormInput
                                    type="password"
                                    required
                                    minLength={5}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                  />
                                </CCol>

                                {/* Submit Button */}
                                <CCol md={4} className="d-flex">
                                  <CButton
                                    color="primary"
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-auto"
                                  >
                                    {isLoading ? (
                                      <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                      />
                                    ) : (
                                      "Submit"
                                    )}
                                  </CButton>
                                </CCol>

                              </Row>
                            </CForm>
                          </Card.Body>
                        </Card>

                      </Tab.Content>
                    </div>
                  </Col>
                </Row>
              </Tab.Container>
            </div>
          </span>
          {/* </SSRProvider> */}
        </Col>
      </Row>

      {/* <!-- Row --> */}
      <Row className=" row-sm">
        <Col lg={12} md={12}>
          <div className="tab-content"></div>
          {/* </div> */}
        </Col>
      </Row>
      {/* <!-- row closed --> */}
    </div>
  );
}

Profile.propTypes = {};

Profile.defaultProps = {};

Profile.layout = "Contentlayout"

export default Profile;
