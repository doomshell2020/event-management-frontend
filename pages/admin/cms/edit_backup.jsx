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
// import { Wrappers } from "../../../shared/data/form/Wrapper"
// import { Editor } from "react-draft-wysiwyg";
// import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
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
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import SummernoteLite from "react-summernote-lite"; // you need to iport the css style yourself
import "react-summernote-lite/dist/summernote-lite.min.css";
import PulseLoader from "react-spinners/PulseLoader";

import {
  EditorState,
  convertFromRaw,
  ContentState,
  convertToRaw,
} from "draft-js";
const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  {
    ssr: false,
  }
);

const CmsEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  const inputRef0 = useRef(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [pageName, setPageName] = useState("");
  const [htmlContent1, setHtmlContent1] = useState("");
  const [htmlContent2, setHtmlContent2] = useState("");
  const [htmlContent3, setHtmlContent3] = useState("");
  const [htmlContent4, setHtmlContent4] = useState("");
  const [htmlContent5, setHtmlContent5] = useState("");
  const [contentId1, setContentId1] = useState("");
  const [error, setError] = useState("");
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
      if (response.status === 200) {
        const { data, Name } = response.data;
        console.log('>>>>>>>', data[0].id);

        setHtmlContent1(data[0].Content);
        setContentId1(data[0].id);
        setPageName(Name);
        setHtmlContent2(data[1].Content);
        setHtmlContent3(data[2].Content);
        setHtmlContent4(data[3].Content);
        setHtmlContent5(data[4].Content);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [editorState, setEditorState] = useState(
    EditorState.createEmpty() // Initialize editor state as empty
  );

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



  const CmsEdit = async (event) => {
    const CmsEditUrl = `/api/v1/cms`;
    event.preventDefault();
    const form = event.currentTarget;
    setIsLoading(true);
    // Perform form validation
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidatedCustom(false);
      setIsLoading(false);
    } else {
      // Extract necessary data
      const idsArray = [contentId1];
      const editorContent = convertToRaw(editorState.getCurrentContent());
      const textContent1 = inputRef0.current
        ? inputRef0.current.summernote("code").trim()
        : "";
      const contentsArray = [textContent1];
      try {
        let response;
        for (let i = 0; i < idsArray.length; i++) {
          const formData = new FormData();
          formData.append("id", idsArray[i]);
          formData.append("Name", name);
          formData.append("VanityURL", url);
          formData.append("Content", contentsArray[i]);
          response = await axios.put(CmsEditUrl, formData);
        }

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: response.data.message,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed!",
            text: response.data.message,
          });
        }
        // console.log(response.data);
        await fetchAllSections(url);
        setIsLoading(false);
      } catch (err) {
        const msg = err.response?.data?.message || "An error occurred.";
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: msg,
        });
        setIsLoading(false);
        console.error("message", err);
      }

      // Set the form validation state to true
      setValidatedCustom(true);
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
                onSubmit={CmsEdit}
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
                  {/* <b>Section-I </b><span style={{ color: "Red" }}>*</span><br /> */}
                  <div className="d-flex justify-content-between px-2 py-1 align-items-center">
                    <div>
                      <b>Section-I</b>
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

                    {/* <Link href={"#"} onClick={() => { fetchData(contentId2) }} style={{ color: "blue" }} >Preview</Link> */}
                  </div>

                  {htmlContent1 ? (
                    <div className="bg-white">
                      <SummernoteLite
                        ref={inputRef0}
                        defaultCodeValue={htmlContent1}
                        placeholder={"Write something here..."}
                        tabsize={2}
                        lang="zh-CN" // only if you want to change the default language
                        height={900 || "50vh"}
                        dialogsInBody={true}
                        blockquoteBreakingLevel={0}
                        toolbar={[
                          ["style", ["style"]],
                          [
                            "font",
                            [
                              "bold",
                              "underline",
                              "clear",
                              "strikethrough",
                              "superscript",
                              "subscript",
                            ],
                          ],
                          ["fontsize", ["fontsize"]],
                          ["fontname", ["fontname"]],
                          ["color", ["color"]],
                          ["para", ["ul", "ol", "paragraph"]],
                          ["table", ["table"]],
                          ["insert", ["link", "picture", "video", "hr"]],
                          ["view", ["fullscreen", "codeview", "help"]],
                        ]}
                        fontNames={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontNamesIgnoreCheck={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontSizes={[
                          "8",
                          "9",
                          "10",
                          "11",
                          "12",
                          "14",
                          "16",
                          "18",
                          "20",
                          "22",
                          "24",
                          "28",
                          "32",
                          "36",
                          "40",
                          "44",
                          "48",
                          "54",
                          "60",
                          "66",
                          "72",
                          "78",
                          "80",
                          "82",
                          "84",
                          "86",
                          "92",
                          "98",
                          "100",
                          "102",
                          "106",
                          "108",
                          "110",
                          "116",
                          "120",
                        ]}
                        callbacks={{
                          onImageUpload: handleImageUpload,
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  <br />

                  {htmlContent2 ? (
                    <div className="bg-white">
                      <SummernoteLite
                        // ref={inputRef0}
                        defaultCodeValue={htmlContent2}
                        placeholder={"Write something here..."}
                        tabsize={2}
                        lang="zh-CN" // only if you want to change the default language
                        height={900 || "50vh"}
                        dialogsInBody={true}
                        blockquoteBreakingLevel={0}
                        toolbar={[
                          ["style", ["style"]],
                          [
                            "font",
                            [
                              "bold",
                              "underline",
                              "clear",
                              "strikethrough",
                              "superscript",
                              "subscript",
                            ],
                          ],
                          ["fontsize", ["fontsize"]],
                          ["fontname", ["fontname"]],
                          ["color", ["color"]],
                          ["para", ["ul", "ol", "paragraph"]],
                          ["table", ["table"]],
                          ["insert", ["link", "picture", "video", "hr"]],
                          ["view", ["fullscreen", "codeview", "help"]],
                        ]}
                        fontNames={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontNamesIgnoreCheck={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontSizes={[
                          "8",
                          "9",
                          "10",
                          "11",
                          "12",
                          "14",
                          "16",
                          "18",
                          "20",
                          "22",
                          "24",
                          "28",
                          "32",
                          "36",
                          "40",
                          "44",
                          "48",
                          "54",
                          "60",
                          "66",
                          "72",
                          "78",
                          "80",
                          "82",
                          "84",
                          "86",
                          "92",
                          "98",
                          "100",
                          "102",
                          "106",
                          "108",
                          "110",
                          "116",
                          "120",
                        ]}
                        callbacks={{
                          onImageUpload: handleImageUpload,
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  <br />

                  {htmlContent3 ? (
                    <div className="bg-white">
                      <SummernoteLite
                        // ref={inputRef0}
                        defaultCodeValue={htmlContent3}
                        placeholder={"Write something here..."}
                        tabsize={2}
                        lang="zh-CN" // only if you want to change the default language
                        height={900 || "50vh"}
                        dialogsInBody={true}
                        blockquoteBreakingLevel={0}
                        toolbar={[
                          ["style", ["style"]],
                          [
                            "font",
                            [
                              "bold",
                              "underline",
                              "clear",
                              "strikethrough",
                              "superscript",
                              "subscript",
                            ],
                          ],
                          ["fontsize", ["fontsize"]],
                          ["fontname", ["fontname"]],
                          ["color", ["color"]],
                          ["para", ["ul", "ol", "paragraph"]],
                          ["table", ["table"]],
                          ["insert", ["link", "picture", "video", "hr"]],
                          ["view", ["fullscreen", "codeview", "help"]],
                        ]}
                        fontNames={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontNamesIgnoreCheck={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontSizes={[
                          "8",
                          "9",
                          "10",
                          "11",
                          "12",
                          "14",
                          "16",
                          "18",
                          "20",
                          "22",
                          "24",
                          "28",
                          "32",
                          "36",
                          "40",
                          "44",
                          "48",
                          "54",
                          "60",
                          "66",
                          "72",
                          "78",
                          "80",
                          "82",
                          "84",
                          "86",
                          "92",
                          "98",
                          "100",
                          "102",
                          "106",
                          "108",
                          "110",
                          "116",
                          "120",
                        ]}
                        callbacks={{
                          onImageUpload: handleImageUpload,
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  <br />

                  {htmlContent4 ? (
                    <div className="bg-white">
                      <SummernoteLite
                        // ref={inputRef0}
                        defaultCodeValue={htmlContent4}
                        placeholder={"Write something here..."}
                        tabsize={2}
                        lang="zh-CN" // only if you want to change the default language
                        height={900 || "50vh"}
                        dialogsInBody={true}
                        blockquoteBreakingLevel={0}
                        toolbar={[
                          ["style", ["style"]],
                          [
                            "font",
                            [
                              "bold",
                              "underline",
                              "clear",
                              "strikethrough",
                              "superscript",
                              "subscript",
                            ],
                          ],
                          ["fontsize", ["fontsize"]],
                          ["fontname", ["fontname"]],
                          ["color", ["color"]],
                          ["para", ["ul", "ol", "paragraph"]],
                          ["table", ["table"]],
                          ["insert", ["link", "picture", "video", "hr"]],
                          ["view", ["fullscreen", "codeview", "help"]],
                        ]}
                        fontNames={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontNamesIgnoreCheck={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontSizes={[
                          "8",
                          "9",
                          "10",
                          "11",
                          "12",
                          "14",
                          "16",
                          "18",
                          "20",
                          "22",
                          "24",
                          "28",
                          "32",
                          "36",
                          "40",
                          "44",
                          "48",
                          "54",
                          "60",
                          "66",
                          "72",
                          "78",
                          "80",
                          "82",
                          "84",
                          "86",
                          "92",
                          "98",
                          "100",
                          "102",
                          "106",
                          "108",
                          "110",
                          "116",
                          "120",
                        ]}
                        callbacks={{
                          onImageUpload: handleImageUpload,
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  <br />

                  {htmlContent5 ? (
                    <div className="bg-white">
                      <SummernoteLite
                        // ref={inputRef0}
                        defaultCodeValue={htmlContent5}
                        placeholder={"Write something here..."}
                        tabsize={2}
                        lang="zh-CN" // only if you want to change the default language
                        height={900 || "50vh"}
                        dialogsInBody={true}
                        blockquoteBreakingLevel={0}
                        toolbar={[
                          ["style", ["style"]],
                          [
                            "font",
                            [
                              "bold",
                              "underline",
                              "clear",
                              "strikethrough",
                              "superscript",
                              "subscript",
                            ],
                          ],
                          ["fontsize", ["fontsize"]],
                          ["fontname", ["fontname"]],
                          ["color", ["color"]],
                          ["para", ["ul", "ol", "paragraph"]],
                          ["table", ["table"]],
                          ["insert", ["link", "picture", "video", "hr"]],
                          ["view", ["fullscreen", "codeview", "help"]],
                        ]}
                        fontNames={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontNamesIgnoreCheck={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontSizes={[
                          "8",
                          "9",
                          "10",
                          "11",
                          "12",
                          "14",
                          "16",
                          "18",
                          "20",
                          "22",
                          "24",
                          "28",
                          "32",
                          "36",
                          "40",
                          "44",
                          "48",
                          "54",
                          "60",
                          "66",
                          "72",
                          "78",
                          "80",
                          "82",
                          "84",
                          "86",
                          "92",
                          "98",
                          "100",
                          "102",
                          "106",
                          "108",
                          "110",
                          "116",
                          "120",
                        ]}
                        callbacks={{
                          onImageUpload: handleImageUpload,
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </CCol>

                <CCol md={10}>
                  <Link href="/admin/cms">
                    <CButton color="primary">Back</CButton>
                  </Link>
                </CCol>
                {/* <CCol md={2}>
                                    <CButton color="primary" type="submit">
                                        Submit
                                    </CButton>
                                </CCol> */}
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
