import React, { useCallback, useEffect, useState } from "react";

import { Card, Col, Dropdown, Breadcrumb, Nav, Row, Tab, FormGroup, Form, Alert, Collapse, Spinner } from "react-bootstrap";
import Link from "next/link";
import ImageViewer from "react-simple-image-viewer";
// import { images } from "../../../shared/data/pages/profile";
import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from "next/image";

import { CCol, CForm, CButton, CFormLabel, CFormInput, CFormFeedback, } from "@coreui/react";

const Profile = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [profile, setProfile] = useState("")
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [Password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const openImageViewer = useCallback((index) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  const [domLoaded, setDomLoaded] = useState(false);

  const [openAlert, setOpenAlert] = useState(false);
  const [staticAdded, setStaticAdded] = useState("");

  var StaticMessage = '';
  useEffect(() => {
    if (typeof window !== 'undefined') {
      var StaticMessage = localStorage.getItem("staticAdded");
      if (StaticMessage != null && StaticMessage !== "") {
        setOpenAlert(true);
        setStaticAdded(StaticMessage);
        setTimeout(() => {
          localStorage.setItem("staticAdded", "");
          setOpenAlert(false);
        }, 3000);
      } else {
        setOpenAlert(false);
        setStaticAdded("");
      }
    }
  }, [StaticMessage]);



  useEffect(() => {
    setDomLoaded(true);
    if (typeof window !== 'undefined') {
      var storeToken = localStorage.getItem('accessToken_');
      var option = {
        headers: {
          Authorization: storeToken,
        },
      };
      const profileUrl = '/api/v1/users'
      fetch(profileUrl, option)
        .then((response) => response.json())
        .then((value) => {
          // console.log("value", value)
          setProfile(value.data);
        });
    }
    // console.log(item,'dddd'); 
  }, []);


  if (typeof window !== 'undefined') {
    var storeToken = localStorage.getItem('accessToken_');
    var options = {
      headers: {
        Authorization: storeToken,
      },
    };
  }
  // Change passwords
  const UpdatePassword = async (event) => {
    setIsLoading(true);
    const form = event.currentTarget;
    event.preventDefault();
    const apiUrl = '/api/v1/front/users';
    if (Password == confirmPassword) {
      const body = new FormData();
      body.append("Password", Password);
      body.append("key", "changePassword");
      await axios.put(apiUrl, body, options)
        .then((res) => {
          setIsLoading(false);
          const msg = res.data.message;
          toast.success(msg, {
            position: toast.POSITION.TOP_RIGHT,
          });
          setPassword("");
          setConfirmPassword("");
        }).catch((err) => {
          setIsLoading(false);
          const message = err.response.data.message
          console.log("message", message)
        });
    } else {
      alert("Please ensure both fields contain the same password.");
      setIsLoading(false);
    }
    // }
    // setValidatedCustom(true);
  }

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
            {staticAdded != null && openAlert === true && (
              <Collapse in={openAlert}>
                <Alert aria-hidden={true} severity="success">
                  {staticAdded}
                </Alert>
              </Collapse>
            )}
            <Card.Body className=" d-md-flex  bg-white">
              <div className="">
                <span className="profile-image pos-relative">
                  <Image
                    src={
                      profile?.ImageURL
                        ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${profile.ImageURL}`
                        : `${process.env.NEXT_PUBLIC_S3_URL}/profiles/dummy-user.png`
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
                  {profile.FirstName ? (
                    <span>{profile.FirstName}</span>
                  ) : (
                    <span>---</span>
                  )} {profile.LastName ? (
                    <span>{profile.LastName}</span>
                  ) : (
                    <span>---</span>
                  )}
                </h4>
                <p className="tx-13 text-muted ms-md-4 ms-0 mb-2 pb-2 ">
                  <span className="me-3">
                    <i className="far fa-address-card me-2"></i>{profile.CompanyName ? (
                      <span>{profile.CompanyName}</span>
                    ) : (
                      <span>---</span>
                    )}({profile.CompanyTitle ? (
                      <span>{profile.CompanyTitle}</span>
                    ) : (
                      <span>---</span>
                    )})
                  </span>
                  <span className="me-3">
                    <i className="fa fa-building me-2"></i>
                    {profile.country_group === 0 && (
                      "N/A"
                    )}
                    {profile.country_group === 1 && (
                      "Europe"
                    )}
                    {profile.country_group === 2 && (
                      "Africa"
                    )}
                    {profile.country_group === 3 && (
                      "Mexico"
                    )}
                    {profile.country_group === 4 && (
                      "South America"
                    )}
                    {profile.country_group === 5 && (
                      "USA"
                    )}
                    {profile.country_group === 6 && (
                      "Australia"
                    )}
                  </span>
                  {/* <span>
                    <i className="far fa-flag me-2"></i>New Jersey
                  </span> */}
                </p>
                <p className="text-muted ms-md-4 ms-0 mb-2">
                  <span>
                    <i className="fa fa-phone me-2"></i>
                  </span>
                  <span className="font-weight-semibold me-2">Phone:</span>
                  <span>+{profile.PhoneNumber}</span>
                </p>
                <p className="text-muted ms-md-4 ms-0 mb-2">
                  <span>
                    <i className="fa fa-envelope me-2"></i>
                  </span>
                  <span className="font-weight-semibold me-2">Email:</span>
                  <span> {profile.Email}</span>
                </p>
                <p className="text-muted ms-md-4 ms-0 mb-2">
                  <span>
                    <i className="fa fa-map-marker me-2"></i>
                  </span>
                  {/* <span>MIG-1-11, Monroe Street, Georgetown, Mexico, USA,20071</span> */}
                  <span> {profile && profile.AddressLine1 ? profile.AddressLine1 : '-'},{profile && profile.AddressLine2 ? profile.AddressLine2 : '-'},
                    {profile.country_group === 0 && "N/A"}
                    {profile.country_group === 1 && "Europe"}
                    {profile.country_group === 2 && "Africa"}
                    {profile.country_group === 3 && "Mexico"}
                    {profile.country_group === 4 && "South America"}
                    {profile.country_group === 5 && "USA"}
                    {profile.country_group === 6 && "Australia"}
                  </span>
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
                              <Card.Body className=" p-0 border-0 p-0 rounded-10">
                                <div className="border-top"></div>
                                <div className="border-top"></div>
                                <div className="p-4">
                                  <label className="main-content-label tx-13 mg-b-20">
                                    Social Networks :
                                  </label>
                                  <div className="d-lg-flex">
                                    <div className="mg-md-r-20 mg-b-10">
                                      <div className="main-profile-social-list">
                                        <div className="media">
                                          <div className="media-icon bg-primary-transparent text-primary">
                                            <i className="icon ion-logo-instagram"></i>
                                          </div>
                                          <div className="media-body">
                                            {" "}
                                            <span>Instagram</span>{" "}
                                            <Link href="https://www.instagram.com/ondalinda_/">instagram.com/ondalinda</Link>{" "}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mg-md-r-20 mg-b-10">
                                      <div className="main-profile-social-list">
                                        <div className="media">
                                          <div className="media-icon bg-success-transparent text-success">
                                            <i className="icon ion-logo-facebook"></i>
                                          </div>
                                          <div className="media-body">
                                            {" "}
                                            <span>Facebook</span>{" "}
                                            <Link href="https://www.facebook.com/ondalindafestival/">
                                              facebook.com/ondalindafestival
                                            </Link>{" "}
                                          </div>
                                        </div>
                                      </div>
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
                            <CForm
                              className="needs-validation"
                              onSubmit={UpdatePassword}
                            >
                              <Row className="gy-2">
                                <CCol md={6}>
                                  <CFormLabel htmlFor="validationDefault01">Password</CFormLabel>
                                  <CFormInput
                                    type="password"
                                    id="validationDefault01"
                                    required
                                    minLength="5"
                                    value={Password}
                                    onChange={(e) => {
                                      setPassword(e.target.value);
                                    }}
                                  />
                                  <CFormFeedback valid>Looks good!</CFormFeedback>
                                </CCol>
                                <CCol md={6}>
                                  <CFormLabel htmlFor="validationDefault02">Change Password </CFormLabel>
                                  <CFormInput
                                    type="password"
                                    id="validationDefault02"
                                    required
                                    minLength="5"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                      setConfirmPassword(e.target.value);
                                    }}
                                  />
                                  <CFormFeedback valid>Looks good!</CFormFeedback>
                                </CCol>
                                <CCol md={2} >
                                  <CButton color="primary" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                      'Submit'
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
