// pages/admin/slider/edit/[sliderId].js
import PulseLoader from "react-spinners/PulseLoader";
import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Breadcrumb, Card, Col, Row, Spinner, Alert } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import makeAnimated from "react-select/animated";

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

const EditSlider = () => {
  const router = useRouter();
  const { sliderId } = router.query; // Access sliderId from the URL

  const [sliderData, setSliderData] = useState([]);
  const [editingSliderIndex, setEditingSliderIndex] = useState(null);
  const [sliders, setSliders] = useState([]);
  const [isEdited, setIsEdited] = useState(false);

  console.log(">>>>>>>", sliderData);

  const handleDragEnd = (result, sliderIndex) => {
    if (!result.destination) return;

    const newSliders = [...sliders];
    const sliderImages = Array.from(newSliders[sliderIndex].SliderImages);

    const [movedItem] = sliderImages.splice(result.source.index, 1);
    sliderImages.splice(result.destination.index, 0, movedItem);

    // Update sort_order based on new position
    sliderImages.forEach((image, index) => {
      image.sort_order = index + 1;
    });

    // Mark this slider as edited
    newSliders[sliderIndex].isEdited = true;
    newSliders[sliderIndex].SliderImages = sliderImages;
    setIsEdited(true);
    setSliders(newSliders);
  };

  const fetchSliderDetails = async (sliderId) => {
    try {
      const { data } = await axios.get(
        `/api/v1/sliders?key=get_page_details&page_id=${sliderId}`
      );
      if (data.success) {
        setSliderData(data.data);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  // Fetch slider data based on the sliderId
  useEffect(() => {
    if (sliderId) {
      fetchSliderDetails(sliderId);
    }
  }, [sliderId]);

  // Update sliders state when sliderData changes
  useEffect(() => {
    setSliders(sliderData);
  }, [sliderData]);

  const handleFileUpload = async (sliderData) => {
    const { value: files } = await Swal.fire({
      title: `Upload Files for ${sliderData.slider_name}`,
      input: "file",
      inputAttributes: {
        multiple: true,
        accept: "image/png, image/jpeg, image/jpg", // Restrict file types to images only
      },
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Upload Files",
      inputValidator: (value) => {
        if (!value) {
          return "Please select at least one file.";
        }

        // File type validation
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        const files = value instanceof FileList ? Array.from(value) : [value];

        const invalidFiles = files.filter(
          (file) => !allowedTypes.includes(file.type)
        );
        if (invalidFiles.length > 0) {
          return `Invalid file type detected: Only JPG and PNG files are allowed.`;
        }
      },
    });

    if (files) {
      // Show a Swal loader while uploading
      Swal.fire({
        title: "Uploading files...",
        text: "Please wait while your files are being uploaded.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const apiUrl = `/api/v1/sliders`;
        const formData = new FormData();
        formData.append("key", "slider_image_upload");
        formData.append("slider_id", sliderData.id);
        for (let file of files) {
          formData.append("slider_images", file);
        }

        const { data } = await axios.post(apiUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Files Uploaded",
            text: data.message,
          });
          fetchSliderDetails(sliderId);
          // Handle any other UI updates, such as updating the list of images for the slider
        } else {
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: "Failed to upload files. Please try again.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while uploading files.",
        });
      }
    }
  };

  // Function to update only edited sliders
  const updateEditedSliders = async () => {
    const editedSliders = sliders.filter((slider) => slider.isEdited);

    if (editedSliders.length === 0) {
      console.log("No sliders to update.");
      return;
    }

    // Step 1: Confirm with the user before proceeding using SweetAlert
    const confirmResult = await Swal.fire({
      title: "Are you sure you want to update the slider order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) {
      return; // User canceled, don't proceed with the update
    }

    // Step 2: Show a loading Swal alert while waiting for the API response
    const loadingSwal = Swal.fire({
      title: "Updating slider order...",
      text: "Please wait while we update the slider order.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
    });

    try {
      const formData = new FormData();
      formData.append("key", "update_slider_order");

      const mergedSliderImages = editedSliders.flatMap((slider) =>
        slider.SliderImages.map((image) => ({
          image_id: image.id,
          sort_order: image.sort_order,
        }))
      );
      formData.append("SliderImagesArray", JSON.stringify(mergedSliderImages));

      // API call
      const response = await axios.post("/api/v1/sliders", formData);

      // Step 3: Handle success response
      if (response.data.success) {
        Swal.fire({
          title: "Success",
          icon: "success",
          title: response.data.message,
          confirmButtonText: "OK",
        });

        fetchSliderDetails(sliderId);
        setIsEdited(false);
      } else {
        // Handle error from the response
        Swal.fire({
          title: "Error",
          text: response.data.message || "Something went wrong.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      // Step 4: Handle any errors during the API call
      console.error("Error updating sliders:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "An unexpected error occurred.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      // Close the loading Swal alert when done
      loadingSwal.close();
    }
  };

  const handleDeleteImage = async (imageDetails) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this image?",
      // text: "This action is irreversible, and the image will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      // Show Swal loader
      Swal.fire({
        title: "Deleting image...",
        text: "Please wait while the image is being deleted.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.delete(
          `/api/v1/sliders?key=delete_slider_images&id=${imageDetails.id}`
        );
        // console.log('>>>>>>>>',response);

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response.data.message,
          });
          fetchSliderDetails(sliderId); // Refresh slider details
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete image. Please try again.",
          });
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while deleting the image.",
        });
      }
    }
  };

  const handleDeleteSlider = async (slider) => {
    // console.log(slider);
    const result = await Swal.fire({
      title: "Are you sure you want to delete this slider?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      // Show Swal loader
      Swal.fire({
        title: "Deleting slider...",
        text: "Please wait while the slider is being deleted.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.delete(
          `/api/v1/sliders?key=slider&slider_id=${slider.id}`
        );
        // console.log('>>>>>>>>',response);

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response.data.message,
          });
          fetchSliderDetails(sliderId); // Refresh slider details
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete slider. Please try again.",
          });
        }
      } catch (error) {
        console.error("Error deleting slider:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while deleting the slider.",
        });
      }
    }
  };

  if (sliderData.length === 0) {
    return <LoadingComponent />;
  }

  return (
    <div>
      <Seo title={"Slider Manager"} />
      <div className="row">
        <Col lg={12} md={12}>
          <Toaster position="top-right" reverseOrder={false} />
          <Card>
            <Card.Header>
              <Card.Title
                as="h5"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 className="card-title">
                  Slider Details Page (
                  {sliderData && sliderData.length > 0
                    ? sliderData[0].page_name
                    : "No Page Name Available"}
                  )
                </h3>

                {isEdited && (
                  <CButton
                    className="btn btn-primary"
                    onClick={() => {
                      updateEditedSliders();
                    }}
                  >
                    Update Order
                  </CButton>
                )}
              </Card.Title>
            </Card.Header>
            <p style={{display:"flex", marginBottom:"0", marginTop:"10px", marginLeft:"20px", alignItems: "center", fontSize:"16px",}}>
              <span
                style={{
                  backgroundColor: "#007bff",
                  borderRadius: "50%",
                  width: "15px",
                  height: "15px",
                  display: "inline-block",
                  marginRight:"5px",
                }}
              ></span>
             Drag to reorder images up or down.
            </p>
            <Card.Body>
              {/* Display list of sliders */}
              {sliders.length > 0 && (
                <div
                  className="slider-container"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "20px",
                  }}
                >
                  {sliders.map((slider, sliderIndex) => (
                    <div
                      key={sliderIndex}
                      style={{
                        backgroundColor: "#f9f9f9",
                        padding: "10px",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <strong>Slider Name:</strong> {slider.slider_name}
                        </div>
                        <div>
                          <button
                            onClick={() =>
                              setEditingSliderIndex(
                                editingSliderIndex === sliderIndex
                                  ? null
                                  : sliderIndex
                              )
                            }
                            style={{
                              marginLeft: "10px",
                              padding: "4px 8px",
                              backgroundColor: "#007bff",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            {editingSliderIndex === sliderIndex
                              ? "Done"
                              : "Edit Sort Order"}
                          </button>
                          {/* New Button for File Upload */}
                          <button
                            onClick={() => handleFileUpload(slider)}
                            style={{
                              marginLeft: "10px",
                              padding: "4px 8px",
                              backgroundColor: "#28a745",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Upload Files
                          </button>
                          {/* New Button for Deleting Slider */}
                          <button
                            onClick={async () => {
                              // Call the delete function here
                              handleDeleteSlider(slider);
                            }}
                            style={{
                              marginLeft: "10px",
                              padding: "4px 8px",
                              backgroundColor: "#dc3545", // Red color for delete
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {slider.SliderImages &&
                        slider.SliderImages.length > 0 && (
                          <DragDropContext
                            onDragEnd={(result) =>
                              handleDragEnd(result, sliderIndex)
                            }
                          >
                            <Droppable
                              droppableId={`slider-${sliderIndex}`}
                              direction="vertical"
                            >
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  style={{
                                    marginTop: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                  }}
                                >
                                  {slider.SliderImages.sort(
                                    (a, b) => a.sort_order - b.sort_order
                                  ).map((image, index) => (
                                    <Draggable
                                      key={image.sort_order}
                                      draggableId={`image-${image.sort_order}`}
                                      index={index}
                                      isDragDisabled={
                                        editingSliderIndex !== sliderIndex
                                      }
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            position: "relative",
                                            backgroundColor: "#fff",
                                            border: "1px solid #ddd",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            boxShadow:
                                              "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                            transition: "transform 0.2s ease",
                                            ...provided.draggableProps.style,
                                          }}
                                        >
                                          <img
                                            src={`/uploads/sliders/${image.image_path}`}
                                            alt={`Slider Image ${image.sort_order}`}
                                            style={{
                                              width: "100%",
                                              height: "220px",
                                              objectFit: "cover",
                                            }}
                                          />
                                          <div
                                            style={{
                                              position: "absolute",
                                              top: "8px",
                                              right: "8px",
                                              backgroundColor:
                                                "rgba(0, 0, 0, 0.6)",
                                              color: "#fff",
                                              padding: "4px 8px",
                                              borderRadius: "50%",
                                              fontSize: "12px",
                                              fontWeight: "bold",
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                              width: "30px",
                                              height: "30px",
                                              border: "2px solid white",
                                            }}
                                          >
                                            {`${image.sort_order}`}
                                          </div>

                                          {/* Delete Icon */}
                                          <div
                                            onClick={() =>
                                              handleDeleteImage(image)
                                            }
                                            style={{
                                              position: "absolute",
                                              top: "8px",
                                              left: "8px",
                                              backgroundColor:
                                                "rgba(255, 0, 0, 0.6)",
                                              borderRadius: "50%",
                                              padding: "5px",
                                              cursor: "pointer",
                                              color: "white",
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                              width: "30px",
                                              height: "30px",
                                            }}
                                          >
                                            <i className="bi bi-trash d-flex"></i>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </div>
    </div>
  );
};

EditSlider.propTypes = {};
EditSlider.defaultProps = {};
EditSlider.layout = "Contentlayout";

export default EditSlider;
