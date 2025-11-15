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
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";

const EditEmailTemplate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  let navigate = useRouter();
  const noteRef = useRef(null);
  const [sectionContent1, setSectionContent1] = useState({ content: "" });
  // console.log("----------",sectionContent1);
  const [isClient, setIsClient] = useState(false)
  const { query } = navigate;
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [mandril_template, setMandril_template] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTemplate, setSelectedTemplated] = useState("");
  useEffect(() => {
    if (query.id != undefined) {
      var apiUrl = `/api/v1/emailtemplets/?key=emailTemplatebyid&id=${query.id}`
      fetch(apiUrl)
        .then((response) => response.json())
        .then((value) => {
          setTitle(value.data.title)
          setSubject(value.data.subject)
          setDescription(value.data.description)
          setSectionContent1({content:value.data.description})
          setMandril_template(value.data.mandril_template)
          setSelectedEvent(value.data.eventId)
          setSelectedTemplated(value.data.templateId)
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
      const content = getHtmlEditorContent(noteRef).trim();
      const apiurl = `/api/v1/emailtemplets?id=${query.id}`
      const body = {
        subject: subject,
        title: title,
        // description: textContent.trim(),
        description: content,
        mandril_template: mandril_template,
        eventId: selectedEvent,
        templateId: selectedTemplate
      };
      await axios.put(apiurl, body)
        .then((res) => {
          const msg = res.data.message;
          localStorage.setItem("staticAdded", msg);
          // setTimeout(() => {
          let path = `/admin/emailtemplate/`;
          navigate.push(path);
          // }, 2000);
        }).catch((err) => {
          const message = err.response ? err.response.data.message : "";
          setError(message);
          setIsLoading(false);
        });

    }

    setValidatedCustom(true);
  };


  const [event, setEvent] = useState([])
  const [templates, setTemplates] = useState([])
  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/v1/emailtemplets/?key=findEvents");
      if (response.data && response.data.success) {
        setEvent(response.data.data); // Adjust the key based on API response structure
        // console.log("fetchEvents-----", response.data.data)
      } else {
        console.error("Failed to fetch currencies:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  // Fetch Templates
  const fetchTemplates = async () => {
    try {
      const response = await axios.get("/api/v1/emailtemplets/?key=templateVersions");
      if (response.data.data && response.data.success) {
        setTemplates(response.data.data); // Adjust the key based on API response structure
      } else {
        console.error("Failed to fetch currencies:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchTemplates();
    setEditorLoaded(true);
  }, []);

  //DefaultValidation
  return (
    <div>
      <Seo title={"Edit-Email Template"} />
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Email Template Manager
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
              Email Template
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="row">
        <Col lg={12} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title"> Edit Email Template</h3>
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

                <CCol md={4}>
                  <CFormLabel htmlFor="validationCustom03">Mail From </CFormLabel>
                  <CFormInput type="text" id="validationCustom03"
                    name="mandril_template"
                    value={mandril_template}
                    onChange={(e) => {
                      setMandril_template(e.target.value)
                    }}

                    required />
                  <CFormFeedback invalid>Please provide a valid Mail chimp Template Name.</CFormFeedback>
                </CCol>

                <CCol md={4}>
                  <CFormLabel htmlFor="validationCustom03">Event </CFormLabel>
                  <select
                    name="id"
                    className="form-control"
                    required
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                  >
                    <option value="">-Select Event Name-</option>
                    {event &&
                      event.map((item) => (
                        <option key={item.id} value={item.id}>{item.Name}</option>
                      ))}
                  </select>
                  <CFormFeedback invalid>Please provide a valid Event Name.</CFormFeedback>
                </CCol>

                <CCol md={4}>
                  <CFormLabel htmlFor="validationCustom03">Choose a template</CFormLabel>
                  <select
                    name="id"
                    className="form-control"
                    required
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplated(e.target.value)}
                  >
                    <option value="">-Choose a template-</option>
                    {templates &&
                      templates.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                  </select>
                  <CFormFeedback invalid>Please Choose a template.</CFormFeedback>
                </CCol>





                <CCol md={12}>
                  <CFormLabel htmlFor="validationDefault01">Html Content</CFormLabel>

                  {sectionContent1 ? (
                    <div className="bg-white">
                      <HtmlEditor
                        editorRef={noteRef}
                        initialContent={sectionContent1.content}
                        onChange={(content) => setSectionContent1({ ...sectionContent1, content })}
                      />
                    </div>
                  ) : (
                    <div className="bg-white">
                      <HtmlEditor
                        editorRef={noteRef}
                        initialContent={''}
                        onChange={(content) => setSectionContent1({ ...sectionContent1, content })}
                      />
                    </div>
                  )}








                  {/* {
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
                      </div> : ""} */}
                </CCol>

                <CCol md={10}>
                  <Link href="/admin/emailtemplate/">
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

EditEmailTemplate.propTypes = {};

EditEmailTemplate.defaultProps = {};

EditEmailTemplate.layout = "Contentlayout"

export default EditEmailTemplate;
