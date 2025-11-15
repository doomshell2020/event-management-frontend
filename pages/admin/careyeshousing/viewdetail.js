import React, { useState, useEffect } from "react";
import { Breadcrumb, Card, Col, Row, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import Image from "next/image";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";

const CareyeshousingView = () => {
  const router = useRouter();
  const { housingId } = router.query;
  const [housingData, setHousingData] = useState(null); // Set initial state to null
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    if (housingId) {
      const housingviewurl = `/api/v1/housings?housingId=${housingId}`;
      fetch(housingviewurl)
        .then((response) => response.json())
        .then((value) => {
          setHousingData(value.data);
          setIsLoading(false); // Stop loading once data is fetched
        })
        .catch(() => setIsLoading(false)); // Handle errors and stop loading
    }
  }, [housingId]);




  const correctedDescription = housingData && housingData.Description
    ? housingData.Description
      .replace(/â€™/g, '’')
      .replace(/Ã³/g, 'ó')
      .replace(/â€¢/g, '•')
    : '-none-';








  return (
    <div>
      <Seo title={"careyeshousing viewdetail"} />

      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Careyes Housing Manager
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
              View Details
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}

      {/* <!--Row--> */}
      <div className="row">
        <Col lg={12} md={12}>
          <Card>
            <Card.Body>
              {isLoading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "400px" }}
                >
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="hosing-vw-dtl">
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className=" mn-hd">
                        {housingData && housingData.Name
                          ? housingData.Name
                          : "---"}
                      </p>
                      <h6 className=" sb-hd ">
                        {housingData && housingData.Neighborhood
                          ? housingData.Neighborhood
                          : "---"}
                      </h6>
                    </div>

                    <Link href={"/admin/careyeshousing"}>
                      <span className="btn btn-primary btn-wave">
                        <i className="fa fa-angle-left align-center pe-1"></i>
                        Back
                      </span>
                    </Link>
                  </div>
                  <div className="innr-dtl">
                    <Row className="gy-3 ">
                      <Col md={3} className="">
                        <div className=" img-sec">
                          {housingData.ImageURL ? (
                            <img
                              src={`/uploads/housing/${housingData.ImageURL}`}
                              alt="House Image"
                              className=""
                            />
                          ) : (
                            <img
                              src={"/housingdumy.jpg"}
                              alt="House Image"


                              className=""
                            />
                          )}
                        </div>
                      </Col>

                      <Col md={9} className=" ">
                        <div className=" rgt-cnt-sec">
                          <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3">
                            Housing Information
                          </h6>

                          <Row>
                            <Col sm={4}>
                              <div>
                                <p>
                                  <b> Housing ID:</b>
                                  {housingData && housingData.id
                                    ? housingData.id
                                    : "---"}
                                </p>
                                <p>
                                  <b> Pool:</b>
                                  {housingData && housingData.Pool
                                    ? housingData.Pool
                                    : "---"}
                                </p>

                                <p>
                                  <b>Type:</b>
                                  {housingData && housingData.Type
                                    ? housingData.Type
                                    : "---"}
                                </p>
                                <p>
                                  <b>Manager Name:</b>
                                  {housingData && housingData.ManagerName
                                    ? housingData.ManagerName
                                    : "---"}
                                </p>
                              </div>
                            </Col>

                            <Col sm={4}>
                              <div>
                                <p>
                                  <b> Max Occupancy:</b>
                                  {housingData && housingData.MaxOccupancy
                                    ? housingData.MaxOccupancy
                                    : "---"}
                                </p>
                                <p>
                                  <b>Neighborhood:</b>
                                  {housingData && housingData.Neighborhood
                                    ? housingData.Neighborhood
                                    : "---"}
                                </p>
                                <p>
                                  <b>Owner Name: </b>{housingData && housingData.OwnerName
                                    ? housingData.OwnerName
                                    : "---"}
                                </p>

                                <p>
                                  <b>Manager Email:</b>
                                  {housingData && housingData.ManagerEmail
                                    ? housingData.ManagerEmail
                                    : "---"}
                                </p>
                              </div>
                            </Col>

                            <Col sm={4}>
                              <div>
                                <p>
                                  <b>Property Name:</b>
                                  {housingData && housingData.Name
                                    ? housingData.Name
                                    : "---"}
                                </p>
                                <p>
                                  <b>Distance:</b>
                                  {housingData && housingData.Distance
                                    ? housingData.Distance
                                    : "---"}
                                </p>
                                <p>
                                  <b>Owner Email: </b>{housingData && housingData.OwnerEmail
                                    ? housingData.OwnerEmail
                                    : "---"}
                                </p>
                                <p>
                                  <b>#Bedrooms:</b>
                                  {housingData && housingData.NumBedrooms
                                    ? housingData.NumBedrooms
                                    : "---"}
                                </p>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <div>
                    {/* <h6 className="border-bottom py-2 my-4">
                      Housing Information
                    </h6>
                    <div className="row">
                      <div className="col-6">
                        <p>
                          <b> Housing ID:</b>
                          {housingData && housingData.id
                            ? housingData.id
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b> Max Occupancy:</b>
                          {housingData && housingData.MaxOccupancy
                            ? housingData.MaxOccupancy
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>Property Name:</b>
                          {housingData && housingData.Name
                            ? housingData.Name
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b> Pool:</b>
                          {housingData && housingData.Pool
                            ? housingData.Pool
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>Neighborhood:</b>
                          {housingData && housingData.Neighborhood
                            ? housingData.Neighborhood
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>Distance:</b>
                          {housingData && housingData.Distance
                            ? housingData.Distance
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>Type:</b>
                          {housingData && housingData.Type
                            ? housingData.Type
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>Owner:</b>Kim Kessler
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>#Bedrooms:</b>
                          {housingData && housingData.NumBedrooms
                            ? housingData.NumBedrooms
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>Manager Name:</b>
                          {housingData && housingData.ManagerName
                            ? housingData.ManagerName
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>Beds:</b>
                          {housingData && housingData.NumKingBeds
                            ? housingData.NumKingBeds
                            : "---"}
                        </p>
                      </div>
                      <div className="col-6">
                        <p>
                          <b>Manager Email:</b>
                          {housingData && housingData.ManagerEmail
                            ? housingData.ManagerEmail
                            : "---"}
                        </p>
                      </div>
                    </div> */}

                    <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3 mt-5">Description</h6>
                    <p className="fs-6">
                      {/* {housingData && housingData.Description
                        ? housingData.Description
                        : "-none-"} */}
                      <span dangerouslySetInnerHTML={{ __html: correctedDescription }} />
                    </p>
                    <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3 mt-5">
                      Additional Images
                    </h6>

                    <Row className="gy-3" style={{}}>
                      {housingData &&
                        housingData.housingImages &&
                        housingData.housingImages.map((item, index) => (
                          <Col xl={2} lg={3} md={4} sm={6} key={index} className="">
                            <div className="btm-hs-imgs" style={{}}>
                              {item ? (
                                <img
                                  src={`/uploads/housing/${item.URL}`}
                                  alt="House Image"

                                  className=""
                                />
                              ) : (
                                <img
                                  src={"/housingdumy.jpg"}
                                  alt="House Image"

                                  className=""
                                />
                              )}
                            </div>
                          </Col>
                        ))}
                    </Row>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </div>
      {/* <!--/Row--> */}
    </div>
  );
};

CareyeshousingView.layout = "Contentlayout";

export default CareyeshousingView;
