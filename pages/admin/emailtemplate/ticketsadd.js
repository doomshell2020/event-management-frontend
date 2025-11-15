import React, { useState, useEffect, useRef } from "react";
import { Breadcrumb, Card, Col, Spinner, Alert } from "react-bootstrap";
import { CForm, CCol, CFormLabel, CFormFeedback, CFormInput, CButton } from "@coreui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Seo from "@/shared/layout-components/seo/seo";
import axios from "axios";
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import SummernoteLite from "react-summernote-lite";
import 'react-summernote-lite/dist/summernote-lite.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddTicketTemplate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const noteRef = useRef();
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [isClient, setIsClient] = useState(false)
    const [data, setData] = useState({})
    const { subject,
        title, } = data;
    const changeHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value })
        setError("");
    }
    const [err, setError] = useState("");
    let navigate = useRouter();
    const routeChange = () => {
        let path = `/admin/emailtemplate/tickets`;
        navigate.push(path);
    }

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
            const apiUrl = `/api/v1/emailtemplets`;
            const des = convertToRaw(editorState.getCurrentContent());
            const blocks = des.blocks;
            // const textContent = blocks.map(block => block.text).join('\n');
            const textContent = noteRef.current.summernote('code');
            if (!textContent.trim()) {
                setError('Please enter some content in the description field.');
                setIsLoading(false);

            } else {
                const body = {
                    key: "AddTicketTemplate",
                    subject: data.subject,
                    title: data.title,
                    // description: textContent // Setting description field with text content
                    description: textContent.trim()
                };

                await axios.post(apiUrl, body)
                    .then((res) => {
                        const msg = res.data.message;
                        toast.success(msg)
                        setTimeout(() => {
                            routeChange();
                        }, 2000);
                    }).catch((err) => {
                        const message = err.response ? err.response.data.message : "";
                        setError(message);
                        setIsLoading(false);

                    });
            }

        }
        setValidatedCustom(true);
    };

    useEffect(() => {
        // setEditorLoaded(true);
        setIsClient(true)
    }, []);




    return (
        <div>
            <Seo title={"Add-Ticket Template"} />
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Ticket Template Manager
                    </span>

                </div>
                <div className="justify-content-center mt-2">
                    <ToastContainer />
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
                            <h3 className="card-title"> Add Ticket Template</h3>
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
                                        onChange={changeHandler}
                                        required />
                                    <CFormFeedback invalid>Please provide a valid Title .</CFormFeedback>
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationCustom03">Subject</CFormLabel>
                                    <CFormInput type="text" id="validationCustom03"
                                        name="subject"
                                        value={subject}
                                        onChange={changeHandler}

                                        required />
                                    <CFormFeedback invalid>Please provide a valid Subject.</CFormFeedback>
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationCustom03"> Html Content</CFormLabel>
                                    {
                                        isClient ?
                                            <div >
                                                <SummernoteLite
                                                    ref={noteRef}
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
                                                        ['insert', ['link', 'picture', 'video', 'hr']],
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


                                                    fontSizes={['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '44', '48', '54', '60', '66', '72', '78', '80', '82', '84', '86', '92', '98', '100', '102', '106', '108', '110', '116', '120']}
                                                    // fontSizes={['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '44', '48', '54', '60', '66', '72']}
                                                    onChange={(content) => setData({ ...data, content })}
                                                // callbacks={{
                                                //     onImageUpload: handleImageUpload
                                                // }}
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

AddTicketTemplate.propTypes = {};

AddTicketTemplate.defaultProps = {};

AddTicketTemplate.layout = "Contentlayout"

export default AddTicketTemplate;
