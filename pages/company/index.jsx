import React, { useMemo, useState, useRef, useEffect } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import Link from "next/link";
import Swal from "sweetalert2";
import { format } from "date-fns"; // helps format dates
import api from "@/utils/api";
import EventSidebar from "../components/Event/EventSidebar";

export default function Companies({ userId }) {
    const [companies, setCompanies] = useState([]);
    const [backgroundImage, setIsMobile] = useState('/assets/front-images/about-slider_bg.jpg');
    const [loading, setLoading] = useState(true); // ✅ Added loading state

    // ✅ Fetch events by organizer
    const fetchCompanies = async () => {
        setLoading(true); // start loading
        try {
            const res = await api.get(`/api/v1/company/list`);
            if (res.data.success) {
                setCompanies(res.data.data.companies || []);
            } else {
                setCompanies([]);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setCompanies([]);
        } finally {
            setLoading(false); // stop loading after API call
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [userId]);

    const handleDelete = async (companyId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the company.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            // Loading popup
            Swal.fire({
                title: "Deleting...",
                text: "Please wait while the company is being deleted.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await api.delete(
                `/api/v1/company/delete/${companyId}`
            );

            const resData = response.data;

            if (resData?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "The company has been deleted successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                // ✅ Refresh company list
                fetchCompanies();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: resData?.message || "Failed to delete the company.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Oops!",
                text:
                    error?.response?.data?.message ||
                    "Something went wrong. Please try again later.",
            });
        }
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">

                <div className="d-flex">

                    {/* Left Menu */}
                    <EventSidebar />

                    <div className="event-righcontent">
                        <h4>Manage Companies</h4>
                        <hr
                            style={{
                                borderColor: "currentColor",
                            }}
                        />

                        <div className="desbord-content">
                            <div className="my-ticket-box">
                                <div className="event-list">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0 table-mobile-width">
                                            <thead className="table-dark table_bg">
                                                <tr>
                                                    <th style={{ width: "5%" }} scope="col">#</th>
                                                    <th style={{ width: "25%" }} scope="col">Company Name</th>
                                                    <th style={{ width: "20%" }} scope="col">Created On</th>
                                                    <th style={{ width: "15%" }} scope="col">Status</th>
                                                    <th style={{ width: "15%" }} scope="col">Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {/* Loader / Data / No Data */}
                                                {loading ? (
                                                    // ✅ Loader
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <div className="spinner-border text-primary" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                            <div className="mt-2">Loading companies...</div>
                                                        </td>
                                                    </tr>
                                                ) : companies && companies.length > 0 ? (
                                                    // ✅ Data Rows
                                                    companies.map((event, index) => {
                                                        return (
                                                            <tr key={event.id}>
                                                                <th scope="row">{index + 1}</th>

                                                                {/* Company / Event Name */}
                                                                <td>{event.name}</td>

                                                                {/* Start Date */}
                                                                <td>
                                                                    {event?.created
                                                                        ? format(new Date(event.created), "EEE, dd MMM yyyy")
                                                                        : "N/A"}
                                                                </td>

                                                                <td>
                                                                    <span
                                                                        style={{
                                                                            fontSize: "12px",
                                                                            fontWeight: "600",
                                                                            color: event?.status === "Y" ? "#198754" : "#dc3545",
                                                                        }}
                                                                    >
                                                                        {event?.status === "Y" ? "Active" : "Inactive"}
                                                                    </span>
                                                                </td>

                                                                {/* Actions */}
                                                                <td className="Con_center">
                                                                    <div
                                                                        className="d-flex"
                                                                        style={{ gap: "6px", justifyContent: "center" }}
                                                                    >
                                                                        <Link
                                                                            href={`/company/edit/${event.id}`}
                                                                            style={{
                                                                                width: "80px",
                                                                                height: "30px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                gap: "6px",
                                                                                backgroundColor: "#0d6efd",
                                                                                color: "#fff",
                                                                                borderRadius: "4px",
                                                                                textDecoration: "none",
                                                                                fontSize: "14px",
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-edit"></i>
                                                                            Edit
                                                                        </Link>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDelete(event.id)}
                                                                            style={{
                                                                                width: "80px",
                                                                                height: "30px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                gap: "6px",
                                                                                backgroundColor: "#dc3545",
                                                                                color: "#fff",
                                                                                borderRadius: "4px",
                                                                                border: "none",
                                                                                fontSize: "14px",
                                                                                cursor: "pointer",
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-trash"></i>
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    // ✅ No Data Found
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <div className="mt-2 fw-bold text-muted">
                                                                No Events Found
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>

                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <FrontendFooter />

        </>
    )
}