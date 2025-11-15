import React, { useState, useEffect } from "react";
import { Breadcrumb, Card, Col, Row, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import Image from "next/image";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import axios from "axios"

const CareyeshousingView = () => {
    const router = useRouter();
    const { housing_id } = router.query;
    const [housingData, setHousingData] = useState(null); // Set initial state to null
    // console.log("><<<<<<<<<<<<", housingData);
    const [amenities, setAmenities] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);


    // console.log(housingData)
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const fetchHousingDetails = async (housingId) => {
        try {
            const response = await axios.get(`/api/v1/housings-new/?housing_id=${housingId}`);
            setHousingData(response.data.data);
            var Amenities = response.data?.data?.amenities;
            const AmenitiesData = Amenities ? Amenities.split(",").map(Number) : [];
            setSelectedAmenities(AmenitiesData);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching event details:", error);
            setIsLoading(false);
        }
    };

    // View Amenities
    const ViewAmenities = async () => {
        try {
            const ApiUrl = '/api/v1/housings-new/';
            const body = new FormData();
            body.append("key", "amenities")
            const response = await axios.post(ApiUrl, body)
            const data = response.data;
            if (data.success) {
                setAmenities(data.data)
            } else {
                console.log("errr")
            }

        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (typeof window !== "undefined") {
            fetchHousingDetails(housing_id);
            ViewAmenities();
        }
    }, [housing_id]);



    const correctedDescription = housingData && housingData.Description
        ? housingData.Description
            .replace(/â€™/g, '’')
            .replace(/Ã³/g, 'ó')
            .replace(/â€¢/g, '•')
        : '-none-';
    // terms & conditions correct data fetching
    const termsAndConditions = housingData && housingData.terms_and_conditions
        ? housingData.terms_and_conditions
            .replace(/â€™/g, '’')
            .replace(/Ã³/g, 'ó')
            .replace(/â€¢/g, '•')
        : '-none-';
    // Amenities

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
                                                {housingData && housingData.HousingNeighborhood
                                                    ? housingData.HousingNeighborhood.name
                                                    : "---"}
                                            </h6>
                                        </div>

                                        <div>
                                            <Link href={`/admin/careyeshousing/edit?housingId=${housing_id}`}>
                                                <span className="btn btn-primary btn-wave me-2">
                                                    Edit
                                                </span>
                                            </Link>


                                            <Link href={"/admin/careyeshousing"}>
                                                <span className="btn btn-primary btn-wave">
                                                    <i className="fa fa-angle-left align-center pe-1"></i>
                                                    Back
                                                </span>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="innr-dtl">
                                        <Row className="gy-3 ">
                                            <Col md={3} className="">
                                                <div className=" img-sec">
                                                    <Image
                                                        src={
                                                            housingData?.ImageURL
                                                                ? `${process.env.NEXT_PUBLIC_S3_URL}/housing/${housingData.ImageURL}`
                                                                : `${process.env.NEXT_PUBLIC_S3_URL}/housing/housingdumy.png`
                                                        }
                                                        alt="House Image"
                                                        width={200}
                                                        height={150}
                                                        className=""
                                                        style={{ objectFit: "cover", borderRadius: "8px" }} // optional styling
                                                    />
                                                </div>
                                            </Col>

                                            <Col md={9} className=" ">
                                                <div className=" rgt-cnt-sec">
                                                    <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3">
                                                        Housing Information
                                                    </h6>

                                                    <Row>

                                                        <Col sm={4}>
                                                            <p><b>Property details</b> </p>
                                                            <div>
                                                                <p>
                                                                    <b> Name of the property: </b>
                                                                    {housingData && housingData.Name
                                                                        ? housingData.Name
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b>Type: </b>
                                                                    {housingData && housingData.HousingType
                                                                        ? housingData.HousingType.name
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b> Neighborhood: </b>
                                                                    {housingData && housingData.HousingNeighborhood
                                                                        ? housingData.HousingNeighborhood.name
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b> Location: </b>
                                                                    {housingData && housingData.location
                                                                        ? housingData.location
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b> Google maps: </b>
                                                                    {/* {housingData && housingData.google_map
                                                                        ? housingData.google_map
                                                                        : "---"} */}
                                                                    {housingData && housingData.google_map ? (
                                                                        (() => {
                                                                            const url = housingData.google_map.trim(); // Extra spaces hatao
                                                                            const isValid =
                                                                                (url.startsWith("http://") || url.startsWith("https://")) &&
                                                                                (() => {
                                                                                    try {
                                                                                        new URL(url);
                                                                                        return true;
                                                                                    } catch (e) {
                                                                                        return false;
                                                                                    }
                                                                                })();

                                                                            return isValid ? (
                                                                                <Link
                                                                                    href={url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    style={{
                                                                                        color: "blue",
                                                                                        cursor: "pointer",
                                                                                        textDecoration: "underline",
                                                                                    }}
                                                                                >
                                                                                    {url}
                                                                                </Link>
                                                                            ) : (
                                                                                <span style={{ color: "black" }}>{url}</span> // Invalid URL ko clickable nahi banayenge
                                                                            );
                                                                        })()
                                                                    ) : (
                                                                        "--"
                                                                    )}
                                                                </p>
                                                                <p>
                                                                    <b> Pool: </b>
                                                                    {housingData && housingData.Pool
                                                                        ? housingData.Pool
                                                                        : "---"}
                                                                </p>
                                                            </div>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <p><b>Bedroom configuration</b> </p>
                                                            <div>
                                                                <p>
                                                                    <b>Number of bedrooms: </b>
                                                                    {housingData && housingData.NumBedrooms
                                                                        ? housingData.NumBedrooms
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    {housingData?.Housings && housingData?.Housings.length > 0 ? (
                                                                        Object.entries(
                                                                            housingData?.Housings.reduce((acc, bed) => {
                                                                                const { bedroom_number, HousingBedType } = bed;

                                                                                if (HousingBedType && HousingBedType.name) {
                                                                                    acc[bedroom_number] = acc[bedroom_number] || {};
                                                                                    acc[bedroom_number][HousingBedType.name] = (acc[bedroom_number][HousingBedType.name] || 0) + 1;
                                                                                }
                                                                                return acc;
                                                                            }, {})
                                                                        ).map(([bedroomNumber, beds]) => (
                                                                            <span key={bedroomNumber}>
                                                                                <strong>Bedroom {bedroomNumber}:</strong>{" "}
                                                                                {Object.entries(beds).map(([bedType, count]) => (
                                                                                    <span key={bedType}>
                                                                                        {count} {bedType}{" "}
                                                                                    </span>
                                                                                ))}
                                                                                <br />
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        "No bedrooms available"
                                                                    )}
                                                                </p>



                                                                <p>
                                                                    <b> Max Occupancy: </b>
                                                                    {housingData && housingData.MaxOccupancy
                                                                        ? housingData.MaxOccupancy
                                                                        : "---"}
                                                                </p>

                                                            </div>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <p><b>Contact details</b> </p>
                                                            <div>
                                                                <p>
                                                                    <b>Owner name: </b>
                                                                    {housingData && housingData.OwnerName
                                                                        ? housingData.OwnerName
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b>Owner email: </b>{housingData && housingData.OwnerEmail
                                                                        ? housingData.OwnerEmail
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b>Owner mobile: </b>{housingData && housingData.OwnerMobile
                                                                        ? housingData.OwnerMobile
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b>Manager name: </b>
                                                                    {housingData && housingData.ManagerName
                                                                        ? housingData.ManagerName
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b>Manager email: </b>{housingData && housingData.ManagerEmail
                                                                        ? housingData.ManagerEmail
                                                                        : "---"}
                                                                </p>
                                                                <p>
                                                                    <b>Manager mobile: </b>{housingData && housingData.ManagerMobile
                                                                        ? housingData.ManagerMobile
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
                                        <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3 mt-5">Description</h6>
                                        <p className="fs-6">
                                            <span dangerouslySetInnerHTML={{ __html: correctedDescription }} />
                                        </p>
                                        {/* terms&conditions section */}
                                        <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3 mt-3"></h6>
                                        <h6 className="text-dark fs-6 fw-bold pb-2 mb-3 mt-5">Terms & Conditions</h6>
                                        <p className="fs-6">
                                            <span dangerouslySetInnerHTML={{ __html: termsAndConditions }} />
                                        </p>


                                        <h6 className="text-dark fs-6 fw-bold pb-2 mb-3 mt-5">Amenities</h6>
                                        <Row className="w-100 mt-2">
                                            {Object.entries(amenities).map(([category, items]) => (

                                                <Col md={4} key={category}>
                                                    <div style={{ marginLeft: "30px", }}>
                                                        <h6 className="fw-bold ">{category}</h6>
                                                        {items.map((amenity) => (
                                                            <label key={amenity.id} className="d-flex " style={{ position: "relative", cursor: "pointer" }}>
                                                                <input style={{ position: "absolute", top: "50%", cursor: "pointer", transform: "translateY(-50%)", left: "-18px", }}
                                                                    type="checkbox"
                                                                    // disabled
                                                                    readOnly
                                                                    checked={selectedAmenities.includes(amenity.id)}
                                                                    // onChange={() => handleCheckboxChange(amenity.id)}
                                                                    className="me-2"
                                                                />
                                                                {amenity.name}
                                                            </label>
                                                        ))}

                                                    </div>
                                                </Col>

                                            ))}

                                        </Row>
                                        {/* <p className="fs-6">
                                            <span dangerouslySetInnerHTML={{ __html: correctedAmenities }} />
                                        </p> */}
                                        <h6 className="border-bottom border-dark text-dark fs-6 fw-bold pb-2 mb-3 mt-5">
                                            Additional Images
                                        </h6>

                                        <Row className="gy-3">
                                            {housingData?.housingImages?.map((item, index) => {
                                                const imageSrc = item?.URL
                                                    ? `${process.env.NEXT_PUBLIC_S3_URL}/housing/${item.URL}`
                                                    : `${process.env.NEXT_PUBLIC_S3_URL}/housing/housingdumy.jpg`;

                                                return (
                                                    <Col xl={2} lg={3} md={4} sm={6} key={index}>
                                                        <div className="btm-hs-imgs">
                                                            <Image
                                                                src={imageSrc}
                                                                alt="House Image"
                                                                width={200}
                                                                height={150}
                                                                className="rounded object-cover"
                                                                style={{ borderRadius: "8px" }}
                                                            />
                                                        </div>
                                                    </Col>
                                                );
                                            })}
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
