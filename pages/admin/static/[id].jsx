// new page design
import React, { useState, useEffect, useRef } from "react";
import { Card, Spinner, Col, Modal, Button } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from 'next/router';
import api from "@/utils/api";
import {
    CForm,
    CCol,
    CFormLabel,
    CFormInput,
    CButton,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";

const StaticEdit = () => {
    const router = useRouter();
    const noteRef = useRef(null);
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [editorData, setEditorData] = useState({ content: "" });

    const fetchStaticDetails = async (id) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const { data } = await api.get(
                `/api/v1/admin/static/${id}/details`
            );
            const staticData = data?.data;
            if (staticData) {
                setTitle(staticData.title || "");
                setUrl(staticData.url || "");
                setEditorData({ content: staticData.descr })
            }
        } catch (error) {
            console.error("Failed to fetch staticData details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaticDetails(id);
    }, [id]);
    const isEditorEmpty = (html = "") => {
        const text = html
            .replace(/<[^>]*>/g, "") // remove HTML tags
            .replace(/&nbsp;/g, "")
            .trim();

        return text.length === 0;
    };
    const [validateDefault, setValidateDefault] = useState(false);
    const handleUrlChange = (e) => {
        let inputValue = e.target.value;
        if (!inputValue.startsWith('/')) {
            inputValue = `/${inputValue}`;
        }
        setUrl(inputValue);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        // ✅ Frontend validation
        const content = getHtmlEditorContent(noteRef).trim();
        if (!title?.trim() || isEditorEmpty(content)) {
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
                descr: content, // ✅ FIXED
                url: url,
            };
            const res = await api.put(`/api/v1/admin/static/${id}`, payload);
            if (res?.data?.success) {
                const result = await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: res.data.message || "Static page updated successfully!",
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
            setBtnLoading(false);
            setValidateDefault(true);
        }
    };
    // update status
    const [show, setShow] = useState(false);

    return (
        <div>
            <Seo title={"Static Page Edit"} />
            {/* <!--Row--> */}
            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        {/* HEADER */}
                        <Card.Header>
                            <h3 className="card-title mb-0">Edit Static Page</h3>
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
                                        URL <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Enter Url"
                                        required
                                        value={url}
                                        onChange={handleUrlChange}
                                    />
                                </CCol>

                                <CCol md={12}>
                                    <div className="d-flex justify-content-between px-2 py-1 align-items-center">
                                        <div>
                                            <b>Description</b><span style={{ color: "Red" }}>*</span>
                                        </div>
                                        <button
                                            variant=""
                                            className="btn  btn-sm me-1 my-1"
                                            style={{ background: "#23b7e5", color: "white" }}
                                            type="button"
                                            onClick={() => setShow(true)}
                                        >
                                            <i className="bi bi-eye"></i> Preview
                                        </button>

                                    </div>
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
                                    <Link href="/admin/static">
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
                <Modal
                show={show}   
                size="lg"
                alignment="center"
                onClose={() => setShow(false)}
                // aria-labelledby="example-modal-sizes-title-lg"
                scrollable
                >
                    <Modal.Header>
                        <Modal.Title>Preview</Modal.Title>
                        <Button
                            onClick={() => setShow(false)}
                            className="btn-close"
                            variant=""
                        >
                            x
                        </Button>
                    </Modal.Header>
                    <Modal.Body>
                        {editorData?.content ? (
                            <div
                                className="preview-content"
                                dangerouslySetInnerHTML={{
                                    __html: editorData.content,
                                }}
                            />
                        ) : (
                            <p>No content to preview</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer></Modal.Footer>
                </Modal>

            </div>
            {/* <!--/Row--> */}
        </div >
    );
}

StaticEdit.propTypes = {};

StaticEdit.defaultProps = {};

StaticEdit.layout = "Contentlayout"

export default StaticEdit;
