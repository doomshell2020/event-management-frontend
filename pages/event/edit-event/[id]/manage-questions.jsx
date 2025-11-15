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

const ManageQuestions = () => {
    const router = useRouter();
    const { id } = router.query;

    const [show, setShow] = useState(false);
    const [questionId, setQuestionId] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpenWiggins, setIsOpenWiggins] = useState(false);
    const [eventDetails, setEventDetails] = useState(null);
    const [ticketsList, setTicketList] = useState([]);
    const [questionsList, setQuestionsList] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [validateDefault, setValidateDefault] = useState(false);
    const [questionForm, setQuestionForm] = useState({
        event_id: id,
        type: "",
        name: "",
        question: "",
        items: [""],
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuestionForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle dynamic "Items"
    const handleItemChange = (index, value) => {
        const newItems = [...questionForm.items];
        newItems[index] = value;
        setQuestionForm((prev) => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setQuestionForm((prev) => ({ ...prev, items: [...prev.items, ""] }));
    };

    const removeItem = (index) => {
        const newItems = [...questionForm.items];
        newItems.splice(index, 1);
        setQuestionForm((prev) => ({ ...prev, items: newItems }));
    };

    // fetch addons list
    const handleGetQuestionsList = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/questions/list?event_id=${id}`);
            if (res.data.success) {
                setQuestionsList(res.data.data || []);
            } else {
                setQuestionsList([]);
            }
        } catch (err) {
            console.error("Error fetching questions:", err);
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

    const handleGetTicketsList = async (eventId) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/tickets/list/${eventId}`);
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

    useEffect(() => {
        if (id) handleGetQuestionsList();
        if (id) fetchEventDetails(id);
        if (id) handleGetTicketsList(id);
    }, [id]);

    const handleCreateOrUpdateQuestion = async (e) => {
        e.preventDefault();
        setValidateDefault(true);
        setErrorMessage("");

        if (!questionForm.type || !questionForm.name || !questionForm.question) {
            return;
        }

        try {
            setIsSubmitting(true);

            const isEdit = !!questionId;
            const apiUrl = isEdit
                ? `/api/v1/questions/update/${questionId}`
                : `/api/v1/questions/create`;
            const method = isEdit ? api.put : api.post;

            // ✅ Base payload
            let payload = {
                name: questionForm.name,
                question: questionForm.question,
            };

            // ✅ Only include items if type = Select
            if (questionForm.type === "Select") {
                payload.items = questionForm.items;
            }

            // ✅ For create, include event_id and type
            if (!isEdit) {
                payload = {
                    ...payload,
                    event_id: id,
                    type: questionForm.type,
                };
            }

            // ✅ API Call
            const res = await method(apiUrl, payload);

            if (res.data.success) {
                Swal.fire(
                    "Success",
                    isEdit
                        ? "Question updated successfully!"
                        : "Question saved successfully!",
                    "success"
                );
                setShow(false);

                // Reset form
                setQuestionForm({
                    event_id: id,
                    type: "",
                    name: "",
                    question: "",
                    items: [""],
                });
                setQuestionId(null);
                handleGetQuestionsList();
            } else {
                const error = res.data?.error;
                let msg =
                    error?.details?.[0]?.msg ||
                    error?.message ||
                    res.data.message ||
                    "Failed to save question";
                setErrorMessage(msg);
            }
        } catch (err) {
            console.error("API Error:", err.response?.data || err);
            const apiError = err.response?.data?.error;

            const message =
                apiError?.details?.[0]?.msg ||
                apiError?.message ||
                err.response?.data?.message ||
                err.message ||
                "Something went wrong!";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };


    useEffect(() => {
        if (questionsList?.length) {
            const formatted = questionsList
                .filter((q) => q.ticket_type_id)
                .map((q) => ({
                    questionId: q.id,
                    ticket_ids: q.ticket_type_id,
                }));
            setSelectedTicketsArr(formatted);
        }
    }, [questionsList]);


    const [selectedTicketsArr, setSelectedTicketsArr] = useState([]);

    const handleTicketChange = (questionId, ticketId) => {
        setSelectedTicketsArr((prev) => {
            const existing = prev.find((item) => item.questionId == questionId);

            if (existing) {
                // convert string → array of numbers
                const ids = existing.ticket_ids
                    ? existing.ticket_ids.split(",").map(Number).filter((n) => !isNaN(n))
                    : [];

                // toggle logic (add/remove ticket)
                const updatedIds = ids.includes(ticketId)
                    ? ids.filter((id) => id !== ticketId) // uncheck → remove
                    : [...ids, ticketId]; // check → add

                // ✅ if none are checked, remove this question from the array
                if (updatedIds.length == 0) {
                    return prev.filter((item) => item.questionId !== questionId);
                }

                // ✅ otherwise update ticket_ids normally
                return prev.map((item) =>
                    item.questionId == questionId
                        ? { questionId, ticket_ids: updatedIds.join(",") }
                        : item
                );
            } else {
                // new question → add first checked ticket
                return [...prev, { questionId, ticket_ids: ticketId.toString() }];
            }
        });
    };

    // ✅ Link Tickets API Call
    const handleLinkTickets = async (questionId) => {
        // find current question entry from selectedTicketsArr
        const selectedObj = selectedTicketsArr.find(
            (item) => item.questionId == questionId
        );

        const ticketIds = selectedObj?.ticket_ids || "";

        // console.log('>>>>>>>>>>>>>>>>',ticketIds);
        // return false

        if (!ticketIds || ticketIds.length == 0) {
            Swal.fire("Warning", "Please select at least one ticket.", "warning");
            return;
        }

        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to link the selected tickets?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, link them!",
            cancelButtonText: "Cancel",
        });

        if (confirm.isConfirmed) {
            try {
                setLoading(true);

                // ✅ Use selectedTicketsArr data here
                const res = await api.put(
                    `/api/v1/questions/link-tickets/${questionId}`,
                    {
                        ticket_ids: ticketIds,
                    }
                );

                Swal.fire("Success", "Tickets linked successfully!", "success");
                handleGetQuestionsList();
                setSelectedTicketsArr([]);
            } catch (error) {
                Swal.fire("Error", "Failed to link tickets.", "error");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };


    const handleEditClick = (question) => {
        setQuestionId(question.id);
        setQuestionForm({
            event_id: id,
            type: question.type || "",
            name: question.name || "",
            question: question.question || "",
            items: question.questionItems?.length
                ? question.questionItems.map((item) => item.items)
                : [""],
        });
        setShow(true);
    };


    const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

    return (
        <>
            <FrontendHeader backgroundImage={backgroundImage} />

            <section id="myevent-deshbord">
                <div className="d-flex">
                    {/* Sidebar */}
                    <EventSidebar />

                    <div className="event-righcontent">
                        <div className="dsa_contant">
                            <section id="post-eventpg edit-event-page">

                                <EventHeaderSection eventDetails={eventDetails} />

                                <h4 className="text-24">Manage Questions</h4>
                                <hr className="custom-hr" />
                                <p className="text-14 text-dark">
                                    You can manage all your questions here.
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
                                                <Link href={`/event/edit-event/${id}/manage-questions`} className="active text-16">
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
                                            <i className="bi bi-plus"></i> Add Question
                                        </button>

                                    </div>
                                </div>

                                <div className="contant_bg mt-4">
                                    <h6>Link Questions With Tickets Type</h6>
                                    <hr className="custom-hr" />

                                    {
                                        loading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2 mb-0">Fetching questions...</p>
                                            </div>
                                        ) : questionsList.length == 0 ? (
                                            <p className="text-muted">No questions found for this event.</p>
                                        ) : (
                                            questionsList.map((question) => (
                                                <div
                                                    key={question.id}
                                                    className="row bg-light m-0 p-3 mb-3 rounded align-items-center"
                                                >
                                                    {/* Left Section - Question Details */}
                                                    <div className="col-md-4">
                                                        <p className="fw-bold mb-1">{question.name}</p>
                                                        <p className="mb-1">
                                                            <strong>Question:</strong> {question.question}
                                                        </p>
                                                        <p className="mb-2 text-muted">
                                                            <strong>Type:</strong> {question.type}
                                                        </p>
                                                    </div>

                                                    {/* Center Section - Ticket Checkboxes */}
                                                    <div className="col-md-5 d-flex flex-wrap gap-3">
                                                        {ticketsList.map((ticket) => (
                                                            <div key={ticket.id} className="form-check me-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`ticket-${question.id}-${ticket.id}`}
                                                                    checked={
                                                                        selectedTicketsArr
                                                                            .find((item) => item.questionId == question.id)
                                                                            ?.ticket_ids
                                                                            .split(",")
                                                                            .includes(ticket.id.toString()) || false
                                                                    }
                                                                    onChange={() => handleTicketChange(question.id, ticket.id)}
                                                                />


                                                                <label
                                                                    className="form-check-label"
                                                                    htmlFor={`ticket-${question.id}-${ticket.id}`}
                                                                >
                                                                    {ticket.title}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Right Section - Action Buttons */}
                                                    <div className="col-md-3 text-end">
                                                        <button
                                                            className="btn btn-success me-2"
                                                            onClick={() => handleLinkTickets(question.id)}
                                                        >
                                                            Link Ticket
                                                        </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => handleEditClick(question)}
                                                        >
                                                            Edit
                                                        </button>

                                                    </div>
                                                </div>
                                            ))
                                        )
                                    }


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

            {/* Add / Edit Question Modal */}
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{questionId ? "Edit Question" : "Add Question"}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form
                        noValidate
                        onSubmit={handleCreateOrUpdateQuestion}
                        className={validateDefault ? "was-validated" : ""}
                    >
                        {/* Question Type */}
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={questionForm.type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Select">Select</option>
                                <option value="Agree">Agree</option>
                                <option value="Text">Text</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please select a question type.
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Question Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>Question Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={questionForm.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter question name"
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter question name.
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Question Text */}
                        <Form.Group className="mb-3">
                            <Form.Label>Question</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="question"
                                rows={3}
                                value={questionForm.question}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter question text"
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter question text.
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Items (only for "select" type) */}
                        {questionForm.type == "Select" && (
                            <Form.Group className="mb-3">
                                <Form.Label>Items</Form.Label>
                                {questionForm.items.map((item, index) => (
                                    <div key={index} className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleItemChange(index, e.target.value)}
                                            placeholder={`Item ${index + 1}`}
                                            required
                                        />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => removeItem(index)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={addItem}
                                >
                                    + Add Item
                                </Button>
                            </Form.Group>
                        )}

                        {/* ✅ Error Message (if API fails) */}
                        {errorMessage && (
                            <div className="alert alert-danger py-2">
                                <i className="bi bi-exclamation-circle me-2"></i>
                                {errorMessage}
                            </div>
                        )}

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
                                ) : questionId ? (
                                    "Update Question"
                                ) : (
                                    "Add Question"
                                )}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>



        </>
    );
};

export default ManageQuestions;
