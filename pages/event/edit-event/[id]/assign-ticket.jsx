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

    const addMember = async (userId, userName) => {
        // console.log('>>>>>>>>>>>>',id);
        // return false

        try {
            const result = await Swal.fire({
                title: `Add ${userName} to the committee?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, add",
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) return;

            Swal.fire({
                title: 'Adding member...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await api.post(`/api/v1/committee/member/add-member`, {
                event_id: id,
                user_id: userId,
            });

            Swal.close();

            if (res.data.success) {
                setMembers(res.data.data);
                setSearchText("");
                setSearchResults([]);
                Swal.fire("Success", "Member added successfully", "success");
            }
        } catch (err) {
            Swal.close();
            Swal.fire("Error", err.response?.data?.message || "Failed", "error");
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

    const handleImportExcel = async (e) => {
        e.preventDefault();
        return false

        if (!selectedImportEvent) {
            Swal.fire({
                icon: "warning",
                title: "Select Event",
                text: "Please select an event to import committee members from"
            });
            return;
        }

        try {
            // 🔄 Show loading swal
            Swal.fire({
                title: "Importing committee members...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const payload = {
                from_event_id: selectedImportEvent.id,
                to_event_id: id // 🔥 current event id
            };

            const res = await api.post(
                "/api/v1/committee/import-committee-members",
                payload
            );

            Swal.close();

            if (res.data.success) {
                await fetchMembers(id);
                Swal.fire({
                    icon: "success",
                    title: "Imported Successfully",
                    text: `${res.data.data.imported} committee members imported`
                });

                // Optional: reset state
                setEventSearchText("");
                setSelectedImportEvent(null);
                setIsEventSelected(false);

            } else {
                Swal.fire({
                    icon: "info",
                    title: "No Changes",
                    text: res.data.message || "Nothing to import"
                });
            }

        } catch (error) {
            Swal.close();
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Import Failed",
                text: "Something went wrong while importing committee members"
            });
        }
    };

    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");
    const showLoader = loading || processing;

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
                                                        <h6>Current Users ({loadingMembers ? "Loading..." : members.length})</h6>

                                                        <div className="row">
                                                            <div className="col-md-10 col-sm-8 col-8">
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
                                                                                    const alreadyAdded = members.some(m => m.user.id == user.id);
                                                                                    return (
                                                                                        <div
                                                                                            key={user.id}
                                                                                            className={`d-flex align-items-center gap-3 px-3 py-2 user-suggestion-item ${alreadyAdded ? "bg-light text-muted" : "hover-bg"}`}
                                                                                            style={{ cursor: alreadyAdded ? "not-allowed" : "pointer" }}
                                                                                            title={alreadyAdded ? "Already added" : ""}
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
                                                                                                        onClick={() => addMember(user.id, `${user.first_name} ${user.last_name}`)}
                                                                                                    >
                                                                                                        Add
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
                                                            <div className="col-md-2 col-sm-8 col-8">
                                                                <button
                                                                    className="btn next primery-button h-100 text-14">
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <hr className="custom-hr" />
                                                        {/* Members Table with Serial Number */}
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered table-striped mb-1 table-sm">

                                                                <thead className="text-white table-detail">
                                                                    <tr>
                                                                        <th >S.No.</th>
                                                                        <th >Name</th>
                                                                        <th >Email</th>
                                                                        <th className="text-center">Mobile</th>
                                                                        <th className="text-center">Status</th>
                                                                        <th className="text-center">Remove</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {/* LOADER */}
                                                                    {loadingMembers && (
                                                                        <tr>
                                                                            <td colSpan="6" className="text-center py-5">
                                                                                <div
                                                                                    className="spinner-border text-primary"
                                                                                    role="status"
                                                                                />
                                                                                <div className="mt-2 fw-semibold">
                                                                                    Loading...
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}

                                                                    {/* NO DATA */}
                                                                    {!loadingMembers && members.length == 0 && (
                                                                        <tr>
                                                                            <td colSpan="6" className="text-center">
                                                                                No members found
                                                                            </td>
                                                                        </tr>
                                                                    )}

                                                                    {/* DATA */}
                                                                    {!loadingMembers &&
                                                                        members.map((member, index) => (
                                                                            <tr key={member.id}>
                                                                                <td>{index + 1}</td>
                                                                                <td>
                                                                                    {member.user.first_name} {member.user.last_name}
                                                                                </td>
                                                                                <td>{member.user.email}</td>
                                                                                <td className="text-center">
                                                                                    {member.user.mobile}
                                                                                </td>

                                                                                <td className="text-center">
                                                                                    <div className="form-check form-switch p-0 text-center m-0 d-flex justify-content-center">
                                                                                        <input
                                                                                            className="form-check-input m-0"
                                                                                            type="checkbox"
                                                                                            style={{ minWidth: "40px" }}
                                                                                            id={`statusSwitch-${member.id}`}
                                                                                            checked={member.status == "Y"}
                                                                                            onChange={async () => {
                                                                                                try {
                                                                                                    Swal.fire({
                                                                                                        title: "Updating status...",
                                                                                                        allowOutsideClick: false,
                                                                                                        didOpen: () => {
                                                                                                            Swal.showLoading();
                                                                                                        },
                                                                                                    });

                                                                                                    const res = await api.put(
                                                                                                        `/api/v1/committee/member/status/${member.id}`,
                                                                                                        {
                                                                                                            status: member.status == "Y" ? "N" : "Y",
                                                                                                        }
                                                                                                    );

                                                                                                    Swal.close();

                                                                                                    if (res.data.success) {
                                                                                                        setMembers((prev) =>
                                                                                                            prev.map((m) =>
                                                                                                                m.id == member.id
                                                                                                                    ? {
                                                                                                                        ...m,
                                                                                                                        status: m.status == "Y" ? "N" : "Y",
                                                                                                                    }
                                                                                                                    : m
                                                                                                            )
                                                                                                        );

                                                                                                        Swal.fire(
                                                                                                            "Success",
                                                                                                            "Status updated successfully",
                                                                                                            "success"
                                                                                                        );
                                                                                                    }
                                                                                                } catch (err) {
                                                                                                    Swal.close();
                                                                                                    Swal.fire(
                                                                                                        "Error",
                                                                                                        err.response?.data?.message ||
                                                                                                        "Failed to update status",
                                                                                                        "error"
                                                                                                    );
                                                                                                }
                                                                                            }}
                                                                                        />

                                                                                    </div>
                                                                                </td>

                                                                                <td className="text-center">
                                                                                    <button
                                                                                        className="btn btn-sm btn-danger"
                                                                                        onClick={() => removeMember(member.id)}
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                </tbody>


                                                            </table>
                                                        </div>

                                                    </div>
                                                </div>

                                                {/* Import Committee Section */}
                                                <div className="col-lg-4 col-md-12">
                                                    <div className="import_committee">
                                                        <h6 className="mt-1">Import Users List</h6>
                                                        <form className="row g-3 align-items-center" onSubmit={handleImportExcel} >

                                                            <div className="col-12">
                                                                <div className="input-group">

                                                                    <div className="input-group-text">
                                                                        <i className="bi bi-search"></i>
                                                                    </div>

                                                                    <div className="position-relative">
                                                                        <input
                                                                            type="file"
                                                                            placeholder="Search Events by name"
                                                                            className="form-control eventserach"

                                                                            autoComplete="off"
                                                                        />

                                                                    </div>


                                                                </div>
                                                            </div>

                                                            <div className="col-12">
                                                                <button type="submit" className="btn save next primery-button fw-normal w-100">
                                                                    Import
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
