import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/utils/api";

import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import EventSidebar from "@/pages/components/Event/EventSidebar";
import { Eye, EyeOff, Settings, CheckCircle, XCircle, Package } from "lucide-react";
import { Form, Button, Modal } from "react-bootstrap";
import EventHeaderSection from "@/pages/components/Event/EventProgressBar";

const ManagePackages = () => {
    const router = useRouter();
    const { id } = router.query;

    const [show, setShow] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const [show2, setShow2] = useState(false);
    const [openDropdown2, setOpenDropdown2] = useState(null);
    const [packageId, setPackageId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [eventDetails, setEventDetails] = useState(null);
    const [ticketsList, setTicketList] = useState([]);
    const [addonsList, setAddonsList] = useState([]);
    const [packageList, setPackageList] = useState([]);
    // console.log('>>>>>>',packageList);

    // fetch addons list
    const handleGetPackagesList = async () => {
        try {
            setLoading(true);
            const res = await api.get(`api/v1/packages/list?event_id=${id}`);
            // console.log('>>>>>>>>>>>',res.data);

            if (res.data.success) {
                setPackageList(res.data.data || []);
            } else {
                setPackageList([]);
            }
        } catch (err) {
            console.error("Error fetching package:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEventDetails = async (eventId) => {
        try {
            const res = await api.post(`/api/v1/events/event-list`, { id: eventId });

            if (res.data.success && res.data.data.events.length > 0) {
                const event = res.data.data.events[0];
                setEventDetails(event);
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
        }
    };

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
    // fetch addons list
    const handleGetAddonsList = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/addons/list/${id}`);
            if (res.data.success) {
                setAddonsList(res.data.data || []);
            } else {
                setAddonsList([]);
            }
        } catch (err) {
            console.error("Error fetching addons:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return; // ensure id exists before calling

        const fetchAllData = async () => {
            try {
                setLoading(true);

                // Run all requests in parallel for efficiency
                const [packagesRes, eventRes, addonsRes, ticketsRes] = await Promise.all([
                    api.get(`/api/v1/packages/list?event_id=${id}`),
                    api.post(`/api/v1/events/event-list`, { id }),
                    api.get(`/api/v1/addons/list/${id}`),
                    api.get(`/api/v1/tickets/list/${id}`)
                ]);

                // ✅ Handle packages
                if (packagesRes.data.success) {
                    setPackageList(packagesRes.data.data || []);
                } else {
                    setPackageList([]);
                }

                // ✅ Handle event details
                if (eventRes.data.success && eventRes.data.data.events.length > 0) {
                    setEventDetails(eventRes.data.data.events[0]);
                }

                // ✅ Handle addons
                if (addonsRes.data.success) {
                    setAddonsList(addonsRes.data.data || []);
                } else {
                    setAddonsList([]);
                }

                // ✅ Handle tickets
                if (ticketsRes.data.success) {
                    setTicketList(ticketsRes.data.data || []);
                } else {
                    setTicketList([]);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    const [packageForm, setPackageForm] = useState({
        name: "",
        package_limit: "",
        hidden: "N",
        ticketQty: {},
        addonQty: {},
        total: 0,
        discount_amt: 0,
        grandtotal: 0,
        visibility: "",
    });


    // ✅ Auto calculate totals on qty/discount change
    useEffect(() => {
        const ticketTotal = ticketsList.reduce(
            (acc, t) => acc + (packageForm.ticketQty?.[t.id] || 0) * t.price,
            0
        );
        const addonTotal = addonsList.reduce(
            (acc, a) => acc + (packageForm.addonQty?.[a.id] || 0) * a.price,
            0
        );

        const total = ticketTotal + addonTotal;
        const discount = parseFloat(packageForm.discount || 0);
        const grandTotal = Math.max(total - discount, 0);

        setPackageForm((prev) => ({
            ...prev,
            total,
            discount_amt: discount,
            grandtotal: grandTotal,
        }));
    }, [packageForm.ticketQty, packageForm.addonQty, packageForm.discount, ticketsList, addonsList]);


    const [errorMessage, setErrorMessage] = useState("");
    const [validateDefault, setValidateDefault] = useState(false);

    const handleCreatePackage = async (e) => {
        e.preventDefault();
        setValidateDefault(true);
        setErrorMessage("");

        // ✅ Basic validation
        if (!packageForm.name || !packageForm.limit) {
            setErrorMessage("Please fill all required fields before submitting.");
            return;
        }

        try {
            setIsSubmitting(true);

            // ✅ Combine ticketQty and addonQty into ticketType array
            const ticketTypes = [];

            // Tickets
            Object.entries(packageForm.ticketQty || {}).forEach(([id, count]) => {
                if (count > 0) {
                    ticketTypes.push({
                        id: Number(id),
                        type: "ticket",
                        count: Number(count),
                    });
                }
            });

            // Addons
            Object.entries(packageForm.addonQty || {}).forEach(([id, count]) => {
                if (count > 0) {
                    ticketTypes.push({
                        id: Number(id),
                        type: "addon",
                        count: Number(count),
                    });
                }
            });


            // ✅ Final payload
            const payload = {
                event_id: Number(id),
                name: packageForm.name,
                package_limit: Number(packageForm.limit),
                total: Number(packageForm.total) || 0,
                discount_amt: Number(packageForm.discount_amt) || 0,
                grandtotal: Number(packageForm.grandtotal) || 0,
                hidden: packageForm.hidden || "N",
                ticketType: ticketTypes,
            };
            // console.log('?????????????',payload);return false

            const res = await api.post(`/api/v1/packages/create`, payload);

            if (res.data.success) {
                Swal.fire("Success", "Package created successfully!", "success");
                setShow(false);
                handleGetPackagesList();
                setPackageForm({
                    name: "",
                    package_limit: "",
                    hidden: "N",
                    ticketQty: {},
                    addonQty: {},
                    total: 0,
                    discount_amt: 0,
                    grandtotal: 0,
                    visibility: "",
                });
            } else {
                setErrorMessage(res.data.message || "Failed to create package");
            }
        } catch (err) {
            console.error("Error creating package:", err);
            setErrorMessage(
                err.response?.data?.error?.message || "Something went wrong!"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePackage = async (e) => {
        e.preventDefault();
        setValidateDefault(true); // ✅ ensures Bootstrap “was-validated” styling activates

        if (!packageForm.name || !packageForm.limit || !packageForm.visibility) return;

        setIsSubmitting(true);
        try {
            const payload = {
                name: packageForm.name,
                package_limit: Number(packageForm.limit),
                hidden: packageForm.visibility || "N",
            };

            const res = await api.put(`/api/v1/packages/update/${packageId}`, payload);

            if (res.data.success) {
                Swal.fire("Updated!", "Package details updated successfully.", "success");
                setShow2(false);
                handleGetPackagesList();
            } else {
                Swal.fire("Error", res.data.message || "Failed to update package.", "error");
            }
        } catch (err) {
            console.error("Error updating package:", err);
            Swal.fire("Error", "Something went wrong!", "error");
        } finally {
            setIsSubmitting(false);
        }
    };


    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

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

                                <h4 className="text-24">Manage Packages</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">
                                    You can manage all your packages here.
                                </p>

                                <div className="row align-items-baseline">
                                    <div className="col-md-7">
                                        <ul className="tabes d-flex ps-0">
                                            <li>
                                                <Link href={`/event/edit-event/${id}/manage-tickets`} className="text-16">
                                                    Settings
                                                </Link>
                                            </li>
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
                                                <Link href={`/event/edit-event/${id}/manage-packages`} className="active text-16">
                                                    Package
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-md-5 text-end">
                                        <button
                                            className="primery-button fw-normal px-2 text-white"
                                            style={{ backgroundColor: "#00ad00" }}
                                            onClick={() => setShow(true)}
                                        >
                                            <i className="bi bi-plus"></i> Create Package
                                        </button>

                                    </div>
                                </div>

                                <div className="contant_bg mt-4">
                                    <h6 className="fw-bold text-uppercase">Packages</h6>
                                    <hr className="custom-hr" />

                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 mb-0 text-muted">Fetching Packages...</p>
                                        </div>
                                    ) : packageList.length == 0 ? (
                                        <p className="text-muted fst-italic text-center">No packages found for this event.</p>
                                    ) : (
                                        <div className="row g-3">
                                            {packageList.map((pkg) => (
                                                <div key={pkg.id} className="col-md-12">
                                                    <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                                                        <div className="card-body p-3">

                                                            {/* ===== Header ===== */}
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div>
                                                                    <h5 className="fw-bold mb-1 text-primary">{pkg.name}</h5>
                                                                    <small className="text-muted">
                                                                        Limit: <strong>{pkg.package_limit}</strong>
                                                                    </small>
                                                                </div>
                                                                <div className="text-end">
                                                                    <span
                                                                        className={`badge ${pkg.hidden == "Y" ? "bg-danger" : "bg-success"} rounded-pill`}
                                                                    >
                                                                        {pkg.hidden == "Y" ? "Hidden" : "Visible"}
                                                                    </span>

                                                                    {/* Dropdown */}
                                                                    <div className="dropdown d-inline-block ms-2">
                                                                        <button
                                                                            className="btn btn-sm btn-light border rounded-circle"
                                                                            onClick={() =>
                                                                                setOpenDropdown(openDropdown === pkg.id ? null : pkg.id)
                                                                            }
                                                                        >
                                                                            <Settings size={16} />
                                                                        </button>

                                                                        {openDropdown == pkg.id && (
                                                                            <ul
                                                                                className="dropdown-menu show position-absolute end-0 mt-1 shadow-sm"
                                                                                style={{
                                                                                    zIndex: 999,
                                                                                    width: "max-content",
                                                                                    left: "-129px",
                                                                                }}
                                                                            >
                                                                                <li>
                                                                                    <button
                                                                                        title="Edit"
                                                                                        className="dropdown-item"
                                                                                        style={{

                                                                                            borderBottom: "1px solid #bdbdbd"
                                                                                        }}
                                                                                        onClick={() => {
                                                                                            setPackageId(pkg.id);
                                                                                            setPackageForm({
                                                                                                ...packageForm,
                                                                                                name: pkg.name || "",
                                                                                                limit: pkg.package_limit || "",
                                                                                                visibility: pkg.hidden || "N",
                                                                                            });
                                                                                            setShow2(true);
                                                                                            setOpenDropdown(null);
                                                                                        }}
                                                                                    >
                                                                                        ✏️
                                                                                    </button>
                                                                                </li>

                                                                                <li>
                                                                                    <button
                                                                                        className="dropdown-item"
                                                                                        title={pkg.hidden == "Y" ? "👁 Show Package" : "🚫 Hide Package"}
                                                                                        style={{

                                                                                            borderBottom: "1px solid #bdbdbd"
                                                                                        }}
                                                                                        onClick={() => {
                                                                                            const newHidden = pkg.hidden == "Y" ? "N" : "Y";
                                                                                            api
                                                                                                .put(`/api/v1/packages/update/${pkg.id}`, {
                                                                                                    hidden: newHidden,
                                                                                                })
                                                                                                .then(() => {
                                                                                                    Swal.fire({
                                                                                                        icon: "success",
                                                                                                        title:
                                                                                                            newHidden == "Y"
                                                                                                                ? "Package Hidden"
                                                                                                                : "Package Visible",
                                                                                                        timer: 1200,
                                                                                                        showConfirmButton: false,
                                                                                                    });
                                                                                                    handleGetPackagesList();
                                                                                                })
                                                                                                .catch(() =>
                                                                                                    Swal.fire(
                                                                                                        "Error",
                                                                                                        "Failed to update visibility.",
                                                                                                        "error"
                                                                                                    )
                                                                                                );
                                                                                            setOpenDropdown(null);
                                                                                        }}
                                                                                    >
                                                                                        {pkg.hidden == "Y" ? "👁 Show Package" : "🚫 Hide Package"}
                                                                                    </button>
                                                                                </li>
                                                                            </ul>

                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* ===== Totals Section ===== */}
                                                            <div className="mt-2 small text-muted">
                                                                <div>
                                                                    <strong>Discount:</strong> ₹{pkg.discount_amt || 0}
                                                                </div>
                                                                <div>
                                                                    <strong>Grand Total:</strong>{" "}
                                                                    <span className="text-dark fw-bold">₹{pkg.grandtotal}</span>
                                                                </div>
                                                            </div>

                                                            {/* ===== Tickets & Addons Table ===== */}
                                                            <div className="mt-3 border-top pt-2">
                                                                <h6 className="fw-semibold text-secondary mb-2">Items</h6>
                                                                <div className="table-responsive">
                                                                    <table className="table table-sm align-middle mb-0">
                                                                        <thead className="table-light text-center small">
                                                                            <tr>
                                                                                <th>#</th>
                                                                                <th>Type</th>
                                                                                <th>Name</th>
                                                                                <th>Qty</th>
                                                                                <th>Price</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="text-center small">
                                                                            {pkg.details && pkg.details.length > 0 ? (
                                                                                pkg.details.map((item, index) => {
                                                                                    const isTicket = !!item.ticketType;
                                                                                    const data = isTicket ? item.ticketType : item.addonType;
                                                                                    return (
                                                                                        <tr key={item.id}>
                                                                                            <td>{index + 1}</td>
                                                                                            <td>{isTicket ? "Ticket" : "Addon"}</td>
                                                                                            <td className="text-truncate" style={{ maxWidth: "120px" }}>
                                                                                                {data?.title || data?.name || "-"}
                                                                                            </td>
                                                                                            <td>{item.qty}</td>
                                                                                            <td>₹{data?.price || 0}</td>
                                                                                        </tr>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan="5" className="text-muted text-center">
                                                                                        No items found
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
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

            <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{packageForm?.id ? "Edit Package" : "Create Package"}</Modal.Title>
                </Modal.Header>
                {/* Error message */}
                {errorMessage && (
                    <div className="alert alert-danger py-2 mt-2 mb-0">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {errorMessage}
                    </div>
                )}
                <Modal.Body>
                    <Form
                        id="packageForm"
                        noValidate
                        onSubmit={handleCreatePackage}
                        className={validateDefault ? "was-validated" : ""}>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <Form.Label>Package Name:</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Enter Package Name"
                                    value={packageForm?.name || null}
                                    onChange={(e) =>
                                        setPackageForm({ ...packageForm, name: e.target.value })
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter a package name.
                                </Form.Control.Feedback>
                            </div>

                            <div className="col-md-3">
                                <Form.Label>Package Limit:</Form.Label>
                                <Form.Select
                                    required
                                    value={packageForm?.limit || ""}
                                    onChange={(e) =>
                                        setPackageForm({ ...packageForm, limit: e.target.value })
                                    }
                                >
                                    <option value="">--Select Limit--</option>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please select a limit.
                                </Form.Control.Feedback>
                            </div>

                            <div className="col-md-3">
                                <Form.Label>Visibility:</Form.Label>
                                <Form.Select
                                    required
                                    value={packageForm?.visibility || ""}
                                    onChange={(e) =>
                                        setPackageForm({ ...packageForm, visibility: e.target.value })
                                    }
                                >
                                    <option value="">Choose One</option>
                                    <option value="Y">Visible</option>
                                    <option value="N">Hidden</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please select visibility.
                                </Form.Control.Feedback>
                            </div>
                        </div>

                        {/* Tickets Table */}
                        <table className="table table-bordered align-middle text-center">
                            <thead className="bg-primary">
                                <tr>
                                    <th>S.No</th>
                                    <th>Ticket Type</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticketsList.map((ticket, index) => (
                                    <tr key={ticket.id}>
                                        <td>{index + 1}</td>
                                        <td>{ticket.title}</td>
                                        <td>{ticket.price}</td>
                                        <td>
                                            <Form.Select
                                                style={{ width: "100px", margin: "auto" }}
                                                value={packageForm.ticketQty?.[ticket.id] ?? ""}
                                                onChange={(e) => {
                                                    const qty = parseInt(e.target.value) || 0;
                                                    setPackageForm((prev) => ({
                                                        ...prev,
                                                        ticketQty: {
                                                            ...prev.ticketQty,
                                                            [ticket.id]: qty,
                                                        },
                                                    }));
                                                }}
                                            >
                                                <option value="">Select</option>
                                                {[...Array(11).keys()].map((n) => (
                                                    <option key={n} value={n}>
                                                        {n}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </td>

                                        <td>
                                            {(
                                                (packageForm.ticketQty?.[ticket.id] || 0) * ticket.price
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}

                                {/* Addons Header */}
                                {addonsList.length > 0 && (
                                    <tr className="bg-light">
                                        <td colSpan="5" className="text-start fw-bold">
                                            Addons
                                        </td>
                                    </tr>
                                )}

                                {/* Addons List */}
                                {addonsList.map((addon, index) => (
                                    <tr key={addon.id}>
                                        <td>{ticketsList.length + index + 1}</td>
                                        <td>{addon.name}</td>
                                        <td>{addon.price}</td>
                                        <td>
                                            <Form.Select
                                                style={{ width: "100px", margin: "auto" }}
                                                value={packageForm.addonQty?.[addon.id] ?? ""}
                                                onChange={(e) => {
                                                    const qty = parseInt(e.target.value) || 0;
                                                    setPackageForm((prev) => ({
                                                        ...prev,
                                                        addonQty: {
                                                            ...prev.addonQty,
                                                            [addon.id]: qty,
                                                        },
                                                    }));
                                                }}
                                            >
                                                <option value="">Select</option>
                                                {[...Array(11).keys()].map((n) => (
                                                    <option key={n} value={n}>
                                                        {n}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </td>

                                        <td>
                                            {(
                                                (packageForm.addonQty?.[addon.id] || 0) * addon.price
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        {(() => {
                            const ticketTotal = ticketsList.reduce(
                                (acc, t) =>
                                    acc + (packageForm.ticketQty?.[t.id] || 0) * t.price,
                                0
                            );
                            const addonTotal = addonsList.reduce(
                                (acc, a) => acc + (packageForm.addonQty?.[a.id] || 0) * a.price,
                                0
                            );
                            const total = ticketTotal + addonTotal;
                            const discount = parseFloat(packageForm.discount || 0);
                            const grandTotal = Math.max(total - discount, 0);

                            return (
                                <table className="table table-borderless text-end">
                                    <tbody>
                                        <tr>
                                            <td className="fw-bold text-start ps-2">Total</td>
                                            <td className="fw-bold pe-3">${total.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold text-start ps-2">Discount</td>
                                            <td className="pe-3">
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    style={{ width: "100px", display: "inline-block" }}
                                                    value={packageForm.discount || ""}
                                                    onChange={(e) =>
                                                        setPackageForm({
                                                            ...packageForm,
                                                            discount: e.target.value,
                                                        })
                                                    }
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold text-start ps-2">Grand Total</td>
                                            <td className="fw-bold pe-3">
                                                ${grandTotal.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            );
                        })()}

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShow(false)}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                form="packageForm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save Package"}
                            </Button>

                        </Modal.Footer>
                    </Form>
                </Modal.Body>

            </Modal>

            {/* ==================== Edit Package Details Modal ==================== */}
            <Modal show={show2} onHide={() => setShow2(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Update Package Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form
                        id="editPackageForm"
                        noValidate
                        onSubmit={handleUpdatePackage}
                        className={validateDefault ? "was-validated" : ""}
                    >
                        {/* Package Name */}
                        <div className="mb-3">
                            <Form.Label>
                                Package Name: <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                required
                                placeholder="Enter Package Name"
                                value={packageForm.name || ""}
                                onChange={(e) =>
                                    setPackageForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter package name.
                            </Form.Control.Feedback>
                        </div>

                        {/* Package Limit */}
                        <div className="mb-3">
                            <Form.Label>
                                Package Limit: <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                required
                                value={packageForm.limit || ""}
                                onChange={(e) =>
                                    setPackageForm((prev) => ({ ...prev, limit: e.target.value }))
                                }
                            >
                                <option value="">--Select Limit--</option>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please select a package limit.
                            </Form.Control.Feedback>
                        </div>

                        {/* Visibility */}
                        <div className="mb-3">
                            <Form.Label>
                                Visibility: <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                required
                                value={packageForm.visibility || ""}
                                onChange={(e) =>
                                    setPackageForm((prev) => ({ ...prev, visibility: e.target.value }))
                                }
                            >
                                <option value="">Choose One</option>
                                <option value="Y">Visible</option>
                                <option value="N">Hidden</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please select visibility.
                            </Form.Control.Feedback>
                        </div>

                        {/* Footer Buttons */}
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShow2(false)}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Updating..." : "Update Package"}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>



        </>
    );
};

export default ManagePackages;
