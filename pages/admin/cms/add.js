import React, { useState, useEffect, useRef } from "react";
import { Breadcrumb, Card, Col, Form, InputGroup, Row, Spinner, Alert } from "react-bootstrap";

import { useRouter } from 'next/router'
import axios from "axios";
import Link from "next/link";
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
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";
// import { convertToRaw } from 'draft-js';

const CmsAdd = () => {
    const noteRef = useRef(null);
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [err, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [event, setEvent] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [data, setData] = useState({ content: "" });
    let navigate = useRouter();

    // add pages
    const submitAddForm = async (event) => {
        event.preventDefault();
        const content = getHtmlEditorContent(noteRef);
        // Create a temporary element to strip HTML tags and get plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";

        if (!plainText.trim()) {
            setError('Please enter some content in the description field.');
            setIsLoading(false);
            return;
        }

        const form = event.currentTarget;
        setIsLoading(true);

        if (!form.checkValidity()) {
            event.stopPropagation();
            setIsLoading(false);
            setValidatedCustom(true);
            return;
        }

        try {
            const apiurl = `/api/v1/cms?key=add`;
            const body = new FormData();
            body.append("Name", name);
            body.append("VanityURL", url);
            body.append("Content", content.trim());
            const res = await axios.post(apiurl, body);
            const msg = res.data.message;
            localStorage.setItem("staticAdded", msg);
            routeChange();
        } catch (err) {
            const message = err.response ? err.response.data.message : "An error occurred";
            setError(message);
        } finally {
            setIsLoading(false);
            setValidatedCustom(true);
        }
    };

    const routeChange = () => {
        let path = `/admin/cms/`;
        navigate.push(path);
    }

    const handleUrlChange = (e) => {
        let inputValue = e.target.value;
        if (!inputValue.startsWith('/')) {
            inputValue = `/${inputValue}`;
        }
        setUrl(inputValue);
    };

    const fetchActiveEvents = async () => {
        try {
            const response = await axios.get("/api/v1/emailtemplets/?key=findEvents");
            if (response.data && response.data.success) {
                setEvent(response.data.data); // Adjust the key based on API response structure
            } else {
                console.error("Failed to fetch currencies:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    };

    useEffect(() => {
        fetchActiveEvents();
    }, []);

    return (
        <div>
            <Seo title={"Cms Manager Add"} />

            {/* <!-- breadcrumb --> */}
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        CMS Manager
                    </span>

                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb className="breadcrumb">
                        <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            className="breadcrumb-item"
                            active
                            aria-current="page"
                        >
                            CMS
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            className="breadcrumb-item"
                            active
                            aria-current="page"
                        >
                            add
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
                            <h3 className="card-title">Add Page</h3>
                        </Card.Header>
                        <Card.Body>
                            {err && <Alert variant="danger">{err}</Alert>}
                            <CForm
                                className="row g-3 needs-validation"
                                noValidate
                                validated={validatedCustom}
                                onSubmit={submitAddForm}
                            >
                                <CCol md={6}>
                                    <CFormLabel htmlFor="validationDefault01">Name<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        required
                                        value={name}
                                        onChange={(e) => {
                                            // console.log(e.target.value);
                                            setName(e.target.value);
                                        }}
                                    />

                                </CCol>

                                <CCol md={6}>
                                    <CFormLabel htmlFor="validationDefault02">URL<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault02"
                                        required
                                        value={url}
                                        onChange={handleUrlChange}
                                    />

                                </CCol>

                                <CCol md={12}>
                                    <b>HTML Contents</b><span style={{ color: "Red" }}>*</span><br />

                                    <div >
                                        <HtmlEditor
                                            editorRef={noteRef}
                                            initialContent={data.content}
                                            onChange={(content) => setData({ ...data, content })}
                                        />
                                    </div>
                                </CCol>

                                <CCol md={10}>
                                    <Link href="/admin/cms">
                                        <CButton color="primary" >
                                            Back
                                        </CButton>
                                    </Link>
                                </CCol>
                                <CCol md={2}>

                                    <CButton variant="primary" className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        ) : (
                                            'Submit'
                                        )}
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

CmsAdd.propTypes = {};

CmsAdd.defaultProps = {};

CmsAdd.layout = "Contentlayout"

export default CmsAdd;
