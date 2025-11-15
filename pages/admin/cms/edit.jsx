import React, { useState, useEffect, useRef } from "react";
import {
    Breadcrumb,
    Card,
    Col,
    Form,
    InputGroup,
    Row,
    Modal,
    Button,
    Spinner,
} from "react-bootstrap";
import { useRouter } from "next/router";
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
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import PulseLoader from "react-spinners/PulseLoader";
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";

const CmsEdit = () => {
    const router = useRouter();
    const { id } = router.query;
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [pageName, setPageName] = useState("");
    const [error, setError] = useState("");
    const [sectionContent1, setSectionContent1] = useState({ content: "" });
    const [contentId1, setContentId1] = useState("");
    const inputRef0 = useRef(null);

    const handleIframeLoad = () => {
        setIsLoading(false); // Set loading state to false when iframe is loaded
    };

    let navigate = useRouter();
    const routeChange = () => {
        let path = `/admin/cms/`;
        navigate.push(path);
    };

    const handleUrlChange = (e) => {
        let inputValue = e.target.value;
        if (!inputValue.startsWith("/")) {
            inputValue = `/${inputValue}`;
        }
        setUrl(inputValue);
    };

    const LoadingComponent = () => {
        return (
            <div
                className="loader inner-loader"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <PulseLoader color="#36d7b7" />
            </div>
        );
    };

    const fetchAllSections = async (pathname) => {
        try {
            const encodedPathname = encodeURIComponent(pathname);
            const apiUrl = `/api/v1/cms?slug=${encodedPathname}&key=1`;
            const response = await axios.get(apiUrl);

            if (response.status == 200) {
                const { data, Name } = response.data;
                // Try to find the parent item
                const parentItem = data.find(item => item.is_parent === "Y");
                const itemToSet = parentItem || data[0]; // fallback to data[0] if no parent item
                if (itemToSet) {
                    setSectionContent1({ content: itemToSet.Content });
                    setContentId1(itemToSet.id);
                    setPageName(Name);
                } else {
                    console.warn("No valid item found in CMS data.");
                }
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };



    useEffect(() => {
        if (id != undefined) {
            fetch(`/api/v1/cms?ID=${id}`)
                .then((response) => response.json())
                .then((value) => {
                    //   console.log(">>>>>>>>>>", value);
                    if (value.status) {
                        setName(value.data.Name);
                        setUrl(value.data.VanityURL);
                        fetchAllSections(value.data.VanityURL);
                        setIsClient(true);
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Failed!",
                            text: value.message,
                            confirmButtonText: "OK",
                            showLoaderOnConfirm: true,
                            preConfirm: () => {
                                return new Promise((resolve) => {
                                    setTimeout(() => {
                                        resolve();
                                        router.push("/admin/cms");
                                    }, 1000);
                                });
                            },
                        });
                    }
                });
        }
    }, [id]);

    // submit form 
    const updateCmsPage = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setIsLoading(true);
        if (!form.checkValidity()) {
            event.stopPropagation(); // Stop propagation if validation fails
            setValidatedCustom(false); // Set validation state to false
            setIsLoading(false); // Stop loading animation
            return; // Exit the function if validation fails
        }
        // Get content from the HTML editor and trim whitespace
        const content = getHtmlEditorContent(inputRef0).trim();
        try {
            const CmsEditUrl = `/api/v1/cms`; // Define URL here or as a constant outside
            const formData = new FormData();
            formData.append("id", contentId1);
            formData.append("Name", name);
            formData.append("VanityURL", url);
            formData.append("Content", content);
            const response = await axios.put(CmsEditUrl, formData);

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    customClass: {
                        popup: "add-tckt-dtlpop",
                    },
                    text: response.data.message,
                });
                await fetchAllSections(url);
            } else {
                // Handle API response indicating failure
                Swal.fire({
                    icon: "error",
                    title: "Failed!",
                    customClass: {
                        popup: "add-tckt-dtlpop",
                    },
                    text: response.data.message,
                });
            }
        } catch (err) {
            console.error("Error during CMS edit:", err); // More descriptive error logging
            const msg = err.response?.data?.message || "An unexpected error occurred. Please try again.";
            Swal.fire({
                icon: "error",
                title: "Failed!",
                customClass: {
                    popup: "add-tckt-dtlpop",
                },
                text: msg,
            });
        } finally {
            setIsLoading(false); // Always stop loading animation
            setValidatedCustom(true); // Set form validation to true after an attempt (success or failure)
        }
    };

    // First Image upload in server
    const handleImageUpload = (files) => {
        const fileList = Array.from(files);
        fileList.forEach(async (file) => {
            await uploadImageToServer(file);
        });
    };

    const uploadImageToServer = async (file) => {
        try {
            setIsLoading(true);
            const body = new FormData();
            const apiurl = `/api/v1/cms/`;
            body.append("image", file);
            const response = await axios.post(apiurl, body);
            const imageUrl = `/uploads/profiles/${response.data}`;
            inputRef0.current.summernote("insertImage", imageUrl);
        } catch (err) {
            const message = err.response ? err.response.data.message : "";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const [fullscreen, setFullscreen] = useState(true);
    const [show, setShow] = useState(false);

    //DefaultValidation
    return (
        <div>
            <Seo title={"Cms Manager Edit"} />

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
                            Edit
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>
            {/* <!-- /breadcrumb --> */}

            {/* <!--Row--> */}
            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        <Card.Header className=" ">
                            {/* <div className="d-flex justify-content-between"> */}
                            <h3 className="card-title">Edit Page</h3>
                        </Card.Header>
                        <Card.Body>
                            <CForm
                                className="row g-3 needs-validation"
                                noValidate
                                validated={validatedCustom}
                                onSubmit={updateCmsPage}
                            >
                                <CCol md={6}>
                                    <CFormLabel htmlFor="validationDefault01">
                                        Name<span style={{ color: "Red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        required
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="validationDefault02">
                                        URL<span style={{ color: "Red" }}>*</span>
                                    </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault02"
                                        required
                                        value={url}
                                        onChange={handleUrlChange}
                                    />
                                </CCol>

                                <CCol md={12}>
                                    <div className="d-flex justify-content-between px-2 py-1 align-items-center">
                                        <div>
                                            <b>Section</b>
                                            <span style={{ color: "Red" }}>*</span>
                                        </div>
                                        <button
                                            variant=""
                                            className="btn  btn-sm me-1 my-1"
                                            style={{ background: "#23b7e5", color: "white" }}
                                            type="button"
                                            onClick={(e) => {
                                                setShow(true);
                                            }}
                                        >
                                            <i className="bi bi-eye"></i> Preview
                                        </button>

                                    </div>

                                    {sectionContent1 ? (
                                        <div className="bg-white">
                                            <HtmlEditor
                                                editorRef={inputRef0}
                                                initialContent={sectionContent1.content}
                                                onChange={(content) => setSectionContent1({ ...sectionContent1, content })}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-white">
                                            <HtmlEditor
                                                editorRef={inputRef0}
                                                initialContent={''}
                                                onChange={(content) => setSectionContent1({ ...sectionContent1, content })}
                                            />
                                        </div>
                                    )}
                                </CCol>

                                <CCol md={10}>
                                    <Link href="/admin/cms">
                                        <CButton color="primary">Back</CButton>
                                    </Link>
                                </CCol>
                                <CCol md={2}>
                                    <CButton
                                        variant="primary"
                                        className="btn btn-primary btn-block"
                                        type="submit"
                                        disabled={isLoading}
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

            <Modal
                size="lg"
                show={show}
                fullscreen={fullscreen}
                onHide={() => setShow(false)}
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header>
                    <Modal.Title>{name}</Modal.Title>
                    <Button
                        onClick={() => setShow(false)}
                        className="btn-close"
                        variant=""
                    >
                        x
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <LoadingComponent /> // Show loader while iframe is loading
                    ) : (
                        <iframe
                            src={url}
                            style={{ width: "100%", height: "400px", border: "none" }}
                            title={name}
                            allowFullScreen
                            onLoad={handleIframeLoad} // Trigger handleIframeLoad when iframe content loads
                        ></iframe>
                    )}
                </Modal.Body>
                <Modal.Footer></Modal.Footer>
            </Modal>

            {/* <!--/Row--> */}
        </div>
    );
};

CmsEdit.propTypes = {};

CmsEdit.defaultProps = {};

CmsEdit.layout = "Contentlayout";

export default CmsEdit;
