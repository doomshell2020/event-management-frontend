import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import { Eye, EyeOff, Lock, Settings, CheckCircle, XCircle, Ticket } from "lucide-react";
import { Form, Button, Modal } from "react-bootstrap";

const AssignTicket = () => {
    const router = useRouter();
    const { id } = router.query;
    const [eventDetails, setEventDetails] = useState(null);
    const [isOpenWiggins, setIsOpenWiggins] = useState(false);
    const [show, setShow] = useState(false);
    const [complimentary, setComplimentary] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const currencyName = eventDetails?.currencyName?.Currency_symbol || null;

    // Ticket form state
    const [ticketForm, setTicketForm] = useState({
        title: "",
        type: "open_sales",
        price: "",
        count: "",
        hidden: "Y",
        access_type: "",
        ticketImage: null,
    });
    const [processing, setProcessing] = useState(false);

    const [ticketId, setTicketId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setTicketForm({
            ...ticketForm,
            [name]: files && files.length > 0 ? files[0] : value,
        });
    };

    // For file input only
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTicketForm((prev) => ({
                ...prev,
                ticketImage: file,
            }));
        }
    };

    const [ticketsList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLeftRight, setIsLeftRight] = useState(false);
    const [members, setMembers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const handleGetTicketsList = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/tickets/list/${id}`);
            if (res.data.success) {
                setTicketList(res.data.data || []);
            } else {
                setTicketList([]);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });
            if (res.data.success && res.data.data.events.length > 0) {
                setEventDetails(res.data.data.events[0]);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        }
    };

    const fetchMembers = async (eventId) => {
        try {
            setLoadingMembers(true);
            const res = await api.get(`/api/v1/committee/members/list/${eventId}`);
            if (res.data.success) {
                setMembers(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchEventDetails(id);
            fetchMembers(id);
        }
    }, [id]);


    useEffect(() => {
        if (!searchText || searchText.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoadingSearch(true);
                const res = await api.get(`/api/v1/users/search?q=${searchText}`);
                if (res.data.success) {
                    setSearchResults(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingSearch(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchText]);

    const generateSingleComplimentaryTicket = async (userId, userName) => {
        try {
            // 1️⃣ Confirmation
            const result = await Swal.fire({
                title: `Generate complimentary ticket for ${userName}?`,
                text: "This will generate a free ticket and send confirmation email.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, generate",
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) return;

            // 2️⃣ Loading
            Swal.fire({
                title: "Generating ticket...",
                text: "Please wait",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            // 3️⃣ API Call
            const res = await api.post("/api/v1/tickets/generate-single-comps", {
                event_id: id,
                user_id: userId,
            });

            Swal.close();

            // 4️⃣ Success
            if (res.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Ticket Generated",
                    text: "Complimentary ticket generated and email sent successfully",
                });

                // setMembers(res.data.data);
                setSearchText("");
                setSearchResults([]);
                // 🔄 Refresh generated users list (important)
                fetchGeneratedUsers();
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Skipped",
                    text: res.data.message || "Ticket already generated for this user",
                });
            }
        } catch (err) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.message || "Failed to generate ticket",
            });
        }
    };

    const removeMember = async (memberId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to remove this member from the committee?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Removing member...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                const res = await api.delete(`/api/v1/committee/member/${memberId}`);
                Swal.close();

                if (res.data.success) {
                    setMembers(prev => prev.filter(m => m.id !== memberId));
                    Swal.fire("Removed!", "Member has been removed", "success");
                }
            } catch (err) {
                Swal.close();
                Swal.fire("Error", err.response?.data?.message || "Failed", "error");
            }
        }
    };

    const [excelFile, setExcelFile] = useState(null);

    const handleImportExcel = async (e) => {
        e.preventDefault();

        if (!id) {
            Swal.fire({
                icon: "warning",
                title: "Select Event",
                text: "Please select an event to import committee members from",
            });
            return;
        }

        if (!excelFile) {
            Swal.fire({
                icon: "warning",
                title: "Select File",
                text: "Please select an Excel file to import",
            });
            return;
        }

        const formData = new FormData();
        formData.append("uploadFiles", excelFile); // Ensure backend expects 'excel'
        formData.append("event_id", id);

        try {
            setLoading(true); // show loader

            const res = await api.post("/api/v1/tickets/import-comps", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Import Completed",
                    html: `
          ✅ Total Rows: ${res.data.data.total} <br/>
          ✅ Created Users: ${res.data.data.created_users} <br/>
          ✅ Existing Users: ${res.data.data.existing_users} <br/>
          ✅ Tickets Generated: ${res.data.data.tickets_generated} <br/>
          ⚠ Skipped Users: ${res.data.data.skipped_users || 0} <br/>
          ${res.data.data.failed.length > 0 ? `❌ Failed Rows: ${res.data.data.failed.map(f => f.row).join(', ')}` : ''}
        `,
                });

                await fetchGeneratedUsers(1);

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Import Failed",
                    text: res.data.error?.message || res.data.message || "Something went wrong",
                });
            }
        } catch (err) {
            console.error(err);

            // Try to extract meaningful server error
            const errMsg =
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                err.message ||
                "Failed to import Excel";

            Swal.fire({
                icon: "error",
                title: "Error",
                text: `❌ ${errMsg}`,
            });
        } finally {
            setLoading(false); // hide loader
        }
    };

    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");
    const showLoader = loading || processing;

    const [generatedUsers, setGeneratedUsers] = useState([]);
    // console.log('generatedUsers :', generatedUsers);
    const [loadingGeneratedUsers, setLoadingGeneratedUsers] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        total: 0
    });

    useEffect(() => {
        if (id) {
            fetchGeneratedUsers(pagination.page);
        }
    }, [id, pagination.page]);

    const fetchGeneratedUsers = async (page = 1) => {
        if (!id) return;

        try {
            setLoadingGeneratedUsers(true);

            const res = await api.get(`/api/v1/tickets/generated-users/${id}?page=${page}&limit=${pagination.limit}`);
            if (res.data.success) {
                setGeneratedUsers(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error("Error fetching generated users:", err);
        } finally {
            setLoadingGeneratedUsers(false);
        }
    };

    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteConfirm = (user) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete the complimentary ticket for ${user.first_name} ${user.last_name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteTicket(user.order_item_id);
            }
        });
    };

    const handleDeleteTicket = async (orderItemId) => {
        try {
            setDeletingId(orderItemId);

            const res = await api.delete(`/api/v1/tickets/delete-generated-comps/${orderItemId}`);

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Complimentary ticket deleted successfully',
                    timer: 2000,
                    showConfirmButton: false
                });

                fetchGeneratedUsers(pagination.page);
            }

        } catch (error) {
            console.error("Delete ticket error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error?.response?.data?.message || 'Failed to delete complimentary ticket'
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    {/* Sidebar */}
                    <EventSidebar eventId={id} />

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg">
                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Manage Tickets</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">
                                    You can manage all your tickets here.
                                </p>

                                <ul className="tabes d-flex ps-0">
                                    <li>
                                        <Link href={`/event/edit-event/${id}/manage-tickets`} className="text-16">
                                            Settings
                                        </Link>
                                    </li>
                                    {eventDetails?.is_free == 'N' ? (
                                        <>
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-addons`} className="text-16">
                                                    Addons
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-questions`} className="text-16">
                                                    Questions
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-packages`} className="text-16">
                                                    Package
                                                </Link>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li>
                                                <Link href={`/event/edit-event/${id}/assign-ticket`} className="text-16 active">
                                                    Assign Ticket
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>

                                <div className="contant_bg">
                                    {/* LOADER */}
                                    {showLoader && (
                                        <div className="text-center py-5">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            />
                                            <div className="mt-2 fw-semibold">
                                                Loading ticket distribution...
                                            </div>
                                        </div>
                                    )}

                                    {/* TABLE */}
                                    {!showLoader && (

                                        <div className="card">

                                            <div className="row ">
                                                {/* Committee Section */}
                                                <div className="col-lg-8 col-md-12">
                                                    <div className="Committee">
                                                        <h6>Users with Generated Tickets ({loadingGeneratedUsers ? "Loading..." : pagination.total})</h6>

                                                        <div className="row">
                                                            <div className="col-md-12 col-sm-8 col-8">
                                                                <div className="position-relative">
                                                                    <div className="input-group">
                                                                        <span className="input-group-text">
                                                                            <i className="bi bi-search"></i>
                                                                        </span>
                                                                        <input
                                                                            type="search"
                                                                            className="form-control"
                                                                            placeholder="Search users by name, email, mobile"
                                                                            value={searchText}
                                                                            onChange={(e) => setSearchText(e.target.value)}
                                                                            autoComplete="off"
                                                                        />

                                                                    </div>

                                                                    {/* SEARCH SUGGESTIONS */}
                                                                    {searchText.length > 1 && (
                                                                        <div
                                                                            className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                                                                            style={{ zIndex: 999, maxHeight: "260px", overflowY: "auto" }}
                                                                        >
                                                                            {loadingSearch ? (
                                                                                <div className="text-center p-2">Loading...</div>
                                                                            ) : searchResults.length == 0 ? (
                                                                                <div className="text-center p-2 text-muted">No users found</div>
                                                                            ) : (
                                                                                searchResults.map((user) => {
                                                                                    const alreadyAdded = generatedUsers.some(m => m.user_id == user.id);
                                                                                    // console.log('alreadyAdded :', alreadyAdded);
                                                                                    return (
                                                                                        <div
                                                                                            key={user.id}
                                                                                            className={`d-flex align-items-center gap-3 px-3 py-2 user-suggestion-item ${alreadyAdded ? "bg-light text-muted" : "hover-bg"}`}
                                                                                            style={{ cursor: alreadyAdded ? "not-allowed" : "pointer" }}
                                                                                            title={alreadyAdded ? "Already generated" : ""}
                                                                                        >
                                                                                            <div
                                                                                                className={`rounded-circle d-flex align-items-center justify-content-center ${alreadyAdded ? "bg-secondary text-white" : "bg-primary text-white"}`}
                                                                                                style={{ width: 36, height: 36, fontSize: 13, fontWeight: 600 }}
                                                                                            >
                                                                                                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                                                                            </div>

                                                                                            <div className="w-100 d-flex justify-content-between align-items-center">
                                                                                                <div>
                                                                                                    <div className="fw-semibold">{user.first_name} {user.last_name}</div>
                                                                                                    <small className="text-muted">{user.email} • {user.mobile}</small>
                                                                                                </div>
                                                                                                {!alreadyAdded && (
                                                                                                    <button
                                                                                                        className="btn btn-sm text-14 btn-primary"
                                                                                                        onClick={() => generateSingleComplimentaryTicket(user.id, `${user.first_name} ${user.last_name}`)}
                                                                                                    >
                                                                                                        Generate Ticket
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* <div className="col-md-2 col-sm-8 col-8">
                                                                <button
                                                                    className="btn next primery-button h-100 text-14">
                                                                    Add
                                                                </button>
                                                            </div> */}
                                                        </div>

                                                        <hr className="custom-hr" />

                                                        {/* Members Table */}
                                                        <div className="table-responsive mt-4">
                                                            <table className="table table-bordered table-striped mb-1 table-sm">
                                                                <thead className="text-white table-detail">
                                                                    <tr>
                                                                        <th>S.No.</th>
                                                                        <th>Name</th>
                                                                        <th>Email</th>
                                                                        <th className="text-center">Mobile</th>
                                                                        <th className="text-center">Ticket</th>
                                                                        <th className="text-center">Generated At</th>
                                                                        <th className="text-center">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {loadingGeneratedUsers && (
                                                                        <tr>
                                                                            <td colSpan="6" className="text-center py-5">
                                                                                <div className="spinner-border text-primary" role="status" />
                                                                                <div className="mt-2 fw-semibold">
                                                                                    Loading generated users...
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}

                                                                    {!loadingGeneratedUsers && generatedUsers.length == 0 && (
                                                                        <tr>
                                                                            <td colSpan="6" className="text-center">
                                                                                No generated users found
                                                                            </td>
                                                                        </tr>
                                                                    )}

                                                                    {!loadingGeneratedUsers &&
                                                                        generatedUsers.map((user, index) => (
                                                                            <tr key={user.order_item_id}>
                                                                                <td>
                                                                                    {(pagination.page - 1) * pagination.limit + index + 1}
                                                                                </td>
                                                                                <td>{user.first_name} {user.last_name}</td>
                                                                                <td>{user.email}</td>
                                                                                <td className="text-center">{user.mobile}</td>
                                                                                <td className="text-center">{user.ticket_title}</td>
                                                                                <td className="text-center">
                                                                                    {new Date(user.generated_at).toLocaleString()}
                                                                                </td>
                                                                                <td className="text-center">
                                                                                    <button
                                                                                        className="btn btn-sm btn-danger"
                                                                                        onClick={() => handleDeleteConfirm(user)}
                                                                                        disabled={deletingId == user.order_item_id}
                                                                                    >
                                                                                        {deletingId == user.order_item_id ? "Deleting..." : "Delete"}
                                                                                    </button>
                                                                                </td>

                                                                            </tr>
                                                                        ))
                                                                    }
                                                                </tbody>
                                                            </table>
                                                            {pagination.totalPages > 1 && (
                                                                <div className="d-flex justify-content-center mt-3 gap-2 flex-wrap">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        disabled={pagination.page == 1}
                                                                        onClick={() =>
                                                                            setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                                                                        }
                                                                    >
                                                                        Previous
                                                                    </button>

                                                                    {[...Array(pagination.totalPages)].map((_, idx) => (
                                                                        <button
                                                                            key={idx}
                                                                            className={`btn btn-sm ${pagination.page == idx + 1
                                                                                ? "btn-primary"
                                                                                : "btn-outline-primary"
                                                                                }`}
                                                                            onClick={() =>
                                                                                setPagination(prev => ({ ...prev, page: idx + 1 }))
                                                                            }
                                                                        >
                                                                            {idx + 1}
                                                                        </button>
                                                                    ))}

                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        disabled={pagination.page == pagination.totalPages}
                                                                        onClick={() =>
                                                                            setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                                                                        }
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            )}

                                                        </div>

                                                    </div>
                                                </div>

                                                {/* Import Committee Section */}
                                                <div className="col-lg-4 col-md-12">
                                                    <div className="import_committee">
                                                        <h6 className="mt-1">Import Users List</h6>

                                                        <a
                                                            href="/uploads/excel/import-users-template.xlsx"
                                                            download
                                                            className="btn btn-outline-success btn-sm mb-2"
                                                        >
                                                            ⬇️ Download Excel Template
                                                        </a>

                                                        <form
                                                            className="row g-3 align-items-center"
                                                            onSubmit={handleImportExcel}
                                                        >
                                                            <div className="col-12">
                                                                <div className="input-group">
                                                                    <div className="input-group-text">
                                                                        <i className="bi bi-file-earmark-excel"></i>
                                                                    </div>

                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        accept=".xlsx,.xls"
                                                                        onChange={(e) => setExcelFile(e.target.files[0])}
                                                                        required
                                                                    />
                                                                </div>

                                                                <small className="text-muted">
                                                                    Upload Excel (.xlsx / .xls) – Do not change headers
                                                                </small>
                                                            </div>

                                                            <div className="col-12">
                                                                <button
                                                                    type="submit"
                                                                    className="btn save next primery-button fw-normal w-100"
                                                                    disabled={loading}
                                                                >
                                                                    {loading ? "Importing & Generating Tickets... ⏳" : "Import Users & Generate Tickets"}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                    )}

                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

        </>
    );
};

export default AssignTicket;
