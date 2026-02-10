// new page design
import React, { useState, useEffect, useRef } from "react";
import { Card, Spinner, Col } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from 'next/router';
import api from "@/utils/api";
import {
    CForm,
    CCol,
    CFormLabel,
    CFormInput,
    CButton,
    CFormSelect,
    CFormFeedback
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/EmailHtmlEditor";

const StaticEdit = () => {
    const router = useRouter();
    const noteRef = useRef(null);
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    // const content = getHtmlEditorContent(noteRef);
    const [editorData, setEditorData] = useState({ content: "" });
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");

    const fetchTemplateDetails = async (id) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const { data } = await api.get(
                `/api/v1/admin/email-templates/${id}/details`
            );
            const templateData = data?.data;
            if (templateData) {
                setTitle(templateData.title || "");
                setSubject(templateData.subject || "");
                setEditorData({ content: templateData.description })
                setSelectedEvent(templateData.eventId || 0)
            }
        } catch (error) {
            console.error("Failed to fetch templateData details:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const getEvents = async () => {
        try {
            const { data } = await api.get("/api/v1/admin/email-templates/events");
            setEvents(data?.data.events || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        }
    };

    useEffect(() => {
        fetchTemplateDetails(id);
        getEvents();
    }, [id]);

    const isEditorEmpty = (html = "") => {
        const text = html
            .replace(/<[^>]*>/g, "") // remove HTML tags
            .replace(/&nbsp;/g, "")
            .trim();

        return text.length == 0;
    };

    const [validateDefault, setValidateDefault] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        // ✅ Frontend validation
        const content = getHtmlEditorContent(noteRef).trim();
        // console.log(title,subject,selectedEvent,content)
        if (!title.trim() || !subject.trim() || selectedEvent === null || selectedEvent === undefined || isEditorEmpty(content)) {
            setValidateDefault(true);
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please fill all required fields correctly.",
            });
            return;
        }
        setBtnLoading(true);
        try {
            const payload = {
                title: title.trim(),
                subject: subject.trim(),
                description: content,
                eventId: selectedEvent
            };
            const res = await api.put(`/api/v1/admin/email-templates/${id}`, payload);
            if (res?.data?.success) {
                const result = await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: res.data.message || "Email Template updated successfully!",
                    confirmButtonText: "OK",
                });

                if (result.isConfirmed) {
                    router.push("/admin/email-templates");
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: res.data?.message || "Something went wrong. Please try again.",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text:
                    err?.response?.data?.message ||
                    "Internal server error. Please try again.",
            });
        } finally {
            setBtnLoading(false);
            setValidateDefault(true);
        }
    };


    return (
        <div>
            <Seo title={"Email Template Edit"} />
            {/* <!--Row--> */}
            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        {/* HEADER */}
                        <Card.Header>
                            <h3 className="card-title mb-0">Edit Email Template</h3>
                        </Card.Header>
                        {/* BODY */}
                        <Card.Body>
                            <CForm
                                className="row g-3 needs-validation housing-addflow"
                                noValidate
                                validated={validateDefault}
                                onSubmit={handleSubmit}
                            >
                                {/* Organizer Name */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Title<span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Enter Title"
                                        required
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel>
                                        Subject <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Enter Subject"
                                        required
                                        value={subject}
                                        onChange={(e) => {
                                            setSubject(e.target.value);
                                        }}
                                    />
                                </CCol>

                                <CCol md={4}>
                                    <CFormLabel>
                                        Events <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>

                                    <CFormSelect
                                        required
                                        value={selectedEvent}
                                        onChange={(e) => setSelectedEvent(e.target.value)}
                                    >
                                        <option value="">--Select Event--</option>
                                        {events &&
                                            events.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={12}>
                                    <b>Format Description</b><span style={{ color: "Red" }}>*</span><br />
                                    <div >
                                        <HtmlEditor
                                            editorRef={noteRef}
                                            initialContent={editorData.content}
                                            onChange={(content) => setEditorData({ ...editorData, content })}
                                        />
                                    </div>
                                </CCol>
                                {/* ACTION BUTTONS */}
                                <CCol
                                    md={12}
                                    className="mt-4 d-flex gap-2"
                                >
                                    <Link href="/admin/email-templates">
                                        <CButton color="secondary">
                                            Back
                                        </CButton>
                                    </Link>

                                    <CButton
                                        color="success"
                                        type="submit"
                                        disabled={btnLoading}
                                        style={{ minWidth: "120px" }}
                                    >
                                        {btnLoading ? (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            "Update"
                                        )}
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

StaticEdit.propTypes = {};

StaticEdit.defaultProps = {};

StaticEdit.layout = "Contentlayout"

export default StaticEdit;
