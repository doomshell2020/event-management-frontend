import React, { useState, useEffect } from "react";
import { Breadcrumb, Card, Col, Form, InputGroup, Row, Spinner, Alert } from "react-bootstrap";
import { useRouter } from 'next/router'
import axios from "axios";
import Link from "next/link";
import { CForm, CCol, CFormLabel, CFormFeedback, CFormInput, CInputGroup, CInputGroupText, CButton, CFormCheck, CFormTextarea, } from "@coreui/react";
import Swal from 'sweetalert2'; // Import Swal library
import Seo from "@/shared/layout-components/seo/seo";

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles



const DynamicEditor = dynamic(() => import('react-quill'), {
    ssr: false, // Ensure that this component is not rendered on the server
    loading: () => <div>Loading Editor...</div>
});


const CmsAdd = () => {
    //DefaultValidation
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [err, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    let navigate = useRouter();
    const routeChange = () => {
        let path = `/admin/cms/`;
        navigate.push(path);
    }

    const handleUrlChange = (e) => {
        let inputValue = e.target.value.trim(); // Remove leading and trailing spaces
        inputValue = inputValue
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^a-zA-Z0-9-]/g, '') // Remove non-alphanumeric characters except hyphen
            .replace(/-+/g, '-');
        if (!inputValue.startsWith('/')) {
            inputValue = `/${inputValue}`;
        }
        setUrl(inputValue);
    };

    const [editorValue, setEditorValue] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');

    const handleEditorChange = (value) => {
        setEditorValue(value);
        setPreviewHtml(value); // Update preview HTML
    };



    const newPageContentApi = async (event) => {
        const form = event.currentTarget;
        setIsLoading(true);
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setIsLoading(false);

        } else {
            const apiurl = `/api/v1/cms/`;
           
            if (!editorValue.trim()) {
                Swal.fire({
                    icon: 'error',
                    title: 'Empty Content',
                    text: 'Please enter some content in the description field.',
                });
                setIsLoading(false);
                return;
            } else {
                const body = {
                    Name: name,
                    VanityURL: url,
                    Content: editorValue.trim()
                };

                await axios.post(apiurl, body)
                    .then((res) => {
                        const msg = res.data.message;
                        routeChange();
                    }).catch((err) => {
                        const message = err.response ? err.response.data.message : "";
                        setError(message);
                        setIsLoading(false);

                    });
            }

        }
        setValidatedCustom(true);
    };


    //DefaultValidation
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
                            className="breadcrumb-item "
                            active
                            aria-current="page"
                        >
                            CMS
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            className="breadcrumb-item "
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
                                onSubmit={newPageContentApi}
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

                                    <CFormLabel htmlFor="validationDefault12"><b>Content</b><span style={{ color: "Red" }}>*</span></CFormLabel>

                                    <DynamicEditor
                                        value={editorValue}
                                        onChange={handleEditorChange}
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                ['bold', 'italic', 'underline', 'strike'], // toggled buttons
                                                ['blockquote', 'code-block'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                [{ 'script': 'sub' }, { 'script': 'super' }], // superscript/subscript
                                                [{ 'indent': '-1' }, { 'indent': '+1' }], // outdent/indent
                                                [{ 'direction': 'rtl' }], // text direction
                                                [{ 'size': ['small', false, 'large', 'huge'] }],
                                                [{ 'color': [] }, { 'background': [] }],
                                                [{ 'font': [] }],
                                                [{ 'align': [] }],
                                                ['link', 'image', 'video'],
                                                ['clean'], // remove formatting button

                                                // Additional custom features
                                                [{ 'header': 1 }, { 'header': 2 }], // Custom header sizes
                                                [{ 'italic': true }, { 'strike': true }], // More formatting options
                                                ['formula'], // Math formula input
                                                [{ 'list': 'check' }], // Checkbox list
                                                ['emoji'], // Emoji picker
                                                ['fullscreen'] // Fullscreen mode button
                                            ]
                                        }}
                                    />

                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault12"><b>Source Code</b></CFormLabel>
                                    <CFormTextarea
                                        type="text"
                                        id="validationDefault12sd"
                                        rows={10}
                                        value={editorValue}
                                    />

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
