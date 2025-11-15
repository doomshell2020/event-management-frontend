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


const ProfileEdit = () => {
  //DefaultValidation
  const [Default, setDefault] = useState("");
  const [FirstName, setFirstname] = useState("")
  const [Email, setEmail] = useState("");
  const [PhoneNumber, setPhonenumber] = useState("");
  const [AddressLine1, SetAddressLine1] = useState("");
  const [ImageURL, setImageURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [CompanyName, setCompanyName] = useState("");
  const [CompanyTitle, setCompanyTitle] = useState("");
  const [country_group, setCountry_group] = useState("");
  const [AddressLine2, setAddressLine2] = useState("");
  const [LastName, setLastName] = useState("");
  const handleOnchangedefault = () => {
    setDefault(Default);
  };


  const [validateddefault, setValidateddefault] = useState(false);
  const handleSubmitdefault = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidateddefault(true);
  };
  //DefaultValidation

  const [profile, setProfile] = useState("")
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
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
          // console.log("Valueeeeeeee", value)
          setProfile(value.data);
          setFirstname(value.data.FirstName)
          setEmail(value.data.Email);
          setPhonenumber(value.data.PhoneNumber)
          SetAddressLine1(value.data.AddressLine1);
          setCompanyName(value.data.CompanyName);
          setCompanyTitle(value.data.CompanyTitle);
          setCountry_group(value.data.country_group);
          setAddressLine2(value.data.AddressLine2);
          setLastName(value.data.LastName);

        });
    }
  }, []);


  let navigate = useRouter();
  const routeChange = () => {
    let path = `/admin/profile/`;
    navigate.push(path);
  }

  if (typeof window !== 'undefined') {
    var storeToken = localStorage.getItem('accessToken_');
    var options = {
      headers: {
        Authorization: storeToken,
      },
    };
  }

  const UpdateProfile = async (event) => {
    setIsLoading(true);
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      setIsLoading(false);
      event.preventDefault();
      event.stopPropagation();
    } else {
      const apiUrl = '/api/v1/users/';
      const body = new FormData();
      body.append("Email", Email);
      body.append("ImageURL", ImageURL);
      body.append("FirstName", FirstName);
      body.append("PhoneNumber", PhoneNumber);
      body.append("AddressLine1", AddressLine1);
      body.append("country_group", country_group);
      body.append("CompanyName", CompanyName);
      body.append("CompanyTitle", CompanyTitle);
      body.append("AddressLine2", AddressLine2);
      body.append("LastName", LastName);

      await axios.put(apiUrl, body, options)
        .then((res) => {
          // console.log("res", res)
          setIsLoading(false);
          const msg = res.data.message;
          localStorage.setItem("staticAdded", msg);
          routeChange()
        }).catch((err) => {
          const message = err.response.data.message
          console.log("message", message)
          setIsLoading(false);

          // setError(message);
        });
    }
    setValidatedCustom(true);
  }


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
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault01">Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault01"
                      required
                      value={FirstName}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setFirstname(e.target.value);
                      }}

                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault01">Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault01"
                      required
                      value={LastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}

                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationCustomUsername">Username</CFormLabel>
                    <CInputGroup className="has-validation">
                      <CInputGroupText id="inputGroupPrepend">@</CInputGroupText>
                      <CFormInput
                        type="email"
                        id="validationCustomUsername"
                        defaultValue=""
                        aria-describedby="inputGroupPrepend"
                        required
                        readOnly
                        value={Email}
                        onChange={(e) => {
                          console.log(e.target.value);
                          setEmail(e.target.value);
                        }}
                      />
                      <CFormFeedback invalid>Please choose a username.</CFormFeedback>
                    </CInputGroup>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault02">Mobile </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault02"
                      // maxLength="10"
                      // minLength="10"
                      required
                      value={PhoneNumber}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setPhonenumber(e.target.value);
                      }}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault02">Company Name </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault02"
                      required
                      value={CompanyName}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setCompanyName(e.target.value);
                      }}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault02">Company Title </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault02"
                      required
                      value={CompanyTitle}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setCompanyTitle(e.target.value);
                      }}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault02">Address1 </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault02"
                      required
                      value={AddressLine1}
                      onChange={(e) => {
                        console.log(e.target.value);
                        SetAddressLine1(e.target.value);
                      }}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault02">Address2 </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault02"
                      value={AddressLine2}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setAddressLine2(e.target.value);
                      }}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault02">Country</CFormLabel>
                    <select
                      className="form-control"
                      aria-label="Default select example"
                      placeholder="Country"
                      required
                      value={country_group}
                      onChange={(e) => {
                        setCountry_group(e.target.value);
                      }}
                    >
                      <option value=""> Select Location</option>
                      <option value="0">N/A</option>
                      <option value="1">Europe</option>
                      <option value="2">Africa</option>
                      <option value="3">Mexico</option>
                      <option value="4">South America</option>
                      <option value="5">USA</option>
                      <option value="6">Australia</option>

                    </select>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="validationDefault02">Image </CFormLabel>
                    <CFormInput
                      type="file"
                      onChange={(e) => {
                        console.log(e.target.value);
                        setImageURL(e.target.files[0]);
                      }}
                    />
                  </CCol>

                  <CCol md={10} className=" col-6">
                    <Link href="/admin/profile/">
                      <CButton color="primary" >
                        Back
                      </CButton>
                    </Link>
                  </CCol>
                  <CCol md={2} className="text-end col-6">
                    {/* <CButton color="primary" type="submit">
                    Submit
                  </CButton> */}
                    <CButton
                      color="primary" type="submit"
                      disabled={isLoading}
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
