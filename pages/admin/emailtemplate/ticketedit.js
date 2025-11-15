import React, { useState, useEffect, useRef } from "react";
import { Breadcrumb, Card, Col, Alert, Spinner, Form } from "react-bootstrap";
import {
    CForm,
    CCol,
    CFormLabel,
    CFormFeedback,
    CFormInput,
    CButton,
} from "@coreui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Seo from "@/shared/layout-components/seo/seo";
import axios from "axios";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import SummernoteLite from "react-summernote-lite";// you need to iport the css style yourself
import 'react-summernote-lite/dist/summernote-lite.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const EditTicketTemplate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [editorLoaded, setEditorLoaded] = useState(false);
    let navigate = useRouter();
    const noteRef = useRef(null);
    const [isClient, setIsClient] = useState(false)
    const { query } = navigate;
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");

    useEffect(() => {
        if (query.id != undefined) {
            var apiUrl = `/api/v1/emailtemplets/?key=emailTemplatebyid&id=${query.id}`
            fetch(apiUrl)
                .then((response) => response.json())
                .then((value) => {
                    setTitle(value.data.title)
                    setSubject(value.data.subject)
                    setDescription(value.data.description)
                })
        }
    }, [query.id])

    useEffect(() => {
        setIsClient(true)
    }, [query.id]);



    const [err, setError] = useState("");
    const [validatedCustom, setValidatedCustom] = useState(false);
    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        setIsLoading(true);
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setIsLoading(false);

        } else {
            const textContent = noteRef.current.summernote('code');
            const apiurl = `/api/v1/emailtemplets?template_id=${query.id}`
            const body = {
                subject: subject,
                title: title,
                description: textContent.trim()
            };
            await axios.put(apiurl, body)
                .then((res) => {
                    const msg = res.data.message;
                    toast.success(msg)
                    setTimeout(() => {
                        let path = `/admin/emailtemplate/tickets`;
                        navigate.push(path);
                    }, 2000);
                }).catch((err) => {
                    const message = err.response ? err.response.data.message : "";
                    setError(message);
                    setIsLoading(false);
                });

        }

        setValidatedCustom(true);
    };


    useEffect(() => {
        setEditorLoaded(true);
    }, []);

    //DefaultValidation
    return (
        <div>
            <Seo title={"Edit-Ticket Template"} />
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Ticket Template Manager
                    </span>

                </div>
                <ToastContainer />
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
                            Ticket Template
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        <Card.Header>
                            <h3 className="card-title"> Edit Ticket Template</h3>
                        </Card.Header>
                        <Card.Body>
                            {err && <Alert variant="danger">{err}</Alert>}

                            <CForm
                                className="row g-3 needs-validation"
                                noValidate
                                validated={validatedCustom}
                                onSubmit={handleSubmit}
                            >
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationCustom03">Template Name</CFormLabel>
                                    <CFormInput type="text" id="validationCustom03"
                                        name="title"
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value)
                                        }}
                                        required />
                                    <CFormFeedback invalid>Please provide a valid Title .</CFormFeedback>
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationCustom03">Subject</CFormLabel>
                                    <CFormInput type="text" id="validationCustom03"
                                        name="subject"
                                        value={subject}
                                        onChange={(e) => {
                                            setSubject(e.target.value)
                                        }}
                                        required />
                                    <CFormFeedback invalid>Please provide a valid Subject.</CFormFeedback>
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault01">Html Content</CFormLabel>


                                    {
                                        isClient ?
                                            <div >
                                                <SummernoteLite
                                                    ref={noteRef}
                                                    defaultCodeValue={description}
                                                    placeholder={"Write something here..."}
                                                    tabsize={2}
                                                    lang="zh-CN" // only if you want to change the default language
                                                    height={100 || "50vh"}
                                                    dialogsInBody={true}
                                                    blockquoteBreakingLevel={0}
                                                    toolbar={[
                                                        ['style', ['style']],
                                                        ['font', ['bold', 'underline', 'clear', 'strikethrough', 'superscript', 'subscript']],
                                                        ['fontsize', ['fontsize']],
                                                        ['fontname', ['fontname']],
                                                        ['color', ['color']],
                                                        ['para', ['ul', 'ol', 'paragraph']],
                                                        ['table', ['table']],
                                                        // ['insert', ['link', 'picture', 'video', 'hr']],
                                                        ['view', ['fullscreen', 'codeview', 'help']]
                                                    ]}
                                                    fontNames={[
                                                        'Arial',
                                                        'Georgia',
                                                        'Verdana',
                                                        'Didot-Ragular', // Include Didot-Regular font
                                                        'Didot-Italic',
                                                        'Satoshi',
                                                        'Satoshi-Bold',
                                                        'Satoshi-Italic',
                                                        'Satoshi-Light'
                                                        // Add other similar font names if necessary
                                                    ]}
                                                    fontNamesIgnoreCheck={[
                                                        'Arial',
                                                        'Georgia',
                                                        'Verdana',
                                                        'Didot-Ragular', // Include Didot-Regular font
                                                        'Didot-Italic',
                                                        'Satoshi',
                                                        'Satoshi-Bold',
                                                        'Satoshi-Italic',
                                                        'Satoshi-Light'
                                                        // Add other similar font names if necessary
                                                    ]}
                                                    fontSizes={['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '44', '48', '54', '60', '66', '72']}
                                                    onChange={(content) => setData({ ...data, content })}
                                                />
                                            </div> : ""}
                                </CCol>

                                <CCol md={10}>
                                    <Link href="/admin/emailtemplate/tickets">
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
        </div>
    );
}

EditTicketTemplate.propTypes = {};

EditTicketTemplate.defaultProps = {};

EditTicketTemplate.layout = "Contentlayout"

export default EditTicketTemplate;
