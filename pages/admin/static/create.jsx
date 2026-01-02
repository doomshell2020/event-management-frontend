// new page design
import React, { useState, useEffect, useRef } from "react";
import axios from "axios"
import { Breadcrumb, Card, Spinner, Col, Row } from "react-bootstrap";
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
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";

const StaticCreate = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState("");
    const noteRef = useRef(null);
    const content = getHtmlEditorContent(noteRef);
    const [editorData, setEditorData] = useState({ content: "" });
    // Route Change
    let router = useRouter();
    const [validateDefault, setValidateDefault] = useState(false);
    const isEditorEmpty = (html = "") => {
    const text = html
        .replace(/<[^>]*>/g, "") // remove HTML tags
        .replace(/&nbsp;/g, "")
        .trim();

    return text.length === 0;
};

    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        // ✅ Frontend validation
         if (!title?.trim() || isEditorEmpty(content)) {
            setValidateDefault(true);
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please fill all required fields correctly.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                title: title.trim(),
                descr: content.trim(),
            };

            const res = await api.post("/api/v1/admin/static", payload);

            if (res?.data?.success) {
                const result = await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: res.data.message || "Static page added successfully!",
                    confirmButtonText: "OK",
                });

                if (result.isConfirmed) {
                    router.push("/admin/static");
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
            setIsLoading(false);
            setValidateDefault(true);
        }
    };



    return (
        <div>
            <Seo title={"Static Manager Create"} />
            {/* <!--Row--> */}
            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        {/* HEADER */}
                        <Card.Header>
                            <h3 className="card-title mb-0">Add Static </h3>
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
                                        Title <span style={{ color: "red" }}>*</span>
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

                                <CCol md={12}>
                                    <b>Description</b><span style={{ color: "Red" }}>*</span><br />

                                    <div >
                                        <HtmlEditor
                                            editorRef={noteRef}
                                            initialContent={editorData.content}
                                            onChange={(content) =>
                                                setEditorData({ ...editorData, content })
                                            }
                                        />
                                    </div>
                                </CCol>

                                {/* ACTION BUTTONS */}
                                <CCol
                                    md={12}
                                    className="mt-4 d-flex gap-2"
                                >
                                    <Link href="/admin/static">
                                        <CButton color="secondary">
                                            Back
                                        </CButton>
                                    </Link>

                                    <CButton
                                        color="success"
                                        type="submit"
                                        disabled={isLoading}
                                        style={{ minWidth: "120px" }}
                                    >
                                        {isLoading ? (
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            "Submit"
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

StaticCreate.propTypes = {};

StaticCreate.defaultProps = {};

StaticCreate.layout = "Contentlayout"

export default StaticCreate;
