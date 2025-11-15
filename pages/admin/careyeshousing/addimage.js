import React, { useState, useEffect } from "react";
import { Breadcrumb, Card, Row, Col, Button, Spinner } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import Swal from "sweetalert2";
import Image from "next/image";
import Seo from "@/shared/layout-components/seo/seo";
import { CForm, CCol } from "@coreui/react";

const CareyeshousingAddimage = () => {
  const router = useRouter();
  const { housingId } = router.query;
  const [housingData, setHousingData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);


  const fetchHousingData = async (housingId) => {
    try {
      const viewHousingImages = `/api/v1/housings?HousingID=${housingId}`;
      const response = await fetch(viewHousingImages);
      const value = await response.json();
      setHousingData(value.data);
    } catch (error) {
      console.error("Error fetching housing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (housingId != undefined) {
      fetchHousingData(housingId);
    }
  }, [housingId]);

  const [validateDefault, setValidateDefault] = useState(false);

  // upload image
  const handleSubmit = async (event) => {
    event.preventDefault(); // Always prevent default first
    const form = event.currentTarget;
    setLoading(true);

    if (form.checkValidity() == false) {
      event.stopPropagation();
      setLoading(false);
      setValidateDefault(true);
      return;
    }

    const housingAddImageUrl = "/api/v1/hosuingimages";
    const body = new FormData();
    body.append("HousingID", housingId);
    images.forEach((fileItem) => {
      body.append("URL", fileItem);
    });

    try {
      const res = await axios.put(housingAddImageUrl, body); // s3 integration
      // const res = await axios.post(housingAddImageUrl, body);
      const msg = res.data.message;
      if (res.data.success == true) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: msg,
        });
        setImages([]);
        document.getElementById("formFile").value = "";
        fetchHousingData(housingId);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: msg,
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Try to extract API error message
      const apiMessage = err?.response?.data?.message || "An unexpected error occurred";
      const apiErrorDetail = err?.response?.data?.error || "";
      Swal.fire({
        icon: "error",
        title: "Upload Failed!",
        text: apiErrorDetail ? `${apiMessage}: ${apiErrorDetail}` : apiMessage,
      });
    } finally {
      setLoading(false);
      setValidateDefault(true);
    }
  };


  // Housing image deleted
  const handleHousingImageDelete = async (id) => {
    // console.log("id", id);
    Swal.fire({
      title: "Warning",
      text: "Are you sure you want to permanently delete this housing image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      customClass: { popup: "add-tckt-dtlpop" },
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // const apiUrl = `/api/v1/housings?imageId=${id}`;
          const apiUrl = `/api/v2/housings-new?imageId=${id}`; // v2 using s3 
          const response = await axios.delete(apiUrl);
          const message =
            response.data.message ||
            "The Housing image has been successfully deleted.";
          fetchHousingData(housingId);
          if (response.data.success === true) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: message,
              customClass: { popup: "add-tckt-dtlpop" },
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops!",
              text: message,
              customClass: { popup: "add-tckt-dtlpop" },
            });
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            "An error occurred while deleting the housing image.";
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: errorMessage,
            customClass: { popup: "add-tckt-dtlpop" },
          });
        }
      }
    });
  };

  return (
    <div>
      <Seo title={"housing addImage"} />
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Manage Additional Images
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
              Careyes
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Additional Images
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="row">
        <Col lg={12} md={12}>
          <Card>
            <Card.Body>
              <div className="hosing-vw-dtl">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="mn-hd">
                      {housingData && housingData.Name
                        ? housingData.Name
                        : "---"}
                    </p>
                    <h6 className="sb-hd">
                      {housingData && housingData.HousingNeighborhood
                        ? housingData.HousingNeighborhood.name
                        : "---"}
                    </h6>
                  </div>
                  <Link href="/admin/careyeshousing">
                    <span className="btn btn-primary btn-wave">
                      <i className="fa fa-angle-left align-center pe-1"></i>Back
                    </span>
                  </Link>
                </div>


                {isLoading ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "200px" }}
                  >
                    <Spinner animation="border" />
                  </div>
                ) : housingData.housingImages.length === 0 ? ( // Show message if no properties
                  <Col md={12} className="pe-1 mb-12">
                    <h4 style={{ textAlign: "center" }}>No images available.</h4>
                  </Col>
                ) : (
                  <div>
                    <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3 mt-5">Current Images</h6>
                    <Row className="gy-5" style={{}}>
                      {housingData &&
                        housingData.housingImages &&
                        housingData.housingImages.map((item, index) => (
                          <Col xl={2} lg={3} md={4} sm={6} key={index}>
                            <div className="btm-hs-imgs">
                              {item?.URL ? (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_S3_URL}/housing/${item.URL}`}
                                  alt="House Image"
                                  width={100}
                                  height={100}
                                  className=""
                                />
                              ) : (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_S3_URL}/housing/housingdumy.png`}
                                  alt="House Image"
                                  width={100}
                                  height={100}
                                  className=""
                                />
                              )}
                            </div>
                            <Button
                              className="badge  rounded-pill bg-danger mt-2 mb-4 d-block mx-auto w-50"
                              style={{ border: "none" }}
                              onClick={() => handleHousingImageDelete(item.id)}
                            >
                              <i className="bi bi-trash-fill align-bottom pe-1"></i>
                              Delete
                            </Button>

                          </Col>
                        ))}
                    </Row>
                  </div>
                )}
                <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3 mt-5">Add New Image</h6>
                <div className="row align-items-center">
                  <div className="col-md-2">
                    <label htmlFor="formFile" className="form-label">
                      Add Photo
                    </label>
                  </div>
                  <div className="col-md-10">
                    <CForm
                      className="row g-3 needs-validation"
                      noValidate
                      validated={validateDefault}
                      onSubmit={handleSubmit}
                    >
                      <div className="col-md-6">
                        {/* <input
                          className="form-control"
                          type="file"
                          id="formFile"
                          multiple
                          accept=".png, .jpg, .jpeg"
                          required
                          onChange={(e) => {
                            setImages([...e.target.files]);
                          }}
                        /> */}

                        <input
                          className="form-control"
                          type="file"
                          id="formFile"
                          multiple
                          accept=".png, .jpg, .jpeg"
                          required
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
                            const maxSize = 20 * 1024 * 1024; // 20 MB in bytes
                            // Validate files
                            for (let file of files) {
                              if (!allowedTypes.includes(file.type)) {
                                alert("Only PNG, JPG, and JPEG files are allowed.");
                                e.target.value = ""; // Reset file input
                                return;
                              }
                              if (file.size > maxSize) {
                                // alert(`File "${file.name}" exceeds the maximum size of 20 MB.`);
                                Swal.fire({
                                  icon: "error",
                                  title: "Oops!",
                                  text: 'The selected image exceeds the maximum size of 20 MB.',
                                });
                                e.target.value = ""; // Reset file input
                                return;
                              }
                            }
                            // If all files are valid, set state
                            setImages(files);
                          }}
                        />












                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="primary"
                          className="btn btn-primary btn-block"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
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
                        </Button>
                      </div>
                    </CForm>

                    <p className="pt-2 text-danger">  Note: Please upload the image in <strong>1270 x 740 px</strong> size or maintain the same aspect ratio for best results.</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </div>
    </div>
  );
};

CareyeshousingAddimage.layout = "Contentlayout";

export default CareyeshousingAddimage;
