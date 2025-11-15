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
import dynamic from 'next/dynamic';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

import 'filepond/dist/filepond.min.css'
import SummernoteLite from "react-summernote-lite";
import 'react-summernote-lite/dist/summernote-lite.min.css';



const CmsAdd = () => {
    const [isClient, setIsClient] = useState(false)
    const noteRef = useRef();
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [err, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const updateTextDescription = (newEditorState) => {
        setEditorState(newEditorState);
    };

    useEffect(() => {
        setIsClient(true)
    }, [])


    let navigate = useRouter();
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

    // add pages
    const CmsAdd = async (event) => {
        const form = event.currentTarget;
        setIsLoading(true);
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setIsLoading(false);
        } else {
            const apiurl = `/api/v1/cms?key=add`;
            const des = convertToRaw(editorState.getCurrentContent());
            const blocks = des.blocks;
            // const textContent = blocks.map(block => block.text).join('\n');
            const textContent = noteRef.current.summernote('code');
            if (!textContent.trim()) {
                setError('Please enter some content in the description field.');
                setIsLoading(false);

            } else {
                const body = new FormData();
                body.append("Name", name);
                body.append("VanityURL", url);
                body.append("Content", textContent.trim());
                await axios.post(apiurl, body)
                    .then((res) => {
                        const msg = res.data.message;
                        localStorage.setItem("staticAdded", msg);
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

    const handleImageUpload = (files) => {
        const fileList = Array.from(files);
        fileList.forEach(async (file) => {
            await uploadImageToServer(file)
        });
    };
    
    const uploadImageToServer = async (file) => {
        try {
            setIsLoading(true);
            const body = new FormData();
            const apiurl = `/api/v1/cms/`;
            body.append('image', file);
            const response = await axios.post(apiurl, body);
            const imageUrl = `/uploads/profiles/${response.data}`
            noteRef.current.summernote('insertImage', imageUrl);
        } catch (err) {
            const message = err.response ? err.response.data.message : '';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // fetch active events
    // const fetchActiveEvents = async () =>
    const [event, setEvent] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
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
                                onSubmit={CmsAdd}
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

                                {/* <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault04">Event</CFormLabel>
                                    <Form.Select
                                        aria-label="Default select example"
                                        className="admn-slct"
                                        value={selectedEvent}
                                        onChange={(e) => setSelectedEvent(e.target.value)}
                                    >
                                        <option value="">--Select-Event--</option>
                                        {event &&
                                            event.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.Name}
                                                </option>
                                            ))}
                                    </Form.Select>

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault05">Page Title</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault05"
                                    // value={url}
                                    // onChange={handleUrlChange}
                                    />
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault05">Display Order</CFormLabel>
                                    <Form.Select
                                        aria-label="Default select example"
                                        className="admn-slct"
                                        value={selectedEvent}
                                        onChange={(e) => setSelectedEvent(e.target.value)}
                                    >
                                        <option value="">--Select-Event--</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                        <option value="10">10</option>
                                    </Form.Select>
                                </CCol> */}

                                <CCol md={12}>
                                    <b>HTML Contents</b><span style={{ color: "Red" }}>*</span><br />
                                    {
                                        isClient ?
                                            <div >
                                                <SummernoteLite
                                                    ref={noteRef}
                                                    placeholder={"Write something here..."}
                                                    tabsize={2}
                                                    lang="zh-CN" // only if you want to change the default language
                                                    height={900 || "50vh"}
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
                                                    callbacks={{
                                                        onImageUpload: handleImageUpload
                                                    }}
                                                />
                                            </div> : ""}
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
