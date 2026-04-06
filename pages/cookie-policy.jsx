import React, { useEffect, useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import PulseLoader from "react-spinners/PulseLoader";
import { usePathname } from "next/navigation";

const CmsPage = () => {
  const backgroundImage = "/assets/front-images/about-slider_bg.jpg";
  const pathname = usePathname();

  const [htmlContent, setHtmlContent] = useState("");
  const [pageName, setPageName] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // Remove last segment from pathname
  const getModifiedPath = (path) => {
    if (!path) return "";
    const parts = path.split("/");
    parts.pop(); // remove last segment
    return parts.join("/") || "/";
  };

  const fetchData = async (path) => {
    try {
      const encodedPath = encodeURIComponent(path);
      const response = await api.get(`/api/v1/cms/${encodedPath}`);

      if (response.status === 200) {
        const { descr, title } = response.data.data;
        setHtmlContent(descr);
        setPageName(title);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching CMS:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const modifiedPath = getModifiedPath(pathname);
    if (modifiedPath) {
      fetchData(modifiedPath);
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="loader inner-loader" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <PulseLoader color="#36d7b7" />
      </div>
    );
  }

  if (notFound) {
    return <div className="text-center py-5">Page Not Found</div>;
  }

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section className="py-5">
        <div className="container">

          {loading ? (
            <div
              className="loader inner-loader"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px", // only content area height
              }}
            >
              <PulseLoader color="#36d7b7" />
            </div>
          ) : notFound ? (
            <div className="text-center py-5">Page Not Found</div>
          ) : (
            <>
              <div className="section-heading">
                <h1>{pageName}</h1>
              </div>

              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </>
          )}

        </div>
      </section>

      <FrontendFooter />
    </>
  );
};

export default CmsPage;