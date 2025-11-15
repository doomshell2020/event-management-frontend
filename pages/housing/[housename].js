import Head from "next/head";

import FrontHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontFooter from "@/shared/layout-components/frontelements/frontendfooter";
import PulseLoader from "react-spinners/PulseLoader";
import { Col, Row, Form } from "react-bootstrap";
import axios from 'axios';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function PropertyDetails() {

    useEffect(() => {
        if (document.body) {
            document.querySelector("body").classList.add("front-design");
        }
        return () => {
            document.body.classList.remove("front-design");
        };
    }, []);

    const router = useRouter();
    const { housename } = router.query;
    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState(null);
    const [amenities, setAmenities] = useState([]);
    // console.log("property", property);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // State for the currently selected image
    const fetchPropertyDetails = async () => {
        let houseNameUrl = router.asPath;
        if (houseNameUrl.startsWith('/housing/')) {
            houseNameUrl = houseNameUrl.replace('/housing/', '');
        }
        // Replace '+' with spaces in the part before #
        houseNameUrl = houseNameUrl.replace(/\+/g, ' ');
        // Preserve the part after # (anchor)
        const [urlBeforeHash, hashPart] = houseNameUrl.split('#');
        // Remove the trailing slash if it exists in the part before #
        if (urlBeforeHash.endsWith('/')) {
            houseNameUrl = urlBeforeHash.slice(0, -1);
        } else {
            houseNameUrl = urlBeforeHash;
        }
        // Add back the hash part if it exists
        if (hashPart) {
            houseNameUrl += `#${hashPart}`;
        }
        console.log(houseNameUrl);
        try {
            const response = await axios.get(`/api/v1/housings/?housename=${encodeURIComponent(houseNameUrl)}`);
            const { data } = response;
            if (data.success) {
                setProperty(data.data);
                if (data.data.housingImages.length > 0) {
                    setSelectedImage(data.data.ImageURL); // Set the first image as the default large image
                }
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error('Error fetching property details:', error.message);
            setError('An error occurred while fetching property details.');
        } finally {
            setLoading(false);
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
                console.log("err")
            }

        } catch (error) {
            console.log("---", error.message)
        }
    }


    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (housename) {
                const encodedText = housename.replace(/-/g, '#').replace(/\+/g, ' ');
                // console.log(encodedText);
                setLoading(true);
                fetchPropertyDetails(encodedText);
                ViewAmenities();
            }
        }
    }, [housename]);


    const selectedAmenities = property?.amenities
        ? property.amenities.split(",").map(Number)
        : [];

    const correctedDescription = property && property.Description
        ? property.Description
            .replace(/â€™/g, '’')
            .replace(/Ã³/g, 'ó')
            .replace(/â€¢/g, '•')
        : 'N/A';


    const groupedBedsByBedroom = {};

    property?.Housings?.forEach(bed => {
        const bedroom = bed.bedroom_number;
        const bedType = bed.HousingBedType?.name || "Bed";
        const imageUrl = `/assets/img/front-images/${bed.HousingBedType?.imageUrl}` || "/default-placeholder.jpg";

        if (!groupedBedsByBedroom[bedroom]) {
            groupedBedsByBedroom[bedroom] = {
                bedroom,
                beds: {}
            };
        }

        if (!groupedBedsByBedroom[bedroom].beds[bedType]) {
            groupedBedsByBedroom[bedroom].beds[bedType] = {
                bedType,
                imageUrl,
                bedCount: 1
            };
        } else {
            groupedBedsByBedroom[bedroom].beds[bedType].bedCount += 1;
        }
    });


    const isValidHTMLContent = (html) => {
        if (!html) return false;

        const text = html.replace(/<[^>]*>/g, "").trim();
        return text !== "";
    };

    

    return (
        <>
            <Head>
                <title>{property?.Name || "Property Details"}</title>
                <meta name="description" content={correctedDescription} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={property?.Name || "Property Details"} />
                <meta property="og:description" content={correctedDescription} />
                <meta
                    property="og:image"
                    content={
                        property?.housingImages?.length > 0
                            ? property.housingImages[0].ImageURL
                            : "/default-placeholder.jpg"
                    }
                />
                <meta property="og:url" content={`http://localhost:3000/${router.asPath}`} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={property?.Name || "Property Details"} />
                <meta name="twitter:description" content={correctedDescription} />
                <meta
                    name="twitter:image"
                    content={
                        property?.housingImages?.length > 0
                            ? property.housingImages[0].ImageURL
                            : "/default-placeholder.jpg"
                    }
                />
            </Head>
            <FrontHeader />
            {loading ? (
                <div
                    className="loader inner-loader"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "60vh",
                    }}
                >
                    <PulseLoader color="#36d7b7" />
                </div>
            ) : (
                <div className="accomo-flw-prptyId-ctr">
                    <div className="accmo-flw-prpltys">
                        <h3>{property?.Name ? property.Name : "N/A"}</h3>

                        <div className="img-bx-sec">
                            <div className="box-mn">
                                <Image
                                    src={
                                        property?.ImageURL
                                            ? `${process.env.NEXT_PUBLIC_S3_URL}/housing/${property.ImageURL}`
                                            : `${process.env.NEXT_PUBLIC_S3_URL}/housing/housingdumy.png`
                                    }
                                    alt="House Image"
                                    width={200}
                                    height={150}
                                // className="object-cover rounded"
                                />
                            </div>
                            <div className="box-mn box-mn2">
                                <div className="box-colg">
                                    {property?.housingImages?.map((item, index) => {
                                        const imageSrc = item?.URL
                                            ? `${process.env.NEXT_PUBLIC_S3_URL}/housing/${item.URL}`
                                            : `${process.env.NEXT_PUBLIC_S3_URL}/housing/housingdumy.png`;

                                        return (
                                            <div key={index} className="boxcol">
                                                <Image
                                                    src={imageSrc}
                                                    alt="House Image"
                                                    width={200}
                                                    height={150}
                                                // className="object-cover rounded"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <Link href={`/housing/images/${property?.id}`}>
                            SHOW ALL PHOTOS
                        </Link>
                    </div>

                    <div className="acomo-flw-prpty-dtls">
                        <Row>
                            <Col lg={7}>
                                <div className="prpty-dtl-lft">
                                    <h4>{property?.Name}, {property?.HousingNeighborhood.name}, {property?.location}</h4>
                                    <p>{Number.isInteger(property?.MaxOccupancy) && property.MaxOccupancy > 0 && (
                                        <span>{property.MaxOccupancy} guests,</span>
                                    )}
                                        {Number.isInteger(property?.NumBedrooms) && property.NumBedrooms > 0 && (
                                            <span>{property.NumBedrooms} bedrooms -</span>
                                        )}
                                        {property?.Pool && (
                                            <strong>Pool: {property.Pool}</strong>
                                        )} </p>

                                    {/* <p><b><Link target="_blank" href={property?.google_map}>Location</Link></b></p> */}
                                    {property?.google_map?.trim() && (
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="none"
                                                stroke="black"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                                                <circle cx="12" cy="9" r="2.5" />
                                            </svg>
                                            <b>
                                                <Link
                                                    href={property.google_map}
                                                    target="_blank"
                                                    style={{ textDecoration: 'underline', color: '#000' }}
                                                >
                                                    Location
                                                </Link>
                                            </b>
                                        </p>
                                    )}

                                    {isValidHTMLContent(property?.Description) && (
                                        <div className="prpty-desc" >
                                            <p>
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: property?.Description || "N/A",
                                                    }}
                                                />
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                        {Object.keys(groupedBedsByBedroom || {}).length > 0 && (
                            <div className="whr-u-slp">
                                <h5>Where you sleep</h5>
                                <div className="pckg-boxs">
                                    {/* {Object.values(groupedBeds).map((bed, index) => {
                                    const { bedroom, bedType, bedCount, imageUrl } = bed;

                                    return (
                                        <div className="pckgbx-inr" key={index}>
                                            {Array.from({ length: bedCount }).map((_, i) => (
                                                <img
                                                    key={i}
                                                    src={imageUrl}
                                                    alt={`${bedType} ${i + 1}`}
                                                />
                                            ))}
                                            <h6>Bedroom {bedroom}</h6>
                                            <p>{bedCount} {bedType}{bedCount > 1 ? "s" : ""}</p>
                                        </div>
                                    );
                                })} */}

                                    {/* {Object.values(groupedBedsByBedroom).map((bedroomData, index) => {
                                        const { bedroom, beds } = bedroomData;
                                        return (
                                            <div className="pckgbx-inr" key={index}>
                                               
                                                <div >
                                                    {Object.values(beds).map((bed, i) =>
                                                        Array.from({ length: bed.bedCount }).map((_, imgIndex) => {
                                                            const imageSrc = bed.imageUrl
                                                                ? `${process.env.NEXT_PUBLIC_S3_URL}/beds/${bed.imageUrl}`
                                                                : `${process.env.NEXT_PUBLIC_S3_URL}/beds/default-bed.png`; // fallback if needed

                                                            return (
                                                                <Image
                                                                    key={`${i}_${imgIndex}`}
                                                                    src={imageSrc}
                                                                    alt={bed.bedType || "Bed"}
                                                                    width={60}
                                                                    height={60}
                                                                  
                                                                />
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            
                                                <h6>
                                                    Bedroom {bedroom}
                                                </h6>

                                           
                                                <ul className="homeUlList">
                                                    {Object.values(beds).map((bed, i) => (
                                                        <li key={i}>
                                                            <h6 >{bed.bedCount} {bed.bedType}{bed.bedCount > 1 ? "s" : ""}</h6>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })} */}


                                    {Object.values(groupedBedsByBedroom).map((bedroomData, index) => {
                                        const { bedroom, beds } = bedroomData;
                                        return (
                                            <div className="pckgbx-inr" key={index} style={{ textAlign: "left", marginBottom: "20px" }}>
                                                {/* Images in single line */}
                                                <div >
                                                    {Object.values(beds).map((bed, i) =>
                                                        Array.from({ length: bed.bedCount }).map((_, imgIndex) => (
                                                            <img
                                                                key={`${i}_${imgIndex}`}
                                                                src={bed.imageUrl}
                                                                alt={bed.bedType}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                                {/* Bedroom number */}
                                                <h6>
                                                    Bedroom {bedroom}
                                                </h6>

                                                {/* Bed descriptions */}
                                                <ul className="homeUlList">
                                                    {Object.values(beds).map((bed, i) => (
                                                        <li key={i}>
                                                            <h6 >{bed.bedCount} {bed.bedType}{bed.bedCount > 1 ? "s" : ""}</h6>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}

                                </div>
                            </div>
                        )}

                        <div className="wt-ts-plc">
                            <h5>What this place offers</h5>
                            <div className="wt-ts-plc-inr proprty-husing-new" >
                                {Object.entries(amenities).map(([category, items], idx) => (
                                    <div className="lft" key={category}>
                                        <h6>{category}</h6>
                                        <ul className="">
                                            {items.map((amenity) => (
                                                <li key={amenity.id} className={selectedAmenities.includes(amenity.id) ? 'checked' : 'unchecked'}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={amenity.name}
                                                        checked={selectedAmenities.includes(amenity.id)}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {property?.terms_and_conditions &&
                            property.terms_and_conditions.trim() !== "" &&
                            property.terms_and_conditions.trim() !== "<p><br></p>" && (
                                <Row>
                                    <Col lg={12}>
                                        <div className="prpty-dtl-lft">
                                            <div className="prpty-desc border-bottom-0 pe-0">
                                                <h6 className="t-c-prprty">House Rules</h6>
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: property.terms_and_conditions || "N/A",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                    </div>
                </div>
            )}

            <FrontFooter />
        </>
    );
}
