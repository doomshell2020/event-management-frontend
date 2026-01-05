// new page design
import React, { useState, useEffect } from "react";
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
    CFormTextarea
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";

const EventOrganizerEdit = () => {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(false);
    const [pageName, setPageName] = useState("");
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [keywords, setKeywords] = useState("");
    const [description, setDescription] = useState("");



    const fetchSeoDetails = async (id) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const { data } = await api.get(
                `/api/v1/admin/seo/${id}/details`
            );
            const seoData = data?.data;
            if (seoData) {
                setTitle(seoData.title || "");
                setPageName(seoData.page || "");
                setLocation(seoData.location || "");
                setDescription(seoData.description || "");
                setKeywords(seoData.keyword || "");
            }
        } catch (error) {
            console.error("Failed to fetch seoData details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSeoDetails(id);
    }, [id]);

    const [validateDefault, setValidateDefault] = useState(false);
   const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        // Frontend validation
        if (!form.checkValidity()) {
            event.stopPropagation();
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
                page: pageName.trim(),
                title: title.trim(),
                location: location.trim(),
                keyword: keywords.trim(),
                description: description.trim(),
            };
            const res = await api.put(
                `/api/v1/admin/seo/${id}`,
                payload
            );
            if (res.data?.success) {
                const result = await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Page details updated successfully!",
                    confirmButtonText: "OK",
                });
                if (result.isConfirmed) {
                    router.push("/admin/seo");
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
                    err?.response?.data?.error?.message||
                    "Internal server error",
            });
        } finally {
            setIsLoading(false);
            setValidateDefault(true);
        }
    };


    return (
        <div>
            <Seo title={"Seo Edit"} />
            {/* <!--Row--> */}
            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        {/* HEADER */}
                        <Card.Header>
                            <h3 className="card-title mb-0">Seo Organizer</h3>
                        </Card.Header>
                        {/* BODY */}
                        <Card.Body>
                            <CForm
                                className="row g-3 needs-validation housing-addflow"
                                noValidate
                                validated={validateDefault}
                                onSubmit={handleSubmit}
                            >
                                {/* Page Name */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Page Name <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Enter page name"
                                        required
                                        value={pageName}
                                        onChange={(e) => setPageName(e.target.value)}
                                    />
                                </CCol>

                                {/* Page Location */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Page Location <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="url"
                                        placeholder="Enter page location URL"
                                        required
                                        value={location}
                                        onChange={(e) => {
                                            setLocation(e.target.value);
                                        }}
                                    />
                                </CCol>

                                {/* Title */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Title <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="Enter title"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </CCol>

                                {/* Keywords */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Keywords <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormTextarea
                                        rows={4}
                                        placeholder="Enter keywords (comma separated)"
                                        required
                                        value={keywords}
                                        onChange={(e) => setKeywords(e.target.value)}
                                    />
                                </CCol>

                                {/* Description */}
                                <CCol md={4}>
                                    <CFormLabel>
                                        Description <span style={{ color: "red" }}>*</span>
                                    </CFormLabel>
                                    <CFormTextarea
                                        rows={4}
                                        placeholder="Enter description"
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </CCol>

                                {/* ACTION BUTTONS */}
                                <CCol md={12} className="mt-4 d-flex gap-2">
                                    <Link href="/admin/seo">
                                        <CButton color="secondary">Back</CButton>
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

EventOrganizerEdit.propTypes = {};

EventOrganizerEdit.defaultProps = {};

EventOrganizerEdit.layout = "Contentlayout"

export default EventOrganizerEdit;
