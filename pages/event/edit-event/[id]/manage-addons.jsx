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

const ManageAddons = () => {
    const router = useRouter();
    const { id } = router.query;

    const [show, setShow] = useState(false);
    const [addonId, setAddonId] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpenWiggins, setIsOpenWiggins] = useState(false);
    const [eventDetails, setEventDetails] = useState(null);

    const [addonForm, setAddonForm] = useState({
        name: "",
        price: "",
        count: "",
        visibility: "Y",
        description: "",
        image: null,
    });

    const [addonsList, setAddonsList] = useState([]);
    const [validateDefault, setValidateDefault] = useState(false);

    // handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddonForm({
            ...addonForm,
            [name]: value,
        });
    };

    // handle file change separately
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAddonForm((prev) => ({ ...prev, image: file }));
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

    useEffect(() => {
        if (id) handleGetAddonsList();
        if (id) fetchEventDetails(id);
    }, [id]);

    // create / update addon
    const handleCreateAddon = async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (!form.checkValidity()) {
            event.stopPropagation();
            setValidateDefault(true);
            return;
        }
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", addonForm.name);
            formData.append("price", addonForm.price);
            formData.append("count", addonForm.count);
            formData.append("visibility", addonForm.visibility);
            formData.append("description", addonForm.description);
            formData.append("event_id", id);

            if (addonForm.image instanceof File) {
                formData.append("addon_image", addonForm.image);
            }

            const res = addonId
                ? await api.put(`/api/v1/addons/update/${addonId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                : await api.post("/api/v1/addons/create", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

            if (res.data.success) {
                Swal.fire({
                    icon: "success",
                    title: `Addon ${addonId ? "updated" : "created"} successfully!`,
                    confirmButtonColor: "#00ad00",
                });
                setAddonForm({
                    name: "",
                    price: "",
                    count: "",
                    visibility: "Y",
                    description: "",
                    image: null,
                });
                setAddonId(null);
                setShow(false);
                handleGetAddonsList();
            } else {
                Swal.fire({
                    icon: "error",
                    title: res.data.message || "Something went wrong!",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error creating addon!",
                text: err.message,
            });
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
<<<<<<< HEAD
                            <section id="post-eventpg">
                                
=======
                            <section id="post-eventpg edit-event-page">

>>>>>>> main
                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Manage Tickets</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">
                                    You can manage all your tickets here.
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
                                                <Link href={`/event/edit-event/${id}/manage-addons`} className="active text-16">
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
                                        </ul>
                                    </div>

                                    <div className="col-md-5 text-end">
                                        <button
                                            className="primery-button fw-normal px-2 text-white"
                                            style={{ backgroundColor: "#00ad00" }}
                                            onClick={() => setShow(true)}
                                        >
                                            <i className="bi bi-plus"></i> Add Addon
                                        </button>

                                    </div>
                                </div>

                                <div className="contant_bg mt-4">
                                    <h6>Addons Types</h6>
                                    <hr className="custom-hr" />

                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 mb-0">Fetching addons...</p>
                                        </div>
                                    ) : addonsList.length == 0 ? (
                                        <p className="text-muted">No addons found for this event.</p>
                                    ) : addonsList.map((addon) => (
                                        <div
                                            key={addon.id}
                                            className="row item_bg m-0 p-2 px-3 mb-2 align-items-center"
                                        >
                                            {/* Left Section: Addon Info */}
                                            <div className="col-sm-8">
                                                <p className="body-text mb-1">
                                                    <strong>{addon.name}</strong>
                                                </p>
                                                <p className="mb-1 text-muted">{addon.description || "No description"}</p>
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <p className="body-text mb-0 d-flex align-items-center">
                                                            <Package size={16} className="me-2 text-primary" />
                                                            ₹{addon.price} / {addon.count} available
                                                        </p>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <p className="body-text mb-0 d-flex align-items-center">
                                                            {addon.hidden === "Y" ? (
                                                                <>
                                                                    <EyeOff size={16} className="me-2 text-danger" /> Hidden
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye size={16} className="me-2 text-success" /> Visible
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Section: Dropdown Actions */}
                                            <div className="col-sm-4 text-end">
                                                <div className="dropdown d-inline position-relative">
                                                    <button
                                                        className="btn btn-primary btn-sm rounded-pill"
                                                        type="button"
                                                        onClick={() =>
                                                            setOpenDropdown(openDropdown === addon.id ? null : addon.id)
                                                        }
                                                    >
                                                        <Settings size={16} />
                                                    </button>

                                                    {openDropdown === addon.id && (
                                                        <ul
                                                            className="dropdown-menu show position-absolute"
                                                            style={{
                                                                display: "block",
                                                                zIndex: 999,
                                                                left: "-120px", top: "24px"
                                                            }}
                                                        >
                                                            {/* Edit */}
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                        setAddonId(addon.id);
                                                                        setAddonForm({
                                                                            name: addon.name,
                                                                            price: addon.price,
                                                                            count: addon.count,
                                                                            hidden: addon.hidden,
                                                                            description: addon.description,
                                                                        });
                                                                        setShow(true);
                                                                        setOpenDropdown(null);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </li>

                                                            {/* Hide / Show */}
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                        const newHidden = addon.hidden === "Y" ? "N" : "Y";
                                                                        api
                                                                            .put(`/api/v1/addons/update/${addon.id}`, {
                                                                                hidden: newHidden,
                                                                            })
                                                                            .then(() => {
                                                                                Swal.fire({
                                                                                    icon: "success",
                                                                                    title:
                                                                                        newHidden === "Y"
                                                                                            ? "Addon Hidden"
                                                                                            : "Addon Visible",
                                                                                    timer: 1200,
                                                                                    showConfirmButton: false,
                                                                                });
                                                                                handleGetAddonsList();
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
                                                                    {addon.hidden === "Y" ? "Show Addon" : "Hide Addon"}
                                                                </button>
                                                            </li>

                                                            {/* Delete */}
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() => {
                                                                        Swal.fire({
                                                                            icon: "warning",
                                                                            title: "Are you sure?",
                                                                            text: "This addon will be deleted.",
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: "#e62d56",
                                                                            confirmButtonText: "Delete",
                                                                        }).then((result) => {
                                                                            if (result.isConfirmed) {
                                                                                api
                                                                                    .delete(`/api/v1/addons/delete/${addon.id}`)
                                                                                    .then(() => {
                                                                                        Swal.fire({
                                                                                            icon: "success",
                                                                                            title: "Addon Deleted",
                                                                                            timer: 1000,
                                                                                            showConfirmButton: false,
                                                                                        });
                                                                                        handleGetAddonsList();
                                                                                    })
                                                                                    .catch(() =>
                                                                                        Swal.fire(
                                                                                            "Error",
                                                                                            "Failed to delete addon.",
                                                                                            "error"
                                                                                        )
                                                                                    );
                                                                            }
                                                                        });
                                                                        setOpenDropdown(null);
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* <div className="next_prew_btn d-flex justify-content-between mt-4">
                                        <a
                                            className="prew primery-button fw-normal"
                                            href="https://eboxtickets.com/event/settings/287"
                                        >
                                            Previous
                                        </a>
                                        <a
                                            className="next primery-button fw-normal"
                                            href="https://eboxtickets.com/event/committee/287"
                                        >
                                            Next
                                        </a>
                                    </div> */}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />

            {/* Add Addon Modal */}
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{addonId ? "Edit Addon" : "Add Addon"}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form
                        noValidate
                        onSubmit={handleCreateAddon}
                        className={validateDefault ? "was-validated" : ""}
                    >
                        {/* Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={addonForm.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter addon name"
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter name.
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Price + Count + Visibility (Same Row) */}
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <Form.Label>Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={addonForm.price}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter price"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter price.
                                </Form.Control.Feedback>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Label>Count</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="count"
                                    value={addonForm.count}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter count"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter count.
                                </Form.Control.Feedback>
                            </div>

                            <div className="col-md-4 mb-3">
                                <Form.Label>Visibility</Form.Label>
                                <Form.Select
                                    name="hidden"
                                    value={addonForm.hidden}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Y">Visible</option>
                                    <option value="N">Hidden</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please select visibility.
                                </Form.Control.Feedback>
                            </div>
                        </div>

                        {/* Description */}
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                rows={3}
                                value={addonForm.description}
                                onChange={handleInputChange}
                                placeholder="Enter description"
                            />
                        </Form.Group>

                        {/* Image Upload */}
                        <Form.Group className="mb-3">
                            <Form.Label>Addon Image (Optional)</Form.Label>
                            <Form.Control
                                type="file"
                                name="addonImage"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </Form.Group>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShow(false)}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Saving...
                                    </>
                                ) : addonId ? (
                                    "Update Addon"
                                ) : (
                                    "Add Addon"
                                )}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

        </>
    );
};

export default ManageAddons;
