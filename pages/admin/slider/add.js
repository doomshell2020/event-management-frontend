import React, { useState, useEffect, useRef } from "react";
import { Breadcrumb, Card, Col, Row, Spinner, Alert } from "react-bootstrap";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormInput,
  CButton,
  CFormSelect,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";

const SliderAdd = () => {
  const [formData, setFormData] = useState({
    slider_name: "",
    pageId: "",
    pageName: "",
    pageUrl: "",
    slider_images: [], // this holds the images array
  });
  const navigate = useRouter();
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [err, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [SITE_PATH, setSITE_PATH] = useState(
    process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  );
  const [sliderAvailable, setSliderAvailable] = useState([]);
  const fileInputRef = useRef();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = validateImageFiles(files);

    if (!validFiles) {
      Swal.fire({
        title: "Invalid File Type",
        text: "Please upload only image files (jpg, jpeg, png).",
        icon: "error",
        confirmButtonText: "OK",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Reset file input value
      }
      return;
    }
    const uploadedImages = files.map((file, index) => ({
      file,
      order: formData.slider_images.length + index + 1,
    }));
    setFormData((prev) => ({
      ...prev,
      slider_images: [...prev.slider_images, ...uploadedImages],
    }));
  };

  // Helper function to validate image files
  const validateImageFiles = (files) => {
    const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    const allowedExtensions = [".jpeg", ".jpg", ".png"];
    // return true
    return files.every((file) => {
      const isValidType = allowedFileTypes.includes(file.type);
      const isValidExtension = allowedExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      return isValidType && isValidExtension;
    });
  };

  // Handle image drag start (store the index of the dragged image)
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
  };

  // Handle image drop (swap images)
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();

    const draggedIndex = e.dataTransfer.getData("index");
    if (draggedIndex === targetIndex) return; // No need to swap if the same image

    const newImages = [...formData.slider_images];
    const [draggedImage] = newImages.splice(draggedIndex, 1); // Remove the dragged image
    newImages.splice(targetIndex, 0, draggedImage); // Insert the dragged image in the new position

    // Update the order of images based on the new position
    const updatedImages = newImages.map((image, index) => ({
      ...image,
      order: index + 1, // Set the new order
    }));

    setFormData((prev) => ({
      ...prev,
      slider_images: updatedImages,
    }));
  };

  // Handle image drag over (to allow drop)
  const handleDragOver = (e) => {
    e.preventDefault(); // Allow dropping
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDeleteImage = (index) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      setFormData((prevData) => {
        const updatedImages = prevData.slider_images
          .filter((_, i) => i !== index) // Remove the image
          .map((image, i) => ({
            ...image,
            order: i + 1, // Re-index the order
          }));

        return {
          ...prevData,
          slider_images: updatedImages,
        };
      });
    }
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    setIsLoading(true);
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setIsLoading(false);
    } else {
      const apiUrl = `/api/v1/sliders`;
      const body = new FormData();
      // Append other form fields
      body.append("slider_name", formData.slider_name);
      body.append("pageId", formData.pageId);
      body.append("key", "create_slider");
      body.append("page_name", formData.pageName);
      // Append images (without index)
      formData.slider_images.forEach((image) => {
        body.append("slider_images", image.file); // Just append the image
        body.append("slider_images_order", image.order); // Optionally, append order if needed
      });

      try {
        const { data } = await axios.post(apiUrl, body);
        setIsLoading(false);
        // console.log(">>>>>>>", data);
        Swal.fire({
          title: "Success",
          icon: "success",
          text: data.message,
          confirmButtonText: "OK",
        });

        navigate.push(`/admin/slider/edit/${formData.pageId}`);
        // Reset file input using ref
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input value
        }
      } catch (err) {
        console.log(err);
        if (fileInputRef.current) {
          fileInputRef.current.value = null; // Reset file input value
        }
        setFormData((prev) => ({
          ...prev,
          slider_images: [],
        }));
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: err.response.data.message,
          confirmButtonText: "OK",
        });
        setError(err.response.data.message);
        setIsLoading(false);
      }
    }

    setValidatedCustom(true);
  };

  const routeChange = () => {
    let path = `/admin/slider/`;
    navigate.push(path);
  };

  const fetchPages = async () => {
    try {
      const { data: pageList } = await axios.get(
        `/api/v1/sliders?key=get_page_list`
      );
      if (pageList.success) {
        setPages(pageList.data);

        if (formData.pageId) {
          const page = pageList.data.find((page) => page.ID == formData.pageId);
          if (page) {
            setSliderAvailable(page.Sliders);
          } else {
            setSliderAvailable([]);
          }
        }
      } else {
        setError(pageList.message);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  useEffect(() => {
    // Fetch pages for the dropdown
    fetchPages();
  }, []);

  return (
    <div>
      <Seo title={"Slider Manager Add"} />

      {/* <!--Row--> */}
      <div className="row">
        <Col lg={12} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Add Slider</h3>
            </Card.Header>
            <Card.Body>
              {err && <Alert variant="danger">{err}</Alert>}
              <CForm
                className="row g-3 needs-validation"
                noValidate
                validated={validatedCustom}
                onSubmit={handleSubmit}
              >
                <CCol md={6}>
                  <CFormLabel htmlFor="pageId">
                   Select Page<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <select
                    id="pageId"
                    name="pageId"
                    required
                    className="form-control"
                    value={formData.pageId}
                    onChange={(e) => {
                      const selectedPageId = e.target.value;
                      const selectedPage = pages.find(
                        (page) => page.ID === parseInt(selectedPageId)
                      );

                      if (selectedPage) {
                        const availableSliders = selectedPage.Sliders || [];
                        if (availableSliders.length > 0) {
                          setSliderAvailable(availableSliders);
                        } else {
                          setSliderAvailable([]);
                        }

                        setFormData((prev) => ({
                          ...prev,
                          pageId: selectedPageId,
                          pageName: selectedPage.Name,
                          pageUrl: `${SITE_PATH}${selectedPage.VanityURL}`,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          pageId: "",
                          pageName: "",
                          pageUrl: "",
                        }));
                        setSliderAvailable([]);
                      }
                    }}
                  >
                    <option value="">Select Page ID</option>
                    {pages.map((page) => (
                      <option key={page.ID} value={page.ID}>
                        {page.Name}
                      </option>
                    ))}
                  </select>
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="name">
                    Slider Name<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="name"
                    name="slider_name"
                    placeholder="Slider Name"
                    required
                    value={formData.slider_name}
                    onChange={handleInputChange}
                  />
                </CCol>

                {formData.pageName && (
                  <>
                    <CCol md={6}>
                      <CFormLabel htmlFor="pageName">
                        Page Name<span style={{ color: "Red" }}>*</span>
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        id="pageName"
                        name="pageName"
                        placeholder="Page Name"
                        required
                        readOnly
                        value={formData.pageName}
                      />
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel htmlFor="pageUrl">
                        Page URL<span style={{ color: "Red" }}>*</span>
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        id="pageUrl"
                        name="pageUrl"
                        placeholder="Page URL"
                        required
                        readOnly
                        value={formData.pageUrl}
                      />
                    </CCol>
                  </>
                )}

                <CCol md={12}>
                  <CFormLabel htmlFor="images">
                    Upload Slider Images<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <p
                    style={{
                      display: "block",
                      color: "gray",
                      marginBottom: "8px",
                      color:"red",
                      fontSize:"12"
                    }}
                  >
                    Note: Only image files with the extensions
                    <strong> jpg</strong>, <strong> jpeg</strong>, or
                    <strong> png</strong> are allowed.
                  </p>
                  <CFormInput
                    style={{ lineHeight: "28px" }}
                    type="file"
                    id="images"
                    accept="image/jpeg,image/png,image/jpg"
                    name="slider_images"
                    required
                    ref={fileInputRef}
                    multiple
                    onChange={handleImageUpload}
                  />
                </CCol>

                {/* Display images with drag and drop */}
                {formData.slider_images.length > 0 && (
                  <CCol md={12}>
                    <h5>Slider Images (Drag to reorder)</h5>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      {formData.slider_images.map((image, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)} // Handle drag start
                          onDrop={(e) => handleDrop(e, index)} // Handle drop
                          onDragOver={handleDragOver} // Handle drag over to allow drop
                          style={{
                            width: "120px",
                            height: "120px",
                            position: "relative",
                            marginBottom: "10px",
                            cursor: "move", // Indicate draggable image
                            borderRadius: "8px",
                          }}
                        >
                          <img
                            src={URL.createObjectURL(image.file)} // Preview uploaded images
                            alt={`Slider Image ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                          {/* Display the sort order */}
                          <div
                            style={{
                              position: "absolute",
                              top: "0px",
                              // right: "5px",
                              backgroundColor: "rgba(0,0,0,0.5)",
                              color: "white",
                              padding: "2px 5px",
                              borderRadius: "5px",
                              fontSize: "25px",
                              fontWeight: "600",
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {image.order}
                          </div>
                          {/* Delete icon */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "5px",
                              right: "5px",
                              backgroundColor: "rgba(255,0,0,0.8)",
                              color: "white",
                              padding: "2px 5px",
                              borderRadius: "50%",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                            onClick={() => handleDeleteImage(index)}
                          >
                            ✕
                          </div>
                        </div>
                      ))}
                    </div>
                  </CCol>
                )}

                <CCol md={12}>
                  <Row className="justify-content-between">
                    <Col xs={4}>
                      <Link href="/admin/slider">
                        <CButton color="primary">Back</CButton>
                      </Link>
                    </Col>

                    <Col xs={4} className="d-flex justify-content-end">
                      <CButton
                        className="btn btn-primary "
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
                    </Col>
                  </Row>
                </CCol>
              </CForm>

              {/* Display list of sliders if available */}
            </Card.Body>
          </Card>
          {sliderAvailable.length > 0 && (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h3 className="card-title">Sliders Already Added:</h3>
                <Link href={`/admin/slider/edit/${formData.pageId}`} passHref>
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: "#007bff", // Bootstrap primary color
                      color: "white",
                      cursor: "pointer",
                    }}
                    target="_blank"
                  >
                    <i className="bi bi-pencil-fill me-2"></i>
                    Edit
                  </button>
                </Link>
              </Card.Header>
              <Card.Body>
                <div>
                  <div className="">
                    {/* Edit Button */}

                    <ol type="1" style={{ paddingLeft: "10px" }}>
                      {sliderAvailable.map((slider, index) => (
                        <li key={index * 2}>
                          <div>
                            <strong>Slider Name : </strong>
                            {slider.slider_name}

                            {slider.SliderImages &&
                              slider.SliderImages.length > 0 && (
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                      "repeat(auto-fill, minmax(110px, 1fr))", // Auto-adjust columns
                                    gap: "10px",
                                    marginTop: "10px",
                                  }}
                                >
                                  {slider.SliderImages.sort(
                                    (a, b) => a.sort_order - b.sort_order
                                  ) // Sort the images by sort_order
                                    .map((image) => (
                                      <div
                                        key={image.sort_order}
                                        style={{
                                          position: "relative",
                                          width: "100%", // Image will take up full width of its container
                                          height: "100px", // Fixed height for consistency
                                          marginBottom: "16px", // Space between images
                                        }}
                                      >
                                        <img
                                          src={`/uploads/sliders/${image.image_path}`} // Adjust path based on your setup
                                          alt={`Slider Image ${image.sort_order}`}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                            boxShadow:
                                              "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                          }}
                                        />
                                        <div
                                          style={{
                                            position: "absolute",
                                            top: "0px", // Adjust positioning for the label
                                            // right: "8px", // Adjust positioning for the label
                                            backgroundColor:
                                              "rgba(0, 0, 0, 0.6)", // Semi-transparent background
                                            color: "#fff", // White text for visibility
                                            padding: "4px 8px", // Padding for the label
                                            borderRadius: "10px", // Rounded corners
                                            fontSize: "12px", // Adjust font size
                                            // fontWeight: "bold",
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: "20px",
                                          }}
                                        >
                                          {`${image.sort_order}`}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </div>
      {/* <!--/Row--> */}
    </div>
  );
};

SliderAdd.propTypes = {};
SliderAdd.defaultProps = {};
SliderAdd.layout = "Contentlayout";

export default SliderAdd;
