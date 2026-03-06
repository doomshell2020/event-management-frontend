import React, { useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import Swal from "sweetalert2";
import { useRouter } from 'next/router';



const EditCompanyPage = () => {
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const router = useRouter();
    const companyId = router.query.id || "";
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!companyId) return;

        const fetchCompanyData = async () => {
            try {
                const { data } = await api.get(
                    `/api/v1/company/detail/${companyId}`
                );

                if (!data?.success || !data?.data) {
                    console.error("Invalid API response:", data);
                    return;
                }

                // ✅ company object directly in data.data
                setName(data.data.name ?? "");
            } catch (error) {
                console.error("Error fetching company data:", error);
            }
        };

        fetchCompanyData();
    }, [companyId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);

        try {
            const body = {
                name: name, // 👈 important
            };
            const response = await api.put(
                `/api/v1/company/update/${companyId}`,
                body
            );
            const resData = response.data;
            if (resData?.success) {
                Swal.fire(
                    "Success",
                    resData?.message || "Company updated successfully!",
                    "success"
                );

                router.push("/company"); // 👈 company list page
            }
        } catch (error) {
            console.error("Submit Error:", error);
            Swal.fire("Error", "Something went wrong", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="post-eventpg" className="my-4">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="d-flex justify-content-between post-event-topprt align-items-center">
                                <div className="top_h w-100">
                                    <p className="des_h mb-0">Update Company</p>
                                </div>
                            </div>

                            <div className="form-deta bg-white mt-3 mb-4 pb-3 rounded custom-shadow">

                                {/* -------------------- TITLE -------------------- */}
                                <h2 className="text-16 text-white text-uppercase position-relative text-start fw-bold">
                                    <i className="far fa-calendar-plus"></i> Update Company
                                </h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="inner-formdeta p-4 text-start fs-6 fw-normal">
                                        <h4 className="fw-bold mb-4">Company Info</h4>
                                        <div className="resistor-content">
                                            <div className="row align-items-end">
                                                {/* Company Name */}
                                                <div className="col-lg-4 col-md-6 mb-3">
                                                    <label className="form-label">
                                                        Company Name <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-0"
                                                        name="name"
                                                        placeholder="Enter company name"
                                                        required
                                                        value={name}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(
                                                                /[~!@$%^&*()_+=\\|/?`{}[\];:'",.<>\s]/g,
                                                                " "
                                                            );
                                                            setName(value);
                                                        }}
                                                    />
                                                </div>

                                                {/* Button */}
                                                <div className="col-lg-2 col-md-3 mb-3">
                                                    <button
                                                        type="submit"
                                                        className="primery-button w-100"
                                                        disabled={isLoading}
                                                        style={{ height: "38px" }}
                                                    >
                                                        {isLoading ? "Updating..." : "Update"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
            <FrontendFooter />
        </>
    );
};

export default EditCompanyPage;
