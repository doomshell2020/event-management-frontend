import React, { useState, useEffect } from "react";
import { Breadcrumb, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import Link from "next/link";
import axios from "axios";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CFormCheck,
  CFormTextarea,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import { useRouter } from 'next/router'
import api from "@/utils/api";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
const ProfileEdit = () => {
  //DefaultValidation
  const router = useRouter();
  const [id, setId] = useState('');
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState("");

  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [googlePlusUrl, setGooglePlusUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [googlePlayStore, setGooglePlayStore] = useState("");
  const [appleStore, setAppleStore] = useState("");

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
          const userData = res.data.data;
          setId(userData.id);
          setName(userData.first_name);
          setMobile(userData.mobile);
          setEmail(userData.email);
          setFacebookUrl(userData.fburl);
          setInstagramUrl(userData.instaurl);
          setTwitterUrl(userData.Twitterurl);
          setGooglePlusUrl(userData.googleplusurl);
          setLinkedinUrl(userData.linkdinurl);
          setGooglePlayStore(userData.googleplaystore);
          setAppleStore(userData.applestore);
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

  const [validatedCustom, setValidatedCustom] = useState(false);
  const UpdateProfile = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    // Frontend validation
    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidatedCustom(true);

      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields correctly.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        first_name: name?.trim(),
        email: email?.trim(),
        mobile: mobile?.trim(),
        fburl: facebookUrl?.trim(),
        instaurl: instagramUrl?.trim(),
        Twitterurl: twitterUrl?.trim(),
        linkdinurl: linkedinUrl?.trim(),
        googleplaystore: googlePlayStore?.trim(),
        applestore: appleStore?.trim(),
        googleplusurl: googlePlusUrl?.trim(),
      };
      const res = await api.patch(`/api/v1/admin/auth/${id}/update-profile`, payload);
      if (res.data?.success) {
        const result = await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Admin profile updated successfully!",
          confirmButtonText: "OK",
        });
        if (result.isConfirmed) {
          router.push("/admin/profile");
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.data?.message || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      // console.log("object",err?.response?.data?.error?.details[0])
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text:
          err?.response?.data?.error?.details[0]?.msg ||
          "Internal server error",
      });
    } finally {
      setIsLoading(false);
      setValidatedCustom(true);
    }
  };


  return (
    <div>
      <Seo title={"Profile-Edit"} />
      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Edit profile
          </span>

        </div>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Profile
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              edit
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}

      {/* <!--Row--> */}
      <div className="row">

        <Col lg={12} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Edit Page</h3>
            </Card.Header>
            <Card.Body>
              <CForm
                className="needs-validation"
                noValidate
                validated={validatedCustom}
                onSubmit={UpdateProfile}
              >
                <Row className="gy-4">

                  {/* Name */}
                  <CCol md={3}>
                    <CFormLabel>Name<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CFormInput
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </CCol>

                  {/* Mobile */}
                  <CCol md={3}>
                    <CFormLabel>Mobile<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CFormInput
                      type="text"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </CCol>

                  {/* Email */}
                  <CCol md={3}>
                    <CFormLabel>Contact Email<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>@</CInputGroupText>
                      <CFormInput
                        type="email"
                        required
                        readOnly
                        value={email}
                      />
                    </CInputGroup>
                  </CCol>

                  {/* Facebook */}
                  <CCol md={3}>
                    <CFormLabel>Facebook URL<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CFormInput
                      type="url"
                      required
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                    />
                  </CCol>

                  {/* Instagram */}
                  <CCol md={3}>
                    <CFormLabel>Instagram URL</CFormLabel>
                    <CFormInput
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                    />
                  </CCol>

                  {/* Twitter */}
                  <CCol md={3}>
                    <CFormLabel>Twitter URL<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CFormInput
                      type="url"
                      required
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                    />
                  </CCol>

                  {/* Google Plus */}
                  <CCol md={3}>
                    <CFormLabel>Google Plus URL<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CFormInput
                      type="url"
                      required
                      value={googlePlusUrl}
                      onChange={(e) => setGooglePlusUrl(e.target.value)}
                    />
                  </CCol>

                  {/* LinkedIn */}
                  <CCol md={3}>
                    <CFormLabel>LinkedIn URL<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CFormInput
                      type="url"
                      required
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </CCol>

                  {/* Google Play Store */}
                  <CCol md={3}>
                    <CFormLabel>Google Play Store<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CFormInput
                      type="url"
                      value={googlePlayStore}
                      onChange={(e) => setGooglePlayStore(e.target.value)}
                    />
                  </CCol>

                  {/* Apple Store */}
                  <CCol md={3}>
                    <CFormLabel>Apple Store<span style={{ color: "red" }}>*</span></CFormLabel>
                    <CFormInput
                      type="url"
                      value={appleStore}
                      onChange={(e) => setAppleStore(e.target.value)}
                    />
                  </CCol>

                  {/* Buttons */}
                  <CCol md={10} className="col-6">
                    <Link href="/admin/profile/">
                      <CButton color="primary">Back</CButton>
                    </Link>
                  </CCol>

                  <CCol md={2} className="text-end col-6">
                    <CButton color="primary" type="submit" disabled={isLoading}>
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
      </div>
      {/* <!--/Row--> */}
    </div>
  );
}

ProfileEdit.propTypes = {};

ProfileEdit.defaultProps = {};

ProfileEdit.layout = "Contentlayout"

export default ProfileEdit;
