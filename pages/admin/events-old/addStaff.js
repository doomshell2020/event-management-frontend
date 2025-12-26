import React, { useEffect, useState } from "react";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { Breadcrumb, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { optiondefault } from "../../../shared/data/form/form-validation";
import {
  DateAndTimePickers,
  Datepicker,
} from "../../../shared/data/form/form-elements";
import DatePicker from "react-datepicker";
import ClipLoader from "react-spinners/ClipLoader";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
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
  CFormSelect,
} from "@coreui/react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import Seo from "@/shared/layout-components/seo/seo";

const StaffAdd = () => {
  //DefaultValidation
  const router = useRouter();
  const { id } = router.query;
  const finalId = id ? id : 109;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [DepartmentTypes, setDepartmentTypes] = useState("");

  const [department, setDepartment] = useState("");
  const [eventName, setEventName] = useState(null);
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [eventDepartment, setEventDepartment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleChange = (newValue) => {
    setDepartment(newValue ? newValue.value : "");
    setIsTouched(true);
    setIsValid(!!newValue);
  };

  const departmentOptions = eventDepartment.map((dept) => ({
    value: dept.Department, // Adjust if your data structure is different
    label: dept.Department,
  }));

  // Route Change
  let navigate = useRouter();
  const routeChange = () => {
    let path = `/admin/events/staff/?id=${finalId}`;
    navigate.push(path);
  };

  const addStaff = async (event) => {
    const form = event.currentTarget;

    event.preventDefault();
    // if (!department) {
    //     setIsTouched(true);
    //     setIsValid(false);
    // }
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      const staffAddUrl = "/api/v1/eventstaff";
      event.preventDefault();
      const body = {
        EventID: router.query.id,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Department: DepartmentTypes,
        WaiverFlag: 0,
      };

      try {
        const confirmationResult = await Swal.fire({
          title: "Warning",
          text: "Are you sure you want to add this user and send the invite?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes!",
          cancelButtonText: "No, cancel",
        });

        if (confirmationResult.isConfirmed) {
          const res = await axios.post(staffAddUrl, body);

          if (res.data.success === true) {
            const response = await axios.post(staffAddUrl, {
              key: "sendInvitation",
              Email: [email],
              EventID: router.query.id,
            });

            if (response.data.statusCode == 200) {
              const msg = res.data.message;
              // localStorage.setItem("staticAdded", msg);
              Swal.fire({
                icon: "success",
                title: "Success!",
                text: msg,
              }).then(() => {
                routeChange();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to send invitation",
              });
            }
          } else {
            const msg = res.data.message;
            Swal.fire({
              icon: "error",
              title: "Oops!",
              text: msg,
            });
          }
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while adding the staff member. Please try again.",
        });
        console.log("Error message:", err);
      }
    }
    setValidatedCustom(true);
  };

  const handleViewEvent = async (finalId) => {
    const API_URL1 = `/api/v1/eventstaff?EventID=${finalId}`;
    const API_URL2 = `/api/v1/eventstaff?EventIDS=${finalId}`;

    try {
      // Make the requests in parallel
      const [response1, response2] = await Promise.all([
        axios.get(API_URL1, {
          headers: {
            "Content-Type": "application/json",
          },
        }),
        axios.get(API_URL2, {
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      // Set the state based on the responses
      setEventName(response1.data.data);
      setEventDepartment(response2.data.data);
    } catch (error) {
      console.error("There was a problem with your Axios request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleViewEvent(finalId);
  }, [finalId]);

  return (
    <div>
      <Seo title={"Add Events Staff"} />

      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Staff Manager
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
              Events
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Staff
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Add
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
              <h3 className="card-title">
                {eventName ? eventName.Name : "--"}
              </h3>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div
                  className="loader inner-loader"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ClipLoader
                    // color={color}
                    loading={isLoading}
                    color="#36d7b7"
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </div>
              ) : (
                <CForm
                  className="row g-3 needs-validation"
                  noValidate
                  validated={validatedCustom}
                  onSubmit={addStaff}
                >
                  <CCol md={3}>
                    <CFormLabel htmlFor="validationDefault02">
                      Email<span style={{ color: "Red" }}>*</span>
                    </CFormLabel>
                    <CFormInput
                      type="email"
                      id="validationDefault02"
                      placeholder="Email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                    />
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel htmlFor="validationDefault01">
                      First Name<span style={{ color: "Red" }}>*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault01"
                      placeholder="First Name"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel htmlFor="validationDefault02">
                      Last Name<span style={{ color: "Red" }}>*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault02"
                      placeholder="Last Name"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel htmlFor="validationDefault02">
                      Department<span style={{ color: "Red" }}>*</span>
                    </CFormLabel>
                    <select
                      name="id"
                      className="form-control"
                      id="validationDefault02"
                      required
                      value={DepartmentTypes}
                      onChange={(e) => {
                        setDepartmentTypes(e.target.value);
                      }}
                    >
                      <option value="">-Select Department-</option>
                      <option value="CORE">CORE</option>
                      <option value="STAFF">STAFF</option>
                      <option value="COMP">COMP</option>
                      <option value="PRESS/DJS">PRESS/DJS</option>
                    </select>
                  </CCol>
                  {/* <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault02" style={{ display: 'inline' }}>
                                            Department<span style={{ color: 'Red' }}>*</span>
                                    </CFormLabel>
                                    <select name="id" className="form-control"   id="validationDefault02" required
                                      value={DepartmentTypes}
                                        onChange={(e) => {
                                            setDepartmentTypes(e.target.value);
                                        }}
                                    >
                                        <option value="">-Select-</option>
                                        <option value="CORE">CORE</option>
                                        <option value="STAFF">STAFF</option>
                                        <option value="COMP">COMP</option>
                                    </select>

                                    </CCol> */}

                  {/* <CCol md={12}>
                                        <CFormLabel htmlFor="validationDefault04" style={{ display: 'inline' }}>
                                            Department<span style={{ color: 'Red' }}>*</span>
                                        </CFormLabel>
                                        <CFormFeedback style={{ display: 'inline', marginLeft: '8px' }}>
                                            (To create a new department, please type in the department name.)
                                        </CFormFeedback>
                                        <CreatableSelect
                                            className={`admn-slct ${isTouched && !isValid ? 'is-invalid' : ''}`}
                                            value={departmentOptions.find(option => option.value === department) || { value: department, label: department }}
                                            onChange={handleChange}
                                            options={departmentOptions}
                                            isClearable
                                            isSearchable
                                            placeholder="Select or create a department"
                                            noOptionsMessage={() => 'No options available'}
                                            onBlur={() => setIsTouched(true)}
                                        />
                                        {isTouched && !isValid && (
                                            <CFormFeedback className="d-block" invalid>
                                                Please select or enter a department.
                                            </CFormFeedback>
                                        )}
                                    </CCol> */}

                  <CCol md={2} xs={6}>
                    <Link className="w-100" href={`/admin/events/staff/?id=${finalId}`}>
                      <CButton className="w-100 op-7" color="dark me-4">Back</CButton>
                    </Link>
                  </CCol>
                  <CCol md={2} xs={6}>
                    <CButton className="w-100" color="primary" type="submit">
                      Send Invite
                    </CButton>
                  </CCol>
                </CForm>
              )}
            </Card.Body>
          </Card>
        </Col>
      </div>
      {/* <!--/Row--> */}
    </div>
  );
};

StaffAdd.propTypes = {};

StaffAdd.defaultProps = {};

StaffAdd.layout = "Contentlayout";

export default StaffAdd;
