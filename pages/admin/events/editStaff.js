import React, { useEffect, useState } from "react";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { Breadcrumb, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { optiondefault } from "../../../shared/data/form/form-validation"
import { DateAndTimePickers, Datepicker } from '../../../shared/data/form/form-elements';
import DatePicker from "react-datepicker";
import Link from "next/link";
import axios from "axios";
import { useRouter } from 'next/router';
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

const StaffEdit = () => {
    //DefaultValidation
    const router = useRouter();
    const { id, staffid } = router.query;
    const finalId = id ? id : 109;

    const [Default, setDefault] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [waiverFlag, setWaiverFlag] = useState("");
    const [wristband, setWristband] = useState("");
    const [eventName, setEventName] = useState(null);
    const [validatedCustom, setValidatedCustom] = useState(false);
    // const [startDate, setStartDate] = useState(new Date());
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
    // Route Change
    let navigate = useRouter();
    const routeChange = () => {
        let path = `/admin/events/staff/?id=${finalId}`;
        navigate.push(path);
    }

    const staffEdit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            const staffEditUrl = `/api/v1/eventstaff?staffid=${staffid}`;
            event.preventDefault();
            const body = {
                // EventID: finalId,
                FirstName: firstName,
                LastName: lastName,
                Email: email,
                Department: department,
            }
            await axios.put(staffEditUrl, body)
                .then((res) => {
                    console.log("res", res)
                    const msg = res.data.message;
                    localStorage.setItem("staticAdded", msg);
                    routeChange()
                }).catch((err) => {
                    console.log("message", err)
                    // const message = err.response.data.message
                    // setError(message);
                });
        }
        setValidatedCustom(true);
    }

    // view staff detail
    const handleViewStaff = async () => {
        const API_URL = `/api/v1/eventstaff?StaffId=${staffid}`;
        axios.get(API_URL, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                const data = response.data.data;
                setFirstName(data.FirstName)
                setLastName(data.LastName)
                setEmail(data.Email)
                setDepartment(data.Department)
                setWaiverFlag(data.WaiverFlag)
                setIsLoading(false)
            })
            .catch(error => {
                console.error('There was a problem with your Axios request:', error);
            });
    };


    // view Event name
    const handleViewEvent = async () => {
        const API_URL = `/api/v1/eventstaff?EventID=${finalId}`;
        axios.get(API_URL, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                // console.log("response", response.data.data);
                setEventName(response.data.data)
                setIsLoading(false)
            })
            .catch(error => {
                console.error('There was a problem with your Axios request:', error);
            });
    };

    useEffect(() => {
        handleViewEvent();
        if (staffid != undefined) {
            handleViewStaff();
        }
    }, [staffid])



    return (
        <div>
            <Seo title={"Edit Events Staff"} />

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
                            Edit
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
                            <h3 className="card-title">{eventName ? eventName.Name : '--'}</h3>
                        </Card.Header>
                        <Card.Body>
                            <CForm
                                className="row g-3 needs-validation"
                                noValidate
                                validated={validatedCustom}
                                onSubmit={staffEdit}
                            >
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">First Name<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="First Name"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    // disabled={waiverFlag !== 0}

                                    />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault02">Last Name<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault02"
                                        placeholder="Last Name"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    // disabled={waiverFlag !== 0}
                                    />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault02">Email<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <CFormInput
                                        type="email"
                                        id="validationDefault02"
                                        placeholder="Email"
                                        required
                                        value={email}
                                        disabled={waiverFlag !== 0}
                                    />
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault02">Department<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <select
                                        name="id"
                                        className="form-control"
                                        id="validationDefault02"
                                        required
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        disabled={waiverFlag !== 0}
                                    >

                                        <option value="">-Select Department-</option>
                                        <option value="CORE">CORE</option>
                                        <option value="STAFF">STAFF</option>
                                        <option value="COMP">COMP</option>
                                        <option value="PRESS/DJS">PRESS/DJS</option>

                                    </select>
                                </CCol>

                                <CCol md={12} className="d-flex ">
                                    <Link href={`/admin/events/staff/?id=${finalId}`}>
                                        <CButton color="primary me-4" >
                                            Back
                                        </CButton>
                                    </Link>
                                    <CButton color="primary" type="submit">
                                        Update
                                    </CButton>
                                </CCol>

                            </CForm>

                        </Card.Body>
                    </Card>
                </Col>
            </div>
            {/* <!--/Row--> */}
        </div >
    );
}

StaffEdit.propTypes = {};

StaffEdit.defaultProps = {};

StaffEdit.layout = "Contentlayout"

export default StaffEdit;
