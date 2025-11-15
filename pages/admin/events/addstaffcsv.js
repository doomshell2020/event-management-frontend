import React, { useEffect, useState } from "react";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { Breadcrumb, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { optiondefault } from "../../../shared/data/form/form-validation"
import { DateAndTimePickers, Datepicker } from '../../../shared/data/form/form-elements';
import DatePicker from "react-datepicker";
import Link from "next/link";
import axios from "axios";
import { useRouter } from 'next/router';
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import { Tooltip, IconButton, Switch } from "@mui/material";
import { CSVLink } from "react-csv";

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

const StaffAddCsv = () => {
    //DefaultValidation
    const router = useRouter();
    const { id } = router.query;
    const finalId = id ? id : 108;


    const [Default, setDefault] = useState("");
    const [eventName, setEventName] = useState(null);
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [data, setData] = useState("");
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



    const importExcel = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                const headers = jsonData[0];
                const formattedData = jsonData.map((row) => {
                    const rowData = {};
                    headers.forEach((header, index) => {
                        rowData[header] = row[index];
                    });
                    return rowData;
                });
                setData(formattedData);
            };
            reader.readAsBinaryString(file);
        } else {
            console.error('Please select an Excel file.');
        }
    };

    const handleSubmitCustom = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {

            const EventsAddUrl = '/api/v1/eventstaff';
            event.preventDefault();
            const body = {
                exceldata: data,
                key: "importExcel",
                eventID: finalId
            };

            await axios.post(EventsAddUrl, body)
                .then((res) => {
                    if (res.data.success === true) {
                        const msg = res.data.message
                        localStorage.setItem("staticAdded", msg);
                        routeChange();
                    } else {
                        const msg = res.data.message
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops!',
                            text: msg
                        });
                    }
                }).catch((err) => {
                    console.log("message", err)
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops!',
                        text: err
                    });
                    // const message = err.response.data.message
                    // setError(message);
                });
        }
        setValidatedCustom(true);
    }

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
                // setIsLoading(false)
            })
            .catch(error => {
                console.error('There was a problem with your Axios request:', error);
            });
    };

    useEffect(() => {
        handleViewEvent();
    }, [])

    // Dawnload dummy excel
    var Firstname, Lastname, email, department, waiver;
    // Dummy data
    // Export Excel
    const DATATABLE = [
        {
            id: 0,
            FirstName: "Test1",
            LastName: "Test",
            Email: "test1@example.com",
            Department: "CORE",
        },
        {
            id: 1,
            FirstName: "Test2",
            LastName: "Test2",
            Email: "test2@example.com",
            Department: "COMP",
        },
        {
            id: 1,
            FirstName: "Test3",
            LastName: "Test3",
            Email: "test3@example.com",
            Department: "STAFF",
        }, {
            id: 1,
            FirstName: "Test4",
            LastName: "Test4",
            Email: "test4@example.com",
            Department: "STAFF",
        }, {
            id: 1,
            FirstName: "Test5",
            LastName: "Test5",
            Email: "test5@example.com",
            Department: "CORE",
        },
    ];
    const headers = [
        { label: "S.No", key: "sno" },
        { label: "LastName", key: "LastNamee" },
        { label: "FirstName", key: "FirstNamee" },
        { label: "Email", key: "userEmail" },
        { label: "Department", key: "Department" }
    ];

    const Exceldata = DATATABLE.map((item, index) => {
        if (item.FirstName != null) {
            Firstname = item.FirstName;
        } else {
            Firstname = "----";
        }
        if (item.LastName != null) {
            Lastname = item.LastName;
        } else {
            Lastname = "----";
        }
        if (item.Email != null) {
            email = item.Email;
        } else {
            email = "----";
        }
        if (item.Department != null) {
            department = item.Department;
        } else {
            department = "----";
        }
        // if (item.WaiverFlag != null) {
        //     waiver = item.WaiverFlag === 0
        //         ? "Not Yet Send"
        //         : item.WaiverFlag === 1
        //             ? "Signed"
        //             : "Unknown";
        // } else {
        //     waiver = "----";
        // }
        return {
            sno: index + 1,
            FirstNamee: Firstname,
            LastNamee: Lastname,
            userEmail: email,
            Department: department,
            Waiver: waiver,
        };
    });

    const onExportLinkPress = async () => {
        const csvData = [
            headers.map((header) => header.label),
            ...Exceldata.map((item) => Object.values(item)),
        ];
        const csvOptions = {
            filename: "my-file.csv",
            separator: ",",
        };
        const csvExporter = new CSVLink(csvData, csvOptions);
        // csvExporter.click();
    };







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
                            AddCsv
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>
            {/* <!-- /breadcrumb --> */}

            {/* <!--Row--> */}
            <div className="row">

                <Col lg={12} md={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between flex-wrap">
                                <h4 className="card-title mg-b-5">{eventName ? eventName.Name : '--'}</h4>
                                <div style={{ columnGap: "15px", display: "flex", }}>
                                    <p style={{ color: "red" }}>Note: This template must be used to upload the staff details.<br />Please download it,update the info and upload below.</p>
                                    <IconButton onClick={onExportLinkPress}>
                                        <CSVLink
                                            headers={headers}
                                            data={Exceldata}
                                            filename={"samplestaff.csv"}
                                            className="btn btn-sm btn-primary-light ms-auto me-2"
                                            target="_blank"
                                        >
                                            Download CSV Template
                                            {/* <i className="bi bi-file-earmark-excel-fill"></i> */}
                                        </CSVLink>
                                    </IconButton>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <CForm
                                className="row g-3 needs-validation"
                                noValidate
                                validated={validatedCustom}
                                onSubmit={handleSubmitCustom}
                            >
                                {/* <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Add CSV<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <CFormInput
                                        type="file"
                                        id="validationDefault01"
                                        required
                                        value={firstName}
                                        onChange={(e) => {
                                            setFirstName(e.target.value);
                                        }}
                                    />
                                </CCol> */}

                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationCustom03">Choose CSV</CFormLabel>
                                    <CFormInput type="File" id="validationCustom03" required
                                        accept=".csv"
                                        onChange={(e) => {
                                            importExcel(e.target.files[0]);
                                        }}
                                    />
                                    <CFormFeedback invalid>Please provide a valid excel file.</CFormFeedback>
                                </CCol>










                                <CCol md={12} className="d-flex ">
                                    <Link href={`/admin/events/staff/?id=${finalId}`}>
                                        <CButton color="primary me-4" >
                                            Back
                                        </CButton>
                                    </Link>
                                    <CButton color="primary" type="submit">
                                        Submit
                                    </CButton>
                                </CCol>

                            </CForm>

                        </Card.Body>
                    </Card>
                </Col>
            </div>
            {/* <!--/Row--> */}
        </div>
    );
}

StaffAddCsv.propTypes = {};

StaffAddCsv.defaultProps = {};

StaffAddCsv.layout = "Contentlayout"

export default StaffAddCsv;
