import { Button, Modal, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import api from "@/utils/api";
import { formatEventDateTime } from "@/utils/formatDate";


const MyStaff = () => {
    const [staff, setStaff] = useState([]);
    // console.log('staff :', staff);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [show, setShow] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [staffId, setStaffId] = useState(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        password: "",
        status: 'Y',
        eventId: [],
    });

    // console.log('formData :', formData);
    const [errors, setErrors] = useState({});
    const backgroundImage = "/assets/front-images/about-slider_bg.jpg";

    /* ================= FETCH STAFF ================= */
    const fetchStaff = async () => {
        try {
            const res = await api.get("/api/v1/users/staff");
            setStaff(res.data.data.staff_list || []);
            setEvents(res.data.data.event_list || []);
        } catch (err) {
            Swal.fire("Error", "Failed to load staff", "error");
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    /* ================= VALIDATION ================= */
    const validateForm = () => {
        const err = {};

        // First & Last Name
        if (!formData.first_name.trim()) err.first_name = "First name required";
        if (!formData.last_name.trim()) err.last_name = "Last name required";

        // Email & Mobile (only for add)
        if (!isEdit) {
            if (!formData.email) err.email = "Email required";
            else if (!/^\S+@\S+\.\S+$/.test(formData.email)) err.email = "Invalid email";

            if (!formData.mobile) err.mobile = "Mobile required";
            else if (!/^[6-9]\d{9}$/.test(formData.mobile)) err.mobile = "Invalid mobile number";

            if (!formData.password || formData.password.length < 6)
                err.password = "Password must be at least 6 characters";
        }

        // Edit mode: password optional, validate only if user typed
        if (isEdit && formData.password && formData.password.length < 6) {
            err.password = "Password must be at least 6 characters";
        }

        // Event selection
        if (!formData.eventId || formData.eventId.length == 0) {
            err.eventId = "Select at least one event";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    /* ================= HANDLE SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);

            const payload = { ...formData };

            // Remove password from payload if empty in edit mode
            if (isEdit && !payload.password) delete payload.password;

            if (isEdit) {
                await api.put(`/api/v1/users/staff/${staffId}`, payload);
                Swal.fire("Updated", "Staff updated successfully", "success");
            } else {
                await api.post("/api/v1/users/add-staff", payload);
                Swal.fire("Added", "Staff added successfully", "success");
            }

            setShow(false);
            fetchStaff();
        } catch (err) {
        // console.log('err :', err.response?.data?.error?.message);
            Swal.fire(
                "Error",
                err.response?.data?.error?.message || "Operation failed",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ================= OPEN MODAL ================= */
    const openAddModal = () => {
        setIsEdit(false);
        setStaffId(null);
        setFormData({
            first_name: "",
            last_name: "",
            email: "",
            mobile: "",
            password: "",
            status: 'Y',
            eventId: [],
        });
        setErrors({});
        setShow(true);
    };

    const openEditModal = (row) => {
        console.log('row :', row);
        setIsEdit(true);
        setStaffId(row.id);

        // Convert comma-separated string into array of strings for multi-select
        const selectedEvents = row.eventId ? row.eventId.split(',') : [];
        console.log('selectedEvents :', selectedEvents);

        setFormData({
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            mobile: row.mobile,
            password: "", // optional
            status: row.status ?? '',
            eventId: selectedEvents, // note: same key as in backend
        });

        setErrors({});
        setShow(true);
    };


    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section className="my-staff-module py-4">

                <div className="section-heading">
                    <h1 className="mb-3">My Staff</h1>
                    <h2 className="mt-4">My Staff</h2>
                    <p className="mb-4 body-text text-center">
                        You can manage your Staff!
                    </p>
                </div>
                <div className="container">
                    <div className="d-flex justify-content-end mb-2">

                        <Button size="sm" onClick={openAddModal}>Add Staff</Button>
                    </div>

                    <div className="table-responsive my-staff-table">
                        <table className="table">
                            <thead className="table-dark">
                                <tr>
                                    <th>S.No</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.length ? (
                                    staff.map((row, i) => (
                                        <tr key={row.id}>
                                            <td>{i + 1}</td>
                                            <td>{row.first_name} {row.last_name}</td>
                                            <td>{row.email}</td>
                                            <td>{row.mobile}</td>
                                            <td>{row.status == 'Y' ? "Active" : "Inactive"}</td>
                                            <td>{formatEventDateTime(row.createdAt)}</td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-warning"
                                                    onClick={() => openEditModal(row)}
                                                >
                                                    <i className="bi bi-pencil-square text-primary"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ================= MODAL ================= */}
            <Modal show={show} onHide={() => setShow(false)} backdrop="static" size="lg">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEdit ? "Edit Staff" : "Add Staff"}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group className="mb-2">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                isInvalid={!!errors.first_name}
                            />
                            <Form.Control.Feedback type="invalid">{errors.first_name}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                isInvalid={!!errors.last_name}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                value={formData.email}
                                disabled={isEdit}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                isInvalid={!!errors.email}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Mobile</Form.Label>
                            <Form.Control
                                value={formData.mobile}
                                disabled={isEdit}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                isInvalid={!!errors.mobile}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Password {isEdit && "(optional)"}</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                isInvalid={!!errors.password}
                                placeholder={isEdit ? "Leave blank to keep current password" : ""}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value={'Y'}>Active</option>
                                <option value={'N'}>Inactive</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Events</Form.Label>
                            <Form.Select
                                multiple
                                className="w-100"
                                style={{ minHeight: "180px" }}
                                value={formData.eventId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        eventId: [...e.target.selectedOptions].map(o => o.value)
                                    })
                                }
                                isInvalid={!!errors.eventId}
                            >
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id.toString()}>{ev.name}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.eventId}</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <FrontendFooter />
        </>
    );
};

export default MyStaff;
