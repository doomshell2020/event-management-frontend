import Head from "next/head";
 
import Link from "next/link";
import { useEffect, useState } from "react";
import FrontHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontFooter from "@/shared/layout-components/frontelements/frontendfooter";
import { Col, Row, Card } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/router";
import axios from "axios"
import Seo from "@/shared/layout-components/seo/seo";
import PulseLoader from "react-spinners/PulseLoader";
import Image from "next/image";

export default function AccommodationImagesDetails() {
  useEffect(() => {
    if (document.body) {
      document.querySelector("body").classList.add("front-design");
    }
    return () => {
      document.body.classList.remove("front-design");
    };
  }, []);


  const router = useRouter();
  const { propertyId } = router.query
  const [property, setProperty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = async () => {
    setIsLoading(true); // Set loading state to true before the API call
    try {
      const ApiURL = `/api/v1/front/accommodationbook/bookaccommodations?propertyId=${propertyId}`;
      const response = await axios.get(ApiURL);
      if (response.data.success) {
        setProperty(response.data.data);
      } else {
        console.error("API Error:", response.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching housing enquiry data:", error);
    } finally {
      setIsLoading(false); // Ensure loading state is set to false after the API call
    }
  };
  useEffect(() => {
    if (propertyId) {
      fetchData();
    }
  }, [propertyId]);
  return (
    <div>
      <FrontHeader />
      <Head>
        <title>Photo gallery</title>
        <meta name="description" content="Photo gallery page" />
          
      </Head>
      <Seo title={"Photo gallery"} />

      <div className="accomo-flw-prptyId-ctr">
        {isLoading ? (
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
          <>
            <div className="accmo-flw-prpltys">
              <h3>Photo gallery</h3>
            </div>
            <div className="hosing-vw-dtlimgs">

              <Row className="gy-sm-4 gy-3">
                {property.length == 0 ? (
                  <Col>
                    <p className="text-center fw-bold fs-5">Images not available</p>
                  </Col>
                ) : (
                  property.map((item, index) => {
                    const imageSrc = item?.URL
                      ? `${process.env.NEXT_PUBLIC_S3_URL}/housing/${item.URL}`
                      : `${process.env.NEXT_PUBLIC_S3_URL}/housing/housingdumy.png`;

                    const mod = index % 6;

                    if (mod == 0 || mod == 3) {
                      // Full width image
                      return (
                        <Col md={12} key={index}>
                          <div className="btm-hs-imgsbg">
                            <Image
                              src={imageSrc}
                              alt="House Image"
                              width={1200}
                              height={500}
                              // className="object-cover w-100 h-auto rounded"
                            />
                          </div>
                        </Col>
                      );
                    } else {
                      // Half width image
                      return (
                        <Col sm={6} key={index}>
                          <div className="btm-hs-imgsm">
                            <Image
                              src={imageSrc}
                              alt="House Image"
                              width={600}
                              height={300}
                              // className="object-cover w-100 h-auto rounded"
                            />
                          </div>
                        </Col>
                      );
                    }
                  })
                )}
              </Row>

            </div>
            <div className="mb-5 text-center">
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.back();
                }}
                className="accomo-gobck d-inline-block mb-5"
              >
                GO BACK
              </Link>
            </div>
          </>
        )}
      </div>

      <FrontFooter />
    </div>
  );
}
