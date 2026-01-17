import React, { useEffect, useState } from "react";
import { Card, Col, Breadcrumb, Row, Spinner } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import Seo from "@/shared/layout-components/seo/seo";
import api from "@/utils/api";
import {
  CCol,
  CForm,
  CButton,
  CFormLabel,
  CFormInput,
} from "@coreui/react";

const Profile = () => {
  const router = useRouter();

  const [id, setId] = useState("");
  const [profile, setProfile] = useState(null);

  const [Password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("adminAuthToken");

        if (!token) {
          router.push("/admin/auth");
          return;
        }

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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <Seo title={"Profile"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">PROFILE</span>
        </div>

        <div className="justify-content-center mt-2">
          <Breadcrumb>
            <Breadcrumb.Item>Pages</Breadcrumb.Item>
            <Breadcrumb.Item active>Profile</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <Row>
        <Col lg={12} md={12}>
          {/* PROFILE CARD */}
          <Card className="custom-card">
            <Card.Body className="bg-white">
              <Row className="align-items-center">
                <Col md={2} sm={12} className="text-center mb-3 mb-md-0">
                  <div className="position-relative d-inline-block">
                    <Image
                      src={
                        profile?.profile_image ||
                        "https://eboxtickets.com/images/admin.jpg"
                      }
                      alt="Profile"
                      width={110}
                      height={110}
                      className="rounded-circle border"
                    />

                    <span
                      className="position-absolute bg-success rounded-circle"
                      style={{
                        width: "12px",
                        height: "12px",
                        bottom: "8px",
                        right: "8px",
                        border: "2px solid white",
                      }}
                    ></span>
                  </div>
                </Col>

                <Col md={7} sm={12} className="text-md-start text-center">
                  <h4 className="fw-bold mb-1">
                    {profile?.first_name || "---"}{" "}
                    {profile?.last_name || ""}
                  </h4>

                  <div className="text-muted">
                    <p className="mb-1">
                      <i className="fa fa-phone me-2 text-primary"></i>
                      <span className="fw-semibold me-1">Phone:</span>
                      {profile?.mobile ? `+${profile.mobile}` : "---"}
                    </p>

                    <p className="mb-1">
                      <i className="fa fa-envelope me-2 text-primary"></i>
                      <span className="fw-semibold me-1">Email:</span>
                      {profile?.email || "---"}
                    </p>
                  </div>
                </Col>

                <Col
                  md={3}
                  sm={12}
                  className="text-md-end text-center mt-3 mt-md-0"
                >
                  <Link href="/admin/profile/edit">
                    <CButton color="primary">
                      <i className="fa fa-edit me-2"></i>
                      Edit Profile
                    </CButton>
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="mt-4">
            <Row>
              {/* SOCIAL NETWORKS */}
              <Col md={12}>
                <Card className="custom-card">
                  <Card.Header>
                    <h3 className="card-title">Social Networks</h3>
                  </Card.Header>

                  <Card.Body>
                    <Row className="g-3">
                      {[
                        {
                          name: "Instagram",
                          icon: "ion-logo-instagram",
                          url: profile?.instaurl,
                          color: "text-danger",
                        },
                        {
                          name: "Facebook",
                          icon: "ion-logo-facebook",
                          url: profile?.fburl,
                          color: "text-primary",
                        },
                        {
                          name: "Twitter",
                          icon: "ion-logo-twitter",
                          url: profile?.Twitterurl,
                          color: "text-info",
                        },
                        {
                          name: "LinkedIn",
                          icon: "ion-logo-linkedin",
                          url: profile?.linkdinurl,
                          color: "text-primary",
                        },
                        {
                          name: "Google Play Store",
                          icon: "ion-logo-android",
                          url: profile?.googleplaystore,
                          color: "text-success",
                        },
                        {
                          name: "Google Plus URL",
                          icon: "ion-logo-android",
                          url: profile?.googleplusurl,
                          color: "text-success",
                        },
                        {
                          name: "Apple Store",
                          icon: "ion-logo-apple",
                          url: profile?.applestore,
                          color: "text-dark",
                        },
                      ].map((social, index) => (
                        <Col md={4} lg={3} key={index}>
                          <Link href={social.url || "#"} target="_blank">
                            <div className="border rounded p-3 d-flex align-items-center">
                              <i
                                className={`icon ${social.icon} ${social.color} fs-4 me-3`}
                              ></i>
                              <span>{social.name}</span>
                            </div>
                          </Link>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* EVENT SETTINGS */}
              <Col md={12} className="mt-4">
                <Card className="custom-card">
                  <Card.Header>
                    <h3 className="card-title">Event Settings</h3>
                  </Card.Header>

                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <label className="fw-bold">
                          Payment Gateway Charges
                        </label>
                        <p className="text-muted">
                          {profile?.payment_gateway_charges
                            ? profile.payment_gateway_charges + " %"
                            : "0 %"}
                        </p>
                      </Col>

                      <Col md={3}>
                        <label className="fw-bold">
                          Default Platform Charges
                        </label>
                        <p className="text-muted">
                          {profile?.default_platform_charges
                            ? profile.default_platform_charges + " %"
                            : "0 %"}
                        </p>
                      </Col>

                      <Col md={3}>
                        <label className="fw-bold">
                          Admin Approval Required
                        </label>
                        <p className="text-muted text-capitalize">
                          {profile?.admin_approval_required || "No"}
                        </p>
                      </Col>

                      <Col md={3}>
                        <label className="fw-bold">Approval Type</label>
                        <p className="text-muted text-capitalize">
                          {profile?.approval_type || "Not Set"}
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* CHANGE PASSWORD */}
              <Col md={12} className="mt-4">
                <Card className="custom-card">
                  <Card.Header>
                    <h3 className="card-title">Change Password</h3>
                  </Card.Header>

                  <Card.Body>
                    <CForm onSubmit={UpdatePassword}>
                      <Row className="align-items-end g-3">
                        <CCol md={4}>
                          <CFormLabel>New Password</CFormLabel>
                          <CFormInput
                            type="password"
                            required
                            minLength={5}
                            value={Password}
                            onChange={(e) =>
                              setPassword(e.target.value)
                            }
                          />
                        </CCol>

                        <CCol md={4}>
                          <CFormLabel>Confirm Password</CFormLabel>
                          <CFormInput
                            type="password"
                            required
                            minLength={5}
                            value={confirmPassword}
                            onChange={(e) =>
                              setConfirmPassword(e.target.value)
                            }
                          />
                        </CCol>

                        <CCol md={4}>
                          <CButton
                            color="primary"
                            type="submit"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Spinner size="sm" />
                            ) : (
                              "Submit"
                            )}
                          </CButton>
                        </CCol>
                      </Row>
                    </CForm>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

Profile.layout = "Contentlayout";

export default Profile;
